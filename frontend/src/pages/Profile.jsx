import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { User, Mail, Phone, MapPin, Save, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateProfile, changePassword } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    address: '',
    preferredLanguage: 'en'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.full_name || '',
        phone: user.phone || '',
        address: user.address || '',
        preferredLanguage: user.preferred_language || 'en'
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!profileData.fullName.trim()) newErrors.fullName = t('common.required');
    if (profileData.phone && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(profileData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = t('common.required');
    if (!passwordData.newPassword) newErrors.newPassword = t('common.required');
    else if (passwordData.newPassword.length < 6) newErrors.newPassword = t('auth.weakPassword');
    if (passwordData.newPassword !== passwordData.confirmNewPassword) newErrors.confirmNewPassword = t('auth.passwordMismatch');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setIsLoading(true);
    try {
      await updateProfile(profileData);
      toast.success(t('profile.updateSuccess'));
    } catch (error) {
      console.error('Failed to update profile:', error);
      if (error.response?.data?.details) {
        const fieldErrors = {};
        error.response.data.details.forEach(d => {
          fieldErrors[d.field] = d.message;
        });
        setErrors(fieldErrors);
      }
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsLoading(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success(t('profile.passwordChanged'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-4" aria-label="Profile tabs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profile'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4 inline mr-1" />
            {t('profile.editProfile')}
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'password'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-1" />
            {t('profile.changePassword')}
          </button>
        </nav>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="card space-y-6">
          <div className="card-header">
            <h2 className="section-title">{t('profile.editProfile')}</h2>
          </div>
          <div className="card-body space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">{user?.full_name || user?.username}</p>
                <p className="text-gray-500">{user?.email}</p>
                <p className="text-sm text-gray-400 mt-1">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="label">{t('auth.fullName')} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    className={`input pl-10 ${errors.fullName ? 'input-error' : ''}`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="preferredLanguage" className="label">{t('auth.language')}</label>
                <select
                  id="preferredLanguage"
                  name="preferredLanguage"
                  value={profileData.preferredLanguage}
                  onChange={handleProfileChange}
                  className="input"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="label">{t('auth.phone')}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className={`input pl-10 ${errors.phone ? 'input-error' : ''}`}
                  placeholder="+91 98765 43210"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="address" className="label">{t('auth.address')}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  id="address"
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  className="input pl-10 min-h-[100px] resize-y"
                  placeholder="123 Main Street, City, State 12345"
                  rows={4}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full sm:w-auto"
              >
                {isLoading ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="card space-y-6">
          <div className="card-header">
            <h2 className="section-title">{t('profile.changePassword')}</h2>
          </div>
          <div className="card-body space-y-6">
            <div>
              <label htmlFor="currentPassword" className="label">{t('profile.currentPassword')} <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`input pl-10 pr-10 ${errors.currentPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
            </div>

            <div>
              <label htmlFor="newPassword" className="label">{t('profile.newPassword')} <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`input pl-10 pr-10 ${errors.newPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="label">{t('profile.confirmNewPassword')} <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className={`input pl-10 pr-10 ${errors.confirmNewPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmNewPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmNewPassword}</p>}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full sm:w-auto"
              >
                {isLoading ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Profile;