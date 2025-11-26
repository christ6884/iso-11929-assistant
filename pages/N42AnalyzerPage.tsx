

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { parseN42File } from '../services/n42ParserService';
import { ParsedN42Data, N42AnalysisResult, DetectedPeak, N42Spectrum, ROI, N42AnalysisData } from '../types';
import { identifyPeaks } from '../services/peakIdentifierService';
import Card from '../components/Card';
import SpectrumPlot from '../components/n42-analyzer/SpectrumPlot';
import InfoTooltip from '../components/InfoTooltip';
import PeakPositionAdjusterModal from '../components/PeakPositionAdjusterModal';
import DeconvolutionModal from '../components/n42-analyzer/DeconvolutionModal';
import { calculateFWHM } from '../services/analysisHelpers';
import { getLocalizedNuclideName } from '../translations';

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

interface N42AnalyzerPageProps {
    t: any;
    onBack: () => void;
    onOpenPeakIdentifier: () => void;
    analysisType: 'gamma' | 'alpha';
    dataToLoad?: N42AnalysisData;
}

const N42FileUploader: React.FC<{ onFileLoaded: (file: File, data: ParsedN42Data) => void, label: string, file: File | null }> = ({ onFileLoaded, label, file }) => {
    const handleFile = async (f: File) => {
        if (!f) return;
        try {
            const parsed = await parseN42File(f, (key: string) => key);
            onFileLoaded(f, parsed);
        } catch (e: any) {
            alert(`Error parsing file: ${e.message}`);
        }
    };
    return (
        <div className="text-center">
            <label htmlFor={`upload-${label}`} className="p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 w-full max-w-lg text-center border-gray-600 hover:border-indigo-500 hover:bg-gray-800 block">
                <input type="file" id={`upload-${label}`} className="hidden" accept=".n42" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
                <p className="font-semibold text-gray-300">{label}</p>
                <p className="text-sm text-gray-500">{file ? file.name : 'Select a file'}</p>
            </label>
        </div>
    );
}

