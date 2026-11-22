import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { Globe, Bell, Moon, Sun, Save, Shield, Database, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    language: i18n.language,
    theme: 'light',
    notifications: true,
    autoBackup: false,
    compactMode: false
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedNotifications = localStorage.getItem('notifications') !== 'false';
    const savedAutoBackup = localStorage.getItem('autoBackup') === 'true';
    const savedCompactMode = localStorage.getItem('compactMode') === 'true';

    setSettings(prev => ({
      ...prev,
      theme: savedTheme,
      notifications: savedNotifications,
      autoBackup: savedAutoBackup,
      compactMode: savedCompactMode
    }));

    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));

    switch (key) {
      case 'language':
        i18n.changeLanguage(value);
        localStorage.setItem('i18nextLng', value);
        break;
      case 'theme':
        localStorage.setItem('theme', value);
        document.documentElement.classList.toggle('dark', value === 'dark');
        break;
      case 'notifications':
        localStorage.setItem('notifications', value);
        break;
      case 'autoBackup':
        localStorage.setItem('autoBackup', value);
        break;
      case 'compactMode':
        localStorage.setItem('compactMode', value);
        document.documentElement.classList.toggle('compact-mode', value);
        break;
    }
  };

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/export', {
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `home-ration-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Data exported successfully');
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsLoading(true);
        const data = JSON.parse(event.target.result);
        const response = await fetch('/api/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
          },
          body: JSON.stringify(data)
        });
        if (response.ok) {
          toast.success('Data imported successfully');
          window.location.reload();
        } else {
          throw new Error('Import failed');
        }
      } catch (error) {
        console.error('Import failed:', error);
        toast.error('Failed to import data');
      } finally {
        setIsLoading(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all your data? This cannot be undone.')) return;
    if (!confirm('This will delete all your lists, items, and settings. Are you absolutely sure?')) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/clear-data', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().accessToken}`
        }
      });
      if (response.ok) {
        toast.success('All data cleared');
        window.location.reload();
      } else {
        throw new Error('Clear failed');
      }
    } catch (error) {
      console.error('Clear failed:', error);
      toast.error('Failed to clear data');
    } finally {
      setIsLoading(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  ];

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Moon },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.settings')}</h1>
        <p className="text-gray-500 mt-1">Manage your application preferences</p>
      </div>

      <div className="card space-y-6">
        <div className="card-header">
          <h2 className="section-title flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language & Region
          </h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="label">{t('auth.language')}</label>
            <div className="grid grid-cols-3 gap-3">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleChange('language', lang.code)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    settings.language === lang.code
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl">{lang.flag}</div>
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-sm text-gray-500">{lang.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card space-y-6">
        <div className="card-header">
          <h2 className="section-title flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Appearance
          </h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="label">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map(theme => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() => handleChange('theme', theme.value)}
                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                    settings.theme === theme.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <theme.icon className="w-6 h-6" />
                  <span className="font-medium">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Compact Mode</p>
              <p className="text-sm text-gray-500">Reduce spacing for more content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => handleChange('compactMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="card space-y-6">
        <div className="card-header">
          <h2 className="section-title flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h2>
        </div>
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-500">Receive updates about your lists</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleChange('notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="card space-y-6">
        <div className="card-header">
          <h2 className="section-title flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </h2>
        </div>
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Auto Backup</p>
              <p className="text-sm text-gray-500">Automatically backup data daily</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoBackup}
                onChange={(e) => handleChange('autoBackup', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleExportData}
              disabled={isLoading}
              className="btn-outline w-full justify-start"
            >
              <Download className="w-5 h-5 mr-2" />
              Export Data
            </button>
            <div className="relative">
              <button className="btn-outline w-full justify-start">
                <Upload className="w-5 h-5 mr-2" />
                Import Data
              </button>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleClearData}
              disabled={isLoading}
              className="btn-danger w-full sm:w-auto"
            >
              <Shield className="w-5 h-5 mr-2" />
              Clear All Data
            </button>
            <p className="text-xs text-gray-500 mt-2">This will permanently delete all your lists and data</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="section-title flex items-center gap-2">
            <Shield className="w-5 h-5" />
            About
          </h2>
        </div>
        <div className="card-body space-y-4">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">App Version</dt>
              <dd className="font-medium">1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">User</dt>
              <dd className="font-medium">{user?.username}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Role</dt>
              <dd className="font-medium capitalize">{user?.role}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Preferred Language</dt>
              <dd className="font-medium">{languages.find(l => l.code === user?.preferred_language)?.nativeName || 'English'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Settings;