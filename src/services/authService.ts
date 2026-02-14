import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || '';
const API_KEY = process.env.REACT_APP_API_KEY || '';

interface LoginResponse {
  success: boolean;
  token?: string;
  refresh?: string;
  subscription?: any;
  user?: any;
  error?: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE}/auth/login/`,
      { username, password },
      { headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY } }
    );

    const { access, refresh, subscription } = response.data.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('subscription', JSON.stringify(subscription));

    if (subscription) {
      localStorage.setItem('subscription', JSON.stringify(subscription));
    }

    return {
      success: true,
      token: access,
      refresh: refresh,
      subscription: subscription,
      user: response.data.user || {},
    };
  } catch (err: any) {
    let error_msg = 'Something went wrong. Please try again.';
    if (err.response?.data?.description) {
      error_msg = err.response.data.description;
    }
    return { success: false, error: error_msg };
  }
};

export const register = async (phoneNumber: string, otp: string, userData: any): Promise<RegisterResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE}/auth/register/`,
      {
        phone_number: phoneNumber,
        otp: otp,
        ...userData,
      },
      { headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY } }
    );

    return {
      success: true,
      message: response.data.message || 'Registration successful',
    };
  } catch (err: any) {
    let error_msg = 'Registration failed. Please try again.';
    if (err.response?.data?.description) {
      error_msg = err.response.data.description;
    }
    return { success: false, error: error_msg };
  }
};

export const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await axios.post(
      `${API_BASE}/auth/send-otp/`,
      { phone_number: phoneNumber },
      { headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY } }
    );

    return { success: true };
  } catch (err: any) {
    let error_msg = 'Failed to send OTP. Please try again.';
    if (err.response?.data?.description) {
      error_msg = err.response.data.description;
    }
    return { success: false, error: error_msg };
  }
};

export const verifyOTP = async (phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await axios.post(
      `${API_BASE}/auth/verify-otp/`,
      { phone_number: phoneNumber, otp: otp },
      { headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY } }
    );

    return { success: true };
  } catch (err: any) {
    let error_msg = 'Invalid OTP. Please try again.';
    if (err.response?.data?.description) {
      error_msg = err.response.data.description;
    }
    return { success: false, error: error_msg };
  }
};

export const logout = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const refresh = localStorage.getItem('refresh');
    const token = localStorage.getItem('token');

    if (refresh && token) {
      await axios.post(
        `${API_BASE}/auth/logout/`,
        { refresh },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-API-KEY': API_KEY,
          },
        }
      );
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('subscription');

    return { success: true };
  } catch (err: any) {
    // Still clear local storage even if API call fails
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('subscription');
    return { success: false, error: 'Logout completed with errors' };
  }
};

export const refreshToken = async (refresh: string): Promise<{ success: boolean; token?: string }> => {
  try {
    const response = await axios.post(
      `${API_BASE}/token/refresh/`,
      { refresh },
      { headers: { 'Content-Type': 'application/json', 'X-API-KEY': API_KEY } }
    );

    if (response.data && response.data.access) {
      localStorage.setItem('token', response.data.access);

      if (response.data.refresh) {
        localStorage.setItem('refresh', response.data.refresh);
      }

      return { success: true, token: response.data.access };
    }

    return { success: false };
  } catch (error) {
    return { success: false };
  }
};
