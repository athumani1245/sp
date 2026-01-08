/**
 * usePasswordChange Hook
 * Manages password change modal and logic
 */

import { useState } from 'react';
import { changePassword } from '../../../services/profileService';

export const usePasswordChange = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });

      if (result.success) {
        setPasswordSuccess(result.message || 'Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(result.error);
      }
    } catch (err) {
      setPasswordError('Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return {
    showPasswordModal,
    passwordForm,
    passwordError,
    passwordSuccess,
    passwordLoading,
    handlePasswordChange,
    handleChangePassword,
    openPasswordModal,
    closePasswordModal,
  };
};
