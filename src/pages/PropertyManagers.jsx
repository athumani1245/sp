import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Layout from '../components/Layout';
import AddPropertyManagerModal from '../components/forms/AddPropertyManager';
import { getAllPropertyManagers, deletePropertyManager } from '../services/propertyService';
import { useSubscription } from '../hooks/useSubscription';
import '../assets/styles/tenants.css';
import '../assets/styles/leases.css';

const PropertyManagers = () => {
    const { hasActiveSubscription } = useSubscription();
    const [managers, setManagers] = useState([]);
    const [filteredManagers, setFilteredManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedManager, setSelectedManager] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [managerToDelete, setManagerToDelete] = useState(null);
    const [deletingManager, setDeletingManager] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const loadManagers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const result = await getAllPropertyManagers();
            if (result.success) {
                setManagers(result.data);
                setFilteredManagers(result.data);
            } else {
                setError(result.error || 'Failed to load property managers');
            }
        } catch (err) {
            setError('An error occurred while loading property managers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadManagers();
    }, [loadManagers]);

    const handleAddManager = () => {
        setSelectedManager(null);
        setShowAddModal(true);
        setError('');
        setSuccess('');
    };

    const handleEditManager = (manager) => {
        setSelectedManager(manager);
        setShowAddModal(true);
        setError('');
        setSuccess('');
    };

    const handleDeleteManager = (e, manager) => {
        e.stopPropagation();
        setManagerToDelete(manager);
        setShowDeleteModal(true);
    };

    const confirmDeleteManager = async () => {
        if (!managerToDelete) return;

        setDeletingManager(true);
        setError('');
        try {
            const result = await deletePropertyManager(managerToDelete.id);
            if (result.success) {
                setSuccess('Property manager deleted successfully');
                loadManagers();
                setShowDeleteModal(false);
                setManagerToDelete(null);
            } else {
                setError(result.error || 'Failed to delete property manager');
            }
        } catch (err) {
            setError('An error occurred while deleting property manager');
        } finally {
            setDeletingManager(false);
        }
    };

    const formatPhone = (phone) => {
        if (!phone) return 'No phone';
        return phone;
    };

    const getManagerName = (manager) => {
        if (manager.first_name && manager.last_name) {
            return `${manager.first_name} ${manager.last_name}`;
        }
        return manager.username || 'Unknown Manager';
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        filterManagers(value, status);
    };

    const handleStatusFilter = (e) => {
        const value = e.target.value;
        setStatus(value);
        filterManagers(search, value);
    };

    const filterManagers = (searchTerm, statusFilter) => {
        let filtered = [...managers];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(manager => {
                const name = getManagerName(manager).toLowerCase();
                const phone = (manager.username || '').toLowerCase();
                const searchLower = searchTerm.toLowerCase();
                return name.includes(searchLower) || phone.includes(searchLower);
            });
        }

        // Apply status filter
        if (statusFilter) {
            filtered = filtered.filter(manager => {
                if (statusFilter === 'active') return manager.is_active !== false;
                if (statusFilter === 'inactive') return manager.is_active === false;
                return true;
            });
        }

        setFilteredManagers(filtered);
    };

    // Re-filter when managers data changes
    useEffect(() => {
        filterManagers(search, status);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [managers, search, status]);

    const handleModalClose = () => {
        setShowAddModal(false);
        setSelectedManager(null);
        setError('');
        setSuccess('');
    };

    const handleManagerAdded = () => {
        setSuccess(selectedManager ? 'Property manager updated successfully' : 'Property manager registered successfully');
        loadManagers();
        handleModalClose();
    };

    return (
        <Layout>
            <div className="main-content">
                {/* Header Section */}
                <div className="leases-header">
                    <div className="header-left">
                        <h1 className="leases-title">
                            <i className="bi bi-people-fill"></i>
                            Property Managers
                        </h1>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="tenants-filters-section">
                    <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center">
                        <div className="flex-fill">
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by name or phone number..."
                                    value={search}
                                    onChange={handleSearch}
                                />
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <select
                                className="form-select"
                                value={status}
                                onChange={handleStatusFilter}
                                style={{ minWidth: '150px' }}
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                className="odoo-btn odoo-btn-primary"
                                onClick={handleAddManager}
                                disabled={loading || !hasActiveSubscription}
                                style={{ minWidth: '180px' }}
                                title={!hasActiveSubscription ? 'Subscription expired. Please renew to add property managers.' : ''}
                            >
                                <i className="bi bi-person-plus me-2"></i>
                                Add Property Manager
                            </button>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError('')}></button>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        <i className="bi bi-check-circle me-2"></i>
                        {success}
                        <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                    </div>
                )}

                {/* Loading State */}
                {loading && managers.length === 0 && (
                    <div className="empty-state">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading property managers...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && managers.length === 0 && (
                    <div className="empty-state">
                        <i className="bi bi-people display-1 text-muted"></i>
                        <h4 className="mt-3">No Property Managers Yet</h4>
                        <p className="text-muted">Get started by adding your first property manager</p>
                        
                    </div>
                )}

                {/* Table View */}
                {!loading && managers.length > 0 && (
                    <>
                        {/* Header with count */}
                        <div className="tenants-header-section mb-3">
                            <h5 className="tenants-title">
                                <i className="bi bi-people me-2"></i>
                                Property Managers
                                {filteredManagers.length > 0 && (
                                    <span className="badge bg-primary ms-2">{filteredManagers.length}</span>
                                )}
                            </h5>
                        </div>

                        {/* No results message */}
                        {filteredManagers.length === 0 && (
                            <div className="empty-state">
                                <i className="bi bi-search display-4 text-muted"></i>
                                <h5 className="mt-3">No managers found</h5>
                                <p className="text-muted">Try adjusting your search or filters</p>
                            </div>
                        )}

                        {/* Desktop Table */}
                        {filteredManagers.length > 0 && (
                            <div className="table-responsive d-none d-md-block">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th style={{ width: '35%' }}>Manager Name</th>
                                    <th style={{ width: '30%' }}>Phone Number</th>
                                    <th style={{ width: '20%' }}>Status</th>
                                    <th style={{ width: '15%' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredManagers.map((manager) => (
                                    <tr key={manager.id || Math.random()}>
                                        <td>
                                            <span className="tenant-name fw-medium">
                                                {getManagerName(manager)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-muted">
                                                {formatPhone(manager.username)}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${manager.is_active !== false ? 'bg-success' : 'bg-secondary'}`}>
                                                {manager.is_active !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="odoo-btn odoo-btn-outline-primary odoo-btn-sm me-1"
                                                    onClick={(e) => handleEditManager(manager)}
                                                    title="Edit Manager"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button
                                                    className="odoo-btn odoo-btn-outline-primary odoo-btn-sm"
                                                    onClick={(e) => handleDeleteManager(e, manager)}
                                                    title="Delete Manager"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Mobile Card View */}
                {filteredManagers.length > 0 && (
                    <div className="d-md-none">
                        <div className="tenant-list-container">
                            {filteredManagers.map((manager) => (
                                <div key={manager.id || Math.random()} className="tenant-card">
                                    <div className="tenant-card-body">
                                        <div className="tenant-card-info">
                                            <h5 className="tenant-card-name">{getManagerName(manager)}</h5>
                                            <div className="tenant-card-details">
                                                <span className="detail-item">
                                                    <i className="bi bi-telephone"></i>
                                                    {formatPhone(manager.username)}
                                                </span>
                                                <span className={`badge ${manager.is_active !== false ? 'bg-success' : 'bg-secondary'}`}>
                                                    {manager.is_active !== false ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="tenant-card-actions">
                                            <button
                                                className="odoo-btn odoo-btn-outline-primary odoo-btn-sm"
                                                onClick={(e) => handleEditManager(manager)}
                                                title="Edit Manager"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="odoo-btn odoo-btn-outline-primary odoo-btn-sm"
                                                onClick={(e) => handleDeleteManager(e, manager)}
                                                title="Delete Manager"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                </>
            )}

            {/* Add/Edit Modal */}
                {showAddModal && (
                    <AddPropertyManagerModal
                        isOpen={showAddModal}
                        onClose={handleModalClose}
                        onManagerAdded={handleManagerAdded}
                        manager={selectedManager}
                    />
                )}

                {/* Delete Confirmation Modal */}
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Delete</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to delete <strong>{managerToDelete?.first_name} {managerToDelete?.last_name}</strong>?
                        <br />
                        This action cannot be undone.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowDeleteModal(false)}
                            disabled={deletingManager}
                            className="odoo-btn odoo-btn-secondary"
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="danger" 
                            onClick={confirmDeleteManager}
                            disabled={deletingManager}
                            className="odoo-btn odoo-btn-danger"
                        >
                            {deletingManager ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </Layout>
    );
};

export default PropertyManagers;
