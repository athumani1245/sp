import { useState, useCallback } from 'react';

/**
 * Custom hook for managing toast/notification state
 * @returns {Object} - Toast state and controls
 */
export const useNotification = () => {
  const [show, setShow] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    message: '',
    variant: 'success', // success, danger, warning, info
    autoHide: true,
    delay: 4000,
  });

  const showNotification = useCallback((options) => {
    setConfig(prev => ({
      ...prev,
      ...options,
    }));
    setShow(true);
  }, []);

  const hideNotification = useCallback(() => {
    setShow(false);
  }, []);

  const showSuccess = useCallback((title, message) => {
    showNotification({ title, message, variant: 'success' });
  }, [showNotification]);

  const showError = useCallback((title, message) => {
    showNotification({ title, message, variant: 'danger' });
  }, [showNotification]);

  const showWarning = useCallback((title, message) => {
    showNotification({ title, message, variant: 'warning' });
  }, [showNotification]);

  const showInfo = useCallback((title, message) => {
    showNotification({ title, message, variant: 'info' });
  }, [showNotification]);

  return {
    show,
    config,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default useNotification;
