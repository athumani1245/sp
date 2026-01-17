import axios from "axios";
import api from "../utils/api";
import { handleApiError } from "../utils/errorHandler";

const API_BASE = process.env.REACT_APP_API_BASE;


// get all regions
const getRegions = async () => {
    try {
        const response = await api.get(`${API_BASE}/regions/`);

        return {
            success: true,
            data: response.data.data,
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch regions.");
    }
};

// get all districts
const getDistricts = async (regionId) => {
    try {
        const response = await api.get(`${API_BASE}/regions/districts/${regionId}/`);

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch districts.");
    }
};

// get all wards
const getWards = async (districtId) => {
    try {
        const response = await api.get(`${API_BASE}/districts/wards/${districtId}/`);

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch wards.");
    }
};

// Helper function to format property data for API
const formatPropertyData = (propertyData) => {
    const formattedData = {
        property_name: propertyData.propertyName || propertyData.name,
        property_type: propertyData.propertyType || "Residential",
        address: {
            ward: propertyData.ward || null,
            street: propertyData.street || ""
        },
    };
    
    // Include manager_id - send null to remove manager, or the actual ID to assign
    if (propertyData.manager_id !== undefined) {
        formattedData.manager_id = propertyData.manager_id || null;
    }
    
    return formattedData;
};


// Add a new property
export const addProperty = async (propertyData) => {
    try {
        const formattedData = formatPropertyData(propertyData);

        const response = await api.post(`${API_BASE}/properties/`, formattedData);

        return {
            success: true,
            data: response.data.data,
            message: "Property added successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to add property.");
    }
};

// Get all properties
export const getProperties = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.status) queryParams.append('status', params.status);
        if (params.property_type) queryParams.append('property_type', params.property_type);

        const response = await api.get(`${API_BASE}/properties/?${queryParams.toString()}`);

        return {
            success: true,
            data: response.data.data,
            pagination: response.data.pagination || {}
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch properties.");
    }
};

// Get a single property by ID
export const getPropertyById = async (propertyId) => {
    try {
        const response = await api.get(`${API_BASE}/properties/${propertyId}/`);

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch property details.");
    }
};

// Update a property
export const updateProperty = async (propertyId, propertyData) => {
    try {
        const formattedData = formatPropertyData(propertyData);

        const response = await api.patch(`${API_BASE}/properties/${propertyId}/`, formattedData);

        return {
            success: true,
            data: response.data.data,
            message: "Property updated successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to update property.");
    }
};

// Delete a property
export const deleteProperty = async (propertyId) => {
    try {
        await api.delete(`${API_BASE}/properties/${propertyId}/`);

        return {
            success: true,
            message: "Property deleted successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to delete property.");
    }
};


//  get available units
export const getAvailableUnits = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (params.property) queryParams.append('property', params.property);

        const response = await api.get(`${API_BASE}/units/?${queryParams.toString()}`);

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch available units.");
    }
};

