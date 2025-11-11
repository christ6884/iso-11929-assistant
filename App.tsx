import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// Fix: Corrected import paths
import { Language, View, AnalysisMode, Inputs, Results, Detector, CountUnit, TargetUnit, DetectionLimitMode } from './types';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import ChartPanel from './components/ChartPanel';
import ModeSelector from './components/ModeSelector';
import LanguageSelector from './components/LanguageSelector';
import ThemeSelector from './components/ThemeSelector';
import WelcomeModal from './components/WelcomeModal';
import UserGuideModal from './components/UserGuideModal';
import PeakIdentifierModal from './components/PeakIdentifierModal';
import DecayCalculatorModal from './components/DecayCalculatorModal';
import ProAccessModal from './components/ProAccessModal';
import UnitConverterModal from './components/UnitConverterModal';
import SpectroPage from './pages/SpectroPage';
import SourceManagementPage from './pages/SourceManagementPage';
import BackgroundSubtractionPage from './pages/BackgroundSubtractionPage';
import UpdateNotification from './components/UpdateNotification';
// Fix: Corrected import paths
import { getTranslator } from './translations';
import { calculateAll, findK1betaForTarget } from './services/isoCalculations';
import { runMonteCarloSimulation } from './services/monteCarloService';

// Default state for inputs
const defaultDetectors: Detector[] = Array(10).fill(null).map(() => ({
    efficiency: 50,
    background: 10,
    backgroundUnit: CountUnit.CPS,
    type: 'beta',
    length: 50,
    width: 10,
    enabled: true,
}));

const initialInputs: Inputs = {
  grossCount: 120,
  grossCountUnit: CountUnit.COUNTS,
  grossTime: 60,
  backgroundCount: 600,
  backgroundCountUnit: CountUnit.COUNTS,
  backgroundTime: 600,
  roiGrossCount: 50,
  roiChannels: 20,
  backgroundTotalCount: 10000,
  backgroundChannels: 1024,
  probeEfficiency: 25,
  probeArea: 100,
  estimatedBackgroundRate: 10,
  targetValue: 0.4,
  targetUnit: TargetUnit.BQ_CM2,
  conveyorSpeed: 5,
  conveyorSpeedUnit: 'm_min',
  chamberLength: 100,
  chamberWidth: 50,
  chamberHeight: 50,
  detectors: defaultDetectors,
  chambreLingeTime: 10,
  chambreLingeTarget: 100,
  chambreLingeTargetUnit: TargetUnit.BQ,
  calibrationFactor: 1,
  calibrationFactorUnit: 'Bq/(c/s)',
  calibrationFactorUncertainty: 5,
  k1alpha: 1.645,
  k1beta: 1.645,
  correlationCoefficient: 0,
  monteCarloMode: false,
  numSimulations: 10000,
};

