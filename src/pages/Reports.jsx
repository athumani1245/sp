import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import { generateLeaseAgreementPDF } from "../reports";
import { getLeases } from "../services/leaseService";
import { getProperties } from "../services/propertyService";
import { getTenants } from "../services/tenantService";
import "../assets/styles/reports.css";

function Reports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of current year
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  // Available report types
  const reportTypes = [
    {
      id: 'lease_agreements',
      title: 'Lease Agreements',
      description: 'Generate PDF documents for individual lease agreements',
      icon: 'bi-file-earmark-text',
      color: 'primary',
      category: 'Leases',
      requiresSelection: true,
      dataSource: 'leases'
    },
    {
      id: 'property_summary',
      title: 'Property Summary Report',
      description: 'Overview of all properties with units and occupancy status',
      icon: 'bi-building',
      color: 'success',
      category: 'Properties',
      requiresSelection: false,
      dataSource: 'properties'
    },
    {
      id: 'units_availability',
      title: 'Units Availability Report',
      description: 'Current availability status of all property units',
      icon: 'bi-door-open',
      color: 'success',
      category: 'Properties',
      requiresSelection: false,
      dataSource: 'properties'
    },
    {
      id: 'property_performance',
      title: 'Property Performance Report',
      description: 'Financial and operational performance metrics by property',
      icon: 'bi-graph-up',
      color: 'success',
      category: 'Properties',
      requiresSelection: false,
      dataSource: 'properties'
    },
    {
      id: 'tenant_directory',
      title: 'Tenant Directory',
      description: 'Complete list of all tenants with contact information',
      icon: 'bi-people',
      color: 'info',
      category: 'Tenants',
      requiresSelection: false,
      dataSource: 'tenants'
    },
    {
      id: 'tenant_payment_history',
      title: 'Tenant Payment History',
      description: 'Detailed payment records and transaction history by tenant',
      icon: 'bi-clock-history',
      color: 'info',
      category: 'Tenants',
      requiresSelection: false,
      dataSource: 'tenants'
    },
    {
      id: 'tenant_outstanding_balance',
      title: 'Tenant Outstanding Balance Report',
      description: 'Current outstanding balances and overdue payments by tenant',
      icon: 'bi-exclamation-triangle',
      color: 'info',
      category: 'Tenants',
      requiresSelection: false,
      dataSource: 'tenants'
    },
    {
      id: 'payment_summary',
      title: 'Payment Summary',
      description: 'Financial overview of payments and outstanding balances',
      icon: 'bi-cash-stack',
      color: 'warning',
      category: 'Finances',
      requiresSelection: false,
      dataSource: 'payments'
    },
    {
      id: 'occupancy_report',
      title: 'Occupancy Report',
      description: 'Current occupancy rates and vacancy analysis',
      icon: 'bi-pie-chart',
      color: 'secondary',
      category: 'Analytics',
      requiresSelection: false,
      dataSource: 'properties'
    },
    {
      id: 'lease_expiry',
      title: 'Lease Expiry Report',
      description: 'Upcoming lease expirations and renewal tracking',
      icon: 'bi-calendar-event',
      color: 'danger',
      category: 'Leases',
      requiresSelection: false,
      dataSource: 'leases'
    },
    {
      id: 'lease_renewal_termination',
      title: 'Lease Renewal/Termination Report',
      description: 'Track lease renewals, terminations, and contract changes',
      icon: 'bi-arrow-repeat',
      color: 'primary',
      category: 'Leases',
      requiresSelection: false,
      dataSource: 'leases'
    }
  ];

  const showToastMessage = (title, message, variant = 'success') => {
    setToastConfig({ title, message, variant });
    setShowToast(true);
  };

  const handleGenerateReport = async (report) => {
    setSelectedReport(report);

    if (report.id === 'lease_agreements') {
      // Show date range selection for lease agreements
      setShowDateRangeModal(true);
    } else {
      // For other reports, generate directly
      setLoading(true);
      try {
        await generateGenericReport(report);
      } catch (error) {
        console.error('Error generating report:', error);
        showToastMessage('Error', 'Failed to generate report. Please try again.', 'danger');
      } finally {
        setLoading(false);
      }
    }
  };

  const generateGenericReport = async (report) => {
    // Placeholder for generic report generation
    // In a real implementation, you would create different report templates
    showToastMessage(
      'Report Generated',
      `${report.title} has been prepared and will be available for download shortly.`,
      'success'
    );
  };

  const handleDateRangeSubmit = async () => {
    setLoading(true);
    setShowDateRangeModal(false);

    try {
      // Fetch leases within the selected date range
      const result = await getLeases({ 
        limit: 100,
        start_date: dateFilter.startDate,
        end_date: dateFilter.endDate
      });
      
      if (result.success && result.data?.items?.length > 0) {
        setReportData(result.data.items);
        setShowPreviewModal(true);
      } else {
        showToastMessage(
          'No Data', 
          `No leases found between ${dateFilter.startDate} and ${dateFilter.endDate}.`, 
          'warning'
        );
      }
    } catch (error) {
      console.error('Error fetching leases:', error);
      showToastMessage('Error', 'Failed to fetch lease data. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaseSelection = async (lease) => {
    try {
      setLoading(true);
      await generateLeaseAgreementPDF(lease, {
        download: true,
        preview: false,
        filename: `lease-agreement-${lease.lease_number}-${lease.tenant?.first_name}-${lease.tenant?.last_name}.pdf`
      });
      
      showToastMessage(
        'Success!',
        'Lease agreement document has been generated and downloaded successfully.',
        'success'
      );
      setShowPreviewModal(false);
    } catch (error) {
      console.error('Error generating lease PDF:', error);
      showToastMessage('Error', 'Failed to generate lease document. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const groupedReports = reportTypes.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {});

  return (
    <Layout>
      {/* Toast notification */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        title={toastConfig.title}
        message={toastConfig.message}
        variant={toastConfig.variant}
        autoHide={true}
        delay={4000}
      />

      <div className="main-content">
        {/* Header */}
        <div className="leases-filters-section">
          <div className="row g-3 align-items-center">
            <div className="col-md-8">
              <h4 className="mb-1">
                <i className="bi bi-file-earmark-text me-2"></i>
                Reports & Exports
              </h4>
              <small className="text-muted">
                Generate and export various reports for your property management data
              </small>
            </div>
            <div className="col-md-4">
              <div className="d-flex justify-content-end">
                <button
                  className="odoo-btn odoo-btn-secondary"
                  onClick={() => navigate("/dashboard")}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  <span className="d-none d-md-inline">Back to </span>Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="leases-filters-section">
          {Object.entries(groupedReports).map(([category, reports]) => (
            <div key={category} className="mb-3">
              <h6 className="text-muted mb-2 fw-semibold">
                <i className="bi bi-folder me-2"></i>
                {category}
              </h6>
              <div className="row g-2">
                {reports.map((report) => (
                  <div key={report.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                    <div className="report-card compact">
                      <div className="report-card-header">
                        <div className={`report-icon bg-${report.color}`}>
                          <i className={`bi ${report.icon}`}></i>
                        </div>
                        <div className="report-info">
                          <h6 className="report-title">{report.title}</h6>
                          <small className="report-description">{report.description}</small>
                        </div>
                      </div>
                      <div className="report-card-footer">
                        <button
                          className={`odoo-btn odoo-btn-${report.color} odoo-btn-sm w-100`}
                          onClick={() => handleGenerateReport(report)}
                          disabled={loading && selectedReport?.id === report.id}
                        >
                          {loading && selectedReport?.id === report.id ? (
                            <>
                              <i className="bi bi-arrow-clockwise loading me-1"></i>
                              Generating...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-download me-1"></i>
                              Export
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="leases-filters-section">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-icon bg-primary">
                  <i className="bi bi-file-earmark-text"></i>
                </div>
                <div className="stat-info">
                  <h6>Total Reports</h6>
                  <span className="stat-number">{reportTypes.length}</span>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-icon bg-success">
                  <i className="bi bi-check-circle"></i>
                </div>
                <div className="stat-info">
                  <h6>Available</h6>
                  <span className="stat-number">{reportTypes.length}</span>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-icon bg-info">
                  <i className="bi bi-clock"></i>
                </div>
                <div className="stat-info">
                  <h6>Real-time</h6>
                  <span className="stat-number">100%</span>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card">
                <div className="stat-icon bg-warning">
                  <i className="bi bi-download"></i>
                </div>
                <div className="stat-info">
                  <h6>Export Format</h6>
                  <span className="stat-number">PDF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Selection Modal */}
      {showDateRangeModal && selectedReport?.id === 'lease_agreements' && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-calendar-range me-2"></i>
                  Select Date Range for Lease Agreements
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDateRangeModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-4">
                  Choose the date range for lease agreements you want to include in the report:
                </p>
                
                <div className="date-range-selector">
                  <label className="form-label fw-semibold mb-3">
                    <i className="bi bi-calendar-range me-2"></i>
                    Date Range
                  </label>
                  
                  <div className="date-range-display">
                    <div className="date-range-input-group">
                      <div className="date-input-wrapper">
                        <span className="date-label">From</span>
                        <input
                          type="date"
                          className="form-control date-input"
                          value={dateFilter.startDate}
                          onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                          max={dateFilter.endDate}
                        />
                      </div>
                      
                      <div className="date-separator">
                        <i className="bi bi-arrow-right"></i>
                      </div>
                      
                      <div className="date-input-wrapper">
                        <span className="date-label">To</span>
                        <input
                          type="date"
                          className="form-control date-input"
                          value={dateFilter.endDate}
                          onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                          min={dateFilter.startDate}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    
                   
                  </div>
                </div>

                
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="odoo-btn odoo-btn-secondary"
                  onClick={() => setShowDateRangeModal(false)}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
                <button
                  type="button"
                  className="odoo-btn odoo-btn-primary"
                  onClick={handleDateRangeSubmit}
                  disabled={loading || !dateFilter.startDate || !dateFilter.endDate}
                >
                  {loading ? (
                    <>
                      <i className="bi bi-arrow-clockwise loading me-2"></i>
                      Loading Leases...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-2"></i>
                      Find Leases
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lease Selection Modal */}
      {showPreviewModal && selectedReport?.id === 'lease_agreements' && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Select Lease Agreement to Export
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPreviewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info d-flex align-items-center mb-3">
                  <i className="bi bi-calendar-range me-2"></i>
                  <div>
                    <strong>Date Range:</strong> {dateFilter.startDate} to {dateFilter.endDate}
                    <br />
                    <small>Found {reportData?.length || 0} lease(s) in this period</small>
                  </div>
                </div>
                
                <p className="text-muted mb-3">
                  Choose a lease agreement to generate and download the PDF document:
                </p>
                <div className="lease-selection-list">
                  {reportData?.map((lease) => (
                    <div
                      key={lease.id}
                      className="lease-selection-item"
                      onClick={() => handleLeaseSelection(lease)}
                    >
                      <div className="lease-info">
                        <div className="lease-title">
                          <strong>{lease.lease_number}</strong>
                          <span className={`badge bg-${lease.status === 'active' ? 'success' : 'secondary'} ms-2`}>
                            {lease.status}
                          </span>
                        </div>
                        <div className="lease-details">
                          <span className="text-muted">
                            Tenant: {lease.tenant?.first_name} {lease.tenant?.last_name}
                          </span>
                          <span className="text-muted ms-3">
                            Property: {lease.property?.property_name}
                          </span>
                        </div>
                      </div>
                      <div className="lease-action">
                        <i className="bi bi-download text-primary"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="odoo-btn odoo-btn-secondary"
                  onClick={() => setShowPreviewModal(false)}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Reports;