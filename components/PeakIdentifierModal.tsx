import React, { useState, useEffect, useMemo } from 'react';
import Card from './Card.tsx';
import { PeakIdentificationResult, NuclideData } from '../types.ts';
import { identifyPeaks } from '../services/peakIdentifierService.ts';
import { nuclideLibrary } from '../services/gammaLibrary.ts';

interface PeakIdentifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: any;
}

const PeakIdentifierModal: React.FC<PeakIdentifierModalProps> = ({ isOpen, onClose, t }) => {
  const [mode, setMode] = useState<'energy' | 'nuclide'>('energy');
  
  // State for "By Energy" mode
  const [peakEnergiesText, setPeakEnergiesText] = useState('');
  const [tolerance, setTolerance] = useState(2.0);
  const [energyResults, setEnergyResults] = useState<PeakIdentificationResult[] | null>(null);
  
  // State for "By Nuclide" mode
  const [selectedNuclideName, setSelectedNuclideName] = useState<string>('');
  
  const [analysisType, setAnalysisType] = useState<'gamma' | 'alpha'>('gamma');

  const allNuclides = useMemo(() => nuclideLibrary.sort((a,b) => a.name.localeCompare(b.name)), []);
  const selectedNuclideData = useMemo(() => {
    return allNuclides.find(n => n.name === selectedNuclideName) || null;
  }, [selectedNuclideName, allNuclides]);

  useEffect(() => {
    if (isOpen) {
        // Reset state on open
        setPeakEnergiesText('');
        setEnergyResults(null);
        setSelectedNuclideName(allNuclides.length > 0 ? allNuclides[0].name : '');
    }
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, allNuclides]);

  if (!isOpen) return null;

  const handleIdentifyByEnergy = () => {
    const energies = peakEnergiesText
      .split('\n')
      .map(line => parseFloat(line.trim()))
      .filter(num => !isNaN(num) && num > 0);
    
    const identificationResults = identifyPeaks(energies, tolerance, analysisType);
    setEnergyResults(identificationResults);
  };
  
  const renderByEnergyMode = () => (
    <>
      <p className="text-sm text-gray-400">{t('peakIdentifierIntro')}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm text-gray-300 mb-1 block">{t('peakEnergiesLabel')}</label>
          <textarea
            value={peakEnergiesText}
            onChange={(e) => setPeakEnergiesText(e.target.value)}
            rows={6}
            className="w-full bg-gray-700 p-2 rounded-md font-mono text-sm text-white"
            placeholder="661.7&#10;1173.2&#10;1332.5"
          />
        </div>
        <div>
          <label className="text-sm text-gray-300 mb-1 block">{t('toleranceLabel')}</label>
          <input
            type="number"
            value={tolerance}
            onChange={(e) => setTolerance(parseFloat(e.target.value) || 0)}
            step="0.1"
            min="0.1"
            className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white"
          />
           <button 
              onClick={handleIdentifyByEnergy} 
              className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
              {t('identify')}
          </button>
        </div>
      </div>
      {energyResults && (
        <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="text-md font-semibold text-cyan-400 mb-2">{t('identificationResults')}</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {energyResults.map((result, index) => (
                    <div key={index} className="bg-gray-900/50 p-3 rounded-md">
                        <h4 className="font-semibold text-gray-300 mb-2">
                            {t('resultsForPeak').replace('{energy}', result.inputEnergy_keV.toFixed(2)).replace('{tolerance}', tolerance.toFixed(2))}
                        </h4>
                        {result.matches.length > 0 ? (
                            <table className="w-full text-xs text-left">
                                <thead className="text-gray-400"><tr><th className="py-1 px-2">{t('peakId_nuclide')}</th><th className="py-1 px-2 text-right">{t('lineEnergy')}</th><th className="py-1 px-2 text-right">{t('intensity')}</th><th className="py-1 px-2 text-right">{t('delta')}</th></tr></thead>
                                <tbody>{result.matches.map((match, i) => (<tr key={i} className="border-t border-gray-700"><td className="py-1 px-2 font-semibold text-cyan-300">{match.nuclide.name}</td><td className="py-1 px-2 font-mono text-right text-gray-300">{match.line.energy_keV.toFixed(2)}</td><td className="py-1 px-2 font-mono text-right text-gray-300">{match.line.intensity_percent.toFixed(2)}</td><td className={`py-1 px-2 font-mono text-right ${match.delta_keV >= 0 ? 'text-green-400' : 'text-red-400'}`}>{match.delta_keV.toFixed(2)}</td></tr>))}</tbody>
                            </table>
                        ) : (<p className="text-gray-500 text-sm">{t('noNuclidesFound')}</p>)}
                    </div>
                ))}
            </div>
        </div>
      )}
    </>
  );

  const renderByNuclideMode = () => (
    <>
      <label className="text-sm text-gray-300 mb-1 block">{t('searchNuclide')}</label>
      <select 
        value={selectedNuclideName} 
        onChange={e => setSelectedNuclideName(e.target.value)}
        className="w-full bg-gray-700 p-2 rounded-md text-white"
      >
        {allNuclides.map(n => <option key={n.name} value={n.name}>{n.name}</option>)}
      </select>
      {selectedNuclideData && (
        <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="text-md font-semibold text-cyan-400 mb-2">{t('emissionLines')}</h3>
            <div className="max-h-80 overflow-y-auto pr-2">
              <table className="w-full text-xs text-left">
                  <thead className="text-gray-400"><tr><th className="py-1 px-2">{t('lineEnergy')}</th><th className="py-1 px-2 text-right">{t('intensity')}</th><th className="py-1 px-2">{t('radiationType')}</th></tr></thead>
                  <tbody>
                      {selectedNuclideData.lines
                        .filter(line => line.type === analysisType)
                        .sort((a,b) => b.intensity_percent - a.intensity_percent)
                        .map((line, i) => (
                          <tr key={i} className="border-t border-gray-700">
                              <td className="py-1 px-2 font-mono text-cyan-300">{line.energy_keV.toFixed(2)}</td>
                              <td className="py-1 px-2 font-mono text-right text-gray-300">{line.intensity_percent.toFixed(3)}</td>
                              <td className="py-1 px-2 capitalize">{line.type}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <Card title={t('peakIdentifierTitle')}>
          <div className="space-y-4">
            {/* Mode Toggles */}
            <div className="flex bg-gray-800 rounded-md p-1 my-2 border border-gray-700">
                <button onClick={() => setMode('energy')} className={`flex-1 p-1 text-sm rounded ${mode === 'energy' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-600'}`}>{t('modeByEnergy')}</button>
                <button onClick={() => setMode('nuclide')} className={`flex-1 p-1 text-sm rounded ${mode === 'nuclide' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-600'}`}>{t('modeByNuclide')}</button>
            </div>
            
            <div className="flex bg-gray-700 rounded-md p-1 my-2">
                <button onClick={() => setAnalysisType('gamma')} className={`flex-1 p-1 text-sm rounded ${analysisType === 'gamma' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-600'}`}>{t('gammaAnalysis')}</button>
                <button onClick={() => setAnalysisType('alpha')} className={`flex-1 p-1 text-sm rounded ${analysisType === 'alpha' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-600'}`}>{t('alphaAnalysis')}</button>
            </div>
            
            {mode === 'energy' ? renderByEnergyMode() : renderByNuclideMode()}
            
            <div className="flex justify-end pt-4 border-t border-gray-700 mt-4">
              <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                {t('close')}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PeakIdentifierModal;