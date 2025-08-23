import React, { useState, useEffect } from 'react';
import '../../assets/styles/add-property.css';
import '../../assets/styles/forms-responsive.css';
import { addProperty, getRegions, getDistricts, getWards } from '../../services/propertyService';


const AddPropertyModal = ({isOpen, onClose, onPropertyAdded})=>{
    const [formData, setFormData] = useState({
        propertyName: '',
        propertyType: 'Apartment',
        region: '',
        district: '',
        ward: '',
        street: '',
        managers: [],
        autoGenerate: false,
        numFloors: '',
        unitsPerFloor: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Location data states
    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedRegionId, setSelectedRegionId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);

    // Load regions when component mounts
    useEffect(() => {
        if (isOpen) {
            loadRegions();
        }
    }, [isOpen]);

    const loadRegions = async () => {
        try {
            setLocationLoading(true);
            const response = await getRegions();
            if (response.success) {
                setRegions(response.data || []);
            } else {
                setError(response.error || 'Failed to load regions');
                setRegions([]);
            }
        } catch (error) {
            console.error('Error loading regions:', error);
            setError('Failed to load regions');
            setRegions([]);
        } finally {
            setLocationLoading(false);
        }
    };

    const handleRegionChange = async (e) => {
        const regionId = e.target.value;
        const regionName = regionId ? e.target.options[e.target.selectedIndex].text : '';
        
        setSelectedRegionId(regionId);
        setFormData(prev => ({
            ...prev,
            region: regionName,
            district: '',
            ward: ''
        }));
        
        // Reset dependent dropdowns
        setDistricts([]);
        setWards([]);
        setSelectedDistrictId('');
        setSelectedWardId('');
        
        if (regionId) {
            try {
                setLocationLoading(true);
                const response = await getDistricts(regionId);
                if (response.success) {
                    setDistricts(response.data || []);
                } else {
                    setError(response.error || 'Failed to load districts');
                    setDistricts([]);
                }
            } catch (error) {
                console.error('Error loading districts:', error);
                setError('Failed to load districts');
                setDistricts([]);
            } finally {
                setLocationLoading(false);
            }
        }
    };

    const handleDistrictChange = async (e) => {
        const districtId = e.target.value;
        const districtName = districtId ? e.target.options[e.target.selectedIndex].text : '';
        
        setSelectedDistrictId(districtId);
        setFormData(prev => ({
            ...prev,
            district: districtName,
            ward: ''
        }));
        
        // Reset wards
        setWards([]);
        setSelectedWardId('');
        
        if (districtId) {
            try {
                setLocationLoading(true);
                console.log('Fetching wards for district:', districtId);
                const response = await getWards(districtId);
                if (response.success) {
                    setWards(response.data || []);
                } else {
                    setError(response.error || 'Failed to load wards');
                    setWards([]);
                }
            } catch (error) {
                console.error('Error loading wards:', error);
                setError('Failed to load wards');
                setWards([]);
            } finally {
                setLocationLoading(false);
            }
        }
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        
        setSelectedWardId(wardCode);
        setFormData(prev => ({
            ...prev,
            ward: wardCode  // Store ward_code instead of ward_name
        }));
    };




    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const result = await addProperty(formData);
            if (result.success) {
                setSuccess(result.message || 'Property added successfully!');
                // Reset form
                setFormData({
                    propertyName: '',
                    propertyType: 'Residential',
                    ward: '',
                    street: '',
                });
                
                // Reset location state
                setSelectedRegionId('');
                setSelectedDistrictId('');
                setSelectedWardId('');
                setDistricts([]);
                setWards([]);
                // Notify parent component
                if (onPropertyAdded) {
                    onPropertyAdded(result.data);
                }
                // Close modal after a short delay
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error('Error adding property:', err);
            setError('Failed to add property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        setSuccess('');
        
        // Reset location state
        setSelectedRegionId('');
        setSelectedDistrictId('');
        setSelectedWardId('');
        setDistricts([]);
        setWards([]);
        
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
                                    <label htmlFor="propertyName" className="form-label">Property Name *</label>
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
                                    <label htmlFor="propertyType" className="form-label">Property Type</label>
                                    <select
                                        className="form-select"
                                        id="propertyType"
                                        name="propertyType"
                                        value={formData.propertyType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Standalone">Standalone</option>
                                        <option value="Apartment">Apartment</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-section-header mb-form-section">
                                <i className="fas fa-map-marker-alt text-danger"></i>
                                Location Information
                            </div>
                            
                            {/* Region and District Row */}
                            <div className="row mb-3">
                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor="region" className="form-label">Region *</label>
                                    <select
                                        className="form-select"
                                        id="region"
                                        name="region"
                                        value={selectedRegionId}
                                        onChange={handleRegionChange}
                                        required
                                        disabled={locationLoading}
                                    >
                                        <option value="">Select Region</option>
                                        {regions.map(region => (
                                            <option key={region.region_code} value={region.region_code}>
                                                {region.region_name}
                                            </option>
                                        ))}
                                    </select>
                                    {locationLoading && <small className="form-text text-muted">Loading regions...</small>}
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor="district" className="form-label">District *</label>
                                    <select
                                        className="form-select"
                                        id="district"
                                        name="district"
                                        value={selectedDistrictId}
                                        onChange={handleDistrictChange}
                                        required
                                        disabled={!selectedRegionId || locationLoading}
                                    >
                                        <option value="">Select District</option>
                                        {districts.map(district => (
                                            <option key={district.district_code} value={district.district_code}>
                                                {district.district_name}
                                            </option>
                                        ))}
                                    </select>
                                    {locationLoading && <small className="form-text text-muted">Loading districts...</small>}
                                </div>
                            </div>

                            {/* Ward and Street Row */}
                            <div className="row mb-3">
                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor="ward" className="form-label">Ward</label>
                                    <select
                                        className="form-select"
                                        id="ward"
                                        name="ward"
                                        value={selectedWardId}
                                        onChange={handleWardChange}
                                        disabled={!selectedDistrictId || locationLoading}
                                    >
                                        <option value="">Select Ward</option>
                                        {wards.map(ward => (
                                            <option key={ward.ward_code} value={ward.ward_code}>
                                                {ward.ward_name}
                                            </option>
                                        ))}
                                    </select>
                                    {locationLoading && <small className="form-text text-muted">Loading wards...</small>}
                                </div>
                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor="street" className="form-label">Street Address</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="street"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 123 Beach Road"
                                    />
                                </div>
                            </div>

                            <div className="form-section-header mb-form-section">
                                <i className="fas fa-cogs text-danger"></i>
                                Additional Settings
                            </div>
                            
                            {/* Auto Generate Units */}
                            <div className="row mb-3">
                                <div className="col-12 mb-3">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="autoGenerate"
                                            name="autoGenerate"
                                            checked={formData.autoGenerate}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label" htmlFor="autoGenerate">
                                            <i className="fas fa-magic me-2 text-primary"></i>
                                            Auto-generate units based on floors and units per floor
                                        </label>
                                        <div className="form-text">
                                            Enable this option to automatically create units when the property is saved
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer border-0 pt-0">
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
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

export default AddPropertyModal;