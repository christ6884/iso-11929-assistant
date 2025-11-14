import React from 'react';

interface TutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: any;
}

const GuideSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h2 className="text-xl font-bold text-cyan-400 mb-3 border-b border-gray-600 pb-2">{title}</h2>
        <div className="space-y-3 text-gray-300">{children}</div>
    </div>
);

const Step: React.FC<{ num: number, children: React.ReactNode }> = ({ num, children }) => (
    <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 bg-cyan-600 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm">{num}</div>
        <p className="text-sm text-gray-400">{children}</p>
    </div>
);


const TutorialsModal: React.FC<TutorialsModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl m-4 border border-gray-700 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-cyan-400">{t('tutorials_title')}</h1>
            <button onClick={() => window.print()} className="no-print text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                <span>{t('printReport')}</span>
            </button>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto max-h-[75vh]">
            <p className="mb-6 text-gray-400">{t('tutorials_intro')}</p>

            <GuideSection title={t('tutorial1_title')}>
                <div className="space-y-2">
                    <Step num={1}>{t('tutorial1_step1')}</Step>
                    <Step num={2}>{t('tutorial1_step2')}</Step>
                    <Step num={3}>{t('tutorial1_step3')}</Step>
                    <Step num={4}>{t('tutorial1_step4')}</Step>
                </div>
            </GuideSection>

            <GuideSection title={t('tutorial2_title')}>
                 <div className="space-y-2">
                    <Step num={1}>{t('tutorial2_step1')}</Step>
                    <Step num={2}>{t('tutorial2_step2')}</Step>
                    <Step num={3}>{t('tutorial2_step3')}</Step>
                </div>
            </GuideSection>

            <GuideSection title={t('tutorial3_title')}>
                <div className="space-y-2">
                    <Step num={1}>{t('tutorial3_step1')}</Step>
                    <Step num={2}>{t('tutorial3_step2')}</Step>
                    <Step num={3}>{t('tutorial3_step3')}</Step>
                    <Step num={4}>{t('tutorial3_step4')}</Step>
                </div>
            </GuideSection>
            
            <GuideSection title={t('tutorial4_title')}>
                <div className="space-y-2">
                    <Step num={1}>{t('tutorial4_step1')}</Step>
                    <Step num={2}>{t('tutorial4_step2')}</Step>
                    <Step num={3}>{t('tutorial4_step3')}</Step>
                    <Step num={4}>{t('tutorial4_step4')}</Step>
                </div>
            </GuideSection>

            <GuideSection title={t('tutorial5_title')}>
                <div className="space-y-2">
                    <Step num={1}>{t('tutorial5_step1')}</Step>
                    <Step num={2}>{t('tutorial5_step2')}</Step>
                    <Step num={3}>{t('tutorial5_step3')}</Step>
                    <Step num={4}>{t('tutorial5_step4')}</Step>
                </div>
            </GuideSection>

        </div>
        <div className="bg-gray-900/50 px-6 py-4 rounded-b-lg border-t border-gray-700 flex justify-end">
             <button
                onClick={onClose}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
              >
                {t('close')}
              </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialsModal;
