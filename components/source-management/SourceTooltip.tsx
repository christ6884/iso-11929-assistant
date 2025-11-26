import React from 'react';
import { createPortal } from 'react-dom';
import { Source } from '../../types';
import { radionuclides } from '../../services/radionuclides';
import { nuclideLibrary } from '../../services/gammaLibrary';

interface SourceTooltipProps {
    source: Source;
    position: { x: number; y: number };
    t: any;
}

const SourceTooltip: React.FC<SourceTooltipProps> = ({ source, position, t }) => {
    const nuclideData = Object.entries(radionuclides).flatMap(([type, nuclides]) =>
        nuclides.map(n => ({ ...n, type }))
    ).find(n => n.name === source.nuclide);
    
    const gammaData = nuclideLibrary.find(n => n.name === source.nuclide);

    const halfLifeYears = nuclideData ? (nuclideData.halfLifeSeconds / (365.25 * 24 * 3600)) : 0;
    
    const formatHalfLife = (years: number) => {
        if (years > 1000) return `${(years / 1e6).toPrecision(3)} M years`;
        if (years > 0.1) return `${years.toPrecision(3)} years`;
        return `${(years * 365.25).toPrecision(3)} days`;
    };
    
    // Get top 4 most intense gamma lines
    const mainGammaLines = gammaData?.lines
        .filter(line => line.type === 'gamma')
        .sort((a, b) => b.intensity_percent - a.intensity_percent)
        .slice(0, 4);

    const tooltipStyle: React.CSSProperties = {
        position: 'fixed',
        top: position.y + 15,
        left: position.x + 15,
        transform: 'translate(0, 0)',
        pointerEvents: 'none',
        zIndex: 100,
    };

    return createPortal(
        <div 
            style={tooltipStyle}
            className="w-72 bg-gray-900 text-white text-xs rounded py-2 px-3 border border-cyan-500 shadow-lg"
        >
            <h4 className="font-bold text-sm text-cyan-400 mb-2 border-b border-gray-700 pb-1">{source.name}</h4>
            <div className="space-y-1">
                 <div className="flex justify-between">
                    <span className="text-gray-400">{t('halfLife')}:</span>
                    <span className="font-mono">{nuclideData ? formatHalfLife(halfLifeYears) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">{t('radiationType')}:</span>
                    <span className="font-mono capitalize">{nuclideData?.type || 'N/A'}</span>
                </div>
                <div className="pt-1 mt-1 border-t border-gray-700">
                     <h5 className="text-gray-400 mb-1">{t('mainEnergyLines')}:</h5>
                     {mainGammaLines && mainGammaLines.length > 0 ? (
                         <ul className="space-y-0.5">
                            {mainGammaLines.map(line => (
                                <li key={line.energy_keV} className="flex justify-between font-mono">
                                    <span>{line.energy_keV.toFixed(1)} keV</span>
                                    <span className="text-gray-400">({line.intensity_percent.toFixed(2)}%)</span>
                                </li>
                            ))}
                         </ul>
                     ) : (
                        <p className="text-gray-500">{t('noSignificantGamma')}</p>
                     )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SourceTooltip;