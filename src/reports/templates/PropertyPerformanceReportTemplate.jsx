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
    borderBottomColor: '#059669',
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
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
    backgroundColor: '#f0fdf4',
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
    backgroundColor: '#059669',
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
    backgroundColor: '#f0fdf4',
    padding: 5,
    fontSize: 10,
    fontFamily: 'Times-Roman',
  },
  // Column widths for property performance
  col1: { width: '20%', paddingRight: 3 }, // Property Name
  col2: { width: '12%', textAlign: 'center', paddingRight: 3 }, // Total Units
  col3: { width: '12%', textAlign: 'center', paddingRight: 3 }, // Occupied
  col4: { width: '12%', textAlign: 'center', paddingRight: 3 }, // Vacant
  col5: { width: '12%', textAlign: 'center', paddingRight: 3 }, // Occupancy Rate
  col6: { width: '16%', textAlign: 'right', paddingRight: 3 }, // Monthly Revenue
  col7: { width: '16%', textAlign: 'right' }, // Total Revenue

  propertyName: { fontWeight: 'bold', color: '#374151' },
  revenueAmount: { color: '#059669', fontWeight: 'bold' },
  occupancyHigh: { color: '#059669', fontWeight: 'bold' },
  occupancyMedium: { color: '#d97706', fontWeight: 'bold' },
  occupancyLow: { color: '#dc2626', fontWeight: 'bold' },
  
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
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#059669',
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
    color: '#059669',
    fontFamily: 'Times-Bold',
  },
});

const PropertyPerformanceReportTemplate = ({ properties, reportMetadata, filters }) => {
  // Calculate summary data
  const totalProperties = properties?.length || 0;
  const totalDueAmount = properties?.reduce((sum, prop) => sum + (Number(prop.total_due) || 0), 0) || 0;
  const totalPaidAmount = properties?.reduce((sum, prop) => sum + (Number(prop.total_paid) || 0), 0) || 0;
  const totalOutstandingAmount = properties?.reduce((sum, prop) => sum + (Number(prop.outstanding) || 0), 0) || 0;
  const totalOverpaidAmount = properties?.reduce((sum, prop) => sum + (Number(prop.overpaid) || 0), 0) || 0;
  const overallCollectionRate = totalDueAmount > 0 ? Math.round((totalPaidAmount / totalDueAmount) * 100) : 0;
  
  const highPerformingProperties = properties?.filter(prop => {
    const collectionRate = Number(prop.total_due) > 0 ? Math.round((Number(prop.total_paid) / Number(prop.total_due)) * 100) : 0;
    return collectionRate >= 90;
  }).length || 0;
  
  const mediumPerformingProperties = properties?.filter(prop => {
    const collectionRate = Number(prop.total_due) > 0 ? Math.round((Number(prop.total_paid) / Number(prop.total_due)) * 100) : 0;
    return collectionRate >= 70 && collectionRate < 90;
  }).length || 0;
  
  const lowPerformingProperties = properties?.filter(prop => {
    const collectionRate = Number(prop.total_due) > 0 ? Math.round((Number(prop.total_paid) / Number(prop.total_due)) * 100) : 0;
    return collectionRate < 70;
  }).length || 0;

  const formatCurrency = (amount) => {
    return `TSh ${(Number(amount) || 0).toLocaleString()}`;
  };

  const getCollectionRateStyle = (rate) => {
    const collectionRate = Number(rate) || 0;
    if (collectionRate >= 90) return styles.occupancyHigh;
    if (collectionRate >= 70) return styles.occupancyMedium;
    return styles.occupancyLow;
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PROPERTY PERFORMANCE REPORT</Text>
          <Text style={styles.subtitle}>Financial & Operational Performance Analysis</Text>
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
            <Text style={styles.metadataLabel}>Total Properties:</Text>
            <Text style={styles.metadataValue}>{totalProperties}</Text>
            <Text style={styles.metadataLabel}>Overall Collection Rate:</Text>
            <Text style={styles.metadataValue}>{overallCollectionRate}%</Text>
          </View>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Date Range:</Text>
            <Text style={styles.metadataValue}>{filters?.dateRange || 'All Time'}</Text>
            <Text style={styles.metadataLabel}>Total Outstanding:</Text>
            <Text style={styles.metadataValue}>{formatCurrency(totalOutstandingAmount)}</Text>
          </View>
        </View>

        {/* Table Section */}
        <View style={styles.tableSection}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Property Name</Text>
            <Text style={styles.col2}>Total Due</Text>
            <Text style={styles.col3}>Total Paid</Text>
            <Text style={styles.col4}>Outstanding</Text>
            <Text style={styles.col5}>Collection %</Text>
            <Text style={styles.col6}>Overpaid</Text>
            <Text style={styles.col7}>Net Position</Text>
          </View>

          {/* Table Rows */}
          {properties?.map((property, index) => {
            const totalDue = Number(property.total_due) || 0;
            const totalPaid = Number(property.total_paid) || 0;
            const outstanding = Number(property.outstanding) || 0;
            const overpaid = Number(property.overpaid) || 0;
            const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
            const netPosition = totalPaid - totalDue;

            return (
              <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                <Text style={[styles.col1, styles.propertyName]}>
                  {property.unit__property__property_name || property.property_name || property.name || 'N/A'}
                </Text>
                <Text style={[styles.col2, styles.revenueAmount]}>{formatCurrency(totalDue)}</Text>
                <Text style={[styles.col3, styles.revenueAmount]}>{formatCurrency(totalPaid)}</Text>
                <Text style={[styles.col4, outstanding > 0 ? styles.occupancyLow : styles.occupancyHigh]}>{formatCurrency(outstanding)}</Text>
                <Text style={[styles.col5, getCollectionRateStyle(collectionRate)]}>{collectionRate}%</Text>
                <Text style={[styles.col6, styles.revenueAmount]}>{formatCurrency(overpaid)}</Text>
                <Text style={[styles.col7, netPosition >= 0 ? styles.occupancyHigh : styles.occupancyLow]}>{formatCurrency(netPosition)}</Text>
              </View>
            );
          })}
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>FINANCIAL PERFORMANCE SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Properties:</Text>
            <Text style={styles.summaryValue}>{totalProperties}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount Due:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalDueAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount Paid:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalPaidAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Outstanding:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalOutstandingAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Overpaid:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalOverpaidAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Overall Collection Rate:</Text>
            <Text style={styles.summaryValueHighlight}>{overallCollectionRate}%</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Collection Performance Distribution:</Text>
            <Text style={styles.summaryValue}>
              High (≥90%): {highPerformingProperties} | Medium (70-89%): {mediumPerformingProperties} | Low (&lt;70%): {lowPerformingProperties}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Property Financial Performance Report - Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</Text>
          <Text>Collection Rate: {overallCollectionRate}% | Total Outstanding: {formatCurrency(totalOutstandingAmount)}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PropertyPerformanceReportTemplate;