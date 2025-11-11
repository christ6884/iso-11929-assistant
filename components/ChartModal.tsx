import React, { useEffect } from 'react';
// Fix: Corrected import path
import { Results, AnalysisMode } from '../types';

interface ChartModalProps {
  isOpen: boolean;
  results: Results | null;
  t: any;
  calibrationFactorUnit: string;
  onClose: () => void;
  mode: AnalysisMode;
}

// Function to generate points for a Gaussian curve
const generateGaussianPoints = (mean: number, stdDev: number, range: {min: number, max: number}) => {
    if (stdDev <= 0) return [];
    const points = [];
    const steps = 100;
    const stepSize = (range.max - range.min) / steps;
    for (let i = 0; i <= steps; i++) {
        const x = range.min + i * stepSize;
        const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
        points.push({ x, y });
    }
    return points;
};

const AnalyticalChartContent: React.FC<Omit<ChartModalProps, 'isOpen' | 'onClose'> & { results: Results }> = ({ results, t, mode, calibrationFactorUnit }) => {
    if (typeof results.detectionLimit !== 'number' || typeof results.decisionThreshold !== 'number') return null;

    const { primaryResult, primaryUncertainty, decisionThreshold, detectionLimit, uncertaintyAtZero, uncertaintyAtDetectionLimit, confidenceIntervalLower, confidenceIntervalUpper, isEffectPresent } = results;
    const y_star = decisionThreshold;
    const y_hash = detectionLimit;
    const u_0 = uncertaintyAtZero;
    const u_hash = uncertaintyAtDetectionLimit;
    const y = primaryResult;
    const u_y = primaryUncertainty;

    const width = 800;
    const height = 450;
    const padding = { top: 30, right: 30, bottom: 50, left: 50 };

    const xMin = Math.min(0, y_star - 4 * u_0, y - 4 * u_y);
    const xMax = Math.max(y_hash + 4 * u_hash, y + 4 * u_y, y_star + 4 * u_0);
    
    const h0Points = generateGaussianPoints(0, u_0, {min: xMin, max: xMax});
    const h1Points = generateGaussianPoints(y_hash, u_hash, {min: xMin, max: xMax});
    const yPoints = (mode === 'standard' || mode === 'spectrometry') ? generateGaussianPoints(y, u_y, {min: xMin, max: xMax}) : [];
    
    const yValues = [...h0Points.map(p => p.y), ...h1Points.map(p => p.y), ...yPoints.map(p => p.y)];
    const yMax = yValues.length > 0 ? Math.max(...yValues) * 1.1 : 1;

    const toSvgX = (x: number) => padding.left + (x - xMin) / (xMax - xMin) * (width - padding.left - padding.right);
    const toSvgY = (y: number) => height - padding.bottom - (y / yMax) * (height - padding.top - padding.bottom);

    const createPath = (points: {x:number, y:number}[]) => {
        if (!points.length) return '';
        let path = `M ${toSvgX(points[0].x)} ${toSvgY(points[0].y)}`;
        points.forEach(p => path += ` L ${toSvgX(p.x)} ${toSvgY(p.y)}`);
        return path;
    };
    
    const createAreaPath = (points: {x:number, y:number}[], threshold: number, direction: 'right' | 'left') => {
        const filteredPoints = points.filter(p => direction === 'right' ? p.x >= threshold : p.x <= threshold);
        if (filteredPoints.length === 0) return '';
        const path = createPath(filteredPoints);
        return path + ` L ${toSvgX(filteredPoints[filteredPoints.length - 1].x)} ${height - padding.bottom} L ${toSvgX(filteredPoints[0].x)} ${height - padding.bottom} Z`;
    }

    const createFullAreaPath = (points: {x:number, y:number}[]) => {
        if (points.length < 2) return '';
        const path = createPath(points);
        return path + ` L ${toSvgX(points[points.length - 1].x)} ${height - padding.bottom} L ${toSvgX(points[0].x)} ${height - padding.bottom} Z`;
    }

    const createBoundedAreaPath = (points: {x:number, y:number}[], lowerBound: number, upperBound: number) => {
        const filteredPoints = points.filter(p => p.x >= lowerBound && p.x <= upperBound);
        if (filteredPoints.length < 2) return '';
        const path = createPath(filteredPoints);
        return path + ` L ${toSvgX(filteredPoints[filteredPoints.length - 1].x)} ${height - padding.bottom} L ${toSvgX(filteredPoints[0].x)} ${height - padding.bottom} Z`;
    }


    const baseUnit = calibrationFactorUnit.split('/')[0] || 'Unit';
    
    return <>
        <div className="bg-gray-900 p-4 rounded-lg">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Grid and Axes */}
                <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(75, 85, 99, 0.8)" />
                <text x={width/2} y={height - 15} textAnchor="middle" fill="#9ca3af" fontSize="14">{`${t('activity')} (${baseUnit})`}</text>
                
                {/* Risk and Measurement Areas */}
                <path d={createAreaPath(h0Points, y_star, 'right')} fill="rgba(234, 179, 8, 0.3)" />
                <path d={createAreaPath(h1Points, y_star, 'left')} fill="rgba(167, 139, 250, 0.4)" />
                {(mode === 'standard' || mode === 'spectrometry') && <path d={createFullAreaPath(yPoints)} fill="rgba(45, 212, 191, 0.2)" />}
                {(mode === 'standard' || mode === 'spectrometry') && isEffectPresent && confidenceIntervalLower !== null && confidenceIntervalUpper !== null && (
                    <path d={createBoundedAreaPath(yPoints, confidenceIntervalLower, confidenceIntervalUpper)} fill="rgba(45, 212, 191, 0.4)" />
                )}


                {/* Curves */}
                <path d={createPath(h0Points)} stroke="#60a5fa" fill="none" strokeWidth="2.5" />
                <path d={createPath(h1Points)} stroke="#c4b5fd" fill="none" strokeWidth="2.5" />
                {(mode === 'standard' || mode === 'spectrometry') && <path d={createPath(yPoints)} stroke="#2dd4bf" fill="none" strokeWidth="2.5" />}

                {/* Threshold Lines */}
                <line x1={toSvgX(y_star)} y1={padding.top} x2={toSvgX(y_star)} y2={height - padding.bottom} stroke="#f87171" strokeWidth="2" strokeDasharray="5 3" />
                <text x={toSvgX(y_star)} y={padding.top - 8} textAnchor="middle" fill="#f87171" fontSize="12" fontWeight="bold">y*</text>

                <line x1={toSvgX(y_hash)} y1={padding.top} x2={toSvgX(y_hash)} y2={height - padding.bottom} stroke="#facc15" strokeWidth="2" strokeDasharray="5 3" />
                <text x={toSvgX(y_hash)} y={padding.top - 8} textAnchor="middle" fill="#facc15" fontSize="12" fontWeight="bold">y#</text>
                
            </svg>
        </div>
        {/* Legend */}
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm mt-4">
            <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-blue-400 mr-2"></div>H₀ ({t('h0_legend')})</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-violet-400 mr-2"></div>H₁ ({t('h1_legend')})</div>
            {(mode === 'standard' || mode === 'spectrometry') && <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-cyan-400/50 mr-2"></div>{t('measurement_distribution_legend')}</div>}
            {(mode === 'standard' || mode === 'spectrometry') && isEffectPresent && <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-cyan-400/70 mr-2"></div>{t('confidenceIntervalLegend')}</div>}
            <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-yellow-500/50 mr-2"></div>α ({t('alpha_risk_legend')})</div>
            <div className="flex items-center"><div className="w-4 h-4 rounded-sm bg-violet-500/50 mr-2"></div>β ({t('beta_risk_legend')})</div>
        </div>
    </>
}

const MonteCarloChartContent: React.FC<Omit<ChartModalProps, 'results' | 'isOpen' | 'onClose'> & { results: Results }> = ({ results, t, calibrationFactorUnit }) => {
    const { histogramData = [], decisionThreshold, detectionLimit, primaryResult, numSimulations } = results;
    if (histogramData.length === 0 || typeof detectionLimit !== 'number' || typeof decisionThreshold !== 'number') return null;

    const width = 800;
    const height = 450;
    const padding = { top: 30, right: 30, bottom: 50, left: 50 };

    const xMin = Math.min(0, ...histogramData);
    const xMax = Math.max(...histogramData, decisionThreshold, detectionLimit, primaryResult);

    const numBins = Math.min(100, Math.floor(Math.sqrt(histogramData.length)));
    const binWidth = (xMax - xMin) / numBins;
    const bins = Array(numBins).fill(0).map(() => ({ count: 0, x0: 0, x1: 0 }));

    for (let i = 0; i < numBins; i++) {
        bins[i].x0 = xMin + i * binWidth;
        bins[i].x1 = xMin + (i + 1) * binWidth;
    }

    histogramData.forEach(d => {
        let binIndex = Math.floor((d - xMin) / binWidth);
        if (binIndex >= numBins) binIndex = numBins - 1;
        if (binIndex >= 0) bins[binIndex].count++;
    });
    
    const yMax = Math.max(...bins.map(b => b.count));

    const toSvgX = (x: number) => padding.left + (x - xMin) / (xMax - xMin) * (width - padding.left - padding.right);
    const toSvgY = (y: number) => height - padding.bottom - (y / yMax) * (height - padding.top - padding.bottom);
    
    const baseUnit = calibrationFactorUnit.split('/')[0] || 'Unit';

    return <>
        <div className="bg-gray-900 p-4 rounded-lg">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(75, 85, 99, 0.8)" />
                <text x={width/2} y={height - 15} textAnchor="middle" fill="#9ca3af" fontSize="14">{`${t('activity')} (${baseUnit})`}</text>
                
                {/* Histogram Bars */}
                {bins.map((bin, i) => (
                    <rect 
                        key={i}
                        x={toSvgX(bin.x0)}
                        y={toSvgY(bin.count)}
                        width={toSvgX(bin.x1) - toSvgX(bin.x0) - 1}
                        height={height - padding.bottom - toSvgY(bin.count)}
                        fill="rgba(96, 165, 250, 0.6)"
                        stroke="rgba(59, 130, 246, 0.8)"
                    />
                ))}

                {/* Threshold Lines */}
                <line x1={toSvgX(decisionThreshold)} y1={padding.top} x2={toSvgX(decisionThreshold)} y2={height - padding.bottom} stroke="#f87171" strokeWidth="2" strokeDasharray="5 3" />
                <text x={toSvgX(decisionThreshold)} y={padding.top - 8} textAnchor="middle" fill="#f87171" fontSize="12" fontWeight="bold">y*</text>

                <line x1={toSvgX(detectionLimit)} y1={padding.top} x2={toSvgX(detectionLimit)} y2={height - padding.bottom} stroke="#facc15" strokeWidth="2" strokeDasharray="5 3" />
                <text x={toSvgX(detectionLimit)} y={padding.top - 8} textAnchor="middle" fill="#facc15" fontSize="12" fontWeight="bold">y#</text>
                
                {/* Measurement Line */}
                <line x1={toSvgX(primaryResult)} y1={padding.top} x2={toSvgX(primaryResult)} y2={height - padding.bottom} stroke="#2dd4bf" strokeWidth="2.5" />
                <text x={toSvgX(primaryResult)} y={padding.top - 8} textAnchor="middle" fill="#2dd4bf" fontSize="12" fontWeight="bold">y</text>
            </svg>
        </div>
        <div className="flex justify-center flex-wrap gap-x-3 gap-y-2 text-sm mt-4">
             <div className="flex items-center"><div className="w-3 h-3 rounded-sm bg-blue-400/70 mr-1.5"></div>{t('mc_distribution_legend')}</div>
             <div className="flex items-center"><div className="w-px h-3 bg-cyan-400 mr-1.5"></div>{t('measurement_legend')}</div>
        </div>
        <p className="text-xs text-center text-gray-500 mt-3">{t('mcChartDescription').replace('{n}', numSimulations?.toLocaleString() || 'N/A')}</p>
    </>
}

const ChartModal: React.FC<ChartModalProps> = ({ isOpen, results, t, calibrationFactorUnit, onClose, mode }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
    
        return () => {
          window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!isOpen || !results || typeof results.detectionLimit !== 'number' || typeof results.decisionThreshold !== 'number') return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl p-4 md:p-8 w-11/12 max-w-4xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-cyan-400">{t('chartTitle')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {results.calculationMethod === 'monteCarlo' 
                    ? <MonteCarloChartContent results={results} t={t} mode={mode} calibrationFactorUnit={calibrationFactorUnit} />
                    : <AnalyticalChartContent results={results} t={t} mode={mode} calibrationFactorUnit={calibrationFactorUnit} />
                }
            </div>
        </div>
    );
};

export default ChartModal;