import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const Toast = ({ type = 'info', title, message, onClose }) => {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
  };

  return (
    <div
      className={`flex items-start p-4 mb-4 border rounded-lg shadow-sm transition-all ${styles[type] || styles.info}`}
      role="alert"
    >
      {icons[type]}
      <div className="ml-3 flex-1">
        {title && <h3 className="text-sm font-semibold mb-0.5">{title}</h3>}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-black/5 focus:outline-none"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
