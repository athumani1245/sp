import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import Layout from "../components/Layout";
import { getTenantById, updateTenant, deleteTenant, getTenantLeases } from "../services/tenantService";
import "../assets/styles/property-details.css";

function Tenant() {
    const { tenantId } = useParams();
    const navigate = useNavigate();
    
    const [tenant, setTenant] = useState(null);
    const [leases, setLeases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leasesLoading, setLeasesLoading] = useState(false);
    const [error, setError] = useState("");
    const [leasesError, setLeasesError] = useState("");
    const [success, setSuccess] = useState("");
    
    // Edit functionality states
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        id_number: "",
        status: ""
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    
    // Delete confirmation modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingTenant, setDeletingTenant] = useState(false);

    // Fetch tenant details
    const fetchTenant = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const result = await getTenantById(tenantId);
            
            if (result.success) {
                setTenant(result.data);
                
                // Populate edit data
                setEditData({
                    first_name: result.data.first_name || "",
                    last_name: result.data.last_name || "",
                    email: result.data.email || "",
                    phone: result.data.phone || result.data.tenant_phone || "",
                    id_number: result.data.id_number || result.data.tenant_id_number || "",
                    status: result.data.status || "active"
                });
            } else {
                setError(result.error || "Failed to fetch tenant details");
            }
        } catch (error) {
            setError("Failed to fetch tenant details");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    // Fetch tenant's leases
    const fetchTenantLeases = useCallback(async () => {
        try {
            setLeasesLoading(true);
            setLeasesError("");
            const result = await getTenantLeases(tenantId, { limit: 10 });
            
            if (result.success) {
                setLeases(result.data || []);
            } else {
                setLeasesError(result.error || "Failed to fetch tenant leases");
                setLeases([]);
            }
        } catch (error) {
            setLeasesError("Failed to fetch tenant leases");
            setLeases([]);
        } finally {
            setLeasesLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) {
            fetchTenant();
            fetchTenantLeases();
        }
    }, [tenantId, fetchTenant, fetchTenantLeases]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle tenant update
    const handleSave = async () => {
        setUpdateLoading(true);
        setError("");
        setSuccess("");
        
        try {
            const result = await updateTenant(tenantId, editData);
            if (result.success) {
                setSuccess(result.message || "Tenant updated successfully!");
                setIsEditing(false);
                await fetchTenant();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError("Failed to update tenant");
        } finally {
            setUpdateLoading(false);
        }
    };

    // Handle cancel edit
    const handleCancel = () => {
        setIsEditing(false);
        // Reset edit data to original values
        if (tenant) {
            setEditData({
                first_name: tenant.first_name || "",
                last_name: tenant.last_name || "",
                email: tenant.email || "",
                phone: tenant.phone || tenant.tenant_phone || "",
                id_number: tenant.id_number || tenant.tenant_id_number || "",
                status: tenant.status || "active"
            });
        }
        setError("");
        setSuccess("");
    };

    // Handle delete tenant
    const handleDeleteTenant = () => {
        setShowDeleteModal(true);
    };

    const confirmDeleteTenant = async () => {
        setDeletingTenant(true);
        try {
            const result = await deleteTenant(tenantId);
            if (result.success) {
                navigate('/dashboard/tenants');
            } else {
                setError(result.error || 'Failed to delete tenant');
                setShowDeleteModal(false);
            }
        } catch (error) {
            console.error('Error deleting tenant:', error);
            setError('Failed to delete tenant');
            setShowDeleteModal(false);
        } finally {
            setDeletingTenant(false);
        }
    };

    const cancelDeleteTenant = () => {
        setShowDeleteModal(false);
    };

    // Helper functions
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return 'TSh 0';
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return 'TSh 0';
        return `TSh ${numAmount.toLocaleString()}`;
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            'active': 'badge bg-success',
            'inactive': 'badge bg-secondary',
            'pending': 'badge bg-warning text-dark',
            'blacklisted': 'badge bg-danger'
        };
        return statusClasses[status?.toLowerCase()] || 'badge bg-secondary';
    };

    const getTenantName = (tenant) => {
        if (!tenant) return 'Unknown Tenant';
        if (tenant.first_name && tenant.last_name) {
            return `${tenant.first_name} ${tenant.last_name}`;
        } else if (tenant.first_name) {
            return tenant.first_name;
        } else if (tenant.last_name) {
            return tenant.last_name;
        } else if (tenant.username) {
            return tenant.username;
        }
        return 'Unknown Tenant';
    };

    if (loading) {
        return (
            <Layout>
                <div className="main-content">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                        <div className="text-center">
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted">Loading tenant details...</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !tenant) {
        return (
            <Layout>
                <div className="main-content">
                    <div className="container-fluid py-4">
                        <div className="alert alert-danger" role="alert">
                            <h4 className="alert-heading">Error!</h4>
                            <p>{error || "Tenant not found"}</p>
                            <Link to="/dashboard/tenants" className="btn btn-outline-danger">
                                <i className="bi bi-arrow-left me-2"></i>
                                Back to Tenants
                            </Link>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="main-content">
                <div className="profile-container">
                    {/* Header with breadcrumb */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <Link to="/dashboard">Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="/dashboard/tenants">Tenants</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        {getTenantName(tenant)}
                                    </li>
                                </ol>
                            </nav>
                            <h1 className="page-title">Tenant Details</h1>
                            <p className="page-subtitle">View and manage tenant information</p>
                        </div>
                        <div className="d-flex gap-2">
                            {!isEditing ? (
                                <>
                                    <button 
                                        className="btn btn-outline-primary"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <i className="bi bi-pencil me-2"></i>
                                        Edit Tenant
                                    </button>
                                    <button 
                                        className="btn btn-outline-danger"
                                        onClick={handleDeleteTenant}
                                    >
                                        <i className="bi bi-trash me-2"></i>
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        className="btn btn-success"
                                        onClick={handleSave}
                                        disabled={updateLoading}
                                    >
                                        {updateLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check me-2"></i>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        className="btn btn-outline-secondary"
                                        onClick={handleCancel}
                                        disabled={updateLoading}
                                    >
                                        <i className="bi bi-x me-2"></i>
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Success/Error Messages */}
                    {success && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            <i className="bi bi-check-circle me-2"></i>
                            {success}
                            <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                            <button type="button" className="btn-close" onClick={() => setError('')}></button>
                        </div>
                    )}

                    <div className="row">
                        {/* Tenant Summary Section */}
                        <div className="col-lg-4 col-md-12">
                            <div className="profile-card mb-4">
                                <div className="profile-image-section">
                                    <div className="profile-image-container">
                                        <div className="profile-image-placeholder">
                                            <i className="bi bi-person-circle" style={{ fontSize: '4rem' }}></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="profile-summary text-center">
                                    <h4 className="user-name">{getTenantName(tenant)}</h4>
                                    <p className="user-email text-muted">{tenant.email || 'No email provided'}</p>
                                    <span className={`${getStatusBadge(tenant.status || 'active')} mb-3`}>
                                        {((tenant.status || 'active').charAt(0).toUpperCase() + (tenant.status || 'active').slice(1))}
                                    </span>
                                </div>
                            </div>

                            {/* Tenant Statistics Card */}
                            <div className="profile-card">
                                <div className="card-header">
                                    <h5 className="card-title">
                                        <i className="bi bi-bar-chart me-2"></i>
                                        Statistics
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <div className="bg-light p-3 rounded">
                                                <div className="d-flex justify-content-between">
                                                    <span>Total Leases</span>
                                                    <strong className="text-primary">{leases.length}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="bg-light p-3 rounded">
                                                <div className="d-flex justify-content-between">
                                                    <span>Active Leases</span>
                                                    <strong className="text-success">{leases.filter(lease => lease.status === 'active').length}</strong>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="bg-light p-3 rounded">
                                                <div className="d-flex justify-content-between">
                                                    <span>Member Since</span>
                                                    <strong>{formatDate(tenant.date_joined || tenant.created_at)}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tenant Information Section */}
                        <div className="col-lg-8 col-md-12">
                            <div className="profile-card mb-4">
                                <div className="card-header">
                                    <h5 className="card-title">
                                        <i className="bi bi-person me-2"></i>
                                        Tenant Information
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                            <label className="form-label">First Name</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="first_name"
                                                    value={editData.first_name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter first name"
                                                />
                                            ) : (
                                                <p className="form-control-plaintext">{tenant.first_name || 'N/A'}</p>
                                            )}
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                            <label className="form-label">Last Name</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="last_name"
                                                    value={editData.last_name}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter last name"
                                                />
                                            ) : (
                                                <p className="form-control-plaintext">{tenant.last_name || 'N/A'}</p>
                                            )}
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                            <label className="form-label">Email</label>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    value={editData.email}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter email address"
                                                />
                                            ) : (
                                                <p className="form-control-plaintext">{tenant.email || 'N/A'}</p>
                                            )}
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                            <label className="form-label">Phone Number</label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    name="phone"
                                                    value={editData.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter phone number"
                                                />
                                            ) : (
                                                <p className="form-control-plaintext">{tenant.phone || tenant.tenant_phone || 'N/A'}</p>
                                            )}
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                            <label className="form-label">ID Number</label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="id_number"
                                                    value={editData.id_number}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter ID number"
                                                />
                                            ) : (
                                                <p className="form-control-plaintext">{tenant.id_number || tenant.tenant_id_number || 'N/A'}</p>
                                            )}
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                            <label className="form-label">Status</label>
                                            {isEditing ? (
                                                <select
                                                    className="form-select"
                                                    name="status"
                                                    value={editData.status}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="blacklisted">Blacklisted</option>
                                                </select>
                                            ) : (
                                                <p className="form-control-plaintext">
                                                    <span className={getStatusBadge(tenant.status || 'active')}>
                                                        {((tenant.status || 'active').charAt(0).toUpperCase() + (tenant.status || 'active').slice(1))}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                            <label className="form-label">Username</label>
                                            <p className="form-control-plaintext">{tenant.username || 'N/A'}</p>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                            <label className="form-label">Date Joined</label>
                                            <p className="form-control-plaintext">{formatDate(tenant.date_joined || tenant.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tenant Leases Section */}
                    <div className="profile-card">
                        <div className="card-header">
                            <h5 className="card-title">
                                <i className="bi bi-file-earmark-text me-2"></i>
                                Lease History
                                {leases.length > 0 && (
                                    <span className="badge bg-primary ms-2">{leases.length}</span>
                                )}
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            {leasesLoading && (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="text-muted mt-2">Loading leases...</p>
                                </div>
                            )}

                            {leasesError && (
                                <div className="alert alert-warning m-3" role="alert">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    {leasesError}
                                </div>
                            )}

                            {!leasesLoading && !leasesError && leases.length === 0 && (
                                <div className="text-center py-4">
                                    <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: "3rem" }}></i>
                                    <h5 className="text-muted mt-3">No Leases Found</h5>
                                    <p className="text-muted">This tenant has no lease history yet.</p>
                                </div>
                            )}

                            {!leasesLoading && leases.length > 0 && (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Property</th>
                                                <th>Unit</th>
                                                <th>Lease Period</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leases.map((lease) => (
                                                <tr key={lease.id}>
                                                    <td>
                                                        <span className="fw-medium">
                                                            {lease.property?.property_name || lease.property_name || 'Unknown Property'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {lease.unit?.unit_name || lease.unit_name || 'Unknown Unit'}
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <span className="d-block">{formatDate(lease.start_date)}</span>
                                                            <small className="text-muted">to {formatDate(lease.end_date)}</small>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {formatCurrency(lease.total_amount || 0)}
                                                    </td>
                                                    <td>
                                                        <span className={getStatusBadge(lease.status || 'unknown')}>
                                                            {((lease.status || 'unknown').charAt(0).toUpperCase() + (lease.status || 'unknown').slice(1))}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <Link
                                                            to={`/dashboard/leases/${lease.id}`}
                                                            className="btn btn-sm btn-outline-primary"
                                                        >
                                                            <i className="bi bi-eye me-1"></i>
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={cancelDeleteTenant} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this tenant?</p>
                    <div className="alert alert-warning">
                        <strong>Tenant:</strong> {getTenantName(tenant)}<br />
                        <strong>Email:</strong> {tenant.email || 'N/A'}<br />
                        <strong>Active Leases:</strong> {leases.filter(lease => lease.status === 'active').length}<br />
                        <small className="text-muted">This action cannot be undone and may affect existing leases.</small>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelDeleteTenant} disabled={deletingTenant}>
                        Cancel
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={confirmDeleteTenant} 
                        disabled={deletingTenant}
                    >
                        {deletingTenant ? 'Deleting...' : 'Delete Tenant'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Layout>
    );
}

export default Tenant;
