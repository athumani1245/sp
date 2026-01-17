/**
 * Report type definitions
 * Defines all available report types and their configurations
 */

export const REPORT_TYPES = [
  {
    id: 'lease_agreements',
    title: 'Lease Agreements',
    description: 'Generate PDF documents for individual lease agreements',
    icon: 'bi-file-earmark-text',
    color: 'primary',
    category: 'Leases',
    requiresSelection: true,
    dataSource: 'leases'
  },
  {
    id: 'property_summary',
    title: 'Property Summary Report',
    description: 'Overview of all properties with units and occupancy status',
    icon: 'bi-building',
    color: 'success',
    category: 'Properties',
    requiresSelection: false,
    dataSource: 'properties'
  },
  {
    id: 'units_availability',
    title: 'Units Availability Report',
    description: 'Current availability status of all property units',
    icon: 'bi-door-open',
    color: 'success',
    category: 'Properties',
    requiresSelection: false,
    dataSource: 'properties'
  },
  {
    id: 'property_performance',
    title: 'Property Performance Report',
    description: 'Financial and operational performance metrics by property',
    icon: 'bi-graph-up',
    color: 'success',
    category: 'Properties',
    requiresSelection: false,
    dataSource: 'properties'
  },
  {
    id: 'tenant_directory',
    title: 'Tenant Directory',
    description: 'Complete list of all tenants with contact information',
    icon: 'bi-people',
    color: 'info',
    category: 'Tenants',
    requiresSelection: false,
    dataSource: 'tenants'
  },
  {
    id: 'tenant_payment_history',
    title: 'Tenant Payment History',
    description: 'Detailed payment records and transaction history by tenant',
    icon: 'bi-clock-history',
    color: 'info',
    category: 'Tenants',
    requiresSelection: false,
    dataSource: 'tenants'
  },
  {
    id: 'tenant_outstanding_balance',
    title: 'Tenant Outstanding Balance Report',
    description: 'Current outstanding balances and overdue payments by tenant',
    icon: 'bi-exclamation-triangle',
    color: 'info',
    category: 'Tenants',
    requiresSelection: false,
    dataSource: 'tenants'
  },
  {
    id: 'payment_summary',
    title: 'Payment Summary',
    description: 'Financial overview of payments and outstanding balances',
    icon: 'bi-cash-stack',
    color: 'warning',
    category: 'Finances',
    requiresSelection: false,
    dataSource: 'payments'
  },
  {
    id: 'occupancy_report',
    title: 'Occupancy Report',
    description: 'Current occupancy rates and vacancy analysis',
    icon: 'bi-pie-chart',
    color: 'secondary',
    category: 'Analytics',
    requiresSelection: false,
    dataSource: 'properties'
  },
  {
    id: 'lease_expiry',
    title: 'Lease Expiry Report',
    description: 'Upcoming lease expirations and renewal tracking',
    icon: 'bi-calendar-event',
    color: 'danger',
    category: 'Leases',
    requiresSelection: false,
    dataSource: 'leases'
  },
  {
    id: 'lease_renewal_termination',
    title: 'Lease Renewal/Termination Report',
    description: 'Track lease renewals, terminations, and contract changes',
    icon: 'bi-arrow-repeat',
    color: 'primary',
    category: 'Leases',
    requiresSelection: false,
    dataSource: 'leases'
  }
];

export const groupReportsByCategory = (reports) => {
  return reports.reduce((acc, report) => {
    if (!acc[report.category]) {
      acc[report.category] = [];
    }
    acc[report.category].push(report);
    return acc;
  }, {});
};
