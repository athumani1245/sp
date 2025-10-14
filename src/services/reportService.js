import * as XLSX from 'xlsx';
import { getLeases, getLeaseReportData } from './leaseService';
import { getProperties } from './propertyService';
import { getTenants } from './tenantService';
import api from '../utils/api';

/**
 * Report Service - Centralized report generation and export functionality
 */

// Report Types Configuration
export const REPORT_TYPES = {
  LEASE: 'lease',
  PROPERTY: 'property',
  TENANT: 'tenant',
  PENDING_PAYMENTS: 'pending_payments',
  PROPERTY_PERFORMANCE: 'property_performance',
  PROPERTY_SUMMARY: 'property_summary',
  TENANT_PAYMENT_HISTORY: 'tenant_payment_history',
  LEASE_AGREEMENTS: 'lease_agreements'
};

// Export Formats
export const EXPORT_FORMATS = {
  EXCEL: 'excel',
  PDF: 'pdf',
  CSV: 'csv'
};

/**
 * Fetch pending payments data for tenant outstanding balance report
 */
export const fetchPendingPayments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.tenant_id) {
      params.append('tenant_id', filters.tenant_id);
    }
    if (filters.property_id) {
      params.append('property_id', filters.property_id);
    }
    if (filters.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters.end_date) {
      params.append('end_date', filters.end_date);
    }
    // Note: Removed limit parameter to fetch all outstanding payments

    const url = `/reports/pending-payments${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);

    console.log('fetchPendingPayments: Full API response:', response.data);

    // Extract data based on the actual API response structure
    let dataItems = [];
    
    // Check if response has the structure: { status, statusCode, description, data: [...] }
    if (response.data?.data && Array.isArray(response.data.data)) {
      dataItems = response.data.data;
      console.log('fetchPendingPayments: Using response.data.data structure');
    } 
    // Check for nested structure with items
    else if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
      dataItems = response.data.data.items;
      console.log('fetchPendingPayments: Using response.data.data.items structure');
    } 
    // Check for direct items
    else if (response.data?.items && Array.isArray(response.data.items)) {
      dataItems = response.data.items;
      console.log('fetchPendingPayments: Using response.data.items structure');
    } 
    // Check if data is directly an array
    else if (Array.isArray(response.data)) {
      dataItems = response.data;
      console.log('fetchPendingPayments: Using direct array structure');
    }

    console.log('fetchPendingPayments: Extracted data items:', dataItems.length, 'items');

    return {
      success: true,
      data: dataItems,
      total: response.data?.total || response.data?.count || dataItems.length
    };
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch pending payments',
      data: []
    };
  }
};

/**
 * Fetch property performance data for property performance report
 */
export const fetchPropertyPerformance = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.property_id) {
      params.append('property_id', filters.property_id);
    }
    if (filters.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters.end_date) {
      params.append('end_date', filters.end_date);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const url = `/reports/property-performance${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);

    return {
      success: true,
      data: response.data?.data || response.data || [],
      total: response.data?.data?.length || 0
    };
  } catch (error) {
    console.error('Error fetching property performance:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch property performance data',
      data: []
    };
  }
};

/**
 * Fetch property summary data for property summary report
 */
export const fetchPropertySummary = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.property_id) {
      params.append('property_id', filters.property_id);
    }
    if (filters.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters.end_date) {
      params.append('end_date', filters.end_date);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const url = `/reports/property-summary${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);

    console.log('fetchPropertySummary: Full API response:', response.data);

    // Extract data based on the API response structure
    let dataItems = [];
    
    if (response.data?.data && Array.isArray(response.data.data)) {
      dataItems = response.data.data;
      console.log('fetchPropertySummary: Using response.data.data structure');
    } 
    else if (Array.isArray(response.data)) {
      dataItems = response.data;
      console.log('fetchPropertySummary: Using direct array structure');
    }

    console.log('fetchPropertySummary: Extracted data items:', dataItems.length, 'items');

    return {
      success: true,
      data: dataItems,
      total: dataItems.length
    };
  } catch (error) {
    console.error('Error fetching property summary:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch property summary data',
      data: []
    };
  }
};

/**
 * Fetch tenant payment history data
 */
export const fetchTenantPaymentHistory = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.tenant_id) {
      params.append('tenant_id', filters.tenant_id);
    }
    if (filters.start_date) {
      params.append('start_date', filters.start_date);
    }
    if (filters.end_date) {
      params.append('end_date', filters.end_date);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.payment_source) {
      params.append('payment_source', filters.payment_source);
    }

    const url = `/reports/tenant-payment-history${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);

    console.log('fetchTenantPaymentHistory: Full API response:', response.data);

    // Extract data based on the API response structure
    let dataItems = [];
    
    if (response.data?.data && Array.isArray(response.data.data)) {
      dataItems = response.data.data;
      console.log('fetchTenantPaymentHistory: Using response.data.data structure');
    } 
    else if (Array.isArray(response.data)) {
      dataItems = response.data;
      console.log('fetchTenantPaymentHistory: Using direct array structure');
    }

    console.log('fetchTenantPaymentHistory: Extracted data items:', dataItems.length, 'items');

    return {
      success: true,
      data: dataItems,
      total: dataItems.length
    };
  } catch (error) {
    console.error('Error fetching tenant payment history:', error);
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch tenant payment history',
      data: []
    };
  }
};

