import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { parseN42File } from '../services/n42ParserService';
import { ParsedN42Data, N42AnalysisResult, DetectedPeak, N42Spectrum, ROI } from '../types';
import { identifyPeaks } from '../services/peakIdentifierService';
import Card from '../components/Card';
import SpectrumPlot from '../components/n42-analyzer/SpectrumPlot';
import InfoTooltip from '../components/InfoTooltip';
import PeakPositionAdjusterModal from '../components/PeakPositionAdjusterModal';
import DeconvolutionModal from '../components/n42-analyzer/DeconvolutionModal';
import { calculateFWHM } from '../services/analysisHelpers';

// Peak finding algorithm for N42 data
function findPeaksFromN42(channelData: number[]): DetectedPeak[] {
    const peaks: DetectedPeak[] = [];
    if (channelData.length < 5) return peaks;
    const data = channelData;
    const mean = data.reduce((a, b) => a + b) / data.length;
    const stdDev = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / data.length);
    const prominence = stdDev * 1.5;
    const threshold = Math.max(mean, stdDev * 2.0);
    for (let i = 2; i < data.length - 2; i++) {
        const y = data[i];
        if (y > threshold && y > data[i - 1] && y >= data[i + 1] && y > data[i - 2] && y >= data[i + 2]) {
            let leftMin = y;
            for (let j = i - 1; j >= 0 && i - j < 50; j--) {
                leftMin = Math.min(leftMin, data[j]); if (data[j] > y) break;
            }
            let rightMin = y;
            for (let j = i + 1; j < data.length && j - i < 50; j++) {
                rightMin = Math.min(rightMin, data[j]); if (data[j] > y) break;
            }
            if (y - leftMin > prominence && y - rightMin > prominence) {
                peaks.push({ x: i, y: y, energy: 0 });
            }
        }
    }
    return peaks;
}

interface BackgroundSubtractionPageProps {
    t: any;
    onBack: () => void;
    onOpenPeakIdentifier: () => void;
    analysisType: 'gamma' | 'alpha';
}

const N42FileUploader: React.FC<{ onFileLoaded: (file: File, data: ParsedN42Data) => void, label: string, file: File | null }> = ({ onFileLoaded, label, file }) => {
    const handleFile = async (f: File) => {
        if (!f) return;
        try {
            const parsed = await parseN42File(f, (key: string) => key);
            onFileLoaded(f, parsed);
        } catch (e) {
            alert(`Error parsing file: ${e}`);
        }
    };
    return (
        <div className="text-center">
            <label htmlFor={`upload-${label}`} className="p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 w-full max-w-lg text-center border-gray-600 hover:border-indigo-500 hover:bg-gray-800 block">
                <input type="file" id={`upload-${label}`} className="hidden" accept=".n42" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
                <p className="font-semibold text-gray-300">{label}</p>
                <p className="text-xs text-gray-500">{file ? file.name : 'Select a file'}</p>
            </label>
        </div>
    );
}

