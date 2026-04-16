import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import { formatLeaseDate } from '../utils/leaseDate';

interface LeaseReportData {
  lease_number: string;
  tenant: string;
  property: string;
  unit: string;
  start_date: string;
  end_date: string;
  rent_expected: number;
  amount_paid: number;
  amount_to_be_paid: number;
  overpayment: number;
  remaining_days: number;
  lease_status: string;
  payment_status: string;
}

interface ColumnConfig {
  title: string;
  dataIndex: keyof LeaseReportData;
  formatter?: (value: any) => any;
}

interface ExportOptions {
  data: LeaseReportData[];
  visibleColumns: string[];
  filename?: string;
}

/**
 * Column mapping for lease report exports
 */
const LEASE_REPORT_COLUMNS: { [key: string]: ColumnConfig } = {
  lease_number: { 
    title: 'Lease No.', 
    dataIndex: 'lease_number' 
  },
  tenant: { 
    title: 'Tenant', 
    dataIndex: 'tenant' 
  },
  property: { 
    title: 'Property', 
    dataIndex: 'property' 
  },
  unit: { 
    title: 'Unit', 
    dataIndex: 'unit' 
  },
  start_date: { 
    title: 'Start Date', 
    dataIndex: 'start_date',
    formatter: (date: string) => formatLeaseDate(date) || 'N/A'
  },
  end_date: { 
    title: 'End Date', 
    dataIndex: 'end_date',
    formatter: (date: string) => formatLeaseDate(date) || 'N/A'
  },
  rent_expected: { 
    title: 'Rent Expected (TSh)', 
    dataIndex: 'rent_expected',
    formatter: (amount: number) => amount || 0
  },
  amount_paid: { 
    title: 'Amount Paid (TSh)', 
    dataIndex: 'amount_paid',
    formatter: (amount: number) => amount || 0
  },
  amount_to_be_paid: { 
    title: 'Amount Due (TSh)', 
    dataIndex: 'amount_to_be_paid',
    formatter: (amount: number) => amount || 0
  },
  overpayment: { 
    title: 'Overpayment (TSh)', 
    dataIndex: 'overpayment',
    formatter: (amount: number) => amount || 0
  },
  remaining_days: { 
    title: 'Remaining Days', 
    dataIndex: 'remaining_days',
    formatter: (days: number) => days || 0
  },
  lease_status: { 
    title: 'Lease Status', 
    dataIndex: 'lease_status',
    formatter: (status: string) => (status || 'unknown').toUpperCase()
  },
  payment_status: { 
    title: 'Payment Status', 
    dataIndex: 'payment_status',
    formatter: (status: string) => status || 'N/A'
  },
};

/**
 * Apply Excel cell styling
 */
const applyCellStyle = (cell: any, isHeader: boolean, isMonetary: boolean = false) => {
  if (!cell) return;

  const baseStyle: any = {
    font: {
      name: 'Cambria',
      sz: 10,
      bold: isHeader,
    },
    alignment: {
      horizontal: isMonetary ? 'right' : isHeader ? 'center' : 'left',
      vertical: 'center',
    },
  };

  // Add background color for headers
  if (isHeader) {
    baseStyle.fill = {
      patternType: 'solid',
      fgColor: { rgb: 'D3D3D3' },
    };
  }

  // Apply the style
  cell.s = baseStyle;

  // Format monetary values
  if (isMonetary && typeof cell.v === 'number') {
    cell.z = '#,##0.00';
  }
};

/**
 * Export lease report data to Excel
 */
export const exportLeaseReportToExcel = (options: ExportOptions): void => {
  const { data, visibleColumns, filename } = options;

  try {
    // Filter columns based on visibility
    const visibleColumnKeys = visibleColumns.filter(
      key => LEASE_REPORT_COLUMNS[key]
    );

    // Create worksheet data
    const worksheetData = data.map((item: LeaseReportData) => {
      const row: any = {};
      visibleColumnKeys.forEach(key => {
        const column = LEASE_REPORT_COLUMNS[key];
        if (column) {
          const value = item[column.dataIndex];
          row[column.title] = column.formatter ? column.formatter(value) : (value || 'N/A');
        }
      });
      return row;
    });

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lease Report');

    // Set column widths
    const columnWidths = visibleColumnKeys.map(key => {
      const column = LEASE_REPORT_COLUMNS[key];
      return { wch: Math.max(column.title.length + 5, 15) };
    });
    worksheet['!cols'] = columnWidths;

    // Apply styling to cells
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Style header row
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      applyCellStyle(worksheet[cellAddress], true);
    }

    // Style data rows
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const columnKey = visibleColumnKeys[col];
        const isMonetary = ['rent_expected', 'amount_paid', 'amount_to_be_paid', 'overpayment'].includes(columnKey);
        
        applyCellStyle(worksheet[cellAddress], false, isMonetary);
      }
    }

    // Generate filename with timestamp if not provided
    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    const exportFilename = filename || `Lease_Report_${timestamp}.xlsx`;

    // Save file (xlsx-js-style automatically applies cell styles)
    XLSX.writeFile(workbook, exportFilename);
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Failed to export data to Excel');
  }
};

