import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import Layout from '../../components/Layout';
import Toast from '../../components/Toast';
import { usePageTitle } from '../../hooks/usePageTitle';

const TenantPaymentHistoryReport = () => {
  usePageTitle('Tenant Payment History Report');
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [groupBy, setGroupBy] = useState('none');
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({});
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    tenant: true,
    lease_number: true,
    amount: true,
    payment_date: true,
    category: true,
    payment_source: true
  });
  const [columnWidths, setColumnWidths] = useState({
    tenant: 200,
    lease_number: 180,
    amount: 150,
    payment_date: 140,
    category: 130,
    payment_source: 150
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

  // Handle date filter changes
  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Apply date filter and reload data
  const applyDateFilter = () => {
    loadData();
  };

  // Reset date filter
  const resetDateFilter = () => {
    setDateFilter({
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    });
  };

  // Import and use the reportService function
  const fetchTenantPaymentHistoryData = async (filters = {}) => {
    try {
      const { fetchTenantPaymentHistory } = await import('../../services/reportService');
      
      const result = await fetchTenantPaymentHistory(filters);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch tenant payment history');
      }

      return {
        success: true,
        data: result.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch tenant payment history',
        data: []
      };
    }
  };

  // Load tenant payment history data
  const loadData = async () => {
    setLoading(true);
    try {
      const filters = {
        start_date: dateFilter.startDate,
        end_date: dateFilter.endDate
      };
      
      const result = await fetchTenantPaymentHistoryData(filters);

      if (result.success) {
        setData(result.data || []);
        
        // Generate summary stats
        const totalPayments = result.data?.length || 0;
        const totalAmount = result.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
        const rentPayments = result.data?.filter(payment => payment.category === 'RENT').length || 0;
        const otherPayments = totalPayments - rentPayments;
      } else {
        showToastMessage('Error', result.error || 'Failed to load tenant payment history', 'danger');
      }
    } catch (error) {
      showToastMessage('Error', 'Failed to load tenant payment history', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Handle export functionality
  const handleExport = async (format) => {
    try {
      const { exportTenantPaymentHistory } = await import('../../services/reportService');
      
      const filters = {
        start_date: dateFilter.startDate,
        end_date: dateFilter.endDate
      };

      const result = await exportTenantPaymentHistory(filters, format);
      
      if (result.success) {
        showToastMessage('Success', `Tenant Payment History exported successfully as ${format.toUpperCase()}`, 'success');
      } else {
        showToastMessage('Error', result.error || `Failed to export as ${format}`, 'danger');
      }
    } catch (error) {
      showToastMessage('Error', `Failed to export as ${format}: ${error.message}`, 'danger');
    }
  };

  // Handle row selection
  const handleRowSelected = ({ selectedRows }) => {
    setSelectedRows(selectedRows);
  };

  // Handle clear all selections
  const handleClearRows = () => {
    setToggleCleared(!toggleCleared);
    setSelectedRows([]);
  };

  // Context actions for selected rows
  const contextActions = (
    <button
      key="delete"
      onClick={handleClearRows}
      className="btn btn-sm btn-outline-danger"
    >
      Clear Selection
    </button>
  );

  // Mouse down handler for column resizing
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

  // Format currency helper
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'TSh 0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'TSh 0';
    return `TSh ${numAmount.toLocaleString()}`;
  };

  // Get column display names
  const getColumnDisplayName = (key) => {
    const displayNames = {
      tenant: 'Tenant Name',
      lease_number: 'Lease Number',
      amount: 'Amount',
      payment_date: 'Payment Date',
      category: 'Category',
      payment_source: 'Payment Source'
    };
    return displayNames[key] || key.replace('_', ' ').toUpperCase();
  };

  // Get all columns configuration
  const getAllColumns = () => {
    return {
      tenant: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Tenant Name
            <ResizeHandle columnKey="tenant" />
          </div>
        ),
        selector: row => row.tenant || 'N/A',
        sortable: true,
        width: `${columnWidths.tenant}px`,
        cell: row => {
          if (row.isGroupHeader) {
            return (
              <div style={{ 
                fontWeight: 'bold', 
                color: '#007bff', 
                fontSize: '14px',
                padding: '8px 0',
                borderBottom: '2px solid #e9ecef',
                backgroundColor: '#f8f9fa'
              }}>
                <i className="bi bi-folder me-2"></i>
                {row.groupKey} ({row.groupCount} payments)
                <span style={{ float: 'right', color: '#28a745' }}>
                  Total: {formatCurrency(Math.abs(row.groupTotal))}
                </span>
              </div>
            );
          }
          return (
            <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
              {row.tenant || 'N/A'}
            </div>
          );
        },
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
        cell: row => {
          if (row.isGroupHeader) {
            return <div></div>;
          }
          return (
            <div>
              {row.lease_number || 'N/A'}
            </div>
          );
        },
      },
      amount: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Amount
            <ResizeHandle columnKey="amount" />
          </div>
        ),
        selector: row => row.amount || 0,
        sortable: true,
        width: `${columnWidths.amount}px`,
        right: true,
        cell: row => {
          if (row.isGroupHeader) {
            return <div></div>;
          }
          const amount = row.amount || 0;
          const isNegative = amount < 0;
          return (
            <div style={{ textAlign: 'right' }}>
              {formatCurrency(Math.abs(amount))}
              {isNegative && ' (Refund)'}
            </div>
          );
        },
      },
      payment_date: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Payment Date
            <ResizeHandle columnKey="payment_date" />
          </div>
        ),
        selector: row => row.payment_date || '',
        sortable: true,
        width: `${columnWidths.payment_date}px`,
        cell: row => {
          if (row.isGroupHeader) {
            return <div></div>;
          }
          return (
            <span className={row.payment_date ? 'text-dark' : 'text-muted'}>
              {row.payment_date_formatted || row.payment_date || 'N/A'}
            </span>
          );
        },
      },
      category: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Category
            <ResizeHandle columnKey="category" />
          </div>
        ),
        selector: row => row.category || 'N/A',
        sortable: true,
        width: `${columnWidths.category}px`,
        cell: row => {
          if (row.isGroupHeader) {
            return <div></div>;
          }
          return (
            <div>
              {row.category || 'N/A'}
            </div>
          );
        },
      },
      payment_source: {
        name: (
          <div style={{ position: 'relative', paddingRight: '8px' }}>
            Payment Source
            <ResizeHandle columnKey="payment_source" />
          </div>
        ),
        selector: row => row.payment_source_display || row.payment_source,
        sortable: true,
        width: `${columnWidths.payment_source}px`,
        cell: row => {
          if (row.isGroupHeader) {
            return <div></div>;
          }
          return (
            <div>
              {row.payment_source_display || row.payment_source || 'N/A'}
            </div>
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
        item.tenant,
        item.lease_number,
        item.category,
        item.payment_source,
        item.amount?.toString()
      ].join(' ').toLowerCase();
      
      return searchFields.includes(filterText.toLowerCase());
    }
  );

  // Group data based on selected groupBy option
  const getGroupedData = () => {
    if (groupBy === 'none') {
      return filteredItems;
    }

    const grouped = {};
    
    filteredItems.forEach(item => {
      let groupKey;
      switch (groupBy) {
        case 'tenant':
          groupKey = item.tenant || 'Unknown Tenant';
          break;
        case 'lease_number':
          groupKey = item.lease_number || 'No Lease Number';
          break;
        case 'category':
          groupKey = item.category || 'Uncategorized';
          break;
        default:
          groupKey = 'All';
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(item);
    });

    // Convert to array with group headers
    const result = [];
    Object.keys(grouped).sort().forEach(groupKey => {
      // Add group header row
      result.push({
        isGroupHeader: true,
        groupKey,
        groupCount: grouped[groupKey].length,
        groupTotal: grouped[groupKey].reduce((sum, item) => sum + (item.amount || 0), 0)
      });
      
      // Add group items
      result.push(...grouped[groupKey]);
    });

    return result;
  };

  const displayData = getGroupedData();

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
        borderTopColor: '#e3e6ea',
        backgroundColor: '#f8f9fa',
      },
    },
    headCells: {
      style: {
        '&:not(:last-of-type)': {
          borderRightStyle: 'solid',
          borderRightWidth: '1px',
          borderRightColor: '#e3e6ea',
        },
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#495057',
      },
    },
    cells: {
      style: {
        '&:not(:last-of-type)': {
          borderRightStyle: 'solid',
          borderRightWidth: '1px',
          borderRightColor: '#e3e6ea',
        },
        fontSize: '12px',
        padding: '8px',
      },
    },
    rows: {
      style: {
        '&:hover': {
          backgroundColor: '#f8f9fa',
        },
      },
    },
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
                <i className="bi bi-credit-card me-2"></i>
                Tenant Payment History Report
              </h4>
            </div>
            <div className="col-4">
              <div className="d-flex justify-content-end">
                <button
                  className="odoo-btn odoo-btn-secondary odoo-btn-sm"
                  onClick={() => navigate("/dashboard")}
                >
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="leases-filters-section">
          <div className="row g-2 mb-3">
            {/* First row - Export and action buttons */}
            <div className="col-12">
              <div className="d-flex flex-wrap align-items-center gap-2">
                {/* Export buttons */}
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className="odoo-btn odoo-btn-success odoo-btn-sm me-1"
                    onClick={() => handleExport('excel')}
                    disabled={loading}
                  >
                    <i className="bi bi-file-earmark-excel me-1"></i>
                    Excel
                  </button>
                  <button
                    type="button"
                    className="odoo-btn odoo-btn-danger odoo-btn-sm me-1"
                    onClick={() => handleExport('pdf')}
                    disabled={loading}
                  >
                    <i className="bi bi-file-earmark-pdf me-1"></i>
                    PDF
                  </button>
                </div>

                {/* Date Filter */}
                <div className="d-flex align-items-center gap-1">
                  <span className="text-muted small">
                    <i className="bi bi-calendar-range me-1"></i>
                    From:
                  </span>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    style={{ width: '140px' }}
                    value={dateFilter.startDate}
                    onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                  />
                  <span className="text-muted small">To:</span>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    style={{ width: '140px' }}
                    value={dateFilter.endDate}
                    onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                  />
                  <button
                    type="button"
                    className="odoo-btn odoo-btn-outline-primary odoo-btn-sm"
                    onClick={applyDateFilter}
                    disabled={loading}
                  >
                    <i className="bi bi-search me-1"></i>
                    <span className="d-none d-lg-inline">Apply</span>
                  </button>
                </div>

                {/* Group by dropdown */}
                <div className="btn-group" style={{ width: '180px', minWidth: '160px' }}>
                  <span className="input-group-text bg-light border-end-0" style={{ fontSize: '12px' }}>
                    <i className="bi bi-collection me-1"></i>
                    Group
                  </span>
                  <select
                    className="form-select form-select-sm border-start-0"
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="tenant">Tenant</option>
                    <option value="lease_number">Lease</option>
                    <option value="category">Category</option>
                  </select>
                </div>

                {/* Column selector */}
                <div className="dropdown">
                  <button
                    className="odoo-btn odoo-btn-outline-danger odoo-btn-sm dropdown-toggle"
                    type="button"
                    onClick={() => setShowColumnSelector(!showColumnSelector)}
                  >
                    <i className="bi bi-columns-gap me-1"></i>
                    <span className="d-none d-sm-inline">Columns</span>
                  </button>
                  {showColumnSelector && (
                    <div className="dropdown-menu show p-3" style={{ minWidth: '250px', zIndex: 1050 }}>
                      <h6 className="dropdown-header">Show/Hide Columns</h6>
                      {Object.keys(visibleColumns).map(columnKey => (
                        <div key={columnKey} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`column-${columnKey}`}
                            checked={visibleColumns[columnKey]}
                            onChange={(e) => setVisibleColumns(prev => ({
                              ...prev,
                              [columnKey]: e.target.checked
                            }))}
                          />
                          <label className="form-check-label" htmlFor={`column-${columnKey}`}>
                            {getColumnDisplayName(columnKey)}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reset button */}
                <button
                  className="odoo-btn odoo-btn-secondary odoo-btn-sm"
                  onClick={() => {
                    setFilterText('');
                    setGroupBy('none');
                    resetDateFilter();
                    loadData();
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  <span className="d-none d-md-inline">Reset</span>
                </button>

                {/* Search box - takes remaining space */}
                <div className="flex-grow-1" style={{ maxWidth: '350px', minWidth: '200px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search payments..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="leases-filters-section">
          <DataTable
            columns={columns}
            data={displayData}
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
                <i className="bi bi-credit-card display-4 text-muted"></i>
                <h5 className="text-muted mt-3">No payment history available</h5>
                <p className="text-muted">No tenant payments found matching your criteria.</p>
              </div>
            }
            conditionalRowStyles={[
              {
                when: row => row.isGroupHeader,
                style: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 'bold',
                  borderTop: '2px solid #007bff',
                  borderBottom: '1px solid #dee2e6'
                }
              }
            ]}
          />
        </div>

        {/* Summary Footer */}
        <div className="leases-filters-section">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted">
              Showing {displayData.filter(item => !item.isGroupHeader).length} payments | 
              Total: <strong>{formatCurrency(displayData.filter(item => !item.isGroupHeader).reduce((sum, payment) => sum + Math.abs(payment.amount || 0), 0))}</strong>
            </div>
            <div className="text-muted small">
              Generated on {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Component */}
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

export default TenantPaymentHistoryReport;