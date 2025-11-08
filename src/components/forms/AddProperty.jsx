import React, { useState, useEffect, useRef } from 'react';
import '../../assets/styles/add-property.css';
import '../../assets/styles/forms-responsive.css';
import { addProperty, getRegions, getDistricts, getWards, getAllPropertyManagers } from '../../services/propertyService';

// SearchableSelect Component
const SearchableSelect = ({ 
    options, 
    value, 
    onChange, 
    placeholder, 
    disabled, 
    name,
    getOptionLabel,
    getOptionValue,
    noOptionsMessage = "No options available"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setFilteredOptions(options);
    }, [options]);

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredOptions(options);
        } else {
            const filtered = options.filter(option => 
                getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOptions(filtered);
        }
    }, [searchTerm, options, getOptionLabel]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        const handleKeyDown = (event) => {
            // Handle Escape key to close dropdown
            if (event.key === 'Escape' && isOpen) {
                event.preventDefault();
                event.stopPropagation();
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown, true); // Use capture phase
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isOpen]);

    const handleInputClick = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }
    };

    const handleOptionSelect = (option) => {
        const optionValue = getOptionValue(option);
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
        setSearchTerm('');
    };

    const getDisplayValue = () => {
        if (!value) return '';
        const selectedOption = options.find(option => getOptionValue(option) === value);
        return selectedOption ? getOptionLabel(selectedOption) : '';
    };

    return (
        <div className="searchable-select position-relative" ref={dropdownRef}>
            <div 
                className={`form-select d-flex align-items-center justify-content-between ${disabled ? 'disabled' : ''}`}
                onClick={handleInputClick}
                onKeyDown={(e) => {
                    // Prevent Bootstrap dropdown handlers
                    if (e.key === 'Escape' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    if (e.key === 'Escape' && isOpen) {
                        setIsOpen(false);
                        setSearchTerm('');
                    }
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!disabled) {
                            setIsOpen(!isOpen);
                        }
                    }
                }}
                tabIndex={disabled ? -1 : 0}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                style={{ 
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: disabled ? '#e9ecef' : 'white'
                }}
            >
                <span className={!value ? 'text-muted' : ''}>
                    {!value ? placeholder : getDisplayValue()}
                </span>
                <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}></i>
            </div>
            
            {isOpen && (
                <div 
                    className="dropdown-menu show w-100 position-absolute"
                    role="listbox"
                    aria-label="Options"
                    style={{ 
                        zIndex: 1050, 
                        maxHeight: '200px', 
                        overflowY: 'auto',
                        top: '100%',
                        left: 0
                    }}
                    onKeyDown={(e) => {
                        // Prevent Bootstrap interference at dropdown level
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsOpen(false);
                            setSearchTerm('');
                        }
                    }}
                >
                    <div className="p-2 border-bottom">
                        <input
                            ref={inputRef}
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                // Prevent Bootstrap dropdown handlers from interfering
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }
                            }}
                        />
                    </div>
                    
                    <div className="dropdown-items">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={getOptionValue(option)}
                                    className={`dropdown-item ${getOptionValue(option) === value ? 'active' : ''}`}
                                    onClick={() => handleOptionSelect(option)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {getOptionLabel(option)}
                                </div>
                            ))
                        ) : (
                            <div className="dropdown-item-text text-muted">
                                {noOptionsMessage}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const AddPropertyModal = ({isOpen, onClose, onPropertyAdded})=>{
    const [formData, setFormData] = useState({
        propertyName: '',
        propertyType: 'Apartment',
        region: '',
        district: '',
        ward: '',
        street: '',
        manager_id: '',
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
    const [propertyManagers, setPropertyManagers] = useState([]);
    const [selectedRegionId, setSelectedRegionId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);

    // Load regions when component mounts
    useEffect(() => {
        if (isOpen) {
            loadRegions();
            loadPropertyManagers();
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

    const loadPropertyManagers = async () => {
        try {
            const result = await getAllPropertyManagers();
            if (result.success) {
                setPropertyManagers(result.data || []);
            }
        } catch (error) {
            console.error('Error loading property managers:', error);
        }
    };

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
        const selectedDistrict = districts.find(district => district.district_code === districtId);
        const districtName = selectedDistrict ? selectedDistrict.district_name : '';
        
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
                                        <option value="Commercial building">Commercial building</option>
                                    </select>
                                </div>
                            </div>

                            {/* Property Manager Row */}
                            <div className="row mb-3">
                                <div className="col-12 mb-3">
                                    <label htmlFor="manager_id" className="form-label">
                                        Property Manager (Optional)
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
                                    <label htmlFor="region" className="form-label">Region *</label>
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
                                    <label htmlFor="district" className="form-label">District *</label>
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

                            {/* Ward and Street Row */}
                            <div className="row mb-3">
                                <div className="col-12 col-md-6 mb-3">
                                    <label htmlFor="ward" className="form-label">Ward</label>
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
                                    <label htmlFor="street" className="form-label">Street Address *</label>
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

export default AddPropertyModal;