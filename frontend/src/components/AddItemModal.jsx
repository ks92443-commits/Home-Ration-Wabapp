import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { X, Search } from 'lucide-react';
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

const AddItemModal = ({ isOpen, onClose, categories, onSave }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [unitPrice, setUnitPrice] = useState(0);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [items, setItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedCategory('');
      setSelectedItem(null);
      setQuantity(1);
      setUnit('pcs');
      setUnitPrice(0);
      setNotes('');
      setErrors({});
      setItems([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCategory && !isLoadingItems) {
      fetchItems();
    } else if (!selectedCategory) {
      setItems([]);
      setSelectedItem(null);
    }
  }, [selectedCategory, search]);

  const fetchItems = async () => {
    try {
      setIsLoadingItems(true);
      const response = await api.get('/items', {
        params: { categoryId: selectedCategory, search, isActive: true, limit: 50 }
      });
      setItems(response.data.data.items);
      if (response.data.data.items.length > 0 && !selectedItem) {
        setSelectedItem(response.data.data.items[0]);
        setUnit(response.data.data.items[0].unit);
        setUnitPrice(response.data.data.items[0].unit_price);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setUnit(item.unit);
    setUnitPrice(item.unit_price);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!selectedItem) newErrors.item = t('common.required');
    if (quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (unitPrice < 0) newErrors.unitPrice = 'Price must be positive';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        itemId: selectedItem.id,
        quantity: parseFloat(quantity),
        unit,
        unitPrice: parseFloat(unitPrice),
        notesEn: notes,
        notesHi: '',
        notesTe: ''
      });
      onClose();
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="add-item-modal-title">
      <div className="modal animate-scale-in max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="add-item-modal-title" className="text-lg font-semibold text-gray-900">{t('lists.addItem')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-6 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="label">{t('items.category')}</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setSelectedItem(null); }}
              className="input"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">{t('items.title')} <span className="text-red-500">*</span></label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('items.search')}
                className="input pl-10"
                disabled={!selectedCategory}
              />
            </div>
          </div>

          {selectedCategory && (
            <div>
              <label className="label">{t('common.required')}</label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                {isLoadingItems ? (
                  <div className="p-4 text-center text-gray-500">Loading items...</div>
                ) : items.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No items found in this category</div>
                ) : (
                  items.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemSelect(item)}
                      className={`w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                        selectedItem?.id === item.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                      }`}
                    >
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">₹{item.unit_price.toFixed(2)} / {item.unit}</p>
                      </div>
                      {selectedItem?.id === item.id && (
                        <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
              {errors.item && <p className="mt-1 text-sm text-red-600">{errors.item}</p>}
            </div>
          )}

          {selectedItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label htmlFor="quantity" className="label">{t('lists.quantity')} <span className="text-red-500">*</span></label>
                <input
                  id="quantity"
                  type="number"
                  step={selectedItem.unit === 'pcs' || selectedItem.unit === 'dozen' ? '1' : '0.01'}
                  min="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`input ${errors.quantity ? 'input-error' : ''}`}
                />
                {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
              </div>
              <div>
                <label htmlFor="unit" className="label">{t('lists.unit')}</label>
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
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
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className={`input ${errors.unitPrice ? 'input-error' : ''}`}
              />
              {errors.unitPrice && <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>}
            </div>

            <div>
              <label htmlFor="notes" className="label">{t('lists.notesEn')}</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input min-h-[80px] resize-y"
                placeholder="Any special instructions..."
                rows={3}
              />
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Total: ₹{(quantity * unitPrice).toFixed(2)}</p>
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
            form={selectedItem ? 'add-item-form' : undefined}
            className="btn-primary"
            disabled={isSubmitting || !selectedItem}
          >
            {isSubmitting ? t('common.loading') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;