import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE;






//done
export const sendOtp = async (username, navigate, setError, setLoading) => {
    try {
        const response = await axios.post(
            `${API_BASE}/get-otp/`,
            {
                username
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        navigate("/otp-verify", { state: { username } });
    }
    catch (err) {
        if (err.response?.data?.error) {
            setError(err.response.data.error);
        }
    }
    finally {
        setLoading(false);
    }
}



// done
export const verifyOtp = async (username, otp, setOtpError) => {
    try {
        const otp_code = otp
        const response = await axios.post(
            `${API_BASE}/otp/verify-otp/`,
            {
                username,
                otp_code
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        // Return the actual API response structure
        return response.data;
    }
    catch (err) {
        if (err.response?.data?.description) {
            setOtpError(err.response.data.description);
        }
        // Return error response structure similar to API
        return {
            status: false,
            statusCode: err.response?.status || 500,
            description: err.response?.data?.description || 'OTP verification failed'
        };
    }
}

// Reset Password
export const resetPassword = async (newPassword, token) => {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        
        
        const response = await axios.post(
            `${API_BASE}/reset-password/`,
            {
                token,
                new_password: newPassword
            },
            { headers }
        );
        
        return {
            success: true,
            message: response.data.message || 'Password reset successfully'
        };
    } catch (err) {
        return {
            success: false,
            error: err.response?.data?.error || err.response?.data?.description || 'Failed to reset password'
        };
    }
};


