import React from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: any;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  const features = [
    { title: t('welcomeFeature1Title'), desc: t('welcomeFeature1Desc') },
    { title: t('welcomeFeature2Title'), desc: t('welcomeFeature2Desc') },
    { title: t('welcomeFeature4Title'), desc: t('welcomeFeature4Desc') },
    { title: t('welcomeFeature5Title'), desc: t('welcomeFeature5Desc') },
    { title: t('welcomeFeature6Title'), desc: t('welcomeFeature6Desc') },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-3xl m-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-4">{t('welcomeTitle')}</h1>
            <p className="text-gray-300 mb-6">{t('welcomeIntro')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto pr-4">
                {features.map((feature, index) => (
                    <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <h2 className="font-semibold text-cyan-400 mb-2">{feature.title}</h2>
                        <p className="text-sm text-gray-400">{feature.desc}</p>
                    </div>
                ))}
            </div>

            <p className="text-center text-gray-400 mt-6">{t('welcomeConclusion')}</p>
        </div>
        <div className="bg-gray-900/50 px-6 py-4 rounded-b-lg border-t border-gray-700 flex justify-end">
             <button
                onClick={onClose}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
              >
                {t('welcomeStart')}
              </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;