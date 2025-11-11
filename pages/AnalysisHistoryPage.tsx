import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../services/dbService';
import { AnalysisRecord, Source } from '../types';
import Card from '../components/Card';

interface AnalysisHistoryPageProps {
    t: any;
    onLoadAnalysis: (record: AnalysisRecord) => void;
}

const AnalysisHistoryPage: React.FC<AnalysisHistoryPageProps> = ({ t, onLoadAnalysis }) => {
    const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [fetchedAnalyses, fetchedSources] = await Promise.all([
                db.getAllAnalyses(),
                db.getAllSources(),
            ]);
            setAnalyses(fetchedAnalyses);
            setSources(fetchedSources);
        } catch (error) {
            console.error("Failed to load history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const sourceMap = useMemo(() => {
        return new Map(sources.map(s => [s.id, s.name]));
    }, [sources]);
    
    const handleDelete = async (id: string) => {
        if (window.confirm(t('confirmDeleteAnalysis'))) {
            await db.deleteAnalysis(id);
            fetchAllData(); // Refresh list
        }
    };

    return (
        <Card title={t('analysisHistoryTitle')}>
            <div className="overflow-x-auto">
                {isLoading ? (
                    <p>{t('loading')}...</p>
                ) : analyses.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">{t('noAnalysesSaved')}</p>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-400">
                            <tr>
                                <th className="p-3">{t('analysisNameColumn')}</th>
                                <th className="p-3">{t('analysisDate')}</th>
                                <th className="p-3">{t('analysisTypeColumn')}</th>
                                <th className="p-3">{t('linkedSource')}</th>
                                <th className="p-3 text-center">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analyses.map(record => (
                                <tr key={record.id} className="border-t border-gray-700 hover:bg-gray-800/50 text-gray-300">
                                    <td className="p-3 font-semibold text-cyan-300">{record.name}</td>
                                    <td className="p-3">{new Date(record.date).toLocaleString()}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${record.analysisType === 'n42' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'}`}>
                                            {record.analysisType.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-3">{record.sourceId ? sourceMap.get(record.sourceId) || 'N/A' : '-'}</td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-center space-x-3">
                                            <button onClick={() => onLoadAnalysis(record)} className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1" title={t('load')}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                                <span className="hidden sm:inline">{t('load')}</span>
                                            </button>
                                            <button onClick={() => handleDelete(record.id)} className="text-red-400 hover:text-red-300 flex items-center space-x-1" title={t('delete')}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                                 <span className="hidden sm:inline">{t('delete')}</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Card>
    );
};

export default AnalysisHistoryPage;
