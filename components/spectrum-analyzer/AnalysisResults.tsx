import React, { useLayoutEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import Card from '../Card';
import { AnalysisResult, Point, CalibrationFunction, InteractivePeak, DetectedPeak } from '../../types';
import InfoTooltip from '../InfoTooltip';

interface AnalysisResultsProps {
  imageSrc: string;
  imageRef: React.RefObject<HTMLImageElement>;
  analysisResult: AnalysisResult | null;
  spectrumPoints: Point[] | null;
  calibrationFunction: CalibrationFunction | null;
  interactivePoint: InteractivePeak | null;
  sidebar: React.ReactNode;
  t: any;
  analysisStatus: 'idle' | 'extracting' | 'detecting' | 'complete' | 'error';
  step: 'add' | 'validate' | 'analyze';
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
  onImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onTogglePeakGroup: (peakIndex: number) => void;
}

const Marker: React.FC<{ position: Point, text: string, type: 'auto' | 'manual', group?: 'A' | 'B' }> = ({ position, text, type, group }) => {
    let color, textColor;
    if (group === 'A') {
        color = 'border-orange-400';
        textColor = 'text-orange-400';
    } else if (group === 'B') {
        color = 'border-purple-400';
        textColor = 'text-purple-400';
    } else {
        color = type === 'auto' ? 'border-red-500' : 'border-green-400';
        textColor = type === 'auto' ? 'text-red-400' : 'text-green-400';
    }
    return (
        <div className="absolute" style={{ transform: 'translate(-50%, -100%)' }}>
            <div className={`relative px-2 py-1 text-xs font-bold ${textColor} bg-gray-900/70 rounded-md cursor-pointer`}>
                {text}
                <div className={`absolute left-1/2 w-px h-4 bg-gray-400 -bottom-4`}></div>
            </div>
        </div>
    );
};

const Cursor: React.FC<{ position: Point }> = ({ position }) => (
    <div 
        className="absolute w-4 h-4 border border-cyan-400 rounded-full pointer-events-none"
        style={{ left: position.x, top: position.y, transform: 'translate(-50%, -50%)' }}
    />
);

const Tooltip: React.FC<{ eventCoords: Point, text: string }> = ({ eventCoords, text }) => {
    const el = (
        <div 
            className="fixed bg-gray-900/80 text-white text-xs rounded py-1 px-2 pointer-events-none border border-gray-600 shadow-lg z-50 whitespace-pre-wrap"
            style={{ top: eventCoords.y + 15, left: eventCoords.x + 15 }}
        >
            {text}
        </div>
    );
    return createPortal(el, document.body);
};


const AnalysisResults: React.FC<AnalysisResultsProps> = ({
    imageSrc, imageRef, analysisResult, spectrumPoints, calibrationFunction, interactivePoint, sidebar, t,
    analysisStatus, step,
    onMouseMove, onMouseLeave, onImageClick, onTogglePeakGroup
}) => {
  const [imageSize, setImageSize] = useState<{ width: number; height: number; naturalWidth: number; naturalHeight: number } | null>(null);

  useLayoutEffect(() => {
    if (imageRef.current) {
        const updateSize = () => {
            if (imageRef.current) {
                setImageSize({
                    width: imageRef.current.offsetWidth,
                    height: imageRef.current.offsetHeight,
                    naturalWidth: imageRef.current.naturalWidth,
                    naturalHeight: imageRef.current.naturalHeight,
                });
            }
        };
        const img = imageRef.current;
        img.onload = updateSize;
        if (img.complete) {
            updateSize();
        }
        const resizeObserver = new ResizeObserver(updateSize);
        resizeObserver.observe(img);
        return () => {
            img.onload = null;
            resizeObserver.disconnect();
        }
    }
  }, [imageRef, imageSrc]);

  const getScreenCoords = (point: Point): Point | null => {
    if (!imageSize || imageSize.naturalWidth === 0 || imageSize.naturalHeight === 0) return null;
    const x = (point.x / imageSize.naturalWidth) * imageSize.width;
    const y = (point.y / imageSize.naturalHeight) * imageSize.height;
    return { x, y };
  };

  const renderPeakRow = (peak: DetectedPeak, index: number) => {
    const matches = analysisResult?.nuclideMatches.get(peak.energy) || [];
    return (
        <React.Fragment key={`${peak.energy}-${index}`}>
            <tr className="border-t border-gray-700 print:border-gray-300">
                <td className="py-2 px-3 font-mono print:text-black">
                    <span className={`font-semibold text-sm ${peak.manual ? 'text-green-300' : 'text-cyan-300'} print:text-black print:font-bold`}>
                        {peak.energy.toFixed(2)}
                    </span>
                </td>
                <td className="py-2 px-3 font-mono text-gray-400 print:text-black">
                    {peak.fwhm_keV?.toFixed(2) ?? '-'}
                </td>
                <td className="py-2 px-3 text-center font-semibold" style={{ color: peak.group === 'A' ? '#fb923c' : peak.group === 'B' ? '#c084fc' : 'inherit' }}>
                    {peak.group}
                </td>
                <td colSpan={3} className="py-2 px-3">
                    {matches.length > 0 ? (
                        matches.slice(0, 3).map((match, matchIndex) => (
                            <div key={matchIndex} className={`grid grid-cols-3 gap-2 ${matchIndex > 0 ? 'mt-1 pt-1 border-t border-gray-800 print:border-gray-400' : ''}`}>
                                <span className="font-bold text-gray-100 col-span-1 print:text-black">{match.nuclide.name}</span>
                                <span className="font-mono text-gray-200 text-right print:text-black">{match.line.energy_keV.toFixed(2)}</span>
                                <span className="font-mono text-gray-300 text-right print:text-black">{match.line.intensity_percent.toFixed(2)}%</span>
                            </div>
                        ))
                    ) : (
                        <span className="text-gray-500 print:text-black">{t('noNuclidesFound')}</span>
                    )}
                </td>
            </tr>
        </React.Fragment>
    )
  };


  return (
    <div className="mt-6">
        <Card 
            title={
                <div className="flex justify-between items-center">
                    <span>{t('analysisResultsTitle')}</span>
                    <button onClick={() => window.print()} className="no-print text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                        <span>{t('printReport')}</span>
                    </button>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-container">
                <div className="lg:col-span-2 relative" onClick={onImageClick}>
                    <img 
                        ref={imageRef} 
                        src={imageSrc} 
                        alt="Spectrum" 
                        className={`w-full h-auto rounded-lg print-img ${step === 'add' || (analysisStatus === 'complete' && spectrumPoints) ? 'cursor-crosshair' : ''}`}
                    />
                    {step === 'analyze' && (analysisStatus === 'complete' && spectrumPoints && spectrumPoints.length > 0) && (
                        <div 
                            className="absolute inset-0 cursor-crosshair no-print"
                            onMouseMove={onMouseMove}
                            onMouseLeave={onMouseLeave}
                        >
                            {analysisResult?.detectedPeaks.map((peak, index) => {
                                const screenCoords = getScreenCoords(peak);
                                if (!screenCoords) return null;
                                return (
                                    <div 
                                        key={`peak-wrapper-${index}`}
                                        className="absolute cursor-pointer"
                                        style={{ left: screenCoords.x, top: screenCoords.y }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTogglePeakGroup(index);
                                        }}
                                    >
                                        <Marker 
                                            position={{x:0, y:0}} 
                                            text={peak.energy.toFixed(1)} 
                                            type={peak.manual ? 'manual' : 'auto'} 
                                            group={peak.group}
                                        />
                                    </div>
                                );
                            })}
                            
                            {interactivePoint && (() => {
                                const screenCoords = getScreenCoords(interactivePoint.point);
                                if (!screenCoords || !calibrationFunction) return null;
                                const energy = calibrationFunction.slope * interactivePoint.point.x + calibrationFunction.intercept;
                                
                                let tooltipText = `${energy.toFixed(1)} keV`;
                                if (interactivePoint.topMatch) {
                                    tooltipText += `\n~ ${interactivePoint.topMatch.nuclide.name}`;
                                }

                                return <>
                                    <Cursor position={screenCoords} />
                                    <Tooltip eventCoords={{x: interactivePoint.eventCoords.x + (imageRef.current?.getBoundingClientRect().left ?? 0) , y: interactivePoint.eventCoords.y + (imageRef.current?.getBoundingClientRect().top ?? 0)}} text={tooltipText} />
                                </>;
                            })()}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 print-table-container">
                    {analysisStatus === 'complete' ? (
                        <div className="print-text-black">
                             <div className="bg-gray-900/50 p-3 rounded-md mb-4 no-print text-sm text-gray-400 flex items-start space-x-2">
                                <InfoTooltip text={t('interactiveModeTooltip')}/>
                                <span>{t('analysisComplete')}</span>
                             </div>
                            <h3 className="text-md font-semibold text-gray-300 mb-2 print-text-black">{t('detectedPeaksTitle')}</h3>
                            {analysisResult && analysisResult.detectedPeaks.length > 0 ? (
                                <div className="max-h-[60vh] overflow-y-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="text-gray-400 print:text-black">
                                            <tr>
                                                <th className="py-2 px-3">{t('energy_keV')}</th>
                                                <th className="py-2 px-3">{t('fwhm_keV')}</th>
                                                <th className="py-2 px-3">{t('group')}</th>
                                                <th colSpan={3} className="py-2 px-3">{t('nuclide')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analysisResult.detectedPeaks.sort((a,b) => a.energy - b.energy).map(renderPeakRow)}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 print:text-black">{t('noPeaksDetected')}</p>
                            )}
                        </div>
                    ) : (
                        sidebar
                    )}
                </div>
            </div>
        </Card>
    </div>
  );
};

export default AnalysisResults;