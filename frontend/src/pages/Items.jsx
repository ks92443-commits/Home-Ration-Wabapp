import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Search, Filter, Edit, Trash2, Package, ChevronDown, ChevronUp, Tag, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ItemModal from '../components/ItemModal';
import ConfirmDialog from '../components/ConfirmDialog';

const Items = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortBy, setSortBy] = useState('sort_order');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [stockFilter, setStockFilter] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [page, search, categoryFilter, sortBy, sortOrder, stockFilter]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories', { params: { limit: 100, isActive: true } });
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/items', {
        params: { page, limit: 20, search, categoryId: categoryFilter, sortBy, sortOrder, isActive: true }
      });
      setItems(response.data.data.items);
      setTotalPages(response.data.data.pagination.totalPages);
      setTotal(response.data.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      toast.error('Failed to load items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = (item) => {
    setDeleteConfirm({
      title: t('items.delete'),
      message: t('items.deleteConfirm'),
      onConfirm: () => deleteItem(item.id)
    });
  };

  const deleteItem = async (id) => {
    try {
      await api.delete(`/items/${id}`);
      toast.success(t('items.deleteSuccess'));
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const getStockStatus = (item) => {
    if (item.stock_quantity <= 0) return { label: t('items.outOfStock'), className: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-3 h-3" /> };
    if (item.stock_quantity <= item.min_stock_level) return { label: t('items.lowStock'), className: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="w-3 h-3" /> };
    return { label: t('items.inStock'), className: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3" /> };
  };

  const getStockColor = (item) => {
    if (item.stock_quantity <= 0) return 'text-red-600';
    if (item.stock_quantity <= item.min_stock_level) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 mb-4">
            <Package className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('items.title')}</h1>
          <p className="text-gray-500 mt-1">{total} {t('categories.itemsCount', { count: total })}</p>
        </div>
        <button onClick={handleCreate} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          {t('items.create')}
        </button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={t('items.search')}
                className="input pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                className="input w-auto min-w-[180px]"
              >
                <option value="">{t('items.filterByCategory')}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <select
                value={stockFilter}
                onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
                className="input w-auto min-w-[160px]"
              >
                <option value="">All Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
                <option value="in">In Stock</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('items.nameEn')}</th>
                  <th>{t('items.category')}</th>
                  <th className="text-right">{t('items.unitPrice')}</th>
                  <th className="text-right">{t('items.stockQuantity')}</th>
                  <th>{t('items.unit')}</th>
                  <th>{t('common.edit')}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">{t('items.noItems')}</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const stock = getStockStatus(item);
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            {item.image_url && (
                              <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.name_hi} / {item.name_te}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {item.category && (
                            <span className={`badge ${item.category.color ? `bg-[${item.category.color}20] text-[${item.category.color}]` : 'badge-gray'}`}>
                              {item.category.icon} {item.category.name}
                            </span>
                          )}
                        </td>
                        <td className="text-right font-medium">₹{item.unit_price.toFixed(2)}</td>
                        <td className="text-right">
                          <span className={getStockColor(item)}>{item.stock_quantity}</span>
                          <span className="text-gray-400 ml-1">/ {item.min_stock_level}</span>
                        </td>
                        <td className="text-right text-gray-500">{item.unit}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              aria-label={t('common.edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label={t('common.delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn-outline text-sm px-3 py-1.5"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="btn-outline text-sm px-3 py-1.5"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ItemModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        item={editingItem}
        categories={categories}
        onSave={fetchItems}
      />

      {deleteConfirm && (
        <ConfirmDialog
          {...deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
};

export default Items;