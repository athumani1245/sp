import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';

const PropertySummaryReport = () => {
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
  const [visibleColumns, setVisibleColumns] = useState({
    property_name: true,
    property_type: true,
    location: true,
    landlord: true,
    total_units: true,
    occupied_units: true,
    available_units: true,
    occupancy_rate: true
  });
  const [columnWidths, setColumnWidths] = useState({
    property_name: 220,
    property_type: 130,
    location: 200,
    landlord: 250,
    total_units: 100,
    occupied_units: 120,
    available_units: 120,
    occupancy_rate: 140
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const showToastMessage = (title, message, variant = 'success') => {
    setToastConfig({ title, message, variant });
    setShowToast(true);
  };

  // Import and use the reportService function
  const fetchPropertySummaryData = async (filters = {}) => {
    try {
      const { fetchPropertySummary } = await import('../../services/reportService');
      
      console.log('PropertySummaryReport: Calling reportService with filters:', filters);
      
      const result = await fetchPropertySummary(filters);
      
      console.log('PropertySummaryReport: Full API response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch property summary');
      }

      const dataItems = result.data || [];

      // Process the data to match the new API response structure
      const processedData = dataItems.map(property => {
        const totalUnits = parseInt(property.total_units_count) || 0;
        const occupiedUnits = parseInt(property.occupied_unit_count) || 0;
        const vacantUnits = parseInt(property.vacant_until_count) || 0;
        const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

        console.log('Processing property:', property.property_name);
        console.log('Units - Total:', totalUnits, 'Occupied:', occupiedUnits, 'Vacant:', vacantUnits);
        console.log('Occupancy Rate:', occupancyRate + '%');

        return {
          ...property,
          total_units: totalUnits,
          occupied_units: occupiedUnits,
          available_units: vacantUnits,
          occupancy_rate: occupancyRate,
          location: [property.ward, property.property_district, property.property_region]
            .filter(item => item && item.trim() !== '')
            .join(', ') || 'N/A'
        };
      });

      return {
        success: true,
        data: processedData,
        total: processedData.length
      };
    } catch (error) {
      console.error('Error fetching property summary:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch property summary',
        data: []
      };
    }
  };

  // Load property summary data
  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {
        start_date: dateFilter.startDate,
        end_date: dateFilter.endDate
      };
      
      const result = await fetchPropertySummaryData(filters);

      if (result.success) {
        console.log('PropertySummaryReport: Received data:', result.data);
        console.log('PropertySummaryReport: Data length:', result.data?.length);
        console.log('PropertySummaryReport: First item sample:', result.data?.[0]);
        
        setData(result.data || []);
        
        // Generate summary stats
        const totalProperties = result.data?.length || 0;
        const totalUnits = result.data?.reduce((sum, prop) => sum + (prop.total_units || 0), 0) || 0;
        const totalOccupied = result.data?.reduce((sum, prop) => sum + (prop.occupied_units || 0), 0) || 0;
        const totalVacant = result.data?.reduce((sum, prop) => sum + (prop.available_units || 0), 0) || 0;
        const overallOccupancyRate = totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0;
        
        console.log('Property Summary Stats:', {
          totalProperties,
          totalUnits,
          totalOccupied,
          totalVacant,
          overallOccupancyRate
        });
      } else {
        showToastMessage('Error', result.error || 'Failed to load property summary data', 'danger');
      }
    } catch (error) {
      console.error('Error loading property summary data:', error);
      showToastMessage('Error', 'Failed to load property summary data', 'danger');
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
    Object.keys(visibleColumns).forEach(key => {
      newVisibility[key] = visible;
    });
    setVisibleColumns(newVisibility);
  };

  // Get column display names
  const getColumnDisplayName = (key) => {
    const displayNames = {
      property_name: 'Property Name',
      property_type: 'Property Type',
      location: 'Location',
      landlord: 'Landlord',
      total_units: 'Total Units',
      occupied_units: 'Occupied Units',
      available_units: 'Vacant Units',
      occupancy_rate: 'Occupancy Rate'
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
      const newWidth = Math.max(50, startWidth + diffX);
      
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

  // Resize handle component
  const ResizeHandle = ({ columnKey }) => (
    <div
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: '8px',
        cursor: 'col-resize',
        backgroundColor: isResizing && resizingColumn === columnKey ? '#007bff' : 'transparent',
        zIndex: 1000
      }}
      onMouseDown={(e) => handleMouseDown(e, columnKey)}
    />
  );

  // All available columns definition
  const getAllColumns = () => {
    return {
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
        cell: row => (
          <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
            {row.property_name || 'N/A'}
          </div>
        ),
      },
      property_type: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Property Type
            <ResizeHandle columnKey="property_type" />
          </div>
        ),
        selector: row => row.property_type || 'N/A',
        sortable: true,
        width: `${columnWidths.property_type}px`,
        cell: row => (
          <span className={`badge bg-${
            row.property_type === 'Apartment' ? 'info' :
            row.property_type === 'Standalone' ? 'success' :
            row.property_type === 'Residential' ? 'primary' : 'secondary'
          }`}>
            {row.property_type || 'N/A'}
          </span>
        ),
      },
      location: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Location
            <ResizeHandle columnKey="location" />
          </div>
        ),
        selector: row => row.location || 'N/A',
        sortable: true,
        width: `${columnWidths.location}px`,
      },
      landlord: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Landlord
            <ResizeHandle columnKey="landlord" />
          </div>
        ),
        selector: row => row.landlord || 'N/A',
        sortable: true,
        width: `${columnWidths.landlord}px`,
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
        center: true,
        cell: row => (
          <span className="badge bg-primary">
            {row.total_units || 0}
          </span>
        ),
      },
      occupied_units: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Occupied
            <ResizeHandle columnKey="occupied_units" />
          </div>
        ),
        selector: row => row.occupied_units || 0,
        sortable: true,
        width: `${columnWidths.occupied_units}px`,
        center: true,
        cell: row => (
          <span className="badge bg-success">
            {row.occupied_units || 0}
          </span>
        ),
      },
      available_units: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Vacant
            <ResizeHandle columnKey="available_units" />
          </div>
        ),
        selector: row => row.available_units || 0,
        sortable: true,
        width: `${columnWidths.available_units}px`,
        center: true,
        cell: row => (
          <span className="badge bg-warning">
            {row.available_units || 0}
          </span>
        ),
      },
      occupancy_rate: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Occupancy Rate
            <ResizeHandle columnKey="occupancy_rate" />
          </div>
        ),
        selector: row => row.occupancy_rate || 0,
        sortable: true,
        width: `${columnWidths.occupancy_rate}px`,
        center: true,
        cell: row => {
          const rate = row.occupancy_rate || 0;
          const badgeClass = rate >= 80 ? 'success' : 
                           rate >= 60 ? 'info' :
                           rate >= 40 ? 'warning' : 
                           rate > 0 ? 'danger' : 'secondary';
          return (
            <span className={`badge bg-${badgeClass}`}>
              {rate}%
            </span>
          );
        },
      }
    };
  };

  const allColumns = getAllColumns();

  // Filter data based on search text
  const filteredItems = data.filter(
    item => {
      const searchFields = [
        item.property_name,
        item.property_type,
        item.location,
        item.landlord
      ].join(' ').toLowerCase();
      
      return searchFields.includes(filterText.toLowerCase());
    }
  );

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
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#495057',
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
    rows: {
      style: {
        minHeight: '45px',
        '&:hover': {
          backgroundColor: '#f5f5f5',
          cursor: 'pointer',
        },
      },
    },
    cells: {
      style: {
        fontSize: '13px',
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
  };

  // Row selection handlers
  const handleRowSelected = React.useCallback(state => {
    setSelectedRows(state.selectedRows);
  }, []);

  const contextActions = React.useMemo(() => {
    const handleDelete = () => {
      setToggleCleared(!toggleCleared);
      setSelectedRows([]);
    };

    return (
      <button
        key="delete"
        onClick={handleDelete}
        className="btn btn-sm btn-danger"
        disabled={!selectedRows.length}
      >
        Clear Selection ({selectedRows.length})
      </button>
    );
  }, [selectedRows, toggleCleared]);

  // Export functionality
  const handleExport = async (format) => {
    try {
      const exportData = selectedRows.length > 0 ? selectedRows : filteredItems;
      
      if (exportData.length === 0) {
        showToastMessage('Warning', 'No data available to export', 'warning');
        return;
      }

      console.log('PropertySummaryReport: Starting export for format:', format);
      console.log('PropertySummaryReport: Export data sample:', exportData?.[0]);
      console.log('PropertySummaryReport: Export data length:', exportData?.length);

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

      console.log('PropertySummaryReport: Export options:', exportOptions);

      // Call the export function
      const result = await exportReportData(
        REPORT_TYPES.PROPERTY_SUMMARY,
        exportData,
        exportFormat,
        exportOptions
      );

      console.log('PropertySummaryReport: Export result:', result);

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

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  return (
    <Layout>
      <div className="main-content">
        {/* Header */}
        <div className="leases-filters-section">
          <div className="row g-3 align-items-center">
            <div className="col-8">
              <h4 className="mb-1">
                <i className="bi bi-building me-2"></i>
                Property Summary Report
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
                  <i className="bi bi-file-earmark-spreadsheet me-1"></i>
                  Excel
                </button>
                <button
                  className="odoo-btn odoo-btn-danger odoo-btn-sm me-2"
                  onClick={() => handleExport('pdf')}
                  disabled={loading}
                >
                  <i className="bi bi-file-earmark-pdf me-1"></i>
                  PDF
                </button>
              </div>
            </div>

            {/* Column selector */}
            <div className="col-auto">
              <div className="dropdown">
                <button
                  className="odoo-btn odoo-btn-secondary odoo-btn-sm dropdown-toggle"
                  type="button"
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                >
                  <i className="bi bi-columns me-1"></i>
                  Columns ({Object.values(visibleColumns).filter(Boolean).length})
                </button>
                {showColumnSelector && (
                  <div className="dropdown-menu show p-3" style={{ minWidth: '300px' }}>
                    <h6 className="dropdown-header">Visible Columns</h6>
                    <div className="mb-2">
                      <button
                        className="odoo-btn odoo-btn-danger odoo-btn-sm me-2"
                        onClick={() => toggleAllColumns(true)}
                      >
                        Select All
                      </button>
                      <button
                        className="odoo-btn odoo-btn-success odoo-btn-sm me-2"
                        onClick={() => toggleAllColumns(false)}
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="row">
                      {Object.keys(allColumns).map(columnKey => (
                        <div key={columnKey} className="col-6 mb-2">
                          <div className="form-check">
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
                  placeholder="Search properties..."
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

        {/* Summary Footer */}
        <div className="leases-filters-section">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              Showing {filteredItems.length} of {data.length} properties
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

export default PropertySummaryReport;