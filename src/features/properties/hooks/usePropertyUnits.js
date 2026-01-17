/**
 * Custom hook for managing property units data and operations
 */

import { useState, useCallback } from 'react';
import { 
  getPropertyUnits, 
  addPropertyUnit, 
  updatePropertyUnit, 
  deletePropertyUnit 
} from '../../../services/propertyService';

export const usePropertyUnits = (propertyId) => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});

  const fetchUnits = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const result = await getPropertyUnits(propertyId, page);

      if (result.success) {
        setUnits(result.data);
        setPagination(result.pagination || {});
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to load units');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to load units';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const addUnit = useCallback(async (unitData) => {
    try {
      setLoading(true);
      setError('');

      const result = await addPropertyUnit(propertyId, unitData);

      if (result.success) {
        setUnits(prev => [...prev, result.data]);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to add unit');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to add unit';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const updateUnit = useCallback(async (unitId, unitData) => {
    try {
      setLoading(true);
      setError('');

      const result = await updatePropertyUnit(propertyId, unitId, unitData);

      if (result.success) {
        setUnits(prev => 
          prev.map(unit => unit.id === unitId ? result.data : unit)
        );
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to update unit');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to update unit';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const deleteUnit = useCallback(async (unitId) => {
    try {
      setLoading(true);
      setError('');

      const result = await deletePropertyUnit(propertyId, unitId);

      if (result.success) {
        setUnits(prev => prev.filter(unit => unit.id !== unitId));
        return { success: true };
      } else {
        setError(result.error || 'Failed to delete unit');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to delete unit';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const refreshUnits = useCallback((page = 1) => {
    return fetchUnits(page);
  }, [fetchUnits]);

  return {
    units,
    loading,
    error,
    pagination,
    fetchUnits,
    addUnit,
    updateUnit,
    deleteUnit,
    refreshUnits,
    setError,
  };
};

export default usePropertyUnits;
