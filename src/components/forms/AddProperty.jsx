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
                            {(error || locationError) && (
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
                            />
                        </div>
                        
                        <div className="modal-footer border-0 pt-0">
                            <button 
                                type="button" 
                                className="odoo-btn odoo-btn-secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="odoo-btn odoo-btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Adding Property...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Add Property
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

AddPropertyModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onPropertyAdded: PropTypes.func
};

AddPropertyModal.defaultProps = {
    onPropertyAdded: null
};

export default AddPropertyModal;

