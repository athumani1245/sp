import axios from "axios";


const API_BASE = process.env.REACT_APP_API_BASE;


export const login = async (username, password, navigate, setError) => {
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
        navigate("/dashboard");
        return { success: true };
    }
    catch (err) {
        let error_msg = "Something went wrong. Please try again.";
        if (err.response?.data?.description) {
            error_msg = err.response.data.description;
            setError(error_msg);
        }
        return { success: false, error: error_msg}
    }
}

export const logout = async (navigate) => {
    try {
        const refresh = localStorage.getItem("refresh");
        await axios.post(
            `${API_BASE}/logout/`,
            { refresh },
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            }
        );
    }
    catch (err) {
        // Silently ignore logout API errors
        console.error("Logout API error:", err);
    }
    finally {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        navigate("/");
    }
}