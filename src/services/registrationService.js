import axios from "axios";
const API_BASE = process.env.REACT_APP_API_BASE;


export const registerUser = async (data) => {
    try {
        console.log(data);
        const response = await axios.post(
            `${API_BASE}/auth/register/`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    }
    catch (err) {
        return {
            success: false,
            error: err.response?.data?.description || "Registration failed. Please try again."
        };
    }
};