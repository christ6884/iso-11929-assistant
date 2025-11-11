import React, { useState, useCallback } from 'react';
import Card from '../Card';
import { Source } from '../../types';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (sources: Source[]) => void;
  t: any;
}

const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose, onImport, t }) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
            e.dataTransfer.clearData();
        }
    }, []);

    const processImport = () => {
        if (!file) {
            setError('Please select a file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csvText = event.target?.result as string;
                const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) throw new Error("CSV must have a header and at least one data row.");

                const header = lines[0].split(',').map(h => h.trim());
                const requiredHeaders = ['id', 'name', 'nuclide', 'referenceActivity', 'referenceDate', 'referenceActivityUncertainty'];
                if (!requiredHeaders.every(h => header.includes(h))) {
                    throw new Error(`CSV header is missing required columns. Required: ${requiredHeaders.join(', ')}`);
                }

                const sources: Source[] = lines.slice(1).map((line, index) => {
                    const values = line.split(',');
                    const sourceObj: any = {};
                    header.forEach((h, i) => sourceObj[h] = values[i]?.trim());

                    return {
                        id: sourceObj.id,
                        name: sourceObj.name,
                        nuclide: sourceObj.nuclide,
                        referenceActivity: parseFloat(sourceObj.referenceActivity),
                        referenceDate: sourceObj.referenceDate,
                        referenceActivityUncertainty: parseFloat(sourceObj.referenceActivityUncertainty),
                        location: sourceObj.location || '',
                        certificateNumber: sourceObj.certificateNumber || '',
                        type: sourceObj.type || '',
                    };
                });

                onImport(sources);

            } catch (err: any) {
                setError(err.message || 'Failed to parse CSV file.');
            }
        };
        reader.onerror = () => setError('Failed to read file.');
        reader.readAsText(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
                <Card title={t('importCsvTitle')}>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400">{t('importCsvIntro')}</p>
                        <div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="p-6 border-2 border-dashed rounded-lg text-center border-gray-600 hover:border-cyan-500"
                        >
                            <input type="file" id="csv-upload" className="hidden" accept=".csv" onChange={handleFileChange} />
                            <label htmlFor="csv-upload" className="cursor-pointer text-cyan-400 font-semibold">
                                {file ? file.name : t('selectCsvFile')}
                            </label>
                        </div>
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700">
                            <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">{t('cancel')}</button>
                            <button onClick={processImport} disabled={!file} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500">{t('confirmImport')}</button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CsvImportModal;