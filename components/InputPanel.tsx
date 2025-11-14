import React from 'react';
import Card from './Card.tsx';
import InfoTooltip from './InfoTooltip.tsx';
import CollapsibleSection from './CollapsibleSection.tsx';
import { Inputs, AnalysisMode, CountUnit, TargetUnit, Detector, Results, MeanTime } from '../types.ts';

interface InputPanelProps {
  inputs: Inputs;
  onInputChange: (name: keyof Inputs, value: any) => void;
  onDetectorChange: (index: number, field: keyof Detector, value: any) => void;
  mode: AnalysisMode;
  t: any;
  isExpertMode: boolean;
  onExpertModeToggle: () => void;
  onRunSimulation: () => void;
  onSaveConfig: () => void;
  onLoadConfig: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenDecayCalculator: () => void;
  isCalculating: boolean;
  results: Results | string | null;
  autoW: boolean;
  onAutoWChange: (value: boolean) => void;
}

const formatMeanTime = (meanTime: MeanTime, t: any) => {
    if (!meanTime || meanTime.years === Infinity) return '∞';
    return t('timeFormat')
        .replace('{y}', meanTime.years)
        .replace('{m}', meanTime.months)
        .replace('{d}', meanTime.days)
        .replace('{h}', meanTime.hours);
}

const InputRow: React.FC<{ label: React.ReactNode; children: React.ReactNode; tooltipText?: string; }> = ({ label, children, tooltipText }) => (
    <div className="grid grid-cols-2 gap-4 items-center">
        <div className="text-sm text-gray-300 flex items-center space-x-2">
            {typeof label === 'string' ? (
                <>
                    <span>{label}</span>
                    {tooltipText && <InfoTooltip text={tooltipText} />}
                </>
            ) : (
                label
            )}
        </div>
        {children}
    </div>
);

const NumberInput: React.FC<{ name: keyof Inputs; value: number; onChange: (name: keyof Inputs, value: number) => void; min?: number; step?: number, disabled?: boolean }> = ({ name, value, onChange, min = 0, step = 0.01, disabled = false }) => (
    <input
        type="number"
        name={name as string}
        value={value}
        onChange={(e) => onChange(name, parseFloat(e.target.value))}
        min={min}
        step={step}
        disabled={disabled}
        className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white disabled:bg-gray-800 disabled:text-gray-400"
    />
);

const UnitSelect: React.FC<{ name: keyof Inputs; value: string; onChange: (name: keyof Inputs, value: string) => void; options: { value: string; label: string }[] }> = ({ name, value, onChange, options }) => (
    <select
        name={name as string}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full bg-gray-700 p-2 rounded-md"
    >
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
);

