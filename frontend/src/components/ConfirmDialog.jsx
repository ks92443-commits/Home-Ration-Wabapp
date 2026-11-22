import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ title, message, onConfirm, onClose, confirmText, cancelText, variant = 'danger' }) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="modal animate-scale-in max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="confirm-dialog-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-red-500' : 'text-yellow-500'}`} />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn-outline"
          >
            {cancelText || t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className={`btn-${variant === 'danger' ? 'danger' : 'primary'}`}
          >
            {confirmText || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;