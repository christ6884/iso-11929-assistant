import React from 'react';
// Fix: Corrected import path
import { AnalysisMode } from '../types';

interface ModeSelectorProps {
  currentMode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  t: any;
}

const modes: { id: AnalysisMode; label: string }[] = [
  { id: 'standard', label: 'standard' },
  { id: 'spectrometry', label: 'spectrometry' },
  { id: 'surface', label: 'surfaceControl' },
  { id: 'chambre', label: 'chambre' },
  { id: 'linge', label: 'linge' },
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
          {t(mode.label)}
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;