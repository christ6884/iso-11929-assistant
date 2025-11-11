import React, { useState, useEffect } from 'react';

interface CalibrationPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (energy: number, uncertainty?: number) => void;
  t: any;
}

const CalibrationPointModal: React.FC<CalibrationPointModalProps> = ({ isOpen, onClose, onSubmit, t }) => {
  const [energy, setEnergy] = useState('');
  const [uncertainty, setUncertainty] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEnergy(''); // Reset on open
      setUncertainty('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const energyValue = parseFloat(energy);
    if (!isNaN(energyValue) && energyValue > 0) {
      const uncertaintyValue = parseFloat(uncertainty);
      onSubmit(energyValue, isNaN(uncertaintyValue) ? undefined : uncertaintyValue);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-cyan-400 mb-4">{t('enterPeakEnergy')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="peak-energy" className="block text-sm font-medium text-gray-300 mb-1">{t('peakEnergyLabel')}</label>
            <input
              id="peak-energy"
              type="number"
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
              className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white"
              step="0.1"
              min="0"
              autoFocus
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="peak-uncertainty" className="block text-sm font-medium text-gray-300 mb-1">{t('peakEnergyUncertaintyLabel')}</label>
            <input
              id="peak-uncertainty"
              type="number"
              value={uncertainty}
              onChange={(e) => setUncertainty(e.target.value)}
              className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white"
              step="0.01"
              min="0"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              {t('cancel')}
            </button>
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
              {t('ok')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalibrationPointModal;