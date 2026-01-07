import api from "../utils/api";
import { handleApiError } from "../utils/errorHandler";

const API_BASE = process.env.REACT_APP_API_BASE;

// Fetch user profile information
export const getUserProfile = async () => {
    try {
        const response = await api.get(`${API_BASE}/profile/retrieve/`);
        return {
            success: true,
            data: response.data.data
        };
    } catch (err) {
        return handleApiError(err, "Failed to fetch profile information.");
    }
};

// Update user profile information
export const updateUserProfile = async (profileData) => {
    try {
        const response = await api.patch(`${API_BASE}/profile/update/`, profileData);
        return {
            success: true,
            data: response.data.data,
            message: "Profile updated successfully!"
        };
    } catch (err) {
        return handleApiError(err, "Failed to update profile.");
    }
};

// Upload profile picture
// export const uploadProfilePicture = async (imageFile) => {
//     try {
//         const formData = new FormData();
//         formData.append('profile_image', imageFile);

//         const response = await axios.post(
//             `${API_BASE}/user/profile/image/`,
//             formData,
//             {
//                 headers: {
//                     'Authorization': `Bearer ${localStorage.getItem("token")}`,
//                     'Content-Type': 'multipart/form-data'
//                 }
//             }
//         );
//         return {
//             success: true,
//             data: response.data.data,
//             message: "Profile picture updated successfully!"
//         };
//     } catch (err) {
//         return handleApiError(err, "Failed to upload profile picture.");
//     }
// };

// Change user password
export const changePassword = async (currentPassword, newPassword) => {
    try {
        await api.put(
            `${API_BASE}/profile/change-password/`,
            {
                old_password: currentPassword,
                new_password: newPassword
            }
        );
        return {
            success: true,
            message: "Password changed successfully!"
        };
    } catch (err) {
        const errorResponse = handleApiError(err, "Failed to change password.");
        if (err.response?.status === 400) {
            errorResponse.error = err.response?.description || errorResponse.error;
        }
        return errorResponse;
    }
};

// Send OTP for phone number change
export const sendOtpForPhoneChange = async (newPhone) => {
    try {
        const response = await api.post(`${API_BASE}/get-otp-change-username/`, { username: newPhone });
        return {
            success: true,
            message: "OTP sent to your phone number"
        };
    } catch (err) {
        return handleApiError(err, "Failed to send OTP.");
    }
};

// Verify OTP and change phone number
export const verifyOtpAndChangePhone = async (newPhone, otpCode) => {
    try {
        const response = await api.post(
            `${API_BASE}/profile/change_username/`,
            {
                new_username: newPhone,
                otp_code: otpCode
            }
        );
        
        if (response.data.status) {
            return {
                success: true,
                message: "Phone number updated successfully!"
            };
        } else {
            return {
                success: false,
                error: response.data.description || "Failed to update phone number"
            };
        }
    } catch (err) {
        return handleApiError(err, "Failed to verify OTP and update phone number.");
    }
};

// Resend OTP for phone number change
export const resendOtpForPhoneChange = async (newPhone) => {
    try {
        const response = await api.post(`${API_BASE}/otp/resend/change_username`, { new_username: newPhone });
        return {
            success: true,
            message: "OTP resent to your phone number"
        };
    } catch (err) {
        return handleApiError(err, "Failed to resend OTP.");
    }
};

// // Delete user account
// export const deleteAccount = async (password) => {
//     try {
//         const response = await axios.delete(
//             `${API_BASE}/user/account/`,
//             {
//                 headers: getAuthHeaders(),
//                 data: { password: password }
//             }
//         );
//         return {
//             success: true,
//             message: "Account deleted successfully."
//         };
//     } catch (err) {
//         const errorResponse = handleApiError(err, "Failed to delete account.");
//         if (err.response?.status === 400) {
//             errorResponse.error = "Password is incorrect.";
//         }
//         return errorResponse;
//     }
// };

// Get user notification preferences
// export const getNotificationPreferences = async () => {
//     try {
//         const response = await axios.get(
//             `${API_BASE}/user/notifications/`,
//             { headers: getAuthHeaders() }
//         );
//         return {
//             success: true,
//             data: response.data.data
//         };
//     } catch (err) {
//         return handleApiError(err, "Failed to fetch notification preferences.");
//     }
// };

// Update user notification preferences
// export const updateNotificationPreferences = async (preferences) => {
//     try {
//         const response = await axios.put(
//             `${API_BASE}/user/notifications/`,
//             preferences,
//             { headers: getAuthHeaders() }
//         );
//         return {
//             success: true,
//             data: response.data.data,
//             message: "Notification preferences updated successfully!"
//         };
//     } catch (err) {
//         return handleApiError(err, "Failed to update notification preferences.");
//     }
// };

// Download user data
// export const downloadUserData = async () => {
//     try {
//         const response = await axios.get(
//             `${API_BASE}/user/data-export/`,
//             {
//                 headers: getAuthHeaders(),
//                 responseType: 'blob'
//             }
//         );
        
//         // Create download link
//         const url = window.URL.createObjectURL(new Blob([response.data]));
//         const link = document.createElement('a');
//         link.href = url;
//         link.setAttribute('download', 'user_data.zip');
//         document.body.appendChild(link);
//         link.click();
//         link.remove();
//         window.URL.revokeObjectURL(url);
        
//         return {
//             success: true,
//             message: "User data downloaded successfully!"
//         };
//     } catch (err) {
//         return handleApiError(err, "Failed to download user data.");
//     }
// };

// Refresh access token using refresh token
// export const refreshAccessToken = async () => {
//     try {
//         const refreshToken = localStorage.getItem("refresh");
//         if (!refreshToken) {
//             throw new Error("No refresh token available");
//         }

//         const response = await axios.post(
//             `${API_BASE}/auth/token/refresh/`,
//             { refresh: refreshToken },
//             {
//                 headers: {
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );

//         const { access } = response.data;
//         localStorage.setItem("token", access);
//         return {
//             success: true,
//             token: access
//         };
//     } catch (err) {
//         localStorage.removeItem("token");
//         localStorage.removeItem("refresh");
//         return {
//             success: false,
//             error: "Session expired. Please login again."
//         };
//     }
// };

