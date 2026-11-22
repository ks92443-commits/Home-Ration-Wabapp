import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Home, Search, RotateCcw } from 'lucide-react';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 mb-6">
            <Search className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <p className="text-xl text-gray-600 mt-2">{t('errors.404')}</p>
        </div>

        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary">
            <Home className="w-5 h-5 mr-2" />
            {t('nav.home')}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-outline"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 gap-3 text-left">
            <Link to="/lists" className="text-primary-600 hover:text-primary-500 text-sm">
              {t('nav.lists')}
            </Link>
            <Link to="/items" className="text-primary-600 hover:text-primary-500 text-sm">
              {t('nav.items')}
            </Link>
            <Link to="/categories" className="text-primary-600 hover:text-primary-500 text-sm">
              {t('nav.categories')}
            </Link>
            <Link to="/profile" className="text-primary-600 hover:text-primary-500 text-sm">
              {t('nav.profile')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;