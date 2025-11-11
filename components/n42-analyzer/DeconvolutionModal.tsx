import React, { useMemo, useEffect } from 'react';
import Card from '../Card';
import { ROI, N42Spectrum, DetectedPeak } from '../../types';
import { calculateFWHM } from '../../services/analysisHelpers';
import { identifyPeaks } from '../../services/peakIdentifierService';

interface DeconvolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (newPeaks: DetectedPeak[]) => void;
    roi: ROI | null;
    spectrum: N42Spectrum | null;
    t: any;
    identificationTolerance: number;
    analysisType: 'gamma' | 'alpha';
}

function findPeaksInROI(channelData: number[], roi: ROI): DetectedPeak[] {
    const peaks: DetectedPeak[] = [];
    if (channelData.length < 5 || !roi) return peaks;

    const data = channelData.slice(roi.startChannel, roi.endChannel + 1);
    const mean = data.reduce((a, b) => a + b) / data.length;
    const stdDev = Math.sqrt(data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / data.length);
    
    // More sensitive parameters for finding peaks in a small region
    const prominence = stdDev * 0.5;
    const threshold = mean;

    for (let i = 2; i < data.length - 2; i++) {
        const y = data[i];
        if (y > threshold && y > data[i - 1] && y >= data[i + 1]) {
            let leftMin = y;
            for (let j = i - 1; j >= 0; j--) {
                leftMin = Math.min(leftMin, data[j]);
                if (data[j] > y) break;
            }
            let rightMin = y;
            for (let j = i + 1; j < data.length; j++) {
                rightMin = Math.min(rightMin, data[j]);
                if (data[j] > y) break;
            }

            if (y - leftMin > prominence && y - rightMin > prominence) {
                const originalChannel = roi.startChannel + i;
                peaks.push({ x: originalChannel, y: channelData[originalChannel], energy: 0 });
            }
        }
    }
    return peaks;
}


const DeconvolutionModal: React.FC<DeconvolutionModalProps> = ({
    isOpen, onClose, onConfirm, roi, spectrum, t, identificationTolerance, analysisType
}) => {
    
    const deconvolutedPeaks = useMemo(() => {
        if (!roi || !spectrum) return [];
        
        const rawPeaks = findPeaksInROI(spectrum.channelData, roi);
        const { calibration } = spectrum;
        const fullSpectrumData = spectrum.channelData.map((y,x) => ({x, y}));

        return rawPeaks.map(p => {
            const energy = calibration.c * p.x ** 2 + calibration.b * p.x + calibration.a;
            const fwhm_keV = calculateFWHM(p.x, fullSpectrumData, calibration.b);
            return { ...p, energy, fwhm_keV };
        });
    }, [roi, spectrum]);

    if (!isOpen || !roi || !spectrum) return null;

    const handleConfirm = () => {
        onConfirm(deconvolutedPeaks);
    };

    const dataSlice = spectrum.channelData.slice(roi.startChannel, roi.endChannel + 1);
    const width = 600, height = 300, padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const xMin = roi.startChannel, xMax = roi.endChannel;
    const yMax = Math.max(...dataSlice) * 1.1;
    const toSvgX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * (width - padding.left - padding.right);
    const toSvgY = (y: number) => height - padding.bottom - (y / yMax) * (height - padding.top - padding.bottom);

    const path = dataSlice.map((y, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(roi.startChannel + i)} ${toSvgY(y)}`).join(' ');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl p-4" onClick={(e) => e.stopPropagation()}>
                <Card title={t('deconvolutionModalTitle')}>
                    <div className="space-y-4">
                        <h3 className="text-md font-semibold text-gray-300">{t('roiAnalysis')} [{roi.startChannel} - {roi.endChannel}]</h3>
                        <div className="bg-gray-900/50 p-2 rounded-md">
                            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                                <path d={path} stroke="#60a5fa" fill="rgba(96, 165, 250, 0.2)" strokeWidth="1.5" />
                                {deconvolutedPeaks.map((peak, idx) => (
                                    <line key={idx} x1={toSvgX(peak.x)} y1={toSvgY(peak.y)} x2={toSvgX(peak.x)} y2={height - padding.bottom} stroke="#f87171" strokeWidth="1" strokeDasharray="2 2" />
                                ))}
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold text-gray-300 mb-2">{t('peaksInRoi')}</h4>
                            <div className="max-h-40 overflow-y-auto bg-gray-900/50 p-2 rounded-md">
                                <table className="w-full text-xs text-left">
                                    <thead className="text-gray-400"><tr><th className="p-1">{t('energy_keV')}</th><th className="p-1">{t('counts')}</th></tr></thead>
                                    <tbody>
                                        {deconvolutedPeaks.map((peak, idx) => (
                                            <tr key={idx} className="border-t border-gray-700">
                                                <td className="p-1 font-mono">{peak.energy.toFixed(1)}</td>
                                                <td className="p-1 font-mono">{peak.y.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                            <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                            <button onClick={handleConfirm} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">{t('confirmDeconvolution')}</button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DeconvolutionModal;