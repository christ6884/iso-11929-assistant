import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import Card from '../Card';
import { N42Spectrum, N42AnalysisResult, DetectedPeak, ROI } from '../../types';
import { identifyPeaks } from '../../services/peakIdentifierService';
import InfoTooltip from '../InfoTooltip';

interface SpectrumPlotProps {
    spectrum: N42Spectrum;
    analysisResult: N42AnalysisResult | null;
    onTogglePeakGroup: (peakIndex: number) => void;
    onPlotClick: (channel: number) => void;
    onRoiSelected: (roi: ROI) => void;
    t: any;
    clippingLevel: number;
    yZoom: number;
    identificationTolerance: number;
    analysisType: 'gamma' | 'alpha';
}

const SpectrumPlot: React.FC<SpectrumPlotProps> = ({ 
    spectrum, analysisResult, onTogglePeakGroup, onPlotClick, onRoiSelected, t,
    clippingLevel, yZoom, identificationTolerance, analysisType
}) => {
    const [logScale, setLogScale] = useState(true);
    const [hoverInfo, setHoverInfo] = useState<{ x: number, y: number, channel: number, counts: number, energy: number } | null>(null);
    const [selectionBox, setSelectionBox] = useState<{ startX: number; endX: number } | null>(null);
    const isDragging = useRef(false);

    const { channelData, calibration } = spectrum;
    const energyFromChannel = (ch: number) => calibration.c * ch**2 + calibration.b * ch + calibration.a;

    const processedChannelData = useMemo(() => {
        if (channelData.length === 0) return [];
        const maxCounts = channelData.reduce((max, v) => Math.max(max, v), -Infinity);
        const clipThreshold = maxCounts * clippingLevel;
        return clippingLevel < 1.0 ? channelData.map(c => Math.min(c, clipThreshold)) : channelData;
    }, [channelData, clippingLevel]);

    const width = 800;
    const height = 450;
    const padding = { top: 50, right: 30, bottom: 50, left: 60 };

    const xMax = processedChannelData.length - 1;
    let yDataMax = processedChannelData.reduce((max, v) => isFinite(v) ? Math.max(max, v) : max, -Infinity);
    if(!isFinite(yDataMax)) {
      yDataMax = 1;
    }
    let yDisplayMax = yDataMax / yZoom;
    
    const toSvgX = (x: number) => padding.left + (x / xMax) * (width - padding.left - padding.right);
    const svgToChannel = (svgX: number) => {
        return Math.round(((svgX - padding.left) / (width - padding.left - padding.right)) * xMax);
    }
    
    const toSvgY = (y: number) => {
        const plotHeight = height - padding.top - padding.bottom;
        if (logScale) {
            if (y <= 0) {
                return height - padding.bottom; // Clamp to the x-axis for zero or negative counts
            }
            const logMax = Math.log10(yDisplayMax > 1 ? yDisplayMax : 1);
            if (logMax <= 0) { // If max is 1, everything is at the bottom
                return height - padding.bottom;
            }
            const logY = Math.log10(y);
            return height - padding.bottom - ((logY / logMax) * plotHeight);
        }
        // Linear scale
        return height - padding.bottom - (y / (yDisplayMax > 0 ? yDisplayMax : 1)) * plotHeight;
    };


    const path = useMemo(() => {
        if (processedChannelData.length === 0) return '';
        let p = `M ${toSvgX(0)} ${toSvgY(processedChannelData[0])}`;
        for (let i = 1; i < processedChannelData.length; i++) {
            p += ` L ${toSvgX(i)} ${toSvgY(processedChannelData[i])}`;
        }
        return p;
    }, [processedChannelData, logScale, yZoom]);

    const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        if ((e.target as SVGElement).closest('.peak-marker')) return;
        isDragging.current = true;
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svg.getScreenCTM();
        if (ctm) {
            const svgP = pt.matrixTransform(ctm.inverse());
            setSelectionBox({ startX: svgP.x, endX: svgP.x });
        }
    };
    
    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svg.getScreenCTM();
        if (ctm) {
            const svgP = pt.matrixTransform(ctm.inverse());
            if (isDragging.current && selectionBox) {
                setSelectionBox({ ...selectionBox, endX: svgP.x });
            }
            const channel = svgToChannel(svgP.x);
            if (channel >= 0 && channel < processedChannelData.length) {
                const counts = processedChannelData[channel];
                const energy = energyFromChannel(channel);
                setHoverInfo({ x: e.clientX, y: e.clientY, channel, counts, energy });
            }
        }
    };
    
    const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        
        const dragThreshold = 5; // To distinguish from a simple click
        if (selectionBox && Math.abs(selectionBox.endX - selectionBox.startX) > dragThreshold) {
            const startChannel = svgToChannel(Math.min(selectionBox.startX, selectionBox.endX));
            const endChannel = svgToChannel(Math.max(selectionBox.startX, selectionBox.endX));
            if (startChannel < endChannel) {
                onRoiSelected({ startChannel, endChannel });
            }
        } else {
             // It was a click, not a drag
            const channel = svgToChannel(selectionBox?.startX || 0);
             if (channel >= 0 && channel < channelData.length) {
                onPlotClick(channel);
            }
        }
        setSelectionBox(null);
    };
    
    const handleMouseLeave = () => {
        setHoverInfo(null);
        if (isDragging.current) {
            isDragging.current = false;
            setSelectionBox(null);
        }
    };

    const suggestedNuclide = useMemo(() => {
        if (!hoverInfo) return null;
        const matches = identifyPeaks([hoverInfo.energy], identificationTolerance, analysisType);
        return matches[0]?.matches[0]?.nuclide.name
    }, [hoverInfo, identificationTolerance, analysisType]);

    return (
        <Card title={
            <div className="flex justify-between items-center">
                <span>{t('plotTitle')}</span>
                <div className="flex items-center space-x-4 text-sm">
                    <InfoTooltip text={t('roiSelectionTooltip')} />
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={logScale} onChange={() => setLogScale(!logScale)} className="form-checkbox h-4 w-4 text-cyan-500" />
                        <span>{t('plotLogScale')}</span>
                    </label>
                </div>
            </div>
        }>
            <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto cursor-crosshair" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave}>
                    {/* Axes and Grid */}
                    <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(75, 85, 99, 0.8)" />
                    <text x={width/2} y={height - 15} textAnchor="middle" fill="#9ca3af" fontSize="14">{`${t('channel')}`}</text>

                    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="rgba(75, 85, 99, 0.8)" />
                    <text x={padding.left - 40} y={height/2} textAnchor="middle" transform={`rotate(-90 ${padding.left - 40} ${height/2})`} fill="#9ca3af" fontSize="14">{t('counts')}</text>
                    
                    {/* Spectrum Path */}
                    <path d={path} stroke="#60a5fa" fill="none" strokeWidth="1.5" />
                    
                    {/* Selection Box */}
                    {selectionBox && (
                        <rect
                            x={Math.min(selectionBox.startX, selectionBox.endX)}
                            y={padding.top}
                            width={Math.abs(selectionBox.endX - selectionBox.startX)}
                            height={height - padding.top - padding.bottom}
                            fill="rgba(0, 191, 255, 0.2)"
                            stroke="rgba(0, 191, 255, 0.6)"
                            strokeWidth="1"
                        />
                    )}

                    {/* Peak Markers */}
                    {analysisResult?.peaks.map((peak, idx) => {
                        const sx = toSvgX(peak.x);
                        const sy = toSvgY(peak.y);
                        const group = peak.group;
                        const color = group === 'A' ? '#fb923c' : group === 'B' ? '#c084fc' : peak.manual ? '#34d399' : '#f87171';
                        const peakLabel = peak.energy.toFixed(1);
                        // Stagger labels to prevent overlap
                        const yOffset = (idx % 2 === 0) ? -15 : -30;
                        
                        return (
                            <g key={idx} className="peak-marker cursor-pointer" onClick={(e) => { e.stopPropagation(); onTogglePeakGroup(idx);}}>
                                <line x1={sx} y1={height - padding.bottom} x2={sx} y2={sy} stroke={color} strokeWidth="1" strokeDasharray="3 2" />
                                <circle cx={sx} cy={sy} r="4" fill={color} />
                                 <text x={sx} y={sy + yOffset} textAnchor="middle" fill={color} fontSize="10" fontWeight="bold">{peakLabel}</text>
                                 <rect x={sx-15} y={sy-40} width="30" height="35" fill="transparent"/>
                            </g>
                        );
                    })}

                    {/* Clipping Warning */}
                    {clippingLevel < 1.0 && (
                        <text x={padding.left + 10} y={padding.top - 10} fill="#facc15" fontSize="12" fontWeight="bold">{t('clippingWarning')}</text>
                    )}
                </svg>
                {hoverInfo && createPortal(
                    <div 
                        className="fixed bg-gray-900/80 text-white text-xs rounded py-1 px-2 pointer-events-none border border-gray-600 shadow-lg z-50"
                        style={{ top: hoverInfo.y + 15, left: hoverInfo.x + 15 }}
                    >
                        <div>{t('channel')}: {hoverInfo.channel}</div>
                        <div>{t('energy')}: {hoverInfo.energy.toFixed(1)} keV</div>
                        <div>{t('counts')}: {hoverInfo.counts.toLocaleString()}</div>
                        {suggestedNuclide && <div className="mt-1 pt-1 border-t border-gray-700">{t('suggestedNuclide')}: {suggestedNuclide}</div>}
                    </div>,
                    document.body
                )}
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">{t('n42PeakAddInstruction')}</p>
        </Card>
    );
};

export default SpectrumPlot;
