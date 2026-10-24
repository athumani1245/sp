import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  sendOtpForPhoneChange,
  verifyOtpAndChangePhone,
  resendOtpForPhoneChange,
} from '../services/profileService';
import { message } from 'antd';

// Query Keys
export const profileKeys = {
  all: ['profile'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
};

// Profile Query Hook
export const useProfile = () => {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: getUserProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Update Profile Mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
      message.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to update profile';
      message.error(errorMsg);
    },
  });
};

// Change Password Mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      message.success('Password changed successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to change password';
      message.error(errorMsg);
    },
  });
};

// Send OTP Mutation
export const useSendOtpForPhoneChange = () => {
  return useMutation({
    mutationFn: sendOtpForPhoneChange,
    onSuccess: () => {
      message.success('OTP sent to your phone number');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to send OTP';
      message.error(errorMsg);
    },
  });
};

// Verify OTP and Change Phone Mutation
export const useVerifyOtpAndChangePhone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, otp_code }: { username: string; otp_code: string }) =>
      verifyOtpAndChangePhone(username, otp_code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
      message.success('Phone number updated successfully!');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.message || 'Failed to verify OTP and update phone number';
      message.error(errorMsg);
    },
  });
};

// Resend OTP Mutation
export const useResendOtpForPhoneChange = () => {
  return useMutation({
    mutationFn: resendOtpForPhoneChange,
    onSuccess: () => {
      message.success('OTP resent to your phone number');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.description || error.response?.data?.message || 'Failed to resend OTP';
      message.error(errorMsg);
    },
  });
};