// Get property units
export const getPropertyUnits = async (params = {}) => {
    try {
        if (!params.property) {
            throw new Error("property is required in query parameters.");
        }
        const queryParams = new URLSearchParams();
        queryParams.append('property', params.property);
        if (params.page) queryParams.append('page', params.page);
        

        const response = await api.get(`${API_BASE}/units/?${queryParams.toString()}`);

        return {
            success: true,
            data: response.data.data.items || [], // Return items array
            pagination: {
                current_page: response.data.data.current_page,
                total_pages: response.data.data.total_pages,
                count: response.data.data.count,
                next: response.data.data.next,
                previous: response.data.data.previous
            }
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch property units.");
    }
};

// Add unit to property
export const addPropertyUnit = async (propertyId, unitData) => {
    try {
        const response = await api.post(`${API_BASE}/units/`, unitData);

        return {
            success: true,
            data: response.data.data,
            message: "Unit added successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to add unit.");
    }
};



// Update a property unit
export const updatePropertyUnit = async (unitId, unitData) => {
    try {
        const response = await api.patch(`${API_BASE}/units/${unitId}/`, unitData);

        return {
            success: true,
            data: response.data.data,
            message: "Unit updated successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to update unit.");
    }
};

// Delete a property unit
export const deletePropertyUnit = async (unitId) => {
    try {
        await api.delete(`${API_BASE}/units/${unitId}/`);

        return {
            success: true,
            message: "Unit deleted successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to delete unit.");
    }
};

// Get property managers
export const getPropertyManagers = async (propertyId) => {
    try {
        const response = await api.get(`${API_BASE}/properties/${propertyId}/managers/`);

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch property managers.");
    }
};

// Add manager to property
export const addPropertyManager = async (propertyId, managerId) => {
    try {
        const response = await api.post(`${API_BASE}/properties/${propertyId}/managers/`, { manager_id: managerId });

        return {
            success: true,
            data: response.data.data,
            message: "Manager added successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to add manager.");
    }
};

// Remove manager from property
export const removePropertyManager = async (propertyId, managerId) => {
    try {
        await api.delete(`${API_BASE}/properties/${propertyId}/managers/${managerId}/`);

        return {
            success: true,
            message: "Manager removed successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to remove manager.");
    }
};

// Get property statistics
export const getPropertyStats = async (propertyId) => {
    try {
        const response = await api.get(`${API_BASE}/properties/${propertyId}/stats/`);

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch property statistics.");
    }
};

// Get available managers for property assignment
export const getAvailableManagers = async () => {
    try {
        const response = await api.get(`${API_BASE}/users/managers/`);

        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch available managers.");
    }
};

// Bulk operations
export const bulkDeleteProperties = async (propertyIds) => {
    try {
        await api.post(`${API_BASE}/properties/bulk-delete/`, { property_ids: propertyIds });

        return {
            success: true,
            message: `${propertyIds.length} properties deleted successfully!`
        };
    } catch (err) {
        return handleApiError(err, "Failed to delete properties.");
    }
};

// Export properties data
export const exportProperties = async (format = 'csv') => {
    try {
        const response = await api.get(
            `${API_BASE}/properties/export/?format=${format}`,
            {
                responseType: 'blob'
            }
        );

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `properties.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return {
            success: true,
            message: "Properties exported successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to export properties.");
    }
};

// Search properties
export const searchProperties = async (searchQuery, filters = {}) => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('q', searchQuery);
        
        if (filters.property_type) queryParams.append('property_type', filters.property_type);
        if (filters.region) queryParams.append('region', filters.region);
        if (filters.district) queryParams.append('district', filters.district);
        if (filters.min_units) queryParams.append('min_units', filters.min_units);
        if (filters.max_units) queryParams.append('max_units', filters.max_units);

        const response = await api.get(`${API_BASE}/properties/search/?${queryParams.toString()}`);

        return {
            success: true,
            data: response.data.data,
            pagination: response.data.pagination || {}
        };
    } catch (err) {
        return handleApiError(err, "Failed to search properties.");
    }
};

// Property Manager Management
export const registerPropertyManager = async (managerData) => {
    try {
        const response = await api.post(`${API_BASE}/auth/register-property-manager/`, managerData);

        return {
            success: true,
            message: response.data.description || "Property manager registered successfully",
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to register property manager.");
    }
};

export const getAllPropertyManagers = async () => {
    try {
        const response = await api.get(`${API_BASE}/property-managers`);

        return {
            success: true,
            data: response.data.data || response.data || []
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch property managers.");
    }
};

export const updatePropertyManager = async (managerId, managerData) => {
    try {
        const response = await api.patch(`${API_BASE}/property-managers/${managerId}`, managerData);

        return {
            success: true,
            message: response.data.description || "Property manager updated successfully",
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to update property manager.");
    }
};

export const deletePropertyManager = async (managerId) => {
    try {
        const response = await api.delete(`${API_BASE}/property-managers/${managerId}/`);

        return {
            success: true,
            message: response.data.description || "Property manager deleted successfully"
        };
    } catch (err) {
        return handleApiError(err, "Failed to delete property manager.");
    }
};

// Export location functions
export { getRegions, getDistricts, getWards };

