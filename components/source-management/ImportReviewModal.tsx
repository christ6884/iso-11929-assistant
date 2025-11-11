import React, { useState, useEffect, useMemo } from 'react';
import Card from '../Card';
import { Source } from '../../types';

type ImportDecision = 'add' | 'skip' | 'overwrite';

interface ImportReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcesFromFile: Source[];
  existingSources: Source[];
  onConfirm: (decisions: Map<string, ImportDecision>) => void;
  t: any;
}

const ImportReviewModal: React.FC<ImportReviewModalProps> = ({ 
    isOpen, onClose, sourcesFromFile, existingSources, onConfirm, t 
}) => {
    const [decisions, setDecisions] = useState<Map<string, ImportDecision>>(new Map());

    useEffect(() => {
        if (isOpen) {
            const newDecisions = new Map<string, ImportDecision>();
            const existingIds = new Set(existingSources.map(s => s.id));
            sourcesFromFile.forEach(source => {
                if (existingIds.has(source.id)) {
                    newDecisions.set(source.id, 'skip'); // Default to skipping conflicts
                } else {
                    newDecisions.set(source.id, 'add');
                }
            });
            setDecisions(newDecisions);
        }
    }, [isOpen, sourcesFromFile, existingSources]);

    const handleDecisionChange = (id: string, decision: ImportDecision) => {
        setDecisions(prev => new Map(prev).set(id, decision));
    };
    
    const handleSelectAllNew = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const newDecisions = new Map(decisions);
        const existingIds = new Set(existingSources.map(s => s.id));
        sourcesFromFile.forEach(source => {
             if (!existingIds.has(source.id)) {
                 newDecisions.set(source.id, isChecked ? 'add' : 'skip');
             }
        });
        setDecisions(newDecisions);
    };

    if (!isOpen) return null;
    
    const existingIds = new Set(existingSources.map(s => s.id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-4xl p-4" onClick={(e) => e.stopPropagation()}>
                <Card title={t('importReviewTitle')}>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">{t('importInstructions')}</p>

                        <div className="max-h-[60vh] overflow-y-auto border border-gray-700 rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-400 bg-gray-900/50 sticky top-0">
                                    <tr>
                                        <th className="py-2 px-3 w-8">
                                            <input type="checkbox" title={t('selectAll')} onChange={handleSelectAllNew} />
                                        </th>
                                        <th className="py-2 px-3">{t('sourceName')}</th>
                                        <th className="py-2 px-3">{t('sourceMgmt_nuclide')}</th>
                                        <th className="py-2 px-3">{t('importStatus')}</th>
                                        <th className="py-2 px-3">{t('decision')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-200">
                                    {sourcesFromFile.map(source => {
                                        const isConflict = existingIds.has(source.id);
                                        const currentDecision = decisions.get(source.id);
                                        return (
                                            <tr key={source.id} className="border-t border-gray-700">
                                                <td className="py-3 px-3">
                                                    {!isConflict && (
                                                        <input 
                                                            type="checkbox" 
                                                            checked={currentDecision === 'add'} 
                                                            onChange={(e) => handleDecisionChange(source.id, e.target.checked ? 'add' : 'skip')}
                                                            className="form-checkbox h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 rounded"
                                                         />
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 font-semibold">{source.name}</td>
                                                <td className="py-3 px-3">{source.nuclide}</td>
                                                <td className="py-3 px-3">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isConflict ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>
                                                        {isConflict ? t('conflict') : t('new')}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3">
                                                    {isConflict && (
                                                        <div className="flex bg-gray-700 rounded-md p-0.5">
                                                            <button onClick={() => handleDecisionChange(source.id, 'skip')} className={`flex-1 p-1 text-xs rounded ${currentDecision === 'skip' ? 'bg-gray-500 text-white' : 'hover:bg-gray-600'}`}>{t('skip')}</button>
                                                            <button onClick={() => handleDecisionChange(source.id, 'overwrite')} className={`flex-1 p-1 text-xs rounded ${currentDecision === 'overwrite' ? 'bg-red-600 text-white' : 'hover:bg-gray-600'}`}>{t('overwrite')}</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
                                {t('cancel')}
                            </button>
                            <button type="button" onClick={() => onConfirm(decisions)} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">
                                {t('confirmImport')}
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ImportReviewModal;
