import React, { useState, useEffect, useMemo } from 'react';
import Card from './Card';
import { identifyPeaks } from '../services/peakIdentifierService';

interface PeakPositionAdjusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (preciseX: number) => void;
  spectrumData: { x: number; y: number }[];
  initialX: number;
  xRange: number;
  energyFromX: (x: number) => number;
  identificationTolerance: number;
  t: any;
  title: string;
  confirmText: string;
  analysisType: 'gamma' | 'alpha';
}

const PeakPositionAdjusterModal: React.FC<PeakPositionAdjusterModalProps> = ({
  isOpen, onClose, onConfirm, spectrumData, initialX, xRange, energyFromX, identificationTolerance, t, title, confirmText, analysisType
}) => {
  const [currentX, setCurrentX] = useState(initialX);

  useEffect(() => {
    if (isOpen) {
      setCurrentX(initialX);
    }
  }, [isOpen, initialX]);

  const dataSlice = useMemo(() => {
    if (!spectrumData || spectrumData.length === 0) return [];
    const min = initialX - xRange;
    const max = initialX + xRange;
    return spectrumData.filter(p => p.x >= min && p.x <= max);
  }, [spectrumData, initialX, xRange]);

  const { currentY, currentEnergy } = useMemo(() => {
    const point = spectrumData.find(p => Math.round(p.x) === Math.round(currentX));
    const y = point ? point.y : 0;
    const energy = energyFromX(currentX);
    return { currentY: y, currentEnergy: energy };
  }, [currentX, spectrumData, energyFromX]);
  
  const topMatch = useMemo(() => {
    if (currentEnergy <= 0) return null;
    const results = identifyPeaks([currentEnergy], identificationTolerance, analysisType);
    return results[0]?.matches[0] || null;
  }, [currentEnergy, identificationTolerance, analysisType]);

  const width = 500;
  const height = 250;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };

  const { xMin, xMax, yMin, yMax } = useMemo(() => {
    if (dataSlice.length === 0) return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 };
    let yMin = Infinity, yMax = -Infinity;
    dataSlice.forEach(p => {
        yMin = Math.min(yMin, p.y);
        yMax = Math.max(yMax, p.y);
    });
    return {
      xMin: initialX - xRange,
      xMax: initialX + xRange,
      yMin: yMin > 0 ? yMin * 0.9 : 0, // Give a little space at the bottom
      yMax: yMax * 1.1,
    };
  }, [dataSlice, initialX, xRange]);

  const toSvgX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * (width - padding.left - padding.right);
  const toSvgY = (y: number) => height - padding.bottom - ((y - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom);
  
  const path = useMemo(() => {
    if (dataSlice.length === 0) return '';
    let p = `M ${toSvgX(dataSlice[0].x)} ${toSvgY(dataSlice[0].y)}`;
    dataSlice.forEach(point => {
        p += ` L ${toSvgX(point.x)} ${toSvgY(point.y)}`;
    });
    return p;
  }, [dataSlice, xMin, xMax, yMin, yMax]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xl p-4" onClick={(e) => e.stopPropagation()}>
        <Card title={title}>
          <div className="space-y-4">
            {/* Zoomed Plot */}
            <div className="relative bg-gray-900/50 p-2 rounded-md">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                    <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(75, 85, 99, 0.8)" />
                    <text x={width/2} y={height - 10} textAnchor="middle" fill="#9ca3af" fontSize="12">{t('channel')}</text>
                    <path d={path} stroke="#60a5fa" fill="none" strokeWidth="2" />
                    {/* Cursor */}
                    <line 
                        x1={toSvgX(currentX)} y1={padding.top} 
                        x2={toSvgX(currentX)} y2={height - padding.bottom} 
                        stroke="#f87171" strokeWidth="1.5" strokeDasharray="4 2" 
                    />
                    <circle cx={toSvgX(currentX)} cy={toSvgY(currentY)} r="5" fill="none" stroke="#f87171" strokeWidth="2" />
                </svg>
            </div>

            {/* Slider */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">{t('adjustChannel')}</label>
              <input
                type="range"
                min={initialX - xRange}
                max={initialX + xRange}
                value={currentX}
                onChange={(e) => setCurrentX(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            {/* Info Display */}
            <div className="bg-gray-700/50 p-3 rounded-md grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                <div>
                    <div className="text-xs text-gray-400">{t('channel')}</div>
                    <div className="font-mono text-cyan-300">{Math.round(currentX)}</div>
                </div>
                 <div>
                    <div className="text-xs text-gray-400">{t('counts')}</div>
                    <div className="font-mono text-cyan-300">{Math.round(currentY).toLocaleString()}</div>
                </div>
                 <div>
                    <div className="text-xs text-gray-400">{t('energy')}</div>
                    <div className="font-mono text-cyan-300">{currentEnergy.toFixed(1)} keV</div>
                </div>
                 <div>
                    <div className="text-xs text-gray-400">{t('suggestedNuclide')}</div>
                    <div className="font-mono text-cyan-300 truncate" title={topMatch ? topMatch.nuclide.name : '-'}>
                      {topMatch ? topMatch.nuclide.name : '-'}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
              <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
                {t('cancel')}
              </button>
              <button onClick={() => onConfirm(currentX)} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">
                {confirmText}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PeakPositionAdjusterModal;