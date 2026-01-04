/**
 * Lease Report Export Service
 * Handles Excel and PDF export functionality for lease reports
 */

/**
 * Export lease data to Excel format with professional styling
 * @param {Array} exportData - Array of lease data to export
 * @param {Object} filters - Applied filters (statusFilter, dateFilter)
 * @returns {Promise<Object>} - Result object with success status and message
 */
export const exportLeasesToExcel = async (exportData, filters) => {
  try {
    // Dynamic import of XLSX to reduce bundle size
    const XLSX = await import('xlsx');
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare report metadata
    const currentDate = new Date();
    const reportDate = currentDate.toLocaleDateString();
    const reportTime = currentDate.toLocaleTimeString();
    const totalLeases = exportData.length;
    const activeLeases = exportData.filter(item => (item.lease_status || item.status || '').toLowerCase() === 'active').length;
    const totalRent = exportData.reduce((sum, item) => {
      let rent = 0;
      if (item.monthly_rent) rent = Number(item.monthly_rent);
      else if (item.rent_amount_per_unit) rent = Number(item.rent_amount_per_unit);
      else if (typeof item.unit === 'object' && item.unit?.rent_per_month) rent = Number(item.unit.rent_per_month);
      return sum + (isNaN(rent) ? 0 : rent);
    }, 0);

    // Create header data
    const headerData = [
      [''],
      ['LEASES REPORT'],
      [''],
      ['Report Generated:', reportDate, '', 'Time:', reportTime],
      ['Total Leases:', totalLeases, '', 'Active Leases:', activeLeases],
      ['Total Monthly Rent:', `TSh ${totalRent.toLocaleString()}`, '', 'Status Filter:', filters.statusFilter || 'All'],
      ['Date Range:', `${filters.dateFilter.startDate} to ${filters.dateFilter.endDate}`],
      [''],
      ['LEASE DETAILS']
    ];

    // Process lease data for export
    const processedData = exportData.map(row => {
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
      if (row.monthly_rent) monthlyRent = Number(row.monthly_rent);
      else if (row.rent_amount_per_unit) monthlyRent = Number(row.rent_amount_per_unit);
      else if (typeof row.unit === 'object' && row.unit?.rent_per_month) monthlyRent = Number(row.unit.rent_per_month);

      const duration = row.number_of_month ? `${row.number_of_month} months` :
        (row.start_date && row.end_date ? 
          Math.round((new Date(row.end_date) - new Date(row.start_date)) / (1000 * 60 * 60 * 24 * 30.44)) + ' months' : 'N/A');

      return {
        'Lease Number': row.lease_number || row.lease_code || `LEASE-${row.id}`,
        'Tenant Name': tenant,
        'Property': property,
        'Unit': unit,
        'Start Date': row.start_date ? new Date(row.start_date).toLocaleDateString() : 'N/A',
        'End Date': row.end_date ? new Date(row.end_date).toLocaleDateString() : 'N/A',
        'Duration': duration,
        'Monthly Rent (TSh)': isNaN(monthlyRent) ? 0 : monthlyRent,
        'Security Deposit (TSh)': row.security_deposit || row.deposit_amount || 0,
        'Status': (row.lease_status || row.status || 'Unknown').toUpperCase()
      };
    });

    // Create worksheet with headers and data
    const worksheet = XLSX.utils.aoa_to_sheet(headerData);
    
    // Add the data starting from row 11 (after headers)
    XLSX.utils.sheet_add_json(worksheet, processedData, { origin: 'A11', skipHeader: false });

    // Set column widths
    worksheet['!cols'] = [
      { width: 15 }, // Lease Number
      { width: 20 }, // Tenant Name
      { width: 20 }, // Property
      { width: 12 }, // Unit
      { width: 12 }, // Start Date
      { width: 12 }, // End Date
      { width: 12 }, // Duration
      { width: 15 }, // Monthly Rent
      { width: 15 }, // Security Deposit
      { width: 10 }  // Status
    ];

    // Add cell styling
    if (!worksheet['!styles']) worksheet['!styles'] = [];

    // Style main title (row 2 - "LEASES REPORT")
    if (worksheet['A2']) {
      worksheet['A2'].s = {
        font: { bold: true, sz: 16, color: { rgb: "000000" } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { fgColor: { rgb: "E6F3FF" } }
      };
    }

    // Style section header "LEASE DETAILS" (row 9)
    if (worksheet['A9']) {
      worksheet['A9'].s = {
        font: { bold: true, sz: 12, color: { rgb: "000000" } },
        alignment: { horizontal: "left", vertical: "center" },
        fill: { fgColor: { rgb: "F0F8FF" } }
      };
    }

    // Style column headers (row 11) with bold and background color
    const columnHeaders = Object.keys(processedData[0] || {});
    const headerRow = 10; // Row 11 (0-indexed is 10)
    
    for (let col = 0; col < columnHeaders.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center" },
          fill: { fgColor: { rgb: "4472C4" } },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } }
          }
        };
      }
    }

    // Style data rows with alternating colors and borders
    const dataStartRow = 11; // Row 12 (0-indexed is 11)
    const dataEndRow = headerRow + processedData.length;
    
    for (let row = dataStartRow; row <= dataEndRow; row++) {
      for (let col = 0; col < columnHeaders.length; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (worksheet[cellAddress]) {
          const isEvenRow = (row - dataStartRow) % 2 === 0;
          worksheet[cellAddress].s = {
            font: { sz: 10, color: { rgb: "000000" } },
            alignment: { horizontal: col === 0 ? "center" : "left", vertical: "center" },
            fill: { fgColor: { rgb: isEvenRow ? "FFFFFF" : "F8F9FA" } },
            border: {
              top: { style: "thin", color: { rgb: "D1D5DB" } },
              bottom: { style: "thin", color: { rgb: "D1D5DB" } },
              left: { style: "thin", color: { rgb: "D1D5DB" } },
              right: { style: "thin", color: { rgb: "D1D5DB" } }
            }
          };

          // Special styling for status column
          if (columnHeaders[col] === 'Status') {
            const status = worksheet[cellAddress].v?.toLowerCase();
            let statusColor = "6B7280"; // Default gray
            
            if (status === 'active') statusColor = "059669"; // Green
            else if (status === 'pending') statusColor = "D97706"; // Orange
            else if (status === 'expired') statusColor = "DC2626"; // Red
            else if (status === 'terminated') statusColor = "374151"; // Dark gray

            worksheet[cellAddress].s.font.color = { rgb: statusColor };
            worksheet[cellAddress].s.font.bold = true;
            worksheet[cellAddress].s.alignment.horizontal = "center";
          }

          // Special styling for monetary columns
          if (columnHeaders[col].includes('Rent') || columnHeaders[col].includes('Deposit')) {
            worksheet[cellAddress].s.alignment.horizontal = "right";
            worksheet[cellAddress].s.font.color = { rgb: "059669" }; // Green for money
          }
        }
      }
    }

    // Merge cells for main headers
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push(
      { s: { r: 1, c: 0 }, e: { r: 1, c: 12 } }, // Main title "LEASES REPORT"
      { s: { r: 8, c: 0 }, e: { r: 8, c: 12 } }  // "LEASE DETAILS"
    );

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lease Report');

    // Generate filename and save
    const filename = `Lease_Management_Report_${currentDate.toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);

    return {
      success: true,
      message: `Excel report exported successfully! ${totalLeases} records exported.`,
      filename: filename,
      recordCount: totalLeases
    };
    
  } catch (error) {
    return {
      success: false,
      error: 'Failed to export Excel file'
    };
  }
};

/**
 * Export lease data to PDF format using React PDF renderer
 * @param {Array} exportData - Array of lease data to export
 * @param {Object} filters - Applied filters (statusFilter, dateFilter)
 * @returns {Promise<Object>} - Result object with success status and message
 */
export const exportLeasesToPDF = async (exportData, filters) => {
  try {
    // Dynamic imports
    const { previewPDF } = await import('../reports/utils/pdfGenerator');
    const LeaseReportTemplate = (await import('../reports/templates/LeaseReportTemplate')).default;
    
    // Prepare report metadata
    const currentDate = new Date();
    const reportMetadata = {
      reportDate: currentDate.toLocaleDateString(),
      reportTime: currentDate.toLocaleTimeString(),
    };

    // Prepare filters information
    const filtersInfo = {
      statusFilter: filters.statusFilter || 'All',
      dateRange: `${filters.dateFilter.startDate} to ${filters.dateFilter.endDate}`
    };

    // Generate filename for reference (not used in preview mode)
    const filename = `Lease_Management_Report_${currentDate.toISOString().split('T')[0]}.pdf`;

    // Generate and preview PDF in browser
    const result = await previewPDF(
      <LeaseReportTemplate 
        leases={exportData} 
        reportMetadata={reportMetadata}
        filters={filtersInfo}
      />,
      { leases: exportData, reportMetadata, filters: filtersInfo }
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