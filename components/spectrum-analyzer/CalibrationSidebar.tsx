import React from 'react';
import Card from '../Card.tsx';
import { CalibrationPoint, CalibrationFunction } from '../../types.ts';
import InfoTooltip from '../InfoTooltip.tsx';

type CalibrationStep = 'add' | 'validate' | 'analyze';

interface CalibrationSidebarProps {
  imageLoaded: boolean;
  step: CalibrationStep;
  onStepChange: (step: CalibrationStep) => void;
  calibrationPoints: CalibrationPoint[];
  setCalibrationPoints: (points: CalibrationPoint[]) => void;
  calibrationFunction: CalibrationFunction | null;
  onCalibrationChange: (func: CalibrationFunction | null) => void;
  onLaunchAnalysis: (isRerun?: boolean) => void;
  analysisStatus: 'idle' | 'extracting' | 'detecting' | 'complete' | 'error';
  errorMessage: string;
  identificationTolerance: number;
  onIdentificationToleranceChange: (value: number) => void;
  onReset: () => void;
  t: any;
}

const linearRegression = (points: { x: number; y: number }[]): CalibrationFunction | null => {
    const n = points.length;
    if (n < 2) return null;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (const p of points) {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumX2 += p.x * p.x;
        sumY2 += p.y * p.y;
    }

    const denominator = (n * sumX2 - sumX * sumX);
    if (denominator === 0) return null; // Avoid division by zero

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    
    let rSquared: number | undefined = undefined;
    const r_denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    if (r_denominator !== 0) {
      const r = (n * sumXY - sumX * sumY) / r_denominator;
      rSquared = r * r;
    }
    
    return { slope, intercept, rSquared };
}


const CalibrationSidebar: React.FC<CalibrationSidebarProps> = ({ 
    imageLoaded, step, onStepChange,
    calibrationPoints, setCalibrationPoints, 
    calibrationFunction, onCalibrationChange,
    onLaunchAnalysis, analysisStatus, errorMessage, 
    identificationTolerance, onIdentificationToleranceChange, onReset, t 
}) => {

  const handleCalculateAndProceed = () => {
      const func = linearRegression(calibrationPoints.map(p => ({ x: p.x, y: p.energy })));
      onCalibrationChange(func);
      onStepChange('validate');
  };

  const removePoint = (index: number) => {
    setCalibrationPoints(calibrationPoints.filter((_, i) => i !== index));
  };
  
  const undoLastPoint = () => {
    setCalibrationPoints(calibrationPoints.slice(0, -1));
  };

  const clearPoints = () => {
    setCalibrationPoints([]);
  };

  const getStatus = () => {
    if (!calibrationFunction?.rSquared) return <span className="text-gray-400">{t('statusNotCalculated')}</span>;
    if (calibrationFunction.rSquared > 0.9999) return <span className="text-cyan-400">{t('statusExcellent')}</span>;
    if (calibrationFunction.rSquared > 0.999) return <span className="text-green-400">{t('statusGood')}</span>;
    return <span className="text-red-400">{t('statusCheckPoints')}</span>;
  };
  
  const getRSquaredColor = () => {
      if (!calibrationFunction?.rSquared) return 'text-gray-400';
      if (calibrationFunction.rSquared > 0.9999) return 'text-cyan-300';
      if (calibrationFunction.rSquared > 0.999) return 'text-green-300';
      return 'text-red-400';
  }

  const getAnalysisButtonText = () => {
      switch (analysisStatus) {
          case 'extracting': return t('extractingCurve');
          case 'detecting': return t('detectingPeaks');
          default: return t('runAnalysisAgain');
      }
  };

  const renderStep1_AddPoints = () => (
    <div>
        <div className="text-sm text-gray-400 mb-4">{t('calibrationStep1')}</div>
        {calibrationPoints.length > 0 && (
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {calibrationPoints.map((p, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-700 p-2 rounded-md text-sm">
                        <span>Ch: {Math.round(p.x)}, E: {p.energy} keV</span>
                        <button onClick={() => removePoint(i)} className="text-red-400 hover:text-red-300">&times;</button>
                    </div>
                ))}
            </div>
        )}
        <div className="flex space-x-2 mb-4">
            <button onClick={undoLastPoint} disabled={calibrationPoints.length === 0} className="text-sm bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg disabled:opacity-50 flex-1">{t('undoLast')}</button>
            <button onClick={clearPoints} disabled={calibrationPoints.length === 0} className="text-sm bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg disabled:opacity-50 flex-1">{t('clearAll')}</button>
        </div>
        <button 
            onClick={handleCalculateAndProceed} 
            disabled={calibrationPoints.length < 2}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-500"
        >
            {t('calculateCalibration')} ({calibrationPoints.length}/2 min)
        </button>
    </div>
  );
  
  const renderStep2_Validate = () => (
    <div>
        <div className="text-sm text-gray-400 mb-4">{t('calibrationStep2')}</div>
        {calibrationFunction && (
            <div className="bg-gray-900/50 p-3 rounded-md space-y-2 text-sm mb-4">
                 <div className="flex justify-between">
                    <span className="text-gray-400">{t('calibrationStatus')}:</span>
                    {getStatus()}
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">R²:</span>
                    <span className={`font-mono ${getRSquaredColor()}`}>{calibrationFunction.rSquared?.toFixed(6) ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">{t('slope')}:</span>
                    <span className="font-mono">{calibrationFunction.slope.toPrecision(4)}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-gray-400">{t('intercept')}:</span>
                    <span className="font-mono">{calibrationFunction.intercept.toPrecision(4)}</span>
                </div>
            </div>
        )}
        <div className="flex space-x-2">
             <button onClick={() => onStepChange('add')} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">{t('backToPoints')}</button>
             <button onClick={() => { onLaunchAnalysis(); onStepChange('analyze'); }} disabled={!calibrationFunction} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">{t('runAnalysis')}</button>
        </div>
    </div>
  );
  
  const renderStep3_Analyze = () => (
    <div>
        {analysisStatus === 'error' && <p className="text-red-400 bg-red-900/30 p-2 rounded-md mb-4 text-sm">{t(errorMessage) || errorMessage}</p>}
        
        <div className="mb-4">
             <label className="text-sm text-gray-300 flex items-center space-x-2 mb-1">
                <span>{t('identificationTolerance')} (keV)</span>
                <InfoTooltip text={t('identificationToleranceTooltip')} />
            </label>
            <input 
                type="number"
                value={identificationTolerance}
                onChange={(e) => onIdentificationToleranceChange(parseFloat(e.target.value))}
                step="0.1" min="0.1"
                className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white"
            />
        </div>
        
        <button onClick={() => onLaunchAnalysis(true)} disabled={analysisStatus === 'extracting' || analysisStatus === 'detecting'} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">
            {getAnalysisButtonText()}
        </button>

         <div className="mt-4 flex space-x-2">
            <button onClick={() => onStepChange('validate')} className="flex-1 text-sm bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg">{t('backToCalibration')}</button>
            <button onClick={onReset} className="flex-1 text-sm bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg">{t('resetAll')}</button>
         </div>
    </div>
  );

  // FIX: The original file was incomplete and missing the main return statement for the component, causing a type error.
  return (
    <Card title={t('calibrationAndAnalysis')}>
        {step === 'add' && renderStep1_AddPoints()}
        {step === 'validate' && renderStep2_Validate()}
        {step === 'analyze' && renderStep3_Analyze()}
    </Card>
  );
};

// FIX: Added the missing default export, which caused the import error in SpectrumAnalyzerPage.
export default CalibrationSidebar;
