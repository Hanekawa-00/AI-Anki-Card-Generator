
import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[150] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ toast: ToastMessage; onRemove: () => void }> = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const styles = {
    success: {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      bg: 'bg-white dark:bg-slate-800',
      border: 'border-green-500/20',
      text: 'text-slate-800 dark:text-white'
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      bg: 'bg-white dark:bg-slate-800',
      border: 'border-red-500/20',
      text: 'text-slate-800 dark:text-white'
    },
    info: {
      icon: <AlertCircle className="w-5 h-5 text-blue-500" />,
      bg: 'bg-white dark:bg-slate-800',
      border: 'border-blue-500/20',
      text: 'text-slate-800 dark:text-white'
    }
  };

  const currentStyle = styles[toast.type];

  return (
    <div className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border ${currentStyle.border} ${currentStyle.bg} animate-slide-up backdrop-blur-sm`}>
      <div className="flex-shrink-0 mt-0.5">
        {currentStyle.icon}
      </div>
      <div className={`ml-3 flex-1 text-sm font-medium ${currentStyle.text}`}>
        {toast.message}
      </div>
      <button 
        onClick={onRemove}
        className="ml-3 flex-shrink-0 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
