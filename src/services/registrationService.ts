import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || '';

interface RegistrationResponse {
  success?: boolean;
  statusCode?: number;
  data?: any;
  error?: string;
}

export const registerUser = async (data: any): Promise<RegistrationResponse> => {
  try {
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
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.description || "Registration failed. Please try again."
    };
  }
};

export const sendRegistrationOtp = async (phoneNumber: string): Promise<RegistrationResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE}/get-otp-register/`,
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
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.description || err.response?.data?.error || "Failed to send verification code."
    };
  }
};

export const verifyRegistrationOtp = async (phoneNumber: string, otpCode: string): Promise<RegistrationResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE}/otp/verify-otp-register/`,
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
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.description || err.response?.data?.error || "Invalid verification code."
    };
  }
};
