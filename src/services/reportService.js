import * as XLSX from 'xlsx';
import { getLeases } from './leaseService';
import { getProperties } from './propertyService';
import { getTenants } from './tenantService';

/**
 * Report Service - Centralized report generation and export functionality
 */

// Report Types Configuration
export const REPORT_TYPES = {
  LEASE: 'lease',
  PROPERTY: 'property',
  TENANT: 'tenant'
};

// Export Formats
export const EXPORT_FORMATS = {
  EXCEL: 'excel',
  PDF: 'pdf',
  CSV: 'csv'
};

/**
 * Generic data fetching function
 */
export const fetchReportData = async (reportType, filters = {}) => {
  try {
    let result;
    
    switch (reportType) {
      case REPORT_TYPES.LEASE:
        result = await getLeases(filters);
        break;
      case REPORT_TYPES.PROPERTY:
        result = await getProperties(filters);
        break;
      case REPORT_TYPES.TENANT:
        result = await getTenants(filters);
        break;
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    if (result.success) {
      return {
        success: true,
        data: result.data?.items || result.data || [],
        total: result.data?.total || result.data?.length || 0
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to fetch data',
        data: []
      };
    }
  } catch (error) {
    console.error('Error fetching report data:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch report data',
      data: []
    };
  }
};

/**
 * Data processing functions for different report types
 */

// Process lease data for export
const processLeaseData = (data) => {
  return data.map(row => {
    const tenant = typeof row.tenant === 'object' && row.tenant !== null 
      ? `${row.tenant.first_name || ''} ${row.tenant.last_name || ''}`.trim() 
      : row.tenant || 'N/A';
      
    const property = typeof row.property === 'object' && row.property !== null 
      ? row.property.property_name || row.property.name || 'N/A'
      : row.property || 'N/A';
      
    const unit = typeof row.unit === 'object' && row.unit !== null 
      ? row.unit.unit_name || row.unit.id || 'N/A'
      : row.unit || 'N/A';
      
    let monthlyRent = 0;
    if (row.monthly_rent) {
      monthlyRent = Number(row.monthly_rent);
    } else if (row.rent_amount_per_unit) {
      monthlyRent = Number(row.rent_amount_per_unit);
    } else if (typeof row.unit === 'object' && row.unit?.rent_per_month) {
      monthlyRent = Number(row.unit.rent_per_month);
    }

    return {
      'Lease Number': row.lease_number || `LEASE-${row.id}`,
      'Tenant Name': tenant,
      'Property': property,
      'Unit': unit,
      'Start Date': row.start_date ? new Date(row.start_date).toLocaleDateString() : 'N/A',
      'End Date': row.end_date ? new Date(row.end_date).toLocaleDateString() : 'N/A',
      'Monthly Rent (TSh)': isNaN(monthlyRent) ? 0 : monthlyRent,
      'Status': row.status || 'Unknown',
      'Created Date': row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A',
      'Contact Email': typeof row.tenant === 'object' ? row.tenant?.email || 'N/A' : 'N/A',
      'Contact Phone': typeof row.tenant === 'object' ? row.tenant?.phone_number || 'N/A' : 'N/A',
      'Lease Term (Months)': row.lease_term_months || 'N/A',
      'Security Deposit (TSh)': row.security_deposit || 0,
      'Late Fee (TSh)': row.late_fee || 0
    };
  });
};

// Process property data for export
const processPropertyData = (data) => {
  return data.map(row => {
    const occupancyRate = row.total_units ? Math.round((row.occupied_units || 0) / row.total_units * 100) : 0;
    const location = `${row.location || ''} ${row.area || ''}`.trim() || 'N/A';
    
    return {
      'Property Name': row.property_name || 'N/A',
      'Location': location,
      'Property Type': row.property_type || 'N/A',
      'Total Units': row.total_units || 0,
      'Occupied Units': row.occupied_units || 0,
      'Available Units': (row.total_units || 0) - (row.occupied_units || 0),
      'Occupancy Rate (%)': occupancyRate,
      'Monthly Revenue (TSh)': row.monthly_revenue || 0,
      'Annual Revenue (TSh)': (row.monthly_revenue || 0) * 12,
      'Status': row.status || 'Unknown',
      'Created Date': row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A',
      'Property Manager': row.property_manager || 'N/A',
      'Contact Phone': row.contact_phone || 'N/A',
      'Address': row.address || 'N/A',
      'Year Built': row.year_built || 'N/A',
      'Total Area (sqm)': row.total_area || 'N/A'
    };
  });
};

// Process tenant data for export
const processTenantData = (data) => {
  return data.map(row => {
    const tenantName = `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'N/A';
    const propertyName = row.property?.property_name || 'N/A';
    const outstandingBalance = row.outstanding_balance || 0;
    
    return {
      'Tenant Name': tenantName,
      'Email Address': row.email || 'N/A',
      'Phone Number': row.phone_number || 'N/A',
      'Property': propertyName,
      'Unit': row.unit || 'N/A',
      'Move-in Date': row.move_in_date ? new Date(row.move_in_date).toLocaleDateString() : 'N/A',
      'Lease End Date': row.lease_end_date ? new Date(row.lease_end_date).toLocaleDateString() : 'N/A',
      'Outstanding Balance (TSh)': outstandingBalance,
      'Lease Status': row.lease_status || 'Unknown',
      'Created Date': row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A',
      'National ID': row.national_id || 'N/A',
      'Emergency Contact': row.emergency_contact || 'N/A',
      'Emergency Phone': row.emergency_phone || 'N/A',
      'Occupation': row.occupation || 'N/A',
      'Monthly Income (TSh)': row.monthly_income || 'N/A',
      'Previous Address': row.previous_address || 'N/A'
    };
  });
};

/**
 * Excel column width configurations
 */
const getColumnWidths = (reportType) => {
  switch (reportType) {
    case REPORT_TYPES.LEASE:
      return [
        { wch: 15 }, // Lease Number
        { wch: 20 }, // Tenant Name
        { wch: 25 }, // Property
        { wch: 10 }, // Unit
        { wch: 12 }, // Start Date
        { wch: 12 }, // End Date
        { wch: 15 }, // Monthly Rent
        { wch: 10 }, // Status
        { wch: 12 }, // Created Date
        { wch: 20 }, // Contact Email
        { wch: 15 }, // Contact Phone
        { wch: 12 }, // Lease Term
        { wch: 15 }, // Security Deposit
        { wch: 12 }  // Late Fee
      ];
    case REPORT_TYPES.PROPERTY:
      return [
        { wch: 25 }, // Property Name
        { wch: 20 }, // Location
        { wch: 15 }, // Property Type
        { wch: 12 }, // Total Units
        { wch: 14 }, // Occupied Units
        { wch: 14 }, // Available Units
        { wch: 15 }, // Occupancy Rate
        { wch: 18 }, // Monthly Revenue
        { wch: 18 }, // Annual Revenue
        { wch: 10 }, // Status
        { wch: 12 }, // Created Date
        { wch: 15 }, // Manager
        { wch: 15 }, // Contact Phone
        { wch: 25 }, // Address
        { wch: 10 }, // Year Built
        { wch: 15 }  // Total Area
      ];
    case REPORT_TYPES.TENANT:
      return [
        { wch: 20 }, // Tenant Name
        { wch: 25 }, // Email Address
        { wch: 15 }, // Phone Number
        { wch: 20 }, // Property
        { wch: 10 }, // Unit
        { wch: 12 }, // Move-in Date
        { wch: 12 }, // Lease End Date
        { wch: 18 }, // Outstanding Balance
        { wch: 12 }, // Lease Status
        { wch: 12 }, // Created Date
        { wch: 15 }, // National ID
        { wch: 18 }, // Emergency Contact
        { wch: 15 }, // Emergency Phone
        { wch: 15 }, // Occupation
        { wch: 15 }, // Monthly Income
        { wch: 25 }  // Previous Address
      ];
    default:
      return [];
  }
};

/**
 * Main export function - handles all export formats
 */
export const exportReportData = async (reportType, data, format = EXPORT_FORMATS.EXCEL, options = {}) => {
  try {
    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'No data available to export'
      };
    }

    switch (format) {
      case EXPORT_FORMATS.EXCEL:
        return await exportToExcel(reportType, data, options);
      case EXPORT_FORMATS.PDF:
        return await exportToPDF(reportType, data, options);
      case EXPORT_FORMATS.CSV:
        return await exportToCSV(reportType, data, options);
      default:
        return {
          success: false,
          error: `Unsupported export format: ${format}`
        };
    }
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error.message || 'Failed to export data'
    };
  }
};

/**
 * Excel export implementation
 */
const exportToExcel = async (reportType, data, options = {}) => {
  try {
    let processedData;
    let worksheetName;
    let baseFilename;

    // Process data based on report type
    switch (reportType) {
      case REPORT_TYPES.LEASE:
        processedData = processLeaseData(data);
        worksheetName = 'Lease Report';
        baseFilename = 'lease-report';
        break;
      case REPORT_TYPES.PROPERTY:
        processedData = processPropertyData(data);
        worksheetName = 'Property Report';
        baseFilename = 'property-report';
        break;
      case REPORT_TYPES.TENANT:
        processedData = processTenantData(data);
        worksheetName = 'Tenant Report';
        baseFilename = 'tenant-report';
        break;
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(processedData);

    // Set column widths
    const columnWidths = getColumnWidths(reportType);
    if (columnWidths.length > 0) {
      worksheet['!cols'] = columnWidths;
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

    // Generate filename
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = options.filename || `${baseFilename}-${currentDate}.xlsx`;

    // Save the file
    XLSX.writeFile(workbook, filename);

    return {
      success: true,
      message: `Excel file exported successfully! ${data.length} records exported.`,
      filename: filename,
      recordCount: data.length
    };
  } catch (error) {
    console.error('Excel export error:', error);
    return {
      success: false,
      error: 'Failed to export Excel file'
    };
  }
};

/**
 * PDF export implementation (placeholder)
 */
const exportToPDF = async (reportType, data, options = {}) => {
  // TODO: Implement PDF export functionality
  // This could use libraries like jsPDF, PDFKit, or server-side PDF generation
  return {
    success: false,
    error: 'PDF export not yet implemented'
  };
};

/**
 * CSV export implementation
 */
const exportToCSV = async (reportType, data, options = {}) => {
  try {
    let processedData;
    let baseFilename;

    // Process data based on report type
    switch (reportType) {
      case REPORT_TYPES.LEASE:
        processedData = processLeaseData(data);
        baseFilename = 'lease-report';
        break;
      case REPORT_TYPES.PROPERTY:
        processedData = processPropertyData(data);
        baseFilename = 'property-report';
        break;
      case REPORT_TYPES.TENANT:
        processedData = processTenantData(data);
        baseFilename = 'tenant-report';
        break;
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    // Convert to CSV
    const headers = Object.keys(processedData[0]);
    const csvContent = [
      headers.join(','),
      ...processedData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = options.filename || `${baseFilename}-${currentDate}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      success: true,
      message: `CSV file exported successfully! ${data.length} records exported.`,
      filename: filename,
      recordCount: data.length
    };
  } catch (error) {
    console.error('CSV export error:', error);
    return {
      success: false,
      error: 'Failed to export CSV file'
    };
  }
};

/**
 * Utility functions
 */

// Generate report summary
export const generateReportSummary = (reportType, data) => {
  if (!data || data.length === 0) {
    return {
      totalRecords: 0,
      summary: 'No data available'
    };
  }

  const summary = {
    totalRecords: data.length,
    generatedAt: new Date().toISOString(),
    reportType: reportType
  };

  switch (reportType) {
    case REPORT_TYPES.LEASE:
      const activeLeases = data.filter(item => item.status === 'active').length;
      const totalRent = data.reduce((sum, item) => {
        const rent = item.monthly_rent || item.rent_amount_per_unit || 0;
        return sum + Number(rent);
      }, 0);
      
      summary.activeLeases = activeLeases;
      summary.totalMonthlyRent = totalRent;
      summary.averageRent = data.length > 0 ? totalRent / data.length : 0;
      break;

    case REPORT_TYPES.PROPERTY:
      const totalUnits = data.reduce((sum, item) => sum + (item.total_units || 0), 0);
      const occupiedUnits = data.reduce((sum, item) => sum + (item.occupied_units || 0), 0);
      const totalRevenue = data.reduce((sum, item) => sum + (item.monthly_revenue || 0), 0);
      
      summary.totalProperties = data.length;
      summary.totalUnits = totalUnits;
      summary.occupiedUnits = occupiedUnits;
      summary.occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
      summary.totalMonthlyRevenue = totalRevenue;
      break;

    case REPORT_TYPES.TENANT:
      const activeTenants = data.filter(item => item.lease_status === 'active').length;
      const totalOutstanding = data.reduce((sum, item) => sum + (item.outstanding_balance || 0), 0);
      
      summary.totalTenants = data.length;
      summary.activeTenants = activeTenants;
      summary.totalOutstandingBalance = totalOutstanding;
      summary.tenantsWithOutstanding = data.filter(item => (item.outstanding_balance || 0) > 0).length;
      break;
  }

  return summary;
};

// Validate export options
export const validateExportOptions = (reportType, format, data) => {
  const errors = [];

  if (!Object.values(REPORT_TYPES).includes(reportType)) {
    errors.push(`Invalid report type: ${reportType}`);
  }

  if (!Object.values(EXPORT_FORMATS).includes(format)) {
    errors.push(`Invalid export format: ${format}`);
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    errors.push('No data provided for export');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

export default {
  REPORT_TYPES,
  EXPORT_FORMATS,
  fetchReportData,
  exportReportData,
  generateReportSummary,
  validateExportOptions
};