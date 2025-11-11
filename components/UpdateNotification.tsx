import React from 'react';

interface UpdateNotificationProps {
  isOpen: boolean;
  onUpdate: () => void;
  t: any;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ isOpen, onUpdate, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 border border-cyan-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center justify-between z-50 animate-fade-in-up">
      <p className="mr-4 text-sm">{t('updateAvailable')}</p>
      <button
        onClick={onUpdate}
        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1 px-4 rounded-md transition duration-300 text-sm"
      >
        {t('refresh')}
      </button>
    </div>
  );
};

export default UpdateNotification;