import api from '../utils/api';

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// Send OTP for password reset
export const sendOtpForReset = async (username: string): Promise<ApiResponse> => {
  try {
    await api.post(
      '/get-otp/',
      { username }
    );
    
    return {
      success: true,
      message: 'Verification code sent to your phone',
    };
  } catch (err: any) {
    const error_msg = err.response?.data?.description || err.response?.data?.error || 'Failed to send OTP. Please try again.';
    return { success: false, error: error_msg };
  }
};

// Verify OTP for password reset
export const verifyOtpForReset = async (username: string, otp_code: string): Promise<ApiResponse> => {
  try {
    const response = await api.post(
      '/otp/verify-otp/',
      { username, otp_code }
    );
    
    // Return the response data including token
    return {
      success: response.data.status === true,
      data: response.data.data,
      message: response.data.description || 'OTP verified successfully',
    };
  } catch (err: any) {
    const error_msg = err.response?.data?.description || err.response?.data?.error || 'OTP verification failed';
    return { success: false, error: error_msg };
  }
};

// Reset password with token
export const resetPassword = async (token: string, newPassword: string): Promise<ApiResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE}/reset-paspi.post(
      '/reset-password/',
      { token, new_password: newPassword
    
    return {
      success: true,
      message: response.data.message || response.data.description || 'Password reset successfully',
    };
  } catch (err: any) {
    const error_msg = err.response?.data?.error || err.response?.data?.description || 'Failed to reset password';
    return { success: false, error: error_msg };
  }
};
