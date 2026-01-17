/**
 * Custom hook for managing property details data and operations
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPropertyById, updateProperty } from '../../../services/propertyService';

export const usePropertyDetails = (propertyId) => {
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProperty = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getPropertyById(propertyId);
      
      if (result.success) {
        setProperty(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to load property');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to load property details';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const updatePropertyData = useCallback(async (updateData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await updateProperty(propertyId, updateData);

      if (result.success) {
        setProperty(result.data);
        setSuccess('Property updated successfully');
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to update property');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to update property';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const refreshProperty = useCallback(() => {
    return fetchProperty();
  }, [fetchProperty]);

  useEffect(() => {
    if (propertyId) {
      fetchProperty();
    }
  }, [propertyId, fetchProperty]);

  return {
    property,
    loading,
    error,
    success,
    setError,
    setSuccess,
    updatePropertyData,
    refreshProperty,
  };
};

export default usePropertyDetails;
