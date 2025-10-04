import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: 2,
    borderBottomColor: '#1f5188',
    paddingBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f5188',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 5,
  },
  metadataSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  metadataLabel: {
    fontWeight: 'bold',
    color: '#666666',
    fontSize: 9,
  },
  metadataValue: {
    color: '#333333',
    fontSize: 9,
  },
  tableSection: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4472c4',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 9,
    padding: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 5,
    fontSize: 8,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f8f9fa',
    padding: 5,
    fontSize: 8,
  },
  col1: { width: '14%', paddingRight: 3 }, // Lease No
  col2: { width: '22%', paddingRight: 3 }, // Tenant
  col3: { width: '18%', paddingRight: 3 }, // Property
  col4: { width: '10%', paddingRight: 3 },  // Unit
  col5: { width: '12%', paddingRight: 3 }, // Start Date
  col6: { width: '12%', paddingRight: 3 }, // End Date
  col7: { width: '12%', textAlign: 'right' }, // Rent

  rentAmount: { color: '#059669' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#666666',
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  summarySection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f5188',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryLabel: {
    fontWeight: 'bold',
    color: '#333333',
    fontSize: 9,
  },
  summaryValue: {
    color: '#059669',
    fontSize: 9,
    fontWeight: 'bold',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    fontSize: 8,
    color: '#999999',
  },
});

// Format currency function
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'TSh 0';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'TSh 0';
  return `TSh ${numAmount.toLocaleString()}`;
};

// Format date function
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};



const LeaseReportTemplate = ({ leases, reportMetadata, filters }) => {
  // Calculate summary statistics
  const totalLeases = leases.length;
  const activeLeases = leases.filter(lease => lease.status === 'active').length;
  const totalRent = leases.reduce((sum, lease) => {
    let rent = 0;
    if (lease.monthly_rent) rent = Number(lease.monthly_rent);
    else if (lease.rent_amount_per_unit) rent = Number(lease.rent_amount_per_unit);
    else if (typeof lease.unit === 'object' && lease.unit?.rent_per_month) rent = Number(lease.unit.rent_per_month);
    return sum + (isNaN(rent) ? 0 : rent);
  }, 0);

  // Split data into pages (roughly 30 rows per page)
  const rowsPerPage = 30;
  const pages = [];
  for (let i = 0; i < leases.length; i += rowsPerPage) {
    pages.push(leases.slice(i, i + rowsPerPage));
  }

  return (
    <Document>
      {pages.map((pageData, pageIndex) => (
        <Page key={pageIndex} size="A4" orientation="landscape" style={styles.page}>
          {/* Header - only on first page */}
          {pageIndex === 0 && (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>TANAKA PROPERTY MANAGEMENT</Text>
                <Text style={styles.subtitle}>LEASES REPORT</Text>
              </View>

              {/* Metadata Section */}
              <View style={styles.metadataSection}>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Generated:</Text>
                  <Text style={styles.metadataValue}>{reportMetadata.reportDate} at {reportMetadata.reportTime}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Total Leases:</Text>
                  <Text style={styles.metadataValue}>{totalLeases}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Active Leases:</Text>
                  <Text style={styles.metadataValue}>{activeLeases}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Status Filter:</Text>
                  <Text style={styles.metadataValue}>{filters.statusFilter || 'All'}</Text>
                </View>
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Date Range:</Text>
                  <Text style={styles.metadataValue}>{filters.dateRange}</Text>
                </View>
              </View>
            </>
          )}

          {/* Table Section */}
          <View style={styles.tableSection}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Lease No.</Text>
              <Text style={styles.col2}>Tenant</Text>
              <Text style={styles.col3}>Property</Text>
              <Text style={styles.col4}>Unit</Text>
              <Text style={styles.col5}>Start Date</Text>
              <Text style={styles.col6}>End Date</Text>
              <Text style={styles.col7}>Monthly Rent</Text>
            </View>

            {/* Table Rows */}
            {pageData.map((lease, index) => {
              const tenant = typeof lease.tenant === 'object' && lease.tenant !== null 
                ? `${lease.tenant.first_name || ''} ${lease.tenant.last_name || ''}`.trim() 
                : lease.tenant || 'N/A';
                
              const property = typeof lease.property === 'object' && lease.property !== null 
                ? lease.property.property_name || lease.property.name || 'N/A'
                : lease.property || 'N/A';
                
              const unit = typeof lease.unit === 'object' && lease.unit !== null 
                ? lease.unit.unit_name || lease.unit.id || 'N/A'
                : lease.unit || 'N/A';
                
              let monthlyRent = 0;
              if (lease.monthly_rent) monthlyRent = Number(lease.monthly_rent);
              else if (lease.rent_amount_per_unit) monthlyRent = Number(lease.rent_amount_per_unit);
              else if (typeof lease.unit === 'object' && lease.unit?.rent_per_month) monthlyRent = Number(lease.unit.rent_per_month);

              const isAltRow = index % 2 === 1;
              const rowStyle = isAltRow ? styles.tableRowAlt : styles.tableRow;

              return (
                <View key={lease.id || index} style={rowStyle}>
                  <Text style={styles.col1}>
                    {lease.lease_number || lease.lease_code || `LEASE-${lease.id}`}
                  </Text>
                  <Text style={styles.col2}>{tenant}</Text>
                  <Text style={styles.col3}>{property}</Text>
                  <Text style={styles.col4}>{unit}</Text>
                  <Text style={styles.col5}>
                    {lease.start_date ? formatDate(lease.start_date) : 'N/A'}
                  </Text>
                  <Text style={styles.col6}>
                    {lease.end_date ? formatDate(lease.end_date) : 'N/A'}
                  </Text>
                  <Text style={[styles.col7, styles.rentAmount]}>
                    {formatCurrency(isNaN(monthlyRent) ? 0 : monthlyRent)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Summary Section - only on last page */}
          {pageIndex === pages.length - 1 && (
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>REPORT SUMMARY</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Leases:</Text>
                <Text style={styles.summaryValue}>{totalLeases}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Active Leases:</Text>
                <Text style={styles.summaryValue}>{activeLeases}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Monthly Rent:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(totalRent)}</Text>
              </View>
            </View>
          )}

          {/* Page Number */}
          <Text style={styles.pageNumber}>
            Page {pageIndex + 1} of {pages.length}
          </Text>

          {/* Footer - only on last page */}
          {pageIndex === pages.length - 1 && (
            <View style={styles.footer}>
              <Text>Generated by Tanaka Property Management on {reportMetadata.reportDate}</Text>
              <Text>This document is computer generated</Text>
            </View>
          )}
        </Page>
      ))}
    </Document>
  );
};

export default LeaseReportTemplate;