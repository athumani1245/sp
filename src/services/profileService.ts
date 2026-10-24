import api from '../utils/api';

const API_BASE = process.env.REACT_APP_API_BASE;

interface ProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface PasswordData {
  old_password: string;
  new_password: string;
}

interface PhoneChangeData {
  username: string;
}

interface OtpVerifyData {
  new_username: string;
  otp_code: string;
}

// Fetch user profile information
export const getUserProfile = async () => {
  const response = await api.get(`${API_BASE}/profile/retrieve/`);
  return response.data.data;
};

// Update user profile information
export const updateUserProfile = async (profileData: ProfileData) => {
  const response = await api.patch(`${API_BASE}/profile/update/`, profileData);
  return response.data.data;
};

// Change user password
export const changePassword = async (passwordData: PasswordData) => {
  const response = await api.put(`${API_BASE}/profile/change-password/`, passwordData);
  return response.data;
};

// Send OTP for phone number change
export const sendOtpForPhoneChange = async (newPhone: string) => {
  const response = await api.post(`${API_BASE}/get-otp-change-username/`, { 
    username: newPhone 
  });
  return response.data;
};

// Verify OTP and change phone number
export const verifyOtpAndChangePhone = async (username: string, otpCode: string) => {
  const response = await api.post(`${API_BASE}/profile/change_username/`, {
    new_username: String(username),
    otp_code: String(otpCode),
  });
  
  if (response.data.status) {
    return response.data;
  } else {
    throw new Error(response.data.description || 'Failed to update phone number');
  }
};

// Resend OTP for phone number change
export const resendOtpForPhoneChange = async (newPhone: string) => {
  const response = await api.post(`${API_BASE}/otp/resend/change_username`, { 
    new_username: newPhone 
  });
  return response.data;
};

// Upload profile picture (if needed in future)
// export const uploadProfilePicture = async (imageFile: File) => {
//   const formData = new FormData();
//   formData.append('profile_image', imageFile);
//   
//   const response = await api.post(`${API_BASE}/user/profile/image/`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return response.data.data;
// };
