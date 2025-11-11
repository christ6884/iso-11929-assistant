import React from 'react';
// Fix: Corrected import path
import { AnalysisMode } from '../types';
import InfoTooltip from './InfoTooltip';

interface ModeSelectorProps {
  currentMode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  t: any;
}

const modes: { id: AnalysisMode; label: string; tooltipKey: string }[] = [
  { id: 'standard', label: 'standard', tooltipKey: 'standardTooltip' },
  { id: 'spectrometry', label: 'spectrometry', tooltipKey: 'spectrometryTooltip' },
  { id: 'surface', label: 'surfaceControl', tooltipKey: 'surfaceControlTooltip' },
  { id: 'chambre', label: 'chambre', tooltipKey: 'chambreTooltip' },
  { id: 'linge', label: 'linge', tooltipKey: 'lingeTooltip' },
];

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange, t }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 bg-gray-900/50 p-2 rounded-lg">
      {modes.map(mode => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
            currentMode === mode.id
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
            <div className="flex items-center space-x-2">
                <span>{t(mode.label)}</span>
                <InfoTooltip text={t(mode.tooltipKey)} />
            </div>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;