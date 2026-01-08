/**
 * usePropertyEdit Hook
 * Handles property editing state, location dropdowns, and manager selection
 */

import { useState, useEffect, useCallback } from 'react';
import { getRegions, getDistricts, getWards, getAllPropertyManagers, updateProperty } from '../../../services/propertyService';

export const usePropertyEdit = (property, propertyId) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    propertyName: '',
    propertyType: '',
    region: '',
    district: '',
    ward: '',
    street: '',
    manager_id: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Location data
  const [regions, setRegions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Property managers
  const [propertyManagers, setPropertyManagers] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState('');

  // Initialize edit data when property changes
  useEffect(() => {
    if (property) {
      setEditData({
        propertyName: property.property_name || '',
        propertyType: property.property_type || '',
        region: property.address?.region || '',
        district: property.address?.district || '',
        ward: property.address?.ward || '',
        street: property.address?.street || '',
        manager_id: property.managers?.[0]?.id || ''
      });

      setSelectedRegionId(property.address?.region_code || '');
      setSelectedDistrictId(property.address?.district_code || '');
      setSelectedWardId(property.address?.ward_code || '');
      setSelectedManagerId(property.managers?.[0]?.id || '');
    }
  }, [property]);

  // Load property managers on mount
  useEffect(() => {
    const loadPropertyManagers = async () => {
      try {
        const response = await getAllPropertyManagers();
        if (response.success) {
          setPropertyManagers(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load property managers:', error);
      }
    };
    
    loadPropertyManagers();
  }, []);

  // Load initial location data
  const loadInitialLocationData = useCallback(async () => {
    if (!property) return;

    try {
      // Load regions
      const regionsResponse = await getRegions();
      if (regionsResponse.success) {
        setRegions(regionsResponse.data || []);
      }
      
      // Load districts if region is selected
      const regionCode = property.address?.region_code;
      if (regionCode) {
        const districtsResponse = await getDistricts(regionCode);
        if (districtsResponse.success) {
          setDistricts(districtsResponse.data || []);
        }
      }
      
      // Load wards if district is selected
      const districtCode = property.address?.district_code;
      if (districtCode) {
        const wardsResponse = await getWards(districtCode);
        if (wardsResponse.success) {
          setWards(wardsResponse.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to load location data:', error);
    }
  }, [property]);

  // Load location dropdowns based on selections
  useEffect(() => {
    const loadLocationData = async () => {
      if (regions.length === 0) return;
      
      try {
        setLocationLoading(true);
        
        if (selectedRegionId) {
          const districtsResponse = await getDistricts(selectedRegionId);
          if (districtsResponse.success) {
            setDistricts(districtsResponse.data || []);
          }
        }
        
        if (selectedDistrictId) {
          const wardsResponse = await getWards(selectedDistrictId);
          if (wardsResponse.success) {
            setWards(wardsResponse.data || []);
          }
        }
      } catch (error) {
        console.error('Failed to load location data:', error);
      } finally {
        setLocationLoading(false);
      }
    };

    loadLocationData();
  }, [selectedRegionId, selectedDistrictId, regions.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegionChange = (e) => {
    const regionId = e.target.value;
    const regionName = regionId ? e.target.options[e.target.selectedIndex].text : '';
    
    setSelectedRegionId(regionId);
    setSelectedDistrictId('');
    setSelectedWardId('');
    setDistricts([]);
    setWards([]);
    setEditData(prev => ({
      ...prev,
      region: regionName,
      district: '',
      ward: ''
    }));
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    const districtName = districtId ? e.target.options[e.target.selectedIndex].text : '';
    
    setSelectedDistrictId(districtId);
    setSelectedWardId('');
    setWards([]);
    setEditData(prev => ({
      ...prev,
      district: districtName,
      ward: ''
    }));
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    
    setSelectedWardId(wardCode);
    setEditData(prev => ({
      ...prev,
      ward: wardCode
    }));
  };
  
  const handleManagerChange = (e) => {
    const managerId = e.target.value;
    setSelectedManagerId(managerId);
    setEditData(prev => ({
      ...prev,
      manager_id: managerId
    }));
  };

  const startEdit = () => {
    setIsEditing(true);
    loadInitialLocationData();
  };

  const cancelEdit = () => {
    setIsEditing(false);
    
    // Reset to original property data
    if (property) {
      setEditData({
        propertyName: property.property_name || '',
        propertyType: property.property_type || '',
        region: property.address?.region || '',
        district: property.address?.district || '',
        ward: property.address?.ward || '',
        street: property.address?.street || '',
        manager_id: property.managers?.[0]?.id || ''
      });
      
      setSelectedRegionId(property.address?.region_code || '');
      setSelectedDistrictId(property.address?.district_code || '');
      setSelectedWardId(property.address?.ward_code || '');
      setSelectedManagerId(property.managers?.[0]?.id || '');
    }
  };

  const saveEdit = async () => {
    setUpdateLoading(true);
    
    try {
      const selectedRegion = regions.find(r => r.region_code === selectedRegionId);
      const selectedDistrict = districts.find(d => d.district_code === selectedDistrictId);
      const selectedWard = wards.find(w => w.ward_code === selectedWardId);
      
      const propertyData = {
        propertyName: editData.propertyName,
        propertyType: editData.propertyType,
        ward: selectedWard ? selectedWard.ward_name : editData.ward,
        district: selectedDistrict ? selectedDistrict.district_name : editData.district,
        region: selectedRegion ? selectedRegion.region_name : editData.region,
        street: editData.street,
        manager_id: selectedManagerId === '' ? null : selectedManagerId,
      };
      
      const result = await updateProperty(propertyId, propertyData);
      
      if (result.success) {
        setIsEditing(false);
        return { success: true, message: result.message || 'Property updated successfully!' };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to update property' };
    } finally {
      setUpdateLoading(false);
    }
  };

  return {
    isEditing,
    editData,
    updateLoading,
    regions,
    districts,
    wards,
    selectedRegionId,
    selectedDistrictId,
    selectedWardId,
    locationLoading,
    propertyManagers,
    selectedManagerId,
    handleInputChange,
    handleRegionChange,
    handleDistrictChange,
    handleWardChange,
    handleManagerChange,
    startEdit,
    cancelEdit,
    saveEdit,
  };
};