const InputPanel: React.FC<InputPanelProps> = ({
    inputs, onInputChange, onDetectorChange, mode, t, isExpertMode, onExpertModeToggle,
    onRunSimulation, onSaveConfig, onLoadConfig, onOpenDecayCalculator, isCalculating, results,
    autoW, onAutoWChange
}) => {
    
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    const countUnitOptions = [
        { value: CountUnit.COUNTS, label: t('counts') },
        { value: CountUnit.CPS, label: t('cps') },
        { value: CountUnit.CPM, label: t('cpm') },
        { value: CountUnit.C_02S, label: t('c_02s') },
    ];
    
    const rateUnitOptions = countUnitOptions.filter(opt => opt.value !== CountUnit.COUNTS);

    const renderCalibrationSection = () => {
        const showAutoW = mode === 'surface' || mode === 'chambre' || mode === 'linge';
        const showTools = ['standard', 'spectrometry', 'surface'].includes(mode);
        return (
             <CollapsibleSection title={t('calibration')} defaultOpen={true}>
                <div className="space-y-3 p-2">
                    {showAutoW && (
                         <InputRow label={t('autoCalibFactor')} tooltipText={t('autoCalibFactorTooltip')}>
                            <div className="text-right">
                                <input type="checkbox" checked={autoW} onChange={(e) => onAutoWChange(e.target.checked)} className="form-checkbox h-5 w-5 text-cyan-500 cursor-pointer" />
                            </div>
                        </InputRow>
                    )}
                    <InputRow label={
                        <span className="flex items-center space-x-2">
                            <span>{t('calibrationFactor')}</span>
                            <InfoTooltip text={t('calibrationFactorTooltip')} />
                            {showTools && (
                                <button onClick={onOpenDecayCalculator} className="text-cyan-400 hover:text-cyan-300" title={t('decayCalculator')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                </button>
                            )}
                        </span>
                    }>
                        <NumberInput name="calibrationFactor" value={inputs.calibrationFactor} onChange={onInputChange} step={0.0001} disabled={showAutoW && autoW} />
                    </InputRow>
                     <InputRow label={t('calibrationFactorUnit')} tooltipText={t('calibrationFactorUnitTooltip')}>
                        <input type="text" value={inputs.calibrationFactorUnit} onChange={(e) => onInputChange('calibrationFactorUnit', e.target.value)} disabled={showAutoW && autoW} className="w-full bg-gray-700 p-2 rounded-md text-white disabled:bg-gray-800 disabled:text-gray-400" />
                    </InputRow>
                    <InputRow label={t('relativeUncertainty')} tooltipText={t('relativeUncertaintyTooltip')}>
                         <div className="flex items-center space-x-2">
                            <NumberInput name="calibrationFactorUncertainty" value={inputs.calibrationFactorUncertainty} onChange={onInputChange} disabled={showAutoW && autoW} />
                            <span className="text-sm text-gray-400">%</span>
                        </div>
                    </InputRow>
                </div>
            </CollapsibleSection>
        )
    };

    const renderStandardInputs = () => (
        <div className="space-y-4">
            <CollapsibleSection title={t('sourceMeasurement')} defaultOpen={true}>
                <div className="space-y-3 p-2">
                    <InputRow label={t('grossCount')} tooltipText={t('grossCountTooltip')}>
                        <div className="grid grid-cols-2 gap-2">
                            <NumberInput name="grossCount" value={inputs.grossCount} onChange={onInputChange} />
                            <UnitSelect name="grossCountUnit" value={inputs.grossCountUnit} onChange={onInputChange} options={countUnitOptions} />
                        </div>
                    </InputRow>
                    <InputRow label={t('measurementTime')} tooltipText={t('measurementTimeTooltip')}>
                         <div className="flex items-center space-x-2">
                             <NumberInput name="grossTime" value={inputs.grossTime} onChange={onInputChange} />
                             <span className="text-sm text-gray-400">s</span>
                         </div>
                    </InputRow>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title={t('backgroundMeasurement')} defaultOpen={true}>
                <div className="space-y-3 p-2">
                    <InputRow label={t('backgroundCount')} tooltipText={t('backgroundCountTooltip')}>
                         <div className="grid grid-cols-2 gap-2">
                            <NumberInput name="backgroundCount" value={inputs.backgroundCount} onChange={onInputChange} />
                            <UnitSelect name="backgroundCountUnit" value={inputs.backgroundCountUnit} onChange={onInputChange} options={countUnitOptions} />
                        </div>
                    </InputRow>
                    <InputRow label={t('measurementTime')} tooltipText={t('backgroundTimeTooltip')}>
                        <div className="flex items-center space-x-2">
                            <NumberInput name="backgroundTime" value={inputs.backgroundTime} onChange={onInputChange} />
                            <span className="text-sm text-gray-400">s</span>
                        </div>
                    </InputRow>
                </div>
            </CollapsibleSection>

            {renderCalibrationSection()}
        </div>
    );
    
    const renderSpectrometryInputs = () => (
        <div className="space-y-4">
            <CollapsibleSection title={t('roiMeasurement')} defaultOpen={true}>
                 <div className="space-y-3 p-2">
                    <InputRow label={t('roiGrossCount')} tooltipText={t('roiGrossCountTooltip')}>
                         <NumberInput name="roiGrossCount" value={inputs.roiGrossCount} onChange={onInputChange} />
                    </InputRow>
                     <InputRow label={t('measurementTime')} tooltipText={t('measurementTimeTooltip')}>
                         <div className="flex items-center space-x-2">
                             <NumberInput name="grossTime" value={inputs.grossTime} onChange={onInputChange} />
                             <span className="text-sm text-gray-400">s</span>
                         </div>
                    </InputRow>
                     <InputRow label={t('roiChannels')} tooltipText={t('roiChannelsTooltip')}>
                         <NumberInput name="roiChannels" value={inputs.roiChannels} onChange={onInputChange} />
                    </InputRow>
                 </div>
            </CollapsibleSection>
            
            <CollapsibleSection title={t('backgroundMeasurement')} defaultOpen={true}>
                 <div className="space-y-3 p-2">
                     <InputRow label={t('backgroundTotalCount')} tooltipText={t('backgroundTotalCountTooltip')}>
                         <NumberInput name="backgroundTotalCount" value={inputs.backgroundTotalCount} onChange={onInputChange} />
                    </InputRow>
                    <InputRow label={t('measurementTime')} tooltipText={t('backgroundTimeTooltip')}>
                        <div className="flex items-center space-x-2">
                            <NumberInput name="backgroundTime" value={inputs.backgroundTime} onChange={onInputChange} />
                            <span className="text-sm text-gray-400">s</span>
                        </div>
                    </InputRow>
                    <InputRow label={t('backgroundChannels')} tooltipText={t('backgroundChannelsTooltip')}>
                         <NumberInput name="backgroundChannels" value={inputs.backgroundChannels} onChange={onInputChange} />
                    </InputRow>
                 </div>
            </CollapsibleSection>
            
            {renderCalibrationSection()}
        </div>
    );
    
    const renderSurfaceInputs = () => (
         <div className="space-y-4">
            <CollapsibleSection title={t('probeParameters')} defaultOpen={true}>
                 <div className="space-y-3 p-2">
                    <InputRow label={t('probeEfficiency')} tooltipText={t('probeEfficiencyTooltip')}>
                        <div className="flex items-center space-x-2">
                            <NumberInput name="probeEfficiency" value={inputs.probeEfficiency} onChange={onInputChange} />
                            <span className="text-sm text-gray-400">%</span>
                        </div>
                    </InputRow>
                     <InputRow label={t('probeArea')} tooltipText={t('probeAreaTooltip')}>
                        <div className="flex items-center space-x-2">
                             <NumberInput name="probeArea" value={inputs.probeArea} onChange={onInputChange} />
                             <span className="text-sm text-gray-400">cm²</span>
                         </div>
                    </InputRow>
                 </div>
            </CollapsibleSection>
            <CollapsibleSection title={t('measurementConditions')} defaultOpen={true}>
                <div className="space-y-3 p-2">
                    <InputRow label={t('measurementTime')} tooltipText={t('measurementTimeTooltip')}>
                         <div className="flex items-center space-x-2">
                             <NumberInput name="grossTime" value={inputs.grossTime} onChange={onInputChange} />
                             <span className="text-sm text-gray-400">s</span>
                         </div>
                    </InputRow>
                    <InputRow label={t('estimatedBackgroundRate')} tooltipText={t('estimatedBackgroundRateTooltip')}>
                        <div className="flex items-center space-x-2">
                            <NumberInput name="estimatedBackgroundRate" value={inputs.estimatedBackgroundRate} onChange={onInputChange} />
                            <span className="text-sm text-gray-400">c/s</span>
                        </div>
                    </InputRow>
                </div>
            </CollapsibleSection>
            {renderCalibrationSection()}
            <CollapsibleSection title={t('targetActivity')} defaultOpen={true}>
                 <div className="space-y-3 p-2">
                    <InputRow label={t('targetValue')} tooltipText={t('targetValueTooltip')}>
                         <div className="grid grid-cols-2 gap-2">
                            <NumberInput name="targetValue" value={inputs.targetValue} onChange={onInputChange} />
                            <UnitSelect name="targetUnit" value={inputs.targetUnit} onChange={onInputChange} options={[
                                { value: TargetUnit.BQ, label: TargetUnit.BQ },
                                { value: TargetUnit.BQ_CM2, label: TargetUnit.BQ_CM2 },
                                { value: TargetUnit.DPM, label: TargetUnit.DPM },
                                { value: TargetUnit.DPM_CM2, label: 'dpm/cm²' },
                                { value: TargetUnit.UCI, label: TargetUnit.UCI },
                                { value: TargetUnit.UCI_CM2, label: TargetUnit.UCI_CM2 },
                            ]} />
                        </div>
                    </InputRow>
                 </div>
            </CollapsibleSection>
         </div>
    );
    
    const renderChambreLingeInputs = () => {
        const detectorLimit = mode === 'chambre' ? 6 : 9;
        return (
             <div className="space-y-4">
                 <CollapsibleSection title={t('detectorSetup')} defaultOpen={true}>
                     <div className="space-y-3 p-2">
                         <div className="space-y-2 max-h-80 overflow-y-auto">
                            {inputs.detectors.slice(0, detectorLimit).map((detector, i) => (
                                 <div key={i} className="bg-gray-700 p-2 rounded-md space-y-2">
                                     <div className="flex justify-between items-center">
                                         <h4 className="font-semibold">{t('detector')} {i+1}</h4>
                                         <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                             <span>{t('enabled')}</span>
                                             <input type="checkbox" checked={detector.enabled} onChange={(e) => onDetectorChange(i, 'enabled', e.target.checked)} />
                                         </label>
                                     </div>
                                     <div className="grid grid-cols-2 gap-2 text-xs items-center">
                                         <label>{t('detectorType')}</label>
                                          <select
                                                value={detector.type}
                                                onChange={(e) => onDetectorChange(i, 'type', e.target.value as 'beta' | 'gamma')}
                                                className="bg-gray-800 p-1 rounded text-white text-xs"
                                             >
                                                <option value="beta">Beta</option>
                                                <option value="gamma">Gamma</option>
                                          </select>
                                         <label>{t('efficiency')} (%)</label>
                                         <input type="number" value={detector.efficiency} onChange={(e) => onDetectorChange(i, 'efficiency', parseFloat(e.target.value))} className="bg-gray-800 p-1 rounded font-mono text-right text-white" />
                                         <label>{t('background')}</label>
                                         <div className="grid grid-cols-2 gap-1">
                                             <input type="number" value={detector.background} onChange={(e) => onDetectorChange(i, 'background', parseFloat(e.target.value))} className="bg-gray-800 p-1 rounded font-mono text-right text-white" />
                                             <select
                                                value={detector.backgroundUnit}
                                                onChange={(e) => onDetectorChange(i, 'backgroundUnit', e.target.value as CountUnit)}
                                                className="bg-gray-800 p-1 rounded text-white text-xs"
                                             >
                                                 {rateUnitOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                             </select>
                                         </div>
                                         <label className="flex items-center space-x-1"><span>{t('detectorDimLength')}</span><InfoTooltip text={t('detectorDimLengthTooltip')} /></label>
                                         <input type="number" value={detector.length} onChange={(e) => onDetectorChange(i, 'length', parseFloat(e.target.value))} className="bg-gray-800 p-1 rounded font-mono text-right text-white" />
                                         <label className="flex items-center space-x-1"><span>{t('detectorDimWidth')}</span><InfoTooltip text={t('detectorDimWidthTooltip')} /></label>
                                         <input type="number" value={detector.width} onChange={(e) => onDetectorChange(i, 'width', parseFloat(e.target.value))} className="bg-gray-800 p-1 rounded font-mono text-right text-white" />
                                     </div>
                                 </div>
                            ))}
                         </div>
                     </div>
                 </CollapsibleSection>
                 {mode === 'linge' && (
                     <CollapsibleSection title={t('conveyorSetup')} defaultOpen={true}>
                         <div className="space-y-3 p-2">
                             <InputRow label={t('conveyorSpeed')} tooltipText={t('conveyorSpeedTooltip')}>
                                 <div className="grid grid-cols-2 gap-2">
                                     <NumberInput name="conveyorSpeed" value={inputs.conveyorSpeed} onChange={onInputChange} />
                                     <UnitSelect name="conveyorSpeedUnit" value={inputs.conveyorSpeedUnit} onChange={onInputChange} options={[ { value: 'cm_min', label: 'cm/min' }, { value: 'm_min', label: 'm/min' } ]} />
                                 </div>
                             </InputRow>
                         </div>
                     </CollapsibleSection>
                 )}
                 {mode === 'chambre' && (
                     <CollapsibleSection title={t('measurementConditions')} defaultOpen={true}>
                         <div className="space-y-3 p-2">
                             <InputRow label={t('measurementTime')} tooltipText={t('measurementTimeTooltip')}>
                                 <div className="flex items-center space-x-2">
                                    <NumberInput name="chambreLingeTime" value={inputs.chambreLingeTime} onChange={onInputChange} />
                                    <span className="text-sm text-gray-400">s</span>
                                 </div>
                             </InputRow>
                         </div>
                     </CollapsibleSection>
                 )}
                  {renderCalibrationSection()}
                  <CollapsibleSection title={t('targetActivity')} defaultOpen={true}>
                     <div className="space-y-3 p-2">
                        <InputRow label={t('targetValue')} tooltipText={t('targetValueTooltip')}>
                             <div className="grid grid-cols-2 gap-2">
                                <NumberInput name="chambreLingeTarget" value={inputs.chambreLingeTarget} onChange={onInputChange} />
                                <UnitSelect name="chambreLingeTargetUnit" value={inputs.chambreLingeTargetUnit} onChange={onInputChange} options={[
                                    { value: TargetUnit.BQ, label: TargetUnit.BQ },
                                    { value: TargetUnit.BQ_CM2, label: TargetUnit.BQ_CM2 },
                                    { value: TargetUnit.DPM, label: TargetUnit.DPM },
                                    { value: TargetUnit.DPM_CM2, label: 'dpm/cm²' },
                                    { value: TargetUnit.UCI, label: TargetUnit.UCI },
                                    { value: TargetUnit.UCI_CM2, label: TargetUnit.UCI_CM2 },
                                ]} />
                            </div>
                        </InputRow>
                     </div>
                </CollapsibleSection>
             </div>
        );
    }

    const renderExpertInputs = () => (
        <div className="space-y-4">
            <CollapsibleSection title={t('riskParameters')} defaultOpen={true}>
                <div className="space-y-3 p-2">
                    <InputRow label="k(1-α)" tooltipText={t('k1alphaTooltip')}>
                        <div className="flex flex-col">
                            <NumberInput name="k1alpha" value={inputs.k1alpha} onChange={onInputChange} step={0.001} />
                            {typeof results !== 'string' && results && (
                                <div className="text-xs text-gray-400 text-right mt-1 pr-1">
                                    {t('meanTimeBetweenFalseAlarms')}: {formatMeanTime(results.meanTimeBetweenFalseAlarms, t)}
                                </div>
                            )}
                        </div>
                    </InputRow>
                    <InputRow label="k(1-β)" tooltipText={t('k1betaTooltip')}>
                        <NumberInput name="k1beta" value={inputs.k1beta} onChange={onInputChange} step={0.001} />
                    </InputRow>
                </div>
            </CollapsibleSection>
            {isExpertMode && (
                <>
                    <CollapsibleSection title={t('advancedParameters')} defaultOpen={true}>
                         <div className="space-y-3 p-2">
                            <InputRow label={t('correlationCoefficient')} tooltipText={t('correlationCoefficientTooltip')}>
                                <div className="flex items-center space-x-2">
                                     <input type="range" min="0" max="1" step="0.01" name="correlationCoefficient" value={inputs.correlationCoefficient} onChange={(e) => onInputChange('correlationCoefficient', parseFloat(e.target.value))} className="w-full" />
                                     <span className="font-mono w-12 text-right">{inputs.correlationCoefficient.toFixed(2)}</span>
                                 </div>
                            </InputRow>
                             <InputRow label={t('bayesianCalculationMode')} tooltipText={t('bayesianCalculationModeTooltip')}>
                                <div className="text-right">
                                    <input type="checkbox" checked={inputs.useBayesianMode} onChange={(e) => onInputChange('useBayesianMode', e.target.checked)} className="form-checkbox h-5 w-5 text-cyan-500" />
                                </div>
                            </InputRow>
                         </div>
                    </CollapsibleSection>
                    <CollapsibleSection title={t('monteCarloMode')} defaultOpen={true}>
                        <div className="space-y-3 p-2">
                            <InputRow label={t('enableMonteCarlo')} tooltipText={t('enableMonteCarloTooltip')}>
                                <div className="text-right">
                                    <input type="checkbox" checked={inputs.monteCarloMode} onChange={(e) => onInputChange('monteCarloMode', e.target.checked)} className="form-checkbox h-5 w-5 text-cyan-500" />
                                </div>
                            </InputRow>
                            {inputs.monteCarloMode && (
                                <InputRow label={t('numSimulations')} tooltipText={t('numSimulationsTooltip')}>
                                    <NumberInput name="numSimulations" value={inputs.numSimulations} onChange={onInputChange} min={100} step={100} />
                                </InputRow>
                            )}
                        </div>
                    </CollapsibleSection>
                </>
            )}
        </div>
    );

    return (
        <Card title={
            <div className="flex justify-between items-center">
                <span>{t('inputs')}</span>
                <label className="flex items-center space-x-2 cursor-pointer text-sm font-normal">
                    <span className="text-gray-400">{t('expertMode')}</span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={isExpertMode} onChange={onExpertModeToggle} />
                        <div className={`block w-10 h-6 rounded-full ${isExpertMode ? 'bg-cyan-500' : 'bg-gray-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isExpertMode ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                </label>
            </div>
        }>
            <div className="space-y-4">
                {mode === 'standard' && renderStandardInputs()}
                {mode === 'spectrometry' && renderSpectrometryInputs()}
                {mode === 'surface' && renderSurfaceInputs()}
                {(mode === 'chambre' || mode === 'linge') && renderChambreLingeInputs()}

                {renderExpertInputs()}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-700 flex flex-wrap gap-2 justify-between items-center">
                <div className="flex items-center gap-2">
                    <button onClick={onSaveConfig} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center space-x-2">
                        <span>{t('saveConfig')}</span>
                    </button>
                    <button onClick={handleLoadClick} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center space-x-2">
                        <span>{t('loadConfig')}</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={onLoadConfig} accept=".json" className="hidden"/>
                </div>
            </div>
        </Card>
    );
};

export default InputPanel;