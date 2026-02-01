import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE;

// Retrieve dashboard summary info
export const getDashboardInfo = async () => {
  try {
    const response = await api.get(`${API_BASE}/dashboard`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (err: any) {
    const description = err.response?.data?.description || err.response?.data?.message || 'Failed to fetch dashboard info.';
    return {
      success: false,
      error: description,
    };
  }
};
