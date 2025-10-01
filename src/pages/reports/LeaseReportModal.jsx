import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Toast from '../../components/Toast';
import { 
  fetchReportData, 
  exportReportData, 
  generateReportSummary,
  REPORT_TYPES, 
  EXPORT_FORMATS 
} from '../../services/reportService';

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
    status: true
  });
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

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
      status: 'Status'
    };
    return displayNames[key] || key.replace('_', ' ').toUpperCase();
  };

  // All available columns definition
  const allColumns = {
    lease_number: {
      name: 'Lease No.',
      selector: row => row.lease_number || `LEASE-${row.id}`,
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
      minWidth: '100px',
      maxWidth: '150px',
      cell: row => (
        <span className={`badge bg-${row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'secondary'}`}>
          {row.status || 'Unknown'}
        </span>
      ),
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

  // Filter data based on search text
  const filteredItems = data.filter(
    item => {
      const searchFields = [
        item.lease_number || '',
        typeof item.tenant === 'object' ? item.tenant?.first_name || '' : item.tenant || '',
        typeof item.tenant === 'object' ? item.tenant?.last_name || '' : '',
        typeof item.property === 'object' ? item.property?.property_name || item.property?.name || '' : item.property || '',
        typeof item.unit === 'object' ? item.unit?.unit_name || item.unit?.id || '' : item.unit || '',
        item.status || ''
      ].join(' ').toLowerCase();
      
      return searchFields.includes(filterText.toLowerCase());
    }
  );

  // Load lease data using reportService
  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {
        start_date: dateFilter.startDate,
        end_date: dateFilter.endDate,
        limit: 1000 // Get more records for comprehensive reporting
      };
      
      const result = await fetchReportData(REPORT_TYPES.LEASE, filters);

      if (result.success) {
        setData(result.data || []);
        
        // Generate report summary
        const summary = generateReportSummary(REPORT_TYPES.LEASE, result.data || []);
        console.log('Lease Report Summary:', summary);
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

  // Apply date filter
  const applyDateFilter = () => {
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
        className="btn btn-sm btn-danger"
      >
        <i className="bi bi-trash me-1"></i>
        Delete Selected
      </button>
    );
  }, [data, selectedRows, toggleCleared]);

  // Handle export using reportService
  const handleExport = async (format) => {
    try {
      const exportData = selectedRows.length > 0 ? selectedRows : filteredItems;
      
      if (exportData.length === 0) {
        showToastMessage('Warning', 'No data available to export', 'warning');
        return;
      }

      const exportFormat = format === 'excel' ? EXPORT_FORMATS.EXCEL : 
                          format === 'pdf' ? EXPORT_FORMATS.PDF : 
                          EXPORT_FORMATS.CSV;

      const result = await exportReportData(REPORT_TYPES.LEASE, exportData, exportFormat);

      if (result.success) {
        showToastMessage('Success', result.message, 'success');
      } else {
        showToastMessage('Error', result.error, 'danger');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToastMessage('Error', 'Failed to export data', 'danger');
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
        <div className="modal-dialog modal-xl">
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
                <div className="d-flex align-items-center justify-content-between p-3">
                  <div className="d-flex align-items-center gap-3">
                    {/* Column selector dropdown */}
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
                    <div className="d-flex gap-2">
                      <button
                        className="odoo-btn odoo-btn-success odoo-btn-sm"
                        onClick={() => handleExport('excel')}
                        disabled={loading}
                      >
                        <i className="bi bi-file-earmark-excel me-1"></i>
                        Excel
                      </button>
                      <button
                        className="odoo-btn odoo-btn-danger odoo-btn-sm"
                        onClick={() => handleExport('pdf')}
                        disabled={loading}
                      >
                        <i className="bi bi-file-earmark-pdf me-1"></i>
                        PDF
                      </button>
                    </div>

                    {/* Date filters */}
                    <div className="d-flex align-items-center gap-2">
                      <label className="form-label mb-0 small">From:</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        style={{ width: '140px' }}
                        value={dateFilter.startDate}
                        onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                        max={dateFilter.endDate}
                      />
                      <label className="form-label mb-0 small">To:</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        style={{ width: '140px' }}
                        value={dateFilter.endDate}
                        onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                        min={dateFilter.startDate}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      <button
                        className="odoo-btn odoo-btn-primary odoo-btn-sm"
                        onClick={applyDateFilter}
                        disabled={loading}
                      >
                        <i className="bi bi-funnel me-1"></i>
                        Apply Filter
                      </button>
                    </div>
                  </div>

                  {/* Search box */}
                  <div className="search-container">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search leases..."
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      style={{ width: '250px' }}
                    />
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
                  fixedHeaderScrollHeight="450px"
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

            <div className="modal-footer">
              <div className="d-flex justify-content-between align-items-center w-100">
                <div className="text-muted small">
                  Showing {filteredItems.length} of {data.length} leases
                  {selectedRows.length > 0 && (
                    <span className="ms-2">
                      | <strong>{selectedRows.length}</strong> selected
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="odoo-btn odoo-btn-secondary"
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