import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoryModal = ({ isOpen, onClose, category, onSave }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameHi: '',
    nameTe: '',
    descriptionEn: '',
    descriptionHi: '',
    descriptionTe: '',
    icon: '',
    color: '#4CAF50',
    sortOrder: 0,
    isActive: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          nameEn: category.name_en || '',
          nameHi: category.name_hi || '',
          nameTe: category.name_te || '',
          descriptionEn: category.description_en || '',
          descriptionHi: category.description_hi || '',
          descriptionTe: category.description_te || '',
          icon: category.icon || '',
          color: category.color || '#4CAF50',
          sortOrder: category.sort_order || 0,
          isActive: category.is_active !== false
        });
      } else {
        setFormData({
          nameEn: '',
          nameHi: '',
          nameTe: '',
          descriptionEn: '',
          descriptionHi: '',
          descriptionTe: '',
          icon: '',
          color: '#4CAF50',
          sortOrder: 0,
          isActive: true
        });
      }
      setErrors({});
    }
  }, [isOpen, category]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nameEn.trim()) newErrors.nameEn = t('common.required');
    if (!formData.nameHi.trim()) newErrors.nameHi = t('common.required');
    if (!formData.nameTe.trim()) newErrors.nameTe = t('common.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (category) {
        await api.put(`/categories/${category.id}`, formData);
        toast.success(t('categories.updateSuccess'));
      } else {
        await api.post('/categories', formData);
        toast.success(t('categories.createSuccess'));
      }
      onClose();
      onSave();
    } catch (error) {
      console.error('Failed to save category:', error);
      if (error.response?.data?.details) {
        const fieldErrors = {};
        error.response.data.details.forEach(d => {
          fieldErrors[d.field] = d.message;
        });
        setErrors(fieldErrors);
      }
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
      <div className="modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="category-modal-title" className="text-lg font-semibold text-gray-900">
            {category ? t('categories.edit') : t('categories.create')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="nameEn" className="label">{t('categories.nameEn')} <span className="text-red-500">*</span></label>
              <input
                id="nameEn"
                name="nameEn"
                type="text"
                value={formData.nameEn}
                onChange={handleChange}
                className={`input ${errors.nameEn ? 'input-error' : ''}`}
                placeholder="Groceries"
              />
              {errors.nameEn && <p className="mt-1 text-sm text-red-600">{errors.nameEn}</p>}
            </div>
            <div>
              <label htmlFor="nameHi" className="label">{t('categories.nameHi')} <span className="text-red-500">*</span></label>
              <input
                id="nameHi"
                name="nameHi"
                type="text"
                value={formData.nameHi}
                onChange={handleChange}
                className={`input ${errors.nameHi ? 'input-error' : ''}`}
                placeholder="किराना"
              />
              {errors.nameHi && <p className="mt-1 text-sm text-red-600">{errors.nameHi}</p>}
            </div>
            <div>
              <label htmlFor="nameTe" className="label">{t('categories.nameTe')} <span className="text-red-500">*</span></label>
              <input
                id="nameTe"
                name="nameTe"
                type="text"
                value={formData.nameTe}
                onChange={handleChange}
                className={`input ${errors.nameTe ? 'input-error' : ''}`}
                placeholder="కిరానా"
              />
              {errors.nameTe && <p className="mt-1 text-sm text-red-600">{errors.nameTe}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="descriptionEn" className="label">{t('categories.descriptionEn')}</label>
              <textarea
                id="descriptionEn"
                name="descriptionEn"
                value={formData.descriptionEn}
                onChange={handleChange}
                className="input min-h-[80px] resize-y"
                placeholder="Daily grocery items"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="descriptionHi" className="label">{t('categories.descriptionHi')}</label>
              <textarea
                id="descriptionHi"
                name="descriptionHi"
                value={formData.descriptionHi}
                onChange={handleChange}
                className="input min-h-[80px] resize-y"
                placeholder="दैनिक किराना सामान"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="descriptionTe" className="label">{t('categories.descriptionTe')}</label>
              <textarea
                id="descriptionTe"
                name="descriptionTe"
                value={formData.descriptionTe}
                onChange={handleChange}
                className="input min-h-[80px] resize-y"
                placeholder="నిత్య కిరానా వస్తువులు"
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="icon" className="label">{t('categories.icon')}</label>
              <input
                id="icon"
                name="icon"
                type="text"
                value={formData.icon}
                onChange={handleChange}
                className="input"
                placeholder="🛒"
                maxLength={4}
              />
            </div>
            <div>
              <label htmlFor="color" className="label">{t('categories.color')}</label>
              <div className="flex items-center gap-2">
                <input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={handleChange}
                  className="input font-mono text-sm"
                  placeholder="#4CAF50"
                />
              </div>
            </div>
            <div>
              <label htmlFor="sortOrder" className="label">{t('categories.sortOrder')}</label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={handleChange}
                className="input"
                min="0"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer w-full">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{t('categories.isActive')}</span>
              </label>
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline"
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            form="category-form"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;