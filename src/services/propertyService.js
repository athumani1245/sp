import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE;

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Helper function to handle errors consistently
const handleApiError = (err, defaultMessage) => {
    let error_msg = defaultMessage;
    
    if (err.response?.data?.description) {
        error_msg = err.response.data.description;
    } else if (err.response?.status === 401) {
        error_msg = "Session expired. Please login again.";
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
    } else if (err.response?.status === 404) {
        error_msg = "Resource not found.";
    } else if (err.response?.status === 400) {
        error_msg = "Invalid data. Please check your input.";
    } else if (err.response?.status === 403) {
        error_msg = "You don't have permission to perform this action.";
    } else if (err.response?.status === 409) {
        error_msg = "Property with this name already exists.";
    }
    
    return {
        success: false,
        error: error_msg
    };
};


// get all regions
const getRegions = async () => {
    try {
        const response = await axios.get(
            `${API_BASE}/regions/`,
            { headers: getAuthHeaders() }
        );
        console.log("Regions Response:", response.data.data);

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
        console.log("Fetching districts for region ID:", regionId);
        const response = await axios.get(
            `${API_BASE}/regions/districts/${regionId}/`,
            { headers: getAuthHeaders() }
        );

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
        const response = await axios.get(
            `${API_BASE}/districts/wards/${districtId}/`,
            { headers: getAuthHeaders() }
        );

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
    return {
        property_name: propertyData.propertyName || propertyData.name,
        property_type: propertyData.propertyType || "Residential",
        address: {
            ward: propertyData.ward || "",
            street: propertyData.street || ""
        },
    };
};


// Add a new property
export const addProperty = async (propertyData) => {
    try {
        const formattedData = formatPropertyData(propertyData);
        console.log("Formatted Property Data:", formattedData);

        const response = await axios.post(
            `${API_BASE}/properties/`,
            formattedData,
            { headers: getAuthHeaders() }
        );

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

        const response = await axios.get(
            `${API_BASE}/properties/?${queryParams.toString()}`,
            { headers: getAuthHeaders() }
        );

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
        console.log("Fetching property details for ID:", propertyId);
        const response = await axios.get(
            `${API_BASE}/properties/${propertyId}/`,
            { headers: getAuthHeaders() }
        );

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
        console.log("Formatted Data:", formattedData);
        console.log("Property ID:", propertyId);

        const response = await axios.patch(
            `${API_BASE}/properties/${propertyId}/`,
            formattedData,
            { 
                headers: { ...getAuthHeaders() } 
            }
        );

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
        await axios.delete(
            `${API_BASE}/properties/${propertyId}/`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            message: "Property deleted successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to delete property.");
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

        const response = await axios.get(
            `${API_BASE}/units/?${queryParams.toString()}`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            pagination: response.data.pagination || {}
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch property units.");
    }
};

// Add unit to property
export const addPropertyUnit = async (propertyId, unitData) => {
    try {
        console.log("Adding property unit:", unitData);
        const response = await axios.post(
            `${API_BASE}/units/`,
            unitData,
            { headers: getAuthHeaders() }
        );

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
        const response = await axios.patch(
            `${API_BASE}/units/${unitId}/`,
            unitData,
            { headers: getAuthHeaders() }
        );

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
        await axios.delete(
            `${API_BASE}/units/${unitId}/`,
            { headers: getAuthHeaders() }
        );

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
        const response = await axios.get(
            `${API_BASE}/properties/${propertyId}/managers/`,
            { headers: getAuthHeaders() }
        );

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
        const response = await axios.post(
            `${API_BASE}/properties/${propertyId}/managers/`,
            { manager_id: managerId },
            { headers: getAuthHeaders() }
        );

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
        await axios.delete(
            `${API_BASE}/properties/${propertyId}/managers/${managerId}/`,
            { headers: getAuthHeaders() }
        );

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
        const response = await axios.get(
            `${API_BASE}/properties/${propertyId}/stats/`,
            { headers: getAuthHeaders() }
        );

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
        const response = await axios.get(
            `${API_BASE}/users/managers/`,
            { headers: getAuthHeaders() }
        );

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
        await axios.post(
            `${API_BASE}/properties/bulk-delete/`,
            { property_ids: propertyIds },
            { headers: getAuthHeaders() }
        );

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
        const response = await axios.get(
            `${API_BASE}/properties/export/?format=${format}`,
            {
                headers: getAuthHeaders(),
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

        const response = await axios.get(
            `${API_BASE}/properties/search/?${queryParams.toString()}`,
            { headers: getAuthHeaders() }
        );

        return {
            success: true,
            data: response.data.data,
            pagination: response.data.pagination || {}
        };
    } catch (err) {
        return handleApiError(err, "Failed to search properties.");
    }
};

// Export location functions
export { getRegions, getDistricts, getWards };