const N42AnalyzerPage: React.FC<N42AnalyzerPageProps> = ({ t, onBack, analysisType, onOpenPeakIdentifier, dataToLoad }) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ParsedN42Data | null>(null);
    const [selectedSpectrumId, setSelectedSpectrumId] = useState<string | null>(null);
    
    const [analysisResult, setAnalysisResult] = useState<N42AnalysisResult | null>(null);
    const [identificationTolerance, setIdentificationTolerance] = useState(2.0);

    const [isAdjusterOpen, setIsAdjusterOpen] = useState(false);
    const [adjusterInitialChannel, setAdjusterInitialChannel] = useState(0);
    const [isDeconvolutionModalOpen, setIsDeconvolutionModalOpen] = useState(false);
    const [selectedRoi, setSelectedRoi] = useState<ROI | null>(null);

    const [yZoom, setYZoom] = useState(1.0);
    const [clippingLevel, setClippingLevel] = useState(1.0);

    useEffect(() => {
        if (dataToLoad) {
            setParsedData(dataToLoad.parsedData);
            setSelectedSpectrumId(dataToLoad.selectedSpectrumId);
            setAnalysisResult(dataToLoad.analysisResult);
        }
    }, [dataToLoad]);

    const selectedSpectrum = useMemo(() => {
        return parsedData?.spectra.find(s => s.id === selectedSpectrumId) || null;
    }, [parsedData, selectedSpectrumId]);
    
    const groupCounts = useMemo(() => {
        if (!analysisResult) {
            return { A: 0, B: 0 };
        }
        const counts = { A: 0, B: 0 };
        analysisResult.peaks.forEach(peak => {
            const count = peak.y;
            if (peak.group === 'A') {
                counts.A += count;
            } else if (peak.group === 'B') {
                counts.B += count;
            }
        });
        return counts;
    }, [analysisResult]);

    const ratio = groupCounts.B > 0 ? groupCounts.A / groupCounts.B : null;

    const handleFileLoaded = (file: File, data: ParsedN42Data) => {
        setFile(file);
        setParsedData(data);
        if (data.spectra.length > 0) {
            setSelectedSpectrumId(data.spectra[0].id);
        }
    };

    const runAnalysis = useCallback((existingPeaks: DetectedPeak[] = []) => {
        if (!selectedSpectrum) return;
        const { channelData, calibration } = selectedSpectrum;
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
    }, [selectedSpectrum, identificationTolerance, analysisType]);

    useEffect(() => {
        if (selectedSpectrum) {
            runAnalysis();
        } else {
            setAnalysisResult(null);
        }
    }, [selectedSpectrum, runAnalysis]);

    const handleAddPeakAtChannel = (channel: number) => {
      if (!selectedSpectrum) return;
      const { calibration, channelData } = selectedSpectrum;
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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-300">{t('n42AnalyzerTitle')}</h2>
                <div className="flex space-x-2">
                    {parsedData && (
                        <button onClick={() => { setFile(null); setParsedData(null); setAnalysisResult(null); }} className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                            <span>{t('startOver')}</span>
                        </button>
                    )}
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

            {!parsedData ? (
                <Card title={t('uploadN42File')}>
                    <N42FileUploader onFileLoaded={handleFileLoaded} label={t('uploadN42File')} file={file} />
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Plot Section */}
                    <div className="lg:col-span-3">
                        {selectedSpectrum && (
                            <SpectrumPlot 
                                spectrum={selectedSpectrum} 
                                analysisResult={analysisResult} 
                                onTogglePeakGroup={togglePeakGroup}
                                onPlotClick={handlePlotClick}
                                onRoiSelected={handleRoiSelected}
                                t={t} 
                                clippingLevel={clippingLevel} 
                                yZoom={yZoom} 
                                identificationTolerance={identificationTolerance} 
                                analysisType={analysisType} 
                            />
                        )}
                    </div>

                    {/* Controls & Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card title={t('fileInfoAndSettings')}>
                            <div className="space-y-2 text-sm mb-4 bg-gray-900/50 p-2 rounded">
                                <div className="flex justify-between"><span className="text-gray-400">{t('instrument')}:</span> <span>{parsedData.metadata.instrument}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">{t('timestamp')}:</span> <span>{parsedData.metadata.timestamp}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">{t('realTime')}:</span> <span>{parsedData.metadata.realTime}</span></div>
                                {selectedSpectrum && <div className="flex justify-between"><span className="text-gray-400">{t('liveTime')}:</span> <span>{selectedSpectrum.liveTimeSeconds?.toFixed(2)} s</span></div>}
                            </div>

                            {parsedData.spectra.length > 1 && (
                                <div className="mb-4">
                                    <label className="text-sm text-gray-300 mb-1 block">{t('selectSpectrum')}</label>
                                    <select value={selectedSpectrumId || ''} onChange={e => setSelectedSpectrumId(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white">
                                        {parsedData.spectra.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-300 flex items-center space-x-2 mb-1">
                                        <span>{t('yAxisZoom')} (x{yZoom.toFixed(1)})</span>
                                        <InfoTooltip text={t('yAxisZoomTooltip')} />
                                    </label>
                                    <input type="range" min="1" max="50" step="0.1" value={yZoom} onChange={e => setYZoom(parseFloat(e.target.value))} className="w-full" />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 flex items-center space-x-2 mb-1">
                                        <span>{t('yAxisClipping')} ({(clippingLevel * 100).toFixed(0)}%)</span>
                                        <InfoTooltip text={t('yAxisClippingTooltip')} />
                                    </label>
                                    <input type="range" min="0.01" max="1" step="0.01" value={clippingLevel} onChange={e => setClippingLevel(parseFloat(e.target.value))} className="w-full" />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 flex items-center space-x-2 mb-1">
                                        <span>{t('identificationTolerance')} (keV)</span>
                                        <InfoTooltip text={t('identificationToleranceTooltip')} />
                                    </label>
                                    <input type="number" value={identificationTolerance} onChange={e => setIdentificationTolerance(parseFloat(e.target.value) || 0)} step="0.1" min="0.1" className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white" />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Peaks Table */}
                    <div className="lg:col-span-2">
                        <Card title={t('detectedPeaksTitle')}>
                            <div className="max-h-80 overflow-y-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="text-gray-400 bg-gray-900/50 sticky top-0">
                                        <tr>
                                            <th className="py-2 px-2">{t('energy_keV')}</th>
                                            <th className="py-2 px-2">{t('fwhm_keV')}</th>
                                            <th className="py-2 px-2">{t('counts')}</th>
                                            <th className="py-2 px-2">{t('nuclidePossible')}</th>
                                            <th className="py-2 px-2">{t('group')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-200">
                                        {analysisResult?.peaks.sort((a,b) => a.energy - b.energy).map((peak, idx) => {
                                            const matches = analysisResult.nuclideMatches.get(peak.energy) || [];
                                            return (
                                                <tr key={idx} className="border-t border-gray-700 hover:bg-gray-800 cursor-pointer" onClick={() => togglePeakGroup(idx)}>
                                                    <td className="py-2 px-2 font-mono text-cyan-300">{peak.energy.toFixed(2)}</td>
                                                    <td className="py-2 px-2 font-mono text-gray-400">{peak.fwhm_keV?.toFixed(2) ?? '-'}</td>
                                                    <td className="py-2 px-2 font-mono">{peak.y.toFixed(0)}</td>
                                                    <td className="py-2 px-2">
                                                        {matches.length > 0 ? (
                                                            matches.slice(0, 2).map((m, i) => (
                                                                <div key={i} className="truncate" title={`${m.nuclide.name} (${m.line.energy_keV.toFixed(1)})`}>
                                                                    {getLocalizedNuclideName(m.nuclide.name, t)} <span className="text-gray-500">({m.line.energy_keV.toFixed(1)})</span>
                                                                </div>
                                                            ))
                                                        ) : '-'}
                                                    </td>
                                                    <td className="py-2 px-2 text-center" style={{ color: peak.group === 'A' ? '#fb923c' : peak.group === 'B' ? '#c084fc' : 'inherit' }}>
                                                        {peak.group || '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {(!analysisResult?.peaks || analysisResult.peaks.length === 0) && (
                                            <tr><td colSpan={5} className="py-4 text-center text-gray-500">{t('noPeaksDetected')}</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {analysisResult && analysisResult.peaks.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-700 text-sm">
                                    <h4 className="font-semibold text-gray-300 mb-2">{t('analyse_groups')}</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <div className="flex justify-between"><span>{t('group_a_total')}:</span><span className="font-mono text-orange-400">{groupCounts.A.toFixed(0)}</span></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between"><span>{t('group_b_total')}:</span><span className="font-mono text-purple-400">{groupCounts.B.toFixed(0)}</span></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-cyan-300">
                                                <strong>{t('ratio_a_b')}:</strong>
                                                <strong className="font-mono">{ratio !== null ? ratio.toFixed(3) : 'N/A'}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {/* Modals */}
            <PeakPositionAdjusterModal
                isOpen={isAdjusterOpen}
                onClose={() => setIsAdjusterOpen(false)}
                onConfirm={(preciseChannel) => {
                    handleAddPeakAtChannel(Math.round(preciseChannel));
                    setIsAdjusterOpen(false);
                }}
                spectrumData={selectedSpectrum?.channelData.map((y, x) => ({ x, y })) || []}
                initialX={adjusterInitialChannel}
                xRange={30}
                energyFromX={(x) => selectedSpectrum ? (selectedSpectrum.calibration.c * x**2 + selectedSpectrum.calibration.b * x + selectedSpectrum.calibration.a) : 0}
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
                spectrum={selectedSpectrum}
                t={t}
                identificationTolerance={identificationTolerance}
                analysisType={analysisType}
            />
        </div>
    );
};

export default N42AnalyzerPage;