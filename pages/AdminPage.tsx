
import React, { useState } from 'react';
import Card from '../components/Card';
import { Inputs } from '../types';
import { db } from '../services/dbService';

interface AdminPageProps {
    t: any;
    onBack: () => void;
    inputs: Inputs;
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
            { 
                name: 'n42-analyzer', 
                type: 'folder', 
                descKey: 'folderDesc_n42_analyzer',
                children: [
                    { name: 'AddPeakModal.tsx', type: 'file', descKey: 'fileDesc_AddPeakModal' },
                    { name: 'ComparisonPlot.tsx', type: 'file', descKey: 'fileDesc_ComparisonPlot' },
                    { name: 'DeconvolutionModal.tsx', type: 'file', descKey: 'fileDesc_DeconvolutionModal' },
                    { name: 'EfficiencyCalibrationModal.tsx', type: 'file', descKey: 'fileDesc_EfficiencyCalibrationModal' },
                    { name: 'SpectrumPlot.tsx', type: 'file', descKey: 'fileDesc_SpectrumPlot' },
                ]
            },
            { 
                name: 'source-management', 
                type: 'folder', 
                descKey: 'folderDesc_source_management',
                children: [
                    { name: 'AddSourceModal.tsx', type: 'file', descKey: 'fileDesc_AddSourceModal' },
                    { name: 'CsvImportModal.tsx', type: 'file', descKey: 'fileDesc_CsvImportModal' },
                    { name: 'ImportReviewModal.tsx', type: 'file', descKey: 'fileDesc_ImportReviewModal' },
                    { name: 'SourceTooltip.tsx', type: 'file', descKey: 'fileDesc_SourceTooltip' },
                    { name: 'SourceTypesMemoModal.tsx', type: 'file', descKey: 'fileDesc_SourceTypesMemoModal' },
                ]
            },
            { 
                name: 'spectrum-analyzer', 
                type: 'folder', 
                descKey: 'folderDesc_spectrum_analyzer',
                children: [
                    { name: 'AnalysisResults.tsx', type: 'file', descKey: 'fileDesc_AnalysisResults' },
                    { name: 'CalibrationPointModal.tsx', type: 'file', descKey: 'fileDesc_CalibrationPointModal' },
                    { name: 'CalibrationSidebar.tsx', type: 'file', descKey: 'fileDesc_CalibrationSidebar' },
                    { name: 'CameraCapture.tsx', type: 'file', descKey: 'fileDesc_CameraCapture' },
                    { name: 'ImageUploader.tsx', type: 'file', descKey: 'fileDesc_ImageUploader' },
                ]
            },
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
        name: 'electron',
        type: 'folder',
        descKey: 'folderDesc_electron',
        children: [
            { name: 'main.js', type: 'file', descKey: 'fileDesc_electron_main' },
            { name: 'preload.js', type: 'file', descKey: 'fileDesc_electron_preload' },
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
    { name: 'App.tsx', type: 'file', descKey: 'fileDesc_App' },
    { name: 'index.css', type: 'file', descKey: 'fileDesc_index_css' },
    { name: 'index.html', type: 'file', descKey: 'fileDesc_index_html' },
    { name: 'index.tsx', type: 'file', descKey: 'fileDesc_index_tsx' },
    { name: 'manifest.json', type: 'file', descKey: 'fileDesc_manifest' },
    { name: 'metadata.json', type: 'file', descKey: 'fileDesc_metadata' },
    { name: 'package.json', type: 'file', descKey: 'fileDesc_package' },
    { name: 'service-worker.js', type: 'file', descKey: 'fileDesc_sw' },
    { name: 'tailwind.config.js', type: 'file', descKey: 'fileDesc_tailwind' },
    { name: 'translations.ts', type: 'file', descKey: 'fileDesc_translations' },
    { name: 'types.ts', type: 'file', descKey: 'fileDesc_types' },
];

const FileTreeItem: React.FC<{ 
    node: FileNode; 
    path: string; 
    depth: number; 
    selectedPath: string | null;
    onSelect: (node: FileNode, path: string) => void;
}> = ({ node, path, depth, selectedPath, onSelect }) => {
    const [isOpen, setIsOpen] = useState(true); // Default open to show structure
    const currentPath = `${path}/${node.name}`;
    const isSelected = selectedPath === currentPath;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
        }
        onSelect(node, currentPath);
    };

    const getIcon = () => {
        if (node.type === 'folder') {
            return isOpen ? (
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
            ) : (
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
            );
        }
        if (node.name.endsWith('.tsx')) return <span className="text-cyan-400 text-xs font-bold">TSX</span>;
        if (node.name.endsWith('.ts')) return <span className="text-blue-400 text-xs font-bold">TS</span>;
        if (node.name.endsWith('.css')) return <span className="text-pink-400 text-xs font-bold">#</span>;
        if (node.name.endsWith('.json')) return <span className="text-yellow-300 text-xs font-bold">{}</span>;
        if (node.name.endsWith('.html')) return <span className="text-orange-400 text-xs font-bold">&lt;&gt;</span>;
        return <span className="text-gray-400 text-xs">?</span>;
    };

    return (
        <div className="select-none">
            <div 
                className={`flex items-center space-x-2 py-1 px-2 cursor-pointer transition-colors ${isSelected ? 'bg-cyan-900/50 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={handleToggle}
            >
                <span className="w-4 h-4 flex items-center justify-center">{getIcon()}</span>
                <span className={`text-sm ${isSelected ? 'font-semibold' : ''}`}>{node.name}</span>
                {node.type === 'folder' && (
                    <span className="text-xs text-gray-500 ml-auto">
                        {isOpen ? '▼' : '▶'}
                    </span>
                )}
            </div>
            {node.type === 'folder' && isOpen && node.children && (
                <div>
                    {node.children.map(child => (
                        <FileTreeItem 
                            key={child.name} 
                            node={child} 
                            path={currentPath} 
                            depth={depth + 1} 
                            selectedPath={selectedPath}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const AdminPage: React.FC<AdminPageProps> = ({ t, onBack, inputs, isProUser, setProUser }) => {
    const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);

    const handleSelect = (node: FileNode, path: string) => {
        setSelectedNode(node);
        setSelectedPath(path);
    };

    const handleClearDB = async () => {
        if(confirm("Warning: This will delete all saved sources and analysis history. Are you sure?")) {
            try {
                await db.deleteSource('all'); // Not implemented in dbService but standard indexedDB wipe is:
                const req = indexedDB.deleteDatabase('ISOAssistantDB');
                req.onsuccess = () => alert("Database deleted. Please refresh.");
                req.onerror = () => alert("Failed to delete DB.");
            } catch(e) {
                alert("Error clearing DB");
            }
        }
    };

    const handleClearLocalStorage = () => {
        if(confirm("Reset all app settings (theme, language, etc)?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-300">{t('adminPageTitle')}</h2>
                <button onClick={onBack} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                    <span>{t('backButton')}</span>
                </button>
            </div>

            {/* Admin Toolbar */}
            <Card title="System Controls">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center space-x-2 bg-gray-900 p-2 rounded border border-gray-700">
                        <span className="text-gray-300 font-semibold">{t('godMode')}:</span>
                        <button 
                            onClick={() => setProUser(!isProUser)}
                            className={`px-3 py-1 rounded text-xs font-bold ${isProUser ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                        >
                            {isProUser ? t('enableGodMode') : t('disableGodMode')}
                        </button>
                        <span className="text-xs text-gray-500 ml-2">({t('godModeDesc')})</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 bg-gray-900 p-2 rounded border border-gray-700">
                        <span className="text-gray-300 font-semibold">{t('dataManagement')}:</span>
                        <button onClick={handleClearLocalStorage} className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs">{t('clearLocalStorage')}</button>
                        <button onClick={handleClearDB} className="bg-red-900 hover:bg-red-800 text-white px-2 py-1 rounded text-xs">{t('clearIndexedDB')}</button>
                    </div>
                </div>
            </Card>

            {/* Project Explorer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                <div className="lg:col-span-1 bg-gray-900 rounded-lg border border-gray-700 flex flex-col">
                    <div className="p-3 border-b border-gray-700 bg-gray-800 rounded-t-lg">
                        <h3 className="text-sm font-bold text-gray-300">{t('projectExplorer')}</h3>
                        <p className="text-xs text-gray-500 mt-1">{t('projectExplorerDesc')}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 font-mono text-sm">
                        {projectStructure.map(node => (
                            <FileTreeItem 
                                key={node.name} 
                                node={node} 
                                path="" 
                                depth={0} 
                                selectedPath={selectedPath}
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                    <div className="p-2 border-t border-gray-700 bg-gray-800/50 text-xs text-gray-500 text-center">
                        {t('adminStaticStructureWarning')}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {selectedNode ? (
                        <Card title={selectedNode.name} className="h-full flex flex-col">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-700 p-3 rounded">
                                        <span className="text-xs text-gray-400 block">Type</span>
                                        <span className="text-sm font-mono text-white capitalize">{selectedNode.type}</span>
                                    </div>
                                    <div className="bg-gray-700 p-3 rounded">
                                        <span className="text-xs text-gray-400 block">Path</span>
                                        <span className="text-xs font-mono text-cyan-300 break-all">{selectedPath}</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-bold text-gray-300 mb-2 border-b border-gray-600 pb-1">{t('fileRole')}</h4>
                                    <div className="bg-gray-900/50 p-4 rounded border border-gray-700">
                                        <p className="text-gray-200">{t(selectedNode.descKey)}</p>
                                    </div>
                                </div>

                                {selectedNode.type === 'folder' && selectedNode.children && (
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-300 mb-2 border-b border-gray-600 pb-1">Contents</h4>
                                        <ul className="list-disc list-inside text-sm text-gray-400">
                                            {selectedNode.children.map(child => (
                                                <li key={child.name}>{child.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700 border-dashed">
                            <div className="text-center text-gray-500">
                                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <p>{t('adminWelcome')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
