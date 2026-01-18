import { useState, useCallback } from 'react';
import { handleApiError } from '../../utils/errorHandler';

/**
 * Custom hook for handling API requests with loading and error states
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export const useApiRequest = (apiFunction, options = {}) => {
  const {
    onSuccess,
    onError,
    initialData = null,
    showSuccessMessage = false,
    successMessage = 'Operation successful',
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiFunction(...args);

      if (result.success) {
        setData(result.data);
        
        if (onSuccess) {
          onSuccess(result.data);
        }

        if (showSuccessMessage) {
          // You can integrate with toast/notification system here
          console.log(successMessage);
        }

        return { success: true, data: result.data };
      } else {
        const errorMessage = result.error || 'Operation failed';
        setError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }

        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showSuccessMessage, successMessage]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

export default useApiRequest;
