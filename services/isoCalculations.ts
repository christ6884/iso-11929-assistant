import { Results, AnalysisMode, Inputs, MeanTime, CountUnit } from '../types.ts';

// Helper functions for normal distribution
const erf = (x: number) => {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

export const probability_from_quantile = (k: number) => 0.5 * (1.0 + erf(k / Math.sqrt(2.0)));

export const calculateMeanTime = (alpha: number, t_g: number, t_0: number): MeanTime => {
    if (alpha <= 0 || !isFinite(alpha)) return { years: Infinity, months: 0, days: 0, hours: 0 };
    const timeBetweenAlarmsSeconds = (t_g + t_0) / alpha;
    
    const daysInYear = 365.25;
    const daysInMonth = daysInYear / 12;

    const years = Math.floor(timeBetweenAlarmsSeconds / (daysInYear * 24 * 3600));
    let remainderSeconds = timeBetweenAlarmsSeconds % (daysInYear * 24 * 3600);
    
    const months = Math.floor(remainderSeconds / (daysInMonth * 24 * 3600));
    remainderSeconds %= (daysInMonth * 24 * 3600);

    const days = Math.floor(remainderSeconds / (24 * 3600));
    remainderSeconds %= (24 * 3600);

    const hours = Math.floor(remainderSeconds / 3600);

    return { years, months, days, hours };
};

interface CalcInputs {
    mode: AnalysisMode;
    inputs: Inputs;
    t_g: number;
    t_0: number;
    w: number;
    u_rel_w: number;
    k1alpha: number;
    k1beta: number;
    correlationCoefficient: number;
}


export function calculateAll(params: CalcInputs, t: any): Results | string {
  const { mode, inputs, t_g, t_0, w, u_rel_w, k1alpha, k1beta, correlationCoefficient } = params;
  const { roiGrossCount = 0, roiChannels = 1, backgroundTotalCount = 0, backgroundChannels = 1, grossCount = 0, backgroundCount = 0, grossCountUnit, backgroundCountUnit } = inputs;

  if (t_g <= 0 || (mode !== 'chambre' && mode !== 'linge' && mode !== 'surface' && t_0 <= 0) || w <= 0 || !isFinite(w)) {
    return t('positiveValuesError');
  }
  
  let r_g: number, r_0: number, y: number;
  let u2_var_rg: number, u2_var_r0: number;

  const getRate = (count: number, unit: CountUnit, time: number) => {
      if (time <= 0) return 0;
      switch(unit) {
          case CountUnit.COUNTS: return count / time;
          case CountUnit.CPS: return count;
          case CountUnit.CPM: return count / 60;
          case CountUnit.C_02S: return count / 0.2;
          default: return count / time; // Default to counts if unit is undefined or another value
      }
  }

  if (mode === 'spectrometry') {
      const channel_ratio = roiChannels > 0 && backgroundChannels > 0 ? roiChannels / backgroundChannels : 1;
      r_g = roiGrossCount / t_g;
      const r_0_total = backgroundTotalCount / t_0;
      r_0 = r_0_total * channel_ratio; // Scaled background rate for the ROI
      
      if (r_g < 0 || r_0_total < 0) return t('negativeRateError');

      y = w * (r_g - r_0);
      
      u2_var_rg = w**2 * (r_g / t_g);
      u2_var_r0 = w**2 * (r_0_total / t_0) * (channel_ratio**2);
  } else { // Standard, Surface, Chambre or Linge mode
      if (mode === 'chambre' || mode === 'linge') {
          r_g = getRate(grossCount, grossCountUnit, t_g);
          r_0 = backgroundCount; // This is the pre-calculated aggregate rate in c/s
      } else if (mode === 'surface') {
          r_g = getRate(grossCount, grossCountUnit, t_g);
          r_0 = inputs.estimatedBackgroundRate; // Use the specific background rate for surface mode
      } else { // 'standard' mode
          r_g = getRate(grossCount, grossCountUnit, t_g);
          r_0 = getRate(backgroundCount, backgroundCountUnit, t_0);
      }
      
      if (r_g < 0 || r_0 < 0) return t('negativeRateError');
      
      y = w * (r_g - r_0);
      
      u2_var_rg = w**2 * (r_g / t_g);
      u2_var_r0 = w**2 * (r_0 / t_0);
  }

  const sensitivityCoefficients = {
    grossRate: w,
    backgroundRate: -w,
    calibrationFactor: r_g - r_0,
  };

  // --- Variance Components for Uncertainty Budget ---
  const u2_var_w = (y * u_rel_w)**2;
  const term_cov = 2 * w * (r_g - r_0) * correlationCoefficient * Math.sqrt(r_0 / t_0) * (w * u_rel_w);
  const u2_y = u2_var_rg + u2_var_r0 + u2_var_w - term_cov; // Subtracting because of y=w(rg-r0) leads to -2*cov(...)
  const u_y = Math.sqrt(Math.max(0, u2_y));

  const varianceComponents = {
      grossCount: u2_var_rg,
      backgroundCount: u2_var_r0,
      calibrationFactor: u2_var_w,
      covariance: -term_cov,
      total: u2_y,
  };

  // Uncertainty at y=0 is not affected by calibration uncertainty or covariance
  let u2_0: number;
  if (mode === 'spectrometry') {
      const channel_ratio = roiChannels > 0 && backgroundChannels > 0 ? roiChannels / backgroundChannels : 1;
      const r_0_total = backgroundTotalCount / t_0;
      u2_0 = w**2 * ( (r_0_total * channel_ratio) / t_g + (r_0_total / t_0) * (channel_ratio**2) );
  } else {
      u2_0 = w**2 * (r_0 / t_g + r_0 / t_0);
  }
  const u_0 = Math.sqrt(u2_0);
  
  const y_star = k1alpha * u_0;

  const k_sq_u_rel_sq = (k1beta * u_rel_w)**2;
  if (k_sq_u_rel_sq >= 1) {
    return t('kBetaError');
  }
  
  // --- Detection Limit calculation using full quadratic solver ---
  let term_B_quad: number, term_C_quad: number;
  const u_w = w * u_rel_w;
  const term_A_quad = u_rel_w**2;

  if (mode === 'spectrometry') {
      const r_0_total = backgroundTotalCount / t_0;
      const channel_ratio = roiChannels > 0 && backgroundChannels > 0 ? roiChannels / backgroundChannels : 1;
      const r_0_scaled = r_0_total * channel_ratio;
      term_B_quad = (w / t_g) - 2 * correlationCoefficient * Math.sqrt(r_0_scaled / t_0) * u_w;
      term_C_quad = w**2 * ( (r_0_total * channel_ratio) / t_g + (r_0_total / t_0) * (channel_ratio**2) );
  } else {
      term_B_quad = (w / t_g) - 2 * correlationCoefficient * Math.sqrt(r_0 / t_0) * u_w;
      term_C_quad = u2_0;
  }

  const k1beta_sq = k1beta**2;
  const a = 1 - k1beta_sq * term_A_quad;
  const b = -2 * y_star - k1beta_sq * term_B_quad;
  const c = y_star**2 - k1beta_sq * term_C_quad;
  
  const discriminant = b**2 - 4 * a * c;

  let detectionLimit: number | string;
  if (discriminant < 0 || a <= 0) {
    detectionLimit = t('targetNotReachable');
  } else {
    detectionLimit = (-b + Math.sqrt(discriminant)) / (2 * a);
  }

  const isEffectPresent = y > y_star;

  const k_confidence = 1.96;
  const bestEstimate = isEffectPresent ? y : null;
  const bestEstimateUncertainty = isEffectPresent ? u_y : null;
  const confidenceIntervalLower = bestEstimate ? Math.max(0, bestEstimate - k_confidence * u_y) : null;
  const confidenceIntervalUpper = bestEstimate ? bestEstimate + k_confidence * u_y : null;

  const alpha = 1 - probability_from_quantile(k1alpha);
  const beta = 1 - probability_from_quantile(k1beta);
  
  const meanTime = calculateMeanTime(alpha, t_g, t_0);
  
  let u2_hash = 0;
  if (typeof detectionLimit === 'number') {
      let r_g_hash: number;
      let u2_hash_poisson: number;

      if (mode === 'spectrometry') {
          const channel_ratio = roiChannels > 0 && backgroundChannels > 0 ? roiChannels / backgroundChannels : 1;
          const r_0_total = backgroundTotalCount / t_0;
          const r_0_scaled = r_0_total * channel_ratio;
          r_g_hash = r_0_scaled + detectionLimit / w;
          u2_hash_poisson = w**2 * (r_g_hash/t_g + (r_0_total / t_0) * (channel_ratio**2) );
      } else {
          r_g_hash = r_0 + detectionLimit / w;
          u2_hash_poisson = w**2 * (r_g_hash/t_g + r_0/t_0);
      }
      
      const u2_hash_calib = (detectionLimit * u_rel_w)**2;
      const term_cov_hash = -2 * w * (detectionLimit/w) * correlationCoefficient * Math.sqrt(r_0 / t_0) * u_w;
      u2_hash = u2_hash_poisson + u2_hash_calib + term_cov_hash;
  }

  return {
    calculationMethod: 'analytical',
    currentMode: mode,
    primaryResult: y,
    primaryUncertainty: u_y,
    decisionThreshold: y_star,
    detectionLimit: detectionLimit,
    isEffectPresent,
    bestEstimate: bestEstimate,
    bestEstimateUncertainty: bestEstimateUncertainty,
    confidenceIntervalLower: confidenceIntervalLower,
    confidenceIntervalUpper: confidenceIntervalUpper,
    k1alpha: k1alpha,
    k1beta: k1beta,
    alphaProbability: alpha,
    betaProbability: beta,
    meanTimeBetweenFalseAlarms: meanTime,
    uncertaintyAtZero: u_0,
    uncertaintyAtDetectionLimit: Math.sqrt(Math.max(0, u2_hash)),
    varianceComponents,
    sensitivityCoefficients,
  };
}

export function findK1betaForTarget(
    baseInputs: Omit<CalcInputs, 'k1beta'>,
    targetDetectionLimit: number,
    t: any
): number | string {
    let low = 0.1;
    let high = 10;
    let mid;
    let result;

    if (targetDetectionLimit <= 0) return t('positiveValuesError');

    for (let i = 0; i < 30; i++) { // Binary search for k1beta
        mid = (low + high) / 2;
        const calcResult = calculateAll({ ...baseInputs, k1beta: mid }, t);
        if (typeof calcResult === 'string' || calcResult === null) {
            if (calcResult === t('kBetaError')) { // if k is too high, narrow search downwards
               high = mid;
               continue;
            }
            // For other errors, we can't proceed
            return t('targetNotReachable');
        }
        result = calcResult.detectionLimit;

        if (typeof result !== 'number') return t('targetNotReachable');
        
        if (Math.abs(result - targetDetectionLimit) < 0.001 * targetDetectionLimit) {
            return mid;
        }
        if (result < targetDetectionLimit) {
            low = mid;
        } else {
            high = mid;
        }
    }
    return t('targetNotReachable');
}