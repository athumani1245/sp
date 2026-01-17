/**
 * useProfileData Hook
 * Manages user profile data loading and editing
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../../../services/profileService';
import { ROUTES } from '../../../config/constants';

export const useProfileData = () => {
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const loadUserProfile = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUserProfile();
      if (result.success) {
        setUserInfo({
          firstName: result.data.first_name || '',
          lastName: result.data.last_name || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          address: result.data.address || '',
        });
      } else {
        setError(result.error);
        if (result.error.includes('Session expired')) {
          navigate(ROUTES.LOGIN);
        }
      }
    } catch (err) {
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate(ROUTES.LOGIN);
      return;
    }
    loadUserProfile();
  }, [navigate, loadUserProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const profileData = {
        first_name: userInfo.firstName,
        last_name: userInfo.lastName,
        email: userInfo.email,
        phone: userInfo.phone,
        address: userInfo.address,
      };
      
      const result = await updateUserProfile(profileData);
      if (result.success) {
        setSuccess(result.message || 'Profile updated successfully!');
        setIsEditing(false);
        await loadUserProfile();
      } else {
        setError(result.error);
        if (result.error.includes('Session expired')) {
          navigate(ROUTES.LOGIN);
        }
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    loadUserProfile();
  };

  return {
    userInfo,
    isEditing,
    loading,
    error,
    success,
    setIsEditing,
    setError,
    setSuccess,
    handleInputChange,
    handleSave,
    handleCancel,
    refreshProfile: loadUserProfile,
  };
};
