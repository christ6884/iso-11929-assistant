import React from 'react';
import Card from '../Card';
// Fix: Corrected import path
import { CalibrationPoint, CalibrationFunction } from '../../types';
import InfoTooltip from '../InfoTooltip';

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
        <div className="text-sm text-gray-400 space-y-1 bg-gray-900/50 p-3 rounded-md border border-gray-700 mb-4">
              <p>{t('step1_addPoints_instruction')}</p>
        </div>
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-300">{t('calibrationPoints')}</h3>
            <div className="flex items-center space-x-3">
                {calibrationPoints.length > 0 && (
                    <button onClick={undoLastPoint} className="text-xs text-yellow-400 hover:text-yellow-300">{t('undoLastPoint')}</button>
                )}
                {calibrationPoints.length > 0 && (
                    <button onClick={clearPoints} className="text-xs text-red-400 hover:text-red-300">{t('clearAllPoints')}</button>
                )}
            </div>
        </div>
        <div className="bg-gray-900/50 p-2 rounded-md space-y-2 min-h-[100px] max-h-48 overflow-y-auto">
            {calibrationPoints.length === 0 ? (
                <p className="text-sm text-gray-500 text-center p-2">{t('noCalibrationPoints')}</p>
            ) : (
                calibrationPoints.map((point, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-800 p-2 rounded border-l-2 border-cyan-500">
                        <span className="text-sm font-mono text-cyan-300 font-semibold">Pt {i+1}: {point.energy.toFixed(1)} {point.uncertainty ? `± ${point.uncertainty.toFixed(1)}` : ''} keV</span>
                        <button onClick={() => removePoint(i)} className="text-red-400 hover:text-red-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))
            )}
        </div>
        <button
            onClick={handleCalculateAndProceed}
            disabled={calibrationPoints.length < 2}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
            {t('next_calculateCalibration')}
        </button>
    </div>
  );

  const renderStep2_Validate = () => (
    <div>
        <div className="text-sm text-gray-400 space-y-1 bg-gray-900/50 p-3 rounded-md border border-gray-700 mb-4">
              <p>{t('step2_validate_instruction')}</p>
        </div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">{t('calibrationResults')}</h3>
        <div className="bg-gray-900/50 p-3 rounded-md space-y-2 text-sm mb-4">
            <div className="flex justify-between">
                <span className="text-gray-400">{t('calibrationStatus')}:</span>
                <span className="font-semibold">{getStatus()}</span>
            </div>
            {calibrationFunction?.rSquared !== undefined && (
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-400">{t('linearity')}:</span>
                        <InfoTooltip text={t('linearityTooltip')} />
                    </div>
                    <span className={`font-mono font-bold ${getRSquaredColor()}`}>{calibrationFunction.rSquared.toFixed(5)}</span>
                </div>
            )}
            <div className="flex justify-between pt-1">
                <span className="text-gray-400">{t('slope')}:</span>
                <span className="font-mono text-gray-200">{calibrationFunction?.slope.toExponential(3)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-400">{t('intercept')}:</span>
                <span className="font-mono text-gray-200">{calibrationFunction?.intercept.toFixed(3)}</span>
            </div>
        </div>
        <div className="flex flex-col space-y-2">
             <button
                onClick={() => { onStepChange('analyze'); onLaunchAnalysis(); }}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
            >
                {t('confirm_runAnalysis')}
            </button>
             <button
                onClick={() => onStepChange('add')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
            >
                {t('back_adjustPoints')}
            </button>
        </div>
    </div>
  );

  const renderStep3_Analyze = () => (
     <div>
        <div>
            <label className="text-sm text-gray-300 flex items-center space-x-2 mb-1">
                <span>{t('identificationTolerance')} (keV)</span>
                <InfoTooltip text={t('identificationToleranceTooltip')} />
            </label>
            <input 
                type="number"
                value={identificationTolerance}
                onChange={(e) => onIdentificationToleranceChange(parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0.1"
                className="w-full bg-gray-900 p-2 rounded-md font-mono text-right text-white"
            />
        </div>
        <button 
            onClick={() => onLaunchAnalysis(true)} 
            disabled={(analysisStatus === 'extracting' || analysisStatus === 'detecting')}
            className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
            {(analysisStatus === 'extracting' || analysisStatus === 'detecting') && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            <span>{getAnalysisButtonText()}</span>
        </button>
        {analysisStatus === 'error' && (
            <p className="text-xs text-red-400 mt-2 text-center">{t('analysisError')}: {t(errorMessage) || errorMessage}</p>
        )}
     </div>
  );


  const renderContent = () => {
    if (!imageLoaded) {
        return (
            <div className="text-center text-gray-400 p-4 border border-gray-700 rounded-lg bg-gray-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p>{t('sidebarUploadInstruction')}</p>
            </div>
        );
    }

    switch(step) {
        case 'add': return renderStep1_AddPoints();
        case 'validate': return renderStep2_Validate();
        case 'analyze': return renderStep3_Analyze();
        default: return null;
    }
  }
  
  const getTitle = () => {
      if (!imageLoaded) return t('calibrationAndAnalysis');
      switch(step) {
          case 'add': return t('step1_addPoints_title');
          case 'validate': return t('step2_validate_title');
          case 'analyze': return t('step3_analyze_title');
          default: return t('calibrationAndAnalysis');
      }
  }


  return (
    <Card title={getTitle()}>
      <div className="space-y-4">
        {renderContent()}
        <div className="pt-4 border-t border-gray-700">
            {/* FIX: The onReset handler was being called with a MouseEvent, causing a type mismatch. Wrapping it in an arrow function ensures it's called with no arguments, matching its () => void definition. */}
            {/* Fix: Wrapped onReset in an arrow function to prevent passing the MouseEvent as an argument. */}
            {/* Fix: Wrapped onReset in an arrow function to prevent passing the MouseEvent as an argument, which caused a type inference issue leading to the specified error. */}
            <button
                onClick={() => onReset()}
                className="w-full bg-yellow-600/80 hover:bg-yellow-700/80 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                 <span>{t('startOver')}</span>
            </button>
        </div>
      </div>
    </Card>
  );
};

export default CalibrationSidebar;