const App: React.FC = () => {
    const [language, setLanguage] = useState<Language>(Language.FR);
    const [t, setT] = useState(() => getTranslator(Language.FR));
    const [view, setView] = useState<View>('calculator');
    const [isExpertMode, setIsExpertMode] = useState(false);
    const [theme, setTheme] = useState<string>('default');
    
    const [inputs, setInputs] = useState<Inputs>(initialInputs);
    const [results, setResults] = useState<Results | string | null>(null);
    const [mode, setMode] = useState<AnalysisMode>('standard');
    
    const [detectionLimitMode, setDetectionLimitMode] = useState<DetectionLimitMode>('calculate');
    const [targetDetectionLimit, setTargetDetectionLimit] = useState(100);
    const [isCalculating, setIsCalculating] = useState(true);
    const [autoW, setAutoW] = useState(true);
    
    const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(() => !localStorage.getItem('hasSeenWelcome'));
    const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);
    const [isPeakIdentifierOpen, setIsPeakIdentifierOpen] = useState(false);
    const [isDecayCalculatorOpen, setIsDecayCalculatorOpen] = useState(false);
    const [isUnitConverterOpen, setIsUnitConverterOpen] = useState(false);
    const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

    const [isProUser, setIsProUser] = useState(false);
    const [isProModalOpen, setIsProModalOpen] = useState(false);

    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const waitingWorkerRef = useRef<ServiceWorker | null>(null);

    const toolsMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (localStorage.getItem('isProUser') === 'true') {
            setIsProUser(true);
        }
        const savedTheme = localStorage.getItem('app-theme') || 'default';
        setTheme(savedTheme);
        
        // Service Worker Update Logic
        if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
            // Only register the service worker on http or https protocols to avoid errors in sandboxed environments (like 'blob:' URLs).
            navigator.serviceWorker.register('service-worker.js').then(reg => {
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                waitingWorkerRef.current = installingWorker;
                                setIsUpdateAvailable(true);
                            }
                        };
                    }
                };
            }).catch(error => {
                console.error('Service worker registration failed:', error);
            });
        }
    }, []);

    const handleUpdate = () => {
        if (waitingWorkerRef.current) {
            waitingWorkerRef.current.postMessage({ type: 'SKIP_WAITING' });
            waitingWorkerRef.current = null;
            setIsUpdateAvailable(false);
            // Reload the page once the new service worker has taken control.
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    };

    useEffect(() => {
        localStorage.setItem('app-theme', theme);
        document.documentElement.classList.remove('theme-lab', 'theme-forest');
        if (theme !== 'default') {
            document.documentElement.classList.add(`theme-${theme}`);
        }
    }, [theme]);

    useEffect(() => {
        if (!isToolsMenuOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
                setIsToolsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isToolsMenuOpen]);

    const autoCalculatedW = useMemo(() => {
        if (!autoW || (mode !== 'chambre' && mode !== 'linge')) {
            return null;
        }
        const activeDetectors = inputs.detectors.filter(d => d.enabled);
        if (activeDetectors.length === 0) return null;
        
        const avgEfficiency = activeDetectors.reduce((sum, d) => sum + d.efficiency / 100, 0) / activeDetectors.length;
        
        return avgEfficiency > 0 ? 1 / avgEfficiency : null;
    }, [autoW, mode, inputs.detectors]);

    useEffect(() => {
        if (autoCalculatedW !== null && 
            (autoCalculatedW !== inputs.calibrationFactor || inputs.calibrationFactorUnit !== 'Bq/(c/s)')) {
            setInputs(prev => ({
                ...prev,
                calibrationFactor: autoCalculatedW,
                calibrationFactorUnit: 'Bq/(c/s)',
                calibrationFactorUncertainty: 5, // Reset uncertainty to a default for auto-calc
            }));
        }
    }, [autoCalculatedW, inputs.calibrationFactor, inputs.calibrationFactorUnit]);
    
    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        setT(() => getTranslator(lang));
    };

    const handleInputChange = (name: keyof Inputs, value: any) => {
        setInputs(prev => ({ ...prev, [name]: value }));
    };
    
    const handleDetectorChange = (index: number, field: keyof Detector, value: any) => {
        setInputs(prev => {
            const newDetectors = [...prev.detectors];
            newDetectors[index] = { ...newDetectors[index], [field]: value };
            return { ...prev, detectors: newDetectors };
        });
    };
    
    const handleCloseWelcome = () => {
        localStorage.setItem('hasSeenWelcome', 'true');
        setIsWelcomeModalOpen(false);
    };
    
    const handleUnlockSuccess = () => {
        localStorage.setItem('isProUser', 'true');
        setIsProUser(true);
        setIsProModalOpen(false);
        alert(t('proUnlockedSuccess'));
    };

    const calculate = useCallback(() => {
        setIsCalculating(true);
        setTimeout(() => {
            let t_g = inputs.grossTime;
            let t_0 = inputs.backgroundTime;
            let w = inputs.calibrationFactor;
            if (inputs.calibrationFactorUnit.toLowerCase().startsWith('dpm')) {
                w = inputs.calibrationFactor / 60; // Convert dpm to Bq
            }
            let u_rel_w = inputs.calibrationFactorUncertainty / 100;
            let currentInputs = { ...inputs };

            if (mode === 'surface') {
                t_0 = 1;
                if (autoW) {
                    w = (inputs.probeEfficiency / 100) * inputs.probeArea;
                    u_rel_w = 0;
                }
                currentInputs = {
                    ...inputs,
                    backgroundCount: inputs.estimatedBackgroundRate,
                    backgroundCountUnit: CountUnit.CPS,
                    backgroundTime: 1,
                };
            } else if (mode === 'chambre' || mode === 'linge') {
                const activeDetectors = inputs.detectors.filter(d => d.enabled);
                if (activeDetectors.length === 0) {
                    setResults(t('noActiveDetectors'));
                    setIsCalculating(false);
                    return;
                }
                
                t_0 = 1;

                if (mode === 'linge') {
                    const speed_cm_s = (inputs.conveyorSpeedUnit === 'm_min' ? inputs.conveyorSpeed * 100 : inputs.conveyorSpeed) / 60;
                    if (speed_cm_s <= 0) {
                        setResults(t('positiveSpeedError'));
                        setIsCalculating(false);
                        return;
                    }
                    const avgDetectorWidth = activeDetectors.length > 0 ? activeDetectors.reduce((sum, d) => sum + d.width, 0) / activeDetectors.length : 0;
                    t_g = avgDetectorWidth > 0 ? avgDetectorWidth / speed_cm_s : 0;
                } else { // chambre
                    t_g = inputs.chambreLingeTime;
                }
                
                const totalBackgroundRate = activeDetectors.reduce((sum, d) => {
                    let rateInCPS = 0;
                    switch (d.backgroundUnit) {
                        case CountUnit.CPS:
                            rateInCPS = d.background;
                            break;
                        case CountUnit.CPM:
                            rateInCPS = d.background / 60;
                            break;
                        case CountUnit.C_02S:
                            rateInCPS = d.background / 0.2;
                            break;
                        default:
                            rateInCPS = d.background; 
                    }
                    return sum + rateInCPS;
                }, 0);

                currentInputs = {
                    ...inputs,
                    backgroundCount: totalBackgroundRate,
                    backgroundCountUnit: CountUnit.CPS,
                    backgroundTime: 1,
                };
            }
            
            const baseInputs = {
                mode, 
                inputs: currentInputs, 
                t_g, t_0, w, u_rel_w,
                k1alpha: inputs.k1alpha,
                correlationCoefficient: inputs.correlationCoefficient
            };

            if (detectionLimitMode === 'target' && (mode === 'standard' || mode === 'spectrometry')) {
                const k1betaResult = findK1betaForTarget(baseInputs, targetDetectionLimit, t);
                if (typeof k1betaResult === 'number') {
                    const finalResult = inputs.monteCarloMode
                        ? runMonteCarloSimulation({ ...baseInputs, k1beta: k1betaResult, numSimulations: inputs.numSimulations }, t)
                        : calculateAll({ ...baseInputs, k1beta: k1betaResult }, t);
                    setResults(finalResult);
                    setInputs(prev => ({...prev, k1beta: k1betaResult}));
                } else {
                    setResults(k1betaResult);
                }
            } else {
                const result = inputs.monteCarloMode
                    ? runMonteCarloSimulation({ ...baseInputs, k1beta: inputs.k1beta, numSimulations: inputs.numSimulations }, t)
                    : calculateAll({ ...baseInputs, k1beta: inputs.k1beta }, t);
                setResults(result);
            }
            
            setIsCalculating(false);
        }, 50);
    }, [inputs, mode, t, detectionLimitMode, targetDetectionLimit, autoW]);

    useEffect(() => {
        calculate();
    }, [calculate]);

    const handleSaveConfig = () => {
        const config = { inputs, mode, isExpertMode, autoW, detectionLimitMode, targetDetectionLimit };
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `iso-assistant-config-${mode}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const handleLoadConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const config = JSON.parse(e.target?.result as string);
                    setInputs(prev => ({ ...prev, ...config.inputs, detectors: config.inputs.detectors || defaultDetectors }));
                    setMode(config.mode || 'standard');
                    setIsExpertMode(config.isExpertMode || false);
                    setAutoW(config.autoW ?? true);
                    setDetectionLimitMode(config.detectionLimitMode || 'calculate');
                    setTargetDetectionLimit(config.targetDetectionLimit || 100);
                } catch (err) {
                    console.error("Failed to load config", err);
                    alert("Invalid configuration file.");
                }
            };
            reader.readAsText(file);
        }
    };
    
    const handleApplyDecay = (newActivity: number, newUncertainty: number) => {
        setInputs(prev => ({...prev, calibrationFactor: newActivity, calibrationFactorUncertainty: newUncertainty}));
        setIsDecayCalculatorOpen(false);
    };

    const renderCalculatorView = () => (
        <>
            <div className="flex justify-center mb-6">
                <ModeSelector currentMode={mode} onModeChange={setMode} t={t} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <InputPanel 
                        inputs={inputs}
                        onInputChange={handleInputChange}
                        onDetectorChange={handleDetectorChange}
                        mode={mode}
                        t={t}
                        isExpertMode={isExpertMode}
                        onExpertModeToggle={() => setIsExpertMode(p => !p)}
                        onRunSimulation={calculate}
                        onSaveConfig={handleSaveConfig}
                        onLoadConfig={handleLoadConfig}
                        onOpenDecayCalculator={() => setIsDecayCalculatorOpen(true)}
                        isCalculating={isCalculating}
                        results={results}
                        autoW={autoW}
                        onAutoWChange={setAutoW}
                    />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <ResultsPanel
                        results={results}
                        t={t}
                        inputs={inputs}
                        mode={mode}
                        detectionLimitMode={detectionLimitMode}
                        onDetectionLimitModeChange={setDetectionLimitMode}
                        targetDetectionLimit={targetDetectionLimit}
                        onTargetDetectionLimitChange={setTargetDetectionLimit}
                        isCalculating={isCalculating}
                    />
                    <ChartPanel
                        results={typeof results === 'string' ? null : results}
                        t={t}
                        mode={mode}
                        calibrationFactorUnit={inputs.calibrationFactorUnit}
                    />
                </div>
            </div>
        </>
    );

    const handleNavItemClick = (targetView: View) => {
        const lockedViews: View[] = ['spectro']; 
        if (lockedViews.includes(targetView) && !isProUser) {
            setIsProModalOpen(true);
        } else {
            setView(targetView);
        }
    };

    const renderView = () => {
        switch(view) {
            case 'calculator':
                return renderCalculatorView();
            case 'spectro':
                return <SpectroPage t={t} onOpenPeakIdentifier={() => setIsPeakIdentifierOpen(true)} />;
            case 'sources':
                return <SourceManagementPage t={t} />;
            default:
                return renderCalculatorView();
        }
    };
    
    const navItems = [
        { key: 'calculator', label: t('isoCalculator'), locked: false },
        { key: 'spectro', label: t('spectrometryTools'), locked: true },
        { key: 'sources', label: t('sourceManagement'), locked: false },
    ];

    return (
        <div className="bg-gray-900 min-h-screen text-white font-sans p-4 sm:p-6 lg:p-8">
            <header className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400">ISO 11929 Assistant</h1>
                        <p className="text-xs text-gray-500">{t('authorDetails')}</p>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {isProUser ? (
                            <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-3 py-1 rounded-full shadow-lg">{t('proVersion')}</span>
                        ) : (
                            <button onClick={() => setIsProModalOpen(true)} className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 p-2 rounded-md bg-gray-800 border border-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                <span className="hidden sm:inline">{t('unlockPro')}</span>
                            </button>
                        )}
                        <button onClick={() => setIsUnitConverterOpen(true)} title={t('unitConverter')} className="p-2 rounded-md bg-gray-800 border border-gray-700 text-gray-300 hover:text-cyan-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                            </svg>
                        </button>
                        <button onClick={() => setIsPeakIdentifierOpen(true)} title={t('identifyPeaks')} className="p-2 rounded-md bg-gray-800 border border-gray-700 text-gray-300 hover:text-cyan-400 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                        </button>

                        <div className="relative" ref={toolsMenuRef}>
                             <button onClick={() => setIsToolsMenuOpen(prev => !prev)} title={t('toolsMenu')} className="p-2 rounded-md bg-gray-800 border border-gray-700 text-gray-300 hover:text-cyan-400 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                            </button>
                            {isToolsMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
                                    <a href="#" onClick={(e) => { e.preventDefault(); setIsUserGuideOpen(true); setIsToolsMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">{t('userGuide')}</a>
                                    <a href="#" onClick={(e) => { e.preventDefault(); setIsWelcomeModalOpen(true); setIsToolsMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">{t('showWelcomeTooltip')}</a>
                                </div>
                            )}
                        </div>
                        <ThemeSelector currentTheme={theme} setTheme={setTheme} t={t} />
                        <LanguageSelector currentLanguage={language} setLanguage={handleLanguageChange} t={t} />
                    </div>
                </div>
                <nav className="flex flex-wrap gap-2 text-sm border-b border-gray-700 pb-2">
                    {navItems.map(item => (
                        <button key={item.key} onClick={() => handleNavItemClick(item.key as View)}
                            className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center space-x-2 ${view === item.key ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                            title={item.locked && !isProUser ? t('lockedFeature') : item.label}>
                            <span>{item.label}</span>
                             {item.locked && !isProUser && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    ))}
                </nav>
            </header>

            <main>
                {renderView()}
            </main>
            
            <UpdateNotification isOpen={isUpdateAvailable} onUpdate={handleUpdate} t={t} />
            <WelcomeModal isOpen={isWelcomeModalOpen} onClose={handleCloseWelcome} t={t} />
            <UserGuideModal isOpen={isUserGuideOpen} onClose={() => setIsUserGuideOpen(false)} t={t} />
            <PeakIdentifierModal isOpen={isPeakIdentifierOpen} onClose={() => setIsPeakIdentifierOpen(false)} t={t} />
            <DecayCalculatorModal 
                isOpen={isDecayCalculatorOpen}
                onClose={() => setIsDecayCalculatorOpen(false)}
                onApply={handleApplyDecay}
                t={t}
                initialActivity={inputs.calibrationFactor}
                initialUncertainty={inputs.calibrationFactorUncertainty}
                unit={inputs.calibrationFactorUnit.split('/')[0] || 'Bq'}
            />
            <UnitConverterModal 
                isOpen={isUnitConverterOpen}
                onClose={() => setIsUnitConverterOpen(false)}
                t={t}
            />
            <ProAccessModal 
                isOpen={isProModalOpen}
                onClose={() => setIsProModalOpen(false)}
                onSuccess={handleUnlockSuccess}
                t={t}
            />

            <footer className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-800">
                <p>{t('authorCredit')}</p>
            </footer>
        </div>
    );
}

export default App;