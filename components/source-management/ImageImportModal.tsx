import React, { useState } from 'react';
import Card from '../Card';
import ImageUploader from '../spectrum-analyzer/ImageUploader';
import CameraCapture from '../spectrum-analyzer/CameraCapture';
import { Source } from '../../types';
import { extractSourcesFromImage } from '../../services/geminiService';

interface ImageImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportReady: (sources: Source[]) => void;
  t: any;
}

const ImageImportModal: React.FC<ImageImportModalProps> = ({ isOpen, onClose, onImportReady, t }) => {
    const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageLoaded = (dataUrl: string) => {
        setImageDataUrl(dataUrl);
        setIsCameraOpen(false);
        setError(null);
    };

    const handleProcessImage = async () => {
        if (!imageDataUrl) return;

        setIsProcessing(true);
        setError(null);

        try {
            // The data URL is 'data:image/jpeg;base64,....'. We need to strip the prefix.
            const base64Data = imageDataUrl.split(',')[1];
            if (!base64Data) {
                throw new Error("Invalid image data format.");
            }
            const sources = await extractSourcesFromImage(base64Data, t);
            onImportReady(sources);
        } catch (err: any) {
            setError(err.message || "An unknown error occurred during analysis.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl p-4" onClick={(e) => e.stopPropagation()}>
                <Card title={t('imageImportTitle')}>
                    <div className="space-y-4">
                        {!imageDataUrl ? (
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <ImageUploader onImageLoaded={handleImageLoaded} t={t} />
                                <div className="text-gray-400 font-semibold">{t('or')}</div>
                                <button onClick={() => setIsCameraOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span>{t('useCamera')}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <img src={imageDataUrl} alt="Source list preview" className="max-h-80 w-auto mx-auto rounded-md border border-gray-600" />
                                <button onClick={() => setImageDataUrl(null)} className="mt-2 text-sm text-yellow-400 hover:text-yellow-300">
                                    {t('startOver')}
                                </button>
                            </div>
                        )}

                        {error && <p className="text-red-400 text-sm text-center bg-red-900/30 p-2 rounded-md">{error}</p>}
                        
                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                            <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                            <button onClick={handleProcessImage} disabled={!imageDataUrl || isProcessing} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500 flex items-center">
                                {isProcessing && (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isProcessing ? t('processingImage') : t('processImage')}
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
            {isCameraOpen && <CameraCapture onImageCaptured={handleImageLoaded} onClose={() => setIsCameraOpen(false)} t={t} />}
        </div>
    );
};

export default ImageImportModal;
