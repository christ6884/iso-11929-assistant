import React, { useState, useEffect } from 'react';
import { parseN42File } from '../services/n42ParserService';
import { ParsedN42Data } from '../types';
import Card from '../components/Card';
import ComparisonPlot from '../components/n42-analyzer/ComparisonPlot';

interface SpectrumComparisonPageProps {
    t: any;
    onBack: () => void;
    analysisType: 'gamma' | 'alpha';
}

type SpectrumState = {
    file: File | null;
    data: ParsedN42Data | null;
}

const N42FileUploader: React.FC<{ id: string; onFileLoaded: (file: File, data: ParsedN42Data) => void, label: string, file: File | null }> = ({ id, onFileLoaded, label, file }) => {
    const handleFile = async (f: File) => {
        if (!f) return;
        try {
            const parsed = await parseN42File(f, (key: string) => key);
            onFileLoaded(f, parsed);
        } catch (e: any) {
            alert(`Error parsing file: ${e.message}`);
        }
    };
    return (
        <div className="text-center">
            <label htmlFor={id} className="p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 w-full text-center border-gray-600 hover:border-indigo-500 hover:bg-gray-800 block">
                <input type="file" id={id} className="hidden" accept=".n42" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
                <p className="font-semibold text-gray-300">{label}</p>
                <p className="text-xs text-gray-500">{file ? file.name : 'Select a file'}</p>
            </label>
        </div>
    );
}

const SpectrumComparisonPage: React.FC<SpectrumComparisonPageProps> = ({ t, onBack, analysisType }) => {
    const [spectrumA, setSpectrumA] = useState<SpectrumState>({ file: null, data: null });
    const [spectrumB, setSpectrumB] = useState<SpectrumState>({ file: null, data: null });
    const [timeA, setTimeA] = useState(60);
    const [timeB, setTimeB] = useState(60);
    const [normalization, setNormalization] = useState<'none' | 'time'>('none');

    useEffect(() => {
        if (spectrumA.data?.spectra[0]?.liveTimeSeconds) {
            setTimeA(spectrumA.data.spectra[0].liveTimeSeconds);
        }
    }, [spectrumA.data]);

    useEffect(() => {
        if (spectrumB.data?.spectra[0]?.liveTimeSeconds) {
            setTimeB(spectrumB.data.spectra[0].liveTimeSeconds);
        }
    }, [spectrumB.data]);
    

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-300">{t('spectrumComparisonTitle')}</h2>
                <button onClick={onBack} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                    <span>{t('backButton')}</span>
                </button>
            </div>
            <Card title={t('inputs')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">{t('spectrumA')}</h3>
                        <N42FileUploader id="upload-a" onFileLoaded={(file, data) => setSpectrumA({ file, data })} label={t('loadSpectrum')} file={spectrumA.file} />
                        <label className="text-sm text-gray-300 mt-4 block mb-1">{t('measurementTime')} (s)</label>
                        <input type="number" value={timeA} onChange={e => setTimeA(parseFloat(e.target.value) || 0)} className="w-full bg-gray-700 p-2 rounded-md font-mono text-right" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">{t('spectrumB')}</h3>
                        <N42FileUploader id="upload-b" onFileLoaded={(file, data) => setSpectrumB({ file, data })} label={t('loadSpectrum')} file={spectrumB.file} />
                        <label className="text-sm text-gray-300 mt-4 block mb-1">{t('measurementTime')} (s)</label>
                        <input type="number" value={timeB} onChange={e => setTimeB(parseFloat(e.target.value) || 0)} className="w-full bg-gray-700 p-2 rounded-md font-mono text-right" />
                    </div>
                </div>
                 <div className="border-t border-gray-700 pt-4">
                    <label className="text-sm text-gray-300 mb-2 block">{t('normalization')}</label>
                    <div className="flex bg-gray-700 rounded-md p-1 max-w-xs">
                        <button onClick={() => setNormalization('none')} className={`flex-1 p-1 text-sm rounded ${normalization === 'none' ? 'bg-cyan-600' : ''}`}>{t('normNone')}</button>
                        <button onClick={() => setNormalization('time')} className={`flex-1 p-1 text-sm rounded ${normalization === 'time' ? 'bg-cyan-600' : ''}`}>{t('timeScale')}</button>
                    </div>
                </div>
            </Card>

            {spectrumA.data && spectrumB.data && (
                <div className="mt-6">
                    <ComparisonPlot
                        spectrumA={spectrumA.data.spectra[0]}
                        spectrumB={spectrumB.data.spectra[0]}
                        timeA={timeA}
                        timeB={timeB}
                        normalization={normalization}
                        t={t}
                    />
                </div>
            )}
        </div>
    );
};

export default SpectrumComparisonPage;