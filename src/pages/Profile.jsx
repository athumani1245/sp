/**
 * Profile Page - Refactored
 * Manages user profile with password and phone change features
 */

import React from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import ProfileInfoSection from '../features/profile/components/ProfileInfoSection';
import ChangePasswordModal from '../features/profile/components/ChangePasswordModal';
import ChangePhoneModal from '../features/profile/components/ChangePhoneModal';
import { useProfileData } from '../features/profile/hooks/useProfileData';
import { usePasswordChange } from '../features/profile/hooks/usePasswordChange';
import { usePhoneChange } from '../features/profile/hooks/usePhoneChange';
import { usePageTitle } from '../hooks/usePageTitle';
import '../assets/styles/profile.css';

function Profile() {
  usePageTitle('Profile');

  const {
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
    refreshProfile,
  } = useProfileData();

  const {
    showPasswordModal,
    passwordForm,
    passwordError,
    passwordSuccess,
    passwordLoading,
    handlePasswordChange,
    handleChangePassword,
    openPasswordModal,
    closePasswordModal,
  } = usePasswordChange();

  const {
    showPhoneModal,
    phoneStep,
    newPhone,
    phoneOtp,
    phoneError,
    phoneSuccess,
    phoneLoading,
    countdown,
    canResendOtp,
    otpInputRefs,
    setNewPhone,
    handleSendOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handleVerifyOtp,
    handleResendOtp,
    openPhoneModal,
    closePhoneModal,
  } = usePhoneChange(refreshProfile);

  return (
    <Layout>
      <div className="main-content">
        <div className="profile-container">
          <div className="profile-header">
            <h2 className="page-title">My Profile</h2>
            <p className="page-subtitle">Manage your personal information and account settings</p>
          </div>

          <Toast
            show={!!error || !!success}
            message={error || success}
            type={error ? 'error' : 'success'}
            onClose={() => {
              setError('');
              setSuccess('');
            }}
          />

          <div className="row profile-row">
            <div className="col-12 profile-info-section">
              <ProfileInfoSection
                userInfo={userInfo}
                isEditing={isEditing}
                loading={loading}
                onInputChange={handleInputChange}
                onSave={handleSave}
                onCancel={handleCancel}
                onEdit={() => setIsEditing(true)}
              />

              {/* Account Settings Section */}
              <div className="profile-card mt-4">
                <div className="card-header">
                  <h5 className="card-title">Account Settings</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-sm-6 col-md-6">
                      <button
                        className="odoo-btn odoo-btn-outline-primary w-100 mb-3 btn-mobile-full"
                        onClick={openPasswordModal}
                        disabled={loading}
                      >
                        <i className="fas fa-key me-2"></i>
                        Change Password
                      </button>
                    </div>
                    <div className="col-12 col-sm-6 col-md-6">
                      <button
                        className="odoo-btn odoo-btn-outline-info w-100 mb-3 btn-mobile-full"
                        onClick={openPhoneModal}
                        disabled={loading}
                      >
                        <i className="fas fa-phone me-2"></i>
                        Change Phone Number
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        show={showPasswordModal}
        onHide={closePasswordModal}
        passwordForm={passwordForm}
        passwordError={passwordError}
        passwordSuccess={passwordSuccess}
        passwordLoading={passwordLoading}
        onPasswordChange={handlePasswordChange}
        onSubmit={handleChangePassword}
      />

      <ChangePhoneModal
        show={showPhoneModal}
        onHide={closePhoneModal}
        phoneStep={phoneStep}
        newPhone={newPhone}
        phoneOtp={phoneOtp}
        phoneError={phoneError}
        phoneSuccess={phoneSuccess}
        phoneLoading={phoneLoading}
        countdown={countdown}
        canResendOtp={canResendOtp}
        otpInputRefs={otpInputRefs}
        onPhoneChange={setNewPhone}
        onSendOtp={handleSendOtp}
        onOtpChange={handleOtpChange}
        onOtpKeyDown={handleOtpKeyDown}
        onVerifyOtp={handleVerifyOtp}
        onResendOtp={handleResendOtp}
      />
    </Layout>
  );
}

export default Profile;
