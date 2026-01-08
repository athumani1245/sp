import React from 'react';
import PropTypes from 'prop-types';
import { InfoTooltip } from '../../../components/common/Tooltip';
import { SearchableSelect } from '../../../components/common/SearchableSelect';

const PropertyBasicInfo = ({ formData, handleInputChange, propertyManagers, loading }) => {
    return (
        <>
            <div className="form-section-header mb-form-section">
                <i className="fas fa-info-circle text-danger"></i>
                Basic Information
            </div>
            
            <div className="row mb-3">
                <div className="col-12 col-md-6 mb-3">
                    <label htmlFor="propertyName" className="form-label">
                        Property Name *
                        <InfoTooltip content="Give your property a unique, descriptive name (e.g., 'Sunset Apartments', 'Green Valley Plaza')" />
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="propertyName"
                        name="propertyName"
                        value={formData.propertyName}
                        onChange={handleInputChange}
                        placeholder="Enter property name"
                        required
                    />
                </div>
                <div className="col-12 col-md-6 mb-3">
                    <label htmlFor="propertyType" className="form-label">
                        Property Type
                        <InfoTooltip content="<strong>Standalone:</strong> Single-family homes<br/><strong>Apartment:</strong> Multi-unit residential buildings<br/><strong>Commercial:</strong> Office, retail, or mixed-use" />
                    </label>
                    <select
                        className="form-select"
                        id="propertyType"
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleInputChange}
                    >
                        <option value="Standalone">Standalone</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Commercial building">Commercial building</option>
                    </select>
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-12 mb-3">
                    <label htmlFor="manager_id" className="form-label">
                        Property Manager (Optional)
                        <InfoTooltip content="Assign a dedicated manager who will oversee operations, maintenance, and tenant relations for this property" />
                    </label>
                    <SearchableSelect
                        options={propertyManagers}
                        value={formData.manager_id}
                        onChange={handleInputChange}
                        placeholder="Select Property Manager"
                        disabled={loading}
                        name="manager_id"
                        getOptionLabel={(manager) => {
                            if (manager.first_name && manager.last_name) {
                                return `${manager.first_name} ${manager.last_name} - ${manager.username}`;
                            }
                            return manager.username || 'Unknown Manager';
                        }}
                        getOptionValue={(manager) => manager.id}
                        noOptionsMessage="No property managers available. Add managers from the Property Managers page."
                    />
                    <small className="form-text text-muted">
                        Assign a property manager to oversee this property
                    </small>
                </div>
            </div>
        </>
    );
};

PropertyBasicInfo.propTypes = {
    formData: PropTypes.shape({
        propertyName: PropTypes.string.isRequired,
        propertyType: PropTypes.string.isRequired,
        manager_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }).isRequired,
    handleInputChange: PropTypes.func.isRequired,
    propertyManagers: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        username: PropTypes.string.isRequired,
        first_name: PropTypes.string,
        last_name: PropTypes.string
    })).isRequired,
    loading: PropTypes.bool.isRequired
};

export default PropertyBasicInfo;