/**
 * Export lease report data to PDF
 */
export const exportLeaseReportToPDF = (options: ExportOptions): void => {
  const { data, visibleColumns, filename } = options;

  try {
    const visibleColumnKeys = visibleColumns.filter(key => LEASE_REPORT_COLUMNS[key]);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 30;
    const usableWidth = pageWidth - margin * 2;
    const rowHeight = 18;
    const headerRowHeight = 22;
    const titleAreaHeight = 48;
    const footerHeight = 20;
    const contentMaxY = pageHeight - footerHeight - 5;

    // Proportional column widths
    const colWidthMap: { [key: string]: number } = {
      lease_number: 70,
      tenant: 90,
      property: 90,
      unit: 60,
      start_date: 65,
      end_date: 65,
      rent_expected: 75,
      amount_paid: 75,
      amount_to_be_paid: 70,
      overpayment: 70,
      remaining_days: 55,
      lease_status: 60,
      payment_status: 65,
    };

    const totalDefinedWidth = visibleColumnKeys.reduce((s, k) => s + (colWidthMap[k] || 70), 0);
    const scale = usableWidth / totalDefinedWidth;
    const colWidths = visibleColumnKeys.map(k => (colWidthMap[k] || 70) * scale);

    let y = margin;
    let currentPage = 1;

    // Calculate total pages
    const firstPageRows = Math.floor((contentMaxY - margin - titleAreaHeight - headerRowHeight) / rowHeight);
    const otherPageRows = Math.floor((contentMaxY - margin - headerRowHeight) / rowHeight);
    let totalPages = 1;
    if (data.length > firstPageRows) {
      totalPages += Math.ceil((data.length - firstPageRows) / Math.max(otherPageRows, 1));
    }

    const truncate = (text: string, maxWidth: number): string => {
      if (doc.getTextWidth(text) <= maxWidth) return text;
      let t = text;
      while (t.length > 1 && doc.getTextWidth(t + '…') > maxWidth) {
        t = t.slice(0, -1);
      }
      return t + '…';
    };

    const drawTitle = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text('Lease Report', margin, y + 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text(
        `Generated: ${dayjs().format('DD/MM/YYYY HH:mm')}   |   Total Records: ${data.length}`,
        margin,
        y + 32
      );
      y += titleAreaHeight;
    };

    const drawTableHeader = (startY: number) => {
      doc.setFillColor(59, 130, 246);
      doc.rect(margin, startY, usableWidth, headerRowHeight, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);

      let x = margin;
      visibleColumnKeys.forEach((key, i) => {
        const col = LEASE_REPORT_COLUMNS[key];
        const text = truncate(col.title, colWidths[i] - 6);
        doc.text(text, x + 3, startY + headerRowHeight - 6);
        x += colWidths[i];
      });
    };

    const drawFooter = (pageNum: number, total: number) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      const fy = pageHeight - 12;
      doc.text('Tanaka Property Management', margin, fy);
      doc.text(`Page ${pageNum} of ${total}`, pageWidth / 2, fy, { align: 'center' });
      doc.text(dayjs().format('DD/MM/YYYY'), pageWidth - margin, fy, { align: 'right' });
    };

    const drawGridLines = (tableStartY: number, tableEndY: number) => {
      // Outer border
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.5);
      doc.rect(margin, tableStartY, usableWidth, tableEndY - tableStartY, 'S');

      // Column dividers
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      let x = margin;
      for (let i = 0; i < colWidths.length - 1; i++) {
        x += colWidths[i];
        doc.line(x, tableStartY, x, tableEndY);
      }

      // Row dividers
      doc.setDrawColor(225, 225, 225);
      doc.setLineWidth(0.2);
      let ry = tableStartY + headerRowHeight + rowHeight;
      while (ry < tableEndY) {
        doc.line(margin, ry, margin + usableWidth, ry);
        ry += rowHeight;
      }
      // Line between header and first data row
      doc.setDrawColor(170, 170, 170);
      doc.setLineWidth(0.4);
      doc.line(margin, tableStartY + headerRowHeight, margin + usableWidth, tableStartY + headerRowHeight);
    };

    // --- Render ---
    drawTitle();

    let tableStartY = y;
    drawTableHeader(tableStartY);
    y += headerRowHeight;

    data.forEach((item, index) => {
      if (y + rowHeight > contentMaxY) {
        drawGridLines(tableStartY, y);
        drawFooter(currentPage, totalPages);

        doc.addPage();
        currentPage++;
        y = margin;
        tableStartY = y;
        drawTableHeader(tableStartY);
        y += headerRowHeight;
      }

      // Alternating row background
      if (index % 2 === 0) {
        doc.setFillColor(247, 250, 252);
        doc.rect(margin, y, usableWidth, rowHeight, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      let x = margin;
      visibleColumnKeys.forEach((key, i) => {
        const col = LEASE_REPORT_COLUMNS[key];
        const value = item[col.dataIndex];

        let text: string;
        if (['rent_expected', 'amount_paid', 'amount_to_be_paid', 'overpayment'].includes(key)) {
          text = `TSh ${((value as number) || 0).toLocaleString()}`;
        } else if (col.formatter) {
          text = String(col.formatter(value));
        } else {
          text = String(value || 'N/A');
        }

        // Color coded status columns
        if (key === 'lease_status') {
          const s = (value as string || '').toLowerCase();
          if (s === 'active') doc.setTextColor(22, 101, 52);
          else if (s === 'expired' || s === 'terminated') doc.setTextColor(185, 28, 28);
          else if (s === 'draft') doc.setTextColor(90, 90, 90);
          else doc.setTextColor(50, 50, 50);
        } else if (key === 'payment_status') {
          const s = (value as string || '').toLowerCase();
          if (s === 'paid') doc.setTextColor(22, 101, 52);
          else if (s === 'unpaid') doc.setTextColor(185, 28, 28);
          else if (s === 'partial') doc.setTextColor(161, 85, 0);
          else if (s === 'overpaid') doc.setTextColor(23, 92, 164);
          else doc.setTextColor(50, 50, 50);
        } else if (['rent_expected', 'amount_paid', 'amount_to_be_paid', 'overpayment'].includes(key)) {
          doc.setTextColor(30, 30, 30);
        } else {
          doc.setTextColor(50, 50, 50);
        }

        const truncated = truncate(text, colWidths[i] - 6);
        doc.text(truncated, x + 3, y + rowHeight - 5);
        x += colWidths[i];
      });

      y += rowHeight;
    });

    drawGridLines(tableStartY, y);
    drawFooter(currentPage, totalPages);

    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    const exportFilename = filename || `Lease_Report_${timestamp}.pdf`;
    doc.save(exportFilename);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to export data to PDF');
  }
};

