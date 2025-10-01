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

const TenantReportModal = ({ show, onHide, reportConfig, dateFilter = {} }) => {
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
    name: true,
    email: true,
    phone: true,
    property: true,
    unit: true,
    outstanding_balance: true,
    lease_status: true,
    move_in_date: true
  });
  const [columnWidths, setColumnWidths] = useState({
    name: 180,
    email: 200,
    phone: 130,
    property: 180,
    unit: 100,
    outstanding_balance: 150,
    lease_status: 120,
    move_in_date: 120
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState(null);

  const showToastMessage = (title, message, variant = 'success') => {
    setToastConfig({ title, message, variant });
    setShowToast(true);
  };

  // Load tenant data using reportService
  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {
        start_date: dateFilter.startDate,
        end_date: dateFilter.endDate,
        limit: 1000 // Get more records for comprehensive reporting
      };
      
      const result = await fetchReportData(REPORT_TYPES.TENANT, filters);

      if (result.success) {
        setData(result.data || []);
        
        // Generate report summary
        const summary = generateReportSummary(REPORT_TYPES.TENANT, result.data || []);
        console.log('Tenant Report Summary:', summary);
      } else {
        showToastMessage('Error', result.error || 'Failed to load tenant data', 'danger');
      }
    } catch (error) {
      console.error('Error loading tenant data:', error);
      showToastMessage('Error', 'Failed to load tenant data', 'danger');
    } finally {
      setLoading(false);
    }
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
      name: 'Tenant Name',
      email: 'Email Address',
      phone: 'Phone Number',
      property: 'Property',
      unit: 'Unit',
      outstanding_balance: 'Outstanding Balance',
      lease_status: 'Lease Status',
      move_in_date: 'Move-in Date'
    };
    return displayNames[key] || key.replace('_', ' ').toUpperCase();
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

  // All available columns definition
  const allColumns = {
    name: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Tenant Name
          <ResizeHandle columnKey="name" />
        </div>
      ),
      selector: row => `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'N/A',
      sortable: true,
      width: `${columnWidths.name}px`,
    },
    email: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Email
          <ResizeHandle columnKey="email" />
        </div>
      ),
      selector: row => row.email || 'N/A',
      sortable: true,
      width: `${columnWidths.email}px`,
    },
    phone: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Phone
          <ResizeHandle columnKey="phone" />
        </div>
      ),
      selector: row => row.phone_number || row.phone || 'N/A',
      sortable: true,
      width: `${columnWidths.phone}px`,
    },
    property: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Property
          <ResizeHandle columnKey="property" />
        </div>
      ),
      selector: row => {
        if (typeof row.property === 'object' && row.property !== null) {
          return row.property.property_name || row.property.name || 'N/A';
        }
        return row.property || 'N/A';
      },
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
      selector: row => {
        if (typeof row.unit === 'object' && row.unit !== null) {
          return row.unit.unit_name || row.unit.number || row.unit.id || 'N/A';
        }
        return row.unit || 'N/A';
      },
      sortable: true,
      width: `${columnWidths.unit}px`,
    },
    outstanding_balance: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Outstanding Balance
          <ResizeHandle columnKey="outstanding_balance" />
        </div>
      ),
      selector: row => row.outstanding_balance || row.balance || 0,
      sortable: true,
      width: `${columnWidths.outstanding_balance}px`,
      cell: row => {
        const balance = row.outstanding_balance || row.balance || 0;
        return (
          <span className={`badge bg-${balance > 0 ? 'danger' : 'success'}`}>
            TSh {Number(balance).toLocaleString()}
          </span>
        );
      },
    },
    lease_status: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Status
          <ResizeHandle columnKey="lease_status" />
        </div>
      ),
      selector: row => row.lease_status || row.status || 'Unknown',
      sortable: true,
      width: `${columnWidths.lease_status}px`,
      cell: row => {
        const status = row.lease_status || row.status || 'Unknown';
        return (
          <span className={`badge bg-${status === 'active' ? 'success' : status === 'inactive' ? 'secondary' : 'warning'}`}>
            {status}
          </span>
        );
      },
    },
    move_in_date: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Move-in Date
          <ResizeHandle columnKey="move_in_date" />
        </div>
      ),
      selector: row => row.move_in_date ? new Date(row.move_in_date).toLocaleDateString() : 'N/A',
      sortable: true,
      width: `${columnWidths.move_in_date}px`,
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

  // Filter data based on search text
  const filteredItems = data.filter(
    item => {
      const searchFields = [
        item.first_name,
        item.last_name,
        item.email,
        item.phone_number,
        item.phone,
        typeof item.property === 'object' ? item.property?.property_name : item.property,
        typeof item.unit === 'object' ? item.unit?.unit_name : item.unit,
        item.lease_status,
        item.status
      ].join(' ').toLowerCase();
      
      return searchFields.includes(filterText.toLowerCase());
    }
  );

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

      const result = await exportReportData(REPORT_TYPES.TENANT, exportData, exportFormat);

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

  // Load data when component mounts
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
      setIsResizing(false);
      setResizingColumn(null);
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

                    {/* Filter buttons */}
                    <div className="d-flex gap-2">
                      <button
                        className="odoo-btn odoo-btn-secondary odoo-btn-sm"
                        onClick={() => setFilterText('')}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Reset Filter
                      </button>
                    </div>
                  </div>

                  {/* Search box */}
                  <div className="search-container">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search tenants..."
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
                      <i className="bi bi-people display-4 text-muted"></i>
                      <h5 className="text-muted mt-3">No tenant data available</h5>
                      <p className="text-muted">No tenants found matching your criteria.</p>
                    </div>
                  }
                  progressComponent={
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted mt-2">Loading tenant data...</p>
                    </div>
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <div className="d-flex justify-content-between align-items-center w-100">
                <div className="text-muted small">
                  Showing {filteredItems.length} of {data.length} tenants
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

export default TenantReportModal;