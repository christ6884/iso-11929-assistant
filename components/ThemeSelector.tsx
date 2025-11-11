import React, { useState, useRef, useEffect } from 'react';

interface ThemeSelectorProps {
  currentTheme: string;
  setTheme: (theme: string) => void;
  t: any;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, setTheme, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const themes = [
    { id: 'default', name: t('themeCyberCyan'), color: '#22d3ee' },
    { id: 'lab', name: t('themeLabWhite'), color: '#2563eb' },
    { id: 'forest', name: t('themeForestGreen'), color: '#4ade80' },
  ];

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        aria-label={t('changeTheme')} 
        title={t('changeTheme')}
        className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 p-2 rounded-md bg-gray-800 border border-gray-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12.5a2 2 0 002-2v-6.5a2 2 0 00-2-2H7" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
          {themes.map(theme => (
            <a
              key={theme.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setTheme(theme.id);
                setIsOpen(false);
              }}
              className={`flex items-center justify-between space-x-3 px-4 py-3 text-sm hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                currentTheme === theme.id ? 'text-cyan-400 font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              <span>{theme.name}</span>
              <span className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.color }}></span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;