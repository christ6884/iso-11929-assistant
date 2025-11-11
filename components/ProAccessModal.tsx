import React, { useState } from 'react';
import Card from './Card';

// The hardcoded passcode for unlocking pro features.
const PRO_PASSCODE = 'UNITECH-PRO-2024';

interface ProAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  t: any;
}

const ProAccessModal: React.FC<ProAccessModalProps> = ({ isOpen, onClose, onSuccess, t }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === PRO_PASSCODE) {
      setError('');
      onSuccess();
    } else {
      setError(t('incorrectPasscode'));
    }
  };

  const handleClose = () => {
    setError('');
    setPasscode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={handleClose}>
      <div className="w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
        <Card title={t('proAccessTitle')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-300">{t('proAccessDescription')}</p>
            <div>
              <label htmlFor="passcode" className="text-sm text-gray-400 mb-1 block">{t('passcode')}</label>
              <input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                className="w-full bg-gray-700 p-2 rounded-md font-mono text-white"
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
              <button type="button" onClick={handleClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
                {t('cancel')}
              </button>
              <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">
                {t('submit')}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProAccessModal;
