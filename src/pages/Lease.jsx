import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge, Tab, Tabs, Alert, Spinner } from "react-bootstrap";
import Layout from "../components/Layout";
import { getLeaseById, getLeasePayments, getLeaseDocuments, terminateLease, renewLease } from "../services/leaseService";
import "../assets/styles/profile.css";
import "../assets/styles/leases.css";
import "../assets/styles/lease-details.css";

function Lease() {
  const { leaseId } = useParams();
  const navigate = useNavigate();
  
  const [lease, setLease] = useState(null);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (leaseId) {
      fetchLeaseDetails();
    }
  }, [leaseId]);

  const fetchLeaseDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log('Fetching lease details for ID:', leaseId);
      
      // Call the actual lease service
      const result = await getLeaseById(leaseId);
      
      console.log('Lease details result:', result);
      
      if (result.success) {
        setLease(result.data);
      } else {
        setError(result.error || "Failed to fetch lease details");
      }
      
    } catch (error) {
      console.error("Error fetching lease details:", error);
      setError("Failed to fetch lease details");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      
      console.log('Fetching payments for lease ID:', leaseId);
      
      // Call the actual payments service
      const result = await getLeasePayments(leaseId);
      
      if (result.success) {
        setPayments(result.data || []);
      } else {
        console.error("Failed to fetch payments:", result.error);
        setPayments([]);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      
      console.log('Fetching documents for lease ID:', leaseId);
      
      // Call the actual documents service
      const result = await getLeaseDocuments(leaseId);
      
      if (result.success) {
        setDocuments(result.data || []);
      } else {
        console.error("Failed to fetch documents:", result.error);
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    
    if (tab === "payments" && payments.length === 0) {
      fetchPayments();
    } else if (tab === "documents" && documents.length === 0) {
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
        <Container className="py-4">
          <div className="text-center">
            <Spinner animation="border" role="status" variant="primary">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading lease details...</p>
          </div>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container className="py-4">
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={() => navigate("/dashboard/leases")}>
              Back to Leases
            </Button>
          </Alert>
        </Container>
      </Layout>
    );
  }

  if (!lease) {
    return (
      <Layout>
        <Container className="py-4">
          <Alert variant="warning">
            <Alert.Heading>Lease Not Found</Alert.Heading>
            <p>The requested lease could not be found.</p>
            <Button variant="outline-warning" onClick={() => navigate("/dashboard/leases")}>
              Back to Leases
            </Button>
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container fluid className="py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link to="/dashboard/leases">Leases Management</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                            Lease Details
                        </li>
                    </ol>
                </nav>
                <h2>
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Lease Agreement
                </h2>
                <small className="text-muted mb-0">
                    Reference: {lease.lease_number} | Status: {lease.status}
                </small>
                
            </div>
            <div>
                <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate("/dashboard/leases")}
                    className="me-2"
                >
                    <i className="bi bi-arrow-left me-1"></i>
                    Back to Leases
                </Button>
                <Button variant="primary">
                    <i className="bi bi-pencil me-1"></i>
                    Edit Lease
                </Button>
          </div>
        </div>

       

        {/* Main Content Tabs */}
        <div className="border-bottom mb-4">
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabSelect}
            className="border-0"
          >
            <Tab eventKey="details" title={
              <span><i className="bi bi-info-circle me-1"></i>Details</span>
            } />
            <Tab eventKey="payments" title={
              <span><i className="bi bi-credit-card me-1"></i>Payments</span>
            } />
            <Tab eventKey="documents" title={
              <span><i className="bi bi-file-earmark me-1"></i>Documents</span>
            } />
            <Tab eventKey="history" title={
              <span><i className="bi bi-clock-history me-1"></i>History</span>
            } />
          </Tabs>
        </div>

        <div className="py-4">
            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="container-fluid">
                {/* General Information Fields */}
                <Row className="g-3 mb-5">
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={`${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`}
                        readOnly 
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={(lease.tenant.username || '')} 
                        readOnly 
                      />
                    </div>
                  </Col>
                 
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">ID Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={getTenantIdNumber(lease)} 
                        readOnly 
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Property Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={lease.property.property_name || ''} 
                        readOnly 
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Property Location</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={getPropertyAddress(lease) || 'N/A'} 
                        readOnly 
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Unit Number/Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={getUnitInfo(lease)} 
                        readOnly 
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Unit Type</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={getUnitType(lease)} 
                        readOnly 
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Start Date</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formatDate(lease.start_date)} 
                        readOnly 
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">End Date</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={formatDate(lease.end_date)} 
                        readOnly 
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label">Lease Duration</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={`${lease.lease_months || 'N/A'} months`} 
                        readOnly 
                      />
                    </div>
                  </Col>
                  
                </Row>

                {/* Terms and Conditions Section */}
                <div className="border-top pt-4">
                  <Row>
                    <Col md={8}>
                      <h5 className="text-muted mb-4"></h5>
                    </Col>
                    <Col md={4}>
                      <div className="bg-light p-4 rounded">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Amount:</span>
                          <span className="fw-bold">{formatCurrency(getRentAmount(lease))}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Discount:</span>
                          <span className="fw-bold text-success">{formatCurrency(lease.discount || 0)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between mb-3">
                          <span className="fw-bold">Total:</span>
                          <span className="fw-bold">{formatCurrency(getRentAmount(lease))}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                          <span className="fw-bold">Paid Amount:</span>
                          <span className="fw-bold">{formatCurrency(getRentAmount(lease))}</span>
                        </div>
                        <hr className="my-3" />
                        <div className="d-flex justify-content-between">
                          <span className="fw-bold">Amount Due:</span>
                          <span className="fw-bold text-danger">{formatCurrency(lease.outstanding_amount || 0)}</span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (() => {
              let paymentsContent;
              if (paymentsLoading) {
                paymentsContent = (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                    <p className="mt-2 text-muted">Loading payments...</p>
                  </div>
                );
              } else if (payments.length > 0) {
                paymentsContent = (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Reference</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment, index) => (
                          <tr key={payment.id || index}>
                            <td>{formatDate(payment.payment_date)}</td>
                            <td className="fw-bold text-success">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td>
                              <span className="badge bg-secondary">
                                {payment.payment_method || 'Cash'}
                              </span>
                            </td>
                            <td>{payment.reference_number || 'N/A'}</td>
                            <td>
                              <span className="badge bg-success">Confirmed</span>
                            </td>
                            <td>
                              <Button variant="outline-primary" size="sm">
                                <i className="bi bi-receipt"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              } else {
                paymentsContent = (
                  <div className="text-center py-5">
                    <i className="bi bi-credit-card display-1 text-muted"></i>
                    <h5 className="mt-3">No payments recorded</h5>
                    <p className="text-muted">Payment history will appear here once payments are recorded.</p>
                  </div>
                );
              }
              return (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5><i className="bi bi-credit-card me-2"></i>Payment History</h5>
                    <Button variant="primary" size="sm">
                      <i className="bi bi-plus me-1"></i>
                      Record Payment
                    </Button>
                  </div>
                  {paymentsContent}
                </div>
              );
            })()}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5><i className="bi bi-file-earmark me-2"></i>Documents</h5>
                  <Button variant="primary" size="sm">
                    <i className="bi bi-upload me-1"></i>
                    Upload Document
                  </Button>
                </div>
                
                {documentsLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" size="sm" />
                    <p className="mt-2 text-muted">Loading documents...</p>
                  </div>
                ) : documents.length > 0 ? (
                  <Row>
                    {documents.map((document, index) => (
                      <Col md={4} key={document.id || index} className="mb-3">
                        <div className="border p-4 h-100">
                          <div className="text-center">
                            <i className="bi bi-file-earmark-text display-4 text-primary"></i>
                            <h6 className="mt-2">{document.document_type || 'Document'}</h6>
                            <p className="text-muted small">{document.description || 'No description'}</p>
                            <Button variant="outline-primary" size="sm">
                              <i className="bi bi-download me-1"></i>
                              Download
                            </Button>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div className="text-center py-5">
                    <i className="bi bi-file-earmark display-1 text-muted"></i>
                    <h5 className="mt-3">No documents uploaded</h5>
                    <p className="text-muted">Lease documents will appear here once uploaded.</p>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div>
                <h5><i className="bi bi-clock-history me-2"></i>Lease History</h5>
                <div className="timeline mt-4">
                  <div className="timeline-item">
                    <div className="timeline-marker bg-success"></div>
                    <div className="timeline-content">
                      <h6>Lease Created</h6>
                      <p className="text-muted">{formatDate(lease.created_at)}</p>
                      <small className="text-muted">Lease agreement was created and activated</small>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-marker bg-primary"></div>
                    <div className="timeline-content">
                      <h6>Last Updated</h6>
                      <p className="text-muted">{formatDate(lease.updated_at || lease.created_at)}</p>
                      <small className="text-muted">Most recent modification to lease terms</small>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </Container>
    </Layout>
  );
}

export default Lease;
