import React, { useEffect } from 'react';
import { Results } from '../types.ts';
import Card from './Card.tsx';

interface MonteCarloStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: Results | null;
  t: any;
}

const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined || !isFinite(num)) return 'N/A';
    return num.toPrecision(4);
};

const StatRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700">
        <span className="text-gray-300">{label}</span>
        <span className="font-mono text-cyan-300">{value}</span>
    </div>
);

const MonteCarloStatsModal: React.FC<MonteCarloStatsModalProps> = ({ isOpen, onClose, results, t }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);
    
    if (!isOpen || !results || results.calculationMethod !== 'monteCarlo' || !results.monteCarloStats || typeof results.decisionThreshold !== 'number') {
        return null;
    }

    const stats = results.monteCarloStats;
    const alphaPercentile = (1 - results.alphaProbability) * 100;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl p-4" onClick={(e) => e.stopPropagation()}>
                <Card title={t('simulationStatisticsTitle')}>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">{t('simulationSummaryIntro').replace('{n}', results.numSimulations?.toLocaleString() || 'N/A')}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                             <StatRow label={t('statMean')} value={formatNumber(stats.mean)} />
                             <StatRow label={t('statMedian')} value={formatNumber(stats.median)} />
                             <StatRow label={t('statStdDev')} value={formatNumber(stats.stdDev)} />
                             <StatRow label={t('statRange')} value={`[${formatNumber(stats.min)}; ${formatNumber(stats.max)}]`} />
                             <StatRow label={t('statSkewness')} value={formatNumber(stats.skewness)} />
                             <StatRow label={t('statKurtosis')} value={formatNumber(stats.kurtosis)} />
                        </div>

                        <div>
                            <h4 className="text-md font-semibold text-cyan-400 mt-4 mb-2">{t('derivedValuesTitle')}</h4>
                            <div className="bg-gray-900/50 p-3 rounded-md space-y-3">
                                <p className="text-gray-300">
                                    <strong className="text-cyan-400">{t('decisionThreshold')} (y*): {formatNumber(results.decisionThreshold)}</strong>
                                    <br />
                                    <span className="text-xs text-gray-400">{t('decisionThresholdDerivation').replace('{alphaPercentile}', alphaPercentile.toFixed(2))}</span>
                                </p>
                                <p className="text-gray-300">
                                     <strong className="text-cyan-400">{t('confidenceInterval')} (95%): [{formatNumber(stats.confidenceIntervalPercentileLower)}; {formatNumber(stats.confidenceIntervalPercentileUpper)}]</strong>
                                     <br/>
                                     <span className="text-xs text-gray-400">{t('confidenceIntervalDerivation')}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                                {t('close')}
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MonteCarloStatsModal;