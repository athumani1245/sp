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


// Retrieve dashboard summary info
export const getDashboardInfo = async () => {
    try {
        const response = await axios.get(`${API_BASE}/dashboard/properties-rent-summary/`, {
            headers: getAuthHeaders()
        });
        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.description || 'Failed to fetch dashboard info.'
        };
    }
};
