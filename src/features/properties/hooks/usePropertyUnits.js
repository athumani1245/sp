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
  const [currentPage, setCurrentPage] = useState(1);
  
  // Form state
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [newUnitData, setNewUnitData] = useState({ unit_name: '', rent_per_month: '' });
  const [editUnitData, setEditUnitData] = useState({ unit_name: '', rent_per_month: '' });
  const [addingUnitLoading, setAddingUnitLoading] = useState(false);
  const [updatingUnit, setUpdatingUnit] = useState(false);

  const fetchUnits = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      setCurrentPage(page);
      
      const result = await getPropertyUnits({ property: propertyId, page });

      if (result.success) {
        // Data is already the items array from service
        setUnits(result.data || []);
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
      setAddingUnitLoading(true);
      setError('');

      // Add property ID to unit data and map rent_per_month to rent_amount_per_unit for backend
      const dataWithProperty = { 
        property: propertyId,
        unit_name: unitData.unit_name,
        rent_per_month: unitData.rent_per_month
      };
      const result = await addPropertyUnit(propertyId, dataWithProperty);

      if (result.success) {
        await fetchUnits(currentPage);
        setIsAddingUnit(false);
        setNewUnitData({ unit_name: '', rent_per_month: '' });
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
      setAddingUnitLoading(false);
    }
  }, [propertyId, fetchUnits, currentPage]);

  const updateUnit = useCallback(async (unitId, unitData) => {
    try {
      setUpdatingUnit(true);
      setError('');

      const result = await updatePropertyUnit(unitId, unitData);

      if (result.success) {
        await fetchUnits(currentPage);
        setEditingUnitId(null);
        setEditUnitData({ unit_name: '', rent_per_month: '' });
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
      setUpdatingUnit(false);
    }
  }, [fetchUnits, currentPage]);

  const deleteUnit = useCallback(async (unitId) => {
    try {
      setLoading(true);
      setError('');

      const result = await deletePropertyUnit(unitId);

      if (result.success) {
        await fetchUnits(currentPage);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Failed to delete unit';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [fetchUnits, currentPage]);

  // UI handlers
  const handleAddUnit = useCallback(() => {
    setIsAddingUnit(true);
    setNewUnitData({ unit_name: '', rent_per_month: '' });
  }, []);

  const handleCancelAddUnit = useCallback(() => {
    setIsAddingUnit(false);
    setNewUnitData({ unit_name: '', rent_per_month: '' });
  }, []);

  const handleNewUnitChange = useCallback((e) => {
    const { name, value } = e.target;
    // Remove any commas for numeric input
    const cleanValue = name === 'rent_per_month' ? value.replace(/,/g, '') : value;
    setNewUnitData(prev => ({ ...prev, [name]: cleanValue }));
  }, []);

  const handleSaveNewUnit = useCallback(async () => {
    return await addUnit(newUnitData);
  }, [addUnit, newUnitData]);

  const handleEditUnit = useCallback((unit) => {
    setEditingUnitId(unit.id);
    setEditUnitData({
      unit_name: unit.unit_name,
      rent_per_month: unit.rent_per_month
    });
  }, []);

  const handleCancelEditUnit = useCallback(() => {
    setEditingUnitId(null);
    setEditUnitData({ unit_name: '', rent_per_month: '' });
  }, []);

  const handleEditUnitChange = useCallback((e) => {
    const { name, value } = e.target;
    // Remove any commas for numeric input
    const cleanValue = name === 'rent_per_month' ? value.replace(/,/g, '') : value;
    setEditUnitData(prev => ({ ...prev, [name]: cleanValue }));
  }, []);

  const handleSaveEditUnit = useCallback(async () => {
    if (!editingUnitId) return { success: false };
    // Map rent_per_month to rent_per_month for backend
    const dataForBackend = {
      unit_name: editUnitData.unit_name,
      rent_per_month: editUnitData.rent_per_month
    };
    return await updateUnit(editingUnitId, dataForBackend);
  }, [editingUnitId, editUnitData, updateUnit]);

  const handleDeleteUnit = useCallback(async (unitId) => {
    return await deleteUnit(unitId);
  }, [deleteUnit]);

  const handlePageChange = useCallback((page) => {
    fetchUnits(page);
  }, [fetchUnits]);

  const refreshUnits = useCallback((page = 1) => {
    return fetchUnits(page);
  }, [fetchUnits]);

  return {
    units,
    unitsLoading: loading,
    error,
    pagination,
    currentPage,
    isAddingUnit,
    editingUnitId,
    newUnitData,
    editUnitData,
    addingUnitLoading,
    updatingUnit,
    fetchUnits,
    handleAddUnit,
    handleCancelAddUnit,
    handleNewUnitChange,
    handleSaveNewUnit,
    handleEditUnit,
    handleCancelEditUnit,
    handleEditUnitChange,
    handleSaveEditUnit,
    handleDeleteUnit,
    handlePageChange,
    refreshUnits,
    setError,
  };
};

export default usePropertyUnits;
