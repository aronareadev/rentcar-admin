import toast, { Toaster } from 'react-hot-toast';
import { Bell, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { createElement } from 'react';

export interface ToastOptions {
  duration?: number;
  position?: 'top-center' | 'top-right' | 'top-left' | 'bottom-center' | 'bottom-right' | 'bottom-left';
}

export const useToast = () => {
  const showSuccess = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      style: {
        background: '#1f2937',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      },
      icon: createElement(CheckCircle, { 
        size: 20, 
        color: '#10b981' 
      }),
    });
  };

  const showError = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
      style: {
        background: '#1f2937',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      },
      icon: createElement(XCircle, { 
        size: 20, 
        color: '#ef4444' 
      }),
    });
  };

  const showWarning = (message: string, options?: ToastOptions) => {
    toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      style: {
        background: '#1f2937',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      },
      icon: createElement(AlertTriangle, { 
        size: 20, 
        color: '#f59e0b' 
      }),
    });
  };

  const showInfo = (message: string, options?: ToastOptions) => {
    toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      style: {
        background: '#1f2937',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '400px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
      },
      icon: createElement(Info, { 
        size: 20, 
        color: '#3b82f6' 
      }),
    });
  };

  const showNotification = (title: string, message: string, options?: ToastOptions) => {
    toast(
      `${title}\n${message}`,
      {
        duration: options?.duration || 5000, // 5초 후 자동으로 사라짐 
        //duration: options?.duration || Infinity, // 자동으로 사라지지 않음
        position: options?.position || 'top-right',
        style: {
          background: '#1f2937',
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '400px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          whiteSpace: 'pre-line', // 줄바꿈 지원
        },
        icon: createElement(Bell, { 
          size: 20, 
          color: '#3b82f6' 
        }),
      }
    );
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotification,
    dismiss,
  };
};

export { Toaster };