/**
 * Get formatted data for export (useful for preview or custom exports)
 */
export const getFormattedLeaseReportData = (
  data: LeaseReportData[],
  visibleColumns: string[]
): any[] => {
  const visibleColumnKeys = visibleColumns.filter(
    key => LEASE_REPORT_COLUMNS[key]
  );

  return data.map((item: LeaseReportData) => {
    const row: any = {};
    visibleColumnKeys.forEach(key => {
      const column = LEASE_REPORT_COLUMNS[key];
      if (column) {
        const value = item[column.dataIndex];
        row[column.title] = column.formatter ? column.formatter(value) : (value || 'N/A');
      }
    });
    return row;
  });
};

// ==========================================
// Lease Expiry Report
// ==========================================

interface LeaseExpiryReportData {
  lease_number: string;
  tenant: string;
  property: string;
  unit: string;
  start_date: string;
  end_date: string;
  rent_expected: number;
  amount_paid: number;
  amount_to_be_paid: number;
  overpayment: number;
  remaining_days: number;
  lease_status: string;
}

interface LeaseExpiryExportOptions {
  data: LeaseExpiryReportData[];
  visibleColumns: string[];
  filename?: string;
}

const LEASE_EXPIRY_REPORT_COLUMNS: { [key: string]: { title: string; dataIndex: keyof LeaseExpiryReportData; formatter?: (value: any) => any } } = {
  lease_number: { title: 'Lease No.', dataIndex: 'lease_number' },
  tenant: { title: 'Tenant', dataIndex: 'tenant' },
  property: { title: 'Property', dataIndex: 'property' },
  unit: { title: 'Unit', dataIndex: 'unit' },
  start_date: { title: 'Start Date', dataIndex: 'start_date', formatter: (date: string) => formatLeaseDate(date) || 'N/A' },
  end_date: { title: 'End Date', dataIndex: 'end_date', formatter: (date: string) => formatLeaseDate(date) || 'N/A' },
  rent_expected: { title: 'Rent Expected (TSh)', dataIndex: 'rent_expected', formatter: (amount: number) => amount || 0 },
  amount_paid: { title: 'Amount Paid (TSh)', dataIndex: 'amount_paid', formatter: (amount: number) => amount || 0 },
  amount_to_be_paid: { title: 'Amount Due (TSh)', dataIndex: 'amount_to_be_paid', formatter: (amount: number) => amount || 0 },
  overpayment: { title: 'Overpayment (TSh)', dataIndex: 'overpayment', formatter: (amount: number) => amount || 0 },
  remaining_days: { title: 'Remaining Days', dataIndex: 'remaining_days', formatter: (days: number) => days || 0 },
  lease_status: { title: 'Lease Status', dataIndex: 'lease_status', formatter: (status: string) => (status || 'unknown').toUpperCase() },
};

