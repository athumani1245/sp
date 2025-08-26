import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import Layout from "../../components/Layout";
import { getPropertyById, getPropertyUnits, updateProperty, getRegions, getDistricts, getWards, addPropertyUnit, deletePropertyUnit, updatePropertyUnit } from "../../services/propertyService";
import "../../assets/styles/leases.css";

function Property() {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    
    const [property, setProperty] = useState(null);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unitsLoading, setUnitsLoading] = useState(false);    const [error, setError] = useState("");
    const [unitsError, setUnitsError] = useState("");
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    
    // Edit functionality states
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        propertyName: "",
        propertyType: "",
        region: "",
        district: "",
        ward: "",
        street: "",
        numFloors: "",
        unitsPerFloor: ""
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [success, setSuccess] = useState("");
    
    // Location data states for editing
    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedRegionId, setSelectedRegionId] = useState('');
    const [selectedDistrictId, setSelectedDistrictId] = useState('');
    const [selectedWardId, setSelectedWardId] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);
    
    // Inline unit addition states
    const [isAddingUnit, setIsAddingUnit] = useState(false);
    const [newUnitData, setNewUnitData] = useState({
        property: propertyId,
        unit_name: '',
        rent_per_month: ''
    });
    const [addingUnitLoading, setAddingUnitLoading] = useState(false);

    // Inline unit editing states
    const [editingUnitId, setEditingUnitId] = useState(null);
    const [editUnitData, setEditUnitData] = useState({
        unit_name: '',
        rent_per_month: ''
    });
    const [updatingUnit, setUpdatingUnit] = useState(false);

    // Delete confirmation modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState(null);
    const [deletingUnit, setDeletingUnit] = useState(false);

    // Fetch property details
    const fetchProperty = async () => {
        try {
            setLoading(true);
            setError("");
            const result = await getPropertyById(propertyId);
              if (result.success) {
                setProperty(result.data);
                console.log('Property data:', result.data); // Debug log
                console.log('Address data:', result.data.address); // Debug log
                // Populate edit data and location IDs
                setEditData({
                    propertyName: result.data.property_name || "",
                    propertyType: result.data.property_type || "",
                    region: result.data.address?.region || "",
                    district: result.data.address?.district || "",
                    ward: result.data.address?.ward || "",
                    street: result.data.address?.street || "",
                });
                
                // Set the selected location values
                if (result.data.address) {
                    setSelectedRegionId(result.data.address.region_code || "");
                    setSelectedDistrictId(result.data.address.district_code || "");
                    setSelectedWardId(result.data.address.ward_code || "");
                }
            } else {
                setError(result.error || "Failed to fetch property details");
            }
        } catch (error) {
            console.error("Failed to fetch property:", error);
            setError("Failed to fetch property details");
        } finally {
            setLoading(false);
        }
    };


    const handleDeleteUnit = (unitId) => {
        setUnitToDelete(unitId);
        setShowDeleteModal(true);
    };

    const confirmDeleteUnit = async () => {
        if (!unitToDelete) return;
        
        try {
            setDeletingUnit(true);
            const result = await deletePropertyUnit(unitToDelete);
            if (result.success) {
                setUnits(prevUnits => prevUnits.filter(unit => unit.id !== unitToDelete));
                setShowDeleteModal(false);
                setUnitToDelete(null);
            } else {
                console.error("Failed to delete unit:", result.error);
                setError("Failed to delete unit");
            }
        } catch (error) {
            console.error("Error deleting unit:", error);
            setError("Failed to delete unit");
        } finally {
            setDeletingUnit(false);
        }
    };

    const cancelDeleteUnit = () => {
        setShowDeleteModal(false);
        setUnitToDelete(null);
    };

    // Fetch property units
    const fetchUnits = async (page = 1) => {
        try {
            setUnitsLoading(true);
            setUnitsError("");
            const result = await getPropertyUnits({ 
                property: propertyId,
                page: page     
            });
            console.log(result)
            
            if (result.success) {
                console.log("Fetched units:", result.data?.items);
                setUnits(result.data.data?.items || []);
                setPagination({
                    current_page: result.data.current_page,
                    total_pages: result.data.total_pages,
                    count: result.data.count,
                    next: result.data.next,
                    previous: result.data.previous
                });
            } else {
                setUnitsError(result.error || "Failed to fetch units");
                setUnits([]);
            }
        } catch (error) {
            console.error("Failed to fetch units:", error);
            setUnitsError("Failed to fetch units");
            setUnits([]);
        } finally {
            setUnitsLoading(false);
        }
    };

    useEffect(() => {
        if (propertyId) {
            fetchProperty();
            fetchUnits(currentPage);
        }
    }, [propertyId]);

    // Load location data when the component mounts or property changes
    useEffect(() => {
        const loadLocationData = async () => {
            try {
                setLocationLoading(true);
                
                // Load regions
                const regionsResponse = await getRegions();
                if (regionsResponse.success) {
                    setRegions(regionsResponse.data || []);
                }
                
                // If we have a selected region, load districts
                if (selectedRegionId) {
                    const districtsResponse = await getDistricts(selectedRegionId);
                    if (districtsResponse.success) {
                        setDistricts(districtsResponse.data || []);
                    }
                }
                
                // If we have a selected district, load wards
                if (selectedDistrictId) {
                    const wardsResponse = await getWards(selectedDistrictId);
                    if (wardsResponse.success) {
                        setWards(wardsResponse.data || []);
                    }
                }
            } catch (error) {
                console.error('Error loading location data:', error);
            } finally {
                setLocationLoading(false);
            }
        };

        loadLocationData();
    }, [property]);

    const loadRegions = async () => {
        try {
            setLocationLoading(true);
            const response = await getRegions();
            if (response.success) {
                setRegions(response.data || []);
            } else {
                console.error('Failed to load regions:', response.error);
                setRegions([]);
            }
        } catch (error) {
            console.error('Error loading regions:', error);
            setRegions([]);
        } finally {
            setLocationLoading(false);
        }
    };

    const handleRegionChange = async (e) => {
        const regionId = e.target.value;
        const regionName = regionId ? e.target.options[e.target.selectedIndex].text : '';
        
        setSelectedRegionId(regionId);
        setEditData(prev => ({
            ...prev,
            region: regionName
        }));
        
        if (regionId) {
            try {
                setLocationLoading(true);
                const response = await getDistricts(regionId);
                if (response.success) {
                    setDistricts(response.data || []);
                } else {
                    console.error('Failed to load districts:', response.error);
                    setDistricts([]);
                }
            } catch (error) {
                console.error('Error loading districts:', error);
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
        setEditData(prev => ({
            ...prev,
            district: districtName
        }));
        
        if (districtId) {
            try {
                setLocationLoading(true);
                const response = await getWards(districtId);
                if (response.success) {
                    setWards(response.data || []);
                } else {
                    console.error('Failed to load wards:', response.error);
                    setWards([]);
                }
            } catch (error) {
                console.error('Error loading wards:', error);
                setWards([]);
            } finally {
                setLocationLoading(false);
            }
        }
    };

    const handleWardChange = (e) => {
        const wardCode = e.target.value;
        
        setSelectedWardId(wardCode);
        setEditData(prev => ({
            ...prev,
            ward: wardCode  // Store ward_code instead of ward_name
        }));
    };    

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchUnits(newPage);
    };

    // Helper function to get display value for location fields
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

    const formatAddress = (address) => {
        if (!address) return "N/A";
        const parts = [address.street, address.ward, address.district, address.region].filter(Boolean);
        return parts.join(", ") || "N/A";
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            'available': 'badge bg-success',
            'occupied': 'badge bg-primary',
            'maintenance': 'badge bg-warning text-dark',
            'unavailable': 'badge bg-secondary'
        };
        return statusClasses[status?.toLowerCase()] || 'badge bg-secondary';
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle property update
    const handleSave = async () => {
        setUpdateLoading(true);
        setError("");
        setSuccess("");
        
        try {
            const selectedRegion = regions.find(r => r.region_code === selectedRegionId);
            const selectedDistrict = districts.find(d => d.district_code === selectedDistrictId);
            const selectedWard = wards.find(w => w.ward_code === selectedWardId);
            
            const propertyData = {
                propertyName: editData.propertyName,
                propertyType: editData.propertyType,
                ward: selectedWard ? selectedWard.ward_name : editData.ward,
                district: selectedDistrict ? selectedDistrict.district_name : editData.district,
                region: selectedRegion ? selectedRegion.region_name : editData.region,
                street: editData.street,
            };
            
            const result = await updateProperty(propertyId, propertyData);
            if (result.success) {
                setSuccess(result.message || "Property updated successfully!");
                setIsEditing(false);
                await fetchProperty();
            } else {
                setError(result.error);
                if (result.error.includes("Session expired")) {
                    navigate("/");
                }
            }
        } catch (err) {
            setError("Failed to update property");
        } finally {
            setUpdateLoading(false);
        }
    };

    // Handle cancel edit
    const handleCancel = () => {
        setIsEditing(false);
        // Reset edit data to original values
        if (property) {
            setEditData({
                propertyName: property.property_name || "",
                propertyType: property.property_type || "",
                region: property.address?.region || "",
                district: property.address?.district || "",
                ward: property.address?.ward || "",
                street: property.address?.street || "",
                numFloors: property.num_floors || "",
                unitsPerFloor: property.units_per_floor || ""
            });
        }
        
        // Reset location state
        setSelectedRegionId('');
        setSelectedDistrictId('');
        setSelectedWardId('');
        setRegions([]);
        setDistricts([]);
        setWards([]);
        
        setError("");
        setSuccess("");
    };

    // Handle successful unit addition
    const handleUnitAdded = (newUnit) => {
        // Add the new unit to the existing list
        setUnits(prev => [...prev, newUnit]);
        setIsAddingUnit(false);
        // Optionally refresh the units list
        fetchUnits();
    };

    // Handle inline unit input changes
    const handleNewUnitChange = (e) => {
        const { name, value } = e.target;
        setNewUnitData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle inline unit save
    const handleSaveNewUnit = async () => {
        if (!newUnitData.unit_name.trim()) {
            setError('Unit name is required');
            return;
        }

        setAddingUnitLoading(true);
        setError('');

        try {
            const unitData = {
                unit_name: newUnitData.unit_name,
                rent_per_month: newUnitData.rent_per_month ? parseFloat(newUnitData.rent_per_month) : null,
                property: propertyId,
            };

            // Call the addPropertyUnit service
            const result = await addPropertyUnit(propertyId, unitData);
            
            if (result.success) {
                setUnits(prev => [...prev, result.data]);
                setNewUnitData({
                    property: propertyId,
                    unit_name: '',
                    rent_per_month: ''
                });
                setIsAddingUnit(false);
                setSuccess('Unit added successfully!');
                
                // Refresh the current page to get latest data
                fetchUnits(currentPage);
            } else {
                setError(result.error || 'Failed to add unit');
            }
        } catch (err) {
            setError('Failed to add unit. Please try again.');
        } finally {
            setAddingUnitLoading(false);
        }
    };

    // Handle cancel inline unit addition
    const handleCancelNewUnit = () => {
        setNewUnitData({
            property: propertyId,
            unit_name: '',
            rent_per_month: ''
        });
        setIsAddingUnit(false);
        setError('');
    };

    // Handle Enter key press in unit inputs
    const handleUnitKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveNewUnit();
        }
    };

    // Handle unit edit start
    const handleEditUnit = (unit) => {
        setEditingUnitId(unit.id);
        setEditUnitData({
            unit_name: unit.unit_name || '',
            rent_per_month: unit.rent_per_month || ''
        });
        setError('');
    };

    // Handle unit edit input changes
    const handleEditUnitChange = (e) => {
        const { name, value } = e.target;
        setEditUnitData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle unit edit save
    const handleSaveEditUnit = async () => {
        if (!editUnitData.unit_name.trim()) {
            setError('Unit name is required');
            return;
        }

        setUpdatingUnit(true);
        setError('');

        try {
            const unitData = {
                unit_name: editUnitData.unit_name,
                rent_per_month: editUnitData.rent_per_month ? parseFloat(editUnitData.rent_per_month) : null,
            };

            // Call the API to update the unit
            const result = await updatePropertyUnit(editingUnitId, unitData);
            
            if (result.success) {
                // Update the unit in the local state with the response data
                setUnits(prev => prev.map(unit => 
                    unit.id === editingUnitId 
                        ? { ...unit, ...result.data }
                        : unit
                ));
                
                setEditingUnitId(null);
                setEditUnitData({ unit_name: '', rent_per_month: '' });
                setSuccess(result.message || 'Unit updated successfully!');
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.error || 'Failed to update unit. Please try again.');
            }
            
        } catch (err) {
            console.error('Error updating unit:', err);
            setError('Failed to update unit. Please try again.');
        } finally {
            setUpdatingUnit(false);
        }
    };

    // Handle unit edit cancel
    const handleCancelEditUnit = () => {
        setEditingUnitId(null);
        setEditUnitData({ unit_name: '', rent_per_month: '' });
        setError('');
    };

    // Handle Enter key press in edit unit inputs
    const handleEditUnitKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveEditUnit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancelEditUnit();
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error || !property) {
        return (
            <Layout>
                <div className="main-content">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Error</h4>
                        <p>{error || "Property not found"}</p>
                        <hr />
                        <Link to="/dashboard/properties" className="btn btn-outline-primary">
                            <i className="bi bi-arrow-left me-2"></i>
                            Back to Properties
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="main-content">
                {/* Header Section */}
                <div className="leases-filters-section">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-8">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to="/dashboard">Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="/properties">Properties</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        {property.property_name}
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="col-md-4">
                            <Link to="/properties" className="btn btn-secondary w-100">
                                <i className="bi bi-arrow-left me-2"></i>
                                Back to Properties
                            </Link>
                        </div>
                    </div>
                </div>
                
                
                
                
                
                                {/* Property Information Form */}
                <div className="leases-filters-section">
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="row g-3 align-items-center mb-4">
                        <div className="col-md-8">
                            <h5 className="mb-0">
                                <i className="bi bi-building me-2"></i>
                                {property.property_name || "Property Details"}
                            </h5>
                        </div>
                        <div className="col-md-4">
                            {!isEditing ? (
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <i className="bi bi-pencil me-2"></i>
                                    Edit Property
                                </button>
                            ) : (
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-success flex-fill"
                                        onClick={handleSave}
                                        disabled={updateLoading}
                                    >
                                        <i className="bi bi-check me-2"></i>
                                        {updateLoading ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                        className="btn btn-secondary flex-fill"
                                        onClick={handleCancel}
                                        disabled={updateLoading}
                                    >
                                        <i className="bi bi-x me-2"></i>
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="property-form-compact">
                        <form>
                            <div className="row g-3">
                                {/* Left Column */}
                                <div className="col-md-6">
                                    <div className="compact-form-row">
                                        <label className="compact-inline-label">Property Name:</label>
                                        <input
                                            type="text"
                                            className="underline-input"
                                            name="propertyName"
                                            value={isEditing ? editData.propertyName : (property.property_name || '')}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            readOnly={!isEditing}
                                            placeholder="Property name..."
                                        />
                                    </div>
                                    <div className="compact-form-row">
                                        <label className="compact-inline-label">Property Type:</label>
                                        <select
                                            className="underline-select"
                                            name="propertyType"
                                            value={isEditing ? editData.propertyType : (property.property_type || '')}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Standalone">Standalone</option>
                                            <option value="Apartment">Apartment</option>
                                        </select>
                                    </div>
                                    <div className="compact-form-row">
                                        <label className="compact-inline-label">Region:</label>
                                        {isEditing ? (
                                            <select
                                                className="underline-select"
                                                name="region"
                                                value={selectedRegionId}
                                                onChange={handleRegionChange}
                                                disabled={locationLoading}
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
                                                className="underline-input"
                                                value={getLocationDisplayValue(property.address, 'region')}
                                                disabled
                                                readOnly
                                                placeholder="Region..."
                                            />
                                        )}
                                        {isEditing && locationLoading && <small className="loading-text">Loading...</small>}
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="col-md-6">
                                    <div className="compact-form-row">
                                        <label className="compact-inline-label">District:</label>
                                        {isEditing ? (
                                            <select
                                                className="underline-select"
                                                name="district"
                                                value={selectedDistrictId}
                                                onChange={handleDistrictChange}
                                                disabled={!selectedRegionId || locationLoading}
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
                                                className="underline-input"
                                                value={getLocationDisplayValue(property.address, 'district')}
                                                disabled
                                                readOnly
                                                placeholder="District..."
                                            />
                                        )}
                                    </div>
                                    <div className="compact-form-row">
                                        <label className="compact-inline-label">Ward:</label>
                                        {isEditing ? (
                                            <select
                                                className="underline-select"
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
                                        ) : (
                                            <input
                                                type="text"
                                                className="underline-input"
                                                value={getLocationDisplayValue(property.address, 'ward')}
                                                disabled
                                                readOnly
                                                placeholder="Ward..."
                                            />
                                        )}
                                    </div>
                                    <div className="compact-form-row">
                                        <label className="compact-inline-label">Street Address:</label>
                                        <input
                                            type="text"
                                            className="underline-input"
                                            name="street"
                                            value={isEditing ? editData.street : (property.address?.street || '')}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            readOnly={!isEditing}
                                            placeholder="Street address..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>                
                
                
                
                
                {/* Units Section */}
                <div className="leases-filters-section mt-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                        <div className="d-flex align-items-center">
                            <h5 className="mb-0 me-3">
                                <i className="bi bi-door-open me-2"></i>
                                Units
                            </h5>
                            {/* Page Information */}
                            {(pagination && (pagination.total_pages > 1 || pagination.count > 0)) && (
                                <small className="text-muted">
                                    Page {pagination.current_page || 1} of {pagination.total_pages || 1} 
                                    ({pagination.count || units.length} total)
                                </small>
                            )}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            {/* Pagination Navigation */}
                            {pagination && pagination.total_pages > 1 && (
                                <div className="pagination-controls d-flex gap-1 me-3">
                                    <button 
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => handlePageChange((pagination.current_page || 1) - 1)}
                                        disabled={(pagination.current_page || 1) <= 1}
                                        title="Previous Page"
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                    <button 
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => handlePageChange((pagination.current_page || 1) + 1)}
                                        disabled={(pagination.current_page || 1) >= (pagination.total_pages || 1)}
                                        title="Next Page"
                                    >
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            )}
                            {/* Add Unit Button */}
                            {!isAddingUnit && (
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setIsAddingUnit(true)}
                                    disabled={editingUnitId !== null}
                                    style={{ minWidth: '120px' }}
                                >
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Add Unit
                                </button>
                            )}
                        </div>
                    </div>

                    {unitsLoading && (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading units...</span>
                            </div>
                            <p className="text-muted mt-2">Loading units...</p>
                        </div>
                    )}

                    {!unitsLoading && units.length === 0 && (
                        <div className="text-center py-5">
                            <i className="bi bi-door-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                            <h6 className="text-muted mb-3">No Units Yet</h6>
                            <p className="text-muted mb-0">Get started by adding your first unit to this property.</p>
                        </div>
                    )}

                    {/* Inline Add Unit Form for Empty State */}
                    {!unitsLoading && units.length === 0 && isAddingUnit && (
                        <div className="add-unit-form p-4 bg-light rounded mb-4">
                            <h6 className="mb-3">
                                <i className="bi bi-plus-circle me-2"></i>
                                Add New Unit
                            </h6>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="unit_name"
                                        value={newUnitData.unit_name}
                                        onChange={handleNewUnitChange}
                                        onKeyPress={handleUnitKeyPress}
                                        placeholder="Unit name *"
                                        disabled={addingUnitLoading}
                                        autoFocus
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="rent_per_month"
                                        value={newUnitData.rent_per_month}
                                        onChange={handleNewUnitChange}
                                        onKeyPress={handleUnitKeyPress}
                                        placeholder="Rent amount *"
                                        disabled={addingUnitLoading}
                                    />
                                </div>
                                <div className="col-12">
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-success flex-fill"
                                            onClick={handleSaveNewUnit}
                                            disabled={addingUnitLoading || !newUnitData.unit_name.trim() || !newUnitData.rent_per_month}
                                        >
                                            <i className="bi bi-check me-2"></i>
                                            {addingUnitLoading ? 'Adding...' : 'Add Unit'}
                                        </button>
                                        <button 
                                            className="btn btn-secondary flex-fill"
                                            onClick={handleCancelNewUnit}
                                            disabled={addingUnitLoading}
                                        >
                                            <i className="bi bi-x me-2"></i>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!unitsLoading && units.length > 0 && (
                        <>
                            {/* Mobile View - Unit Cards */}
                            <div className="d-md-none">
                                <div className="unit-cards-container">
                                    {units.map((unit) => (
                                        <div key={unit.id} className={`unit-card-mobile ${editingUnitId === unit.id ? 'editing' : ''}`}>
                                            <div className="unit-card-header">
                                                <div className="unit-name">
                                                    {editingUnitId === unit.id ? (
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            name="unit_name"
                                                            value={editUnitData.unit_name}
                                                            onChange={handleEditUnitChange}
                                                            onKeyPress={handleEditUnitKeyPress}
                                                            disabled={updatingUnit}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className="fw-semibold">
                                                            <i className="bi bi-door-open me-1"></i>
                                                            {unit.unit_name || 'N/A'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="unit-status">
                                                    <span className={`badge ${
                                                        unit.is_occupied ? 'bg-danger' : 'bg-success'
                                                    }`}>
                                                        {unit.is_occupied ? 'Occupied' : 'Available'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="unit-card-body">
                                                <div className="unit-card-row">
                                                    <span className="unit-card-label">
                                                        <i className="bi bi-currency-dollar me-1"></i>
                                                        Monthly Rent:
                                                    </span>
                                                    {editingUnitId === unit.id ? (
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            name="rent_per_month"
                                                            value={editUnitData.rent_per_month}
                                                            onChange={handleEditUnitChange}
                                                            onKeyPress={handleEditUnitKeyPress}
                                                            disabled={updatingUnit}
                                                            placeholder="Rent amount"
                                                        />
                                                    ) : (
                                                        <span className="unit-rent-amount">
                                                            {unit.rent_per_month 
                                                                ? `TSh ${unit.rent_per_month.toLocaleString()}` 
                                                                : 'N/A'
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="unit-card-actions">
                                                {editingUnitId === unit.id ? (
                                                    <div className="d-flex gap-2">
                                                        <button 
                                                            className="btn btn-success btn-sm flex-fill"
                                                            onClick={handleSaveEditUnit}
                                                            disabled={updatingUnit || !editUnitData.unit_name.trim()}
                                                        >
                                                            <i className="bi bi-check me-1"></i>
                                                            {updatingUnit ? 'Saving...' : 'Save'}
                                                        </button>
                                                        <button 
                                                            className="btn btn-secondary btn-sm flex-fill"
                                                            onClick={handleCancelEditUnit}
                                                            disabled={updatingUnit}
                                                        >
                                                            <i className="bi bi-x me-1"></i>
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="d-flex gap-2">
                                                        <button 
                                                            className="btn btn-outline-primary btn-sm flex-fill"
                                                            onClick={() => handleEditUnit(unit)}
                                                            disabled={isAddingUnit || editingUnitId !== null}
                                                        >
                                                            <i className="bi bi-pencil me-1"></i>
                                                            Edit
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline-danger btn-sm flex-fill"
                                                            disabled={isAddingUnit || editingUnitId !== null}
                                                            onClick={() => handleDeleteUnit(unit.id)}
                                                        >
                                                            <i className="bi bi-trash me-1"></i>
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Add Unit Card for Mobile */}
                                    {isAddingUnit && (
                                        <div className="unit-card-mobile adding">
                                            <div className="unit-card-header">
                                                <div className="unit-name">
                                                    <i className="bi bi-plus-circle me-2"></i>
                                                    Add New Unit
                                                </div>
                                            </div>
                                            <div className="unit-card-body">
                                                <div className="mb-3">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        name="unit_name"
                                                        value={newUnitData.unit_name}
                                                        onChange={handleNewUnitChange}
                                                        onKeyPress={handleUnitKeyPress}
                                                        placeholder="Unit name *"
                                                        disabled={addingUnitLoading}
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        name="rent_per_month"
                                                        value={newUnitData.rent_per_month}
                                                        onChange={handleNewUnitChange}
                                                        onKeyPress={handleUnitKeyPress}
                                                        placeholder="Rent amount *"
                                                        disabled={addingUnitLoading}
                                                    />
                                                </div>
                                            </div>
                                            <div className="unit-card-actions">
                                                <div className="d-flex gap-2">
                                                    <button 
                                                        className="btn btn-success btn-sm flex-fill"
                                                        onClick={handleSaveNewUnit}
                                                        disabled={addingUnitLoading || !newUnitData.unit_name.trim() || !newUnitData.rent_per_month}
                                                    >
                                                        <i className="bi bi-check me-1"></i>
                                                        {addingUnitLoading ? 'Adding...' : 'Add'}
                                                    </button>
                                                    <button 
                                                        className="btn btn-secondary btn-sm flex-fill"
                                                        onClick={handleCancelNewUnit}
                                                        disabled={addingUnitLoading}
                                                    >
                                                        <i className="bi bi-x me-1"></i>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Desktop View - Table */}
                            <div className="d-none d-md-block">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Unit Name</th>
                                                <th>Rent Amount</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {units.map((unit) => (
                                                <tr key={unit.id} className={editingUnitId === unit.id ? "table-warning" : ""}>
                                                    <td>
                                                        {editingUnitId === unit.id ? (
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                name="unit_name"
                                                                value={editUnitData.unit_name}
                                                                onChange={handleEditUnitChange}
                                                                onKeyPress={handleEditUnitKeyPress}
                                                                disabled={updatingUnit}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className="fw-semibold">
                                                                {unit.unit_name || 'N/A'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingUnitId === unit.id ? (
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                name="rent_per_month"
                                                                value={editUnitData.rent_per_month}
                                                                onChange={handleEditUnitChange}
                                                                onKeyPress={handleEditUnitKeyPress}
                                                                disabled={updatingUnit}
                                                                placeholder="Rent amount"
                                                            />
                                                        ) : (
                                                            <span className="fw-semibold text-success">
                                                                {unit.rent_per_month 
                                                                    ? `TSh ${unit.rent_per_month.toLocaleString()}` 
                                                                    : 'N/A'
                                                                }
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${
                                                            unit.is_occupied ? 'bg-danger' : 'bg-success'
                                                        }`}>
                                                            {unit.is_occupied ? 'Occupied' : 'Available'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {editingUnitId === unit.id ? (
                                                            <div className="btn-group btn-group-sm">
                                                                <button 
                                                                    className="btn btn-success btn-sm"
                                                                    onClick={handleSaveEditUnit}
                                                                    disabled={updatingUnit || !editUnitData.unit_name.trim()}
                                                                    title="Save Changes"
                                                                >
                                                                    <i className="bi bi-check"></i>
                                                                </button>
                                                                <button 
                                                                    className="btn btn-secondary btn-sm"
                                                                    onClick={handleCancelEditUnit}
                                                                    disabled={updatingUnit}
                                                                    title="Cancel Edit"
                                                                >
                                                                    <i className="bi bi-x"></i>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="btn-group btn-group-sm" role="group">
                                                                <button 
                                                                    className="btn btn-outline-success"
                                                                    title="Edit Unit"
                                                                    onClick={() => handleEditUnit(unit)}
                                                                    disabled={isAddingUnit || editingUnitId !== null}
                                                                >
                                                                    <i className="bi bi-pencil"></i>
                                                                </button>
                                                                <button 
                                                                    className="btn btn-outline-danger"
                                                                    title="Delete Unit"
                                                                    disabled={isAddingUnit || editingUnitId !== null}
                                                                    onClick={() => handleDeleteUnit(unit.id)}
                                                                >
                                                                    <i className="bi bi-trash"></i>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            
                                            {/* Inline Add Unit Row for Desktop */}
                                            {isAddingUnit && (
                                                <tr className="table-active">
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            name="unit_name"
                                                            value={newUnitData.unit_name}
                                                            onChange={handleNewUnitChange}
                                                            onKeyPress={handleUnitKeyPress}
                                                            placeholder="Unit name *"
                                                            disabled={addingUnitLoading}
                                                            autoFocus
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            name="rent_per_month"
                                                            value={newUnitData.rent_per_month}
                                                            onChange={handleNewUnitChange}
                                                            onKeyPress={handleUnitKeyPress}
                                                            placeholder="Rent amount *"
                                                            disabled={addingUnitLoading}
                                                        />
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-success">
                                                            Available
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <button 
                                                                className="btn btn-success btn-sm"
                                                                onClick={handleSaveNewUnit}
                                                                disabled={addingUnitLoading || !newUnitData.unit_name.trim() || !newUnitData.rent_per_month}
                                                                title="Save Unit"
                                                            >
                                                                <i className="bi bi-check"></i>
                                                            </button>
                                                            <button 
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={handleCancelNewUnit}
                                                                disabled={addingUnitLoading}
                                                                title="Cancel"
                                                            >
                                                                <i className="bi bi-x"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                                        {/* Additional pagination for large datasets */}
                                        {pagination && pagination.total_pages > 5 && (
                                            <div className="mt-4">
                                                <nav aria-label="Units pagination">
                                                    <ul className="pagination justify-content-center">
                                                        <li className={`page-item ${(pagination.current_page || 1) <= 1 ? 'disabled' : ''}`}>
                                                            <button 
                                                                className="page-link"
                                                                onClick={() => handlePageChange(1)}
                                                                disabled={(pagination.current_page || 1) <= 1}
                                                                title="First Page"
                                                            >
                                                                <i className="bi bi-chevron-double-left"></i>
                                                            </button>
                                                        </li>
                                                        
                                                        {/* Page Numbers */}
                                                        {(() => {
                                                            const current = pagination.current_page || 1;
                                                            const total = pagination.total_pages || 1;
                                                            const pages = [];
                                                            
                                                            for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
                                                                pages.push(i);
                                                            }
                                                            
                                                            return pages.map((page) => (
                                                                <li 
                                                                    key={page}
                                                                    className={`page-item ${current === page ? 'active' : ''}`}
                                                                >
                                                                    <button 
                                                                        className="page-link"
                                                                        onClick={() => handlePageChange(page)}
                                                                        title={`Go to page ${page}`}
                                                                    >
                                                                        {page}
                                                                    </button>
                                                                </li>
                                                            ));
                                                        })()}
                                                        
                                                        <li className={`page-item ${(pagination.current_page || 1) >= (pagination.total_pages || 1) ? 'disabled' : ''}`}>
                                                            <button 
                                                                className="page-link"
                                                                onClick={() => handlePageChange(pagination.total_pages || 1)}
                                                                disabled={(pagination.current_page || 1) >= (pagination.total_pages || 1)}
                                                                title="Last Page"
                                                            >
                                                                <i className="bi bi-chevron-double-right"></i>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                        )}
                    </>
                )}
            </div>
        </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={cancelDeleteUnit} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this unit? This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelDeleteUnit} disabled={deletingUnit}>
                        Cancel
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={confirmDeleteUnit} 
                        disabled={deletingUnit}
                    >
                        {deletingUnit ? 'Deleting...' : 'Delete Unit'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Layout>
    );
}

export default Property;
