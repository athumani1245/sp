import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Create styles with Times New Roman font
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Times-Roman',
    fontSize: 11,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: 2,
    borderBottomColor: '#2c3e50',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    fontFamily: 'Times-Bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 3,
    fontFamily: 'Times-Roman',
  },
  summarySection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#dee2e6',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    fontFamily: 'Times-Bold',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#495057',
    fontFamily: 'Times-Roman',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'Times-Bold',
  },
  tableContainer: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#34495e',
    padding: 8,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#dee2e6',
    minHeight: 25,
  },
  tableRowEven: {
    backgroundColor: '#f8f9fa',
  },
  // Table column styles - adjust widths as needed
  col1: { width: '20%', fontSize: 10, paddingRight: 5, fontFamily: 'Times-Roman' }, // Property Name
  col2: { width: '12%', fontSize: 10, paddingRight: 5, fontFamily: 'Times-Roman' }, // Property Type
  col3: { width: '18%', fontSize: 10, paddingRight: 5, fontFamily: 'Times-Roman' }, // Location
  col4: { width: '15%', fontSize: 10, paddingRight: 5, fontFamily: 'Times-Roman' }, // Landlord
  col5: { width: '8%', fontSize: 10, textAlign: 'center', fontFamily: 'Times-Roman' }, // Total Units
  col6: { width: '8%', fontSize: 10, textAlign: 'center', fontFamily: 'Times-Roman' }, // Occupied
  col7: { width: '8%', fontSize: 10, textAlign: 'center', fontFamily: 'Times-Roman' }, // Available
  col8: { width: '11%', fontSize: 10, textAlign: 'center', fontFamily: 'Times-Roman' }, // Occupancy Rate
  
  // Header text styles
  headerCol1: { width: '20%', fontSize: 11, fontWeight: 'bold', paddingRight: 5, fontFamily: 'Times-Bold', color: '#ffffff' },
  headerCol2: { width: '12%', fontSize: 11, fontWeight: 'bold', paddingRight: 5, fontFamily: 'Times-Bold', color: '#ffffff' },
  headerCol3: { width: '18%', fontSize: 11, fontWeight: 'bold', paddingRight: 5, fontFamily: 'Times-Bold', color: '#ffffff' },
  headerCol4: { width: '15%', fontSize: 11, fontWeight: 'bold', paddingRight: 5, fontFamily: 'Times-Bold', color: '#ffffff' },
  headerCol5: { width: '8%', fontSize: 11, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Times-Bold', color: '#ffffff' },
  headerCol6: { width: '8%', fontSize: 11, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Times-Bold', color: '#ffffff' },
  headerCol7: { width: '8%', fontSize: 11, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Times-Bold', color: '#ffffff' },
  headerCol8: { width: '11%', fontSize: 11, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Times-Bold', color: '#ffffff' },
  
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#7f8c8d',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#dee2e6',
    paddingTop: 10,
    fontFamily: 'Times-Roman',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 10,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#7f8c8d',
    fontFamily: 'Times-Roman',
  },
});

const PropertySummaryReportTemplate = ({ data, filters = {} }) => {
  // Calculate summary statistics
  const totalProperties = data?.length || 0;
  const totalUnits = data?.reduce((sum, property) => sum + (property.total_units || 0), 0) || 0;
  const totalOccupied = data?.reduce((sum, property) => sum + (property.occupied_units || 0), 0) || 0;
  const totalAvailable = totalUnits - totalOccupied;
  const overallOccupancyRate = totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0;
  
  // Properties by type breakdown
  const propertiesByType = data?.reduce((acc, property) => {
    const type = property.property_type || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {}) || {};
  
  // Occupancy status breakdown
  const fullyOccupied = data?.filter(property => 
    property.total_units > 0 && property.occupied_units === property.total_units
  ).length || 0;
  
  const vacant = data?.filter(property => 
    property.occupied_units === 0
  ).length || 0;
  
  const partiallyOccupied = totalProperties - fullyOccupied - vacant;
  
  // Generate current date for the report
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Helper function to truncate long text
  const truncateText = (text, maxLength = 15) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Property Summary Report</Text>
          <Text style={styles.subtitle}>Generated on {currentDate}</Text>
          {filters.startDate && filters.endDate && (
            <Text style={styles.subtitle}>
              Period: {filters.startDate} to {filters.endDate}
            </Text>
          )}
        </View>

        {/* Summary Statistics */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Summary Statistics</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Properties:</Text>
              <Text style={styles.summaryValue}>{totalProperties}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Units:</Text>
              <Text style={styles.summaryValue}>{totalUnits}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Occupied Units:</Text>
              <Text style={styles.summaryValue}>{totalOccupied}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Available Units:</Text>
              <Text style={styles.summaryValue}>{totalAvailable}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Overall Occupancy Rate:</Text>
              <Text style={styles.summaryValue}>{overallOccupancyRate}%</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Fully Occupied:</Text>
              <Text style={styles.summaryValue}>{fullyOccupied} properties</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Vacant Properties:</Text>
              <Text style={styles.summaryValue}>{vacant} properties</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Partially Occupied:</Text>
              <Text style={styles.summaryValue}>{partiallyOccupied} properties</Text>
            </View>
          </View>
        </View>

        {/* Property Types Breakdown */}
        {Object.keys(propertiesByType).length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>Properties by Type</Text>
            <View style={styles.summaryGrid}>
              {Object.entries(propertiesByType).map(([type, count]) => (
                <View key={type} style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>{type}:</Text>
                  <Text style={styles.summaryValue}>{count} properties</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Properties Table */}
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.headerCol1}>Property Name</Text>
            <Text style={styles.headerCol2}>Type</Text>
            <Text style={styles.headerCol3}>Location</Text>
            <Text style={styles.headerCol4}>Landlord</Text>
            <Text style={styles.headerCol5}>Units</Text>
            <Text style={styles.headerCol6}>Occupied</Text>
            <Text style={styles.headerCol7}>Available</Text>
            <Text style={styles.headerCol8}>Occupancy %</Text>
          </View>

          {/* Table Rows */}
          {data && data.map((property, index) => (
            <View 
              key={property.property_id || index} 
              style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}
            >
              <Text style={styles.col1}>
                {truncateText(property.property_name, 20)}
              </Text>
              <Text style={styles.col2}>
                {truncateText(property.property_type, 10)}
              </Text>
              <Text style={styles.col3}>
                {truncateText(property.location, 18)}
              </Text>
              <Text style={styles.col4}>
                {truncateText(property.landlord, 15)}
              </Text>
              <Text style={styles.col5}>
                {property.total_units || 0}
              </Text>
              <Text style={styles.col6}>
                {property.occupied_units || 0}
              </Text>
              <Text style={styles.col7}>
                {property.available_units || 0}
              </Text>
              <Text style={styles.col8}>
                {property.occupancy_rate || 0}%
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Property Management System - Property Summary Report
        </Text>
        
        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => (
            `Page ${pageNumber} of ${totalPages}`
          )} 
          fixed 
        />
      </Page>
    </Document>
  );
};

export default PropertySummaryReportTemplate;