import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import "../assets/styles/profile.css";
import Layout from "../components/Layout";
import { 
    getUserProfile, 
    updateUserProfile,
    changePassword
} from "../services/profileService";

function Profile() {
    const [userInfo, setUserInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    
    // Change password modal states
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    
    const navigate = useNavigate();

    const loadUserProfile = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getUserProfile();
            if (result.success) {
                setUserInfo({
                    firstName: result.data.first_name || "",
                    lastName: result.data.last_name || "",
                    email: result.data.email || "",
                    phone: result.data.phone || "",
                    address: result.data.address || "",
                });
            } else {
                setError(result.error);
                // If session expired, redirect to login
                if (result.error.includes("Session expired")) {
                    navigate("/");
                }
            }
        } catch (err) {
            setError("Failed to load profile information");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        // Load user profile data (this would typically come from an API)
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
        setError("");
        setSuccess("");
        
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
                setSuccess(result.message || "Profile updated successfully!");
                setIsEditing(false);
                // Reload profile to get updated data
                await loadUserProfile();
            } else {
                setError(result.error);
                // If session expired, redirect to login
                if (result.error.includes("Session expired")) {
                    navigate("/");
                }
            }
        } catch (err) {
            setError("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        loadUserProfile(); // Reload original data
        setError("");
        setSuccess("");
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({
            ...prev,
            [name]: value
        }));
        setPasswordError("");
        setPasswordSuccess("");
    };

    const validatePasswordForm = () => {
        if (!passwordForm.currentPassword) {
            setPasswordError("Please enter your current password");
            return false;
        }
        if (!passwordForm.newPassword) {
            setPasswordError("Please enter a new password");
            return false;
        }
        if (passwordForm.newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters long");
            return false;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("New passwords do not match");
            return false;
        }
        if (passwordForm.currentPassword === passwordForm.newPassword) {
            setPasswordError("New password must be different from current password");
            return false;
        }
        return true;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (!validatePasswordForm()) {
            return;
        }

        setPasswordLoading(true);
        setPasswordError("");
        
        try {
            const result = await changePassword(
                passwordForm.currentPassword,
                passwordForm.newPassword
            );
            
            if (result.success) {
                setPasswordSuccess(result.message || "Password changed successfully!");
                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                
                // Close modal after 2 seconds
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess("");
                }, 2000);
            } else {
                setPasswordError(result.error);
                // If session expired, redirect to login
                if (result.error.includes("Session expired")) {
                    navigate("/");
                }
            }
        } catch (err) {
            setPasswordError("Failed to change password");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleClosePasswordModal = () => {
        setShowPasswordModal(false);
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
        setPasswordError("");
        setPasswordSuccess("");
    };    


    const handleChangePassword = () => {
        setShowPasswordModal(true);
    };

    return (
        <Layout>
            <div className="main-content">
                <div className="profile-container">
                            <div className="profile-header">
                                <h2 className="page-title">My Profile</h2>
                                <p className="page-subtitle">Manage your personal information and account settings</p>
                            </div>

                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <div className="row profile-row">
                                {/* Profile Information Section */}
                                <div className="col-12 profile-info-section">
                                    <div className="profile-card">
                                        <div className="card-header">
                                            <h5 className="card-title">Personal Information</h5>
                                            {!isEditing ? (
                                                <button
                                                    className="odoo-btn odoo-btn-primary odoo-btn-sm"
                                                    onClick={() => setIsEditing(true)}
                                                >
                                                    <i className="fas fa-edit me-2"></i>
                                                    Edit Profile
                                                </button>
                                            ) : (
                                                <div className="btn-group d-flex flex-column flex-sm-row gap-2">
                                                    <button
                                                        className="odoo-btn odoo-btn-success odoo-btn-sm"
                                                        onClick={handleSave}
                                                        disabled={loading}
                                                    >
                                                        <i className="fas fa-save me-2"></i>
                                                        {loading ? "Saving..." : "Save"}
                                                    </button>
                                                    <button
                                                        className="odoo-btn odoo-btn-secondary odoo-btn-sm"
                                                        onClick={handleCancel}
                                                        disabled={loading}
                                                    >
                                                        <i className="fas fa-times me-2"></i>
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="card-body">
                                            <form>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label htmlFor="firstName" className="form-label">First Name</label>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-underline"
                                                                id="firstName"
                                                                name="firstName"
                                                                value={userInfo.firstName}
                                                                onChange={handleInputChange}
                                                                disabled={!isEditing}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label htmlFor="lastName" className="form-label">Last Name</label>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-underline"
                                                                id="lastName"
                                                                name="lastName"
                                                                value={userInfo.lastName}
                                                                onChange={handleInputChange}
                                                                disabled={!isEditing}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label htmlFor="email" className="form-label">Email Address</label>
                                                            <input
                                                                type="email"
                                                                className="form-control form-control-underline"
                                                                id="email"
                                                                name="email"
                                                                value={userInfo.email}
                                                                onChange={handleInputChange}
                                                                disabled={!isEditing}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label htmlFor="phone" className="form-label">Phone Number</label>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-underline"
                                                                id="phone"
                                                                name="phone"
                                                                value={userInfo.phone}
                                                                onChange={handleInputChange}
                                                                disabled={!isEditing}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <label htmlFor="address" className="form-label">Address</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-underline"
                                                        id="address"
                                                        name="address"
                                                        value={userInfo.address}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        placeholder="Street address"
                                                    />
                                                </div>

                                                
                                            </form>
                                        </div>
                                    </div>

                                    {/* Account Settings Section */}
                                    <div className="profile-card mt-4">
                                        <div className="card-header">
                                            <h5 className="card-title">Account Settings</h5>
                                        </div>                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-12 col-sm-6 col-md-6">
                                                    <button 
                                                        className="odoo-btn odoo-btn-outline-primary w-100 mb-3 btn-mobile-full"
                                                        onClick={handleChangePassword}
                                                        disabled={loading}
                                                    >
                                                        <i className="fas fa-key me-2"></i>
                                                        Change Password
                                                    </button>
                                                </div>
                                                <div className="col-12 col-sm-6 col-md-6">
                                                    <button 
                                                        className="odoo-btn odoo-btn-outline-info w-100 mb-3 btn-mobile-full"
                                                        // onClick={handleDownloadData}
                                                        disabled={loading}
                                                    >
                                                        <i className="fas fa-download me-2"></i>
                                                        {loading ? "Downloading..." : "Download My Data"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            
            {/* Change Password Modal */}
            <Modal 
                show={showPasswordModal} 
                onHide={handleClosePasswordModal}
                backdrop="static"
                keyboard={false}
                centered
                className="change-password-modal"
            >
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="text-center w-100 h5 fw-bold text-dark">
                        <i className="fas fa-key me-2 text-danger"></i>
                        Change Password
                    </Modal.Title>
                </Modal.Header>
                
                <Form onSubmit={handlePasswordSubmit}>
                    <Modal.Body>
                        {passwordError && (
                            <Alert variant="danger" className="alert alert-danger">
                                <i className="bi bi-exclamation-triangle me-2" />
                                {passwordError}
                            </Alert>
                        )}
                        
                        {passwordSuccess && (
                            <Alert variant="success" className="alert alert-success">
                                <i className="bi bi-check-circle me-2" />
                                {passwordSuccess}
                            </Alert>
                        )}

                        <div className="mb-3">
                            <Form.Group>
                                <Form.Label className="form-label">Current Password *</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordInputChange}
                                    placeholder="Enter your current password"
                                    required
                                    disabled={passwordLoading}
                                    className="form-control form-control-underline"
                                />
                            </Form.Group>
                        </div>

                        <div className="mb-3">
                            <Form.Group>
                                <Form.Label className="form-label">New Password *</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordInputChange}
                                    placeholder="Enter new password (min. 8 characters)"
                                    required
                                    disabled={passwordLoading}
                                    className="form-control form-control-underline"
                                    minLength="8"
                                />
                                <Form.Text className="text-muted">
                                    Password must be at least 8 characters long.
                                </Form.Text>
                            </Form.Group>
                        </div>

                        <div className="mb-3">
                            <Form.Group>
                                <Form.Label className="form-label">Confirm New Password *</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordInputChange}
                                    placeholder="Confirm your new password"
                                    required
                                    disabled={passwordLoading}
                                    className="form-control form-control-underline"
                                />
                            </Form.Group>
                        </div>
                    </Modal.Body>
                    
                    <Modal.Footer className="border-0 pt-0">
                        <Button 
                            variant="secondary" 
                            onClick={handleClosePasswordModal}
                            disabled={passwordLoading}
                            className="odoo-btn odoo-btn-secondary"
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Cancel
                        </Button>
                        <Button 
                            variant="primary" 
                            type="submit"
                            disabled={passwordLoading}
                            className="odoo-btn odoo-btn-danger"
                        >
                            {passwordLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                    Changing Password...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-key me-2"></i>
                                    Change Password
                                </>
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Layout>
    );
}

export default Profile;
