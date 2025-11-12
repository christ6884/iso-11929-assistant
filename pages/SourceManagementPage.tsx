import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Source } from '../types';
import { db } from '../services/dbService';
import Card from '../components/Card';
import AddSourceModal from '../components/source-management/AddSourceModal';
import { radionuclides } from '../services/radionuclides';
import { sourceTypes } from '../services/sourceTypes';
import SourceTooltip from '../components/source-management/SourceTooltip';
import ImportReviewModal from '../components/source-management/ImportReviewModal';
import CsvImportModal from '../components/source-management/CsvImportModal';
import SourceTypesMemoModal from '../components/source-management/SourceTypesMemoModal';
import ExportModal from '../components/ExportModal.tsx';

interface SourceManagementPageProps {
    t: any;
}

type SortKey = keyof Source | 'currentActivity';

const SourceManagementPage: React.FC<SourceManagementPageProps> = ({ t }) => {
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sourceToEdit, setSourceToEdit] = useState<Source | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredSource, setHoveredSource] = useState<{ source: Source, position: { x: number, y: number } } | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
    const [isMemoOpen, setIsMemoOpen] = useState(false);
    
    // Import/Export state
    const [isImportReviewOpen, setIsImportReviewOpen] = useState(false);
    const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
    const [sourcesToImport, setSourcesToImport] = useState<Source[]>([]);

    // New state for offline export
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [jsonDataToExport, setJsonDataToExport] = useState('');


    const fetchSources = useCallback(async () => {
        setIsLoading(true);
        try {
            const allSources = await db.getAllSources();
            setSources(allSources);
        } catch (error) {
            console.error("Failed to fetch sources:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSources();
    }, [fetchSources]);

    const handleSaveSource = async (source: Source) => {
        try {
            if (sourceToEdit) {
                await db.updateSource(source);
            } else {
                await db.addSource(source);
            }
            fetchSources();
        } catch (error) {
            console.error("Failed to save source:", error);
        } finally {
            setIsAddModalOpen(false);
            setSourceToEdit(null);
        }
    };
    
    const handleDeleteSource = async (id: string) => {
        if (window.confirm(t('confirmDeleteSource'))) {
            try {
                await db.deleteSource(id);
                fetchSources();
            } catch (error) {
                console.error("Failed to delete source:", error);
            }
        }
    };

    const handleEditSource = (source: Source) => {
        setSourceToEdit(source);
        setIsAddModalOpen(true);
    };
    
    const handleExport = () => {
        if (sources.length === 0) return;
        
        const headers: (keyof Source)[] = [
            'id', 'name', 'location', 'casier', 'nuclide', 
            'referenceActivity', 'referenceActivityUncertainty', 
            'referenceDate', 'certificateNumber', 'type'
        ];
        const headerString = headers.join(',');

        const csvRows = sources.map(source => {
            return headers.map(header => {
                const value = source[header];
                let formattedValue = value === undefined || value === null ? '' : String(value);
                if (formattedValue.includes(',')) {
                    formattedValue = `"${formattedValue}"`;
                }
                return formattedValue;
            }).join(',');
        });
        
        const csv = [headerString, ...csvRows].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'iso-assistant-sources.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleImportFromFile = (importedSources: Source[]) => {
        setSourcesToImport(importedSources);
        setIsCsvImportOpen(false);
        setIsImportReviewOpen(true);
    };

    const handleConfirmImport = async (decisions: Map<string, 'add' | 'skip' | 'overwrite'>) => {
        setIsLoading(true);
        try {
            for (const [id, decision] of decisions.entries()) {
                const source = sourcesToImport.find(s => s.id === id);
                if (!source) continue;
                
                if (decision === 'add') {
                    const { id, ...sourceData } = source;
                    await db.addSource(sourceData);
                } else if (decision === 'overwrite') {
                    await db.updateSource(source);
                }
            }
            await fetchSources();
        } catch (error) {
            console.error("Failed to process import:", error);
        } finally {
            setIsImportReviewOpen(false);
            setSourcesToImport([]);
            setIsLoading(false);
        }
    };
    
    const handleOfflineExport = async () => {
        try {
            const allSources = await db.getAllSources();
            const jsonString = JSON.stringify(allSources, null, 2);
            setJsonDataToExport(jsonString);
            setIsExportModalOpen(true);
        } catch (error) {
            console.error("Failed to get sources for export:", error);
            alert("Error preparing data for export.");
        }
    };

    const calculateCurrentActivity = useCallback((source: Source): number => {
        const nuclideData = Object.values(radionuclides).flat().find(n => n.name === source.nuclide);
        if (!nuclideData) return source.referenceActivity;

        const refTime = new Date(source.referenceDate).getTime();
        const nowTime = new Date().getTime();
        const elapsedTimeSeconds = (nowTime - refTime) / 1000;
        const lambda = Math.log(2) / nuclideData.halfLifeSeconds;
        
        return source.referenceActivity * Math.exp(-lambda * elapsedTimeSeconds);
    }, []);
    
    const filteredSources = useMemo(() => {
        return sources.filter(source => 
            source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            source.nuclide.toLowerCase().includes(searchTerm.toLowerCase()) ||
            source.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            source.casier?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sources, searchTerm]);

    const sortedSources = useMemo(() => {
        let sortableItems = [...filteredSources];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                let aValue: string | number | undefined;
                let bValue: string | number | undefined;

                if (sortConfig.key === 'currentActivity') {
                    aValue = calculateCurrentActivity(a);
                    bValue = calculateCurrentActivity(b);
                } else {
                    aValue = a[sortConfig.key as keyof Source];
                    bValue = b[sortConfig.key as keyof Source];
                }

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
                }
                
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                
                if (aValue === undefined) return 1;
                if (bValue === undefined) return -1;

                return 0;
            });
        }
        return sortableItems;
    }, [filteredSources, sortConfig, calculateCurrentActivity]);
    
    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const checkConformity = (source: Source, currentActivity: number): 'ok' | 'warning' | 'error' | 'unknown' => {
        if (!source.type) return 'unknown';
        const typeData = sourceTypes.find(st => st.key === source.type);
        if (!typeData) return 'unknown';
        if (currentActivity >= typeData.minActivityBq && currentActivity <= typeData.maxActivityBq) {
            return 'ok';
        }
        if (currentActivity < typeData.minActivityBq) {
            return 'warning';
        }
        return 'error';
    };
    
    const conformityColors = {
        ok: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
        unknown: 'bg-gray-500'
    };

    const handleMouseEnter = (e: React.MouseEvent, source: Source) => {
        setHoveredSource({ source, position: { x: e.clientX, y: e.clientY } });
    };

    const handleMouseLeave = () => {
        setHoveredSource(null);
    };
    
    const SortableHeader: React.FC<{ sortKey: SortKey, label: string }> = ({ sortKey, label }) => {
        const isSorted = sortConfig.key === sortKey;
        return (
            <th className="p-3">
                <button onClick={() => requestSort(sortKey)} className="flex items-center space-x-1">
                    <span>{label}</span>
                    {isSorted && (
                        <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                    )}
                </button>
            </th>
        );
    };


    return (
        <div>
            <Card title={
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-200">{t('sourceInventory')}</h2>
                    <div className="flex items-center gap-2">
                         <input
                            type="text"
                            placeholder={t('searchSource')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-700 p-2 rounded-md text-sm w-48 text-white"
                        />
                        <button onClick={handleOfflineExport} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-3 rounded-lg text-sm flex items-center space-x-2">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                           <span>{t('exportBackup')}</span>
                        </button>
                        <button onClick={() => setIsCsvImportOpen(true)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg text-sm">{t('import')}</button>
                        <button onClick={handleExport} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg text-sm">{t('export')}</button>
                        <button onClick={() => setIsMemoOpen(true)} title={t('sourceTypeMemo')} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded-lg text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 0114.5 16c1.255 0 2.443-.29 3.5-.804v-10A7.968 7.968 0 0014.5 4z" /></svg>
                        </button>
                        <button onClick={() => { setSourceToEdit(null); setIsAddModalOpen(true); }} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg text-sm">{t('addSource')}</button>
                    </div>
                </div>
            }>
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <p>{t('loading')}...</p>
                    ) : sources.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">{t('noSources')}</p>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-gray-400">
                                <tr>
                                    <SortableHeader sortKey="name" label={t('sourceName')} />
                                    <SortableHeader sortKey="location" label={t('location')} />
                                    <SortableHeader sortKey="casier" label={t('casier')} />
                                    <SortableHeader sortKey="nuclide" label={t('sourceMgmt_nuclide')} />
                                    <SortableHeader sortKey="type" label={t('sourceType')} />
                                    <th className="p-3 text-right">
                                        <button onClick={() => requestSort('currentActivity')} className="flex items-center space-x-1 float-right">
                                            <span>{t('currentActivity')}</span>
                                            {sortConfig.key === 'currentActivity' && (
                                                <span>{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                                            )}
                                        </button>
                                    </th>
                                    <th className="p-3 text-center">{t('conformity')}</th>
                                    <th className="p-3 text-center">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSources.map(source => {
                                    const currentActivity = calculateCurrentActivity(source);
                                    const conformity = checkConformity(source, currentActivity);
                                    return (
                                        <tr key={source.id} className="border-t border-gray-700 hover:bg-gray-800/50 text-gray-300">
                                            <td className="p-3 font-semibold text-cyan-300" onMouseEnter={(e) => handleMouseEnter(e, source)} onMouseLeave={handleMouseLeave}>{source.name}</td>
                                            <td className="p-3">{source.location}</td>
                                            <td className="p-3">{source.casier}</td>
                                            <td className="p-3">{source.nuclide}</td>
                                            <td className="p-3">{source.type}</td>
                                            <td className="p-3 font-mono text-right">{currentActivity.toExponential(3)}</td>
                                            <td className="p-3 text-center">
                                                <span title={conformity} className={`block w-4 h-4 rounded-full mx-auto ${conformityColors[conformity]}`}></span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center space-x-3">
                                                    <button onClick={() => handleEditSource(source)} className="text-cyan-400 hover:text-cyan-300" title={t('editSource')}>
                                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteSource(source.id)} className="text-red-400 hover:text-red-300" title={t('deleteSource')}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm4 0a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
            
            <AddSourceModal 
                isOpen={isAddModalOpen}
                onClose={() => { setIsAddModalOpen(false); setSourceToEdit(null); }}
                onSave={handleSaveSource}
                t={t}
                sourceToEdit={sourceToEdit}
            />

            <CsvImportModal 
                isOpen={isCsvImportOpen}
                onClose={() => setIsCsvImportOpen(false)}
                onImport={handleImportFromFile}
                t={t}
            />
            
            <ImportReviewModal
                isOpen={isImportReviewOpen}
                onClose={() => setIsImportReviewOpen(false)}
                sourcesFromFile={sourcesToImport}
                existingSources={sources}
                onConfirm={handleConfirmImport}
                t={t}
            />
            
            <SourceTypesMemoModal 
                isOpen={isMemoOpen}
                onClose={() => setIsMemoOpen(false)}
                t={t}
            />

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                jsonData={jsonDataToExport}
                t={t}
            />

            {hoveredSource && <SourceTooltip source={hoveredSource.source} position={hoveredSource.position} t={t} />}
        </div>
    );
};

export default SourceManagementPage;