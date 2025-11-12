import React, { useState } from 'react';
import { Results, Inputs, AnalysisMode, CountUnit } from '../types';

// Duplicated from ChartPanel for standalone use, simplified for printing
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

// Fix: Added missing 'formatNumber' helper function to resolve multiple 'Cannot find name' errors.
const formatNumber = (num: number | string | null | undefined) => {
    if (num === null || num === undefined || !isFinite(num as number)) return 'N/A';
    if (typeof num === 'string') return num;
    if (Math.abs(num) < 0.001 && num !== 0) return num.toExponential(3);
    const fixed = num.toFixed(3);
    return fixed.endsWith('.000') ? parseInt(fixed).toString() : fixed;
};


interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: Inputs;
  results: Results | string | null;
  t: any;
}

const ReportChart: React.FC<{results: Results, t: any}> = ({ results, t }) => {
    if (typeof results.detectionLimit !== 'number' || typeof results.decisionThreshold !== 'number') return <p>{t('chartNotAvailable')}</p>;

    const { primaryResult, primaryUncertainty, decisionThreshold, detectionLimit, uncertaintyAtZero, uncertaintyAtDetectionLimit } = results;
    
    const width = 800;
    const height = 450;
    const padding = { top: 30, right: 30, bottom: 50, left: 50 };

    const xMin = Math.min(0, decisionThreshold - 4 * uncertaintyAtZero, primaryResult - 4 * primaryUncertainty);
    const xMax = Math.max(detectionLimit + 4 * uncertaintyAtDetectionLimit, primaryResult + 4 * primaryUncertainty, decisionThreshold + 4 * uncertaintyAtZero);
    
    const h0Points = generateGaussianPoints(0, uncertaintyAtZero, {min: xMin, max: xMax});
    const h1Points = generateGaussianPoints(detectionLimit, uncertaintyAtDetectionLimit, {min: xMin, max: xMax});
    const yPoints = generateGaussianPoints(primaryResult, primaryUncertainty, {min: xMin, max: xMax});
    
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

    return (
        <div className="bg-white p-2 border border-gray-300 chart-container">
             <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#333" />
                <text x={width/2} y={height - 15} textAnchor="middle" fill="#000" fontSize="14">{t('activity')}</text>
                
                <path d={createPath(h0Points)} stroke="#007bff" fill="none" strokeWidth="2.5" />
                <path d={createPath(h1Points)} stroke="#6f42c1" fill="none" strokeWidth="2.5" />
                <path d={createPath(yPoints)} stroke="#28a745" fill="none" strokeWidth="2.5" />

                <line x1={toSvgX(decisionThreshold)} y1={padding.top} x2={toSvgX(decisionThreshold)} y2={height - padding.bottom} stroke="#dc3545" strokeWidth="2" strokeDasharray="5 3" />
                <text x={toSvgX(decisionThreshold)} y={padding.top - 8} textAnchor="middle" fill="#dc3545" fontSize="12" fontWeight="bold">y*</text>

                <line x1={toSvgX(detectionLimit)} y1={padding.top} x2={toSvgX(detectionLimit)} y2={height - padding.bottom} stroke="#ffc107" strokeWidth="2" strokeDasharray="5 3" />
                <text x={toSvgX(detectionLimit)} y={padding.top - 8} textAnchor="middle" fill="#ffc107" fontSize="12" fontWeight="bold">y#</text>
            </svg>
        </div>
    );
}

