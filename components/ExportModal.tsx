import React, { useState, useEffect } from 'react';
import Card from './Card';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  jsonData: string;
  t: any;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, jsonData, t }) => {
    const [copied, setCopied] = useState(false);
    const canShare = typeof navigator.share === 'function';

    useEffect(() => {
        if (!isOpen) {
            setCopied(false);
        }
    }, [isOpen]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonData);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text.');
        }
    };

    const handleDownload = () => {
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sources-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const handleShare = async () => {
        if (!canShare) return;
        const blob = new Blob([jsonData], { type: 'application/json' });
        const file = new File([blob], 'sources-backup.json', { type: 'application/json' });
        
        try {
            await navigator.share({
                files: [file],
                title: t('sourceInventory'),
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl p-4" onClick={(e) => e.stopPropagation()}>
                <Card title={t('exportModalTitle')}>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-300">{t('exportModalIntro')}</p>
                        <textarea
                            readOnly
                            value={jsonData}
                            className="w-full h-48 bg-gray-900/50 p-2 rounded-md font-mono text-xs text-gray-300 border border-gray-600"
                        />
                        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-700">
                             <button onClick={handleCopy} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                {copied ? t('copied') : t('copyJson')}
                            </button>
                             <button onClick={handleDownload} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">
                                {t('downloadFile')}
                            </button>
                            {canShare && (
                                <button onClick={handleShare} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg">
                                    {t('shareFile')}
                                </button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ExportModal;
