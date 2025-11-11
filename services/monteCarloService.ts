// Fix: Corrected import path
import { Results, AnalysisMode, Inputs, CountUnit } from '../types';
import { calculateMeanTime, probability_from_quantile } from './isoCalculations';

// Helper to generate a random number from a Poisson distribution
// Using the Knuth algorithm, suitable for lambda < 30
function poissonRandom(lambda: number): number {
    if (lambda <= 0) return 0;
    let l = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
        k++;
        p *= Math.random();
    } while (p > l);
    return k - 1;
}

// Helper to generate a random number from a standard Normal distribution (Box-Muller transform)
function normalRandom(): number {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

interface MCInputs {
    mode: AnalysisMode;
    inputs: Inputs;
    t_g: number;
    t_0: number;
    w: number;
    u_rel_w: number;
    k1alpha: number;
    k1beta: number;
    correlationCoefficient: number;
    numSimulations: number;
}

const getTotalCount = (count: number, unit: CountUnit, time: number): number => {
    if (time <= 0) return count;
    switch(unit) {
        case CountUnit.COUNTS: return count;
        case CountUnit.CPS: return count * time;
        case CountUnit.CPM: return (count / 60) * time;
        case CountUnit.C_02S: return (count / 0.2) * time;
        default: return count; // Default to just count if unit is unknown
    }
};

export function runMonteCarloSimulation(params: MCInputs, t: any): Results | string {
    const { mode, inputs, t_g, t_0, w, u_rel_w, k1alpha, k1beta, correlationCoefficient, numSimulations } = params;
    const { 
        roiGrossCount = 0, roiChannels = 1, backgroundTotalCount = 0, backgroundChannels = 1, 
        grossCount = 0, backgroundCount = 0, grossCountUnit, backgroundCountUnit 
    } = inputs;
    
    // --- Determine expected counts (lambda values for Poisson) ---
    let lambda_g: number, lambda_0: number;
    if (mode === 'spectrometry') {
        const channel_ratio =  roiChannels > 0 && backgroundChannels > 0 ? roiChannels / backgroundChannels : 1;
        lambda_g = roiGrossCount; // ROI gross is always total counts
        lambda_0 = backgroundTotalCount * channel_ratio; // Scaled total counts
    } else {
        lambda_g = getTotalCount(grossCount, grossCountUnit, t_g);
        lambda_0 = getTotalCount(backgroundCount, backgroundCountUnit, t_0);
    }
    
    if (lambda_g < 0 || lambda_0 < 0) {
        return t('negativeRateError');
    }

    const u_w = w * u_rel_w;

    const y_values: number[] = [];
    const y0_values: number[] = []; // for y*
    
    for (let i = 0; i < numSimulations; i++) {
        // --- Simulate input quantities ---
        // 1. Simulate counts from Poisson distribution
        const n_g_sim = poissonRandom(lambda_g);
        const n_0_sim = poissonRandom(lambda_0);

        // 2. Simulate calibration factor from Normal distribution
        const w_sim = w + normalRandom() * u_w;

        // --- Calculate result for this iteration ---
        let r_g_sim: number, r_0_sim: number;
        if (mode === 'spectrometry') {
            r_g_sim = n_g_sim / t_g;
            r_0_sim = (n_0_sim / backgroundTotalCount) * (backgroundTotalCount / t_0) * (roiChannels / backgroundChannels);
        } else {
            r_g_sim = n_g_sim / t_g;
            r_0_sim = n_0_sim / t_0;
        }

        const y_sim = w_sim * (r_g_sim - r_0_sim);
        y_values.push(y_sim);
        
        // --- Also simulate for the H0 hypothesis (y=0) to find y* ---
        const n_g0_sim = poissonRandom(lambda_0 * (t_g / t_0));
        const y0_sim = w_sim * ( (n_g0_sim / t_g) - (n_0_sim / t_0) );
        y0_values.push(y0_sim);
    }
    
    // --- Analyze the simulated distributions ---
    y_values.sort((a, b) => a - b);
    y0_values.sort((a, b) => a - b);
    
    const alpha = 1 - probability_from_quantile(k1alpha);
    
    // Decision Threshold (y*) is the (1-alpha) percentile of the H0 distribution
    const alpha_quantile_index = Math.floor(numSimulations * (1 - alpha));
    const y_star = y0_values[alpha_quantile_index];
    
    const primaryResult = y_values.reduce((a, b) => a + b, 0) / numSimulations;
    const primaryUncertainty = Math.sqrt(y_values.reduce((sum, val) => sum + (val - primaryResult)**2, 0) / (numSimulations - 1));
    
    // --- Detailed statistics ---
    const median = y_values[Math.floor(numSimulations / 2)];
    const min = y_values[0];
    const max = y_values[numSimulations - 1];
    
    const m3 = y_values.reduce((sum, val) => sum + Math.pow(val - primaryResult, 3), 0) / numSimulations;
    const skewness = m3 / Math.pow(primaryUncertainty, 3);

    const m4 = y_values.reduce((sum, val) => sum + Math.pow(val - primaryResult, 4), 0) / numSimulations;
    const kurtosis = m4 / Math.pow(primaryUncertainty, 4);

    const ciLowerPercentile = y_values[Math.floor(numSimulations * 0.025)];
    const ciUpperPercentile = y_values[Math.floor(numSimulations * 0.975)];

    // Detection Limit (y#)
    const analyticalResult = calculateAll(
        { mode, inputs, t_g, t_0, w, u_rel_w, k1alpha, k1beta, correlationCoefficient }, t
    );
    let detectionLimit: number|string = 'N/A (MC)';
    if(typeof analyticalResult !== 'string'){
        detectionLimit = analyticalResult.detectionLimit as (number|string);
    }

    const isEffectPresent = primaryResult > y_star;
    const bestEstimate = isEffectPresent ? primaryResult : null;
    const bestEstimateUncertainty = isEffectPresent ? primaryUncertainty : null;
    // Use robust percentile-based confidence interval for MC
    const confidenceIntervalLower = isEffectPresent ? Math.max(0, ciLowerPercentile) : null;
    const confidenceIntervalUpper = isEffectPresent ? ciUpperPercentile : null;

    const meanTime = calculateMeanTime(alpha, t_g, t_0);

    return {
        calculationMethod: 'monteCarlo',
        currentMode: mode,
        primaryResult: primaryResult,
        primaryUncertainty: primaryUncertainty,
        decisionThreshold: y_star,
        detectionLimit: detectionLimit,
        isEffectPresent,
        bestEstimate: bestEstimate,
        bestEstimateUncertainty: bestEstimateUncertainty,
        confidenceIntervalLower,
        confidenceIntervalUpper,
        k1alpha: inputs.k1alpha,
        k1beta: inputs.k1beta,
        alphaProbability: alpha,
        betaProbability: 1 - probability_from_quantile(k1beta),
        meanTimeBetweenFalseAlarms: meanTime,
        uncertaintyAtZero: 0,
        uncertaintyAtDetectionLimit: 0,
        varianceComponents: null,
        histogramData: y_values,
        numSimulations: numSimulations,
        monteCarloStats: {
            mean: primaryResult,
            stdDev: primaryUncertainty,
            median,
            min,
            max,
            skewness,
            kurtosis,
            confidenceIntervalPercentileLower: ciLowerPercentile,
            confidenceIntervalPercentileUpper: ciUpperPercentile,
        }
    };
}

// Stub function from analytical calculations, needed for MC service
function calculateAll(params: any, t: any): Partial<Results> | string {
    // This is a simplified version just to get y# for MC mode
    const { w, u_rel_w, k1alpha, k1beta, correlationCoefficient, t_g, t_0, inputs, mode } = params;
    const { roiChannels=1, backgroundChannels=1, backgroundTotalCount=0, backgroundCount=0, backgroundCountUnit } = inputs;
    
    const getRate = (count: number, unit: CountUnit, time: number) => {
        if (time <= 0) return 0;
        switch(unit) {
            case CountUnit.COUNTS: return count / time;
            case CountUnit.CPS: return count;
            case CountUnit.CPM: return count / 60;
            case CountUnit.C_02S: return count / 0.2;
            default: return count / time;
        }
    }

    const r_0 = mode === 'spectrometry' 
        ? (backgroundTotalCount/t_0) * (roiChannels/backgroundChannels) 
        : getRate(backgroundCount, backgroundCountUnit, t_0);

    if (r_0 < 0) return t('negativeRateError');
        
    const u2_0 = w**2 * (r_0 / t_g + r_0 / t_0);
    const u_0 = Math.sqrt(u2_0);
    const y_star = k1alpha * u_0;
    
    const k_sq_u_rel_sq = (k1beta * u_rel_w)**2;
    if (k_sq_u_rel_sq >= 1) return t('kBetaError');
    
    const term_A_quad = u_rel_w**2;
    const term_B_quad = (w / t_g) - 2 * correlationCoefficient * Math.sqrt(r_0 / t_0) * (w*u_rel_w);
    const term_C_quad = u2_0;

    const k1beta_sq = k1beta**2;
    const a = 1 - k1beta_sq * term_A_quad;
    const b = -2 * y_star - k1beta_sq * term_B_quad;
    const c = y_star**2 - k1beta_sq * term_C_quad;
    
    const discriminant = b**2 - 4 * a * c;
    if (discriminant < 0 || a <= 0) return {detectionLimit: t('targetNotReachable')};
    
    return {detectionLimit: (-b + Math.sqrt(discriminant)) / (2 * a)};
}