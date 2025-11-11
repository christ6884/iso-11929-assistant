import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import ImageUploader from '../components/spectrum-analyzer/ImageUploader';
import CameraCapture from '../components/spectrum-analyzer/CameraCapture';
import CalibrationSidebar from '../components/spectrum-analyzer/CalibrationSidebar';
import AnalysisResults from '../components/spectrum-analyzer/AnalysisResults';
import CalibrationPointModal from '../components/spectrum-analyzer/CalibrationPointModal';
import PeakPositionAdjusterModal from '../components/PeakPositionAdjusterModal';
// Fix: Corrected import path
import { CalibrationPoint, Point, CalibrationFunction, AnalysisResult, DetectedPeak, InteractivePeak } from '../types';
import { analyzeSpectrum } from '../services/spectrumAnalyzerService';
import { identifyPeaks } from '../services/peakIdentifierService';
// Fix: Corrected import path
import { calculateFWHM } from '../services/analysisHelpers';

interface SpectrumAnalyzerPageProps {
  t: any;
  onBack: () => void;
  onOpenPeakIdentifier: () => void;
  analysisType: 'gamma' | 'alpha';
}

const SpectrumAnalyzerPage: React.FC<SpectrumAnalyzerPageProps> = ({ t, onBack, onOpenPeakIdentifier, analysisType }) => {
  // State for the core data and process
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [calibrationPoints, setCalibrationPoints] = useState<CalibrationPoint[]>([]);
  const [calibrationFunction, setCalibrationFunction] = useState<CalibrationFunction | null>(null);
  const [spectrumPoints, setSpectrumPoints] = useState<Point[] | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [initialAnalysisResult, setInitialAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'extracting' | 'detecting' | 'complete' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [identificationTolerance, setIdentificationTolerance] = useState(2.0);

  // State for UI elements
  const [step, setStep] = useState<'add' | 'validate' | 'analyze'>('add');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [interactivePoint, setInteractivePoint] = useState<InteractivePeak | null>(null);
  const [isAdjusterOpen, setIsAdjusterOpen] = useState(false);
  const [adjusterInitialX, setAdjusterInitialX] = useState(0);
  const adjusterCallback = useRef<(x: number) => void>();

  const imageRef = useRef<HTMLImageElement>(null);

  const resetState = useCallback(() => {
    setImageDataUrl(null);
    setCalibrationPoints([]);
    setCalibrationFunction(null);
    setSpectrumPoints(null);
    setAnalysisResult(null);
    setInitialAnalysisResult(null);
    setAnalysisStatus('idle');
    setErrorMessage('');
    setStep('add');
    setInteractivePoint(null);
  }, []);

  const handleImageLoaded = async (dataUrl: string) => {
// Fix: The original error message "Expected 1 arguments, but got 0" was misleading. The actual issue was in how the `onReset` prop (which uses `resetState`) was called in a child component. This function call is correct.
    resetState();
    setImageDataUrl(dataUrl);
    setIsCameraOpen(false);
    try {
      // Run analysis once to get curve data and raw (energy-less) peaks
      const { curveData, analysisResult } = await analyzeSpectrum(dataUrl, setAnalysisStatus);
      setSpectrumPoints(curveData);
      setInitialAnalysisResult(analysisResult); // Store raw peaks
      setAnalysisStatus('idle'); // Go back to idle for calibration phase
    } catch (e: any) {
        console.error(e);
        setAnalysisStatus('error');
        setErrorMessage(e.message || 'analysisError_generic');
    }
  };

  const togglePeakGroup = (peakIndex: number) => {
    setAnalysisResult(prev => {
        if (!prev) return null;
        const newPeaks = [...prev.detectedPeaks];
        const peak = newPeaks[peakIndex];
        if (!peak) return prev;

        if (peak.group === 'A') {
            peak.group = 'B';
        } else if (peak.group === 'B') {
            peak.group = undefined;
        } else {
            peak.group = 'A';
        }
        return { ...prev, detectedPeaks: newPeaks };
    });
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((step !== 'add' && step !== 'analyze') || !imageRef.current || (step === 'analyze' && !calibrationFunction)) return;
    if (step === 'analyze' && analysisStatus !== 'complete') return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const naturalX = Math.round((x / imageRef.current.offsetWidth) * imageRef.current.naturalWidth);
    
    setAdjusterInitialX(naturalX);

    if (step === 'add') {
        adjusterCallback.current = (preciseX: number) => {
            const pointOnCurve = spectrumPoints?.find(p => Math.round(p.x) === Math.round(preciseX));
            const preciseY = pointOnCurve ? pointOnCurve.y : (y / imageRef.current!.offsetHeight) * imageRef.current!.naturalHeight;
            setModalPosition({ x: preciseX, y: preciseY });
            setIsCalibrationModalOpen(true);
        };
    } else { // 'analyze'
        adjusterCallback.current = (preciseX: number) => {
            if (!calibrationFunction) return;
            const pointOnCurve = spectrumPoints?.find(p => Math.round(p.x) === Math.round(preciseX));
            const preciseY = pointOnCurve ? pointOnCurve.y : (y / imageRef.current!.offsetHeight) * imageRef.current!.naturalHeight;
            const energy = calibrationFunction.slope * preciseX + calibrationFunction.intercept;
            const newPeak: DetectedPeak = { x: preciseX, y: preciseY, energy, manual: true };
            // FIX: Added analysisType to the identifyPeaks call.
            const identified = identifyPeaks([energy], identificationTolerance, analysisType);
            const newMatches = identified.length > 0 ? identified[0].matches : [];

            setAnalysisResult(prev => {
                if (!prev) return null;
                const updatedPeaks = [...prev.detectedPeaks, newPeak];
                const updatedMatches = new Map(prev.nuclideMatches);
                updatedMatches.set(energy, newMatches);
                return { ...prev, detectedPeaks: updatedPeaks, nuclideMatches: updatedMatches };
            });
        };
    }
    setIsAdjusterOpen(true);
  };

  const handleCalibrationSubmit = (energy: number, uncertainty?: number) => {
    setCalibrationPoints(prev => [...prev, { ...modalPosition, energy, uncertainty }]);
    setIsCalibrationModalOpen(false);
  };
  
  const normalizedSpectrumData = useMemo(() => {
      if (!spectrumPoints) return [];
      const naturalHeight = imageRef.current?.naturalHeight || 1;
      return spectrumPoints.map(p => ({ x: p.x, y: naturalHeight - p.y }));
  }, [spectrumPoints, imageRef.current?.naturalHeight]);

  const runFullAnalysis = useCallback(() => {
    if (!initialAnalysisResult || !calibrationFunction) return;
    
    setAnalysisStatus('detecting'); // Using this status for "identifying"
    
    const autoPeaks = initialAnalysisResult.detectedPeaks;
    // Persist manual peaks across re-analysis
    const manualPeaks = (analysisResult?.detectedPeaks.filter(p => p.manual)) || [];
    
    const allPeaks = [...autoPeaks, ...manualPeaks];

    const peaksWithEnergy = allPeaks.map(p => {
        const energy = calibrationFunction.slope * p.x + calibrationFunction.intercept;
        const fwhm_keV = calculateFWHM(p.x, normalizedSpectrumData, calibrationFunction.slope);
        return {
            ...p,
            energy: energy,
            fwhm_keV: fwhm_keV,
        };
    });

    const peakEnergies = peaksWithEnergy.map(p => p.energy);
    // FIX: Added analysisType to the identifyPeaks call.
    const identificationResults = identifyPeaks(peakEnergies, identificationTolerance, analysisType);

    const nuclideMatches = new Map<number, any[]>();
    identificationResults.forEach(res => {
        nuclideMatches.set(res.inputEnergy_keV, res.matches);
    });
    
    setAnalysisResult({ detectedPeaks: peaksWithEnergy, nuclideMatches });
    setAnalysisStatus('complete');
  }, [initialAnalysisResult, analysisResult, calibrationFunction, identificationTolerance, analysisType, normalizedSpectrumData]);

  // FIX: This useEffect hook was refactored to use the updater form of setAnalysisResult,
  // which ensures it always has the latest state without needing `analysisResult` in the dependency array, thus preventing an infinite loop.
  useEffect(() => {
    // This effect handles re-identification when tolerance changes.
    if (analysisStatus === 'complete' && calibrationFunction) {
      setAnalysisResult(prev => {
        if (!prev) return null;

        const currentPeaks = prev.detectedPeaks;
        const peakEnergies = currentPeaks.map(p => p.energy);
        // FIX: Added analysisType to the identifyPeaks call.
        const identificationResults = identifyPeaks(peakEnergies, identificationTolerance, analysisType);

        const nuclideMatches = new Map<number, any[]>();
        identificationResults.forEach(res => {
          nuclideMatches.set(res.inputEnergy_keV, res.matches);
        });
        
        return { ...prev, nuclideMatches };
      });
    }
    // FIX: Added analysisType to the dependency array.
  }, [identificationTolerance, analysisStatus, calibrationFunction, analysisType]);


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (step !== 'analyze' || !imageRef.current || !spectrumPoints || spectrumPoints.length === 0 || !calibrationFunction) {
      setInteractivePoint(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const naturalX = (x / imageRef.current.offsetWidth) * imageRef.current.naturalWidth;
    
    const closestPoint = spectrumPoints.reduce((prev, curr) => 
      Math.abs(curr.x - naturalX) < Math.abs(prev.x - naturalX) ? curr : prev
    );
    
    const energy = calibrationFunction.slope * closestPoint.x + calibrationFunction.intercept;
    // FIX: Added analysisType to the identifyPeaks call.
    const identificationResults = identifyPeaks([energy], identificationTolerance, analysisType);
    const topMatch = identificationResults[0]?.matches[0];

    setInteractivePoint({
        point: closestPoint,
        eventCoords: { x, y },
        topMatch: topMatch,
    });
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-300">{t('spectrumAnalyzerTitle')}</h2>
        <div className="flex items-center space-x-2">
            <button onClick={onOpenPeakIdentifier} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-2 p-2 rounded-md bg-gray-800 border border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-4.5h-.75a.75.75 0 01-.75-.75zM8.25 4.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v11a.75.75 0 01-1.5 0v-10h-.75a.75.75 0 01-.75-.75zM14.25 7a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v8.5a.75.75 0 01-1.5 0v-7.5h-.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
                <span className="hidden sm:inline">{t('identifyPeaks')}</span>
            </button>
            <button onClick={onBack} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                <span>{t('backButton')}</span>
            </button>
        </div>
      </div>

      {!imageDataUrl ? (
        <div className="flex flex-col items-center justify-center space-y-6">
          <ImageUploader onImageLoaded={handleImageLoaded} t={t} />
          <div className="text-gray-400 font-semibold">{t('or')}</div>
          <button onClick={() => setIsCameraOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span>{t('useCamera')}</span>
          </button>
        </div>
      ) : (
        <AnalysisResults 
            imageSrc={imageDataUrl}
            imageRef={imageRef}
            analysisResult={analysisResult}
            spectrumPoints={spectrumPoints}
            calibrationFunction={calibrationFunction}
            interactivePoint={interactivePoint}
            t={t}
            analysisStatus={analysisStatus}
            step={step}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setInteractivePoint(null)}
            onImageClick={handleImageClick}
            onTogglePeakGroup={togglePeakGroup}
            sidebar={
                <CalibrationSidebar
                    imageLoaded={!!imageDataUrl}
                    step={step}
                    onStepChange={setStep}
                    calibrationPoints={calibrationPoints}
                    setCalibrationPoints={setCalibrationPoints}
                    calibrationFunction={calibrationFunction}
                    onCalibrationChange={setCalibrationFunction}
                    onLaunchAnalysis={runFullAnalysis}
                    analysisStatus={analysisStatus}
                    errorMessage={errorMessage}
                    identificationTolerance={identificationTolerance}
                    onIdentificationToleranceChange={setIdentificationTolerance}
                    onReset={resetState}
                    t={t}
                />
            }
        />
      )}

      {isCameraOpen && <CameraCapture onImageCaptured={handleImageLoaded} onClose={() => setIsCameraOpen(false)} t={t} />}
      <CalibrationPointModal isOpen={isCalibrationModalOpen} onClose={() => setIsCalibrationModalOpen(false)} onSubmit={handleCalibrationSubmit} t={t} />
      <PeakPositionAdjusterModal
        isOpen={isAdjusterOpen}
        onClose={() => setIsAdjusterOpen(false)}
        onConfirm={(preciseX) => {
            if (adjusterCallback.current) {
                adjusterCallback.current(preciseX);
            }
            setIsAdjusterOpen(false);
        }}
        spectrumData={normalizedSpectrumData}
        initialX={adjusterInitialX}
        xRange={20}
        energyFromX={(x) => calibrationFunction ? (calibrationFunction.slope * x + calibrationFunction.intercept) : 0}
        identificationTolerance={identificationTolerance}
        t={t}
        title={step === 'add' ? t('peakPositionAdjusterTitle') : t('addPeakManually')}
        confirmText={step === 'add' ? t('confirmPosition') : t('addPeak')}
        analysisType={analysisType}
      />
    </div>
  );
};

export default SpectrumAnalyzerPage;