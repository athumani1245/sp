import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';

const PropertyReport = () => {
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
  const [dateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [visibleColumns, setVisibleColumns] = useState({
    property_name: true,
    total_due: true,
    total_paid: true,
    outstanding: true,
    overpaid: true,
    collection_rate: true,
    performance_status: true
  });
  const [columnWidths, setColumnWidths] = useState({
    property_name: 220,
    total_due: 150,
    total_paid: 150,
    outstanding: 150,
    overpaid: 130,
    collection_rate: 140,
    performance_status: 150
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState(null);

  const showToastMessage = useCallback((title, message, variant = 'success') => {
    setToastConfig({ title, message, variant });
    setShowToast(true);
  }, []);

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
      property_name: 'Property Name',
      total_due: 'Total Due',
      total_paid: 'Total Paid',
      outstanding: 'Outstanding',
      overpaid: 'Overpaid',
      collection_rate: 'Collection Rate',
      performance_status: 'Performance Status'
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

  // All available columns definition for property performance
  const getAllColumns = () => {
    return {
      property_name: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Property Name
            <ResizeHandle columnKey="property_name" />
          </div>
        ),
        selector: row => row.unit__property__property_name || 'N/A',
        sortable: true,
        width: `${columnWidths.property_name}px`,
      },
      total_due: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Total Due
            <ResizeHandle columnKey="total_due" />
          </div>
        ),
        selector: row => Number(row.total_due) || 0,
        sortable: true,
        width: `${columnWidths.total_due}px`,
        cell: row => `TSh ${(Number(row.total_due) || 0).toLocaleString()}`,
      },
      total_paid: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Total Paid
            <ResizeHandle columnKey="total_paid" />
          </div>
        ),
        selector: row => Number(row.total_paid) || 0,
        sortable: true,
        width: `${columnWidths.total_paid}px`,
        cell: row => `TSh ${(Number(row.total_paid) || 0).toLocaleString()}`,
      },
      outstanding: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Outstanding
            <ResizeHandle columnKey="outstanding" />
          </div>
        ),
        selector: row => Number(row.outstanding) || 0,
        sortable: true,
        width: `${columnWidths.outstanding}px`,
        cell: row => {
          const amount = Number(row.outstanding) || 0;
          return (
            <span className={`badge bg-${amount > 0 ? 'danger' : 'success'}`}>
              TSh {amount.toLocaleString()}
            </span>
          );
        },
      },
      overpaid: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Overpaid
            <ResizeHandle columnKey="overpaid" />
          </div>
        ),
        selector: row => Number(row.overpaid) || 0,
        sortable: true,
        width: `${columnWidths.overpaid}px`,
        cell: row => {
          const amount = Number(row.overpaid) || 0;
          return (
            <span className={`badge bg-${amount > 0 ? 'info' : 'secondary'}`}>
              TSh {amount.toLocaleString()}
            </span>
          );
        },
      },
      collection_rate: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Collection Rate
            <ResizeHandle columnKey="collection_rate" />
          </div>
        ),
        selector: row => {
          const totalDue = Number(row.total_due) || 0;
          const totalPaid = Number(row.total_paid) || 0;
          return totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
        },
        sortable: true,
        width: `${columnWidths.collection_rate}px`,
        center: true,
        cell: row => {
          const totalDue = Number(row.total_due) || 0;
          const totalPaid = Number(row.total_paid) || 0;
          const rate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
          return (
            <span className={`badge bg-${rate >= 95 ? 'success' : rate >= 85 ? 'warning' : 'danger'}`}>
              {rate}%
            </span>
          );
        },
      },
      performance_status: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Performance
            <ResizeHandle columnKey="performance_status" />
          </div>
        ),
        selector: row => {
          const totalDue = Number(row.total_due) || 0;
          const totalPaid = Number(row.total_paid) || 0;
          const rate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
          return rate >= 95 ? 'Excellent' : rate >= 85 ? 'Good' : rate >= 70 ? 'Fair' : 'Poor';
        },
        sortable: true,
        width: `${columnWidths.performance_status}px`,
        center: true,
        cell: row => {
          const totalDue = Number(row.total_due) || 0;
          const totalPaid = Number(row.total_paid) || 0;
          const rate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
          const status = rate >= 95 ? 'Excellent' : rate >= 85 ? 'Good' : rate >= 70 ? 'Fair' : 'Poor';
          const badgeColor = rate >= 95 ? 'success' : rate >= 85 ? 'primary' : rate >= 70 ? 'warning' : 'danger';
          return (
            <span className={`badge bg-${badgeColor}`}>
              {status}
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

  // Filter data based on search text
  const filteredItems = data.filter(
    item => {
      const searchFields = [
        item.unit__property__property_name
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

  // Import and use the reportService function for property performance
  const fetchPropertyPerformanceData = async (filters = {}) => {
    try {
      const { fetchPropertyPerformance } = await import('../../services/reportService');
      
      console.log('PropertyReport: Calling fetchPropertyPerformance with filters:', filters);
      
      const result = await fetchPropertyPerformance(filters);
      
      console.log('PropertyReport: Full API response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch property performance data');
      }

      const dataItems = result.data || [];

      console.log('PropertyReport: Processing', dataItems.length, 'property performance items');

      return {
        success: true,
        data: dataItems,
        total: dataItems.length
      };
    } catch (error) {
      console.error('Error fetching property performance data:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch property performance data',
        data: []
      };
    }
  };

  // Load property performance data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('PropertyReport: Starting property performance data load with date filter:', dateFilter);
      
      const filters = {};
      if (dateFilter.startDate) filters.start_date = dateFilter.startDate;
      if (dateFilter.endDate) filters.end_date = dateFilter.endDate;
      filters.limit = 1000; // Set reasonable limit
      
      console.log('PropertyReport: Filters being sent:', filters);
      
      const result = await fetchPropertyPerformanceData(filters);
      
      console.log('PropertyReport: Load result:', result);
      
      if (result.success) {
        console.log('PropertyReport: Setting property performance data:', result.data);
        setData(result.data);
        showToastMessage('Success', `Loaded ${result.data.length} property performance records`, 'success');
      } else {
        console.error('PropertyReport Load Error:', result.error);
        showToastMessage('Error', result.error, 'danger');
        setData([]);
      }
    } catch (error) {
      console.error('PropertyReport: Load error:', error);
      showToastMessage('Error', 'Failed to load property performance data', 'danger');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, showToastMessage]);

  // Export functionality
  const handleExport = async (format) => {
    try {
      const exportData = selectedRows.length > 0 ? selectedRows : filteredItems;
      
      if (exportData.length === 0) {
        showToastMessage('Warning', 'No data available to export', 'warning');
        return;
      }

      console.log('PropertyReport: Starting export for format:', format);
      console.log('PropertyReport: Export data sample:', exportData?.[0]);
      console.log('PropertyReport: Export data length:', exportData?.length);

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

      console.log('PropertyReport: Export options:', exportOptions);

      // Call the export function for property performance
      const result = await exportReportData(
        REPORT_TYPES.PROPERTY_PERFORMANCE,
        exportData,
        exportFormat,
        exportOptions
      );

      console.log('PropertyReport: Export result:', result);

      if (result.success) {
        showToastMessage('Success', result.message, 'success');
      } else {
        showToastMessage('Error', result.error || 'Export failed', 'danger');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToastMessage('Error', 'Failed to export data', 'danger');
    }
  };

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, [loadData]);

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
                <i className="bi bi-graph-up me-2"></i>
                Property Performance Report
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
                onClick={() => setFilterText('')}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Reset Filter
              </button>
            </div>

            {/* Search box */}
            <div className="col">
              <div className="search-container">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search property performance..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  style={{ maxWidth: '300px' }}
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
                <i className="bi bi-graph-up display-4 text-muted"></i>
                <h5 className="text-muted mt-3">No property performance data available</h5>
                <p className="text-muted">No property performance records found matching your criteria.</p>
              </div>
            }
            progressComponent={
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Loading property performance data...</p>
              </div>
            }
          />
        </div>

        {/* Summary Footer */}
        <div className="leases-filters-section">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Showing {filteredItems.length} of {data.length} property performance records
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

export default PropertyReport;