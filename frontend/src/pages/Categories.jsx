import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Plus, Search, Filter, Edit, Trash2, Package, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import CategoryModal from '../components/CategoryModal';
import ConfirmDialog from '../components/ConfirmDialog';

const Categories = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortBy, setSortBy] = useState('sort_order');
  const [sortOrder, setSortOrder] = useState('ASC');

  useEffect(() => {
    fetchCategories();
  }, [page, search, sortBy, sortOrder]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/categories', {
        params: { page, limit: 20, search, sortBy, sortOrder }
      });
      setCategories(response.data.data.categories);
      setTotalPages(response.data.data.pagination.totalPages);
      setTotal(response.data.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = (category) => {
    setDeleteConfirm({
      title: t('categories.delete'),
      message: t('categories.deleteConfirm'),
      onConfirm: () => deleteCategory(category.id)
    });
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      toast.success(t('categories.deleteSuccess'));
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
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

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronDown className="w-4 h-4 text-gray-400" />;
    return sortOrder === 'ASC' ? <ChevronUp className="w-4 h-4 text-primary-600" /> : <ChevronDown className="w-4 h-4 text-primary-600" />;
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
          <h1 className="text-2xl font-bold text-gray-900">{t('categories.title')}</h1>
          <p className="text-gray-500 mt-1">{total} {t('categories.itemsCount', { count: total })}</p>
        </div>
        <button onClick={handleCreate} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          {t('categories.create')}
        </button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={t('items.search')}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="cursor-pointer" onClick={() => handleSort('sort_order')}>
                    <div className="flex items-center gap-1">
                      {t('categories.nameEn')}
                      <SortIcon field="sort_order" />
                    </div>
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('name_en')}>
                    <div className="flex items-center gap-1">
                      {t('categories.nameEn')}
                      <SortIcon field="name_en" />
                    </div>
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('name_hi')}>
                    <div className="flex items-center gap-1">
                      {t('categories.nameHi')}
                      <SortIcon field="name_hi" />
                    </div>
                  </th>
                  <th className="cursor-pointer" onClick={() => handleSort('name_te')}>
                    <div className="flex items-center gap-1">
                      {t('categories.nameTe')}
                      <SortIcon field="name_te" />
                    </div>
                  </th>
                  <th>{t('categories.itemsCount', { count: '' })}</th>
                  <th>{t('common.edit')}</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">{t('categories.noCategories')}</p>
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td className="font-medium">{category.sort_order}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category.icon || '📦'}</span>
                          <span>{category.name_en}</span>
                        </div>
                      </td>
                      <td>{category.name_hi}</td>
                      <td>{category.name_te}</td>
                      <td className="text-gray-500">{category.items_count}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={t('common.edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={t('common.delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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

      <CategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        category={editingCategory}
        onSave={fetchCategories}
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

export default Categories;