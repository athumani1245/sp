import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE;

interface PropertyData {
  propertyName?: string;
  property_name?: string;
  name?: string;
  propertyType?: string;
  property_type?: string;
  region?: string;
  district?: string;
  ward?: string;
  street?: string;
  manager_id?: string | null;
}

interface PropertyParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
  property_type?: string;
}

interface UnitData {
  property: string;
  unit_name: string;
  rent_per_month: number;
  number_of_units?: number;
}

interface UnitParams {
  property?: string;
  page?: number;
}

// Helper function to format property data for API
const formatPropertyData = (propertyData: PropertyData) => {
  const formattedData: any = {
    property_name: propertyData.property_name || propertyData.propertyName || propertyData.name,
    property_type: propertyData.property_type || propertyData.propertyType || 'Standalone',
    address: {
      region: propertyData.region || null,
      district: propertyData.district || null,
      ward: propertyData.ward || null,
      street: propertyData.street || '',
    },
  };

  // Include manager_id - send null to remove manager, or the actual ID to assign
  if (propertyData.manager_id !== undefined) {
    formattedData.manager_id = propertyData.manager_id || null;
  }

  return formattedData;
};

// Location services
export const getRegions = async () => {
  const response = await api.get(`${API_BASE}/regions/`);
  return response.data.data;
};

export const getDistricts = async (regionId: string) => {
  const response = await api.get(`${API_BASE}/regions/districts/${regionId}/`);
  return response.data.data;
};

export const getWards = async (districtId: string) => {
  const response = await api.get(`${API_BASE}/districts/wards/${districtId}/`);
  return response.data.data;
};

// Property CRUD
export const getProperties = async (params: PropertyParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.property_type) queryParams.append('property_type', params.property_type);

  const response = await api.get(`${API_BASE}/properties/?${queryParams.toString()}`);
  return {
    items: response.data.data.items || [],
    pagination: {
      total: response.data.data.count,
      current_page: response.data.data.current_page,
      total_pages: response.data.data.total_pages,
      next: response.data.data.next,
      previous: response.data.data.previous,
    },
  };
};

// Get all properties without pagination (for dropdowns/selects)
export const getAllProperties = async () => {
  const response = await api.get(`${API_BASE}/properties/`);
  return response.data.data || [];
};

export const getPropertyById = async (propertyId: string) => {
  const response = await api.get(`${API_BASE}/properties/${propertyId}/`);
  return response.data.data;
};

export const addProperty = async (propertyData: PropertyData) => {
  const formattedData = formatPropertyData(propertyData);
  const response = await api.post(`${API_BASE}/properties/`, formattedData);
  return response.data.data;
};

export const updateProperty = async ({ propertyId, propertyData }: { propertyId: string; propertyData: PropertyData }) => {
  const formattedData = formatPropertyData(propertyData);
  const response = await api.patch(`${API_BASE}/properties/${propertyId}/`, formattedData);
  return response.data.data;
};

export const deleteProperty = async (propertyId: string) => {
  await api.delete(`${API_BASE}/properties/${propertyId}/`);
  return { success: true };
};

// Property Units
export const getAvailableUnits = async (params: UnitParams = {}) => {
  const queryParams = new URLSearchParams();
  if (params.property) queryParams.append('property', params.property);

  const response = await api.get(`${API_BASE}/units/?${queryParams.toString()}`);
  const fullData = response.data.data || response.data;
  
  return {
    items: fullData.items || fullData || [],
    pagination: {
      total: fullData.count || 0,
      current_page: fullData.current_page || 1,
      total_pages: fullData.total_pages || 1,
      next: fullData.next || null,
      previous: fullData.previous || null,
    },
  };
};

export const getPropertyUnits = async (params: UnitParams) => {
  if (!params.property) {
    throw new Error('property is required in query parameters.');
  }

  const queryParams = new URLSearchParams();
  queryParams.append('property', params.property);
  if (params.page) queryParams.append('page', params.page.toString());

  const response = await api.get(`${API_BASE}/units/?${queryParams.toString()}`);
  
  // Return the full data structure like tanaka does
  const fullData = response.data.data || response.data;
  
  return {
    items: fullData.items || fullData || [],
    pagination: {
      total: fullData.count || 0,
      current_page: fullData.current_page || 1,
      total_pages: fullData.total_pages || 1,
      next: fullData.next || null,
      previous: fullData.previous || null,
    },
  };
};

export const addPropertyUnit = async (unitData: UnitData) => {
  const response = await api.post(`${API_BASE}/units/`, unitData);
  return response.data.data;
};

export const updatePropertyUnit = async ({ unitId, unitData }: { unitId: string; unitData: UnitData }) => {
  const response = await api.patch(`${API_BASE}/units/${unitId}/`, unitData);
  return response.data.data;
};

export const deletePropertyUnit = async (unitId: string) => {
  await api.delete(`${API_BASE}/units/${unitId}/`);
  return { success: true };
};

// Property Statistics
export const getPropertyStats = async (propertyId: string) => {
  const response = await api.get(`${API_BASE}/properties/${propertyId}/stats/`);
  return response.data.data;
};
