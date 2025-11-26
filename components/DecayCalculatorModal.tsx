



import React, { useState, useEffect, useMemo } from 'react';
import { radionuclides } from '../services/radionuclides.ts';
import { Radionuclide } from '../types.ts';
import { shieldingMaterials, ShieldingMaterial } from '../services/shieldingData.ts';
import CollapsibleSection from './CollapsibleSection.tsx';
import { getLocalizedNuclideName } from '../translations.ts';

interface DecayCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (newActivity: number, newUncertainty: number) => void;
  t: any;
  initialActivity: number;
  initialUncertainty: number;
  unit: string;
}

interface SourceInBox {
    id: string;
    nuclide: Radionuclide;
    activity: number;
}

const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const DoseRateDisplay: React.FC<{ dose_uSv_h: number, label: string, colorClass: string }> = ({ dose_uSv_h, label, colorClass }) => {
    const format = (val: number | string) => {
        if (typeof val === 'string') return val;
        return val.toPrecision(3);
    };

    // SI
    let si_num = dose_uSv_h;
    let si_unit = 'µSv/h';
    if (si_num >= 1000) { si_num /= 1000; si_unit = 'mSv/h'; }
    if (si_num >= 1000) { si_num /= 1000; si_unit = 'Sv/h'; }
    let si_val: number | string = si_num;

    // US (rem)
    const dose_mrem_h = dose_uSv_h * 0.1;
    let rem_num = dose_mrem_h;
    let rem_unit = 'mrem/h';
    if (rem_num >= 1000) { rem_num /= 1000; rem_unit = 'rem/h'; }
    let rem_val: number | string = rem_num;

    // US (R) - approx same as rem for gamma
    let r_num = dose_mrem_h; // starting from mrem/h which is approx mR/h
    let r_unit = 'mR/h';
    if (r_num >= 1000) { r_num /= 1000; r_unit = 'R/h'; }
    let r_val: number | string = r_num;

    if (dose_uSv_h === 0 || !isFinite(dose_uSv_h)) {
        si_val = '0.00'; rem_val = '0.00'; r_val = '0.00';
    }

    return (
        <div>
            <span className="text-gray-400 font-semibold">{label}</span>
            <div className={`grid grid-cols-3 text-center mt-1 font-mono text-md ${colorClass}`}>
                <div>
                    <div className="font-bold">{format(si_val)}</div>
                    <div className="text-xs text-gray-500">{si_unit}</div>
                </div>
                <div>
                    <div className="font-bold">{format(rem_val)}</div>
                    <div className="text-xs text-gray-500">{rem_unit}</div>
                </div>
                 <div>
                    <div className="font-bold">{format(r_val)}</div>
                    <div className="text-xs text-gray-500">{r_unit}</div>
                </div>
            </div>
        </div>
    );
};


