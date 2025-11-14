import React, { useState } from 'react';
import Card from '../components/Card';
import { Inputs, Results } from '../types';
import { db } from '../services/dbService';
import InfoTooltip from '../components/InfoTooltip';
import CollapsibleSection from '../components/CollapsibleSection';

interface AdminPageProps {
    t: any;
    onBack: () => void;
    inputs: Inputs;
    results: Results | string | null;
    isProUser: boolean;
    setProUser: (value: boolean) => void;
}

// --- Data Structure for the Project Tree ---
type NodeType = 'folder' | 'file';

interface FileNode {
    name: string;
    type: NodeType;
    descKey: string; // Key for translation
    children?: FileNode[];
}

// Defines the exact structure of the provided file list
const projectStructure: FileNode[] = [
    {
        name: 'components',
        type: 'folder',
        descKey: 'folderDesc_components',
        children: [
            { name: 'n42-analyzer', type: 'folder', descKey: 'folderDesc_n42_analyzer', children: [
                    { name: 'AddPeakModal.tsx', type: 'file', descKey: 'fileDesc_AddPeakModal' },
                    { name: 'ComparisonPlot.tsx', type: 'file', descKey: 'fileDesc_ComparisonPlot' },
                    { name: 'DeconvolutionModal.tsx', type: 'file', descKey: 'fileDesc_DeconvolutionModal' },
                    { name: 'EfficiencyCalibrationModal.tsx', type: 'file', descKey: 'fileDesc_EfficiencyCalibrationModal' },
                    { name: 'SpectrumPlot.tsx', type: 'file', descKey: 'fileDesc_SpectrumPlot' },
            ]},
            { name: 'source-management', type: 'folder', descKey: 'folderDesc_source_management', children: [
                    { name: 'AddSourceModal.tsx', type: 'file', descKey: 'fileDesc_AddSourceModal' },
                    { name: 'CsvImportModal.tsx', type: 'file', descKey: 'fileDesc_CsvImportModal' },
                    { name: 'ImportReviewModal.tsx', type: 'file', descKey: 'fileDesc_ImportReviewModal' },
                    { name: 'SourceTooltip.tsx', type: 'file', descKey: 'fileDesc_SourceTooltip' },
                    { name: 'SourceTypesMemoModal.tsx', type: 'file', descKey: 'fileDesc_SourceTypesMemoModal' },
            ]},
            { name: 'spectrum-analyzer', type: 'folder', descKey: 'folderDesc_spectrum_analyzer', children: [
                    { name: 'AnalysisResults.tsx', type: 'file', descKey: 'fileDesc_AnalysisResults' },
                    { name: 'CalibrationPointModal.tsx', type: 'file', descKey: 'fileDesc_CalibrationPointModal' },
                    { name: 'CalibrationSidebar.tsx', type: 'file', descKey: 'fileDesc_CalibrationSidebar' },
                    { name: 'CameraCapture.tsx', type: 'file', descKey: 'fileDesc_CameraCapture' },
                    { name: 'ImageUploader.tsx', type: 'file', descKey: 'fileDesc_ImageUploader' },
            ]},
            { name: 'Card.tsx', type: 'file', descKey: 'fileDesc_Card' },
            { name: 'ChartModal.tsx', type: 'file', descKey: 'fileDesc_ChartModal' },
            { name: 'ChartPanel.tsx', type: 'file', descKey: 'fileDesc_ChartPanel' },
            { name: 'CollapsibleSection.tsx', type: 'file', descKey: 'fileDesc_CollapsibleSection' },
            { name: 'DecayCalculatorModal.tsx', type: 'file', descKey: 'fileDesc_DecayCalculatorModal' },
            { name: 'ExportModal.tsx', type: 'file', descKey: 'fileDesc_ExportModal' },
            { name: 'GeminiBackupModal.tsx', type: 'file', descKey: 'fileDesc_GeminiBackupModal' },
            { name: 'GeminiHelper.tsx', type: 'file', descKey: 'fileDesc_GeminiHelper' },
            { name: 'InfoTooltip.tsx', type: 'file', descKey: 'fileDesc_InfoTooltip' },
            { name: 'InputPanel.tsx', type: 'file', descKey: 'fileDesc_InputPanel' },
            { name: 'LanguageSelector.tsx', type: 'file', descKey: 'fileDesc_LanguageSelector' },
            { name: 'ModeSelector.tsx', type: 'file', descKey: 'fileDesc_ModeSelector' },
            { name: 'MonteCarloStatsModal.tsx', type: 'file', descKey: 'fileDesc_MonteCarloStatsModal' },
            { name: 'PeakIdentifierModal.tsx', type: 'file', descKey: 'fileDesc_PeakIdentifierModal' },
            { name: 'PeakPositionAdjusterModal.tsx', type: 'file', descKey: 'fileDesc_PeakPositionAdjusterModal' },
            { name: 'ProAccessModal.tsx', type: 'file', descKey: 'fileDesc_ProAccessModal' },
            { name: 'ReportGeneratorModal.tsx', type: 'file', descKey: 'fileDesc_ReportGeneratorModal' },
            { name: 'ResultsPanel.tsx', type: 'file', descKey: 'fileDesc_ResultsPanel' },
            { name: 'SaveAnalysisModal.tsx', type: 'file', descKey: 'fileDesc_SaveAnalysisModal' },
            { name: 'ThemeSelector.tsx', type: 'file', descKey: 'fileDesc_ThemeSelector' },
            { name: 'UnitConverterModal.tsx', type: 'file', descKey: 'fileDesc_UnitConverterModal' },
            { name: 'UpdateNotification.tsx', type: 'file', descKey: 'fileDesc_UpdateNotification' },
            { name: 'UserGuideModal.tsx', type: 'file', descKey: 'fileDesc_UserGuideModal' },
            { name: 'WelcomeModal.tsx', type: 'file', descKey: 'fileDesc_WelcomeModal' },
        ]
    },
    {
        name: 'pages',
        type: 'folder',
        descKey: 'folderDesc_pages',
        children: [
            { name: 'AdminPage.tsx', type: 'file', descKey: 'fileDesc_AdminPage' },
            { name: 'AnalysisHistoryPage.tsx', type: 'file', descKey: 'fileDesc_AnalysisHistoryPage' },
            { name: 'BackgroundSubtractionPage.tsx', type: 'file', descKey: 'fileDesc_BackgroundSubtractionPage' },
            { name: 'N42AnalyzerPage.tsx', type: 'file', descKey: 'fileDesc_N42AnalyzerPage' },
            { name: 'SourceManagementPage.tsx', type: 'file', descKey: 'fileDesc_SourceManagementPage' },
            { name: 'SpectroPage.tsx', type: 'file', descKey: 'fileDesc_SpectroPage' },
            { name: 'SpectrumAnalyzerPage.tsx', type: 'file', descKey: 'fileDesc_SpectrumAnalyzerPage' },
            { name: 'SpectrumComparisonPage.tsx', type: 'file', descKey: 'fileDesc_SpectrumComparisonPage' },
        ]
    },
    {
        name: 'services',
        type: 'folder',
        descKey: 'folderDesc_services',
        children: [
            { name: 'analysisHelpers.ts', type: 'file', descKey: 'fileDesc_analysisHelpers' },
            { name: 'dbService.ts', type: 'file', descKey: 'fileDesc_dbService' },
            { name: 'gammaLibrary.ts', type: 'file', descKey: 'fileDesc_gammaLibrary' },
            { name: 'geminiService.ts', type: 'file', descKey: 'fileDesc_geminiService' },
            { name: 'isoCalculations.ts', type: 'file', descKey: 'fileDesc_isoCalculations' },
            { name: 'monteCarloService.ts', type: 'file', descKey: 'fileDesc_monteCarloService' },
            { name: 'n42ParserService.ts', type: 'file', descKey: 'fileDesc_n42ParserService' },
            { name: 'peakIdentifierService.ts', type: 'file', descKey: 'fileDesc_peakIdentifierService' },
            { name: 'radionuclides.ts', type: 'file', descKey: 'fileDesc_radionuclides' },
            { name: 'sourceTypes.ts', type: 'file', descKey: 'fileDesc_sourceTypes' },
            { name: 'spectrumAnalyzerService.ts', type: 'file', descKey: 'fileDesc_spectrumAnalyzerService' },
        ]
    },
    {
        name: 'electron',
        type: 'folder',
        descKey: 'folderDesc_electron',
        children: [
            { name: 'main.js', type: 'file', descKey: 'fileDesc_electron_main' },
            { name: 'preload.js', type: 'file', descKey: 'fileDesc_electron_preload' },
        ]
    },
    { name: 'App.tsx', type: 'file', descKey: 'fileDesc_App' },
    { name: 'index.tsx', type: 'file', descKey: 'fileDesc_index_tsx' },
    { name: 'index.html', type: 'file', descKey: 'fileDesc_index_html' },
    { name: 'index.css', type: 'file', descKey: 'fileDesc_index_css' },
    { name: 'types.ts', type: 'file', descKey: 'fileDesc_types' },
    { name: 'translations.ts', type: 'file', descKey: 'fileDesc_translations' },
    { name: 'manifest.json', type: 'file', descKey: 'fileDesc_manifest' },
    { name: 'metadata.json', type: 'file', descKey: 'fileDesc_metadata' },
    { name: 'package.json', type: 'file', descKey: 'fileDesc_package' },
    { name: 'README.md', type: 'file', descKey: 'fileDesc_readme' },
    { name: 'service-worker.js', type: 'file', descKey: 'fileDesc_sw' },
    { name: 'tailwind.config.js', type: 'file', descKey: 'fileDesc_tailwind' },
];

