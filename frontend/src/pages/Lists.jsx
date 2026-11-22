import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Search, Filter, Calendar, ShoppingCart, ChevronDown, ChevronUp, Copy, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import ListModal from '../components/ListModal';
import ConfirmDialog from '../components/ConfirmDialog';

const Lists = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('lists');

  useEffect(() => {
    if (activeTab === 'lists') {
      fetchLists();
    } else {
      fetchTemplates();
    }
  }, [page, search, statusFilter, activeTab]);

  const fetchLists = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/lists', {
        params: { page, limit: 20, search, status: statusFilter, sortBy: 'updated_at', sortOrder: 'DESC' }
      });
      setLists(response.data.data.lists);
      setTotalPages(response.data.data.pagination.totalPages);
      setTotal(response.data.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch lists:', error);
      toast.error('Failed to load lists');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/lists/templates');
      setTemplates(response.data.data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingList(null);
    setShowModal(true);
  };

  const handleEdit = (list) => {
    setEditingList(list);
    setShowModal(true);
  };

  const handleDelete = (list) => {
    setDeleteConfirm({
      title: t('lists.delete'),
      message: t('lists.deleteConfirm'),
      onConfirm: () => deleteList(list.id)
    });
  };

  const deleteList = async (id) => {
    try {
      await api.delete(`/lists/${id}`);
      toast.success(t('lists.deleteSuccess'));
      if (activeTab === 'lists') fetchLists();
      else fetchTemplates();
    } catch (error) {
      console.error('Failed to delete list:', error);
      toast.error(error.response?.data?.message || 'Failed to delete list');
    }
  };

  const handleCreateFromTemplate = async (templateId) => {
    try {
      const response = await api.post(`/lists/templates/${templateId}/create`, {
        nameEn: `${templates.find(t => t.id === templateId)?.name_en} (Copy)`,
        nameHi: `${templates.find(t => t.id === templateId)?.name_hi} (कॉपी)`,
        nameTe: `${templates.find(t => t.id === templateId)?.name_te} (కాపీ)`
      });
      toast.success(t('lists.createSuccess'));
      navigate(`/lists/${response.data.data.list.id}`);
    } catch (error) {
      console.error('Failed to create from template:', error);
      toast.error('Failed to create list from template');
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('lists.title')}</h1>
          <p className="text-gray-500 mt-1">
            {activeTab === 'lists' ? `${total} ${t('categories.itemsCount', { count: total })}` : t('lists.noLists')}
          </p>
        </div>
        <button onClick={handleCreate} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          {t('lists.create')}
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-4" aria-label="List tabs">
          <button
            onClick={() => setActiveTab('lists')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'lists'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('lists.title')} ({total})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'templates'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Templates ({templates.length})
          </button>
        </nav>
      </div>

      <div className="card">
        <div className="card-body p-0">
          {activeTab === 'lists' && (
            <>
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
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="input w-auto min-w-[160px]"
                >
                  <option value="">{t('lists.status')}</option>
                  <option value="draft">{t('lists.statuses.draft')}</option>
                  <option value="active">{t('lists.statuses.active')}</option>
                  <option value="completed">{t('lists.statuses.completed')}</option>
                  <option value="archived">{t('lists.statuses.archived')}</option>
                </select>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t('lists.nameEn')}</th>
                      <th>{t('lists.status')}</th>
                      <th className="text-right">{t('lists.summary.totalItems')}</th>
                      <th className="text-right">{t('lists.summary.totalEstimated')}</th>
                      <th className="text-right">{t('lists.summary.totalActual')}</th>
                      <th>{t('common.edit')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lists.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">{t('lists.noLists')}</p>
                          <button onClick={handleCreate} className="btn-primary mt-4 inline-flex">
                            <Plus className="w-4 h-4 mr-2" />
                            {t('lists.create')}
                          </button>
                        </td>
                      </tr>
                    ) : (
                      lists.map((list) => (
                        <tr key={list.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/lists/${list.id}`)}>
                          <td className="font-medium">{list.name}</td>
                          <td>
                            <span className={`badge ${getStatusColor(list.status)}`}>{getStatusLabel(list.status)}</span>
                          </td>
                          <td className="text-right text-gray-500">{list.total_items}</td>
                          <td className="text-right font-medium">₹{list.estimated_cost.toFixed(2)}</td>
                          <td className="text-right font-medium">₹{list.actual_cost.toFixed(2)}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEdit(list); }}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label={t('common.edit')}
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(list); }}
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
            </>
          )}

          {activeTab === 'templates' && (
            <div className="p-4">
              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No templates yet</p>
                  <p className="text-sm text-gray-400 mt-2">Create a list and mark it as template to save it here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div key={template.id} className="card p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{template.name}</p>
                            <p className="text-sm text-gray-500">{template.items_count} items</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">₹{template.estimated_cost.toFixed(2)} estimated</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCreateFromTemplate(template.id)}
                          className="btn-primary flex-1 text-sm"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Use Template
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ListModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        list={editingList}
        onSave={activeTab === 'lists' ? fetchLists : fetchTemplates}
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

export default Lists;