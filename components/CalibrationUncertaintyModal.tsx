import React, { useState, useMemo } from 'react';
import Card from './Card';

interface CalibrationUncertaintyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (newUncertainty: number) => void;
  t: any;
}

const CalibrationUncertaintyModal: React.FC<CalibrationUncertaintyModalProps> = ({ isOpen, onClose, onApply, t }) => {
  const [sourceUncertainty, setSourceUncertainty] = useState(3); // %
  const [grossCounts, setGrossCounts] = useState(10000);
  const [bkgCounts, setBkgCounts] = useState(1000);

  const calculatedUncertainty = useMemo(() => {
    const netCounts = grossCounts - bkgCounts;
    if (netCounts <= 0) return null;

    // u_rel_stat = sqrt(n_g + n_0) / (n_g - n_0)
    const u_rel_stat = Math.sqrt(grossCounts + bkgCounts) / netCounts;
    
    const u_rel_source = sourceUncertainty / 100;
    
    // u_rel_combined = sqrt(u_rel_source^2 + u_rel_stat^2)
    const u_rel_combined = Math.sqrt(u_rel_source**2 + u_rel_stat**2);

    return {
      stat: u_rel_stat * 100,
      combined: u_rel_combined * 100,
    };
  }, [sourceUncertainty, grossCounts, bkgCounts]);

  if (!isOpen) return null;

  const handleApply = () => {
      if (calculatedUncertainty) {
          onApply(calculatedUncertainty.combined);
      }
  };
  
  const formatNumber = (num: number | null) => {
    if (num === null) return 'N/A';
    return num.toFixed(3);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
        <Card title={t.uncertaintyCalculatorTitle}>
          <div className="space-y-4">
            {/* --- Inputs --- */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">{t.sourceUncertaintyLabel} (%)</label>
              <input type="number" value={sourceUncertainty} onChange={(e) => setSourceUncertainty(parseFloat(e.target.value) || 0)} className="w-full bg-gray-700 p-2 rounded-md font-mono text-right"/>
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1 block">{t.calibrationGrossCountsLabel}</label>
              <input type="number" value={grossCounts} onChange={(e) => setGrossCounts(parseFloat(e.target.value) || 0)} className="w-full bg-gray-700 p-2 rounded-md font-mono text-right"/>
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1 block">{t.calibrationBackgroundCountsLabel}</label>
              <input type="number" value={bkgCounts} onChange={(e) => setBkgCounts(parseFloat(e.target.value) || 0)} className="w-full bg-gray-700 p-2 rounded-md font-mono text-right"/>
            </div>
            
            {/* --- Results --- */}
            <div className="border-t border-gray-700 pt-4 mt-4">
                <h3 className="text-md font-semibold text-cyan-400 mb-2">{t.calculationResults}</h3>
                <div className="bg-gray-900/50 p-3 rounded-md space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-400">{t.statisticalUncertaintyLabel}:</span>
                        <span className="font-mono">{formatNumber(calculatedUncertainty?.stat ?? null)} %</span>
                    </div>
                     <div className="flex justify-between text-lg font-bold text-cyan-300 pt-2 border-t border-gray-600 mt-2">
                        <span>{t.combinedUncertaintyLabel}:</span>
                        <span className="font-mono">{formatNumber(calculatedUncertainty?.combined ?? null)} %</span>
                    </div>
                </div>
            </div>

            {/* --- Actions --- */}
            <div className="flex justify-end space-x-4 pt-4">
              <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                {t.cancel}
              </button>
              <button onClick={handleApply} disabled={!calculatedUncertainty} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
                {t.calculateAndApply}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CalibrationUncertaintyModal;