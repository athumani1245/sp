import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Toast from '../../components/Toast';
import { 
  getLeases,
  exportLeases
} from '../../services/leaseService';
import { 
  exportReportData, 
  generateReportSummary,
  REPORT_TYPES, 
  EXPORT_FORMATS 
} from '../../services/reportService';
import {
  exportLeasesToExcel,
  exportLeasesToPDF
} from '../../services/leaseReportExportService';

const LeaseReportModal = ({ show, onHide, reportConfig, selectedFormat }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({});
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    lease_number: true,
    tenant: true,
    property: true,
    unit: true,
    start_date: true,
    end_date: true,
    monthly_rent: true,
    status: true,
    duration: false,
    security_deposit: false,
    created_date: false
  });
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');

  const showToastMessage = (title, message, variant = 'success') => {
    setToastConfig({ title, message, variant });
    setShowToast(true);
  };

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Handle select all/none columns
  const toggleAllColumns = (visible) => {
    const newVisibility = {};
    Object.keys(allColumns).forEach(key => {
      newVisibility[key] = visible;
    });
    setVisibleColumns(newVisibility);
  };

  // Get column display names
  const getColumnDisplayName = (key) => {
    const displayNames = {
      lease_number: 'Lease Number',
      tenant: 'Tenant',
      property: 'Property',
      unit: 'Unit',
      start_date: 'Start Date',
      end_date: 'End Date',
      monthly_rent: 'Monthly Rent',
      status: 'Status',
      duration: 'Duration (Months)',
      security_deposit: 'Security Deposit',
      created_date: 'Created Date'
    };
    return displayNames[key] || key.replace('_', ' ').toUpperCase();
  };

  // All available columns definition
  const allColumns = {
    lease_number: {
      name: 'Lease No.',
      selector: row => {
        if (row.lease_number) return row.lease_number;
        if (row.lease_code) return row.lease_code;
        if (row.id) return `LEASE-${row.id}`;
        return 'N/A';
      },
      sortable: true,
      resizable: true,
      minWidth: '120px',
      maxWidth: '200px',
    },
    tenant: {
      name: 'Tenant',
      selector: row => {
        if (typeof row.tenant === 'object' && row.tenant !== null) {
          const firstName = row.tenant.first_name || '';
          const lastName = row.tenant.last_name || '';
          return `${firstName} ${lastName}`.trim() || 'N/A';
        }
        return row.tenant || 'N/A';
      },
      sortable: true,
      resizable: true,
      minWidth: '150px',
      maxWidth: '250px',
    },
    property: {
      name: 'Property',
      selector: row => {
        if (typeof row.property === 'object' && row.property !== null) {
          return row.property.property_name || row.property.name || 'N/A';
        }
        return row.property || 'N/A';
      },
      sortable: true,
      resizable: true,
      minWidth: '150px',
      maxWidth: '300px',
    },
    unit: {
      name: 'Unit',
      selector: row => {
        if (typeof row.unit === 'object' && row.unit !== null) {
          return row.unit.unit_name || row.unit.id || 'N/A';
        }
        return row.unit || 'N/A';
      },
      sortable: true,
      resizable: true,
      minWidth: '100px',
      maxWidth: '150px',
    },
    start_date: {
      name: 'Start Date',
      selector: row => row.start_date ? new Date(row.start_date).toLocaleDateString() : 'N/A',
      sortable: true,
      resizable: true,
      minWidth: '120px',
      maxWidth: '180px',
    },
    end_date: {
      name: 'End Date',
      selector: row => row.end_date ? new Date(row.end_date).toLocaleDateString() : 'N/A',
      sortable: true,
      resizable: true,
      minWidth: '120px',
      maxWidth: '180px',
    },
    monthly_rent: {
      name: 'Monthly Rent',
      selector: row => {
        let rent = 0;
        if (row.monthly_rent) {
          rent = Number(row.monthly_rent);
        } else if (row.rent_amount_per_unit) {
          rent = Number(row.rent_amount_per_unit);
        } else if (typeof row.unit === 'object' && row.unit?.rent_per_month) {
          rent = Number(row.unit.rent_per_month);
        }
        return isNaN(rent) ? 'TSh 0' : `TSh ${rent.toLocaleString()}`;
      },
      sortable: true,
      resizable: true,
      minWidth: '130px',
      maxWidth: '200px',
    },
    status: {
      name: 'Status',
      selector: row => row.status || 'Unknown',
      sortable: true,
      resizable: true,
      minWidth: '120px',
      maxWidth: '150px',
      cell: row => {
        const status = (row.status || 'unknown').toLowerCase();
        let badgeClass = 'secondary';
        
        switch (status) {
          case 'active':
            badgeClass = 'success';
            break;
          case 'pending':
            badgeClass = 'warning';
            break;
          case 'expired':
            badgeClass = 'danger';
            break;
          case 'terminated':
            badgeClass = 'dark';
            break;
          case 'cancelled':
            badgeClass = 'secondary';
            break;
          default:
            badgeClass = 'secondary';
        }
        
        return (
          <span className={`badge bg-${badgeClass} text-capitalize`}>
            {status}
          </span>
        );
      },
    },
    duration: {
      name: 'Duration',
      selector: row => {
        if (row.number_of_month) {
          return `${row.number_of_month} months`;
        } else if (row.start_date && row.end_date) {
          const start = new Date(row.start_date);
          const end = new Date(row.end_date);
          const months = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.44));
          return `${months} months`;
        }
        return 'N/A';
      },
      sortable: true,
      resizable: true,
      minWidth: '120px',
      maxWidth: '180px',
    },
    security_deposit: {
      name: 'Security Deposit',
      selector: row => {
        const deposit = row.security_deposit || row.deposit_amount || 0;
        return isNaN(deposit) ? 'TSh 0' : `TSh ${Number(deposit).toLocaleString()}`;
      },
      sortable: true,
      resizable: true,
      minWidth: '140px',
      maxWidth: '200px',
    },
    created_date: {
      name: 'Created Date',
      selector: row => row.created_at || row.date_created ? 
        new Date(row.created_at || row.date_created).toLocaleDateString() : 'N/A',
      sortable: true,
      resizable: true,
      minWidth: '120px',
      maxWidth: '180px',
    },
  };

  // Get visible columns based on user selection
  const columns = Object.keys(allColumns)
    .filter(key => visibleColumns[key])
    .map(key => ({ ...allColumns[key], id: key }));

  // Custom styles for the data table with resizable columns support
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
        borderTopColor: '#e3e6f0',
        backgroundColor: '#f8f9fa',
      },
    },
    headCells: {
      style: {
        '&:not(:last-of-type)': {
          borderRightStyle: 'solid',
          borderRightWidth: '1px',
          borderRightColor: '#e3e6f0',
        },
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#495057',
        cursor: 'col-resize',
        userSelect: 'none',
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

  // Enhanced filter data based on search text and date filters
  const filteredItems = data.filter(
    item => {
      // Text search filter
      const searchFields = [
        item.lease_number || '',
        typeof item.tenant === 'object' ? item.tenant?.first_name || '' : item.tenant || '',
        typeof item.tenant === 'object' ? item.tenant?.last_name || '' : '',
        typeof item.property === 'object' ? item.property?.property_name || item.property?.name || '' : item.property || '',
        typeof item.unit === 'object' ? item.unit?.unit_name || item.unit?.id || '' : item.unit || '',
        item.status || ''
      ].join(' ').toLowerCase();
      
      const matchesSearch = filterText === '' || searchFields.includes(filterText.toLowerCase());

      // Enhanced date range filter - check multiple date fields
      let matchesDateRange = true;
      if (dateFilter.startDate && dateFilter.endDate) {
        const filterStartDate = new Date(dateFilter.startDate);
        const filterEndDate = new Date(dateFilter.endDate);
        
        // Set time to start/end of day for proper comparison
        filterStartDate.setHours(0, 0, 0, 0);
        filterEndDate.setHours(23, 59, 59, 999);
        
        // Check if lease overlaps with the selected date range
        let itemMatches = false;
        
        // Check lease start date
        if (item.start_date) {
          const itemStartDate = new Date(item.start_date);
          itemStartDate.setHours(0, 0, 0, 0);
          
          if (itemStartDate >= filterStartDate && itemStartDate <= filterEndDate) {
            itemMatches = true;
          }
        }
        
        // Check lease end date
        if (!itemMatches && item.end_date) {
          const itemEndDate = new Date(item.end_date);
          itemEndDate.setHours(0, 0, 0, 0);
          
          if (itemEndDate >= filterStartDate && itemEndDate <= filterEndDate) {
            itemMatches = true;
          }
        }
        
        // Check if lease spans across the filter date range
        if (!itemMatches && item.start_date && item.end_date) {
          const itemStartDate = new Date(item.start_date);
          const itemEndDate = new Date(item.end_date);
          itemStartDate.setHours(0, 0, 0, 0);
          itemEndDate.setHours(23, 59, 59, 999);
          
          // Lease spans across the filter range
          if (itemStartDate <= filterStartDate && itemEndDate >= filterEndDate) {
            itemMatches = true;
          }
        }
        
        // Check creation date as fallback
        if (!itemMatches && (item.created_at || item.date_created)) {
          const createdDate = new Date(item.created_at || item.date_created);
          createdDate.setHours(0, 0, 0, 0);
          
          if (createdDate >= filterStartDate && createdDate <= filterEndDate) {
            itemMatches = true;
          }
        }
        
        matchesDateRange = itemMatches;
      }

      return matchesSearch && matchesDateRange;
    }
  );

  // Load lease data using leaseService with enhanced filtering
  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {};

      // Add status filter if selected
      if (statusFilter) {
        filters.status = statusFilter;
      }

      // Add property filter if selected
      if (propertyFilter) {
        filters.property_id = propertyFilter;
      }

      // Add date range filters if specified
      if (dateFilter.startDate && dateFilter.endDate) {
        filters.start_date_from = dateFilter.startDate;
        filters.start_date_to = dateFilter.endDate;
        // Also include end date filtering for comprehensive coverage
        filters.end_date_from = dateFilter.startDate;
        filters.end_date_to = dateFilter.endDate;
      }
      
      const result = await getLeases(filters);

      if (result.success) {
        setData(result.data || []);
        
        // Generate report summary using the lease data
        const summary = generateReportSummary(REPORT_TYPES.LEASE, result.data || []);
        console.log('Lease Report Summary:', summary);
        console.log('Loaded lease data with filters:', { filters, dataCount: result.data?.length || 0 });
        
        // Show success message with filter info
        const filterInfo = [];
        if (statusFilter) filterInfo.push(`Status: ${statusFilter}`);
        if (dateFilter.startDate && dateFilter.endDate) {
          filterInfo.push(`Date: ${new Date(dateFilter.startDate).toLocaleDateString()} - ${new Date(dateFilter.endDate).toLocaleDateString()}`);
        }
        
        if (filterInfo.length > 0) {
          showToastMessage('Success', `Loaded ${result.data?.length || 0} leases with filters: ${filterInfo.join(', ')}`, 'info');
        }
      } else {
        showToastMessage('Error', result.error || 'Failed to load lease data', 'danger');
      }
    } catch (error) {
      console.error('Error loading lease data:', error);
      showToastMessage('Error', 'Failed to load lease data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Handle date filter changes
  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Quick date range presets
  const setQuickDateRange = (preset) => {
    const today = new Date();
    let startDate, endDate;

    switch (preset) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'thisWeek':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'thisYear':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        return;
    }

    setDateFilter({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  // Apply filters with API call
  const applyFilters = () => {
    loadData();
  };

  // Reset all filters
  const resetFilters = () => {
    setDateFilter({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
    setStatusFilter('');
    setPropertyFilter('');
    setFilterText('');
    loadData();
  };

  // Handle row selection
  const handleRowSelected = React.useCallback(state => {
    setSelectedRows(state.selectedRows);
  }, []);

  // Handle clear selected rows
  const contextActions = React.useMemo(() => {
    const handleDelete = () => {
      if (window.confirm(`Are you sure you want to delete ${selectedRows.length} selected items?`)) {
        // Implement delete functionality here
        setToggleCleared(!toggleCleared);
        setData(data.filter(item => !selectedRows.find(selected => selected.id === item.id)));
        showToastMessage('Success', `${selectedRows.length} items deleted successfully`, 'success');
      }
    };

    return (
      <button
        key="delete"
        onClick={handleDelete}
        className="odoo-btn odoo-btn-danger odoo-btn-sm me-2"
      >
        <i className="bi bi-trash me-1"></i>
        Delete Selected
      </button>
    );
  }, [data, selectedRows, toggleCleared]);

  // Handle export using dedicated export service
  const handleExport = async (format) => {
    try {
      const exportData = selectedRows.length > 0 ? selectedRows : filteredItems;
      
      if (exportData.length === 0) {
        showToastMessage('Warning', 'No data available to export', 'warning');
        return;
      }

      // Prepare filters for export service
      const filters = {
        statusFilter,
        dateFilter
      };

      let result;
      
      if (format === 'excel') {
        result = await exportLeasesToExcel(exportData, filters);
      } else if (format === 'pdf') {
        result = await exportLeasesToPDF(exportData, filters);
      } else {
        // Use reportService for CSV format
        const exportFormat = EXPORT_FORMATS.CSV;
        const exportOptions = {
          filename: `lease-report-${new Date().toISOString().split('T')[0]}.csv`
        };

        result = await exportReportData(REPORT_TYPES.LEASE, exportData, exportFormat, exportOptions);
      }

      if (result.success) {
        showToastMessage('Success', result.message || `${format.toUpperCase()} file exported successfully!`, 'success');
      } else {
        showToastMessage('Error', result.error || `Failed to export ${format.toUpperCase()} file`, 'danger');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToastMessage('Error', `Failed to export ${format} file`, 'danger');
    }
  };





  // Load data when component mounts or date filter changes
  useEffect(() => {
    if (show) {
      loadData();
    }
  }, [show]);

  // Reset filter text and column selector when modal closes
  useEffect(() => {
    if (!show) {
      setFilterText('');
      setSelectedRows([]);
      setToggleCleared(false);
      setShowColumnSelector(false);
      // Reset filters when modal closes
      setStatusFilter('');
      setPropertyFilter('');
    }
  }, [show]);

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

  if (!show) return null;

  return (
    <>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        title={toastConfig.title}
        message={toastConfig.message}
        variant={toastConfig.variant}
        autoHide={true}
        delay={4000}
      />

      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className={`bi ${reportConfig?.icon} me-2`}></i>
                {reportConfig?.title} - Data View
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
              ></button>
            </div>

            <div className="modal-body p-0">
              {/* Toolbar */}
              <div className="data-table-toolbar border-bottom">
                <div className="p-3">
                  {/* First Row - Main Controls */}
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                    <div className="d-flex flex-wrap align-items-center gap-3">
                      {/* Column selector dropdown */}
                      <div className="dropdown me-2">
                        <button
                          className="odoo-btn odoo-btn-secondary odoo-btn-sm dropdown-toggle"
                          type="button"
                          onClick={() => setShowColumnSelector(!showColumnSelector)}
                        >
                          <i className="bi bi-columns-gap me-1"></i>
                          <span className="d-none d-sm-inline">Columns </span>({Object.values(visibleColumns).filter(Boolean).length})
                        </button>
                        {showColumnSelector && (
                          <div className="dropdown-menu show position-absolute" style={{ zIndex: 1050, minWidth: '280px', maxHeight: '300px', overflowY: 'auto' }}>
                            <div className="px-3 py-2 border-bottom">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">Select Columns</h6>
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
                              {Object.keys(allColumns).map(columnKey => (
                                <div key={columnKey} className="form-check py-1">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`col-${columnKey}`}
                                    checked={visibleColumns[columnKey]}
                                    onChange={() => toggleColumnVisibility(columnKey)}
                                  />
                                  <label className="form-check-label" htmlFor={`col-${columnKey}`}>
                                    {getColumnDisplayName(columnKey)}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Export buttons */}
                      <div className="btn-group me-2" role="group">
                        <button
                          className="odoo-btn odoo-btn-success odoo-btn-sm"
                          onClick={() => handleExport('excel')}
                          disabled={loading}
                          title="Export to Excel"
                        >
                          <i className="bi bi-file-earmark-excel me-1"></i>
                          <span className="d-none d-md-inline">Excel</span>
                        </button>
                        <button
                          className="odoo-btn odoo-btn-danger odoo-btn-sm ms-1"
                          onClick={() => handleExport('pdf')}
                          disabled={loading}
                          title="Export to PDF"
                        >
                          <i className="bi bi-file-earmark-pdf me-1"></i>
                          <span className="d-none d-md-inline">PDF</span>
                        </button>
                      </div>
                    </div>

                    {/* Search box - moves to new line on small screens */}
                    <div className="search-container order-3 order-lg-2">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text">
                          <i className="bi bi-search"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search leases..."
                          value={filterText}
                          onChange={(e) => setFilterText(e.target.value)}
                          style={{ minWidth: '200px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Second Row - Filters */}
                  <div className="d-flex flex-wrap align-items-center gap-3">
                    <div className="d-flex flex-wrap align-items-center gap-3">

                      {/* Enhanced Date filters with quick presets */}
                      <div className="d-flex flex-wrap align-items-center gap-2 me-3">
                        <div className="d-flex align-items-center gap-2">
                          <label className="form-label mb-0 small text-nowrap fw-medium">
                            <i className="bi bi-calendar-range me-1"></i>Date Range:
                          </label>
                          
                          {/* Quick date presets */}
                          <div className="btn-group btn-group-sm me-2" role="group">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => setQuickDateRange('today')}
                              title="Today"
                            >
                              Today
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => setQuickDateRange('thisWeek')}
                              title="This Week"
                            >
                              Week
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => setQuickDateRange('thisMonth')}
                              title="This Month"
                            >
                              Month
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => setQuickDateRange('thisYear')}
                              title="This Year"
                            >
                              Year
                            </button>
                          </div>
                        </div>
                        
                        <div className="d-flex align-items-center gap-2">
                          <label className="form-label mb-0 small text-nowrap">From:</label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            style={{ width: '140px' }}
                            value={dateFilter.startDate}
                            onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                            max={dateFilter.endDate}
                          />
                          <label className="form-label mb-0 small text-nowrap">To:</label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            style={{ width: '140px' }}
                            value={dateFilter.endDate}
                            onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                            min={dateFilter.startDate}
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      
                      {/* Status filter */}
                      <div className="d-flex align-items-center gap-2 me-3">
                        <label className="form-label mb-0 small text-nowrap">Status:</label>
                        <select
                          className="form-select form-select-sm"
                          style={{ minWidth: '120px' }}
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="">All Statuses</option>
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="expired">Expired</option>
                          <option value="terminated">Terminated</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* Action buttons with filter indicators */}
                      <div className="btn-group" role="group">
                        <button
                          className="odoo-btn odoo-btn-primary odoo-btn-sm position-relative"
                          onClick={applyFilters}
                          disabled={loading}
                          title="Apply Filters"
                        >
                          <i className="bi bi-funnel me-1"></i>
                          <span className="d-none d-sm-inline">Apply</span>
                          {(statusFilter || (dateFilter.startDate && dateFilter.endDate)) && (
                            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                              <span className="visually-hidden">Active filters</span>
                            </span>
                          )}
                        </button>
                        <button
                          className="odoo-btn odoo-btn-outline-secondary odoo-btn-sm ms-1"
                          onClick={resetFilters}
                          disabled={loading}
                          title="Reset All Filters"
                        >
                          <i className="bi bi-arrow-clockwise me-1"></i>
                          <span className="d-none d-sm-inline">Reset</span>
                        </button>
                      </div>

                      {/* Active filters display */}
                      {(statusFilter || (dateFilter.startDate && dateFilter.endDate)) && (
                        <div className="d-flex flex-wrap gap-1 align-items-center">
                          <small className="text-muted">Active filters:</small>
                          {statusFilter && (
                            <span className="badge bg-primary rounded-pill">
                              Status: {statusFilter}
                              <button
                                type="button"
                                className="btn-close btn-close-white ms-1"
                                style={{ fontSize: '0.6em' }}
                                onClick={() => {
                                  setStatusFilter('');
                                  loadData();
                                }}
                                title="Remove status filter"
                              ></button>
                            </span>
                          )}
                          {(dateFilter.startDate && dateFilter.endDate) && (
                            <span className="badge bg-info rounded-pill">
                              Date: {new Date(dateFilter.startDate).toLocaleDateString()} - {new Date(dateFilter.endDate).toLocaleDateString()}
                              <button
                                type="button"
                                className="btn-close btn-close-white ms-1"
                                style={{ fontSize: '0.6em' }}
                                onClick={() => {
                                  setDateFilter({
                                    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
                                    endDate: new Date().toISOString().split('T')[0]
                                  });
                                  loadData();
                                }}
                                title="Remove date filter"
                              ></button>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="table-container" style={{ height: '500px' }}>
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
                  fixedHeaderScrollHeight="400px"
                  noDataComponent={
                    <div className="text-center py-5">
                      <i className="bi bi-inbox display-4 text-muted"></i>
                      <h5 className="text-muted mt-3">No lease data available</h5>
                      <p className="text-muted">Try adjusting your filters or date range.</p>
                    </div>
                  }
                  progressComponent={
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted mt-2">Loading lease data...</p>
                    </div>
                  }
                />
              </div>
            </div>

            <div className="modal-footer flex-wrap">
              <div className="d-flex justify-content-between align-items-center w-100 flex-wrap gap-2">
                <div className="text-muted small order-2 order-sm-1">
                  <div className="d-flex flex-wrap gap-3 align-items-center">
                    <span>
                      <i className="bi bi-table me-1"></i>
                      Showing <strong>{filteredItems.length}</strong> of <strong>{data.length}</strong> leases
                    </span>
                    {selectedRows.length > 0 && (
                      <span>
                        <i className="bi bi-check-square me-1"></i>
                        <strong>{selectedRows.length}</strong> selected
                      </span>
                    )}
                    {(dateFilter.startDate && dateFilter.endDate) && (
                      <span>
                        <i className="bi bi-calendar-range me-1"></i>
                        Filtered by: {new Date(dateFilter.startDate).toLocaleDateString()} - {new Date(dateFilter.endDate).toLocaleDateString()}
                      </span>
                    )}
                    {statusFilter && (
                      <span>
                        <i className="bi bi-funnel me-1"></i>
                        Status: <strong>{statusFilter}</strong>
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="odoo-btn odoo-btn-secondary order-1 order-sm-2 ms-2"
                  onClick={onHide}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaseReportModal;