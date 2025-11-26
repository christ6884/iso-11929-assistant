

import React, { useState, useEffect } from 'react';
import Card from '../Card';
import { Source } from '../../types';
import { radionuclides } from '../../services/radionuclides';
import { sourceTypes } from '../../services/sourceTypes';
import { getLocalizedNuclideName } from '../../translations';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (source: Source) => void;
  t: any;
  sourceToEdit: Source | null;
}

const formatDateForInput = (date: Date | string) => {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
};

const AddSourceModal: React.FC<AddSourceModalProps> = ({ isOpen, onClose, onSave, t, sourceToEdit }) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [casier, setCasier] = useState('');
    const [nuclide, setNuclide] = useState('');
    const [referenceActivity, setReferenceActivity] = useState(10000);
    const [referenceActivityUncertainty, setReferenceActivityUncertainty] = useState(5);
    const [referenceDate, setReferenceDate] = useState(formatDateForInput(new Date()));
    const [certificateNumber, setCertificateNumber] = useState('');
    const [type, setType] = useState('');

    const allNuclides = Object.entries(radionuclides).flatMap(([type, nuclides]) =>
        nuclides.map((n) => ({
            name: n.name,
            type: type.charAt(0).toUpperCase() + type.slice(1)
        }))
    );
    
    useEffect(() => {
        if (sourceToEdit) {
            setName(sourceToEdit.name);
            setLocation(sourceToEdit.location || '');
            setCasier(sourceToEdit.casier || '');
            setNuclide(sourceToEdit.nuclide);
            setReferenceActivity(sourceToEdit.referenceActivity);
            setReferenceActivityUncertainty(sourceToEdit.referenceActivityUncertainty);
            setReferenceDate(formatDateForInput(new Date(sourceToEdit.referenceDate)));
            setCertificateNumber(sourceToEdit.certificateNumber || '');
            setType(sourceToEdit.type || '');
        } else {
            // Reset to default for new source
            setName('');
            setLocation('');
            setCasier('');
            setNuclide(allNuclides.length > 0 ? allNuclides.find(n => n.name.includes('Co-60'))?.name || allNuclides[0].name : '');
            setReferenceActivity(10000);
            setReferenceActivityUncertainty(5);
            setReferenceDate(formatDateForInput(new Date()));
            setCertificateNumber('');
            setType('');
        }
    }, [sourceToEdit, isOpen]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && nuclide && referenceActivity > 0 && referenceDate) {
            const sourceData = {
                id: sourceToEdit ? sourceToEdit.id : crypto.randomUUID(),
                name,
                location,
                casier,
                nuclide,
                referenceActivity,
                referenceActivityUncertainty,
                referenceDate,
                certificateNumber,
                type,
            };
            onSave(sourceData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl p-4" onClick={(e) => e.stopPropagation()}>
                <Card title={sourceToEdit ? t('editSourceTitle') : t('addSourceTitle')}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-300 mb-1 block">{t('sourceName')}</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md text-white" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-300 mb-1 block">{t('location')}</label>
                                <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-300 mb-1 block">{t('casier')}</label>
                                <input type="text" value={casier} onChange={e => setCasier(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-300 mb-1 block">{t('sourceMgmt_nuclide')}</label>
                                <select value={nuclide} onChange={e => setNuclide(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white">
                                    {Object.entries(radionuclides).map(([type, nuclidesOfType]) => (
                                        <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
                                            {nuclidesOfType.map((n) => (
                                                <option key={n.name} value={n.name}>{getLocalizedNuclideName(n.name, t)}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-gray-300 mb-1 block">{t('sourceType')}</label>
                                <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white">
                                     <option value="">{t('selectType')}</option>
                                     {sourceTypes.map(st => (
                                         <option key={st.key} value={st.key}>{st.description}</option>
                                     ))}
                                </select>
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-300 mb-1 block">{t('sourceMgmt_referenceActivity')}</label>
                                <input type="number" value={referenceActivity} onChange={e => setReferenceActivity(parseFloat(e.target.value))} min="0" step="any" required className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white" />
                            </div>
                             <div>
                                <label className="text-sm text-gray-300 mb-1 block">{t('sourceMgmt_referenceActivityUncertainty')}</label>
                                <input type="number" value={referenceActivityUncertainty} onChange={e => setReferenceActivityUncertainty(parseFloat(e.target.value))} min="0" step="any" className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-300 mb-1 block">{t('sourceMgmt_referenceDate')}</label>
                                <input type="date" value={referenceDate} onChange={e => setReferenceDate(e.target.value)} required className="w-full bg-gray-700 p-2 rounded-md text-white" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-300 mb-1 block">{t('certificateNumber')}</label>
                                <input type="text" value={certificateNumber} onChange={e => setCertificateNumber(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white" />
                            </div>
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

export default AddSourceModal;
