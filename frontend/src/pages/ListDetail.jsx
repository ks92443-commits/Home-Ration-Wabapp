import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Search, Edit, Trash2, Package, ChevronDown, ChevronUp, CheckCircle, Undo2, Save, X, ShoppingCart, Calculator, FileText, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import AddItemModal from '../components/AddItemModal';
import EditItemModal from '../components/EditItemModal';
import ConfirmDialog from '../components/ConfirmDialog';

const ListDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchList();
    fetchCategories();
  }, [id]);

  const fetchList = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/lists/${id}`);
      setList(response.data.data.list);
      setItems(response.data.data.list.items || []);
    } catch (error) {
      console.error('Failed to fetch list:', error);
      if (error.response?.status === 404) {
        navigate('/lists');
        toast.error('List not found');
      } else {
        toast.error('Failed to load list');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories', { params: { limit: 100, isActive: true } });
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddItem = () => {
    setShowAddModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
  };

  const handleDeleteItem = (item) => {
    setDeleteConfirm({
      title: t('lists.removeItem'),
      message: `Remove "${item.item.name}" from the list?`,
      onConfirm: () => deleteItem(item.id)
    });
  };

  const deleteItem = async (itemId) => {
    try {
      await api.delete(`/lists/${id}/items/${itemId}`);
      toast.success(t('lists.removeItem'));
      fetchList();
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error(error.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleTogglePurchased = async (item) => {
    try {
      await api.patch(`/lists/${id}/items/${item.id}/purchase`, {
        isPurchased: !item.is_purchased,
        purchasedQuantity: !item.is_purchased ? item.quantity : 0,
        purchasedPrice: item.unit_price
      });
      fetchList();
      toast.success(item.is_purchased ? t('lists.markPending') : t('lists.markPurchased'));
    } catch (error) {
      console.error('Failed to toggle purchase:', error);
      toast.error('Failed to update item');
    }
  };

  const handleUpdateItem = async (itemId, data) => {
    try {
      await api.put(`/lists/${id}/items/${itemId}`, data);
      toast.success(t('lists.editItem'));
      fetchList();
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error(error.response?.data?.message || 'Failed to update item');
    }
  };

  const handleAddItemToList = async (data) => {
    try {
      await api.post(`/lists/${id}/items`, data);
      toast.success(t('lists.addItem'));
      fetchList();
    } catch (error) {
      console.error('Failed to add item:', error);
      toast.error(error.response?.data?.message || 'Failed to add item');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status) => {
    return t(`lists.statuses.${status}`) || status;
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = !search ||
      item.item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.item.name_hi.toLowerCase().includes(search.toLowerCase()) ||
      item.item.name_te.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || item.item.category_id === parseInt(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const summary = {
    totalItems: items.length,
    purchasedItems: items.filter(i => i.is_purchased).length,
    pendingItems: items.filter(i => !i.is_purchased).length,
    estimatedCost: items.reduce((sum, i) => sum + parseFloat(i.total_price || 0), 0),
    actualCost: items
      .filter(i => i.is_purchased && i.purchased_price)
      .reduce((sum, i) => sum + parseFloat(i.purchased_price) * parseFloat(i.purchased_quantity || i.quantity), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 mb-4">
            <ShoppingCart className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!list) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
            <span className={`badge ${getStatusColor(list.status)}`}>{getStatusLabel(list.status)}</span>
            {list.is_template && (
              <span className="badge badge-info">Template</span>
            )}
          </div>
          <p className="text-gray-500 mt-1">{list.description}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAddItem} className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            {t('lists.addItem')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('lists.summary.totalItems')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary.totalItems}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('lists.summary.purchasedItems')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary.purchasedItems}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('lists.summary.pendingItems')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{summary.pendingItems}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('lists.summary.totalEstimated')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">₹{summary.estimatedCost.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="section-title">{t('lists.addItem')}</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('items.search')}
                className="input pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input w-full sm:w-auto min-w-[180px]"
            >
              <option value="">{t('items.filterByCategory')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('items.nameEn')}</th>
                  <th className="hidden md:table-cell">{t('items.category')}</th>
                  <th className="text-right">{t('lists.quantity')}</th>
                  <th className="text-right">{t('lists.unit')}</th>
                  <th className="text-right">{t('items.unitPrice')}</th>
                  <th className="text-right">{t('lists.totalCost')}</th>
                  <th>{t('lists.status')}</th>
                  <th>{t('common.edit')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">{search || categoryFilter ? 'No matching items' : 'No items in this list'}</p>
                      {(!search && !categoryFilter) && (
                        <button onClick={handleAddItem} className="btn-primary mt-4 inline-flex">
                          <Plus className="w-4 h-4 mr-2" />
                          {t('lists.addItem')}
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((listItem) => {
                    const item = listItem.item;
                    return (
                      <tr key={listItem.id} className={listItem.is_purchased ? 'bg-green-50' : ''}>
                        <td>
                          <div className="flex items-center gap-3">
                            {item.image_url && (
                              <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">{item.name_hi} / {item.name_te}</p>
                              {listItem.notes && <p className="text-xs text-gray-400">{listItem.notes}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell">
                          {item.category && (
                            <span className={`badge ${item.category.color ? `bg-[${item.category.color}20] text-[${item.category.color}]` : 'badge-gray'}`}>
                              {item.category.icon} {item.category.name}
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <span className={listItem.is_purchased ? 'text-green-600 font-medium' : 'font-medium'}>
                            {parseFloat(listItem.quantity).toFixed(listItem.unit === 'pcs' ? 0 : 2)}
                          </span>
                        </td>
                        <td className="text-right text-gray-500">{listItem.unit}</td>
                        <td className="text-right font-medium">₹{parseFloat(listItem.unit_price).toFixed(2)}</td>
                        <td className="text-right font-semibold">₹{parseFloat(listItem.total_price).toFixed(2)}</td>
                        <td>
                          <button
                            onClick={() => handleTogglePurchased(listItem)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              listItem.is_purchased
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {listItem.is_purchased ? (
                              <>
                                <Undo2 className="w-3 h-3" />
                                {t('lists.markPending')}
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                {t('lists.markPurchased')}
                              </>
                            )}
                          </button>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditItem(listItem)}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              aria-label={t('common.edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(listItem)}
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
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Summary</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600">{t('lists.summary.totalEstimated')}</dt>
                  <dd className="font-medium">₹{summary.estimatedCost.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">{t('lists.summary.totalActual')}</dt>
                  <dd className="font-medium">₹{summary.actualCost.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <dt className="text-gray-600">Difference</dt>
                  <dd className={`font-medium ${summary.actualCost > summary.estimatedCost ? 'text-red-600' : 'text-green-600'}`}>
                    ₹{(summary.actualCost - summary.estimatedCost).toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="btn-outline w-full justify-start">
                  <FileText className="w-5 h-5 mr-2" />
                  Export to PDF
                </button>
                <button className="btn-outline w-full justify-start">
                  <Copy className="w-5 h-5 mr-2" />
                  Duplicate List
                </button>
                <button className="btn-outline w-full justify-start">
                  <Save className="w-5 h-5 mr-2" />
                  Save as Template
                </button>
                <button
                  className="btn-secondary w-full justify-start"
                  onClick={() => navigate('/lists')}
                >
                  <X className="w-5 h-5 mr-2" />
                  Back to Lists
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        categories={categories}
        onSave={handleAddItemToList}
      />

      <EditItemModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        item={editingItem}
        categories={categories}
        onSave={handleUpdateItem}
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

export default ListDetail;