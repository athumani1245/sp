/**
 * PropertyHeader Component
 * Displays property basic information and edit mode
 */

import React from 'react';
import PropTypes from 'prop-types';
import { PropertyPropType } from '../../../shared/types/propTypes';

const PropertyHeader = ({ 
  property, 
  isEditing, 
  editData, 
  onInputChange,
  onRegionChange,
  onDistrictChange,
  onWardChange,
  onManagerChange,
  selectedRegionId,
  selectedDistrictId,
  selectedWardId,
  selectedManagerId,
  regions,
  districts,
  wards,
  propertyManagers,
  locationLoading,
  onSave,
  onCancel,
  onEdit,
  updateLoading,
  hasActiveSubscription
}) => {
  const getLocationDisplayValue = (addressField, fieldType) => {
    if (!property?.address) return '';
    
    const address = property.address;
    
    switch (fieldType) {
      case 'region':
        return address.region_name || address.region || '';
      case 'district':
        return address.district_name || address.district || '';
      case 'ward':
        return address.ward_name || address.ward || '';
      default:
        return '';
    }
  };

  return (
    <div className="leases-section">
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0 d-flex align-items-center">
              <i className="bi bi-building me-2"></i>
              Property Details
            </h5>
            {!isEditing ? (
              <button
                className="odoo-btn odoo-btn-primary odoo-btn-sm"
                onClick={onEdit}
                disabled={!hasActiveSubscription}
                title={!hasActiveSubscription ? 'Subscription expired. Please renew to edit properties.' : ''}
              >
                <i className="bi bi-pencil me-1"></i>
                Edit
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button
                  className="odoo-btn odoo-btn-success odoo-btn-sm"
                  onClick={onSave}
                  disabled={updateLoading}
                >
                  <i className="bi bi-check me-1"></i>
                  {updateLoading ? "Saving..." : "Save"}
                </button>
                <button
                  className="odoo-btn odoo-btn-secondary odoo-btn-sm"
                  onClick={onCancel}
                  disabled={updateLoading}
                >
                  <i className="bi bi-x me-1"></i>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <form>
            {/* Property Name */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Property Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    name="propertyName"
                    value={editData.propertyName}
                    onChange={onInputChange}
                    disabled={updateLoading}
                  />
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={property?.property_name || ""}
                    readOnly
                    placeholder="Property name..."
                  />
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Property Type</label>
                {isEditing ? (
                  <select
                    className="form-select"
                    name="propertyType"
                    value={editData.propertyType}
                    onChange={onInputChange}
                    disabled={updateLoading}
                  >
                    <option value="">Select Type</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="mixed">Mixed Use</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={property?.property_type || ""}
                    readOnly
                    placeholder="Property type..."
                  />
                )}
              </div>
            </div>

            {/* Address Section */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Region</label>
                {isEditing ? (
                  <select
                    className="form-select"
                    value={selectedRegionId}
                    onChange={onRegionChange}
                    disabled={updateLoading || locationLoading}
                  >
                    <option value="">Select Region</option>
                    {regions.map(region => (
                      <option key={region.region_code} value={region.region_code}>
                        {region.region_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={getLocationDisplayValue(property?.address?.region, 'region')}
                    readOnly
                    placeholder="Region..."
                  />
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">District</label>
                {isEditing ? (
                  <select
                    className="form-select"
                    value={selectedDistrictId}
                    onChange={onDistrictChange}
                    disabled={updateLoading || locationLoading || !selectedRegionId}
                  >
                    <option value="">Select District</option>
                    {districts.map(district => (
                      <option key={district.district_code} value={district.district_code}>
                        {district.district_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={getLocationDisplayValue(property?.address?.district, 'district')}
                    readOnly
                    placeholder="District..."
                  />
                )}
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Ward</label>
                {isEditing ? (
                  <select
                    className="form-select"
                    value={selectedWardId}
                    onChange={onWardChange}
                    disabled={updateLoading || locationLoading || !selectedDistrictId}
                  >
                    <option value="">Select Ward</option>
                    {wards.map(ward => (
                      <option key={ward.ward_code} value={ward.ward_code}>
                        {ward.ward_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={getLocationDisplayValue(property?.address?.ward, 'ward')}
                    readOnly
                    placeholder="Ward..."
                  />
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Street</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="form-control"
                    name="street"
                    value={editData.street}
                    onChange={onInputChange}
                    disabled={updateLoading}
                  />
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={property?.address?.street || ""}
                    readOnly
                    placeholder="Street..."
                  />
                )}
              </div>
            </div>

            {/* Property Manager */}
            <div className="row g-3">
              <div className="col-md-12">
                <label className="form-label">Property Manager</label>
                {isEditing ? (
                  <select
                    className="form-select"
                    value={selectedManagerId}
                    onChange={onManagerChange}
                    disabled={updateLoading}
                  >
                    <option value="">No Manager Assigned</option>
                    {propertyManagers.map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.first_name} {manager.last_name} ({manager.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-control"
                    value={
                      property?.managers && property.managers.length > 0
                        ? `${property.managers[0].first_name || ''} ${property.managers[0].last_name || ''} (${property.managers[0].email || ''})`
                        : 'No manager assigned'
                    }
                    readOnly
                    placeholder="Property manager..."
                  />
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

PropertyHeader.propTypes = {
  property: PropertyPropType,
  isEditing: PropTypes.bool.isRequired,
  editData: PropTypes.shape({
    propertyName: PropTypes.string,
    propertyType: PropTypes.string,
    region: PropTypes.string,
    district: PropTypes.string,
    ward: PropTypes.string,
    street: PropTypes.string,
    manager_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onInputChange: PropTypes.func.isRequired,
  onRegionChange: PropTypes.func.isRequired,
  onDistrictChange: PropTypes.func.isRequired,
  onWardChange: PropTypes.func.isRequired,
  onManagerChange: PropTypes.func.isRequired,
  selectedRegionId: PropTypes.string.isRequired,
  selectedDistrictId: PropTypes.string.isRequired,
  selectedWardId: PropTypes.string.isRequired,
  selectedManagerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  regions: PropTypes.array.isRequired,
  districts: PropTypes.array.isRequired,
  wards: PropTypes.array.isRequired,
  propertyManagers: PropTypes.array.isRequired,
  locationLoading: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  updateLoading: PropTypes.bool.isRequired,
  hasActiveSubscription: PropTypes.bool.isRequired,
};

export default PropertyHeader;