const DecayCalculatorModal: React.FC<DecayCalculatorModalProps> = ({ isOpen, onClose, onApply, t, initialActivity, initialUncertainty, unit }) => {
  const [refActivity, setRefActivity] = useState(initialActivity);
  const [refUncertainty, setRefUncertainty] = useState(initialUncertainty);
  const [refDate, setRefDate] = useState(formatDateForInput(new Date()));
  const [measDate, setMeasDate] = useState(formatDateForInput(new Date()));
  const [selectedNuclideKey, setSelectedNuclideKey] = useState('gamma-0');
  
  const [shieldMaterialId, setShieldMaterialId] = useState('none');
  const [shieldThickness, setShieldThickness] = useState(0);
  const [sourceBox, setSourceBox] = useState<SourceInBox[]>([]);

  const [correctedActivity, setCorrectedActivity] = useState<number | null>(null);
  const [elapsedDays, setElapsedDays] = useState<number | null>(null);
  const [doseRate, setDoseRate] = useState<{ contact: number; oneMeter: number } | null>(null);

  const selectedNuclide = useMemo((): Radionuclide | null => {
      const [type, indexStr] = selectedNuclideKey.split('-');
      const index = parseInt(indexStr, 10);
      if (radionuclides[type] && radionuclides[type][index]) {
          return radionuclides[type][index];
      }
      return null;
  }, [selectedNuclideKey]);

  const shieldMaterial = useMemo(() => {
    return shieldingMaterials.find(m => m.id === shieldMaterialId) || null;
  }, [shieldMaterialId]);
  
  useEffect(() => {
    setRefActivity(initialActivity);
    setRefUncertainty(initialUncertainty);
    setSourceBox([]);
  }, [initialActivity, initialUncertainty, isOpen]);

  const interpolate = (points: { energy_MeV: number; value: any }[], energy: number) => {
      if (points.length === 0) return null;
      if (points.length === 1 || energy <= points[0].energy_MeV) return points[0].value;
      if (energy >= points[points.length - 1].energy_MeV) return points[points.length - 1].value;
      
      const upperIndex = points.findIndex(p => p.energy_MeV > energy);
      if (upperIndex === -1 || upperIndex === 0) return points[0].value;
      const lower = points[upperIndex - 1];
      const upper = points[upperIndex];
      const fraction = (energy - lower.energy_MeV) / (upper.energy_MeV - lower.energy_MeV);
      
      if (typeof lower.value === 'number') {
          return lower.value + fraction * (upper.value - lower.value);
      }
      // Interpolate object properties (for buildup)
      const interpolated: any = {};
      for (const key in lower.value) {
          interpolated[key] = lower.value[key] + fraction * (upper.value[key] - lower.value[key]);
      }
      return interpolated;
  };
  
  useEffect(() => {
    const calculate = () => {
      if (!selectedNuclide || !refDate || !measDate || refActivity <= 0) {
        setCorrectedActivity(null); setElapsedDays(null); setDoseRate(null);
        return;
      }
      const refTime = new Date(refDate).getTime();
      const measTime = new Date(measDate).getTime();
      if (isNaN(refTime) || isNaN(measTime)) {
        setCorrectedActivity(null); setElapsedDays(null); setDoseRate(null);
        return;
      }
      
      const elapsedTimeSeconds = (measTime - refTime) / 1000;
      setElapsedDays(elapsedTimeSeconds / (24 * 3600));

      const lambda = Math.log(2) / selectedNuclide.halfLifeSeconds;
      const newActivity = refActivity * Math.exp(-lambda * elapsedTimeSeconds);
      setCorrectedActivity(newActivity);

      const gammaConstant = selectedNuclide.gammaConstant;
      if (!gammaConstant || gammaConstant <= 0 || newActivity <= 0) {
        setDoseRate(null);
        return;
      }

      const activityMBq = newActivity / 1e6;
      let doseRateAt1m = gammaConstant * activityMBq;
      let doseRateAt1cm = doseRateAt1m * 10000;
      
      setDoseRate({ contact: doseRateAt1cm, oneMeter: doseRateAt1m });
    };
    calculate();
  }, [refActivity, refDate, measDate, selectedNuclide]);
  
  const totalDoseRate = useMemo(() => {
    if (sourceBox.length === 0) return null;

    let totalContact = 0;
    let totalOneMeter = 0;

    sourceBox.forEach(source => {
        const { nuclide, activity } = source;
        const gammaConstant = nuclide.gammaConstant;

        if (!gammaConstant || gammaConstant <= 0 || activity <= 0) {
            return;
        }

        const activityMBq = activity / 1e6;
        let doseRateAt1m = gammaConstant * activityMBq;
        let doseRateAt1cm = doseRateAt1m * 10000;

        if (shieldMaterial && shieldThickness > 0 && nuclide.effectiveEnergy_MeV) {
            const mu = interpolate(shieldMaterial.mu.map(p => ({ energy_MeV: p.energy_MeV, value: p.value })), nuclide.effectiveEnergy_MeV);
            const buildupCoeffs = interpolate(shieldMaterial.buildup.map(p => ({ energy_MeV: p.energy_MeV, value: { A: p.A, alpha1: p.alpha1, alpha2: p.alpha2 } })), nuclide.effectiveEnergy_MeV);
            
            if (mu && buildupCoeffs) {
                const mu_x = mu * shieldThickness;
                const buildupFactor = buildupCoeffs.A * Math.exp(buildupCoeffs.alpha1 * mu_x) + (1 - buildupCoeffs.A) * Math.exp(buildupCoeffs.alpha2 * mu_x);
                const attenuationFactor = Math.exp(-mu_x);
                
                doseRateAt1m *= buildupFactor * attenuationFactor;
                doseRateAt1cm *= buildupFactor * attenuationFactor;
            }
        }
        
        totalContact += doseRateAt1cm;
        totalOneMeter += doseRateAt1m;
    });

    return { contact: totalContact, oneMeter: totalOneMeter };
}, [sourceBox, shieldMaterial, shieldThickness]);


  if (!isOpen) return null;

  const handleApply = () => {
      if (correctedActivity !== null) {
          onApply(correctedActivity, refUncertainty);
      }
  };
  
  const handleAddSourceToBox = () => {
    if (selectedNuclide && correctedActivity !== null && correctedActivity > 0) {
        const newSource = {
            id: crypto.randomUUID(),
            nuclide: selectedNuclide,
            activity: correctedActivity,
        };
        setSourceBox(prev => [...prev, newSource]);
    }
  };
  
  const handleRemoveSource = (id: string) => {
      setSourceBox(prev => prev.filter(s => s.id !== id));
  };
  
  const formatNumber = (num: number | null) => {
    if (num === null) return 'N/A';
    if (Math.abs(num) < 0.001 && num !== 0) return num.toExponential(3);
    const fixed = num.toFixed(3);
    return fixed.endsWith('.000') ? parseInt(fixed).toString() : fixed;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
         <div className="bg-gray-800/70 rounded-lg shadow-xl backdrop-blur-md border border-gray-700 flex flex-col max-h-[90vh]">
            <h2 className="text-lg font-semibold text-cyan-400 bg-gray-900/50 px-6 py-3 rounded-t-lg border-b border-gray-700 flex-shrink-0">
                {t('decayCalculatorTitle')}
            </h2>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">{t('decayCalc_referenceActivity')} ({unit})</label>
                    <input type="number" value={refActivity} onChange={(e) => setRefActivity(parseFloat(e.target.value) || 0)} className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white"/>
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">{t('decayCalc_referenceUncertainty')}</label>
                    <input type="number" value={refUncertainty} onChange={(e) => setRefUncertainty(parseFloat(e.target.value) || 0)} className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white"/>
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">{t('decayCalc_referenceDate')}</label>
                    <input type="date" value={refDate} onChange={(e) => setRefDate(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white"/>
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">{t('measurementDate')}</label>
                    <input type="date" value={measDate} onChange={(e) => setMeasDate(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white"/>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">{t('selectNuclide')}</label>
                  <select value={selectedNuclideKey} onChange={(e) => setSelectedNuclideKey(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white">
                    {Object.entries(radionuclides).map(([type, nuclides]) => (
                        <optgroup key={type} label={type.charAt(0).toUpperCase() + type.slice(1)}>
                            {nuclides.map((nuclide, index) => (
                                <option key={`${type}-${index}`} value={`${type}-${index}`}>{getLocalizedNuclideName(nuclide.name, t)}</option>
                            ))}
                        </optgroup>
                    ))}
                  </select>
                </div>
                
                <div className="border-t border-gray-700 pt-4 mt-4">
                    <h3 className="text-md font-semibold text-cyan-400 mb-2">{t('decayResults')}</h3>
                    <div className="bg-gray-900/50 p-3 rounded-md space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">{t('halfLife')}:</span>
                            <span className="font-mono">{selectedNuclide ? `${(selectedNuclide.halfLifeSeconds / (365.25 * 24 * 3600)).toFixed(4)} years` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">{t('elapsedTime')}:</span>
                            <span className="font-mono">{elapsedDays !== null ? `${formatNumber(elapsedDays)} ${t('days')}`: 'N/A'}</span>
                        </div>
                         <div className="flex justify-between text-lg font-bold text-cyan-300 pt-2 border-t border-gray-600 mt-2">
                            <span>{t('correctedActivity')}:</span>
                            <span className="font-mono">{formatNumber(correctedActivity)} {unit}</span>
                        </div>
                    </div>

                    {doseRate && (
                        <div className="mt-4">
                            <h3 className="text-md font-semibold text-cyan-400 mb-2">{t('estimatedDoseRate')} (Unshielded)</h3>
                            <div className="bg-gray-900/50 p-3 rounded-md space-y-4 text-sm">
                                <DoseRateDisplay dose_uSv_h={doseRate.contact} label={t('doseRateAt1cm')} colorClass="text-amber-400" />
                                <DoseRateDisplay dose_uSv_h={doseRate.oneMeter} label={t('doseRateAt1m')} colorClass="text-sky-400" />
                            </div>
                        </div>
                    )}
                </div>

                <CollapsibleSection title={t('decayCalc_cumulativeTitle')} defaultOpen={true}>
                    <div className="p-2 space-y-4">
                        {sourceBox.length > 0 && (
                            <div className="max-h-40 overflow-y-auto border border-gray-700 rounded-md">
                                <table className="w-full text-xs text-left">
                                <thead className="text-gray-400 bg-gray-900/50 sticky top-0"><tr><th className="p-2">{t('sourceMgmt_nuclide')}</th><th className="p-2 text-right">{t('activity')} ({unit})</th><th className="p-2"></th></tr></thead>
                                    <tbody className="text-gray-200">
                                    {sourceBox.map(s => (
                                        <tr key={s.id} className="border-t border-gray-700">
                                            <td className="p-2">{getLocalizedNuclideName(s.nuclide.name, t)}</td>
                                            <td className="p-2 font-mono text-right">{s.activity.toExponential(2)}</td>
                                            <td className="p-2 text-center">
                                                <button onClick={() => handleRemoveSource(s.id)} title={t('decayCalc_removeSource')} className="text-red-400 hover:text-red-300">&times;</button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div>
                            <h3 className="text-md font-semibold text-cyan-400 mb-2">{t('shieldingOptional')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-300 mb-1 block">{t('shieldingMaterial')}</label>
                                    <select value={shieldMaterialId} onChange={(e) => setShieldMaterialId(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white">
                                        <option value="none">{t('shielding_none')}</option>
                                        {shieldingMaterials.map(m => <option key={m.id} value={m.id}>{t(`shielding_${m.id}`)}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-300 mb-1 block">{t('shieldingThickness')} (cm)</label>
                                    <input type="number" value={shieldThickness} onChange={(e) => setShieldThickness(parseFloat(e.target.value) || 0)} min="0" className="w-full bg-gray-700 p-2 rounded-md font-mono text-right text-white" disabled={shieldMaterialId === 'none'}/>
                                </div>
                            </div>
                        </div>

                         {totalDoseRate && (
                            <div className="mt-4">
                                <h3 className="text-md font-semibold text-cyan-400 mb-2">{t('decayCalc_totalDoseRate')}</h3>
                                <div className="bg-gray-900/50 p-3 rounded-md space-y-4 text-sm">
                                    <DoseRateDisplay dose_uSv_h={totalDoseRate.contact} label={t('doseRateAt1cm')} colorClass="text-amber-400" />
                                    <DoseRateDisplay dose_uSv_h={totalDoseRate.oneMeter} label={t('doseRateAt1m')} colorClass="text-sky-400" />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{t('doseRateDisclaimer')}</p>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
              </div>
            </div>

            <div className="flex justify-end items-center space-x-2 p-6 border-t border-gray-700 flex-shrink-0 bg-gray-800/70 rounded-b-lg">
              <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                {t('cancel')}
              </button>
              <button onClick={handleAddSourceToBox} disabled={correctedActivity === null || correctedActivity <= 0} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
                {t('decayCalc_addToBox')}
              </button>
              <button onClick={handleApply} disabled={correctedActivity === null} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
                {t('calculateAndApply')}
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default DecayCalculatorModal;