export const exportLeaseExpiryReportToExcel = (options: LeaseExpiryExportOptions): void => {
  const { data, visibleColumns, filename } = options;

  try {
    const visibleColumnKeys = visibleColumns.filter(key => LEASE_EXPIRY_REPORT_COLUMNS[key]);

    const worksheetData = data.map((item: LeaseExpiryReportData) => {
      const row: any = {};
      visibleColumnKeys.forEach(key => {
        const column = LEASE_EXPIRY_REPORT_COLUMNS[key];
        if (column) {
          const value = item[column.dataIndex];
          row[column.title] = column.formatter ? column.formatter(value) : (value || 'N/A');
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lease Expiry Report');

    const columnWidths = visibleColumnKeys.map(key => {
      const column = LEASE_EXPIRY_REPORT_COLUMNS[key];
      return { wch: Math.max(column.title.length + 5, 15) };
    });
    worksheet['!cols'] = columnWidths;

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      applyCellStyle(worksheet[cellAddress], true);
    }
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const columnKey = visibleColumnKeys[col];
        const isMonetary = ['rent_expected', 'amount_paid', 'amount_to_be_paid', 'overpayment'].includes(columnKey);
        applyCellStyle(worksheet[cellAddress], false, isMonetary);
      }
    }

    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    const exportFilename = filename || `Lease_Expiry_Report_${timestamp}.xlsx`;
    XLSX.writeFile(workbook, exportFilename);
  } catch (error) {
    console.error('Excel export error:', error);
    throw new Error('Failed to export data to Excel');
  }
};

export const exportLeaseExpiryReportToPDF = (options: LeaseExpiryExportOptions): void => {
  const { data, visibleColumns, filename } = options;

  try {
    const visibleColumnKeys = visibleColumns.filter(key => LEASE_EXPIRY_REPORT_COLUMNS[key]);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 30;
    const usableWidth = pageWidth - margin * 2;
    const rowHeight = 18;
    const headerRowHeight = 22;
    const titleAreaHeight = 48;
    const footerHeight = 20;
    const contentMaxY = pageHeight - footerHeight - 5;

    const colWidthMap: { [key: string]: number } = {
      lease_number: 70,
      tenant: 90,
      property: 90,
      unit: 60,
      start_date: 65,
      end_date: 65,
      rent_expected: 75,
      amount_paid: 75,
      amount_to_be_paid: 70,
      overpayment: 70,
      remaining_days: 55,
      lease_status: 65,
    };

    const totalDefinedWidth = visibleColumnKeys.reduce((s, k) => s + (colWidthMap[k] || 70), 0);
    const scale = usableWidth / totalDefinedWidth;
    const colWidths = visibleColumnKeys.map(k => (colWidthMap[k] || 70) * scale);

    let y = margin;
    let currentPage = 1;

    const firstPageRows = Math.floor((contentMaxY - margin - titleAreaHeight - headerRowHeight) / rowHeight);
    const otherPageRows = Math.floor((contentMaxY - margin - headerRowHeight) / rowHeight);
    let totalPages = 1;
    if (data.length > firstPageRows) {
      totalPages += Math.ceil((data.length - firstPageRows) / Math.max(otherPageRows, 1));
    }

    const truncate = (text: string, maxWidth: number): string => {
      if (doc.getTextWidth(text) <= maxWidth) return text;
      let t = text;
      while (t.length > 1 && doc.getTextWidth(t + '…') > maxWidth) {
        t = t.slice(0, -1);
      }
      return t + '…';
    };

    const drawTitle = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text('Lease Expiry Report', margin, y + 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(110, 110, 110);
      doc.text(
        `Generated: ${dayjs().format('DD/MM/YYYY HH:mm')}   |   Total Records: ${data.length}`,
        margin,
        y + 32
      );
      y += titleAreaHeight;
    };

    const drawTableHeader = (startY: number) => {
      doc.setFillColor(59, 130, 246);
      doc.rect(margin, startY, usableWidth, headerRowHeight, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);

      let x = margin;
      visibleColumnKeys.forEach((key, i) => {
        const col = LEASE_EXPIRY_REPORT_COLUMNS[key];
        const text = truncate(col.title, colWidths[i] - 6);
        doc.text(text, x + 3, startY + headerRowHeight - 6);
        x += colWidths[i];
      });
    };

    const drawFooter = (pageNum: number, total: number) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      const fy = pageHeight - 12;
      doc.text('Tanaka Property Management', margin, fy);
      doc.text(`Page ${pageNum} of ${total}`, pageWidth / 2, fy, { align: 'center' });
      doc.text(dayjs().format('DD/MM/YYYY'), pageWidth - margin, fy, { align: 'right' });
    };

    const drawGridLines = (tableStartY: number, tableEndY: number) => {
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.5);
      doc.rect(margin, tableStartY, usableWidth, tableEndY - tableStartY, 'S');

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      let x = margin;
      for (let i = 0; i < colWidths.length - 1; i++) {
        x += colWidths[i];
        doc.line(x, tableStartY, x, tableEndY);
      }

      doc.setDrawColor(225, 225, 225);
      doc.setLineWidth(0.2);
      let ry = tableStartY + headerRowHeight + rowHeight;
      while (ry < tableEndY) {
        doc.line(margin, ry, margin + usableWidth, ry);
        ry += rowHeight;
      }
      doc.setDrawColor(170, 170, 170);
      doc.setLineWidth(0.4);
      doc.line(margin, tableStartY + headerRowHeight, margin + usableWidth, tableStartY + headerRowHeight);
    };

    drawTitle();

    let tableStartY = y;
    drawTableHeader(tableStartY);
    y += headerRowHeight;

    data.forEach((item, index) => {
      if (y + rowHeight > contentMaxY) {
        drawGridLines(tableStartY, y);
        drawFooter(currentPage, totalPages);

        doc.addPage();
        currentPage++;
        y = margin;
        tableStartY = y;
        drawTableHeader(tableStartY);
        y += headerRowHeight;
      }

      if (index % 2 === 0) {
        doc.setFillColor(247, 250, 252);
        doc.rect(margin, y, usableWidth, rowHeight, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      let x = margin;
      visibleColumnKeys.forEach((key, i) => {
        const col = LEASE_EXPIRY_REPORT_COLUMNS[key];
        const value = item[col.dataIndex];

        let text: string;
        if (['rent_expected', 'amount_paid', 'amount_to_be_paid', 'overpayment'].includes(key)) {
          text = `TSh ${((value as number) || 0).toLocaleString()}`;
        } else if (col.formatter) {
          text = String(col.formatter(value));
        } else {
          text = String(value || 'N/A');
        }

        if (key === 'lease_status') {
          const s = (value as string || '').toLowerCase();
          if (s === 'active') doc.setTextColor(22, 101, 52);
          else if (s === 'expired' || s === 'terminated') doc.setTextColor(185, 28, 28);
          else if (s === 'expiring') doc.setTextColor(161, 85, 0);
          else if (s === 'draft') doc.setTextColor(90, 90, 90);
          else doc.setTextColor(50, 50, 50);
        } else if (['rent_expected', 'amount_paid', 'amount_to_be_paid', 'overpayment'].includes(key)) {
          doc.setTextColor(30, 30, 30);
        } else {
          doc.setTextColor(50, 50, 50);
        }

        const truncated = truncate(text, colWidths[i] - 6);
        doc.text(truncated, x + 3, y + rowHeight - 5);
        x += colWidths[i];
      });

      y += rowHeight;
    });

    drawGridLines(tableStartY, y);
    drawFooter(currentPage, totalPages);

    const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
    const exportFilename = filename || `Lease_Expiry_Report_${timestamp}.pdf`;
    doc.save(exportFilename);
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Failed to export data to PDF');
  }
};
