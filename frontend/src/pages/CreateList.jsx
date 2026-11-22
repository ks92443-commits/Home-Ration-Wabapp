import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import ListModal from '../components/ListModal';

const CreateList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/lists', formData);
      toast.success(t('lists.createSuccess'));
      navigate(`/lists/${response.data.data.list.id}`);
    } catch (error) {
      console.error('Failed to create list:', error);
      toast.error(error.response?.data?.message || 'Failed to create list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate('/lists');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={handleClose}
          className="btn-ghost p-2"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('lists.create')}</h1>
          <p className="text-gray-500 mt-1">Create a new ration list</p>
        </div>
      </div>

      <ListModal
        isOpen={showModal}
        onClose={handleClose}
        list={null}
        onSave={handleSave}
      />
    </div>
  );
};

export default CreateList;