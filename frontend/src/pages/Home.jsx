import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ShoppingCart, Package, Tags, Plus, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLists: 0,
    activeLists: 0,
    totalItems: 0,
    lowStockItems: 0
  });
  const [recentLists, setRecentLists] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [listsRes, itemsRes] = await Promise.all([
        api.get('/lists?limit=5&sortBy=updated_at&sortOrder=DESC'),
        api.get('/items/featured?limit=6')
      ]);

      const lists = listsRes.data.data.lists || [];
      setRecentLists(lists);

      const activeLists = lists.filter(l => l.status === 'active').length;
      const totalItems = lists.reduce((sum, l) => sum + l.total_items, 0);

      setStats({
        totalLists: listsRes.data.data.pagination?.total || lists.length,
        activeLists,
        totalItems,
        lowStockItems: 0
      });

      setFeaturedItems(itemsRes.data.data.items || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-900">{t('app.name')}</h1>
          <p className="text-gray-500 mt-1">{t('app.tagline')}</p>
        </div>
        <Link to="/lists/create" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          {t('lists.create')}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('lists.summary.totalItems')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalItems}</p>
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.activeLists}</p>
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
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalLists - stats.activeLists}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('nav.lists')}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalLists}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="section-title">{t('lists.title')}</h2>
            <Link to="/lists" className="text-sm text-primary-600 hover:text-primary-500 font-medium">
              View all
            </Link>
          </div>
          <div className="card-body p-0">
            {recentLists.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('lists.noLists')}</p>
                <Link to="/lists/create" className="btn-primary mt-4 inline-flex">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('lists.create')}
                </Link>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t('lists.nameEn')}</th>
                      <th className="hidden md:table-cell">{t('lists.status')}</th>
                      <th className="text-right">{t('lists.itemsCount')}</th>
                      <th className="text-right">{t('lists.totalCost')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLists.map((list) => (
                      <tr key={list.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/lists/${list.id}`)}>
                        <td className="font-medium">{list.name}</td>
                        <td className="hidden md:table-cell">
                          <span className={`badge ${getStatusColor(list.status)}`}>{getStatusLabel(list.status)}</span>
                        </td>
                        <td className="text-right text-gray-500">{list.total_items}</td>
                        <td className="text-right font-medium">₹{list.estimated_cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="section-title">Featured Items</h2>
            <Link to="/items" className="text-sm text-primary-600 hover:text-primary-500 font-medium">
              View all
            </Link>
          </div>
          <div className="card-body p-0">
            {featuredItems.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t('items.noItems')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 p-4">
                {featuredItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/items/${item.id}`}
                    className="card hover:shadow-md transition-shadow h-full flex flex-col"
                  >
                    {item.image_url && (
                      <div className="h-24 bg-gray-100 relative overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-3 flex-1 flex flex-col">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500 mt-1">₹{item.unit_price.toFixed(2)} / {item.unit}</p>
                      <span className={`badge mt-2 self-start ${item.category?.color ? `bg-${item.category.color.replace('#', '')}20 text-${item.category.color.replace('#', '')}` : 'badge-gray'}`}>
                        {item.category?.name || ''}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;