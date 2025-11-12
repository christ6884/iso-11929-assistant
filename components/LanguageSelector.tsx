import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types.ts';

interface LanguageSelectorProps {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

// SVG Flag Components for consistent rendering across all platforms
const FranceFlagIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2">
    <rect width="1" height="2" fill="#0055A4"/>
    <rect width="1" height="2" x="1" fill="#FFFFFF"/>
    <rect width="1" height="2" x="2" fill="#EF4135"/>
  </svg>
);

const UKFlagIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30">
        <clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath>
        <clipPath id="b"><path d="M30 15h30v15zv-15H0z"/></clipPath>
        <g clipPath="url(#a)">
            <path d="M0 0v30h60V0z" fill="#012169"/>
            <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/>
            <path d="M0 0l60 30m0-30L0 30" clipPath="url(#b)" stroke="#C8102E" strokeWidth="4"/>
            <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/>
            <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/>
        </g>
    </svg>
);

const GermanyFlagIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3">
    <rect width="5" height="3" fill="#000000"/>
    <rect width="5" height="2" y="1" fill="#DD0000"/>
    <rect width="5" height="1" y="2" fill="#FFCC00"/>
  </svg>
);

const SpainFlagIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2">
    <rect width="3" height="2" fill="#C60B1E"/>
    <rect width="3" height="1" y="0.5" fill="#FFC400"/>
  </svg>
);


const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, setLanguage, t }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: Language.FR, label: 'Français', flag: <FranceFlagIcon /> },
    { code: Language.EN, label: 'English', flag: <UKFlagIcon /> },
    { code: Language.DE, label: 'Deutsch', flag: <GermanyFlagIcon /> },
    { code: Language.ES, label: 'Español', flag: <SpainFlagIcon /> },
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

  const selectedLanguage = languages.find(l => l.code === currentLanguage);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} aria-label={t('changeLanguage')} className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 p-2 rounded-md bg-gray-800 border border-gray-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5M9 3.75l.375 16.5M15 3.75l-.375 16.5" />
        </svg>
        <span className="hidden sm:inline">{selectedLanguage?.label}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20">
          {languages.map(lang => (
            <a
              key={lang.code}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`flex items-center justify-between space-x-3 px-4 py-3 text-sm hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                currentLanguage === lang.code ? 'text-cyan-400 font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              <span>{lang.label}</span>
              <span className="w-5 h-auto rounded-sm overflow-hidden shadow-md">{lang.flag}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;