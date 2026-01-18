/**
 * useLeaseFormResources Hook
 * Manages loading of properties, tenants, and units
 */

import { useState, useEffect, useCallback } from 'react';
import { getProperties, getAvailableUnits } from '../../../services/propertyService';
import { getTenants } from '../../../services/tenantService';

export const useLeaseFormResources = (isOpen) => {
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async (fetchFunction, setDataFunction, errorMessage) => {
    try {
      setLoading(true);
      const result = await fetchFunction();
      if (result.success) {
        setDataFunction(result.data || []);
      } else {
        setError(errorMessage);
      }
    } catch (error) {
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTenants = useCallback(() => {
    return loadData(getTenants, setTenants, 'Failed to load tenants');
  }, [loadData]);

  const loadProperties = useCallback(() => {
    return loadData(getProperties, setProperties, 'Failed to load properties');
  }, [loadData]);

  const loadAvailableUnits = useCallback(async (propertyId) => {
    try {
      setLoading(true);
      const result = await getAvailableUnits({ property: propertyId });

      if (result.success) {
        setAvailableUnits(result.data);
      } else {
        setError(result.error || 'Failed to load available units');
        setAvailableUnits([]);
      }
    } catch (error) {
      setError('Failed to load available units');
      setAvailableUnits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Load properties
      const fetchProperties = async () => {
        try {
          setLoading(true);
          const result = await getProperties();
          if (result.success) {
            setProperties(result.data || []);
          } else {
            setError('Failed to load properties');
          }
        } catch (error) {
          setError('Failed to load properties');
        } finally {
          setLoading(false);
        }
      };

      // Load tenants
      const fetchTenants = async () => {
        try {
          setLoading(true);
          const result = await getTenants();
          if (result.success) {
            setTenants(result.data || []);
          } else {
            setError('Failed to load tenants');
          }
        } catch (error) {
          setError('Failed to load tenants');
        } finally {
          setLoading(false);
        }
      };

      setAvailableUnits([]);
      setError('');
      fetchProperties();
      fetchTenants();
    }
  }, [isOpen]);

  return {
    properties,
    tenants,
    availableUnits,
    loading,
    error,
    setError,
    loadAvailableUnits,
  };
};
