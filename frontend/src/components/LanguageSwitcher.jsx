import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
];

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLanguage = languages.find((l) => l.code === i18n.language) || languages[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
    localStorage.setItem('i18nextLng', code);
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.language-switcher')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="language-switcher relative" role="combobox" aria-label="Select language" aria-expanded={isOpen}>
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
      >
        <span className="text-base" aria-hidden="true">{currentLanguage.flag}</span>
        <span className="hidden sm:inline font-medium">{currentLanguage.nativeName}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <ul
          className="absolute right-0 mt-1.5 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-fade-in"
          role="listbox"
          aria-label="Available languages"
        >
          {languages.map((lang) => (
            <li key={lang.code} role="option" aria-selected={lang.code === i18n.language}>
              <button
                type="button"
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  lang.code === i18n.language
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => changeLanguage(lang.code)}
              >
                <span aria-hidden="true">{lang.flag}</span>
                <span>{lang.nativeName}</span>
                {lang.code === i18n.language && (
                  <svg className="w-4 h-4 text-primary-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;