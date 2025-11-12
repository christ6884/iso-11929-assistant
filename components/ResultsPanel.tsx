import React, { useState, useEffect } from 'react';
import Card from './Card';
import InfoTooltip from './InfoTooltip';
import { Results, Inputs, DetectionLimitMode, AnalysisMode, TargetUnit, MeanTime } from '../types';
import CollapsibleSection from './CollapsibleSection';

interface ResultsPanelProps {
  results: Results | string | null;
  t: any;
  inputs: Inputs;
  mode: AnalysisMode;
  detectionLimitMode: DetectionLimitMode;
  onDetectionLimitModeChange: (mode: DetectionLimitMode) => void;
  targetDetectionLimit: number;
  onTargetDetectionLimitChange: (value: number) => void;
  isExpertMode: boolean;
  isCalculating: boolean;
}

const formatNumber = (num: number | string | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    if (typeof num === 'string') return num;
    if (Math.abs(num) < 0.001 && num !== 0) return num.toExponential(3);
    const fixed = num.toFixed(3);
    return fixed.endsWith('.000') ? parseInt(fixed).toString() : fixed;
};

const formatMeanTime = (meanTime: MeanTime, t: any) => {
    if (!meanTime || meanTime.years === Infinity) return '∞';
    return t('timeFormat')
        .replace('{y}', meanTime.years)
        .replace('{m}', meanTime.months)
        .replace('{d}', meanTime.days)
        .replace('{h}', meanTime.hours);
}

const ResultRow: React.FC<{ label: string; value: React.ReactNode; tooltip: string; large?: boolean; valueColor?: string }> = ({ label, value, tooltip, large = false, valueColor = 'text-gray-100' }) => (
  <div className={`flex justify-between items-center ${large ? 'py-2' : 'py-1'}`}>
    <div className="flex items-center space-x-2">
      <span className={`${large ? 'text-lg text-cyan-400' : 'text-gray-300'} print-text-black`}>{label}</span>
      <InfoTooltip text={tooltip} />
    </div>
    <div className={`font-mono ${large ? 'text-xl' : ''} ${large ? valueColor.replace('text-gray-100', 'text-cyan-300') : valueColor} print-text-black`}>
      {value}
    </div>
  </div>
);

