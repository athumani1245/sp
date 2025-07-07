import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/profile.css";
import Header from "../components/layout/Header";
import Sidenav from "../components/layout/Sidenav";
import { 
    getUserProfile, 
    updateUserProfile, 
 
} from "../services/profileService";

function Profile() {
    const [userInfo, setUserInfo] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        profileImage: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        // Load user profile data (this would typically come from an API)
        loadUserProfile();
    }, [navigate]);    const loadUserProfile = async () => {
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
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };    const handleSave = async () => {
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

    // const handleDownloadData = async () => {
    //     setLoading(true);
    //     setError("");
    //     setSuccess("");
        
    //     try {
    //         const result = await downloadUserData();
    //         if (result.success) {
    //             setSuccess(result.message || "Data downloaded successfully!");
    //         } else {
    //             setError(result.error);
    //             if (result.error.includes("Session expired")) {
    //                 navigate("/");
    //             }
    //         }
    //     } catch (err) {
    //         console.error("Download data error:", err);
    //         setError("Failed to download user data");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const handleDeleteAccount = async () => {
    //     const password = prompt("Please enter your password to confirm account deletion:");
    //     if (!password) return;

    //     if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
    //         setLoading(true);
    //         setError("");
    //         setSuccess("");
            
    //         try {
    //             const result = await deleteAccount(password);
    //             if (result.success) {
    //                 alert("Account deleted successfully. You will be redirected to the login page.");
    //                 localStorage.clear();
    //                 navigate("/");
    //             } else {
    //                 setError(result.error);
    //             }
    //         } catch (err) {
    //             console.error("Delete account error:", err);
    //             setError("Failed to delete account");
    //         } finally {
    //             setLoading(false);
    //         }
    //     }
    // };

    const handleChangePassword = () => {
        // This could open a modal or navigate to a change password page
        alert("Change password functionality would be implemented here. This could open a modal or navigate to a dedicated page.");
    };

    const handleNotificationSettings = () => {
        // This could open a modal or navigate to notification settings page
        alert("Notification settings functionality would be implemented here. This could open a modal or navigate to a dedicated page.");
    };

    return (
        <>
            <Header />
            <div className="container-fluid">
                <div className="row">
                    <Sidenav />
                    <main className="col-md-10 main-content">
                        <div className="profile-container">
                            <div className="profile-header">
                                <h2 className="page-title">My Profile</h2>
                                <p className="page-subtitle">Manage your personal information and account settings</p>
                            </div>

                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <div className="row">
                                {/* Profile Picture Section */}
                                <div className="col-md-4">
                                    <div className="profile-card">
                                        <div className="profile-image-section">
                                            <div className="profile-image-container">
                                                {userInfo.profileImage ? (
                                                    <img src={userInfo.profileImage} alt="Profile" className="profile-image" />
                                                ) : (
                                                    <div className="profile-image-placeholder">
                                                        <i className="fas fa-user"></i>
                                                    </div>
                                                )}
                                            </div>
                                            {isEditing && (
                                                <div className="mt-3">
                                                    <input
                                                        type="file"
                                                        id="profileImage"
                                                        accept="image/*"
                                                        // onChange={handleImageUpload}
                                                        className="d-none"
                                                    />
                                                    <label htmlFor="profileImage" className="btn btn-outline-primary btn-sm">
                                                        <i className="fas fa-camera me-2"></i>
                                                        Change Photo
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                        <div className="profile-summary">
                                            <h4 className="user-name">{userInfo.firstName} {userInfo.lastName}</h4>
                                            <p className="user-email">{userInfo.address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Information Section */}
                                <div className="col-md-8">
                                    <div className="profile-card">
                                        <div className="card-header">
                                            <h5 className="card-title">Personal Information</h5>
                                            {!isEditing ? (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => setIsEditing(true)}
                                                >
                                                    <i className="fas fa-edit me-2"></i>
                                                    Edit Profile
                                                </button>
                                            ) : (
                                                <div>
                                                    <button
                                                        className="btn btn-success btn-sm me-2"
                                                        onClick={handleSave}
                                                        disabled={loading}
                                                    >
                                                        <i className="fas fa-save me-2"></i>
                                                        {loading ? "Saving..." : "Save"}
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary btn-sm"
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
                                                                className="form-control"
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
                                                                className="form-control"
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
                                                                className="form-control"
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
                                                                className="form-control"
                                                                id="phone"
                                                                name="phone"
                                                                value={userInfo.username}
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
                                                        className="form-control"
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
                                                <div className="col-md-6">
                                                    <button 
                                                        className="btn btn-outline-primary w-100 mb-3"
                                                        onClick={handleChangePassword}
                                                        disabled={loading}
                                                    >
                                                        <i className="fas fa-key me-2"></i>
                                                        Change Password
                                                    </button>
                                                </div>
                                                <div className="col-md-6">
                                                    <button 
                                                        className="btn btn-outline-secondary w-100 mb-3"
                                                        onClick={handleNotificationSettings}
                                                        disabled={loading}
                                                    >
                                                        <i className="fas fa-bell me-2"></i>
                                                        Notification Settings
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <button 
                                                        className="btn btn-outline-info w-100 mb-3"
                                                        // onClick={handleDownloadData}
                                                        disabled={loading}
                                                    >
                                                        <i className="fas fa-download me-2"></i>
                                                        {loading ? "Downloading..." : "Download My Data"}
                                                    </button>
                                                </div>
                                                <div className="col-md-6">
                                                    <button 
                                                        className="btn btn-outline-danger w-100 mb-3"
                                                        // onClick={handleDeleteAccount}
                                                        disabled={loading}
                                                    >
                                                        <i className="fas fa-trash me-2"></i>
                                                        Delete Account
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

export default Profile;
