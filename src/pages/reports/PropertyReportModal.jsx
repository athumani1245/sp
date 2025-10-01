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

const PropertyReportModal = ({ show, onHide, reportConfig, dateFilter = {} }) => {
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
    property_name: true,
    location: true,
    property_type: true,
    total_units: true,
    occupied_units: true,
    occupancy_rate: true,
    total_rent: true,
    status: true
  });
  const [columnWidths, setColumnWidths] = useState({
    property_name: 200,
    location: 180,
    property_type: 120,
    total_units: 100,
    occupied_units: 120,
    occupancy_rate: 130,
    total_rent: 150,
    status: 100
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState(null);

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
      property_name: 'Property Name',
      location: 'Location',
      property_type: 'Property Type', 
      total_units: 'Total Units',
      occupied_units: 'Occupied Units',
      occupancy_rate: 'Occupancy Rate',
      total_rent: 'Total Rent',
      status: 'Status'
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
    property_name: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Property Name
          <ResizeHandle columnKey="property_name" />
        </div>
      ),
      selector: row => row.property_name || 'N/A',
      sortable: true,
      width: `${columnWidths.property_name}px`,
    },
    location: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Location
          <ResizeHandle columnKey="location" />
        </div>
      ),
      selector: row => `${row.location || ''} ${row.area || ''}`.trim() || 'N/A',
      sortable: true,
      width: `${columnWidths.location}px`,
    },
    property_type: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Type
          <ResizeHandle columnKey="property_type" />
        </div>
      ),
      selector: row => row.property_type || 'N/A',
      sortable: true,
      width: `${columnWidths.property_type}px`,
    },
    total_units: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Total Units
          <ResizeHandle columnKey="total_units" />
        </div>
      ),
      selector: row => row.total_units || 0,
      sortable: true,
      width: `${columnWidths.total_units}px`,
    },
    occupied_units: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Occupied Units
          <ResizeHandle columnKey="occupied_units" />
        </div>
      ),
      selector: row => row.occupied_units || 0,
      sortable: true,
      width: `${columnWidths.occupied_units}px`,
    },
    occupancy_rate: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Occupancy Rate
          <ResizeHandle columnKey="occupancy_rate" />
        </div>
      ),
      selector: row => row.total_units ? Math.round((row.occupied_units || 0) / row.total_units * 100) : 0,
      sortable: true,
      width: `${columnWidths.occupancy_rate}px`,
      cell: row => {
        const rate = row.total_units ? Math.round((row.occupied_units || 0) / row.total_units * 100) : 0;
        return (
          <span className={`badge bg-${rate >= 80 ? 'success' : rate >= 50 ? 'warning' : 'danger'}`}>
            {rate}%
          </span>
        );
      },
    },
    total_rent: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Monthly Revenue
          <ResizeHandle columnKey="total_rent" />
        </div>
      ),
      selector: row => `TSh ${(row.monthly_revenue || 0).toLocaleString()}`,
      sortable: true,
      width: `${columnWidths.total_rent}px`,
    },
    status: {
      name: (
        <div style={{ position: 'relative', paddingRight: '8px' }}>
          Status
          <ResizeHandle columnKey="status" />
        </div>
      ),
      selector: row => row.status || 'Unknown',
      sortable: true,
      width: `${columnWidths.status}px`,
      cell: row => (
        <span className={`badge bg-${row.status === 'active' ? 'success' : 'secondary'}`}>
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
        item.property_name,
        item.location,
        item.area,
        item.property_type,
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

      const result = await exportReportData(REPORT_TYPES.PROPERTY, exportData, exportFormat);

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



  // Load property data using reportService
  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {
        start_date: dateFilter.startDate,
        end_date: dateFilter.endDate,
        limit: 1000 // Get more records for comprehensive reporting
      };
      
      const result = await fetchReportData(REPORT_TYPES.PROPERTY, filters);

      if (result.success) {
        setData(result.data || []);
        
        // Generate report summary
        const summary = generateReportSummary(REPORT_TYPES.PROPERTY, result.data || []);
        console.log('Property Report Summary:', summary);
      } else {
        showToastMessage('Error', result.error || 'Failed to load property data', 'danger');
      }
    } catch (error) {
      console.error('Error loading property data:', error);
      showToastMessage('Error', 'Failed to load property data', 'danger');
    } finally {
      setLoading(false);
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
                      placeholder="Search properties..."
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
                      <i className="bi bi-building display-4 text-muted"></i>
                      <h5 className="text-muted mt-3">No property data available</h5>
                      <p className="text-muted">No properties found matching your criteria.</p>
                    </div>
                  }
                  progressComponent={
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted mt-2">Loading property data...</p>
                    </div>
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <div className="d-flex justify-content-between align-items-center w-100">
                <div className="text-muted small">
                  Showing {filteredItems.length} of {data.length} properties
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

export default PropertyReportModal;