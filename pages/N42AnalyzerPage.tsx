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

interface N42AnalyzerPageProps {
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

const N42AnalyzerPage: React.FC<N42AnalyzerPageProps> = ({ t, onBack, analysisType, onOpenPeakIdentifier }) => {
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
            runAnalysis(finalPeaks); // Re-run full analysis and identification
            return prev; // Let runAnalysis handle the state update
        });
        setIsDeconvolutionModalOpen(false);
        setSelectedRoi(null);
    };

    const normalizedSpectrumData = useMemo(() => {
        return selectedSpectrum?.channelData.map((counts, ch) => ({ x: ch, y: counts })) || [];
    }, [selectedSpectrum]);

    const energyFromChannel = useCallback((ch: number) => {
        if (!selectedSpectrum) return 0;
        const { calibration } = selectedSpectrum;
        return calibration.c * ch**2 + calibration.b * ch + calibration.a;
    }, [selectedSpectrum]);

    const resetAll = () => {
        setFile(null);
        setParsedData(null);
        setSelectedSpectrumId(null);
        setAnalysisResult(null);
    };

    const handleExportCsv = () => {
        if (!selectedSpectrum || !file) return;
        const { channelData, calibration } = selectedSpectrum;
        const energyFromChannel = (ch: number) => calibration.c * ch**2 + calibration.b * ch + calibration.a;
    
        const header = "Channel,Energy_keV,Counts\n";
        const csvContent = channelData.map((counts, channel) => {
            const energy = energyFromChannel(channel);
            return `${channel},${energy.toFixed(3)},${counts}`;
        }).join('\n');
    
        const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const fileName = file.name.replace(/\.n42$/i, '_spectrum.csv');
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    if (!parsedData) {
         return (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-300">{t('n42AnalyzerTitle')}</h2>
                    <button onClick={onBack} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                        <span>{t('backButton')}</span>
                    </button>
                </div>
                <div className="flex justify-center mt-10">
                    <N42FileUploader onFileLoaded={handleFileLoaded} label={t('uploadN42File')} file={file} />
                </div>
            </div>
        );
    }

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-300">{t('n42AnalyzerTitle')}</h2>
                <div className="flex items-center space-x-4">
                    <button onClick={onOpenPeakIdentifier} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-2 p-2 rounded-md bg-gray-800 border border-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0v-4.5h-.75a.75.75 0 01-.75-.75zM8.25 4.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v11a.75.75 0 01-1.5 0v-10h-.75a.75.75 0 01-.75-.75zM14.25 7a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v8.5a.75.75 0 01-1.5 0v-7.5h-.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
                        <span className="hidden sm:inline">{t('identifyPeaks')}</span>
                    </button>
                    <button onClick={resetAll} className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                        <span>{t('startOver')}</span>
                    </button>
                </div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    {selectedSpectrum && 
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
                    }
                </div>
                 <div className="lg:col-span-1">
                    <Card title={t('fileInfoAndSettings')}>
                        <div className="space-y-3">
                            <div><strong>{t('instrument')}:</strong> {parsedData.metadata.instrument}</div>
                            <div><strong>{t('timestamp')}:</strong> {parsedData.metadata.timestamp}</div>
                            <div><strong>{t('liveTime')}:</strong> {parsedData.metadata.liveTime}</div>
                            <div><strong>{t('realTime')}:</strong> {parsedData.metadata.realTime}</div>
                            <div className="pt-2 border-t border-gray-700">
                                <label className="text-sm text-gray-300 block mb-1">{t('selectSpectrum')}</label>
                                <select value={selectedSpectrumId || ''} onChange={e => setSelectedSpectrumId(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white">
                                    {parsedData.spectra.map(s => <option key={s.id} value={s.id}>{s.id}</option>)}
                                </select>
                            </div>
                            <div className="pt-2 border-t border-gray-700">
                                <label className="text-sm text-gray-300 flex items-center space-x-2 mb-1"><span>{t('identificationTolerance')} (keV)</span><InfoTooltip text={t('identificationToleranceTooltip')} /></label>
                                <input type="number" value={identificationTolerance} onChange={(e) => setIdentificationTolerance(parseFloat(e.target.value) || 0)} step="0.1" min="0.1" className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white" />
                            </div>
                            <div className="pt-2 border-t border-gray-700">
                                <label className="text-sm text-gray-300 flex items-center space-x-2 mb-1"><span>{t('yAxisZoom')}</span><InfoTooltip text={t('yAxisZoomTooltip')} /></label>
                                <input type="range" min="1" max="100" step="1" value={yZoom} onChange={e => setYZoom(parseFloat(e.target.value))} className="w-full" />
                            </div>
                             <div className="pt-2 border-t border-gray-700">
                                <label className="text-sm text-gray-300 flex items-center space-x-2 mb-1"><span>{t('yAxisClipping')}</span><InfoTooltip text={t('yAxisClippingTooltip')} /></label>
                                <input type="range" min="0.1" max="1" step="0.01" value={clippingLevel} onChange={e => setClippingLevel(parseFloat(e.target.value))} className="w-full" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <button 
                                onClick={handleExportCsv} 
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center justify-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                <span>{t('exportCsv')}</span>
                            </button>
                        </div>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card title={t('detectedPeaksTitle')}>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="text-gray-400"><tr><th className="py-2 px-2">{t('energy_keV')}</th><th className="py-2 px-2">{t('fwhm_keV')}</th><th className="py-2 px-2">{t('counts')}</th><th className="py-2 px-2">{t('nuclidePossible')}</th><th className="py-2 px-2">{t('group')}</th></tr></thead>
                                <tbody className="text-gray-200">
                                    {analysisResult?.peaks
                                        ?.map((peak, originalIndex) => ({ peak, originalIndex }))
                                        .sort((a,b) => a.peak.energy - b.peak.energy)
                                        .map(({peak, originalIndex}) => {
                                            const match = analysisResult.nuclideMatches.get(peak.energy)?.[0];
                                            return (<tr key={originalIndex} className="border-t border-gray-700">
                                                <td className="py-2 px-2 font-mono">{peak.energy.toFixed(1)}</td>
                                                <td className="py-2 px-2 font-mono text-gray-400">{peak.fwhm_keV?.toFixed(2) ?? '-'}</td>
                                                <td className="py-2 px-2 font-mono">{peak.y.toFixed(0)}</td>
                                                <td className="py-2 px-2">{match ? `${match.nuclide.name} (${match.line.energy_keV.toFixed(1)})` : '-'}</td>
                                                <td 
                                                    className="py-2 px-2 text-center font-semibold cursor-pointer"
                                                    style={{ color: peak.group === 'A' ? '#fb923c' : peak.group === 'B' ? '#c084fc' : 'inherit' }}
                                                    onClick={() => togglePeakGroup(originalIndex)}
                                                >
                                                    {peak.group || '-'}
                                                </td>
                                            </tr>);
                                        })}
                                </tbody>
                            </table>
                        </div>
                        {analysisResult && analysisResult.peaks.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-700 text-sm">
                                <h4 className="font-semibold text-gray-300 mb-2">{t('analyse_groups')}</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between"><span>{t('group_a_total')}:</span><span className="font-mono">{groupCounts.A.toFixed(0)}</span></div>
                                        <div className="flex justify-between"><span>{t('group_b_total')}:</span><span className="font-mono">{groupCounts.B.toFixed(0)}</span></div>
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
                spectrum={selectedSpectrum}
                t={t}
                identificationTolerance={identificationTolerance}
                analysisType={analysisType}
            />
        </div>
    );
};

export default N42AnalyzerPage;