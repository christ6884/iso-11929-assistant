import React, { useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import Card from '../Card';
import { N42Spectrum } from '../../types';

interface ComparisonPlotProps {
    spectrumA: N42Spectrum;
    spectrumB: N42Spectrum;
    timeA: number;
    timeB: number;
    normalization: 'none' | 'time';
    t: any;
}

const ComparisonPlot: React.FC<ComparisonPlotProps> = ({ 
    spectrumA, spectrumB, timeA, timeB, normalization, t
}) => {
    const [logScale, setLogScale] = useState(true);
    const [hoverInfo, setHoverInfo] = useState<{ x: number, y: number, channel: number, energy: number, countsA: number, countsB: number } | null>(null);

    const energyFromChannelA = (ch: number) => spectrumA.calibration.c * ch**2 + spectrumA.calibration.b * ch + spectrumA.calibration.a;
    const energyFromChannelB = (ch: number) => spectrumB.calibration.c * ch**2 + spectrumB.calibration.b * ch + spectrumB.calibration.a;

    const getData = (spectrum: N42Spectrum, time: number) => {
        return normalization === 'time' && time > 0 
            ? spectrum.channelData.map(c => c / time)
            : spectrum.channelData;
    };

    const dataA = useMemo(() => getData(spectrumA, timeA), [spectrumA, timeA, normalization]);
    const dataB = useMemo(() => getData(spectrumB, timeB), [spectrumB, timeB, normalization]);

    const width = 800;
    const height = 450;
    const padding = { top: 50, right: 30, bottom: 50, left: 60 };
    
    // Assume both spectra have the same number of channels, plot against channel index
    const xMax = Math.max(dataA.length - 1, dataB.length - 1);
    
    const yMax = useMemo(() => {
        const maxA = dataA.reduce((max, v) => Math.max(max, v), -Infinity);
        const maxB = dataB.reduce((max, v) => Math.max(max, v), -Infinity);
        return Math.max(maxA, maxB);
    }, [dataA, dataB]);

    const toSvgX = (x: number) => padding.left + (x / xMax) * (width - padding.left - padding.right);
    const svgToChannel = (svgX: number) => {
        return Math.round(((svgX - padding.left) / (width - padding.left - padding.right)) * xMax);
    }
    
    const toSvgY = (y: number) => {
        const plotHeight = height - padding.top - padding.bottom;
        if (yMax <= 0) return height - padding.bottom;
        if (logScale) {
            if (y <= 0) return height - padding.bottom;
            const logMax = Math.log10(yMax);
            if (logMax <= 0) return height - padding.bottom;
            const logY = Math.log10(y);
            return height - padding.bottom - ((logY / logMax) * plotHeight);
        }
        return height - padding.bottom - (y / yMax) * plotHeight;
    };

    const createPath = (data: number[]) => {
        if (data.length === 0) return '';
        let p = `M ${toSvgX(0)} ${toSvgY(data[0])}`;
        for (let i = 1; i < data.length; i++) {
            if (isFinite(data[i])) {
                p += ` L ${toSvgX(i)} ${toSvgY(data[i])}`;
            }
        }
        return p;
    };

    const pathA = useMemo(() => createPath(dataA), [dataA, logScale, yMax]);
    const pathB = useMemo(() => createPath(dataB), [dataB, logScale, yMax]);

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svg.getScreenCTM();
        if (ctm) {
            const svgP = pt.matrixTransform(ctm.inverse());
            const channel = svgToChannel(svgP.x);
            if (channel >= 0 && channel < xMax) {
                const countsA = dataA[channel];
                const countsB = dataB[channel];
                // Use energy from spectrum A as the reference for the x-axis display
                const energy = energyFromChannelA(channel);
                setHoverInfo({ x: e.clientX, y: e.clientY, channel, energy, countsA, countsB });
            }
        }
    };
    
    const handleMouseLeave = () => {
        setHoverInfo(null);
    };

    const yAxisLabel = normalization === 'time' ? t('countsPerSecond') : t('counts');

    return (
        <Card title={
            <div className="flex justify-between items-center">
                <span>{t('plotTitle')}</span>
                <div className="flex items-center space-x-4 text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={logScale} onChange={() => setLogScale(!logScale)} className="form-checkbox h-4 w-4 text-cyan-500" />
                        <span>{t('plotLogScale')}</span>
                    </label>
                </div>
            </div>
        }>
            <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                    <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(75, 85, 99, 0.8)" />
                    <text x={width/2} y={height - 15} textAnchor="middle" fill="#9ca3af" fontSize="14">{t('channel')}</text>

                    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="rgba(75, 85, 99, 0.8)" />
                    <text x={padding.left - 40} y={height/2} textAnchor="middle" transform={`rotate(-90 ${padding.left - 40} ${height/2})`} fill="#9ca3af" fontSize="14">{yAxisLabel}</text>
                    
                    <path d={pathB} stroke="#f97316" fill="none" strokeWidth="1.5" opacity="0.8" />
                    <path d={pathA} stroke="#38bdf8" fill="none" strokeWidth="1.5" />
                </svg>
                {hoverInfo && createPortal(
                    <div 
                        className="fixed bg-gray-900/80 text-white text-xs rounded py-1 px-2 pointer-events-none border border-gray-600 shadow-lg z-50"
                        style={{ top: hoverInfo.y + 15, left: hoverInfo.x + 15 }}
                    >
                        <div>{t('channel')}: {hoverInfo.channel}</div>
                        <div>{t('energy_keV')}: {hoverInfo.energy.toFixed(1)}</div>
                        <div className="mt-1 pt-1 border-t border-gray-700">
                            <div className="text-sky-400">{t('spectrumA')}: {hoverInfo.countsA?.toPrecision(3)}</div>
                            <div className="text-orange-400">{t('spectrumB')}: {hoverInfo.countsB?.toPrecision(3)}</div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
             <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm mt-4">
                <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-sky-400 mr-2"></div>{t('spectrumA')}</div>
                <div className="flex items-center"><div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>{t('spectrumB')}</div>
            </div>
        </Card>
    );
};

export default ComparisonPlot;