/**
 * Centralized error handling utility for API responses
 * 
 * Note: 401 errors are automatically handled by the API interceptor in utils/api.js
 * which will attempt to refresh the token and redirect to login if that fails.
 * Services should NOT handle 401 errors separately.
 */

/**
 * Handle API errors consistently across all services
 * @param {Error} err - The error object from axios
 * @param {string} defaultMessage - Default error message to display
 * @returns {object} - Standardized error response object
 */
export const handleApiError = (err, defaultMessage) => {
    let error_msg = defaultMessage;
    
    // Check for various error response formats from the API
    if (err.response?.data?.description) {
        error_msg = err.response.data.description;
    } else if (err.response?.data?.error) {
        error_msg = err.response.data.error;
    } else if (err.response?.data?.message) {
        error_msg = err.response.data.message;
    } else if (err.response?.data?.detail) {
        error_msg = err.response.data.detail;
    } else if (err.message) {
        error_msg = err.message;
    }
    
    // Handle specific HTTP status codes (except 401 which is handled by interceptor)
    if (err.response?.status === 404) {
        error_msg = err.response.data?.description || "Resource not found.";
    } else if (err.response?.status === 400) {
        error_msg = err.response.data?.description || "Invalid data. Please check your input.";
    } else if (err.response?.status === 403) {
        error_msg = err.response.data?.description || "You don't have permission to perform this action.";
    } else if (err.response?.status === 409) {
        error_msg = err.response.data?.description || "A conflict occurred. This resource may already exist.";
    } else if (err.response?.status === 422) {
        error_msg = err.response.data?.description || "Validation error. Please check your input.";
    } else if (err.response?.status === 500) {
        error_msg = "Server error. Please try again later.";
    }
    
    return {
        success: false,
        error: error_msg,
        status: err.response?.status
    };
};

/**
 * Helper function to get authentication headers
 * @returns {object} - Headers object with Authorization token
 */
export const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};
