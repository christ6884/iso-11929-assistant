import React, { useState, useEffect, useMemo } from 'react';
import Card from './Card.tsx';
import { radionuclides, Radionuclide } from '../services/radionuclides.ts';

interface DecayCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (newActivity: number, newUncertainty: number) => void;
  t: any;
  initialActivity: number;
  initialUncertainty: number;
  unit: string;
}

const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const DecayCalculatorModal: React.FC<DecayCalculatorModalProps> = ({ isOpen, onClose, onApply, t, initialActivity, initialUncertainty, unit }) => {
  const [refActivity, setRefActivity] = useState(initialActivity);
  const [refUncertainty, setRefUncertainty] = useState(initialUncertainty);
  const [refDate, setRefDate] = useState(formatDateForInput(new Date()));
  const [measDate, setMeasDate] = useState(formatDateForInput(new Date()));
  const [selectedNuclideKey, setSelectedNuclideKey] = useState('gamma-0');
  
  const [correctedActivity, setCorrectedActivity] = useState<number | null>(null);
  const [elapsedDays, setElapsedDays] = useState<number | null>(null);

  const selectedNuclide = useMemo((): Radionuclide | null => {
      const [type, indexStr] = selectedNuclideKey.split('-');
      const index = parseInt(indexStr, 10);
      if (radionuclides[type] && radionuclides[type][index]) {
          return radionuclides[type][index];
      }
      return null;
  }, [selectedNuclideKey]);
  
  useEffect(() => {
    setRefActivity(initialActivity);
    setRefUncertainty(initialUncertainty);
  }, [initialActivity, initialUncertainty, isOpen]);

  useEffect(() => {
    const calculateDecay = () => {
      if (!selectedNuclide || !refDate || !measDate || refActivity <= 0) {
        setCorrectedActivity(null);
        setElapsedDays(null);
        return;
      }
      const refTime = new Date(refDate).getTime();
      const measTime = new Date(measDate).getTime();

      if (isNaN(refTime) || isNaN(measTime)) {
        setCorrectedActivity(null);
        setElapsedDays(null);
        return;
      }
      
      const elapsedTimeSeconds = (measTime - refTime) / 1000;
      setElapsedDays(elapsedTimeSeconds / (24 * 3600));

      const lambda = Math.log(2) / selectedNuclide.halfLifeSeconds;
      const newActivity = refActivity * Math.exp(-lambda * elapsedTimeSeconds);
      
      setCorrectedActivity(newActivity);
    };
    calculateDecay();
  }, [refActivity, refDate, measDate, selectedNuclide]);

  if (!isOpen) return null;

  const handleApply = () => {
      if (correctedActivity !== null) {
          onApply(correctedActivity, refUncertainty); // Relative uncertainty doesn't change
      }
  };
  
  const formatNumber = (num: number | null) => {
    if (num === null) return 'N/A';
    if (Math.abs(num) < 0.001 && num !== 0) return num.toExponential(3);
    const fixed = num.toFixed(3);
    return fixed.endsWith('.000') ? parseInt(fixed).toString() : fixed;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
        <Card title={t('decayCalculatorTitle')}>
          <div className="space-y-4">
            {/* --- Inputs --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-1 block">{t('decayCalc_referenceActivity')} ({unit})</label>
                <input type="number" value={refActivity} onChange={(e) => setRefActivity(parseFloat(e.target.value) || 0)} className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white"/>
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1 block">{t('decayCalc_referenceUncertainty')}</label>
                <input type="number" value={refUncertainty} onChange={(e) => setRefUncertainty(parseFloat(e.target.value) || 0)} className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white"/>
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1 block">{t('decayCalc_referenceDate')}</label>
                <input type="date" value={refDate} onChange={(e) => setRefDate(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white"/>
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1 block">{t('measurementDate')}</label>
                <input type="date" value={measDate} onChange={(e) => setMeasDate(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white"/>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1 block">{t('selectNuclide')}</label>
              <select value={selectedNuclideKey} onChange={(e) => setSelectedNuclideKey(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white">
                {Object.entries(radionuclides).map(([type, nuclides]) => (
                    <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
                        {nuclides.map((nuclide, index) => (
                            <option key={`${type}-${index}`} value={`${type}-${index}`}>{nuclide.name}</option>
                        ))}
                    </optgroup>
                ))}
              </select>
            </div>
            
            {/* --- Results --- */}
            <div className="border-t border-gray-700 pt-4 mt-4">
                <h3 className="text-md font-semibold text-cyan-400 mb-2">{t('decayResults')}</h3>
                <div className="bg-gray-900/50 p-3 rounded-md space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">{t('halfLife')}:</span>
                        <span className="font-mono">{selectedNuclide ? `${(selectedNuclide.halfLifeSeconds / (365.25 * 24 * 3600)).toFixed(4)} years` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">{t('elapsedTime')}:</span>
                        <span className="font-mono">{elapsedDays !== null ? `${formatNumber(elapsedDays)} ${t('days')}`: 'N/A'}</span>
                    </div>
                     <div className="flex justify-between text-lg font-bold text-cyan-300 pt-2 border-t border-gray-600 mt-2">
                        <span>{t('correctedActivity')}:</span>
                        <span className="font-mono">{formatNumber(correctedActivity)} {unit}</span>
                    </div>
                </div>
            </div>

            {/* --- Actions --- */}
            <div className="flex justify-end space-x-4 pt-4">
              <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                {t('cancel')}
              </button>
              <button onClick={handleApply} disabled={correctedActivity === null} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
                {t('calculateAndApply')}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DecayCalculatorModal;