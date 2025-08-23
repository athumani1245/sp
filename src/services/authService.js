import axios from "axios";
import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE;

export const login = async (username, password) => {
    try {
        const response = await axios.post(
            `${API_BASE}/auth/login/`,
            {
                username,
                password
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }

        );
        const { access, refresh } = response.data.data;
        localStorage.setItem("token", access);
        localStorage.setItem("refresh", refresh);
        return {
            success: true,
            token: access,
            refresh: refresh,
            user: response.data.user || {} // adjust based on your API response
        };
    }
    catch (err) {
        let error_msg = "Something went wrong. Please try again.";
        if (err.response?.data?.description) {
            error_msg = err.response.data.description;
        }
        return { success: false, error: error_msg }
    }
}

export const logout = async () => {
    try {
        const refresh = localStorage.getItem("refresh");
        console.log("Logging out with refresh token:", refresh);
        console.log("Logging out with access token:", localStorage.getItem("token"));
        await api.post(
            `${API_BASE}/logout/`,
            { refresh },
            { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem("token")}` } }
        );
        return { success: true };
    }
    catch (err) {
        console.error("Logout API error:", err);
        return { success: false, error: "Failed to logout properly" };
    }
}