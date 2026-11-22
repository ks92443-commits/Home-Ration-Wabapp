import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const ListModal = ({ isOpen, onClose, list, onSave }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: '',
    nameHi: '',
    nameTe: '',
    descriptionEn: '',
    descriptionHi: '',
    descriptionTe: '',
    status: 'draft',
    isTemplate: false,
    templateName: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (list) {
        setFormData({
          nameEn: list.name_en || '',
          nameHi: list.name_hi || '',
          nameTe: list.name_te || '',
          descriptionEn: list.description_en || '',
          descriptionHi: list.description_hi || '',
          descriptionTe: list.description_te || '',
          status: list.status || 'draft',
          isTemplate: list.is_template || false,
          templateName: list.template_name || ''
        });
      } else {
        setFormData({
          nameEn: '',
          nameHi: '',
          nameTe: '',
          descriptionEn: '',
          descriptionHi: '',
          descriptionTe: '',
          status: 'draft',
          isTemplate: false,
          templateName: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, list]);

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
      if (list) {
        await api.put(`/lists/${list.id}`, formData);
        toast.success(t('lists.updateSuccess'));
      } else {
        await api.post('/lists', formData);
        toast.success(t('lists.createSuccess'));
      }
      onClose();
      onSave();
    } catch (error) {
      console.error('Failed to save list:', error);
      if (error.response?.data?.details) {
        const fieldErrors = {};
        error.response.data.details.forEach(d => {
          fieldErrors[d.field] = d.message;
        });
        setErrors(fieldErrors);
      }
      toast.error(error.response?.data?.message || 'Failed to save list');
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
    <div className="modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="list-modal-title">
      <div className="modal animate-scale-in max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="list-modal-title" className="text-lg font-semibold text-gray-900">
            {list ? t('lists.edit') : t('lists.create')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="list-form" className="modal-body space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="nameEn" className="label">{t('lists.nameEn')} <span className="text-red-500">*</span></label>
              <input
                id="nameEn"
                name="nameEn"
                type="text"
                value={formData.nameEn}
                onChange={handleChange}
                className={`input ${errors.nameEn ? 'input-error' : ''}`}
                placeholder="My Weekly Groceries"
              />
              {errors.nameEn && <p className="mt-1 text-sm text-red-600">{errors.nameEn}</p>}
            </div>
            <div>
              <label htmlFor="nameHi" className="label">{t('lists.nameHi')} <span className="text-red-500">*</span></label>
              <input
                id="nameHi"
                name="nameHi"
                type="text"
                value={formData.nameHi}
                onChange={handleChange}
                className={`input ${errors.nameHi ? 'input-error' : ''}`}
                placeholder="मेरी साप्ताहिक किराना"
              />
              {errors.nameHi && <p className="mt-1 text-sm text-red-600">{errors.nameHi}</p>}
            </div>
            <div>
              <label htmlFor="nameTe" className="label">{t('lists.nameTe')} <span className="text-red-500">*</span></label>
              <input
                id="nameTe"
                name="nameTe"
                type="text"
                value={formData.nameTe}
                onChange={handleChange}
                className={`input ${errors.nameTe ? 'input-error' : ''}`}
                placeholder="నా సাপ্তాహిక కిరానా"
              />
              {errors.nameTe && <p className="mt-1 text-sm text-red-600">{errors.nameTe}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="descriptionEn" className="label">{t('lists.descriptionEn')}</label>
              <textarea
                id="descriptionEn"
                name="descriptionEn"
                value={formData.descriptionEn}
                onChange={handleChange}
                className="input min-h-[80px] resize-y"
                placeholder="Weekly grocery shopping list"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="descriptionHi" className="label">{t('lists.descriptionHi')}</label>
              <textarea
                id="descriptionHi"
                name="descriptionHi"
                value={formData.descriptionHi}
                onChange={handleChange}
                className="input min-h-[80px] resize-y"
                placeholder="साप्ताहिक किराना खरीदारी सूची"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="descriptionTe" className="label">{t('lists.descriptionTe')}</label>
              <textarea
                id="descriptionTe"
                name="descriptionTe"
                value={formData.descriptionTe}
                onChange={handleChange}
                className="input min-h-[80px] resize-y"
                placeholder="సాప్తాహిక కిరానా కొనుగోలherlands"
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="label">{t('lists.status')}</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                <option value="draft">{t('lists.statuses.draft')}</option>
                <option value="active">{t('lists.statuses.active')}</option>
                <option value="completed">{t('lists.statuses.completed')}</option>
                <option value="archived">{t('lists.statuses.archived')}</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  name="isTemplate"
                  type="checkbox"
                  checked={formData.isTemplate}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Save as Template</span>
              </label>
            </div>
            <div>
              <label htmlFor="templateName" className="label">Template Name</label>
              <input
                id="templateName"
                name="templateName"
                type="text"
                value={formData.templateName}
                onChange={handleChange}
                className="input"
                placeholder="Weekly Groceries Template"
                disabled={!formData.isTemplate}
              />
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
            form="list-form"
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

export default ListModal;