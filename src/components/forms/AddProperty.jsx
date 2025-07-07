import React, { useState, useEffect } from 'react';
import '../../assets/styles/add-property.css';
import { addProperty, getRegions, getDistricts, getWards } from '../../services/propertyService';


const AddPropertyModal = ({isOpen, onClose, onPropertyAdded})=>{
    const [formData, setFormData] = useState({
        propertyName: '',
        propertyType: 'Residential',
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
            className="add-property-modal" 
            tabIndex="-1"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
            onKeyDown={(e) => e.key === 'Escape' && handleClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h5 id="modal-title" className="modal-title">Add Property</h5>
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
                            
                            {/* Property Name */}
                            <div className="mb-3">
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

                            {/* Property Type */}
                            <div className="mb-3">
                                <label htmlFor="propertyType" className="form-label">Property Type</label>
                                <select
                                    className="form-select"
                                    id="propertyType"
                                    name="propertyType"
                                    value={formData.propertyType}
                                    onChange={handleInputChange}
                                >
                                    <option value="Residential">Residential</option>
                                    <option value="Commercial">Commercial</option>
                                    <option value="Industrial">Industrial</option>
                                    <option value="Mixed-use">Mixed-use</option>
                                </select>
                            </div>

                            {/* Address Section */}
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="region" className="form-label">Region *</label>
                                        <select
                                            className="form-control"
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
                                        {locationLoading && <small className="text-muted">Loading regions...</small>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="district" className="form-label">District *</label>
                                        <select
                                            className="form-control"
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
                                        {locationLoading && <small className="text-muted">Loading districts...</small>}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="ward" className="form-label">Ward</label>
                                        <select
                                            className="form-control"
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
                                        {locationLoading && <small className="text-muted">Loading wards...</small>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
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
                            </div>

                            

                            {/* Auto Generate Units */}
                            <div className="mb-3">
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
                                        Auto-generate units based on floors and units per floor
                                    </label>
                                </div>
                            </div>

                            {/* Managers Selection
                                <div className="mb-3">
                                    <label className="form-label">Assign Managers (Optional)</label>
                                    <div className="managers-list" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                        {availableManagers.map(manager => (
                                            <div key={manager.id} className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`manager-${manager.id}`}
                                                    value={manager.id}
                                                    checked={formData.managers.includes(manager.id)}
                                                    onChange={handleManagerChange}
                                                />
                                                <label className="form-check-label" htmlFor={`manager-${manager.id}`}>
                                                    {manager.first_name} {manager.last_name} ({manager.email})
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div> */}
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Adding Property...' : 'Add Property'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddPropertyModal;