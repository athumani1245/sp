import api from "../utils/api";
import { handleApiError } from "../utils/errorHandler";

const API_BASE = process.env.REACT_APP_API_BASE;

// Retrieve dashboard summary info
export const getDashboardInfo = async () => {
    try {
        const response = await api.get(`${API_BASE}/dashboard/properties-rent-summary/`);
        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, 'Failed to fetch dashboard info.');
    }
};

