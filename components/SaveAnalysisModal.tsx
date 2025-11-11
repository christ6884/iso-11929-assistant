import React, { useState, useEffect } from 'react';
import Card from './Card';
import { db } from '../services/dbService';
import { Source } from '../types';

interface SaveAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, sourceId?: string) => void;
  t: any;
}

const SaveAnalysisModal: React.FC<SaveAnalysisModalProps> = ({ isOpen, onClose, onSave, t }) => {
    const [name, setName] = useState('');
    const [sourceId, setSourceId] = useState<string>('');
    const [sources, setSources] = useState<Source[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Fetch sources for the dropdown
            db.getAllSources().then(setSources);
            // Reset state
            setName('');
            setSourceId('');
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim(), sourceId || undefined);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
                <Card title={t('saveAnalysisModalTitle')}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-300 mb-1 block">{t('analysisName')}</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoFocus
                                className="w-full bg-gray-700 p-2 rounded-md text-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-300 mb-1 block">{t('linkToSource')}</label>
                            <select
                                value={sourceId}
                                onChange={(e) => setSourceId(e.target.value)}
                                className="w-full bg-gray-700 p-2 rounded-md text-white"
                            >
                                <option value="">{t('noSource')}</option>
                                {sources.map(source => (
                                    <option key={source.id} value={source.id}>
                                        {source.name} ({source.nuclide})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
                                {t('cancel')}
                            </button>
                            <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">
                                {t('save')}
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default SaveAnalysisModal;
