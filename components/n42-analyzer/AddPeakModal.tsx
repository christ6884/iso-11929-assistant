import React from 'react';
import Card from '../Card';

interface AddPeakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  peakInfo: { channel: number; energy: number } | null;
  t: any;
}

const AddPeakModal: React.FC<AddPeakModalProps> = ({ isOpen, onClose, onConfirm, peakInfo, t }) => {
  if (!isOpen || !peakInfo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
        <Card title={t('addPeakManually')}>
          <div className="space-y-4">
            <p className="text-gray-300">{t('confirmAddPeak')}</p>
            <div className="bg-gray-900/50 p-3 rounded-md space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-400">{t('channel')}:</span>
                    <span className="font-mono">{peakInfo.channel}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">{t('energy')}:</span>
                    <span className="font-mono">{peakInfo.energy.toFixed(2)} keV</span>
                </div>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                {t('cancel')}
              </button>
              <button 
                onClick={() => {
                  onConfirm();
                  onClose();
                }} 
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                {t('addPeak')}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AddPeakModal;