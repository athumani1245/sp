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

export const sendRegistrationOtp = async (phoneNumber) => {
    try {
        const response = await axios.post(
            `${API_BASE}/get-otp/`,
            { username: phoneNumber },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return {
            success: true,
            data: response.data
        };
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.description || err.response?.data?.error || "Failed to send verification code."
        };
    }
};

export const verifyRegistrationOtp = async (phoneNumber, otpCode) => {
    try {
        const response = await axios.post(
            `${API_BASE}/otp/verify-otp/`,
            {
                username: phoneNumber,
                otp_code: otpCode
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        return {
            success: true,
            data: response.data
        };
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.description || err.response?.data?.error || "Invalid verification code."
        };
    }
};