const FileTree: React.FC<{ nodes: FileNode[]; t: any; onInfoClick: (node: FileNode) => void }> = ({ nodes, t, onInfoClick }) => {
    return (
        <ul className="text-sm">
            {nodes.map(node => (
                <li key={node.name} className="ml-4 my-1">
                    <div className="flex items-center space-x-2">
                        <span>{node.type === 'folder' ? '📁' : '📄'}</span>
                        <span className="font-mono">{node.name}</span>
                        <button onClick={() => onInfoClick(node)} className="text-cyan-400 hover:text-cyan-300 text-xs">(i)</button>
                    </div>
                    {node.children && <FileTree nodes={node.children} t={t} onInfoClick={onInfoClick} />}
                </li>
            ))}
        </ul>
    );
};


const AdminPage: React.FC<AdminPageProps> = ({ t, onBack, inputs, results, isProUser, setProUser }) => {
    const [infoFile, setInfoFile] = useState<FileNode | null>(null);
    
    const handleClearLocalStorage = () => {
        if (window.confirm("This will reset all application settings, including PRO mode. Are you sure?")) {
            localStorage.clear();
            window.location.reload();
        }
    };
    
    const handleClearDB = async () => {
        if (window.confirm("This will DELETE all saved sources and analyses. This action is irreversible. Are you sure?")) {
            try {
                await db.clearAnalyses();
                await db.clearSources();
                alert("Database has been cleared.");
            } catch (error) {
                console.error("Failed to clear IndexedDB:", error);
                alert("Failed to clear database.");
            }
        }
    };

    const handleGodMode = () => {
        if (!isProUser) {
            localStorage.setItem('isProUser', 'true');
            setProUser(true);
        } else {
            localStorage.removeItem('isProUser');
            setProUser(false);
        }
    }

    const inputVars = [
        'grossCount', 'grossCountUnit', 'grossTime', 'backgroundCount', 'backgroundCountUnit', 'backgroundTime',
        'roiGrossCount', 'roiChannels', 'backgroundTotalCount', 'backgroundChannels', 'probeEfficiency', 'probeArea',
        'estimatedBackgroundRate', 'targetValue', 'targetUnit', 'conveyorSpeed', 'conveyorSpeedUnit',
        'chamberLength', 'chamberWidth', 'chamberHeight', 'detectors', 'chambreLingeTime', 'chambreLingeTarget',
        'chambreLingeTargetUnit', 'calibrationFactor', 'calibrationFactorUnit', 'calibrationFactorUncertainty',
        'k1alpha', 'k1beta', 'correlationCoefficient', 'monteCarloMode', 'useBayesianMode', 'numSimulations'
    ];

    const resultVars = [
        'calculationMethod', 'currentMode', 'primaryResult', 'primaryUncertainty', 'decisionThreshold', 'detectionLimit',
        'isEffectPresent', 'bestEstimate', 'bestEstimateUncertainty', 'confidenceIntervalLower', 'confidenceIntervalUpper',
        'k1alpha', 'k1beta', 'alphaProbability', 'betaProbability', 'meanTimeBetweenFalseAlarms', 'uncertaintyAtZero',
        'uncertaintyAtDetectionLimit', 'varianceComponents', 'sensitivityCoefficients', 'probabilityEffectPresent',
        'histogramData', 'numSimulations', 'monteCarloStats'
    ];
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-300">{t('adminPageTitle')}</h2>
                <button onClick={onBack} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                    <span>{t('backButton')}</span>
                </button>
            </div>
            
            <p className="text-gray-400 mb-6">{t('adminWelcome')}</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* --- LEFT COLUMN (SCROLLABLE CONTENT) --- */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title={t('projectExplorer')}>
                        <p className="text-xs text-gray-500 mb-4">{t('projectExplorerDesc')}</p>
                        <div className="max-h-[60vh] overflow-y-auto pr-2">
                            <FileTree nodes={projectStructure} t={t} onInfoClick={setInfoFile} />
                        </div>
                        <p className="text-xs text-gray-600 mt-4">{t('adminStaticStructureWarning')}</p>
                    </Card>

                    <Card title={t('adminVariablesTitle')}>
                        <CollapsibleSection title={t('adminInputsTitle')} defaultOpen={false}>
                            <div className="p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
                                {inputVars.map(v => (
                                    <div key={v} className="flex items-center space-x-2">
                                        <span className="font-mono text-sm text-gray-300">{v}</span>
                                        <InfoTooltip text={t(`varDesc_${v}`)} />
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>
                        <CollapsibleSection title={t('adminResultsTitle')} defaultOpen={false}>
                            <div className="p-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4">
                                {resultVars.map(v => (
                                     <div key={v} className="flex items-center space-x-2">
                                        <span className="font-mono text-sm text-gray-300">{v}</span>
                                        <InfoTooltip text={t(`varDesc_${v}`)} />
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>
                    </Card>
                </div>

                {/* --- RIGHT COLUMN (STICKY) --- */}
                <div className="lg:col-span-1 sticky top-6 space-y-6">
                    <Card title={t('adminLiveStateTitle')}>
                        <CollapsibleSection title={t('adminInputsState')} defaultOpen={false}>
                            <pre className="text-xs bg-gray-900 p-2 rounded-md max-h-64 overflow-y-auto">
                                <code>{JSON.stringify(inputs, null, 2)}</code>
                            </pre>
                        </CollapsibleSection>
                        <CollapsibleSection title={t('adminResultsState')} defaultOpen={false}>
                            <pre className="text-xs bg-gray-900 p-2 rounded-md max-h-64 overflow-y-auto">
                                <code>{JSON.stringify(results, null, 2)}</code>
                            </pre>
                        </CollapsibleSection>
                    </Card>
                    <Card title={t('fileInfo')}>
                        {infoFile ? (
                            <div className="p-3 min-h-[120px]">
                                <h4 className="font-bold text-cyan-400 mb-2">{infoFile.name}</h4>
                                <p className="text-sm text-gray-300">{t(infoFile.descKey) || "No description available."}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 p-3 min-h-[120px] flex items-center justify-center">{t('adminInfoPlaceholder')}</p>
                        )}
                    </Card>
                    <Card title={t('godMode')}>
                        <p className="text-sm text-gray-400 mb-4">{t('godModeDesc')}</p>
                        <button onClick={handleGodMode} className={`w-full py-2 px-4 rounded-lg font-bold ${isProUser ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}>
                            {isProUser ? t('disableGodMode') : t('enableGodMode')}
                        </button>
                    </Card>
                    <Card title={t('dataManagement')}>
                        <div className="space-y-4">
                            <button onClick={handleClearLocalStorage} className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                                {t('clearLocalStorage')}
                            </button>
                            <button onClick={handleClearDB} className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                                {t('clearIndexedDB')}
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default AdminPage;