/**
 * Fetch lease agreements data using leaseService
 */
export const fetchLeaseAgreements = async (filters = {}) => {
  try {
    console.log('fetchLeaseAgreements: Starting fetch with filters:', filters);
    
    // Use the leaseService function to fetch report data
    const result = await getLeaseReportData(filters);
    
    console.log('fetchLeaseAgreements: leaseService result:', {
      success: result.success,
      dataLength: result.data?.length,
      total: result.total,
      error: result.error
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to fetch lease agreements data',
        data: []
      };
    }

    return {
      success: true,
      data: result.data || [],
      total: result.total || 0
    };
  } catch (error) {
    console.error('fetchLeaseAgreements: Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch lease agreements',
      data: []
    };
  }
};

/**
 * Generic data fetching function
 */
export const fetchReportData = async (reportType, filters = {}) => {
  try {
    console.log('fetchReportData: Fetching report type:', reportType, 'with filters:', filters);
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
      case REPORT_TYPES.LEASE_AGREEMENTS:
        result = await fetchLeaseAgreements(filters);
        break;
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    console.log('fetchReportData: API result:', result);
    
    if (result.success) {
      const extractedData = result.data?.items || result.data || [];
      console.log('fetchReportData: Extracted data type:', typeof extractedData, 'Is array:', Array.isArray(extractedData), 'Length:', extractedData?.length);
      
      return {
        success: true,
        data: extractedData,
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

// Process pending payments data for export
const processPendingPaymentsData = (data) => {
  console.log('processPendingPaymentsData: Input data type:', typeof data, 'Is array:', Array.isArray(data), 'Length:', data?.length);
  
  if (!Array.isArray(data)) {
    console.error('processPendingPaymentsData: Data is not an array!', data);
    return [];
  }
  
  return data.map(row => {
    const tenantName = row.tenant_full_name || 'N/A';
    const propertyName = row.property || 'N/A';
    const unitName = row.unit || 'N/A';
    const totalRent = Number(row.total_rent) || 0;
    const totalPaid = Number(row.total_amount_paid) || 0;
    const remainingAmount = Number(row.remaining_amount) || 0;
    const discount = Number(row.discount) || 0;
    
    console.log('processPendingPaymentsData: Processing row:', {
      tenant: tenantName,
      property: propertyName,
      unit: unitName,
      leaseNumber: row.lease_number,
      totalRent,
      totalPaid,
      remainingAmount,
      paymentStatus: row.payment_status
    });
    
    return {
      'Tenant Name': tenantName,
      'Property': propertyName,
      'Unit': unitName,
      'Lease Number': row.lease_number || 'N/A',
      'Lease Start Date': row.start_date || 'N/A',
      'Lease End Date': row.end_date || 'N/A',
      'Total Rent (TSh)': totalRent,
      'Amount Paid (TSh)': totalPaid,
      'Outstanding Amount (TSh)': remainingAmount,
      'Discount (TSh)': discount,
      'Lease Status': row.lease_status || 'Unknown',
      'Payment Status': row.payment_status || 'Unknown',
      'Payment Progress (%)': totalRent > 0 ? Math.round((totalPaid / totalRent) * 100) : 0,
      'Net Position (TSh)': totalPaid - totalRent
    };
  });
};

// Process property performance data for export
const processPropertyPerformanceData = (data) => {
  return data.map(row => {
    const propertyName = row.unit__property__property_name || 'N/A';
    const totalDue = Number(row.total_due) || 0;
    const totalPaid = Number(row.total_paid) || 0;
    const outstanding = Number(row.outstanding) || 0;
    const overpaid = Number(row.overpaid) || 0;
    
    // Calculate performance metrics
    const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
    const outstandingRate = totalDue > 0 ? Math.round((outstanding / totalDue) * 100) : 0;
    const netPosition = totalPaid - totalDue; // Positive means overpaid, negative means outstanding
    
    return {
      'Property Name': propertyName,
      'Total Due (TSh)': totalDue,
      'Total Paid (TSh)': totalPaid,
      'Outstanding (TSh)': outstanding,
      'Overpaid (TSh)': overpaid,
      'Collection Rate (%)': collectionRate,
      'Outstanding Rate (%)': outstandingRate,
      'Net Position (TSh)': netPosition,
      'Performance Status': collectionRate >= 95 ? 'Excellent' : 
                           collectionRate >= 85 ? 'Good' : 
                           collectionRate >= 70 ? 'Fair' : 'Poor'
    };
  });
};

// Process property summary data for export
const processPropertySummaryData = (data) => {
  return data.map(row => {
    const totalUnits = row.units?.length || 0;
    const occupiedUnits = row.units?.filter(unit => unit.availability === 'Occupied').length || 0;
    const availableUnits = totalUnits - occupiedUnits;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const location = `${row.street || ''} ${row.ward || ''}`.trim() || 'N/A';
    
    return {
      'Property Name': row.property_name || 'N/A',
      'Property Type': row.property_type || 'N/A',
      'Location': location,
      'Street': row.street || 'N/A',
      'Ward': row.ward || 'N/A',
      'Landlord': row.landlord || 'N/A',
      'Total Units': totalUnits,
      'Occupied Units': occupiedUnits,
      'Available Units': availableUnits,
      'Occupancy Rate (%)': occupancyRate,
      'Occupancy Status': occupancyRate >= 90 ? 'Excellent' : 
                         occupancyRate >= 75 ? 'Good' : 
                         occupancyRate >= 50 ? 'Fair' : 
                         occupancyRate > 0 ? 'Poor' : 'Empty',
      'Property ID': row.property_id || 'N/A'
    };
  });
};

// Process tenant payment history data for export
const processTenantPaymentHistoryData = (data) => {
  return data.map(row => {
    const amount = parseFloat(row.amount) || 0;
    const paymentDate = row.payment_date ? new Date(row.payment_date).toLocaleDateString() : 'N/A';
    const createdAt = row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A';
    
    return {
      'Tenant Name': row.tenant || 'N/A',
      'Lease Number': row.lease_number || 'N/A',
      'Amount (TSh)': amount.toLocaleString(),
      'Payment Date': paymentDate,
      'Category': row.category || 'N/A',
      'Payment Source': row.payment_source || 'N/A',
      'Created Date': createdAt
    };
  });
};

// Process lease agreements data for export
const processLeaseAgreementsData = (data) => {
  return data.map(row => {
    const rentAmount = parseFloat(row.rent_amount_per_unit) || 0;
    const startDate = row.start_date ? new Date(row.start_date).toLocaleDateString() : 'N/A';
    const endDate = row.end_date ? new Date(row.end_date).toLocaleDateString() : 'N/A';
    const duration = row.duration || 0;
    const remainingDays = row.remaining_days || 0;
    
    return {
      'Lease Number': row.lease_number || 'N/A',
      'Tenant Name': row.tenant || 'N/A',
      'Property': row.property || 'N/A',
      'Unit': row.unit || 'N/A',
      'Rent Amount (TSh)': rentAmount.toLocaleString(),
      'Start Date': startDate,
      'End Date': endDate,
      'Duration (Days)': duration,
      'Remaining Days': remainingDays,
      'Lease Status': row.lease_status || 'Unknown',
      'Payment Status': row.payment_status || 'N/A',
      'Progress (%)': duration > 0 ? Math.round(((duration - remainingDays) / duration) * 100) : 0
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
    case REPORT_TYPES.PENDING_PAYMENTS:
      return [
        { wch: 20 }, // Tenant Name
        { wch: 20 }, // Property
        { wch: 15 }, // Unit
        { wch: 18 }, // Lease Number
        { wch: 15 }, // Lease Start Date
        { wch: 15 }, // Lease End Date
        { wch: 15 }, // Total Rent
        { wch: 15 }, // Amount Paid
        { wch: 18 }, // Outstanding Amount
        { wch: 12 }, // Discount
        { wch: 12 }, // Lease Status
        { wch: 15 }, // Payment Status
        { wch: 15 }, // Payment Progress
        { wch: 15 }  // Net Position
      ];
    case REPORT_TYPES.PROPERTY_PERFORMANCE:
      return [
        { wch: 25 }, // Property Name
        { wch: 18 }, // Total Due
        { wch: 18 }, // Total Paid
        { wch: 18 }, // Outstanding
        { wch: 15 }, // Overpaid
        { wch: 15 }, // Collection Rate
        { wch: 18 }, // Outstanding Rate
        { wch: 18 }, // Net Position
        { wch: 18 }  // Performance Status
      ];
    case REPORT_TYPES.PROPERTY_SUMMARY:
      return [
        { wch: 25 }, // Property Name
        { wch: 15 }, // Property Type
        { wch: 20 }, // Location
        { wch: 15 }, // Street
        { wch: 15 }, // Ward
        { wch: 20 }, // Landlord
        { wch: 12 }, // Total Units
        { wch: 14 }, // Occupied Units
        { wch: 14 }, // Available Units
        { wch: 15 }, // Occupancy Rate
        { wch: 18 }, // Occupancy Status
        { wch: 30 }  // Property ID
      ];
    case REPORT_TYPES.TENANT_PAYMENT_HISTORY:
      return [
        { wch: 20 }, // Tenant Name
        { wch: 18 }, // Lease Number
        { wch: 15 }, // Amount
        { wch: 15 }, // Payment Date
        { wch: 12 }, // Category
        { wch: 15 }, // Payment Source
        { wch: 15 }  // Created Date
      ];
    case REPORT_TYPES.LEASE_AGREEMENTS:
      return [
        { wch: 18 }, // Lease Number
        { wch: 20 }, // Tenant Name
        { wch: 25 }, // Property
        { wch: 15 }, // Unit
        { wch: 18 }, // Rent Amount
        { wch: 12 }, // Start Date
        { wch: 12 }, // End Date
        { wch: 15 }, // Duration
        { wch: 15 }, // Remaining Days
        { wch: 12 }, // Lease Status
        { wch: 15 }, // Payment Status
        { wch: 12 }  // Progress
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
      case REPORT_TYPES.PENDING_PAYMENTS:
        processedData = processPendingPaymentsData(data);
        worksheetName = 'Pending Payments Report';
        baseFilename = 'pending-payments-report';
        break;
      case REPORT_TYPES.PROPERTY_PERFORMANCE:
        processedData = processPropertyPerformanceData(data);
        worksheetName = 'Property Performance Report';
        baseFilename = 'property-performance-report';
        break;
      case REPORT_TYPES.PROPERTY_SUMMARY:
        processedData = processPropertySummaryData(data);
        worksheetName = 'Property Summary Report';
        baseFilename = 'property-summary-report';
        break;
      case REPORT_TYPES.TENANT_PAYMENT_HISTORY:
        processedData = processTenantPaymentHistoryData(data);
        worksheetName = 'Tenant Payment History';
        baseFilename = 'tenant-payment-history-report';
        break;
      case REPORT_TYPES.LEASE_AGREEMENTS:
        processedData = processLeaseAgreementsData(data);
        worksheetName = 'Lease Agreements Report';
        baseFilename = 'lease-agreements-report';
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
  try {
    // Import the appropriate export service based on report type
    switch (reportType) {
      case REPORT_TYPES.LEASE:
        // Use existing lease export service
        const { exportLeasesToPDF } = await import('./leaseReportExportService');
        return await exportLeasesToPDF(data, options.filters || {});
      
      case REPORT_TYPES.PENDING_PAYMENTS:
        // Use new tenant/property export service for outstanding payments
        const { exportOutstandingPaymentsToPDF } = await import('./tenantPropertyReportExportService');
        return await exportOutstandingPaymentsToPDF(data, options.filters || {});
      
      case REPORT_TYPES.PROPERTY_PERFORMANCE:
        // Use new tenant/property export service for property performance
        const { exportPropertyPerformanceToPDF } = await import('./tenantPropertyReportExportService');
        return await exportPropertyPerformanceToPDF(data, options.filters || {});
      
      case REPORT_TYPES.PROPERTY_SUMMARY:
        // Use new tenant/property export service for property summary
        const { exportPropertySummaryToPDF } = await import('./tenantPropertyReportExportService');
        return await exportPropertySummaryToPDF(data, options.filters || {});
      
      case REPORT_TYPES.TENANT_PAYMENT_HISTORY:
        // Use new tenant/property export service for payment history
        const { exportTenantPaymentHistoryToPDF } = await import('./tenantPropertyReportExportService');
        return await exportTenantPaymentHistoryToPDF(data, options.filters || {});
      
      case REPORT_TYPES.PROPERTY:
      case REPORT_TYPES.TENANT:
        // For now, these will use generic PDF generation (could be implemented later)
        return {
          success: false,
          error: `PDF export for ${reportType} reports is not yet implemented. Please use Excel export instead.`
        };
      
      default:
        return {
          success: false,
          error: `Unsupported report type for PDF export: ${reportType}`
        };
    }
  } catch (error) {
    console.error('PDF export error:', error);
    return {
      success: false,
      error: error.message || 'Failed to export PDF file'
    };
  }
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
      case REPORT_TYPES.PENDING_PAYMENTS:
        processedData = processPendingPaymentsData(data);
        baseFilename = 'pending-payments-report';
        break;
      case REPORT_TYPES.PROPERTY_PERFORMANCE:
        processedData = processPropertyPerformanceData(data);
        baseFilename = 'property-performance-report';
        break;
      case REPORT_TYPES.PROPERTY_SUMMARY:
        processedData = processPropertySummaryData(data);
        baseFilename = 'property-summary-report';
        break;
      case REPORT_TYPES.TENANT_PAYMENT_HISTORY:
        processedData = processTenantPaymentHistoryData(data);
        baseFilename = 'tenant-payment-history-report';
        break;
      case REPORT_TYPES.LEASE_AGREEMENTS:
        processedData = processLeaseAgreementsData(data);
        baseFilename = 'lease-agreements-report';
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
  // Ensure data is always an array
  const dataArray = Array.isArray(data) ? data : [];
  
  if (!dataArray || dataArray.length === 0) {
    return {
      totalRecords: 0,
      summary: 'No data available'
    };
  }

  const summary = {
    totalRecords: dataArray.length,
    generatedAt: new Date().toISOString(),
    reportType: reportType
  };

  switch (reportType) {
    case REPORT_TYPES.LEASE:
      const activeLeases = dataArray.filter(item => item.status === 'active').length;
      const totalRent = dataArray.reduce((sum, item) => {
        const rent = item.monthly_rent || item.rent_amount_per_unit || 0;
        return sum + Number(rent);
      }, 0);
      
      summary.activeLeases = activeLeases;
      summary.totalMonthlyRent = totalRent;
      summary.averageRent = dataArray.length > 0 ? totalRent / dataArray.length : 0;
      break;

    case REPORT_TYPES.PROPERTY:
      const totalUnits = dataArray.reduce((sum, item) => sum + (item.total_units || 0), 0);
      const occupiedUnits = dataArray.reduce((sum, item) => sum + (item.occupied_units || 0), 0);
      const totalRevenue = dataArray.reduce((sum, item) => sum + (item.monthly_revenue || 0), 0);
      
      summary.totalProperties = dataArray.length;
      summary.totalUnits = totalUnits;
      summary.occupiedUnits = occupiedUnits;
      summary.occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
      summary.totalMonthlyRevenue = totalRevenue;
      break;

    case REPORT_TYPES.TENANT:
      const activeTenants = dataArray.filter(item => item.lease_status === 'active').length;
      const totalOutstanding = dataArray.reduce((sum, item) => sum + (item.outstanding_balance || 0), 0);
      
      summary.totalTenants = dataArray.length;
      summary.activeTenants = activeTenants;
      summary.totalOutstandingBalance = totalOutstanding;
      summary.tenantsWithOutstanding = dataArray.filter(item => (item.outstanding_balance || 0) > 0).length;
      break;

    case REPORT_TYPES.PENDING_PAYMENTS:
      const totalRentAmount = dataArray.reduce((sum, item) => sum + (Number(item.total_rent) || 0), 0);
      const totalPaidAmount = dataArray.reduce((sum, item) => sum + (Number(item.total_amount_paid) || 0), 0);
      const totalOutstandingAmount = dataArray.reduce((sum, item) => sum + (Number(item.remaining_amount) || 0), 0);
      const totalDiscountAmount = dataArray.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
      const fullyPaidCount = dataArray.filter(item => item.payment_status === 'FULLY PAID').length;
      const partiallyPaidCount = dataArray.filter(item => item.payment_status === 'PARTIALLY PAID').length;
      const notPaidCount = dataArray.filter(item => item.payment_status === 'NOT PAID').length;
      const uniqueTenants = new Set(data.map(item => item.tenant_full_name));
      const paymentsCollectionRate = totalRentAmount > 0 ? Math.round((totalPaidAmount / totalRentAmount) * 100) : 0;
      
      summary.totalLeases = data.length;
      summary.totalRentAmount = totalRentAmount;
      summary.totalPaidAmount = totalPaidAmount;
      summary.totalOutstandingAmount = totalOutstandingAmount;
      summary.totalDiscountAmount = totalDiscountAmount;
      summary.fullyPaidCount = fullyPaidCount;
      summary.partiallyPaidCount = partiallyPaidCount;
      summary.notPaidCount = notPaidCount;
      summary.uniqueTenants = uniqueTenants.size;
      summary.overallCollectionRate = paymentsCollectionRate;
      break;

    case REPORT_TYPES.PROPERTY_PERFORMANCE:
      const totalDueAll = data.reduce((sum, item) => sum + (Number(item.total_due) || 0), 0);
      const totalPaidAll = data.reduce((sum, item) => sum + (Number(item.total_paid) || 0), 0);
      const totalOutstandingAll = data.reduce((sum, item) => sum + (Number(item.outstanding) || 0), 0);
      const totalOverpaidAll = data.reduce((sum, item) => sum + (Number(item.overpaid) || 0), 0);
      const overallCollectionRate = totalDueAll > 0 ? Math.round((totalPaidAll / totalDueAll) * 100) : 0;
      const propertiesWithOutstanding = data.filter(item => (Number(item.outstanding) || 0) > 0).length;
      const propertiesWithOverpayment = data.filter(item => (Number(item.overpaid) || 0) > 0).length;
      
      summary.totalProperties = data.length;
      summary.totalDue = totalDueAll;
      summary.totalPaid = totalPaidAll;
      summary.totalOutstanding = totalOutstandingAll;
      summary.totalOverpaid = totalOverpaidAll;
      summary.overallCollectionRate = overallCollectionRate;
      summary.propertiesWithOutstanding = propertiesWithOutstanding;
      summary.propertiesWithOverpayment = propertiesWithOverpayment;
      summary.netPosition = totalPaidAll - totalDueAll;
      break;

    case REPORT_TYPES.PROPERTY_SUMMARY:
      const totalPropertiesSum = dataArray.length;
      const totalUnitsSum = dataArray.reduce((sum, item) => sum + (item.units?.length || 0), 0);
      const totalOccupiedSum = dataArray.reduce((sum, item) => {
        const occupiedCount = item.units?.filter(unit => unit.availability === 'Occupied').length || 0;
        return sum + occupiedCount;
      }, 0);
      const totalAvailableSum = totalUnitsSum - totalOccupiedSum;
      const overallOccupancyRateSum = totalUnitsSum > 0 ? Math.round((totalOccupiedSum / totalUnitsSum) * 100) : 0;
      const propertiesByType = dataArray.reduce((acc, item) => {
        const type = item.property_type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      const fullyOccupiedProperties = dataArray.filter(item => {
        const totalUnits = item.units?.length || 0;
        const occupiedUnits = item.units?.filter(unit => unit.availability === 'Occupied').length || 0;
        return totalUnits > 0 && occupiedUnits === totalUnits;
      }).length;
      const vacantProperties = dataArray.filter(item => {
        const occupiedUnits = item.units?.filter(unit => unit.availability === 'Occupied').length || 0;
        return occupiedUnits === 0;
      }).length;
      
      summary.totalProperties = totalPropertiesSum;
      summary.totalUnits = totalUnitsSum;
      summary.totalOccupied = totalOccupiedSum;
      summary.totalAvailable = totalAvailableSum;
      summary.overallOccupancyRate = overallOccupancyRateSum;
      summary.propertiesByType = propertiesByType;
      summary.fullyOccupiedProperties = fullyOccupiedProperties;
      summary.vacantProperties = vacantProperties;
      summary.partiallyOccupiedProperties = totalPropertiesSum - fullyOccupiedProperties - vacantProperties;
      break;

    case REPORT_TYPES.TENANT_PAYMENT_HISTORY:
      const totalPayments = dataArray.length;
      const totalAmount = dataArray.reduce((sum, item) => sum + Math.abs(parseFloat(item.amount) || 0), 0);
      const positivePayments = dataArray.filter(item => (parseFloat(item.amount) || 0) > 0);
      const negativePayments = dataArray.filter(item => (parseFloat(item.amount) || 0) < 0);
      const rentPayments = dataArray.filter(item => item.category === 'RENT');
      const otherPayments = dataArray.filter(item => item.category !== 'RENT');
      const cashPayments = dataArray.filter(item => item.payment_source === 'CASH');
      const uniqueTenantsPayments = new Set(dataArray.map(item => item.tenant));
      const uniqueLeases = new Set(dataArray.map(item => item.lease_number));
      const paymentsByCategory = dataArray.reduce((acc, item) => {
        const category = item.category || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});
      
      summary.totalPayments = totalPayments;
      summary.totalAmount = totalAmount;
      summary.positivePayments = positivePayments.length;
      summary.negativePayments = negativePayments.length;
      summary.rentPayments = rentPayments.length;
      summary.otherPayments = otherPayments.length;
      summary.cashPayments = cashPayments.length;
      summary.uniqueTenants = uniqueTenantsPayments.size;
      summary.uniqueLeases = uniqueLeases.size;
      summary.paymentsByCategory = paymentsByCategory;
      summary.averagePaymentAmount = totalPayments > 0 ? totalAmount / totalPayments : 0;
      break;

    case REPORT_TYPES.LEASE_AGREEMENTS:
      const totalLeaseAgreements = dataArray.length;
      const activeLeaseAgreements = dataArray.filter(item => item.lease_status === 'Active').length;
      const expiredLeaseAgreements = dataArray.filter(item => item.lease_status === 'Expired').length;
      const totalRentValue = dataArray.reduce((sum, item) => sum + (parseFloat(item.rent_amount_per_unit) || 0), 0);
      const averageRentAmount = totalLeaseAgreements > 0 ? totalRentValue / totalLeaseAgreements : 0;
      const expiringSoon = dataArray.filter(item => (item.remaining_days || 0) <= 30 && item.lease_status === 'Active').length;
      const propertiesCount = new Set(dataArray.map(item => item.property)).size;
      const tenantsCount = new Set(dataArray.map(item => item.tenant)).size;
      const averageDuration = dataArray.reduce((sum, item) => sum + (item.duration || 0), 0) / totalLeaseAgreements;
      
      summary.totalLeaseAgreements = totalLeaseAgreements;
      summary.activeLeaseAgreements = activeLeaseAgreements;
      summary.expiredLeaseAgreements = expiredLeaseAgreements;
      summary.totalRentValue = totalRentValue;
      summary.averageRentAmount = averageRentAmount;
      summary.expiringSoon = expiringSoon;
      summary.uniqueProperties = propertiesCount;
      summary.uniqueTenants = tenantsCount;
      summary.averageLeaseDuration = Math.round(averageDuration);
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

/**
 * Export functions for specific report types
 */

// Export tenant payment history
export const exportTenantPaymentHistory = async (filters = {}, format = EXPORT_FORMATS.EXCEL) => {
  try {
    console.log('exportTenantPaymentHistory: Starting export with format:', format, 'and filters:', filters);
    
    // First fetch the data
    const result = await fetchTenantPaymentHistory(filters);
    
    console.log('exportTenantPaymentHistory: Fetch result:', { 
      success: result.success, 
      dataLength: result.data?.length,
      error: result.error 
    });
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to fetch tenant payment history data'
      };
    }

    if (!result.data || result.data.length === 0) {
      return {
        success: false,
        error: 'No tenant payment history data found for the selected criteria'
      };
    }

    console.log('exportTenantPaymentHistory: Calling exportReportData with:', {
      reportType: REPORT_TYPES.TENANT_PAYMENT_HISTORY,
      dataLength: result.data.length,
      format,
      sampleData: result.data[0]
    });

    // Then export it
    const exportResult = await exportReportData(REPORT_TYPES.TENANT_PAYMENT_HISTORY, result.data, format, { filters });
    
    console.log('exportTenantPaymentHistory: Export result:', exportResult);
    
    return exportResult;
  } catch (error) {
    console.error('Export tenant payment history error:', error);
    console.error('Export tenant payment history error stack:', error.stack);
    return {
      success: false,
      error: error.message || 'Failed to export tenant payment history'
    };
  }
};

// Export property summary
export const exportPropertySummary = async (filters = {}, format = EXPORT_FORMATS.EXCEL) => {
  try {
    // First fetch the data
    const result = await fetchPropertySummary(filters);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to fetch property summary data'
      };
    }

    // Then export it
    return await exportReportData(REPORT_TYPES.PROPERTY_SUMMARY, result.data, format, { filters });
  } catch (error) {
    console.error('Export property summary error:', error);
    return {
      success: false,
      error: error.message || 'Failed to export property summary'
    };
  }
};

// Export property performance
export const exportPropertyPerformance = async (filters = {}, format = EXPORT_FORMATS.EXCEL) => {
  try {
    // First fetch the data
    const result = await fetchPropertyPerformance(filters);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to fetch property performance data'
      };
    }

    // Then export it
    return await exportReportData(REPORT_TYPES.PROPERTY_PERFORMANCE, result.data, format, { filters });
  } catch (error) {
    console.error('Export property performance error:', error);
    return {
      success: false,
      error: error.message || 'Failed to export property performance'
    };
  }
};

// Export pending payments
export const exportPendingPayments = async (filters = {}, format = EXPORT_FORMATS.EXCEL) => {
  try {
    // First fetch the data
    const result = await fetchPendingPayments(filters);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to fetch pending payments data'
      };
    }

    // Then export it
    return await exportReportData(REPORT_TYPES.PENDING_PAYMENTS, result.data, format, { filters });
  } catch (error) {
    console.error('Export pending payments error:', error);
    return {
      success: false,
      error: error.message || 'Failed to export pending payments'
    };
  }
};

// Export lease agreements
export const exportLeaseAgreements = async (filters = {}, format = EXPORT_FORMATS.EXCEL) => {
  try {
    console.log('exportLeaseAgreements: Starting export with format:', format, 'and filters:', filters);
    
    // First fetch the data
    const result = await fetchLeaseAgreements(filters);
    
    console.log('exportLeaseAgreements: Fetch result:', { 
      success: result.success, 
      dataLength: result.data?.length,
      error: result.error 
    });
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to fetch lease agreements data'
      };
    }

    if (!result.data || result.data.length === 0) {
      return {
        success: false,
        error: 'No lease agreements data found for the selected criteria'
      };
    }

    console.log('exportLeaseAgreements: Calling exportReportData with:', {
      reportType: REPORT_TYPES.LEASE_AGREEMENTS,
      dataLength: result.data.length,
      format,
      sampleData: result.data[0]
    });

    // Then export it
    const exportResult = await exportReportData(REPORT_TYPES.LEASE_AGREEMENTS, result.data, format, { filters });
    
    console.log('exportLeaseAgreements: Export result:', exportResult);
    
    return exportResult;
  } catch (error) {
    console.error('Export lease agreements error:', error);
    console.error('Export lease agreements error stack:', error.stack);
    return {
      success: false,
      error: error.message || 'Failed to export lease agreements'
    };
  }
};

export default {
  REPORT_TYPES,
  EXPORT_FORMATS,
  fetchReportData,
  fetchPendingPayments,
  fetchPropertyPerformance,
  fetchPropertySummary,
  fetchTenantPaymentHistory,
  fetchLeaseAgreements,
  exportReportData,
  exportTenantPaymentHistory,
  exportPropertySummary,
  exportPropertyPerformance,
  exportPendingPayments,
  exportLeaseAgreements,
  generateReportSummary,
  validateExportOptions
};