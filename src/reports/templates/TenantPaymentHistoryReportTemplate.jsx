import React from 'react';
import PropTypes from 'prop-types';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Using built-in Helvetica font (no registration needed)

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  metaInfo: {
    fontSize: 9,
    color: '#95a5a6',
    marginBottom: 2,
  },
  summarySection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 9,
    color: '#34495e',
    flex: 1,
  },
  summaryValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#2c3e50',
    textAlign: 'right',
    flex: 1,
  },
  tableContainer: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#34495e',
    color: '#FFFFFF',
    padding: 5,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#BDC3C7',
    borderBottomStyle: 'solid',
    minHeight: 22,
    padding: 3,
    fontSize: 9,
  },
  tableRowEven: {
    backgroundColor: '#f9f9f9',
  },
  tableRowOdd: {
    backgroundColor: '#ffffff',
  },
  // Column widths for tenant payment history (without created date)
  colTenant: {
    width: '20%',
    paddingLeft: 3,
    paddingRight: 3,
  },
  colLeaseNumber: {
    width: '15%',
    paddingLeft: 3,
    paddingRight: 3,
  },
  colAmount: {
    width: '15%',
    paddingLeft: 3,
    paddingRight: 3,
    textAlign: 'right',
  },
  colPaymentDate: {
    width: '15%',
    paddingLeft: 3,
    paddingRight: 3,
    textAlign: 'center',
  },
  colCategory: {
    width: '15%',
    paddingLeft: 3,
    paddingRight: 3,
    textAlign: 'center',
  },
  colPaymentSource: {
    width: '20%',
    paddingLeft: 3,
    paddingRight: 3,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#7f8c8d',
    borderTopWidth: 0.5,
    borderTopColor: '#BDC3C7',
    borderTopStyle: 'solid',
    paddingTop: 5,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    fontSize: 8,
    color: '#7f8c8d',
  },
  positiveAmount: {
    color: '#27ae60',
  },
  negativeAmount: {
    color: '#e74c3c',
  },
  noDataMessage: {
    textAlign: 'center',
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 50,
    fontStyle: 'italic',
  },
});

const TenantPaymentHistoryReportTemplate = ({ data = [], metadata = {}, filters = {} }) => {
  // Calculate summary statistics
  const totalPayments = data.length;
  const totalAmount = data.reduce((sum, payment) => sum + Math.abs(parseFloat(payment.amount) || 0), 0);
  const positivePayments = data.filter(payment => (parseFloat(payment.amount) || 0) > 0);
  const negativePayments = data.filter(payment => (parseFloat(payment.amount) || 0) < 0);
  const rentPayments = data.filter(payment => payment.category === 'RENT');
  const otherPayments = data.filter(payment => payment.category !== 'RENT');
  const uniqueTenants = new Set(data.map(payment => payment.tenant)).size;
  const uniqueLeases = new Set(data.map(payment => payment.lease_number)).size;

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'TSh 0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return 'TSh 0';
    return `TSh ${Math.abs(numAmount).toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Split data into chunks for pagination
  const itemsPerPage = 30;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const dataChunks = [];
  
  for (let i = 0; i < totalPages; i++) {
    const startIndex = i * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);
    dataChunks.push(data.slice(startIndex, endIndex));
  }

  return (
    <Document>
      {dataChunks.map((chunk, pageIndex) => (
        <Page key={pageIndex} size="A4" orientation="landscape" style={styles.page}>
          {/* Header - only on first page */}
          {pageIndex === 0 && (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>{metadata.title || 'Tenant Payment History Report'}</Text>
                <Text style={styles.subtitle}>
                  Generated on {metadata.generatedAt || new Date().toLocaleString()}
                </Text>
                <Text style={styles.metaInfo}>
                  Date Range: {filters.dateRange || 'All Records'}
                </Text>
                <Text style={styles.metaInfo}>
                  Total Records: {metadata.totalRecords || data.length}
                </Text>
              </View>

              {/* Summary Statistics */}
              <View style={styles.summarySection}>
                <Text style={styles.summaryTitle}>Payment Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Payments:</Text>
                  <Text style={styles.summaryValue}>{totalPayments.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Amount:</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Positive Payments:</Text>
                  <Text style={styles.summaryValue}>{positivePayments.length}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Refunds/Adjustments:</Text>
                  <Text style={styles.summaryValue}>{negativePayments.length}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Rent Payments:</Text>
                  <Text style={styles.summaryValue}>{rentPayments.length}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Other Payments:</Text>
                  <Text style={styles.summaryValue}>{otherPayments.length}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Unique Tenants:</Text>
                  <Text style={styles.summaryValue}>{uniqueTenants}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Unique Leases:</Text>
                  <Text style={styles.summaryValue}>{uniqueLeases}</Text>
                </View>
              </View>
            </>
          )}

          {/* Table Content */}
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.colTenant}>Tenant Name</Text>
              <Text style={styles.colLeaseNumber}>Lease Number</Text>
              <Text style={styles.colAmount}>Amount</Text>
              <Text style={styles.colPaymentDate}>Payment Date</Text>
              <Text style={styles.colCategory}>Category</Text>
              <Text style={styles.colPaymentSource}>Payment Source</Text>
            </View>

            {/* Table Rows */}
            {chunk.length > 0 ? (
              chunk.map((payment, index) => {
                const amount = parseFloat(payment.amount) || 0;
                const isNegative = amount < 0;
                const globalIndex = pageIndex * itemsPerPage + index;
                
                return (
                  <View 
                    key={`payment-${globalIndex}`} 
                    style={[
                      styles.tableRow,
                      globalIndex % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
                    ]}
                  >
                    <Text style={styles.colTenant}>
                      {payment.tenant || 'N/A'}
                    </Text>
                    <Text style={styles.colLeaseNumber}>
                      {payment.lease_number || 'N/A'}
                    </Text>
                    <Text style={[
                      styles.colAmount, 
                      isNegative ? styles.negativeAmount : styles.positiveAmount
                    ]}>
                      {formatCurrency(amount)}
                      {isNegative && ' (Refund)'}
                    </Text>
                    <Text style={styles.colPaymentDate}>
                      {formatDate(payment.payment_date)}
                    </Text>
                    <Text style={styles.colCategory}>
                      {payment.category || 'N/A'}
                    </Text>
                    <Text style={styles.colPaymentSource}>
                      {payment.payment_source || 'N/A'}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.noDataMessage}>
                <Text>No payment history data available</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Smart Pangisha - Property Management System | Generated on {new Date().toLocaleDateString()}
          </Text>
          
          {/* Page number */}
          <Text style={styles.pageNumber}>
            Page {pageIndex + 1} of {Math.max(1, totalPages)}
          </Text>
        </Page>
      ))}
    </Document>
  );
};

TenantPaymentHistoryReportTemplate.propTypes = {
  data: PropTypes.array,
  metadata: PropTypes.object,
  filters: PropTypes.object,
};

export default TenantPaymentHistoryReportTemplate;