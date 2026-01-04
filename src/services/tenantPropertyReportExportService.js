import React from 'react';

/**
 * Tenant and Property Report Export Service
 * Handles Excel and PDF export functionality for tenant outstanding payments and property performance reports
 */

/**
 * Export outstanding payments data to PDF format using React PDF renderer
 * @param {Array} exportData - Array of outstanding payments data to export
 * @param {Object} filters - Applied filters (dateFilter, etc.)
 * @returns {Promise<Object>} - Result object with success status and message
 */
export const exportOutstandingPaymentsToPDF = async (exportData, filters) => {
  try {
    // Dynamic imports
    const { previewPDF } = await import('../reports/utils/pdfGenerator');
    const OutstandingPaymentsReportTemplate = (await import('../reports/templates/OutstandingPaymentsReportTemplate')).default;
    
    // Prepare report metadata
    const currentDate = new Date();
    const reportMetadata = {
      reportDate: currentDate.toLocaleDateString(),
      reportTime: currentDate.toLocaleTimeString(),
    };

    // Prepare filters information
    const filtersInfo = {
      dateRange: filters?.dateRange || `${filters?.startDate || ''} to ${filters?.endDate || ''}`,
      statusFilter: filters?.statusFilter || 'All'
    };

    // Generate filename for reference (not used in preview mode)
    const filename = `Outstanding_Payments_Report_${currentDate.toISOString().split('T')[0]}.pdf`;

    // Generate and preview PDF in browser
    const result = await previewPDF(
      <OutstandingPaymentsReportTemplate 
        payments={exportData} 
        reportMetadata={reportMetadata}
        filters={filtersInfo}
      />,
      { payments: exportData, reportMetadata, filters: filtersInfo }
    );

    if (result.success) {
      return {
        success: true,
        message: `PDF report opened in browser! ${exportData.length} records included. You can download it from the browser if needed.`,
        filename: filename,
        recordCount: exportData.length
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to open PDF file'
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: 'Failed to open PDF file in browser'
    };
  }
};

/**
 * Export property performance data to PDF format using React PDF renderer
 * @param {Array} exportData - Array of property performance data to export
 * @param {Object} filters - Applied filters (dateFilter, etc.)
 * @returns {Promise<Object>} - Result object with success status and message
 */
export const exportPropertyPerformanceToPDF = async (exportData, filters) => {
  try {
    // Dynamic imports
    const { previewPDF } = await import('../reports/utils/pdfGenerator');
    const PropertyPerformanceReportTemplate = (await import('../reports/templates/PropertyPerformanceReportTemplate')).default;
    
    // Prepare report metadata
    const currentDate = new Date();
    const reportMetadata = {
      reportDate: currentDate.toLocaleDateString(),
      reportTime: currentDate.toLocaleTimeString(),
    };

    // Prepare filters information
    const filtersInfo = {
      dateRange: filters?.dateRange || `${filters?.startDate || ''} to ${filters?.endDate || ''}`,
      statusFilter: filters?.statusFilter || 'All'
    };

    // Generate filename for reference (not used in preview mode)
    const filename = `Property_Performance_Report_${currentDate.toISOString().split('T')[0]}.pdf`;

    // Generate and preview PDF in browser
    const result = await previewPDF(
      <PropertyPerformanceReportTemplate 
        properties={exportData} 
        reportMetadata={reportMetadata}
        filters={filtersInfo}
      />,
      { properties: exportData, reportMetadata, filters: filtersInfo }
    );

    if (result.success) {
      return {
        success: true,
        message: `PDF report opened in browser! ${exportData.length} records included. You can download it from the browser if needed.`,
        filename: filename,
        recordCount: exportData.length
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to open PDF file'
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: 'Failed to open PDF file in browser'
    };
  }
};

/**
 * Export property summary data to PDF format using React PDF renderer
 * @param {Array} exportData - Array of property summary data to export
 * @param {Object} filters - Applied filters (dateFilter, etc.)
 * @returns {Promise<Object>} - Result object with success status and message
 */
export const exportPropertySummaryToPDF = async (exportData, filters) => {
  try {
    // Dynamic imports
    const { previewPDF } = await import('../reports/utils/pdfGenerator');
    const PropertySummaryReportTemplate = (await import('../reports/templates/PropertySummaryReportTemplate')).default;
    
    // Prepare report metadata
    const currentDate = new Date();
    const reportMetadata = {
      reportDate: currentDate.toLocaleDateString(),
      reportTime: currentDate.toLocaleTimeString(),
    };

    // Prepare filters information
    const filtersInfo = {
      dateRange: filters?.dateRange || `${filters?.startDate || ''} to ${filters?.endDate || ''}`,
      statusFilter: filters?.statusFilter || 'All',
      startDate: filters?.startDate,
      endDate: filters?.endDate
    };

    // Generate filename for reference (not used in preview mode)
    const filename = `Property_Summary_Report_${currentDate.toISOString().split('T')[0]}.pdf`;

    // Generate and preview PDF in browser
    const result = await previewPDF(
      <PropertySummaryReportTemplate 
        data={exportData} 
        reportMetadata={reportMetadata}
        filters={filtersInfo}
      />,
      { data: exportData, reportMetadata, filters: filtersInfo }
    );

    if (result.success) {
      return {
        success: true,
        message: `PDF report opened in browser! ${exportData.length} records included. You can download it from the browser if needed.`,
        filename: filename,
        recordCount: exportData.length
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to open PDF file'
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: 'Failed to open PDF file in browser'
    };
  }
};

/**
 * Export tenant payment history data to PDF format using React PDF renderer
 * @param {Array} exportData - Array of tenant payment history data to export
 * @param {Object} filters - Applied filters (dateFilter, etc.)
 * @returns {Promise<Object>} - Result object with success status and message
 */
export const exportTenantPaymentHistoryToPDF = async (exportData, filters) => {
  try {
    // Dynamic imports
    const { previewPDF } = await import('../reports/utils/pdfGenerator');
    const TenantPaymentHistoryReportTemplate = (await import('../reports/templates/TenantPaymentHistoryReportTemplate')).default;
    
    // Prepare report metadata
    const currentDate = new Date();
    const reportMetadata = {
      title: 'Tenant Payment History Report',
      generatedAt: currentDate.toLocaleString(),
      totalRecords: exportData?.length || 0,
      dateRange: filters?.dateRange || 'All Records'
    };

    // Prepare filters info for display
    const filtersInfo = {
      dateRange: filters?.dateRange || 'All Records',
      startDate: filters?.startDate || '',
      endDate: filters?.endDate || '',
      totalPayments: exportData?.length || 0,
      totalAmount: exportData?.reduce((sum, payment) => sum + Math.abs(parseFloat(payment.amount) || 0), 0) || 0
    };

    // Generate filename with date and record count
    const formattedDate = currentDate.toISOString().split('T')[0];
    const filename = `tenant-payment-history-report-${formattedDate}-${exportData?.length || 0}-records.pdf`;
    
    // Generate and preview PDF using the generic pdfGenerator
    const result = await previewPDF(
      <TenantPaymentHistoryReportTemplate 
        data={exportData || []}
        metadata={reportMetadata}
        filters={filtersInfo}
      />,
      { data: exportData, reportMetadata, filters: filtersInfo }
    );

    if (result.success) {
      return {
        success: true,
        message: `PDF report opened in browser! ${exportData.length} records included. You can download it from the browser if needed.`,
        filename: filename,
        recordCount: exportData.length
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to open PDF file'
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: 'Failed to open PDF file in browser'
    };
  }
};