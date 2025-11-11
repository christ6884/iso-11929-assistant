import React, { useState, useMemo, useEffect } from 'react';
import Card from './Card';

interface UnitConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: any;
}

type UnitCategory = 'activity' | 'exposure' | 'absorbed_dose' | 'equivalent_dose';

interface Unit {
    id: string;
    label: string;
    category: UnitCategory;
    to_base: number; // Factor to convert this unit to its category's base SI unit (Bq, C/kg, Gy, Sv)
    description_key: string;
}

const units: Unit[] = [
    // Activity (Base: Bq)
    { id: 'bq', label: 'Becquerel (Bq)', category: 'activity', to_base: 1, description_key: 'unit_desc_bq' },
    { id: 'ci', label: 'Curie (Ci)', category: 'activity', to_base: 3.7e10, description_key: 'unit_desc_ci' },
    { id: 'dpm', label: 'dpm', category: 'activity', to_base: 1 / 60, description_key: 'unit_desc_dpm' },
    { id: 'dps', label: 'dps', category: 'activity', to_base: 1, description_key: 'unit_desc_dps' },
    // Exposure (Base: C/kg)
    { id: 'c_kg', label: 'C/kg', category: 'exposure', to_base: 1, description_key: 'unit_desc_c_kg' },
    { id: 'r', label: 'Röntgen (R)', category: 'exposure', to_base: 2.58e-4, description_key: 'unit_desc_r' },
    // Absorbed Dose (Base: Gy)
    { id: 'gy', label: 'Gray (Gy)', category: 'absorbed_dose', to_base: 1, description_key: 'unit_desc_gy' },
    { id: 'rad', label: 'rad', category: 'absorbed_dose', to_base: 0.01, description_key: 'unit_desc_rad' },
    // Equivalent Dose (Base: Sv)
    { id: 'sv', label: 'Sievert (Sv)', category: 'equivalent_dose', to_base: 1, description_key: 'unit_desc_sv' },
    { id: 'rem', label: 'rem', category: 'equivalent_dose', to_base: 0.01, description_key: 'unit_desc_rem' },
];

const UnitConverterModal: React.FC<UnitConverterModalProps> = ({ isOpen, onClose, t }) => {
    const [category, setCategory] = useState<UnitCategory>('activity');
    const [fromUnitId, setFromUnitId] = useState('ci');
    const [toUnitId, setToUnitId] = useState('bq');
    const [inputValue, setInputValue] = useState('1');

    useEffect(() => {
        if (isOpen) {
            // Reset to defaults when opened
            setCategory('activity');
            setFromUnitId('ci');
            setToUnitId('bq');
            setInputValue('1');
        }
    }, [isOpen]);

    const handleCategoryChange = (newCategory: UnitCategory) => {
        setCategory(newCategory);
        const categoryUnits = units.filter(u => u.category === newCategory);
        if (categoryUnits.length > 1) {
            setFromUnitId(categoryUnits[1].id);
            setToUnitId(categoryUnits[0].id);
        }
        setInputValue('1');
    };
    
    const handleSwap = () => {
        setFromUnitId(toUnitId);
        setToUnitId(fromUnitId);
    };

    const categoryUnits = useMemo(() => units.filter(u => u.category === category), [category]);

    const result = useMemo(() => {
        const fromUnit = units.find(u => u.id === fromUnitId);
        const toUnit = units.find(u => u.id === toUnitId);
        const value = parseFloat(inputValue);

        if (!fromUnit || !toUnit || isNaN(value)) {
            return '';
        }
        const valueInBase = value * fromUnit.to_base;
        const convertedValue = valueInBase / toUnit.to_base;

        if (Math.abs(convertedValue) > 0 && Math.abs(convertedValue) < 1e-6) {
             return convertedValue.toExponential(4);
        }
        return convertedValue.toLocaleString(undefined, { maximumFractionDigits: 6 });
    }, [inputValue, fromUnitId, toUnitId]);
    
    const fromUnitDesc = useMemo(() => t(units.find(u => u.id === fromUnitId)?.description_key || ''), [fromUnitId, t]);
    const toUnitDesc = useMemo(() => t(units.find(u => u.id === toUnitId)?.description_key || ''), [toUnitId, t]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-2xl p-4" onClick={(e) => e.stopPropagation()}>
                <Card title={t('unitConverterTitle')}>
                    <div className="space-y-4">
                        {/* Category Selector */}
                        <div>
                            <label className="text-sm text-gray-300 mb-1 block">{t('unit_category')}</label>
                            <div className="flex bg-gray-700 rounded-md p-1">
                                <button onClick={() => handleCategoryChange('activity')} className={`flex-1 p-1 text-sm rounded ${category === 'activity' ? 'bg-cyan-600' : ''}`}>{t('unit_cat_activity')}</button>
                                <button onClick={() => handleCategoryChange('exposure')} className={`flex-1 p-1 text-sm rounded ${category === 'exposure' ? 'bg-cyan-600' : ''}`}>{t('unit_cat_exposure')}</button>
                                <button onClick={() => handleCategoryChange('absorbed_dose')} className={`flex-1 p-1 text-sm rounded ${category === 'absorbed_dose' ? 'bg-cyan-600' : ''}`}>{t('unit_cat_absorbed_dose')}</button>
                                <button onClick={() => handleCategoryChange('equivalent_dose')} className={`flex-1 p-1 text-sm rounded ${category === 'equivalent_dose' ? 'bg-cyan-600' : ''}`}>{t('unit_cat_equivalent_dose')}</button>
                            </div>
                        </div>

                        {/* Conversion Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-300 mb-1 block">{t('unit_value')}</label>
                                <input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md font-mono text-right" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-300 mb-1 block">{t('unit_from')}</label>
                                <select value={fromUnitId} onChange={e => setFromUnitId(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md">
                                    {categoryUnits.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                                </select>
                            </div>
                             <div className="text-center">
                                <button onClick={handleSwap} title={t('unit_swap')} className="p-2 rounded-md bg-gray-600 hover:bg-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" /></svg>
                                </button>
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-300 mb-1 block">{t('unit_result')}</label>
                                <input type="text" value={result} readOnly className="w-full bg-gray-800 p-2 rounded-md font-mono text-right border border-cyan-500" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-300 mb-1 block">{t('unit_to')}</label>
                                <select value={toUnitId} onChange={e => setToUnitId(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md">
                                     {categoryUnits.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Descriptions */}
                        <div className="pt-4 border-t border-gray-700 space-y-3">
                            <h3 className="text-md font-semibold text-gray-400">{t('unit_description')}</h3>
                            <div className="bg-gray-900/50 p-3 rounded-md">
                                <p className="text-sm text-gray-300"><strong>{units.find(u=>u.id===fromUnitId)?.label}:</strong> {fromUnitDesc}</p>
                            </div>
                            <div className="bg-gray-900/50 p-3 rounded-md">
                                <p className="text-sm text-gray-300"><strong>{units.find(u=>u.id===toUnitId)?.label}:</strong> {toUnitDesc}</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg">
                                {t('close')}
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default UnitConverterModal;