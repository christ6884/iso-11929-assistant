import React from 'react';

interface UserGuideModalProps {
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

const GuideSubSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-4 pl-4 border-l-2 border-gray-700">
        <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
        <div className="space-y-3 text-sm text-gray-400">{children}</div>
    </div>
);

const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl m-4 border border-gray-700 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl md:text-3xl font-bold text-cyan-400">{t('guideTitle')}</h1>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto max-h-[75vh]">
            <GuideSection title={t('guide_intro_title')}>
                <p>{t('guide_intro_p1')}</p>
            </GuideSection>

            <GuideSection title={t('guide_main_calc_title')}>
                <p>{t('guide_main_calc_p1')}</p>
                <GuideSubSection title={t('guide_main_calc_modes_title')}>
                    <p>{t('guide_main_calc_modes_p1')}</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>{t('standard')}:</strong> {t('guide_main_calc_modes_li1')}</li>
                        <li><strong>{t('spectrometry')}:</strong> {t('guide_main_calc_modes_li2')}</li>
                        <li><strong>{t('surfaceControl')}:</strong> {t('guide_main_calc_modes_li3_surface')}</li>
                        <li><strong>{t('chambre')}:</strong> {t('guide_main_calc_modes_li3_chambre')}</li>
                        <li><strong>{t('linge')}:</strong> {t('guide_main_calc_modes_li3_linge')}</li>
                    </ul>
                </GuideSubSection>
                <GuideSubSection title={t('guide_main_calc_inputs_title')}>
                    <p>{t('guide_main_calc_inputs_p1')}</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>{t('sourceMeasurement')} & {t('backgroundMeasurement')}:</strong> {t('guide_main_calc_inputs_li1')}</li>
                        <li><strong>{t('calibration')}:</strong> {t('guide_main_calc_inputs_li2')}</li>
                        <li><strong>{t('riskParameters')}:</strong> {t('guide_main_calc_inputs_li3')}</li>
                    </ul>
                </GuideSubSection>
                <GuideSubSection title={t('guide_main_calc_results_title')}>
                    <p>{t('guide_main_calc_results_p1')}</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>{t('decisionThreshold')} (y*):</strong> {t('guide_main_calc_results_li1')}</li>
                        <li><strong>{t('detectionLimit')} (y#):</strong> {t('guide_main_calc_results_li2')}</li>
                        <li><strong>{t('conclusion')}:</strong> {t('guide_main_calc_results_li3')}</li>
                        <li><strong>{t('uncertaintyBudget')}:</strong> {t('guide_main_calc_results_li4')}</li>
                    </ul>
                </GuideSubSection>
                <GuideSubSection title={t('guide_main_calc_expert_title')}>
                    <p>{t('guide_main_calc_expert_p1')}</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>{t('correlationCoefficient')}:</strong> {t('guide_main_calc_expert_li1')}</li>
                        <li><strong>{t('monteCarloMode')}:</strong> {t('guide_main_calc_expert_li2')}</li>
                    </ul>
                </GuideSubSection>
            </GuideSection>

            <GuideSection title={t('guide_spec_tools_title')}>
                 <p>{t('guide_spec_tools_p1')}</p>
                 <GuideSubSection title={t('guide_spec_analyzer_title')}>
                     <p>{t('guide_spec_analyzer_p1')}</p>
                     <GuideSubSection title={t('guide_spec_analyzer_phase1_title')}>
                         <p>{t('guide_spec_analyzer_phase1_p1')}</p>
                     </GuideSubSection>
                     <GuideSubSection title={t('guide_spec_analyzer_phase2_title')}>
                         <p>{t('guide_spec_analyzer_phase2_p1')}</p>
                     </GuideSubSection>
                 </GuideSubSection>
                 <GuideSubSection title={t('guide_n42_analyzer_title')}>
                     <p>{t('guide_n42_analyzer_p1')}</p>
                     <ul className="list-disc list-inside space-y-1">
                        <li>{t('guide_n42_analyzer_li1')}</li>
                        <li>{t('guide_n42_analyzer_li2')}</li>
                        <li>{t('guide_n42_analyzer_li3')}</li>
                        <li>{t('guide_n42_analyzer_li4')}</li>
                     </ul>
                 </GuideSubSection>
            </GuideSection>

            <GuideSection title={t('guide_source_mgmt_title')}>
                <p>{t('guide_source_mgmt_p1')}</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>{t('guide_source_mgmt_li1')}</li>
                    <li>{t('guide_source_mgmt_li2')}</li>
                    <li>{t('guide_source_mgmt_li3')}</li>
                    <li>{t('guide_source_mgmt_li4')}</li>
                    <li>{t('guide_source_mgmt_li5')}</li>
                </ul>
            </GuideSection>
            
            <GuideSection title={t('guide_other_tools_title')}>
                <GuideSubSection title={t('guide_other_tools_decay_title')}>
                    <p>{t('guide_other_tools_decay_p1')}</p>
                </GuideSubSection>
                 <GuideSubSection title={t('guide_other_tools_peak_title')}>
                    <p>{t('guide_other_tools_peak_p1')}</p>
                </GuideSubSection>
            </GuideSection>

            <GuideSection title={t('guide_data_mgmt_title')}>
                <p>{t('guide_data_mgmt_p1')}</p>
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

export default UserGuideModal;