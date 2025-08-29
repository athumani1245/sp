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
        console.log(response);
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
        await axios.post(
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
    }
    catch (err) {
        console.log(err);
        if (err.response?.data?.description) {
            setOtpError(err.response.data.description);
        }
    }
}
