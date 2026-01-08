import React from 'react';
import PropTypes from 'prop-types';
import '../../assets/styles/add-property.css';
import '../../assets/styles/forms-responsive.css';
import { usePropertyForm } from '../../features/properties/hooks/usePropertyForm';
import { useLocationData } from '../../features/properties/hooks/useLocationData';
import { usePropertySubmit } from '../../features/properties/hooks/usePropertySubmit';
import PropertyBasicInfo from '../../features/properties/components/PropertyBasicInfo';
import PropertyLocationInfo from '../../features/properties/components/PropertyLocationInfo';


const AddPropertyModal = ({ isOpen, onClose, onPropertyAdded }) => {
    // Form state management
    const {
        formData,
        setFormData,
        selectedRegionId,
        setSelectedRegionId,
        selectedDistrictId,
        setSelectedDistrictId,
        selectedWardId,
        setSelectedWardId,
        handleInputChange,
        resetForm
    } = usePropertyForm();

    // Location data loading
    const {
        regions,
        districts,
        wards,
        propertyManagers,
        locationLoading,
        error: locationError,
        setError: setLocationError,
        loadDistricts,
        loadWards,
        resetLocationData
    } = useLocationData(isOpen);

    // Form submission
    const {
        loading,
        error,
        success,
        setError,
        setSuccess,
        handleSubmit
    } = usePropertySubmit(formData, resetForm, resetLocationData, onPropertyAdded, onClose);

    // Location handlers
    const handleRegionChange = async (e) => {
        const regionId = e.target.value;
        const selectedRegion = regions.find(region => region.region_code === regionId);
        const regionName = selectedRegion ? selectedRegion.region_name : '';
        
        setSelectedRegionId(regionId);
        setFormData(prev => ({
            ...prev,
            region: regionName,
            district: '',
            ward: ''
        }));
        
        setSelectedDistrictId('');
        setSelectedWardId('');
        resetLocationData();
        
        if (regionId) {
            await loadDistricts(regionId);
        }
    };

    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        const selectedDistrict = districts.find(district => district.district_code === districtId);
        const districtName = selectedDistrict ? selectedDistrict.district_name : '';
        
        setSelectedDistrictId(districtId);
        setFormData(prev => ({
            ...prev,
            district: districtName,
            ward: ''
        }));
        
        setSelectedWardId('');
        
        if (districtId) {
            await loadWards(districtId);
        }
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        setSelectedWardId(wardCode);
        setFormData(prev => ({
            ...prev,
            ward: wardCode
        }));
    };

    const handleClose = () => {
        setError('');
        setSuccess('');
        setLocationError('');
        resetForm();
        resetLocationData();
        onClose();
    };

    if (!isOpen) return null;
    
    return (
        <div 
            className="add-property-modal responsive-modal" 
            tabIndex="-1"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
            onKeyDown={(e) => e.key === 'Escape' && handleClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header border-0">
                            <h5 id="modal-title" className="modal-title text-center w-100 h5 fw-bold text-dark">
                                <i className="fas fa-building me-2 text-danger"></i>
                                Add Property
                            </h5>
                            <button 
                                type="button" 
                                className="btn-close" 
                                onClick={handleClose}
                                aria-label="Close modal"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}
                            
                            <div className="form-section-header mb-form-section">
                                <i className="fas fa-info-circle text-danger"></i>
                                Basic Information
                            </div>
                            
                            {/* Property Name and Type Row */}
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

                            {/* Property Manager Row */}
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

                            <div className="form-section-header mb-form-section">
                                <i className="fas fa-map-marker-alt text-danger"></i>
                                Location Information
                            </div>
                            
                            {/* Region and District Row */}
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
                            <(error || locationError) && (
                                <div className="alert alert-danger">{error || locationError}</div>
                            )}
                            {success && <div className="alert alert-success">{success}</div>}
                            
                            <PropertyBasicInfo
                                formData={formData}
                                handleInputChange={handleInputChange}
                                propertyManagers={propertyManagers}
                                loading={loading}
                            />

                            <PropertyLocationInfo
                                formData={formData}
                                handleInputChange={handleInputChange}
                                regions={regions}
                                districts={districts}
                                wards={wards}
                                selectedRegionId={selectedRegionId}
                                selectedDistrictId={selectedDistrictId}
                                selectedWardId={selectedWardId}
                                handleRegionChange={handleRegionChange}
                                handleDistrictChange={handleDistrictChange}
                                handleWardChange={handleWardChange}
                                locationLoading={locationLoading}
                            />AddPropertyModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onPropertyAdded: PropTypes.func
};

AddPropertyModal.defaultProps = {
    onPropertyAdded: null
};

