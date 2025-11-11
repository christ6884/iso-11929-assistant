import React, { useState, useEffect } from 'react';
import Card from './Card';
// Fix: Corrected import path
import { PeakIdentificationResult } from '../types';
import { identifyPeaks } from '../services/peakIdentifierService';

interface PeakIdentifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: any;
}

const PeakIdentifierModal: React.FC<PeakIdentifierModalProps> = ({ isOpen, onClose, t }) => {
  const [peakEnergiesText, setPeakEnergiesText] = useState('');
  const [tolerance, setTolerance] = useState(2.0);
  const [results, setResults] = useState<PeakIdentificationResult[] | null>(null);
  const [analysisType, setAnalysisType] = useState<'gamma' | 'alpha'>('gamma');

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleIdentify = () => {
    const energies = peakEnergiesText
      .split('\n')
      .map(line => parseFloat(line.trim()))
      .filter(num => !isNaN(num) && num > 0);
    
    const identificationResults = identifyPeaks(energies, tolerance, analysisType);
    setResults(identificationResults);
  };

  const renderResults = () => {
    if (!results) {
      return null;
    }
    return (
        <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="text-md font-semibold text-cyan-400 mb-2">{t('identificationResults')}</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {results.map((result, index) => (
                    <div key={index} className="bg-gray-900/50 p-3 rounded-md">
                        <h4 className="font-semibold text-gray-300 mb-2">
                            {t('resultsForPeak')
                                .replace('{energy}', result.inputEnergy_keV.toFixed(2))
                                .replace('{tolerance}', tolerance.toFixed(2))
                            }
                        </h4>
                        {result.matches.length > 0 ? (
                            <table className="w-full text-xs text-left">
                                <thead className="text-gray-400">
                                    <tr>
                                        <th className="py-1 px-2">{t('peakId_nuclide')}</th>
                                        <th className="py-1 px-2 text-right">{t('lineEnergy')}</th>
                                        <th className="py-1 px-2 text-right">{t('intensity')}</th>
                                        <th className="py-1 px-2 text-right">{t('delta')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.matches.map((match, matchIndex) => (
                                        <tr key={matchIndex} className="border-t border-gray-700">
                                            <td className="py-1 px-2 font-semibold text-cyan-300">{match.nuclide.name}</td>
                                            <td className="py-1 px-2 font-mono text-right text-gray-300">{match.line.energy_keV.toFixed(2)}</td>
                                            <td className="py-1 px-2 font-mono text-right text-gray-300">{match.line.intensity_percent.toFixed(2)}</td>
                                            <td className={`py-1 px-2 font-mono text-right ${match.delta_keV >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {match.delta_keV.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500 text-sm">{t('noNuclidesFound')}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl p-4" onClick={(e) => e.stopPropagation()}>
        <Card title={t('peakIdentifierTitle')}>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">{t('peakIdentifierIntro')}</p>
            
            <div className="flex bg-gray-700 rounded-md p-1 my-2">
                <button onClick={() => setAnalysisType('gamma')} className={`flex-1 p-1 text-sm rounded ${analysisType === 'gamma' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-600'}`}>{t('gammaAnalysis')}</button>
                <button onClick={() => setAnalysisType('alpha')} className={`flex-1 p-1 text-sm rounded ${analysisType === 'alpha' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-600'}`}>{t('alphaAnalysis')}</button>
            </div>
            
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
                    onClick={handleIdentify} 
                    className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                    {t('identify')}
                </button>
              </div>
            </div>

            {renderResults()}
            
            <div className="flex justify-end pt-4">
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