const UncertaintyBudget: React.FC<{ components: Results['varianceComponents'], t: any }> = ({ components, t }) => {
    if (!components || components.total <= 0) return null;

    const budgetItems = [
        { label: t('budgetGross'), value: components.grossCount, color: 'bg-sky-500' },
        { label: t('budgetBackground'), value: components.backgroundCount, color: 'bg-teal-500' },
        { label: t('budgetCalibration'), value: components.calibrationFactor, color: 'bg-amber-500' },
        { label: t('budgetCovariance'), value: components.covariance, color: 'bg-purple-500' },
    ];

    return (
        <div className="border-t border-gray-700 pt-3 print-border-gray">
            <h3 className="text-md font-semibold text-gray-400 mb-3 flex items-center print-text-black">{t('uncertaintyBudget')} <InfoTooltip text={t('uncertaintyBudgetTooltip')} /></h3>
            <div className="space-y-2 text-sm">
                {budgetItems.map(item => {
                    const percentage = (item.value / components.total) * 100;
                    if (Math.abs(percentage) < 0.1) return null;
                    return (
                        <div key={item.label} className="grid grid-cols-3 items-center gap-2">
                            <div className="flex items-center space-x-2 col-span-1">
                                <span className="text-gray-300 print-text-black">{item.label}</span>
                                {item.label === t('budgetCalibration') && <InfoTooltip text={t('budgetCalibrationTooltip')} />}
                            </div>
                            <div className="flex items-center col-span-2">
                                <div className="w-full bg-gray-600 rounded-full h-2.5 mr-2 no-print">
                                    <div className={`${item.color}`} style={{ width: `${Math.abs(percentage)}%`, height: '100%', borderRadius: 'inherit' }}></div>
                                </div>
                                <span className="font-mono text-gray-200 w-16 text-right print-text-black">{percentage.toFixed(1)}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const ResultsPanel: React.FC<ResultsPanelProps> = ({ 
    results, t, inputs, mode, detectionLimitMode, onDetectionLimitModeChange, targetDetectionLimit, onTargetDetectionLimitChange, isExpertMode, isCalculating 
}) => {
  const isTargetBasedMode = mode === 'surface' || mode === 'chambre' || mode === 'linge';
  const targetUnit = isTargetBasedMode ? (mode === 'surface' ? inputs.targetUnit : inputs.chambreLingeTargetUnit) : '';
  const baseUnit = isTargetBasedMode ? 'Bq' : inputs.calibrationFactorUnit.split('/')[0] || 'Unit';
  
  const [displayUnits, setDisplayUnits] = useState({
      decisionThreshold: baseUnit,
      detectionLimit: baseUnit,
  });

  useEffect(() => {
    setDisplayUnits({
        decisionThreshold: baseUnit,
        detectionLimit: baseUnit,
    });
  }, [baseUnit]);

  const handleUnitChange = (key: 'decisionThreshold' | 'detectionLimit', newUnit: string) => {
    setDisplayUnits(prev => ({ ...prev, [key]: newUnit }));
  };

  const convertValue = (value: number | string, toUnit: string): number | string => {
      if (typeof value !== 'number') return value;
      const currentUnit = baseUnit;
      if (currentUnit === toUnit) return value;

      if (toUnit === 'cps' && inputs.calibrationFactor > 0) {
          return value / inputs.calibrationFactor;
      }
      return value;
  };

  const renderUnitSelector = (valueKey: 'decisionThreshold' | 'detectionLimit') => {
      return (
        <select 
            value={displayUnits[valueKey]} 
            onChange={(e) => handleUnitChange(valueKey, e.target.value)}
            className="bg-gray-700 text-white text-xs rounded-md p-1 ml-2 -mr-2 no-print"
            aria-label={`Select unit for ${valueKey}`}
        >
            <option value={baseUnit}>{baseUnit}</option>
            { baseUnit !== 'cps' && <option value="cps">{t('cps')}</option> }
        </select>
      );
  };

  const renderTargetBasedResults = (res: Results) => {
    const currentTargetValue = mode === 'surface' ? inputs.targetValue : inputs.chambreLingeTarget;
    const currentTargetUnit = mode === 'surface' ? inputs.targetUnit : inputs.chambreLingeTargetUnit;
    
    // Conversions to compare everything in the base unit (Bq)
    let unitToBqFactor = 1;
    if (currentTargetUnit.includes(TargetUnit.UCI)) {
        unitToBqFactor = 37000;
    } else if (currentTargetUnit.includes(TargetUnit.DPM)) {
        unitToBqFactor = 1 / 60;
    }
    
    let surfaceFactor = 1;
    if (currentTargetUnit.includes('cm2')) {
        if (mode === 'surface' && inputs.probeArea > 0) {
            surfaceFactor = inputs.probeArea;
        } else if ((mode === 'chambre' || mode === 'linge') && inputs.detectors) {
            const activeDetectors = inputs.detectors.filter(d => d.enabled);
            const totalArea = activeDetectors.reduce((sum, d) => sum + (d.length * d.width), 0);
            if (totalArea > 0) {
                surfaceFactor = totalArea;
            }
        }
    }
    
    const targetValueInBq = currentTargetValue * unitToBqFactor * surfaceFactor;
    
    const isTargetMet = typeof res.detectionLimit === 'number' && res.detectionLimit <= targetValueInBq;
    
    // Convert the calculated detection limit (which is in Bq) back to the user's selected unit for display
    let detectionLimitInTargetUnit: number | string;
    if (typeof res.detectionLimit === 'number' && surfaceFactor > 0 && unitToBqFactor > 0) {
        detectionLimitInTargetUnit = res.detectionLimit / (unitToBqFactor * surfaceFactor);
    } else {
        detectionLimitInTargetUnit = res.detectionLimit; // This will be the error string or original value
    }
      
    return (
      <div className="space-y-4">
         <ResultRow 
            label={t('targetValue')} 
            value={`${formatNumber(currentTargetValue)} (${currentTargetUnit})`}
            tooltip={t('targetValueTooltip')}
            large
          />
         <ResultRow 
            label={t('detectionLimit')} 
            value={`${formatNumber(detectionLimitInTargetUnit)} (${currentTargetUnit})`}
            tooltip={t('detectionLimitTooltip')} 
            large
            valueColor={isTargetMet ? 'text-green-400' : 'text-red-400'}
        />
         <ResultRow 
            label={t('meanTimeBetweenFalseAlarms')}
            value={formatMeanTime(res.meanTimeBetweenFalseAlarms, t)}
            tooltip={t('meanTimeBetweenFalseAlarmsTooltip')}
        />
         <div className="border-t border-gray-700 pt-3 print-border-gray">
             <h3 className="text-md font-semibold text-gray-400 mb-2 print-text-black">{t('conclusion')}</h3>
             <div className={`p-3 rounded-md text-center font-semibold ${isTargetMet ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'} print-text-black`}>
                {isTargetMet ? t('systemCompliant') : t('systemNonCompliant')}
             </div>
        </div>
      </div>
    );
  }

  const renderStandardResults = (res: Results) => {
    const decisionThresholdValue = convertValue(res.decisionThreshold, displayUnits.decisionThreshold);
    const detectionLimitValue = convertValue(res.detectionLimit, displayUnits.detectionLimit);

    return (
      <div className="space-y-4">
        <div>
          <ResultRow 
            label={t('primaryResult')} 
            value={`${formatNumber(res.primaryResult)} ± ${formatNumber(res.primaryUncertainty)} (${baseUnit})`}
            tooltip={res.calculationMethod === 'monteCarlo' ? t('mcPrimaryResultTooltip') : t('primaryResultTooltip')}
            large
          />
        </div>

        {res.calculationMethod === 'analytical' && isExpertMode && <UncertaintyBudget components={res.varianceComponents} t={t} />}
        
        {isExpertMode && res.calculationMethod === 'analytical' && res.sensitivityCoefficients && (
            <CollapsibleSection title={t('uncertaintyDetails')}>
                <div className="space-y-3 p-2">
                    <h4 className="text-md font-semibold text-gray-300 flex items-center">{t('sensitivityCoefficients')} <InfoTooltip text={t('sensitivityCoefficientsTooltip')} /></h4>
                    <ResultRow label={t('coeff_gross')} value={formatNumber(res.sensitivityCoefficients.grossRate)} tooltip={t('coeff_gross_tooltip')} />
                    <ResultRow label={t('coeff_bkg')} value={formatNumber(res.sensitivityCoefficients.backgroundRate)} tooltip={t('coeff_bkg_tooltip')} />
                    <ResultRow label={t('coeff_calib')} value={formatNumber(res.sensitivityCoefficients.calibrationFactor)} tooltip={t('coeff_calib_tooltip')} />
                </div>
            </CollapsibleSection>
        )}

        <div className="border-t border-gray-700 pt-3 space-y-2 print-border-gray">
            <ResultRow 
                label={t('decisionThreshold')} 
                value={
                    <div className="flex items-center justify-end">
                        <span>{formatNumber(decisionThresholdValue)} {displayUnits.decisionThreshold}</span>
                        {renderUnitSelector('decisionThreshold')}
                    </div>
                } 
                tooltip={t('decisionThresholdTooltip')} 
            />
            <ResultRow 
                label={t('detectionLimit')} 
                value={
                    <div className="flex items-center justify-end">
                        <span>{formatNumber(detectionLimitValue)} {displayUnits.detectionLimit}</span>
                        {renderUnitSelector('detectionLimit')}
                    </div>
                } 
                tooltip={t('detectionLimitTooltip')}
            />
            <ResultRow 
                label={t('meanTimeBetweenFalseAlarms')}
                value={formatMeanTime(res.meanTimeBetweenFalseAlarms, t)}
                tooltip={t('meanTimeBetweenFalseAlarmsTooltip')}
            />
        </div>
        <div className="border-t border-gray-700 pt-3 print-border-gray">
             {(res.calculationMethod === 'bayesian' && res.probabilityEffectPresent !== undefined) && (
                <ResultRow
                    label={t('probabilityEffectPresent')}
                    value={`${(res.probabilityEffectPresent * 100).toFixed(1)} %`}
                    tooltip={t('probabilityEffectPresentTooltip')}
                    valueColor="text-yellow-300"
                />
             )}
             <h3 className="text-md font-semibold text-gray-400 my-2 print-text-black">{t('conclusion')}</h3>
             <div className={`p-3 rounded-md text-center font-semibold ${res.isEffectPresent ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'} print-text-black`}>
                {res.isEffectPresent ? t('effectPresent') : t('effectNotPresent')}
             </div>
             {res.isEffectPresent && (
                <div className="mt-2 space-y-2">
                    <ResultRow 
                        label={t('bestEstimate')} 
                        value={`${formatNumber(res.bestEstimate)} ± ${formatNumber(res.bestEstimateUncertainty)} ${baseUnit}`}
                        tooltip={t('bestEstimateTooltip')}
                    />
                    <ResultRow 
                        label={t('confidenceInterval')}
                        value={`[${formatNumber(res.confidenceIntervalLower)}; ${formatNumber(res.confidenceIntervalUpper)}] ${baseUnit}`}
                        tooltip={t('confidenceIntervalTooltip')}
                    />
                </div>
             )}
        </div>
      </div>
    )
  };

  const renderContent = () => {
    if (isCalculating && typeof results === 'string') {
        return <div className="text-gray-400 text-center animate-pulse print-text-black">{t('calculating') || 'Calculating...'}</div>;
    }
    if (typeof results === 'string') {
      return <div className="text-red-400 bg-red-900/30 p-4 rounded-md text-center print-text-black">{t('error')}: {results}</div>;
    }
    if (!results) {
      return <div className="text-gray-400 text-center print-text-black">{t('calculating') || 'Calculating...'}</div>;
    }
    
    return isTargetBasedMode ? renderTargetBasedResults(results) : renderStandardResults(results);
  };
  
  return (
    <Card title={
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
            <div className="flex items-center space-x-4">
                <span className="text-lg font-semibold text-cyan-400 print-text-black">{t('results')}</span>
                {!isTargetBasedMode && <span className="text-xs font-mono bg-gray-700 text-cyan-300 px-2 py-0.5 rounded-full">{t('resultUnit')}: {baseUnit}</span>}
            </div>
            <button onClick={() => window.print()} className="no-print text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-2 self-end md:self-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                <span>{t('printReport')}</span>
            </button>
        </div>
    } className="print-card">
        {(mode === 'standard' || mode === 'spectrometry') && !isTargetBasedMode ? (
          <>
            <div className="mb-4 no-print">
              <label className="text-gray-300 mb-2 block">{t('detectionLimitMode')}</label>
              <div className="flex bg-gray-700 rounded-md p-1">
                <button 
                    onClick={() => onDetectionLimitModeChange('calculate')}
                    className={`flex-1 p-1 text-sm rounded ${detectionLimitMode === 'calculate' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-600'}`}>
                    {t('calculate')}
                </button>
                <button 
                    onClick={() => onDetectionLimitModeChange('target')}
                    className={`flex-1 p-1 text-sm rounded ${detectionLimitMode === 'target' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-600'}`}>
                    {t('target')}
                </button>
              </div>
            </div>

            {detectionLimitMode === 'target' && (
                <div className="mb-4 no-print">
                    <label className="flex items-center space-x-2 text-gray-300 mb-1">
                        <span>{t('targetDetectionLimit')} ({baseUnit})</span>
                        <InfoTooltip text={t('targetDetectionLimitTooltip')} />
                    </label>
                    <input 
                        type="number" 
                        value={targetDetectionLimit} 
                        onChange={(e) => onTargetDetectionLimitChange(parseFloat(e.target.value) || 0)} 
                        className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white"
                        min="0"
                    />
                </div>
            )}
          </>
        ) : null}
        
        {renderContent()}
    </Card>
  );
};

export default ResultsPanel;