import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the error status is 401 and there is no originalRequest._retry flag,
        // it means the token has expired and we need to refresh it
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call your refresh token endpoint
                const response = await axios.post(`${process.env.REACT_APP_API_BASE}/token/refresh/`, {
                    refresh: refreshToken
                });

                if (response.data.access) {
                    localStorage.setItem('token', response.data.access);
                    
                    // If a new refresh token is provided, update it as well
                    if (response.data.refresh) {
                        localStorage.setItem('refresh', response.data.refresh);
                    }
                    
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh token fails, logout user and redirect to login immediately
                localStorage.removeItem('token');
                localStorage.removeItem('refresh');
                
                // Redirect to login page without showing error
                window.location.href = '/';
                
                // Return a rejected promise that won't be caught by components
                return new Promise(() => {}); // Empty promise that never resolves
            }
        }

        // For any other 401 errors that might occur
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh');
            window.location.href = '/';
            return new Promise(() => {}); // Empty promise that never resolves
        }

        return Promise.reject(error);
    }
);

export default api;