const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({ isOpen, onClose, inputs, results, t }) => {
    const [operatorName, setOperatorName] = useState('');
    const [sampleId, setSampleId] = useState('');
    const [comments, setComments] = useState('');

    if (!isOpen) return null;

    const renderInputTable = () => {
        const rows = [
            { label: t('grossCount'), value: `${inputs.grossCount} ${inputs.grossCountUnit}`, mode: ['standard'] },
            { label: t('measurementTime'), value: `${inputs.grossTime} s`, mode: ['standard', 'spectrometry', 'surface'] },
            { label: t('backgroundCount'), value: `${inputs.backgroundCount} ${inputs.backgroundCountUnit}`, mode: ['standard'] },
            { label: t('measurementTime'), value: `${inputs.backgroundTime} s`, mode: ['standard', 'spectrometry'] },
            { label: t('roiGrossCount'), value: inputs.roiGrossCount, mode: ['spectrometry'] },
            { label: t('roiChannels'), value: inputs.roiChannels, mode: ['spectrometry'] },
            { label: t('backgroundTotalCount'), value: inputs.backgroundTotalCount, mode: ['spectrometry'] },
            { label: t('backgroundChannels'), value: inputs.backgroundChannels, mode: ['spectrometry'] },
            { label: t('calibrationFactor'), value: `${inputs.calibrationFactor.toPrecision(4)} ${inputs.calibrationFactorUnit}`, mode: ['standard', 'spectrometry', 'surface', 'chambre', 'linge']},
            { label: t('relativeUncertainty'), value: `${inputs.calibrationFactorUncertainty} %`, mode: ['standard', 'spectrometry', 'surface', 'chambre', 'linge']},
            { label: "k(1-α)", value: inputs.k1alpha, mode: ['standard', 'spectrometry', 'surface', 'chambre', 'linge']},
            { label: "k(1-β)", value: inputs.k1beta, mode: ['standard', 'spectrometry', 'surface', 'chambre', 'linge']},
        ];
        
        return (
            <table className="w-full text-sm">
                <tbody>
                    {rows.filter(r => r.mode.includes(results && typeof results !== 'string' ? results.currentMode : 'standard')).map(row => (
                        <tr key={row.label}>
                            <td className="font-semibold p-2">{row.label}</td>
                            <td className="p-2">{row.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    const renderResultsTable = (res: Results) => (
        <table className="w-full text-sm">
            <tbody>
                <tr><td className="font-semibold p-2">{t('primaryResult')}</td><td className="p-2">{`${formatNumber(res.primaryResult)} ± ${formatNumber(res.primaryUncertainty)}`}</td></tr>
                <tr><td className="font-semibold p-2">{t('decisionThreshold')} (y*)</td><td className="p-2">{formatNumber(res.decisionThreshold)}</td></tr>
                <tr><td className="font-semibold p-2">{t('detectionLimit')} (y#)</td><td className="p-2">{formatNumber(res.detectionLimit)}</td></tr>
                <tr><td className="font-semibold p-2">{t('conclusion')}</td><td className="p-2">{res.isEffectPresent ? t('effectPresent') : t('effectNotPresent')}</td></tr>
            </tbody>
        </table>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm no-print" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl m-4 border border-gray-700 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700 no-print">
                    <h1 className="text-2xl font-bold text-cyan-400">{t('reportGeneratorTitle')}</h1>
                </div>

                <div className="p-6 overflow-y-auto max-h-[75vh]">
                    {/* A4 Page Simulation */}
                    <div className="bg-white p-8 mx-auto shadow-lg a4-page print-section" style={{ width: '210mm', minHeight: '297mm' }}>
                         {/* Report Header */}
                        <div className="text-black mb-8 pb-4 border-b border-gray-300">
                            <h1 className="text-3xl font-bold mb-2">ISO 11929 Calculation Report</h1>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><strong>{t('operatorName')}:</strong> {operatorName || '-'}</div>
                                <div><strong>{t('sampleId')}:</strong> {sampleId || '-'}</div>
                                <div><strong>{t('reportDate')}:</strong> {new Date().toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Report Body */}
                         {typeof results !== 'string' && results ? (
                            <div className="space-y-8 text-black">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2 border-b pb-1">{t('reportInputs')}</h2>
                                    {renderInputTable()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold mb-2 border-b pb-1">{t('reportResults')}</h2>
                                    {renderResultsTable(results)}
                                </div>
                                 <div className="page-break-before">
                                    <h2 className="text-xl font-semibold mb-2 border-b pb-1">{t('chartTitle')}</h2>
                                    <ReportChart results={results} t={t} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold mb-2 border-b pb-1">{t('comments')}</h2>
                                    <p className="text-sm whitespace-pre-wrap min-h-[50px]">{comments || ' - '}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-black">{t('noResultsToDisplay')}</p>
                        )}
                    </div>
                </div>

                {/* Form and Actions */}
                <div className="bg-gray-900/50 p-6 rounded-b-lg border-t border-gray-700 no-print">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input type="text" placeholder={t('operatorName')} value={operatorName} onChange={e => setOperatorName(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white" />
                        <input type="text" placeholder={t('sampleId')} value={sampleId} onChange={e => setSampleId(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white" />
                    </div>
                    <textarea placeholder={t('comments')} value={comments} onChange={e => setComments(e.target.value)} rows={3} className="w-full bg-gray-700 p-2 rounded-md text-white mb-4" />
                    <div className="flex justify-end space-x-4">
                        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg">{t('close')}</button>
                        <button onClick={() => window.print()} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg">{t('printReport')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportGeneratorModal;