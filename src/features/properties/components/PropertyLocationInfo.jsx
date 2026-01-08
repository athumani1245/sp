import React from 'react';
import PropTypes from 'prop-types';
import { InfoTooltip } from '../../../components/common/Tooltip';
import SearchableSelect from '../../../components/common/SearchableSelect';

const PropertyLocationInfo = ({
    formData,
    handleInputChange,
    regions,
    districts,
    wards,
    selectedRegionId,
    selectedDistrictId,
    selectedWardId,
    handleRegionChange,
    handleDistrictChange,
    handleWardChange,
    locationLoading
}) => {
    return (
        <>
            <div className="form-section-header mb-form-section">
                <i className="fas fa-map-marker-alt text-danger"></i>
                Location Information
            </div>
            
            <div className="row mb-3">
                <div className="col-12 col-md-6 mb-3">
                    <label htmlFor="region" className="form-label">
                        Region *
                        <InfoTooltip content="Select the administrative region where this property is located" />
                    </label>
                    <SearchableSelect
                        options={regions}
                        value={selectedRegionId}
                        onChange={handleRegionChange}
                        placeholder="Select Region"
                        disabled={locationLoading}
                        name="region"
                        getOptionLabel={(region) => region.region_name}
                        getOptionValue={(region) => region.region_code}
                        noOptionsMessage="No regions available"
                    />
                    {locationLoading && <small className="form-text text-muted">Loading regions...</small>}
                </div>
                <div className="col-12 col-md-6 mb-3">
                    <label htmlFor="district" className="form-label">
                        District *
                        <InfoTooltip content="Select the district within the chosen region. Districts will load after selecting a region." />
                    </label>
                    <SearchableSelect
                        options={districts}
                        value={selectedDistrictId}
                        onChange={handleDistrictChange}
                        placeholder="Select District"
                        disabled={!selectedRegionId || locationLoading}
                        name="district"
                        getOptionLabel={(district) => district.district_name}
                        getOptionValue={(district) => district.district_code}
                        noOptionsMessage={!selectedRegionId ? "Please select a region first" : "No districts available"}
                    />
                    {locationLoading && <small className="form-text text-muted">Loading districts...</small>}
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-12 col-md-6 mb-3">
                    <label htmlFor="ward" className="form-label">
                        Ward
                        <InfoTooltip content="Optionally specify the ward/neighborhood for more precise location tracking" />
                    </label>
                    <SearchableSelect
                        options={wards}
                        value={selectedWardId}
                        onChange={handleWardChange}
                        placeholder="Select Ward"
                        disabled={!selectedDistrictId || locationLoading}
                        name="ward"
                        getOptionLabel={(ward) => ward.ward_name}
                        getOptionValue={(ward) => ward.ward_code}
                        noOptionsMessage={!selectedDistrictId ? "Please select a district first" : "No wards available"}
                    />
                    {locationLoading && <small className="form-text text-muted">Loading wards...</small>}
                </div>
                <div className="col-12 col-md-6 mb-3">
                    <label htmlFor="street" className="form-label">
                        Street Address *
                        <InfoTooltip content="Enter the complete street address including building/plot number (e.g., '123 Beach Road', 'Plot 456 Nyerere St')" />
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="e.g., 123 Beach Road"
                        required
                    />
                </div>
            </div>
        </>
    );
};

PropertyLocationInfo.propTypes = {
    formData: PropTypes.shape({
        street: PropTypes.string.isRequired
    }).isRequired,
    handleInputChange: PropTypes.func.isRequired,
    regions: PropTypes.arrayOf(PropTypes.shape({
        region_code: PropTypes.string.isRequired,
        region_name: PropTypes.string.isRequired
    })).isRequired,
    districts: PropTypes.arrayOf(PropTypes.shape({
        district_code: PropTypes.string.isRequired,
        district_name: PropTypes.string.isRequired
    })).isRequired,
    wards: PropTypes.arrayOf(PropTypes.shape({
        ward_code: PropTypes.string.isRequired,
        ward_name: PropTypes.string.isRequired
    })).isRequired,
    selectedRegionId: PropTypes.string.isRequired,
    selectedDistrictId: PropTypes.string.isRequired,
    selectedWardId: PropTypes.string.isRequired,
    handleRegionChange: PropTypes.func.isRequired,
    handleDistrictChange: PropTypes.func.isRequired,
    handleWardChange: PropTypes.func.isRequired,
    locationLoading: PropTypes.bool.isRequired
};

export default PropertyLocationInfo;
