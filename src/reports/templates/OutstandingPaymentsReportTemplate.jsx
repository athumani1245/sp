import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 11,
    fontFamily: 'Times-Roman',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: 2,
    borderBottomColor: '#dc2626',
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
    fontFamily: 'Times-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 5,
    fontFamily: 'Times-Roman',
  },
  metadataSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fef2f2',
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
    fontSize: 11,
    fontFamily: 'Times-Bold',
  },
  metadataValue: {
    color: '#333333',
    fontSize: 11,
    fontFamily: 'Times-Roman',
  },
  tableSection: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
    padding: 5,
    fontFamily: 'Times-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 5,
    fontSize: 10,
    fontFamily: 'Times-Roman',
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fef2f2',
    padding: 5,
    fontSize: 10,
    fontFamily: 'Times-Roman',
  },
  // Column widths for outstanding payments
  col1: { width: '16%', paddingRight: 2 }, // Tenant Name
  col2: { width: '16%', paddingRight: 2 }, // Property
  col3: { width: '10%', paddingRight: 2 }, // Unit
  col4: { width: '12%', paddingRight: 2 }, // Lease Number
  col5: { width: '10%', paddingRight: 2 }, // Start Date
  col6: { width: '10%', paddingRight: 2 }, // End Date
  col7: { width: '10%', textAlign: 'right', paddingRight: 2 }, // Total Rent
  col8: { width: '10%', textAlign: 'right', paddingRight: 2 }, // Amount Paid
  col9: { width: '12%', textAlign: 'right' }, // Outstanding

  rentAmount: { color: '#059669' },
  paidAmount: { color: '#0369a1' },
  outstandingAmount: { color: '#dc2626', fontWeight: 'bold' },
  
  statusBadge: {
    padding: 2,
    borderRadius: 2,
    fontSize: 6,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  
  statusNotPaid: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
  },
  
  statusPartialPaid: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  
  statusFullyPaid: {
    backgroundColor: '#f0fdf4',
    color: '#059669',
  },

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
    backgroundColor: '#fef2f2',
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
    fontFamily: 'Times-Bold',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666666',
    fontFamily: 'Times-Roman',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'Times-Bold',
  },
  summaryValueHighlight: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#dc2626',
    fontFamily: 'Times-Bold',
  },
});

const OutstandingPaymentsReportTemplate = ({ payments, reportMetadata, filters }) => {
  // Calculate summary data
  const totalRecords = payments?.length || 0;
  const totalRentAmount = payments?.reduce((sum, payment) => sum + (Number(payment.total_rent) || 0), 0) || 0;
  const totalPaidAmount = payments?.reduce((sum, payment) => sum + (Number(payment.total_amount_paid) || 0), 0) || 0;
  const totalOutstandingAmount = payments?.reduce((sum, payment) => sum + (Number(payment.remaining_amount) || 0), 0) || 0;
  const totalDiscountAmount = payments?.reduce((sum, payment) => sum + (Number(payment.discount) || 0), 0) || 0;
  
  const fullyPaidCount = payments?.filter(payment => payment.payment_status === 'FULLY PAID').length || 0;
  const partiallyPaidCount = payments?.filter(payment => payment.payment_status === 'PARTIALLY PAID').length || 0;
  const notPaidCount = payments?.filter(payment => payment.payment_status === 'NOT PAID').length || 0;
  
  const collectionRate = totalRentAmount > 0 ? Math.round((totalPaidAmount / totalRentAmount) * 100) : 0;

  const formatCurrency = (amount) => {
    return `TSh ${(Number(amount) || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getStatusStyle = (status) => {
    const baseStyle = { ...styles.statusBadge };
    switch (status) {
      case 'FULLY PAID':
        return { ...baseStyle, ...styles.statusFullyPaid };
      case 'PARTIALLY PAID':
        return { ...baseStyle, ...styles.statusPartialPaid };
      case 'NOT PAID':
        return { ...baseStyle, ...styles.statusNotPaid };
      default:
        return baseStyle;
    }
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>OUTSTANDING PAYMENTS REPORT</Text>
          <Text style={styles.subtitle}>Tenant Payment Status & Outstanding Balances</Text>
        </View>

        {/* Metadata Section */}
        <View style={styles.metadataSection}>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Report Generated:</Text>
            <Text style={styles.metadataValue}>{reportMetadata?.reportDate || new Date().toLocaleDateString()}</Text>
            <Text style={styles.metadataLabel}>Time:</Text>
            <Text style={styles.metadataValue}>{reportMetadata?.reportTime || new Date().toLocaleTimeString()}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Total Records:</Text>
            <Text style={styles.metadataValue}>{totalRecords}</Text>
            <Text style={styles.metadataLabel}>Collection Rate:</Text>
            <Text style={styles.metadataValue}>{collectionRate}%</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Date Range:</Text>
            <Text style={styles.metadataValue}>{filters?.dateRange || 'All Time'}</Text>
            <Text style={styles.metadataLabel}>Status Filter:</Text>
            <Text style={styles.metadataValue}>{filters?.statusFilter || 'All'}</Text>
          </View>
        </View>

        {/* Table Section */}
        <View style={styles.tableSection}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Tenant Name</Text>
            <Text style={styles.col2}>Property</Text>
            <Text style={styles.col3}>Unit</Text>
            <Text style={styles.col4}>Lease No.</Text>
            <Text style={styles.col5}>Start Date</Text>
            <Text style={styles.col6}>End Date</Text>
            <Text style={styles.col7}>Total Rent</Text>
            <Text style={styles.col8}>Paid</Text>
            <Text style={styles.col9}>Outstanding</Text>
          </View>

          {/* Table Rows */}
          {payments?.map((payment, index) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.col1}>{payment.tenant_full_name || 'N/A'}</Text>
              <Text style={styles.col2}>{payment.property || 'N/A'}</Text>
              <Text style={styles.col3}>{payment.unit || 'N/A'}</Text>
              <Text style={styles.col4}>{payment.lease_number || 'N/A'}</Text>
              <Text style={styles.col5}>{formatDate(payment.start_date)}</Text>
              <Text style={styles.col6}>{formatDate(payment.end_date)}</Text>
              <Text style={[styles.col7, styles.rentAmount]}>{formatCurrency(payment.total_rent)}</Text>
              <Text style={[styles.col8, styles.paidAmount]}>{formatCurrency(payment.total_amount_paid)}</Text>
              <Text style={[styles.col9, styles.outstandingAmount]}>{formatCurrency(payment.remaining_amount)}</Text>
            </View>
          ))}
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>PAYMENT SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Expected Rent:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalRentAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount Paid:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalPaidAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Outstanding:</Text>
            <Text style={styles.summaryValueHighlight}>{formatCurrency(totalOutstandingAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Discounts:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalDiscountAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Collection Rate:</Text>
            <Text style={styles.summaryValue}>{collectionRate}%</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Status Breakdown:</Text>
            <Text style={styles.summaryValue}>
              Fully Paid: {fullyPaidCount} | Partially Paid: {partiallyPaidCount} | Not Paid: {notPaidCount}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Outstanding Payments Report - Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</Text>
          <Text>Total Outstanding Amount: {formatCurrency(totalOutstandingAmount)} | Collection Rate: {collectionRate}%</Text>
        </View>
      </Page>
    </Document>
  );
};

export default OutstandingPaymentsReportTemplate;