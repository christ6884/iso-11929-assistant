import React, { useState, useEffect } from 'react';
import SpectrumAnalyzerPage from './SpectrumAnalyzerPage';
import N42AnalyzerPage from './N42AnalyzerPage';
import BackgroundSubtractionPage from './BackgroundSubtractionPage';
import Card from '../components/Card';
import InfoTooltip from '../components/InfoTooltip';
import { AnalysisRecord } from '../types';

interface SpectroPageProps {
    t: any;
    onOpenPeakIdentifier: () => void;
    analysisToLoad: AnalysisRecord | null;
    clearAnalysisToLoad: () => void;
}

const SpectroPage: React.FC<SpectroPageProps> = ({ t, onOpenPeakIdentifier, analysisToLoad, clearAnalysisToLoad }) => {
    const [mode, setMode] = useState<'selection' | 'image' | 'n42' | 'bkg'>('selection');
    const [analysisType, setAnalysisType] = useState<'gamma' | 'alpha'>('gamma');

    useEffect(() => {
        if (analysisToLoad) {
            setMode(analysisToLoad.analysisType);
            // The data will be consumed by the specific analyzer page, 
            // and we clear it here so it's not re-loaded on subsequent renders.
        }
    }, [analysisToLoad]);

    const handleBack = () => {
        setMode('selection');
        if (analysisToLoad) {
            clearAnalysisToLoad();
        }
    }

    if (mode === 'image') {
        const dataToLoad = analysisToLoad?.analysisType === 'image' ? analysisToLoad.data : undefined;
        return <SpectrumAnalyzerPage t={t} onBack={handleBack} onOpenPeakIdentifier={onOpenPeakIdentifier} analysisType={analysisType} dataToLoad={dataToLoad} />;
    }

    if (mode === 'n42') {
        const dataToLoad = analysisToLoad?.analysisType === 'n42' ? analysisToLoad.data : undefined;
        return <N42AnalyzerPage t={t} onBack={handleBack} onOpenPeakIdentifier={onOpenPeakIdentifier} analysisType={analysisType} dataToLoad={dataToLoad} />;
    }
    
    if (mode === 'bkg') {
        return <BackgroundSubtractionPage t={t} onBack={handleBack} onOpenPeakIdentifier={onOpenPeakIdentifier} analysisType={analysisType} />;
    }
    
    const handleKeyDown = (e: React.KeyboardEvent, newMode: 'image' | 'n42' | 'bkg') => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setMode(newMode);
        }
    };

    const tools = [
        {
            key: 'image',
            title: 'spectroMenuImageTitle',
            desc: 'spectroMenuImageDesc',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
        },
        {
            key: 'n42',
            title: 'spectroMenuN42Title',
            desc: 'spectroMenuN42Desc',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
        },
        {
            key: 'bkg',
            title: 'spectroMenuBkgSubTitle',
            desc: 'spectroMenuBkgSubDesc',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 00-1 1v1.333a2 2 0 00-1.083.504l-.88-.88a1 1 0 00-1.414 1.414l.88.88A2 2 0 005.333 8H4a1 1 0 00-1 1v2a1 1 0 001 1h1.333a2 2 0 00.504 1.083l-.88.88a1 1 0 001.414 1.414l.88-.88a2 2 0 001.083.504V16a1 1 0 002 0v-1.333a2 2 0 001.083-.504l.88.88a1 1 0 001.414-1.414l-.88-.88a2 2 0 00.504-1.083H16a1 1 0 001-1V9a1 1 0 00-1-1h-1.333a2 2 0 00-.504-1.083l.88-.88a1 1 0 00-1.414-1.414l-.88.88A2 2 0 0012.667 4V3a1 1 0 00-2 0zm-2 7a2 2 0 114 0 2 2 0 01-4 0z" /></svg>
        }
    ];

    // Selection Mode
    return (
        <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-300 mb-6">{t('spectroMenuTitle')}</h2>
            
            <div className="max-w-md mx-auto mb-8">
                <div className="flex items-center justify-center space-x-2 mb-2">
                    <label className="text-md sm:text-lg font-semibold text-gray-300">{t('analysisType')}</label>
                    <InfoTooltip text={t('analysisTypeTooltip')} />
                </div>
                <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1">
                    <button onClick={() => setAnalysisType('gamma')} className={`flex-1 p-2 text-sm sm:text-base font-semibold rounded-md transition-colors ${analysisType === 'gamma' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:bg-gray-700'}`}>{t('gammaAnalysis')}</button>
                    <button onClick={() => setAnalysisType('alpha')} className={`flex-1 p-2 text-sm sm:text-base font-semibold rounded-md transition-colors ${analysisType === 'alpha' ? 'bg-cyan-600 text-white shadow' : 'text-gray-400 hover:bg-gray-700'}`}>{t('alphaAnalysis')}</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center items-stretch gap-8">
                {tools.map(tool => (
                    <div 
                        key={tool.key}
                        onClick={() => setMode(tool.key as 'image' | 'n42' | 'bkg')}
                        onKeyDown={(e) => handleKeyDown(e, tool.key as 'image' | 'n42' | 'bkg')}
                        role="button"
                        tabIndex={0}
                        aria-label={t(tool.title)}
                        className="bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-700 hover:border-cyan-400 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                    >
                        <div className="p-6 flex flex-col items-center justify-center text-center flex-grow">
                            <div className="bg-gray-700 p-4 rounded-full mb-4">
                                {tool.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-100">{t(tool.title)}</h3>
                            <p className="text-sm text-gray-400 mt-2">{t(tool.desc)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpectroPage;