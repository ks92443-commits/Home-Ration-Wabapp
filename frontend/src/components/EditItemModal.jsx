import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const units = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'g', label: 'Gram' },
  { value: 'ltr', label: 'Liter' },
  { value: 'ml', label: 'Milliliter' },
  { value: 'pack', label: 'Pack' },
  { value: 'box', label: 'Box' },
  { value: 'dozen', label: 'Dozen' }
];

const EditItemModal = ({ isOpen, onClose, item, categories, onSave }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
    unit: 'pcs',
    unitPrice: 0,
    notesEn: '',
    notesHi: '',
    notesTe: '',
    isPurchased: false,
    purchasedQuantity: 0,
    purchasedPrice: '',
    sortOrder: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit || 'pcs',
        unitPrice: parseFloat(item.unit_price) || 0,
        notesEn: item.notes_en || '',
        notesHi: item.notes_hi || '',
        notesTe: item.notes_te || '',
        isPurchased: item.is_purchased || false,
        purchasedQuantity: parseFloat(item.purchased_quantity) || 0,
        purchasedPrice: item.purchased_price ? parseFloat(item.purchased_price).toFixed(2) : '',
        sortOrder: item.sort_order || 0
      });
      setErrors({});
    }
  }, [isOpen, item]);

  const validateForm = () => {
    const newErrors = {};
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (formData.unitPrice < 0) newErrors.unitPrice = 'Price must be positive';
    if (formData.isPurchased && formData.purchasedQuantity <= 0) newErrors.purchasedQuantity = 'Purchased quantity required';
    if (formData.isPurchased && formData.purchasedPrice && parseFloat(formData.purchasedPrice) < 0) newErrors.purchasedPrice = 'Price must be positive';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(item.id, {
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        unitPrice: parseFloat(formData.unitPrice),
        notesEn: formData.notesEn,
        notesHi: formData.notesHi,
        notesTe: formData.notesTe,
        isPurchased: formData.isPurchased,
        purchasedQuantity: formData.isPurchased ? parseFloat(formData.purchasedQuantity) : 0,
        purchasedPrice: formData.purchasedPrice ? parseFloat(formData.purchasedPrice) : null,
        sortOrder: parseInt(formData.sortOrder)
      });
      onClose();
    } catch (error) {
      console.error('Failed to update item:', error);
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

  if (!isOpen || !item) return null;

  const listItem = item;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="edit-item-modal-title">
      <div className="modal animate-scale-in max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="edit-item-modal-title" className="text-lg font-semibold text-gray-900">{t('lists.editItem')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">{listItem.item.name}</p>
            <p className="text-sm text-gray-500">{listItem.item.name_hi} / {listItem.item.name_te}</p>
            <p className="text-sm text-gray-500 mt-1">
              {listItem.item.category && (
                <span className={`badge ${listItem.item.category.color ? `bg-[${listItem.item.category.color}20] text-[${listItem.item.category.color}]` : 'badge-gray'}`}>
                  {listItem.item.category.icon} {listItem.item.category.name}
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="label">{t('lists.quantity')} <span className="text-red-500">*</span></label>
              <input
                id="quantity"
                type="number"
                step={listItem.item.unit === 'pcs' || listItem.item.unit === 'dozen' ? '1' : '0.01'}
                min="0.01"
                value={formData.quantity}
                onChange={handleChange}
                className={`input ${errors.quantity ? 'input-error' : ''}`}
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
            </div>
            <div>
              <label htmlFor="unit" className="label">{t('lists.unit')}</label>
              <select
                id="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input"
              >
                {units.map(u => (
                  <option key={u.value} value={u.value}>{t(`items.units.${u.value}`) || u.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="unitPrice" className="label">{t('items.unitPrice')} <span className="text-red-500">*</span></label>
            <input
              id="unitPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={handleChange}
              className={`input ${errors.unitPrice ? 'input-error' : ''}`}
            />
            {errors.unitPrice && <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>}
          </div>

          <div className="flex items-center gap-3">
            <input
              name="isPurchased"
              type="checkbox"
              checked={formData.isPurchased}
              onChange={handleChange}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label className="cursor-pointer font-medium text-gray-700">{t('lists.markPurchased')}</label>
          </div>

          {formData.isPurchased && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
              <div>
                <label htmlFor="purchasedQuantity" className="label">{t('lists.purchasedQuantity')} <span className="text-red-500">*</span></label>
                <input
                  id="purchasedQuantity"
                  type="number"
                  step={listItem.item.unit === 'pcs' || listItem.item.unit === 'dozen' ? '1' : '0.01'}
                  min="0.01"
                  value={formData.purchasedQuantity}
                  onChange={handleChange}
                  className={`input ${errors.purchasedQuantity ? 'input-error' : ''}`}
                />
                {errors.purchasedQuantity && <p className="mt-1 text-sm text-red-600">{errors.purchasedQuantity}</p>}
              </div>
              <div>
                <label htmlFor="purchasedPrice" className="label">{t('lists.purchasedPrice')} <span className="text-red-500">*</span></label>
                <input
                  id="purchasedPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchasedPrice}
                  onChange={handleChange}
                  className={`input ${errors.purchasedPrice ? 'input-error' : ''}`}
                  placeholder="Actual price paid"
                />
                {errors.purchasedPrice && <p className="mt-1 text-sm text-red-600">{errors.purchasedPrice}</p>}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="notesEn" className="label">{t('lists.notesEn')}</label>
            <textarea
              id="notesEn"
              value={formData.notesEn}
              onChange={handleChange}
              className="input min-h-[80px] resize-y"
              placeholder="Notes in English"
              rows={2}
            />
          </div>
          <div>
            <label htmlFor="notesHi" className="label">{t('lists.notesHi')}</label>
            <textarea
              id="notesHi"
              value={formData.notesHi}
              onChange={handleChange}
              className="input min-h-[80px] resize-y"
              placeholder="हिंदी में नोट्स"
              rows={2}
            />
          </div>
          <div>
            <label htmlFor="notesTe" className="label">{t('lists.notesTe')}</label>
            <textarea
              id="notesTe"
              value={formData.notesTe}
              onChange={handleChange}
              className="input min-h-[80px] resize-y"
              placeholder="తెలుగులో నోట్స్"
              rows={2}
            />
          </div>

          <div>
            <label htmlFor="sortOrder" className="label">{t('items.sortOrder')}</label>
            <input
              id="sortOrder"
              type="number"
              min="0"
              value={formData.sortOrder}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Estimated Total</p>
              <p className="font-semibold text-lg">₹{(formData.quantity * formData.unitPrice).toFixed(2)}</p>
            </div>
            {formData.isPurchased && formData.purchasedPrice && (
              <div>
                <p className="text-sm text-gray-500">Actual Total</p>
                <p className="font-semibold text-lg text-green-600">₹{(formData.purchasedQuantity * formData.purchasedPrice).toFixed(2)}</p>
              </div>
            )}
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
            form="edit-item-form"
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

export default EditItemModal;