const BackgroundSubtractionPage: React.FC<BackgroundSubtractionPageProps> = ({ t, onBack, analysisType, onOpenPeakIdentifier }) => {
    const [sampleFile, setSampleFile] = useState<File | null>(null);
    const [sampleData, setSampleData] = useState<ParsedN42Data | null>(null);
    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
    const [backgroundData, setBackgroundData] = useState<ParsedN42Data | null>(null);
    const [sampleTime, setSampleTime] = useState(60);
    const [backgroundTime, setBackgroundTime] = useState(600);
    const [error, setError] = useState<string | null>(null);
    const [netSpectrum, setNetSpectrum] = useState<N42Spectrum | null>(null);
    const [analysisResult, setAnalysisResult] = useState<N42AnalysisResult | null>(null);
    const [identificationTolerance, setIdentificationTolerance] = useState(2.0);

    const [isAdjusterOpen, setIsAdjusterOpen] = useState(false);
    const [adjusterInitialChannel, setAdjusterInitialChannel] = useState(0);
    const [isDeconvolutionModalOpen, setIsDeconvolutionModalOpen] = useState(false);
    const [selectedRoi, setSelectedRoi] = useState<ROI | null>(null);

    const handleCalculate = () => {
        setError(null);
        if (!sampleData || !backgroundData || sampleTime <= 0 || backgroundTime <= 0) {
            setError("Please load both files and set positive measurement times.");
            return;
        }

        const sampleSpec = sampleData.spectra[0];
        const bgSpec = backgroundData.spectra[0];

        if (sampleSpec.channelData.length !== bgSpec.channelData.length) {
            setError(t('error_channelMismatch'));
            return;
        }

        const timeRatio = sampleTime / backgroundTime;
        const netChannelData = sampleSpec.channelData.map((sampleCounts, i) => {
            return sampleCounts - (bgSpec.channelData[i] * timeRatio);
        });

        const newNetSpectrum: N42Spectrum = {
            id: 'Net Spectrum',
            channelData: netChannelData,
            calibration: sampleSpec.calibration,
        };
        setNetSpectrum(newNetSpectrum);
    };

    const runAnalysis = useCallback((existingPeaks: DetectedPeak[] = []) => {
        if (!netSpectrum) return;
        const { channelData, calibration } = netSpectrum;
        const spectrumDataForFwhm = channelData.map((y, x) => ({ x, y }));

        let peaksToIdentify = existingPeaks;
        if (peaksToIdentify.length === 0) {
            const detectedPeaksRaw = findPeaksFromN42(channelData);
            peaksToIdentify = detectedPeaksRaw.map(p => {
                const energy = calibration.c * p.x ** 2 + calibration.b * p.x + calibration.a;
                const fwhm_keV = calculateFWHM(p.x, spectrumDataForFwhm, calibration.b);
                return { ...p, energy, fwhm_keV };
            });
        }
        
        const peakEnergies = peaksToIdentify.map(p => p.energy);
        const identificationResults = identifyPeaks(peakEnergies, identificationTolerance, analysisType);

        const nuclideMatches = new Map<number, any[]>();
        identificationResults.forEach(res => {
            nuclideMatches.set(res.inputEnergy_keV, res.matches);
        });

        setAnalysisResult({ peaks: peaksToIdentify, nuclideMatches });
    }, [netSpectrum, identificationTolerance, analysisType]);

    useEffect(() => {
        if (netSpectrum) {
            runAnalysis();
        }
    }, [netSpectrum, runAnalysis]);
    
    const togglePeakGroup = (peakIndex: number) => {
        setAnalysisResult(prev => {
            if (!prev) return null;
            const newPeaks = [...prev.peaks];
            const peak = newPeaks[peakIndex];
            if (peak.group === 'A') peak.group = 'B';
            else if (peak.group === 'B') peak.group = undefined;
            else peak.group = 'A';
            return { ...prev, peaks: newPeaks };
        });
    };

    const handleAddPeakAtChannel = (channel: number) => {
      if (!netSpectrum) return;
      const { calibration, channelData } = netSpectrum;
      const energy = calibration.c * channel**2 + calibration.b * channel + calibration.a;
      const fwhm_keV = calculateFWHM(channel, channelData.map((y, x) => ({ x, y })), calibration.b);
      
      const newPeak: DetectedPeak = { x: channel, y: channelData[channel], energy: energy, manual: true, fwhm_keV };
      setAnalysisResult(prev => {
          const peaks = prev ? [...prev.peaks, newPeak] : [newPeak];
          const nuclideMatches = prev ? new Map(prev.nuclideMatches) : new Map();
          const newIdentification = identifyPeaks([energy], identificationTolerance, analysisType);
          if (newIdentification[0]) nuclideMatches.set(energy, newIdentification[0].matches);
          return { peaks, nuclideMatches };
      });
    };

    const handlePlotClick = (channel: number) => {
        setAdjusterInitialChannel(channel);
        setIsAdjusterOpen(true);
    };

    const handleRoiSelected = (roi: ROI) => {
        setSelectedRoi(roi);
        setIsDeconvolutionModalOpen(true);
    };

    const handleDeconvolutionConfirm = (newPeaks: DetectedPeak[]) => {
        setAnalysisResult(prev => {
            if (!prev || !selectedRoi) return prev;
            const existingPeaksOutsideRoi = prev.peaks.filter(p => p.x < selectedRoi.startChannel || p.x > selectedRoi.endChannel);
            const finalPeaks = [...existingPeaksOutsideRoi, ...newPeaks];
            const peakEnergies = finalPeaks.map(p => p.energy);
            const identificationResults = identifyPeaks(peakEnergies, identificationTolerance, analysisType);
            const nuclideMatches = new Map<number, any[]>();
            identificationResults.forEach(res => nuclideMatches.set(res.inputEnergy_keV, res.matches));
            return { peaks: finalPeaks, nuclideMatches };
        });
        setIsDeconvolutionModalOpen(false);
        setSelectedRoi(null);
    };

    const normalizedSpectrumData = useMemo(() => {
        return netSpectrum?.channelData.map((counts, ch) => ({ x: ch, y: counts })) || [];
    }, [netSpectrum]);

    const energyFromChannel = useCallback((ch: number) => {
        if (!netSpectrum) return 0;
        const { calibration } = netSpectrum;
        return calibration.c * ch**2 + calibration.b * ch + calibration.a;
    }, [netSpectrum]);

    const resetAll = () => {
        setSampleFile(null);
        setSampleData(null);
        setBackgroundFile(null);
        setBackgroundData(null);
        setSampleTime(60);
        setBackgroundTime(600);
        setError(null);
        setNetSpectrum(null);
        setAnalysisResult(null);
    };

    if (netSpectrum) {
        return (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-300">{t('netSpectrumAnalysis')}</h2>
                    <button onClick={resetAll} className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                        <span>{t('startOver')}</span>
                    </button>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3">
                        <SpectrumPlot 
                            spectrum={netSpectrum} 
                            analysisResult={analysisResult} 
                            onTogglePeakGroup={togglePeakGroup} 
                            onPlotClick={handlePlotClick}
                            onRoiSelected={handleRoiSelected}
                            t={t} 
                            clippingLevel={1.0} 
                            yZoom={1.0} 
                            identificationTolerance={identificationTolerance} 
                            analysisType={analysisType} 
                        />
                    </div>
                     <div className="lg:col-span-1">
                        <Card title={t('analysisResultsTitle')}>
                             <label className="text-sm text-gray-300 flex items-center space-x-2 mb-2"><span>{t('identificationTolerance')} (keV)</span><InfoTooltip text={t('identificationToleranceTooltip')} /></label>
                             <input type="number" value={identificationTolerance} onChange={(e) => setIdentificationTolerance(parseFloat(e.target.value) || 0)} step="0.1" min="0.1" className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white" />
                        </Card>
                    </div>
                     <div className="lg:col-span-2">
                        <Card title={t('detectedPeaksTitle')}>
                            <div className="max-h-[60vh] overflow-y-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="text-gray-400"><tr><th className="py-2 px-2">{t('energy_keV')}</th><th className="py-2 px-2">{t('fwhm_keV')}</th><th className="py-2 px-2">{t('counts')}</th><th className="py-2 px-2">{t('nuclidePossible')}</th><th className="py-2 px-2">{t('group')}</th></tr></thead>
                                    <tbody className="text-gray-200">
                                        {analysisResult?.peaks?.sort((a,b) => a.energy - b.energy).map((peak, idx) => {
                                            const match = analysisResult.nuclideMatches.get(peak.energy)?.[0];
                                            return (<tr key={idx} className="border-t border-gray-700">
                                                <td className="py-2 px-2 font-mono">{peak.energy.toFixed(1)}</td>
                                                <td className="py-2 px-2 font-mono text-gray-400">{peak.fwhm_keV?.toFixed(2) ?? '-'}</td>
                                                <td className="py-2 px-2 font-mono">{peak.y.toFixed(0)}</td>
                                                <td className="py-2 px-2">{match ? `${match.nuclide.name} (${match.line.energy_keV.toFixed(1)})` : '-'}</td>
                                                <td className="py-2 px-2 text-center">{peak.group}</td>
                                            </tr>);
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </div>
                 <PeakPositionAdjusterModal
                    isOpen={isAdjusterOpen}
                    onClose={() => setIsAdjusterOpen(false)}
                    onConfirm={(preciseChannel) => {
                        handleAddPeakAtChannel(Math.round(preciseChannel));
                        setIsAdjusterOpen(false);
                    }}
                    spectrumData={normalizedSpectrumData}
                    initialX={adjusterInitialChannel}
                    xRange={20}
                    energyFromX={energyFromChannel}
                    identificationTolerance={identificationTolerance}
                    t={t}
                    title={t('addPeakManually')}
                    confirmText={t('addPeak')}
                    analysisType={analysisType}
                />
                 <DeconvolutionModal
                    isOpen={isDeconvolutionModalOpen}
                    onClose={() => setIsDeconvolutionModalOpen(false)}
                    onConfirm={handleDeconvolutionConfirm}
                    roi={selectedRoi}
                    spectrum={netSpectrum}
                    t={t}
                    identificationTolerance={identificationTolerance}
                    analysisType={analysisType}
                />
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-300">{t('bkgSubtractionTitle')}</h2>
                <button onClick={onBack} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                    <span>{t('backButton')}</span>
                </button>
            </div>
            <Card title={t('inputs')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">{t('sampleSpectrum')}</h3>
                        <N42FileUploader onFileLoaded={(file, data) => { setSampleFile(file); setSampleData(data); }} label={t('uploadSample')} file={sampleFile} />
                        <label className="text-sm text-gray-300 mt-4 block mb-1">{t('sampleTime')}</label>
                        <input type="number" value={sampleTime} onChange={e => setSampleTime(parseFloat(e.target.value) || 0)} className="w-full bg-gray-700 p-2 rounded-md font-mono text-right" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">{t('backgroundSpectrum')}</h3>
                        <N42FileUploader onFileLoaded={(file, data) => { setBackgroundFile(file); setBackgroundData(data); }} label={t('uploadBackground')} file={backgroundFile} />
                        <label className="text-sm text-gray-300 mt-4 block mb-1">{t('bkg_sub_backgroundTime')}</label>
                        <input type="number" value={backgroundTime} onChange={e => setBackgroundTime(parseFloat(e.target.value) || 0)} className="w-full bg-gray-700 p-2 rounded-md font-mono text-right" />
                    </div>
                </div>
                {error && <p className="mt-4 text-red-400 text-center bg-red-900/30 p-3 rounded-md">{error}</p>}
                <div className="mt-6 flex justify-center">
                    <button onClick={handleCalculate} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg text-lg">
                        {t('calculateNetSpectrum')}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default BackgroundSubtractionPage;