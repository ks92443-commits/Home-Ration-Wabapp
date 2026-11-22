import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

const UserMenu = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.user-menu')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className="user-menu relative" role="combobox" aria-label="User menu" aria-expanded={isOpen}>
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
      >
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
          <User className="w-5 h-5 text-primary-600" aria-hidden="true" />
        </div>
        <span className="hidden sm:inline font-medium text-sm">{user.full_name || user.username}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 animate-fade-in"
          role="listbox"
          aria-label="User menu options"
        >
          <button
            type="button"
            role="option"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => { setIsOpen(false); window.location.href = '/profile'; }}
          >
            <User className="w-5 h-5" aria-hidden="true" />
            <span>{t('nav.profile')}</span>
          </button>
          <button
            type="button"
            role="option"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => { setIsOpen(false); window.location.href = '/settings'; }}
          >
            <Settings className="w-5 h-5" aria-hidden="true" />
            <span>{t('nav.settings')}</span>
          </button>
          <hr className="my-1 border-gray-100" />
          <button
            type="button"
            role="option"
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            onClick={onLogout}
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;