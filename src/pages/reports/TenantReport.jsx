import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import { usePageTitle } from '../../hooks/usePageTitle';

const TenantReport = () => {
  usePageTitle('Tenant Outstanding Balance Report');
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({});
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Selection filters
  const [tenantFilter, setTenantFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [leaseStatusFilter, setLeaseStatusFilter] = useState('');

  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    property: true,
    unit: true,
    lease_number: true,
    total_rent: true,
    amount_paid: true,
    remaining_amount: true,
    payment_status: true,
    lease_status: true,
    payment_progress: true
  });
  const [columnWidths, setColumnWidths] = useState({
    name: 180,
    property: 180,
    unit: 120,
    lease_number: 150,
    total_rent: 150,
    amount_paid: 150,
    remaining_amount: 160,
    payment_status: 140,
    lease_status: 120,
    payment_progress: 150
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState(null);

  const showToastMessage = (title, message, variant = 'success') => {
    setToastConfig({ title, message, variant });
    setShowToast(true);
  };

  // Handle select all/none columns
  const toggleAllColumns = (visible) => {
    const newVisibility = {};
    Object.keys(getAllColumns()).forEach(key => {
      newVisibility[key] = visible;
    });
    setVisibleColumns(newVisibility);
  };

  // Get column display names
  const getColumnDisplayName = (key) => {
    const displayNames = {
      name: 'Tenant Name',
      property: 'Property',
      unit: 'Unit',
      lease_number: 'Lease Number',
      total_rent: 'Total Rent',
      amount_paid: 'Amount Paid',
      remaining_amount: 'Outstanding Amount',
      payment_status: 'Payment Status',
      lease_status: 'Lease Status',
      payment_progress: 'Payment Progress'
    };
    return displayNames[key] || key.replace('_', ' ').toUpperCase();
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Handle column resizing
  const handleMouseDown = (e, columnKey) => {
    e.preventDefault();
    setIsResizing(true);
    setResizingColumn(columnKey);
    
    const startX = e.pageX;
    const startWidth = columnWidths[columnKey];
    
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const currentX = e.pageX;
      const diffX = currentX - startX;
      const newWidth = Math.max(80, Math.min(400, startWidth + diffX));
      
      setColumnWidths(prev => ({
        ...prev,
        [columnKey]: newWidth
      }));
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Create resize handle component
  const ResizeHandle = ({ columnKey }) => (
    <div
      className="resize-handle"
      onMouseDown={(e) => handleMouseDown(e, columnKey)}
      style={{
        position: 'absolute',
        right: '0',
        top: '0',
        width: '4px',
        height: '100%',
        cursor: 'col-resize',
        backgroundColor: resizingColumn === columnKey ? '#007bff' : 'transparent',
        zIndex: 10
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#007bff'}
      onMouseLeave={(e) => {
        if (resizingColumn !== columnKey) {
          e.target.style.backgroundColor = 'transparent';
        }
      }}
    />
  );

  // All available columns definition for outstanding payments data
  const getAllColumns = () => {
    return {
      name: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Tenant Name
            <ResizeHandle columnKey="name" />
          </div>
        ),
        selector: row => row.tenant_full_name || 'N/A',
        sortable: true,
        width: `${columnWidths.name}px`,
      },
      property: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Property
            <ResizeHandle columnKey="property" />
          </div>
        ),
        selector: row => row.property || 'N/A',
        sortable: true,
        width: `${columnWidths.property}px`,
      },
      unit: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Unit
            <ResizeHandle columnKey="unit" />
          </div>
        ),
        selector: row => row.unit || 'N/A',
        sortable: true,
        width: `${columnWidths.unit}px`,
        center: true,
      },
      lease_number: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Lease Number
            <ResizeHandle columnKey="lease_number" />
          </div>
        ),
        selector: row => row.lease_number || 'N/A',
        sortable: true,
        width: `${columnWidths.lease_number}px`,
      },
      total_rent: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Total Rent
            <ResizeHandle columnKey="total_rent" />
          </div>
        ),
        selector: row => Number(row.total_rent) || 0,
        sortable: true,
        width: `${columnWidths.total_rent}px`,
        cell: row => `TSh ${(Number(row.total_rent) || 0).toLocaleString()}`,
      },
      amount_paid: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Amount Paid
            <ResizeHandle columnKey="amount_paid" />
          </div>
        ),
        selector: row => Number(row.total_amount_paid) || 0,
        sortable: true,
        width: `${columnWidths.amount_paid}px`,
        cell: row => `TSh ${(Number(row.total_amount_paid) || 0).toLocaleString()}`,
      },
      remaining_amount: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Outstanding
            <ResizeHandle columnKey="remaining_amount" />
          </div>
        ),
        selector: row => Number(row.remaining_amount) || 0,
        sortable: true,
        width: `${columnWidths.remaining_amount}px`,
        cell: row => {
          const amount = Number(row.remaining_amount) || 0;
          return (
            <span className={`badge bg-${amount > 0 ? 'danger' : 'success'}`}>
              TSh {amount.toLocaleString()}
            </span>
          );
        },
      },
      payment_status: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Payment Status
            <ResizeHandle columnKey="payment_status" />
          </div>
        ),
        selector: row => row.payment_status || 'Unknown',
        sortable: true,
        width: `${columnWidths.payment_status}px`,
        center: true,
        cell: row => {
          const status = row.payment_status || 'Unknown';
          const badgeColor = status === 'FULLY PAID' ? 'success' : 
                            status === 'PARTIALLY PAID' ? 'warning' : 
                            status === 'NOT PAID' ? 'danger' : 'secondary';
          return (
            <span className={`badge bg-${badgeColor}`}>
              {status}
            </span>
          );
        },
      },
      lease_status: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Lease Status
            <ResizeHandle columnKey="lease_status" />
          </div>
        ),
        selector: row => row.lease_status || 'Unknown',
        sortable: true,
        width: `${columnWidths.lease_status}px`,
        center: true,
        cell: row => {
          const status = row.lease_status || 'Unknown';
          const badgeColor = status === 'active' ? 'success' : 
                            status === 'ended' ? 'secondary' : 
                            status === 'terminated' ? 'dark' : 
                            status === 'cancelled' ? 'danger' : 'warning';
          return (
            <span className={`badge bg-${badgeColor}`}>
              {status}
            </span>
          );
        },
      },
      payment_progress: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Progress
            <ResizeHandle columnKey="payment_progress" />
          </div>
        ),
        selector: row => {
          const totalRent = Number(row.total_rent) || 0;
          const totalPaid = Number(row.total_amount_paid) || 0;
          return totalRent > 0 ? Math.round((totalPaid / totalRent) * 100) : 0;
        },
        sortable: true,
        width: `${columnWidths.payment_progress}px`,
        center: true,
        cell: row => {
          const totalRent = Number(row.total_rent) || 0;
          const totalPaid = Number(row.total_amount_paid) || 0;
          const progress = totalRent > 0 ? Math.round((totalPaid / totalRent) * 100) : 0;
          const badgeColor = progress >= 100 ? 'success' : 
                            progress >= 50 ? 'warning' : 
                            progress > 0 ? 'info' : 'danger';
          return (
            <span className={`badge bg-${badgeColor}`}>
              {progress}%
            </span>
          );
        },
      }
    };
  };

  const allColumns = getAllColumns();

  // Get visible columns based on user selection
  const columns = Object.keys(allColumns)
    .filter(key => visibleColumns[key])
    .map(key => ({ ...allColumns[key], id: key }));

  // Custom styles for the data table
  const customStyles = {
    header: {
      style: {
        minHeight: '56px',
      },
    },
    headRow: {
      style: {
        borderTopStyle: 'solid',
        borderTopWidth: '1px',
        borderTopColor: '#dee2e6',
        backgroundColor: '#f8f9fa',
      },
    },
    headCells: {
      style: {
        '&:not(:last-of-type)': {
          borderRightStyle: 'solid',
          borderRightWidth: '1px',
          borderRightColor: '#dee2e6',
        },
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#495057',
        position: 'relative',
        userSelect: 'none',
        padding: '12px 8px',
      },
    },
    cells: {
      style: {
        '&:not(:last-of-type)': {
          borderRightStyle: 'solid',
          borderRightWidth: '1px',
          borderRightColor: '#f1f1f1',
        },
        fontSize: '13px',
        color: '#495057',
      },
    },
    rows: {
      style: {
        '&:hover': {
          backgroundColor: '#f8f9fa',
        },
      },
      selectedHighlightStyle: {
        backgroundColor: '#cce5ff',
        '&:hover': {
          backgroundColor: '#b3d9ff',
        },
      },
    },
  };

  // Filter data based on search text and selection filters
  const filteredItems = data.filter(
    item => {
      // Text search filter
      const searchFields = [
        item.tenant_full_name,
        item.property,
        item.unit,
        item.lease_number,
        item.payment_status,
        item.lease_status
      ].join(' ').toLowerCase();
      const matchesSearch = !filterText || searchFields.includes(filterText.toLowerCase());
      
      // Selection filters
      const matchesTenant = !tenantFilter || item.tenant_full_name === tenantFilter;
      const matchesProperty = !propertyFilter || item.property === propertyFilter;
      const matchesUnit = !unitFilter || item.unit === unitFilter;
      const matchesPaymentStatus = !paymentStatusFilter || item.payment_status === paymentStatusFilter;
      const matchesLeaseStatus = !leaseStatusFilter || item.lease_status === leaseStatusFilter;
      
      return matchesSearch && matchesTenant && matchesProperty && matchesUnit && matchesPaymentStatus && matchesLeaseStatus;
    }
  );

  // Get unique values for filter dropdowns
  const uniqueTenants = [...new Set(data.map(item => item.tenant_full_name))].filter(Boolean).sort();
  const uniqueProperties = [...new Set(data.map(item => item.property))].filter(Boolean).sort();
  const uniqueUnits = [...new Set(data.map(item => item.unit))].filter(Boolean).sort();
  const uniquePaymentStatuses = [...new Set(data.map(item => item.payment_status))].filter(Boolean).sort();
  const uniqueLeaseStatuses = [...new Set(data.map(item => item.lease_status))].filter(Boolean).sort();

  // Reset all filters
  const handleResetAllFilters = () => {
    setFilterText('');
    setTenantFilter('');
    setPropertyFilter('');
    setUnitFilter('');
    setPaymentStatusFilter('');
    setLeaseStatusFilter('');
    setResetPaginationToggle(!resetPaginationToggle);
  };

  // Handle row selection
  const handleRowSelected = React.useCallback(state => {
    setSelectedRows(state.selectedRows);
  }, []);

  // Handle clear selected rows
  const contextActions = React.useMemo(() => {
    const handleDelete = () => {
      if (window.confirm(`Are you sure you want to delete ${selectedRows.length} selected items?`)) {
        setToggleCleared(!toggleCleared);
        setData(data.filter(item => !selectedRows.find(selected => selected.id === item.id)));
        showToastMessage('Success', `${selectedRows.length} items deleted successfully`, 'success');
      }
    };

    return (
      <button
        key="delete"
        onClick={handleDelete}
        className="btn btn-sm btn-danger"
      >
        <i className="bi bi-trash me-1"></i>
        Delete Selected
      </button>
    );
  }, [data, selectedRows, toggleCleared]);

  // Import and use the reportService function for pending payments data
  const fetchPendingPaymentsData = async (filters = {}) => {
    try {
      const { fetchPendingPayments } = await import('../../services/reportService');
      
      const result = await fetchPendingPayments(filters);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch pending payments data');
      }

      return {
        success: true,
        data: result.data || [],
        total: result.total || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch pending payments data',
        data: []
      };
    }
  };

  // Load pending payments data
  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (dateFilter.startDate) filters.start_date = dateFilter.startDate;
      if (dateFilter.endDate) filters.end_date = dateFilter.endDate;
      // Note: No limit for pending payments to get all outstanding data
      
      const result = await fetchPendingPaymentsData(filters);
      
      if (result.success) {
        setData(result.data);
        showToastMessage('Success', `Loaded ${result.data.length} outstanding payment records`, 'success');
      } else {
        showToastMessage('Error', result.error, 'danger');
        setData([]);
      }
    } catch (error) {
      showToastMessage('Error', 'Failed to load outstanding payments data', 'danger');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Export functionality
  const handleExport = async (format) => {
    try {
      const exportData = selectedRows.length > 0 ? selectedRows : filteredItems;
      
      if (exportData.length === 0) {
        showToastMessage('Warning', 'No data available to export', 'warning');
        return;
      }

      // Import the report service
      const { exportReportData, REPORT_TYPES, EXPORT_FORMATS } = await import('../../services/reportService');
      
      // Determine the export format
      const exportFormat = format === 'excel' ? EXPORT_FORMATS.EXCEL : 
                          format === 'pdf' ? EXPORT_FORMATS.PDF : 
                          EXPORT_FORMATS.CSV;
      
      // Prepare export options with filters
      const exportOptions = {
        filters: {
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
          dateRange: dateFilter.startDate && dateFilter.endDate 
            ? `${dateFilter.startDate} to ${dateFilter.endDate}` 
            : undefined
        }
      };

      // Call the export function for pending payments data
      const result = await exportReportData(
        REPORT_TYPES.PENDING_PAYMENTS,
        exportData,
        exportFormat,
        exportOptions
      );

      if (result.success) {
        showToastMessage('Success', result.message, 'success');
      } else {
        showToastMessage('Error', result.error || 'Export failed', 'danger');
      }
    } catch (error) {
      showToastMessage('Error', 'Failed to export data', 'danger');
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  // Close column selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColumnSelector && !event.target.closest('.dropdown')) {
        setShowColumnSelector(false);
      }
    };

    if (showColumnSelector) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showColumnSelector]);

  return (
    <Layout>
      <div className="main-content">
        {/* Header */}
        <div className="leases-filters-section">
          <div className="row g-3 align-items-center">
            <div className="col-8">
              <h4 className="mb-1">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Outstanding Balance Report
              </h4>
            </div>
            <div className="col-4">
              <div className="d-flex justify-content-end">
                <button
                  className="odoo-btn odoo-btn-secondary odoo-btn-sm"
                  onClick={() => navigate("/dashboard")}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  <span className="d-none d-md-inline">Back to </span>
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="leases-filters-section">
          <div className="row g-3 align-items-end">
            {/* Export buttons */}
            <div className="col-auto">
              <div className="btn-group" role="group">
                <button
                  className="odoo-btn odoo-btn-success odoo-btn-sm me-2"
                  onClick={() => handleExport('excel')}
                  disabled={loading}
                >
                  <i className="bi bi-file-earmark-excel me-1"></i>
                  Export Excel
                </button>
                <button
                  className="odoo-btn odoo-btn-danger odoo-btn-sm"
                  onClick={() => handleExport('pdf')}
                  disabled={loading}
                >
                  <i className="bi bi-file-earmark-pdf me-1"></i>
                  Export PDF
                </button>
              </div>
            </div>

            {/* Column selector dropdown */}
            <div className="col-auto">
              <div className="dropdown">
                <button
                  className="odoo-btn odoo-btn-secondary odoo-btn-sm dropdown-toggle"
                  type="button"
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                >
                  <i className="bi bi-columns-gap me-1"></i>
                  Columns ({Object.values(visibleColumns).filter(Boolean).length})
                </button>
                {showColumnSelector && (
                  <div 
                    className="dropdown-menu show position-absolute" 
                    style={{ 
                      zIndex: 1050, 
                      minWidth: '280px', 
                      maxHeight: '300px', 
                      overflowY: 'auto' 
                    }}
                  >
                    <div className="px-3 py-2 border-bottom bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 text-dark">Select Columns</h6>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="odoo-btn odoo-btn-primary odoo-btn-sm"
                            onClick={() => toggleAllColumns(true)}
                            style={{ fontSize: '11px', padding: '2px 8px' }}
                          >
                            All
                          </button>
                          <button
                            className="odoo-btn odoo-btn-secondary odoo-btn-sm"
                            onClick={() => toggleAllColumns(false)}
                            style={{ fontSize: '11px', padding: '2px 8px' }}
                          >
                            None
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-1">
                      {Object.keys(getAllColumns()).map(columnKey => (
                        <div key={columnKey} className="row g-2 align-items-center py-1">
                          <div className="col-auto">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`column-${columnKey}`}
                              checked={visibleColumns[columnKey]}
                              onChange={() => toggleColumnVisibility(columnKey)}
                            />
                            <label className="form-check-label text-truncate" htmlFor={`column-${columnKey}`}>
                              <small>
                                  {getColumnDisplayName(columnKey)}
                              </small>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filter buttons */}
            <div className="col-auto">
              <button
                className="odoo-btn odoo-btn-secondary odoo-btn-sm"
                onClick={handleResetAllFilters}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Reset All Filters
              </button>
            </div>
          </div>

          {/* Selection Filters Row */}
          <div className="row g-2 mb-3 align-items-center">
            {/* Tenant Filter */}
            <div className="col-md-2 col-sm-6">
              <label className="form-label mb-1" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                <i className="bi bi-person me-1"></i>Tenant
              </label>
              <select
                className="form-select form-select-sm"
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value)}
              >
                <option value="">All Tenants</option>
                {uniqueTenants.map(tenant => (
                  <option key={tenant} value={tenant}>{tenant}</option>
                ))}
              </select>
            </div>

            {/* Property Filter */}
            <div className="col-md-2 col-sm-6">
              <label className="form-label mb-1" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                <i className="bi bi-building me-1"></i>Property
              </label>
              <select
                className="form-select form-select-sm"
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
              >
                <option value="">All Properties</option>
                {uniqueProperties.map(property => (
                  <option key={property} value={property}>{property}</option>
                ))}
              </select>
            </div>

            {/* Unit Filter */}
            <div className="col-md-2 col-sm-6">
              <label className="form-label mb-1" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                <i className="bi bi-door-open me-1"></i>Unit
              </label>
              <select
                className="form-select form-select-sm"
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
              >
                <option value="">All Units</option>
                {uniqueUnits.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            {/* Payment Status Filter */}
            <div className="col-md-2 col-sm-6">
              <label className="form-label mb-1" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                <i className="bi bi-credit-card me-1"></i>Payment Status
              </label>
              <select
                className="form-select form-select-sm"
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {uniquePaymentStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Lease Status Filter */}
            <div className="col-md-2 col-sm-6">
              <label className="form-label mb-1" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                <i className="bi bi-file-text me-1"></i>Lease Status
              </label>
              <select
                className="form-select form-select-sm"
                value={leaseStatusFilter}
                onChange={(e) => setLeaseStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {uniqueLeaseStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Search box */}
            <div className="col-md-2 col-sm-12">
              <label className="form-label mb-1" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                <i className="bi bi-search me-1"></i>Search
              </label>
              <div className="search-container">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="leases-filters-section">
          <DataTable
            columns={columns}
            data={filteredItems}
            progressPending={loading}
            pagination
            paginationResetDefaultPage={resetPaginationToggle}
            selectableRows
            onSelectedRowsChange={handleRowSelected}
            clearSelectedRows={toggleCleared}
            contextActions={contextActions}
            customStyles={customStyles}
            highlightOnHover
            pointerOnHover
            responsive
            fixedHeader
            fixedHeaderScrollHeight="600px"
            noDataComponent={
              <div className="text-center py-5">
                <i className="bi bi-exclamation-triangle display-4 text-muted"></i>
                <h5 className="text-muted mt-3">No outstanding payments found</h5>
                <p className="text-muted">No outstanding payments found matching your criteria.</p>
              </div>
            }
            progressComponent={
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Loading outstanding payments...</p>
              </div>
            }
          />
        </div>

        {/* Summary Footer */}
        <div className="leases-filters-section">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Showing {filteredItems.length} of {data.length} outstanding payments
            </div>
            <div className="text-muted small">
              Generated on {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        title={toastConfig.title}
        message={toastConfig.message}
        variant={toastConfig.variant}
        autoHide={true}
        delay={4000}
      />
    </Layout>
  );
};

export default TenantReport;