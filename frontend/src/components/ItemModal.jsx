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

const ItemModal = ({ isOpen, onClose, item, categories, onSave }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    nameEn: '',
    nameHi: '',
    nameTe: '',
    descriptionEn: '',
    descriptionHi: '',
    descriptionTe: '',
    unit: 'pcs',
    unitPrice: 0,
    mrp: '',
    brandEn: '',
    brandHi: '',
    brandTe: '',
    barcode: '',
    imageUrl: '',
    tags: '',
    isActive: true,
    isFeatured: false,
    stockQuantity: 0,
    minStockLevel: 5,
    sortOrder: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          categoryId: item.category_id || '',
          nameEn: item.name_en || '',
          nameHi: item.name_hi || '',
          nameTe: item.name_te || '',
          descriptionEn: item.description_en || '',
          descriptionHi: item.description_hi || '',
          descriptionTe: item.description_te || '',
          unit: item.unit || 'pcs',
          unitPrice: item.unit_price || 0,
          mrp: item.mrp || '',
          brandEn: item.brand_en || '',
          brandHi: item.brand_hi || '',
          brandTe: item.brand_te || '',
          barcode: item.barcode || '',
          imageUrl: item.image_url || '',
          tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
          isActive: item.is_active !== false,
          isFeatured: item.is_featured === true,
          stockQuantity: item.stock_quantity || 0,
          minStockLevel: item.min_stock_level || 5,
          sortOrder: item.sort_order || 0
        });
      } else {
        setFormData({
          categoryId: '',
          nameEn: '',
          nameHi: '',
          nameTe: '',
          descriptionEn: '',
          descriptionHi: '',
          descriptionTe: '',
          unit: 'pcs',
          unitPrice: 0,
          mrp: '',
          brandEn: '',
          brandHi: '',
          brandTe: '',
          barcode: '',
          imageUrl: '',
          tags: '',
          isActive: true,
          isFeatured: false,
          stockQuantity: 0,
          minStockLevel: 5,
          sortOrder: 0
        });
      }
      setErrors({});
    }
  }, [isOpen, item]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.categoryId) newErrors.categoryId = t('common.required');
    if (!formData.nameEn.trim()) newErrors.nameEn = t('common.required');
    if (!formData.nameHi.trim()) newErrors.nameHi = t('common.required');
    if (!formData.nameTe.trim()) newErrors.nameTe = t('common.required');
    if (formData.unitPrice < 0) newErrors.unitPrice = 'Price must be positive';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        stockQuantity: parseInt(formData.stockQuantity),
        minStockLevel: parseInt(formData.minStockLevel),
        sortOrder: parseInt(formData.sortOrder),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (item) {
        await api.put(`/items/${item.id}`, payload);
        toast.success(t('items.updateSuccess'));
      } else {
        await api.post('/items', payload);
        toast.success(t('items.createSuccess'));
      }
      onClose();
      onSave();
    } catch (error) {
      console.error('Failed to save item:', error);
      if (error.response?.data?.details) {
        const fieldErrors = {};
        error.response.data.details.forEach(d => {
          fieldErrors[d.field] = d.message;
        });
        setErrors(fieldErrors);
      }
      toast.error(error.response?.data?.message || 'Failed to save item');
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
    <div className="modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="item-modal-title">
      <div className="modal animate-scale-in max-w-4xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="item-modal-title" className="text-lg font-semibold text-gray-900">
            {item ? t('items.edit') : t('items.create')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} id="item-form" className="modal-body space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="categoryId" className="label">{t('items.category')} <span className="text-red-500">*</span></label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`input ${errors.categoryId ? 'input-error' : ''}`}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="nameEn" className="label">{t('items.nameEn')} <span className="text-red-500">*</span></label>
              <input
                id="nameEn"
                name="nameEn"
                type="text"
                value={formData.nameEn}
                onChange={handleChange}
                className={`input ${errors.nameEn ? 'input-error' : ''}`}
                placeholder="Basmati Rice 5kg"
              />
              {errors.nameEn && <p className="mt-1 text-sm text-red-600">{errors.nameEn}</p>}
            </div>
            <div>
              <label htmlFor="nameHi" className="label">{t('items.nameHi')} <span className="text-red-500">*</span></label>
              <input
                id="nameHi"
                name="nameHi"
                type="text"
                value={formData.nameHi}
                onChange={handleChange}
                className={`input ${errors.nameHi ? 'input-error' : ''}`}
                placeholder="बासमती चावल 5किग्रा"
              />
              {errors.nameHi && <p className="mt-1 text-sm text-red-600">{errors.nameHi}</p>}
            </div>
            <div>
              <label htmlFor="nameTe" className="label">{t('items.nameTe')} <span className="text-red-500">*</span></label>
              <input
                id="nameTe"
                name="nameTe"
                type="text"
                value={formData.nameTe}
                onChange={handleChange}
                className={`input ${errors.nameTe ? 'input-error' : ''}`}
                placeholder="బాస్మతి బియ్యం 5కిగ్రా"
              />
              {errors.nameTe && <p className="mt-1 text-sm text-red-600">{errors.nameTe}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="descriptionEn" className="label">{t('items.descriptionEn')}</label>
              <textarea
                id="descriptionEn"
                name="descriptionEn"
                value={formData.descriptionEn}
                onChange={handleChange}
                className="input min-h-[80px] resize-y"
                placeholder="Premium quality basmati rice"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="descriptionHi" className="label">{t('items.descriptionHi')}</label>
              <textarea
                id="descriptionHi"
                name="descriptionHi"
                value={formData.descriptionHi}
                onChange={handleChange}
                className="input min-h-[80px] resize-y"
                placeholder="प्रीमियम क्वालिटी बासमती चावल"
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="descriptionTe" className="label">{t('items.descriptionTe')}</label>
              <textarea
                id="descriptionTe"
                name="descriptionTe"
                value={formData.descriptionTe}
                onChange={handleChange}
                className="input min-h-[80px] resize-y"
                placeholder="ప్రీమియం كوలిటీ బాస్మతి బియ్యం"
                rows={3}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="unit" className="label">{t('items.unit')}</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input"
              >
                {units.map(u => (
                  <option key={u.value} value={u.value}>{t(`items.units.${u.value}`) || u.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="unitPrice" className="label">{t('items.unitPrice')} <span className="text-red-500">*</span></label>
              <input
                id="unitPrice"
                name="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={handleChange}
                className={`input ${errors.unitPrice ? 'input-error' : ''}`}
                placeholder="0.00"
              />
              {errors.unitPrice && <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>}
            </div>
            <div>
              <label htmlFor="mrp" className="label">{t('items.mrp')}</label>
              <input
                id="mrp"
                name="mrp"
                type="number"
                step="0.01"
                min="0"
                value={formData.mrp}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label htmlFor="stockQuantity" className="label">{t('items.stockQuantity')}</label>
              <input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                className="input"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="minStockLevel" className="label">{t('items.minStockLevel')}</label>
              <input
                id="minStockLevel"
                name="minStockLevel"
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={handleChange}
                className="input"
                placeholder="5"
              />
            </div>
            <div>
              <label htmlFor="barcode" className="label">{t('items.barcode')}</label>
              <input
                id="barcode"
                name="barcode"
                type="text"
                value={formData.barcode}
                onChange={handleChange}
                className="input"
                placeholder="8901234567890"
              />
            </div>
            <div>
              <label htmlFor="sortOrder" className="label">{t('items.sortOrder')}</label>
              <input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={handleChange}
                className="input"
                placeholder="0"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{t('items.isActive')}</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="brandEn" className="label">{t('items.brandEn')}</label>
              <input
                id="brandEn"
                name="brandEn"
                type="text"
                value={formData.brandEn}
                onChange={handleChange}
                className="input"
                placeholder="India Gate"
              />
            </div>
            <div>
              <label htmlFor="brandHi" className="label">{t('items.brandHi')}</label>
              <input
                id="brandHi"
                name="brandHi"
                type="text"
                value={formData.brandHi}
                onChange={handleChange}
                className="input"
                placeholder="इंडिया गेट"
              />
            </div>
            <div>
              <label htmlFor="brandTe" className="label">{t('items.brandTe')}</label>
              <input
                id="brandTe"
                name="brandTe"
                type="text"
                value={formData.brandTe}
                onChange={handleChange}
                className="input"
                placeholder="ఇండియా గేట్"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="imageUrl" className="label">{t('items.imageUrl')}</label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={handleChange}
                className="input"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label htmlFor="tags" className="label">{t('items.tags')}</label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                className="input"
                placeholder="rice, basmati, staple"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                name="isFeatured"
                type="checkbox"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label className="text-sm text-gray-700 cursor-pointer">{t('items.isFeatured')}</label>
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
            form="item-form"
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

export default ItemModal;