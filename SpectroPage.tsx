import React, { useState } from 'react';
import SpectrumAnalyzerPage from './SpectrumAnalyzerPage';
import N42AnalyzerPage from './N42AnalyzerPage';
import Card from '../components/Card';

interface SpectroPageProps {
    t: any;
    onOpenPeakIdentifier: () => void;
}

const SpectroPage: React.FC<SpectroPageProps> = ({ t, onOpenPeakIdentifier }) => {
    const [mode, setMode] = useState<'selection' | 'image' | 'n42'>('selection');

    if (mode === 'image') {
        return <SpectrumAnalyzerPage t={t} onBack={() => setMode('selection')} onOpenPeakIdentifier={onOpenPeakIdentifier} />;
    }

    if (mode === 'n42') {
        return <N42AnalyzerPage t={t} onBack={() => setMode('selection')} onOpenPeakIdentifier={onOpenPeakIdentifier} />;
    }
    
    const handleKeyDown = (e: React.KeyboardEvent, newMode: 'image' | 'n42') => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setMode(newMode);
        }
    };

    // Selection Mode
    return (
        <div className="p-6 sm:p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center text-gray-300 mb-12">{t('spectroMenuTitle')}</h2>
            <div className="flex flex-col md:flex-row justify-center items-stretch gap-10">
                {/* Image Analyzer Card */}
                <div 
                    onClick={() => setMode('image')}
                    onKeyDown={(e) => handleKeyDown(e, 'image')}
                    role="button"
                    tabIndex={0}
                    aria-label={t('spectroMenuImageTitle')}
                    className="w-full md:w-2/5 lg:w-1/3 bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-700 hover:border-cyan-400 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                >
                    <div className="p-8 flex flex-col items-center justify-center text-center flex-grow">
                        <div className="bg-gray-700 p-6 rounded-full mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-100">{t('spectroMenuImageTitle')}</h3>
                        <p className="text-md text-gray-400 mt-2">{t('spectroMenuImageDesc')}</p>
                    </div>
                </div>

                {/* N42 Analyzer Card */}
                 <div 
                    onClick={() => setMode('n42')}
                    onKeyDown={(e) => handleKeyDown(e, 'n42')}
                    role="button"
                    tabIndex={0}
                    aria-label={t('spectroMenuN42Title')}
                    className="w-full md:w-2/5 lg:w-1/3 bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-700 hover:border-cyan-400 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                >
                    <div className="p-8 flex flex-col items-center justify-center text-center flex-grow">
                        <div className="bg-gray-700 p-6 rounded-full mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-cyan-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-100">{t('spectroMenuN42Title')}</h3>
                        <p className="text-md text-gray-400 mt-2">{t('spectroMenuN42Desc')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpectroPage;