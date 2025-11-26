import React, { useState, useEffect, useCallback } from 'react';
import { getTranslator } from './translations.ts';
import {
    Inputs, Results, AnalysisMode, CountUnit, TargetUnit, Language, DetectionLimitMode,
    View, AnalysisRecord, Detector
} from './types.ts';
import { calculateAll, findK1betaForTarget } from './services/isoCalculations.ts';
import { runMonteCarloSimulation } from './services/monteCarloService.ts';

import InputPanel from './components/InputPanel.tsx';
import ResultsPanel from './components/ResultsPanel.tsx';
import ModeSelector from './components/ModeSelector.tsx';
import ChartPanel from './components/ChartPanel.tsx';
import LanguageSelector from './components/LanguageSelector.tsx';
import ThemeSelector from './components/ThemeSelector.tsx';
import ReportGeneratorModal from './components/ReportGeneratorModal.tsx';
import DecayCalculatorModal from './components/DecayCalculatorModal.tsx';
import ProAccessModal from './components/ProAccessModal.tsx';
import WelcomeModal from './components/WelcomeModal.tsx';
import UpdateNotification from './components/UpdateNotification.tsx';
import TutorialsModal from './components/TutorialsModal.tsx';
import UserGuideModal from './components/UserGuideModal.tsx';
import UnitConverterModal from './components/UnitConverterModal.tsx';
import PeakIdentifierModal from './components/PeakIdentifierModal.tsx';

import SpectroPage from './pages/SpectroPage.tsx';
import SourceManagementPage from './pages/SourceManagementPage.tsx';
import AnalysisHistoryPage from './pages/AnalysisHistoryPage.tsx';
import AdminPage from './pages/AdminPage.tsx';

const defaultInputs: Inputs = {
    grossCount: 100,
    grossCountUnit: CountUnit.COUNTS,
    grossTime: 60,
    backgroundCount: 10,
    backgroundCountUnit: CountUnit.COUNTS,
    backgroundTime: 60,
    roiGrossCount: 100,
    roiChannels: 10,
    backgroundTotalCount: 1000,
    backgroundChannels: 1024,
    probeEfficiency: 10,
    probeArea: 100,
    estimatedBackgroundRate: 0.1,
    targetValue: 1,
    targetUnit: TargetUnit.BQ_CM2,
    conveyorSpeed: 100,
    conveyorSpeedUnit: 'cm_min',
    chamberLength: 100,
    chamberWidth: 50,
    chamberHeight: 50,
    detectors: Array(9).fill(null).map(() => ({
        efficiency: 10,
        background: 1,
        backgroundUnit: CountUnit.CPS,
        type: 'beta',
        length: 30,
        width: 15,
        enabled: true,
    } as Detector)),
    chambreLingeTime: 10,
    chambreLingeTarget: 1,
    chambreLingeTargetUnit: TargetUnit.BQ,
    calibrationFactor: 1,
    calibrationFactorUnit: 'Bq/(c/s)',
    calibrationFactorUncertainty: 5,
    k1alpha: 1.645,
    k1beta: 1.645,
    correlationCoefficient: 0,
    monteCarloMode: false,
    useBayesianMode: false,
    numSimulations: 10000,
};

const App: React.FC = () => {
    const [language, setLanguage] = useState<Language>(Language.FR);
    const [theme, setTheme] = useState('default');
    const [mode, setMode] = useState<AnalysisMode>('standard');
    const [view, setView] = useState<View>('calculator');
    const [inputs, setInputs] = useState<Inputs>(defaultInputs);
    const [results, setResults] = useState<Results | string | null>(null);
    const [isExpertMode, setIsExpertMode] = useState(false);
    const [detectionLimitMode, setDetectionLimitMode] = useState<DetectionLimitMode>('calculate');
    const [targetDetectionLimit, setTargetDetectionLimit] = useState(10);
    const [autoW, setAutoW] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

    // Modals
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isDecayCalculatorOpen, setIsDecayCalculatorOpen] = useState(false);
    const [isProAccessModalOpen, setIsProAccessModalOpen] = useState(false);
    const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
    const [isTutorialsModalOpen, setIsTutorialsModalOpen] = useState(false);
    const [isUserGuideModalOpen, setIsUserGuideModalOpen] = useState(false);
    const [isUnitConverterOpen, setIsUnitConverterOpen] = useState(false);
    const [isPeakIdentifierOpen, setIsPeakIdentifierOpen] = useState(false);
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

    const [isProUser, setIsProUser] = useState(false);
    const [analysisToLoad, setAnalysisToLoad] = useState<AnalysisRecord | null>(null);

    const t = getTranslator(language);

    useEffect(() => {
        // Apply theme
        document.documentElement.className = theme;
        if (theme === 'lab') {
            document.documentElement.style.setProperty('--bg-color', '#f3f4f6');
            document.documentElement.style.setProperty('--text-color', '#1f2937');
        } else {
            document.documentElement.style.removeProperty('--bg-color');
            document.documentElement.style.removeProperty('--text-color');
        }
    }, [theme]);

    useEffect(() => {
        const storedPro = localStorage.getItem('isProUser');
        if (storedPro === 'true') setIsProUser(true);
        
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
            setIsWelcomeModalOpen(true);
            localStorage.setItem('hasSeenWelcome', 'true');
        }
    }, []);

    // Calculation Logic
    useEffect(() => {
        setIsCalculating(true);
        const timer = setTimeout(() => {
            try {
                let calculatedResults: Results | string;
                
                const t_g = (mode === 'chambre' || mode === 'linge') ? inputs.chambreLingeTime : inputs.grossTime;
                const t_0 = inputs.backgroundTime;
                
                let effectiveW = inputs.calibrationFactor;
                
                // Auto W Logic
                if (autoW) {
                    if (mode === 'surface' && inputs.probeArea > 0 && inputs.probeEfficiency > 0) {
                        effectiveW = 1 / ((inputs.probeEfficiency / 100) * inputs.probeArea);
                    } else if ((mode === 'chambre' || mode === 'linge') && inputs.detectors.length > 0) {
                        const activeDetectors = inputs.detectors.filter(d => d.enabled);
                        if (activeDetectors.length > 0) {
                            let totalEffArea = 0;
                            activeDetectors.forEach(d => {
                                totalEffArea += (d.efficiency / 100) * (d.length * d.width);
                            });
                            if (totalEffArea > 0) effectiveW = 1 / totalEffArea;
                        }
                    }
                }

                // Linge: Effective time calculation based on speed
                let effectiveTg = t_g;
                if (mode === 'linge' && inputs.conveyorSpeed > 0) {
                    const activeDetectors = inputs.detectors.filter(d => d.enabled);
                    if (activeDetectors.length > 0) {
                        // Use average length of detectors in movement direction
                        const avgLength = activeDetectors.reduce((sum, d) => sum + d.length, 0) / activeDetectors.length;
                        // Speed is in cm/min or m/min
                        const speedCmSec = inputs.conveyorSpeedUnit === 'm_min' 
                            ? (inputs.conveyorSpeed * 100) / 60 
                            : inputs.conveyorSpeed / 60;
                        
                        if (speedCmSec > 0) {
                            effectiveTg = avgLength / speedCmSec;
                        }
                    }
                }
                
                // Chambre/Linge: Aggregate background
                let effectiveBkgCount = inputs.backgroundCount;
                if (mode === 'chambre' || mode === 'linge') {
                    const activeDetectors = inputs.detectors.filter(d => d.enabled);
                    effectiveBkgCount = activeDetectors.reduce((sum, d) => {
                        let rate = d.background;
                        if (d.backgroundUnit === CountUnit.CPM) rate /= 60;
                        if (d.backgroundUnit === CountUnit.C_02S) rate /= 0.2;
                        return sum + rate;
                    }, 0);
                }

                const params = {
                    mode,
                    inputs: { 
                        ...inputs, 
                        calibrationFactor: effectiveW,
                        backgroundCount: (mode === 'chambre' || mode === 'linge') ? effectiveBkgCount : inputs.backgroundCount,
                        chambreLingeTime: effectiveTg // Use calculated time for these modes
                    },
                    t_g: (mode === 'chambre' || mode === 'linge') ? effectiveTg : inputs.grossTime,
                    t_0: t_0,
                    w: effectiveW,
                    u_rel_w: inputs.calibrationFactorUncertainty / 100,
                    k1alpha: inputs.k1alpha,
                    k1beta: inputs.k1beta,
                    correlationCoefficient: inputs.correlationCoefficient,
                    numSimulations: inputs.numSimulations
                };

                if (inputs.monteCarloMode) {
                    calculatedResults = runMonteCarloSimulation(params, t);
                } else {
                    if (detectionLimitMode === 'target') {
                        // Conversion for target limit if necessary (e.g. surface units to Bq)
                        let targetInBq = targetDetectionLimit;
                        // Simple pass-through for now, assuming user inputs Bq equivalent or service handles it
                        // Ideally, findK1betaForTarget should handle unit conversion or expect Bq. 
                        // Given current service implementation, it expects value comparable to 'y'.
                        
                        const k1beta = findK1betaForTarget(params, targetInBq, t);
                        if (typeof k1beta === 'number') {
                             calculatedResults = calculateAll({ ...params, k1beta }, t);
                        } else {
                             calculatedResults = k1beta; // Error string
                        }
                    } else {
                        calculatedResults = calculateAll(params, t);
                    }
                }
                
                setResults(calculatedResults);
                
                // Sync back auto-calculated values for display if needed
                if (autoW && effectiveW !== inputs.calibrationFactor) {
                    // We don't invoke setInputs here to avoid loop, just use effectiveW in calculation
                    // But for UI consistency we might want to show it. 
                    // The InputPanel handles disabled input display if we passed effectiveW, but we passed inputs.
                }

            } catch (e) {
                setResults(t('error'));
                console.error(e);
            } finally {
                setIsCalculating(false);
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [inputs, mode, detectionLimitMode, targetDetectionLimit, autoW, t]);


    const handleInputChange = useCallback((name: keyof Inputs, value: any) => {
        setInputs(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleDetectorChange = useCallback((index: number, field: keyof Detector, value: any) => {
        setInputs(prev => {
            const newDetectors = [...prev.detectors];
            newDetectors[index] = { ...newDetectors[index], [field]: value };
            return { ...prev, detectors: newDetectors };
        });
    }, []);

    const handleApplyDecay = (newActivity: number, newUncertainty: number) => {
        setInputs(prev => {
            let r_net = 0;
            
            const getRate = (count: number, unit: CountUnit, time: number) => {
                if (time <= 0) return 0;
                switch(unit) {
                    case CountUnit.COUNTS: return count / time;
                    case CountUnit.CPS: return count;
                    case CountUnit.CPM: return count / 60;
                    case CountUnit.C_02S: return count / 0.2;
                    default: return 0;
                }
            };

            if (mode === 'spectrometry') {
                const t_g = prev.grossTime;
                const t_0 = prev.backgroundTime;
                const r_g = t_g > 0 ? prev.roiGrossCount / t_g : 0;
                
                const channel_ratio = prev.roiChannels > 0 && prev.backgroundChannels > 0 ? prev.roiChannels / prev.backgroundChannels : 1;
                const r_0_total = t_0 > 0 ? prev.backgroundTotalCount / t_0 : 0;
                const r_0 = r_0_total * channel_ratio;
                
                r_net = Math.max(0, r_g - r_0);
            } else {
                const r_g = getRate(prev.grossCount, prev.grossCountUnit, prev.grossTime);
                const r_0 = getRate(prev.backgroundCount, prev.backgroundCountUnit, prev.backgroundTime);
                r_net = Math.max(0, r_g - r_0);
            }

            let newW = newActivity;
            // Application de la formule w = A / R_net (Activité / Taux net)
            if (r_net > 0) {
                newW = newActivity / r_net;
            }

            return {
                ...prev,
                calibrationFactor: newW,
                calibrationFactorUncertainty: newUncertainty
            };
        });
        setIsDecayCalculatorOpen(false);
    };

    const loadConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loaded = JSON.parse(e.target?.result as string);
                if (loaded.inputs) setInputs(loaded.inputs);
                if (loaded.mode) setMode(loaded.mode);
            } catch (err) {
                alert("Invalid config file");
            }
        };
        reader.readAsText(file);
    };

    const saveConfig = () => {
        const data = { inputs, mode, version: "6.4.6" };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "iso-assistant-config.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    // View Routing
    const renderView = () => {
        switch (view) {
            case 'spectro':
                return <SpectroPage 
                    t={t} 
                    onOpenPeakIdentifier={() => setIsPeakIdentifierOpen(true)} 
                    analysisToLoad={analysisToLoad}
                    clearAnalysisToLoad={() => setAnalysisToLoad(null)}
                />;
            case 'sources':
                return <SourceManagementPage t={t} />;
            case 'history':
                return <AnalysisHistoryPage t={t} onLoadAnalysis={(record) => {
                    setAnalysisToLoad(record);
                    setView('spectro');
                }} />;
            case 'admin':
                return <AdminPage t={t} onBack={() => setView('calculator')} inputs={inputs} results={results} isProUser={isProUser} setProUser={setIsProUser} />;
            case 'calculator':
            default:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
                        <div className="space-y-6">
                            <InputPanel 
                                inputs={inputs} 
                                onInputChange={handleInputChange} 
                                onDetectorChange={handleDetectorChange}
                                mode={mode} 
                                t={t} 
                                isExpertMode={isExpertMode}
                                onExpertModeToggle={() => setIsExpertMode(!isExpertMode)}
                                onRunSimulation={() => {}} // Auto-runs now
                                onSaveConfig={saveConfig}
                                onLoadConfig={loadConfig}
                                onOpenDecayCalculator={() => setIsDecayCalculatorOpen(true)}
                                isCalculating={isCalculating}
                                results={results}
                                autoW={autoW}
                                onAutoWChange={setAutoW}
                            />
                        </div>
                        <div className="space-y-6">
                            <ResultsPanel 
                                results={results} 
                                t={t} 
                                inputs={inputs} 
                                mode={mode}
                                detectionLimitMode={detectionLimitMode}
                                onDetectionLimitModeChange={setDetectionLimitMode}
                                targetDetectionLimit={targetDetectionLimit}
                                onTargetDetectionLimitChange={setTargetDetectionLimit}
                                isExpertMode={isExpertMode}
                                isCalculating={isCalculating}
                                onOpenReportModal={() => setIsReportModalOpen(true)}
                            />
                            <ChartPanel 
                                results={typeof results !== 'string' ? results : null} 
                                t={t} 
                                mode={mode} 
                                calibrationFactorUnit={inputs.calibrationFactorUnit} 
                            />
                        </div>
                    </div>
                );
        }
    };

    const handleProFeatureClick = (targetView: View) => {
        if (isProUser) {
            setView(targetView);
        } else {
            setIsProAccessModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans transition-colors duration-300">
            {/* Header */}
            <header className="bg-gray-800 shadow-md sticky top-0 z-40 border-b border-gray-700 print-hidden">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="bg-cyan-500 p-2 rounded-lg shadow-lg shadow-cyan-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-100 tracking-tight">{t('isoCalculator')}</h1>
                            <p className="text-xs text-gray-400">ISO 11929:2019 • v6.4.6</p>
                        </div>
                    </div>
                    
                    <div className="hidden md:flex items-center space-x-6">
                        <nav className="flex space-x-1 bg-gray-700 p-1 rounded-lg">
                            <button onClick={() => setView('calculator')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${view === 'calculator' ? 'bg-gray-600 text-white shadow' : 'text-gray-300 hover:text-white hover:bg-gray-600/50'}`}>{t('isoCalculator')}</button>
                            <button onClick={() => handleProFeatureClick('spectro')} className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center ${view === 'spectro' ? 'bg-gray-600 text-white shadow' : 'text-gray-300 hover:text-white hover:bg-gray-600/50'}`}>
                                {t('spectrometryTools')} {!isProUser && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                            </button>
                            <button onClick={() => setView('sources')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${view === 'sources' ? 'bg-gray-600 text-white shadow' : 'text-gray-300 hover:text-white hover:bg-gray-600/50'}`}>{t('sourceManagement')}</button>
                            <button onClick={() => handleProFeatureClick('history')} className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center ${view === 'history' ? 'bg-gray-600 text-white shadow' : 'text-gray-300 hover:text-white hover:bg-gray-600/50'}`}>
                                {t('analysisHistory')} {!isProUser && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                            </button>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Tools Menu */}
                        <div className="relative group">
                            <button className="p-2 rounded-md bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600 flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                                <span className="hidden sm:inline text-sm">{t('toolsMenu')}</span>
                            </button>
                            <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl hidden group-hover:block z-50">
                                <button onClick={() => setIsDecayCalculatorOpen(true)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white first:rounded-t-lg">{t('decayCalculator')}</button>
                                <button onClick={() => setIsPeakIdentifierOpen(true)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">{t('identifyPeaks')}</button>
                                <button onClick={() => setIsUnitConverterOpen(true)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">{t('unitConverter')}</button>
                                <div className="border-t border-gray-700 my-1"></div>
                                <button onClick={() => setIsTutorialsModalOpen(true)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">{t('tutorialsAndExamples')}</button>
                                <button onClick={() => setIsUserGuideModalOpen(true)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">{t('userGuide')}</button>
                                <button onClick={() => setIsWelcomeModalOpen(true)} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">{t('showWelcomeTooltip')}</button>
                                <div className="border-t border-gray-700 my-1"></div>
                                <button onClick={() => !isProUser && setIsProAccessModalOpen(true)} className={`block w-full text-left px-4 py-2 text-sm ${isProUser ? 'text-green-400 cursor-default' : 'text-yellow-400 hover:bg-gray-700 hover:text-yellow-300'} last:rounded-b-lg`}>
                                    {isProUser ? t('proVersion') : t('unlockPro')}
                                </button>
                                <button onClick={() => setView('admin')} className="block w-full text-left px-4 py-2 text-xs text-gray-500 hover:bg-gray-700 hover:text-gray-300 last:rounded-b-lg">Admin</button>
                            </div>
                        </div>

                        <ThemeSelector currentTheme={theme} setTheme={setTheme} t={t} />
                        <LanguageSelector currentLanguage={language} setLanguage={setLanguage} t={t} />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8 print-main">
                {view === 'calculator' && (
                    <div className="mb-8 print-hidden">
                        <ModeSelector currentMode={mode} onModeChange={setMode} t={t} />
                    </div>
                )}
                
                {renderView()}
            </main>

            <footer className="border-t border-gray-800 mt-12 py-8 text-center text-gray-500 text-sm print-hidden">
                <p>{t('authorDetails')}</p>
                <p className="mt-1">{t('authorCredit')}</p>
            </footer>

            {/* Modals */}
            <ReportGeneratorModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} inputs={inputs} results={results} t={t} />
            <DecayCalculatorModal 
                isOpen={isDecayCalculatorOpen} 
                onClose={() => setIsDecayCalculatorOpen(false)} 
                onApply={handleApplyDecay} 
                t={t}
                initialActivity={inputs.calibrationFactor}
                initialUncertainty={inputs.calibrationFactorUncertainty}
                unit={inputs.calibrationFactorUnit}
            />
            <ProAccessModal isOpen={isProAccessModalOpen} onClose={() => setIsProAccessModalOpen(false)} onSuccess={() => { setIsProUser(true); localStorage.setItem('isProUser', 'true'); setIsProAccessModalOpen(false); }} t={t} />
            <WelcomeModal isOpen={isWelcomeModalOpen} onClose={() => setIsWelcomeModalOpen(false)} t={t} />
            <UpdateNotification isOpen={isUpdateAvailable} onUpdate={() => window.location.reload()} t={t} />
            <TutorialsModal isOpen={isTutorialsModalOpen} onClose={() => setIsTutorialsModalOpen(false)} t={t} />
            <UserGuideModal isOpen={isUserGuideModalOpen} onClose={() => setIsUserGuideModalOpen(false)} t={t} />
            <UnitConverterModal isOpen={isUnitConverterOpen} onClose={() => setIsUnitConverterOpen(false)} t={t} />
            <PeakIdentifierModal isOpen={isPeakIdentifierOpen} onClose={() => setIsPeakIdentifierOpen(false)} t={t} />
        </div>
    );
};

export default App;