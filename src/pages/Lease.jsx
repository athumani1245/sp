import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button, Alert, Modal } from "react-bootstrap";
import Layout from "../components/Layout";
import Payments from "../components/snippets/Payments";
import { getLeaseById, getLeaseDocuments, terminateLease, cancelLease } from "../services/leaseService";
import "../assets/styles/leases.css";

function Lease() {
  const { leaseId } = useParams();
  const navigate = useNavigate();
  
  const [lease, setLease] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showTerminateConfirmation, setShowTerminateConfirmation] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const [terminationData, setTerminationData] = useState({
    termination_date: new Date().toISOString().split('T')[0],
    reason: ""
  });

  const fetchLeaseDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      // Call the actual lease service
      const result = await getLeaseById(leaseId);
      
      if (result.success) {
        setLease(result.data);
      } else {
        setError(result.error || "Failed to fetch lease details");
      }
      
    } catch (error) {
      setError("Failed to fetch lease details");
    } finally {
      setLoading(false);
    }
  }, [leaseId]);

  useEffect(() => {
    if (leaseId) {
      fetchLeaseDetails();
    }
  }, [leaseId, fetchLeaseDetails]);

  const handleCancelClick = () => {
    setShowCancelConfirmation(true);
  };

  const handleTerminateClick = () => {
    setShowTerminateConfirmation(true);
  };

  const handleCancelConfirm = async () => {
    setIsCancelling(true);
    try {
      const result = await cancelLease(leaseId);
      
      if (result.success) {
        setError(""); // Clear any existing errors
        // Refresh lease data to show updated status
        await fetchLeaseDetails();
      } else {
        setError(result.error || 'Failed to cancel lease');
      }
    } catch (error) {
      console.error('Error cancelling lease:', error);
      setError('Failed to cancel lease');
    } finally {
      setIsCancelling(false);
      setShowCancelConfirmation(false);
    }
  };

  const handleTerminateConfirm = async () => {
    if (!terminationData.reason.trim()) {
      setError("Please provide a reason for termination");
      return;
    }

    setIsTerminating(true);
    try {
      const result = await terminateLease(leaseId, terminationData);
      
      if (result.success) {
        setError(""); // Clear any existing errors
        // Refresh lease data to show updated status
        await fetchLeaseDetails();
      } else {
        setError(result.error || 'Failed to terminate lease');
      }
    } catch (error) {
      console.error('Error terminating lease:', error);
      setError('Failed to terminate lease');
    } finally {
      setIsTerminating(false);
      setShowTerminateConfirmation(false);
    }
  };

  const handleTerminationDataChange = (e) => {
    const { name, value } = e.target;
    setTerminationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelModalClose = () => {
    setShowCancelConfirmation(false);
  };

  const handleTerminateModalClose = () => {
    setShowTerminateConfirmation(false);
  };

  // Payments are now loaded as part of lease data

  const fetchDocuments = async () => {
    try {
      // Call the actual documents service
      const result = await getLeaseDocuments(leaseId);
      
      if (result.success) {
        setDocuments(result.data || []);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      setDocuments([]);
    }
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    
    if (tab === "documents" && documents.length === 0) {
      fetchDocuments();
    }
  };

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

  const getRentAmount = (lease) => {
    // Handle different possible field names for rent amount
    return lease.rent_amount_per_unit || lease.monthly_rent || lease.rent_amount || 0;
  };

  const getPropertyName = (lease) => {
    // Handle different possible field names for property information
    if (lease.property_name) {
      return lease.property_name;
    } else if (lease.property && lease.property.property_name) {
      return lease.property.property_name;
    }
    return 'Unknown Property';
  };

  const getUnitInfo = (lease) => {
    // Handle different possible field names for unit information
    if (lease.unit_number) {
      return lease.unit_number;
    } else if (lease.unit_name) {
      return lease.unit_name;
    } else if (lease.unit && lease.unit.unit_name) {
      return lease.unit.unit_name;
    } else if (lease.unit && lease.unit.unit_number) {
      return lease.unit.unit_number;
    }
    return 'Unknown Unit';
  };

  const getUnitType = (lease) => {
    // Handle different possible field names for unit type
    if (lease.unit_type) {
      return lease.unit_type;
    } else if (lease.unit && lease.unit.unit_type) {
      return lease.unit.unit_type;
    }
    return 'N/A';
  };

  const getTenantEmail = (lease) => {
    // Handle different possible field names for tenant email
    return lease.tenant_email || (lease.tenant && lease.tenant.email) || 'N/A';
  };

  const getTenantPhone = (lease) => {
    // Handle different possible field names for tenant phone
    return lease.tenant_phone || (lease.tenant && lease.tenant.phone) || 'N/A';
  };

  const getTenantIdNumber = (lease) => {
    // Handle different possible field names for tenant ID
    return lease.tenant_id_number || (lease.tenant && lease.tenant.id_number) || 'N/A';
  };

  const getPropertyAddress = (lease) => {
    // format the address properly
    if (lease.property && lease.property.address) {
      return `${lease.property.address.street || ''}, ${lease.property.address.region_name || ''} ${lease.property.address.district_name || ''}, ${lease.property.address.ward_name || ''}`;
    }
    return 'N/A';
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: "bg-success",
      expired: "bg-danger",
      terminated: "bg-warning",
      cancelled: "bg-dark",
      pending: "bg-secondary",
      renewed: "bg-info"
    };
    return `badge ${statusClasses[status] || "bg-secondary"}`;
  };

  const calculateDaysRemaining = (endDate) => {
    if (!endDate) return 'N/A';
    try {
      const end = new Date(endDate);
      const now = new Date();
      const diffTime = end - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'Expired';
      if (diffDays === 0) return 'Expires today';
      if (diffDays === 1) return '1 day remaining';
      return `${diffDays} days remaining`;
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="main-content">
          <div className="leases-filters-section">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading lease details...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="main-content">
          <div className="leases-filters-section">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Error</h4>
              <p>{error}</p>
              <hr />
              <button 
                className="btn btn-outline-danger"
                onClick={() => navigate("/leases")}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Leases
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!lease) {
    return (
      <Layout>
        <div className="main-content">
          <div className="leases-filters-section">
            <div className="alert alert-warning" role="alert">
              <h4 className="alert-heading">Lease Not Found</h4>
              <p>The requested lease could not be found.</p>
              <hr />
              <button 
                className="btn btn-outline-warning"
                onClick={() => navigate("/leases")}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Leases
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="main-content">
        {/* Header */}
        <div className="leases-filters-section">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-2">
                  <li className="breadcrumb-item">
                    <Link to="/leases">Leases Management</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Details
                  </li>
                </ol>
              </nav>
              {/* <h4 className="mb-1">
                <i className="bi bi-file-earmark-text me-2"></i>
                {lease.lease_number}
              </h4> */}
              <small className="text-muted">
                Reference: {lease.lease_number} | Status: {lease.status}
              </small>
            </div>
            <div className="col-md-4">
              <div className="d-flex flex-column flex-md-row gap-2">
                <button
                  className="btn btn-outline-secondary flex-fill"
                  onClick={() => navigate("/leases")}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  <span className="d-none d-md-inline">Back to </span>Leases
                </button>
                {/* Only show Cancel button if lease is not already cancelled, terminated, or expired */}
                {lease.status !== 'cancelled' && lease.status !== 'terminated' && lease.status !== 'expired' && (
                  <button
                    className="btn btn-danger flex-fill"
                    onClick={handleCancelClick}
                    disabled={isCancelling}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    {isCancelling ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
                {/* Only show Terminate Lease button if lease is active */}
                {lease.status === 'active' && (
                  <button
                    className="btn btn-warning flex-fill"
                    onClick={handleTerminateClick}
                    disabled={isTerminating}
                  >
                    <i className="bi bi-x-octagon me-1"></i>
                    {isTerminating ? 'Terminating...' : 'Terminate Lease'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        <Modal show={showCancelConfirmation} onHide={handleCancelModalClose} backdrop="static">
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
              Cancel Lease
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center py-3">
              <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 mb-3">Are you sure you want to cancel this lease?</h5>
              <p className="text-muted mb-4">
                This action will immediately cancel the lease. This cannot be undone.
              </p>
              
              <div className="mt-3 p-3 bg-light rounded">
                <strong>Lease Details:</strong>
                <ul className="mt-2 mb-0 text-start">
                  <li>Tenant: {lease.tenant.first_name} {lease.tenant.last_name}</li>
                  <li>Property: {lease.property.property_name}</li>
                  <li>Unit: {getUnitInfo(lease)}</li>
                  <li>Duration: {lease.number_of_month} months</li>
                </ul>
              </div>
            </div>

            {error && (
              <Alert variant="danger" className="mt-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCancelModalClose}>
              <i className="bi bi-x-circle me-2"></i>
              No, Keep Lease
            </Button>
            <Button 
              variant="danger" 
              onClick={handleCancelConfirm} 
              disabled={isCancelling}
            >
              <i className="bi bi-check-circle me-2"></i>
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel Lease'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Terminate Confirmation Modal */}
        <Modal show={showTerminateConfirmation} onHide={handleTerminateModalClose} backdrop="static">
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
              Terminate Lease
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Please provide the following information to terminate the lease.</p>
            
            <div className="mt-3 p-3 bg-light rounded mb-4">
              <strong>Lease Details:</strong>
              <ul className="mt-2 mb-0">
                <li>Tenant: {lease.tenant.first_name} {lease.tenant.last_name}</li>
                <li>Property: {lease.property.property_name}</li>
                <li>Unit: {getUnitInfo(lease)}</li>
                <li>Duration: {lease.number_of_month} months</li>
              </ul>
            </div>

            <form>
              <div className="mb-3">
                <label className="form-label">Termination Date *</label>
                <input
                  type="date"
                  className="form-control"
                  name="termination_date"
                  value={terminationData.termination_date}
                  onChange={handleTerminationDataChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">Reason for Termination *</label>
                <textarea
                  className="form-control"
                  name="reason"
                  value={terminationData.reason}
                  onChange={handleTerminationDataChange}
                  rows="3"
                  placeholder="Please provide a reason for terminating the lease..."
                  required
                />
              </div>
            </form>

            {error && (
              <Alert variant="danger" className="mt-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleTerminateModalClose}>
              <i className="bi bi-x-circle me-2"></i>
              Close
            </Button>
            <Button 
              variant="warning" 
              onClick={handleTerminateConfirm} 
              disabled={isTerminating || !terminationData.reason.trim()}
            >
              <i className="bi bi-x-octagon me-2"></i>
              {isTerminating ? 'Terminating...' : 'Confirm Termination'}
            </Button>
          </Modal.Footer>
        </Modal>

       

        {/* Main Content Tabs */}
        <div className="leases-filters-section">
          <div className="lease-tabs-container">
            <button
              className={`lease-tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => handleTabSelect('details')}
            >
              <i className="bi bi-info-circle me-1"></i>
              <span className="d-none d-md-inline">Details</span>
              <span className="d-md-none">Info</span>
            </button>
            <button
              className={`lease-tab ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => handleTabSelect('payments')}
            >
              <i className="bi bi-credit-card me-1"></i>
              <span className="d-none d-md-inline">Payments</span>
              <span className="d-md-none">Payments</span>
            </button>
          </div>
        </div>

        <div className="leases-filters-section">
            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="lease-form-compact">
                {/* General Information Fields */}
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="compact-form-row">
                      <label className="compact-inline-label">Tenant:</label>
                      <input 
                        type="text" 
                        className="underline-input" 
                        value={`${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`}
                        readOnly 
                      />
                    </div>
                    <div className="compact-form-row">
                      <label className="compact-inline-label">Property Name:</label>
                      <input 
                        type="text" 
                        className="underline-input" 
                        value={lease.property.property_name || ''} 
                        readOnly 
                      />
                    </div>
                    <div className="compact-form-row">
                      <label className="compact-inline-label">Unit Number:</label>
                      <input 
                        type="text" 
                        className="underline-input" 
                        value={getUnitInfo(lease)} 
                        readOnly 
                      />
                    </div>
                    <div className="compact-form-row">
                      <label className="compact-inline-label">Start Date:</label>
                      <input 
                        type="text" 
                        className="underline-input" 
                        value={lease.start_date} 
                        readOnly 
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="compact-form-row">
                      <label className="compact-inline-label">Phone Number:</label>
                      <input 
                        type="text" 
                        className="underline-input" 
                        value={(lease.tenant.username || '')} 
                        readOnly 
                      />
                    </div>
                    <div className="compact-form-row">
                      <label className="compact-inline-label">Property Location:</label>
                      <input 
                        type="text" 
                        className="underline-input" 
                        value={getPropertyAddress(lease) || 'N/A'} 
                        readOnly 
                      />
                    </div>
                    <div className="compact-form-row">
                      <label className="compact-inline-label">End Date:</label>
                      <input 
                        type="text" 
                        className="underline-input" 
                        value={lease.end_date} 
                        readOnly 
                      />
                    </div>
                    <div className="compact-form-row">
                      <label className="compact-inline-label">Lease Duration:</label>
                      <input 
                        type="text" 
                        className="underline-input" 
                        value={`${lease.number_of_month || 'N/A'} months`} 
                        readOnly 
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Summary - Bottom Right */}
                <div className="row mt-4">
                  <div className="col-md-8">
                    {/* Empty space for other content if needed */}
                  </div>
                  <div className="col-md-4">
                    <div className="bg-light p-3 rounded">
                      <h6 className="mb-3">
                        <i className="bi bi-calculator me-2"></i>
                        Payments Summary
                      </h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Amount:</span>
                        <span className="fw-bold">{formatCurrency(lease.total_amount)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Paid Amount:</span>
                        <span className="fw-bold text-success">{formatCurrency(lease.amount_paid || 0)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Discount:</span>
                        <span className="fw-bold text-info">{formatCurrency(lease.discount || 0)}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Amount Due:</span>
                        <span className="fw-bold text-danger">{formatCurrency(lease.remaining_amount || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <div className="payments-tab-content">
                <Payments 
                  payments={lease.payments || []}
                  leaseId={leaseId}
                  refreshData={fetchLeaseDetails}
                />
              </div>
            )}
        </div>
      </div>
    </Layout>
  );
}

export default Lease;
