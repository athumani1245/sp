import * as XLSX from 'xlsx-js-style';
import dayjs from 'dayjs';

interface LeaseReportData {
  lease_number: string;
  tenant: string;
  property: string;
  unit: string;
  start_date: string;
  end_date: string;
  rent_amount_per_unit: string;
  lease_status: string;
  duration: number;
  remaining_days: number;
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
    formatter: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
  },
  end_date: { 
    title: 'End Date', 
    dataIndex: 'end_date',
    formatter: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A'
  },
  monthly_rent: { 
    title: 'Monthly Rent (TSh)', 
    dataIndex: 'rent_amount_per_unit',
    formatter: (rent: string) => parseFloat(rent || '0')
  },
  status: { 
    title: 'Status', 
    dataIndex: 'lease_status',
    formatter: (status: string) => (status || 'unknown').toUpperCase()
  },
  duration: { 
    title: 'Duration (Days)', 
    dataIndex: 'duration',
    formatter: (days: number) => days || 0
  },
  remaining_days: { 
    title: 'Remaining Days', 
    dataIndex: 'remaining_days',
    formatter: (days: number) => days || 0
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
        const isMonetary = columnKey === 'monthly_rent';
        
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
 * @param options Export options
 */
export const exportLeaseReportToPDF = (options: ExportOptions): void => {
  // TODO: Implement PDF export functionality
  throw new Error('PDF export is not yet implemented');
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
