import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import Layout from "../../components/Layout";
import { getPropertyById, getPropertyUnits, updateProperty, getRegions, getDistricts, getWards, addPropertyUnit, deletePropertyUnit, updatePropertyUnit } from "../../services/propertyService";
import "../../assets/styles/property-details.css";

function Property() {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    
    const [property, setProperty] = useState(null);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unitsLoading, setUnitsLoading] = useState(false);    const [error, setError] = useState("");
    const [unitsError, setUnitsError] = useState("");
    const [pagination, setPagination] = useState({});
    
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
                // Populate edit data
                setEditData({
                    propertyName: result.data.property_name || "",
                    propertyType: result.data.property_type || "",
                    region: result.data.address?.region || "",
                    district: result.data.address?.district || "",
                    ward: result.data.address?.ward || "",
                    street: result.data.address?.street || "",
                });
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
    const fetchUnits = async () => {
        try {
            setUnitsLoading(true);
            setUnitsError("");
            const result = await getPropertyUnits({ 
                property: propertyId,
            });
            console.log(result)
            
            if (result.success) {
                setUnits(result.data || []);
                setPagination(result.pagination || {});
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
            fetchUnits();
        }
    }, [propertyId]);

    // Load regions when editing starts
    useEffect(() => {
        if (isEditing) {
            loadRegions();
            // If we have existing location data, we need to populate the selected IDs
            if (property?.address) {
                // Here we would need to find the region/district/ward IDs based on names
                // For now, we'll handle this in the region loading
            }
        }
    }, [isEditing, property]);

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
            district: districtName,
            ward: ''
        }));
        
        // Reset wards
        setWards([]);
        setSelectedWardId('');
        
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
            const propertyData = {
                propertyName: editData.propertyName,
                propertyType: editData.propertyType,
                ward: editData.ward,
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
                
                // Refresh the units list to get latest data
                fetchUnits();
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
                {/* Header with breadcrumb */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <Link to="/dashboard">Dashboard</Link>
                                </li>
                                <li className="breadcrumb-item">
                                    <Link to="/dashboard/properties">Properties</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    {property.property_name}
                                </li>
                            </ol>
                        </nav>
                    </div>
                    <div>
                        
                        <Link to="/dashboard/properties" className="btn btn-secondary">
                            <i className="bi bi-arrow-left me-2"></i>
                            Back
                        </Link>
                    </div>
                </div>
                
                
                
                
                
                                {/* Property Information Form */}
                <div className="profile-container">
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <div className="row">
                        {/* Property Information Section */}
                        <div className="col-md-12">
                            <div className="profile-card">
                                <div className="card-header">
                                    <h5 className="card-title">
                                        <i className="bi bi-building me-2"></i>
                                        {property.property_name || "Property Details"}
                                    </h5>
                                    {!isEditing ? (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <i className="bi bi-pencil me-2"></i>
                                            Edit Property
                                        </button>
                                    ) : (
                                        <div>
                                            <button
                                                className="btn btn-success btn-sm me-2"
                                                onClick={handleSave}
                                                disabled={updateLoading}
                                            >
                                                <i className="bi bi-check me-2"></i>
                                                {updateLoading ? "Saving..." : "Save Changes"}
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={handleCancel}
                                                disabled={updateLoading}
                                            >
                                                <i className="bi bi-x me-2"></i>
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="card-body">
                                    <form>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="propertyName" className="form-label">Property Name</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="propertyName"
                                                        name="propertyName"
                                                        value={isEditing ? editData.propertyName : (property.property_name || '')}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        readOnly={!isEditing}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="propertyType" className="form-label">Property Type</label>
                                                    <select
                                                        className="form-control"
                                                        id="propertyType"
                                                        name="propertyType"
                                                        value={isEditing ? editData.propertyType : (property.property_type || '')}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                    >
                                                        <option value="">Select Type</option>
                                                        <option value="Residential">Residential</option>
                                                        <option value="Commercial">Commercial</option>
                                                        <option value="Mixed">Mixed</option>
                                                        <option value="Industrial">Industrial</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="region" className="form-label">Region</label>
                                                    {isEditing ? (
                                                        <select
                                                            className="form-control"
                                                            id="region"
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
                                                            className="form-control"
                                                            id="region"
                                                            name="region"
                                                            value={getLocationDisplayValue(property.address, 'region')}
                                                            disabled
                                                            readOnly
                                                        />
                                                    )}
                                                    {isEditing && locationLoading && <small className="text-muted">Loading regions...</small>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="district" className="form-label">District</label>
                                                    {isEditing ? (
                                                        <select
                                                            className="form-control"
                                                            id="district"
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
                                                            className="form-control"
                                                            id="district"
                                                            name="district"
                                                            value={getLocationDisplayValue(property.address, 'district')}
                                                            disabled
                                                            readOnly
                                                        />
                                                    )}
                                                    {isEditing && locationLoading && <small className="text-muted">Loading districts...</small>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="ward" className="form-label">Ward</label>
                                                    {isEditing ? (
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
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="ward"
                                                            name="ward"
                                                            value={getLocationDisplayValue(property.address, 'ward')}
                                                            disabled
                                                            readOnly
                                                        />
                                                    )}
                                                    {isEditing && locationLoading && <small className="text-muted">Loading wards...</small>}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="street" className="form-label">Street</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="street"
                                                        name="street"
                                                        value={isEditing ? editData.street : (property.address?.street || '')}
                                                        onChange={handleInputChange}
                                                        disabled={!isEditing}
                                                        readOnly={!isEditing}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="status" className="form-label">Status</label>
                                                    <div className="form-control-static">
                                                        <span className={getStatusBadge(property.status)}>
                                                            {property.status || 'Active'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="totalUnits" className="form-label">Total Units</label>
                                                    <input
                                                        type="text"
                                                        className="form-control fw-bold text-primary"
                                                        id="totalUnits"
                                                        value={property.id || 'N/A'}
                                                        disabled
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label htmlFor="createdAt" className="form-label">Created Date</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="createdAt"
                                                        value={property.created_at 
                                                            ? new Date(property.created_at).toLocaleDateString()
                                                            : 'N/A'
                                                        }
                                                        disabled
                                                        readOnly
                                                    />
                                                </div>
                                            </div>                                            
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Property Managers</label>
                                                    <div className="form-control-static" role="region" aria-label="Property managers list">
                                                        {property.managers && property.managers.length > 0 ? (
                                                            <div className="d-flex flex-wrap gap-2">
                                                                {property.managers.map((manager) => (
                                                                    <span key={manager.id || manager.email || manager.name} className="badge bg-info text-dark">
                                                                        <i className="bi bi-person me-1"></i>
                                                                        {manager.name || manager.email || 'Manager'}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted">No managers assigned</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                
                
                
                
                
                {/* Units Section */}
                <div className="row mt-4">
                    <div className="col-md-12">
                        <div className="profile-card">
                            <div className="card-header">
                                <h5 className="card-title">
                                    <i className="bi bi-door-open me-2"></i>
                                    Property Units
                                    {units.length > 0 && (
                                        <span className="badge bg-primary ms-2">{units.length}</span>
                                    )}
                                </h5>
                            </div>
                            <div className="card-body">
                                {unitsError && (
                                    <div className="alert alert-danger" role="alert">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        {unitsError}
                                    </div>
                                )}

                                {unitsLoading && (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading units...</span>
                                        </div>
                                        <p className="text-muted mt-2">Loading units...</p>
                                    </div>
                                )}

                                {!unitsLoading && units.length === 0 && (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Unit Number</th>
                                                    <th>Rent Amount</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Inline Add Unit Row */}
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
                                                
                                                {/* Add Unit Instruction Row */}
                                                {!isAddingUnit && (
                                                    <tr className="table-light">
                                                        <td colSpan="7" className="text-center py-4">
                                                            <div className="d-flex flex-column align-items-center">
                                                                <i className="bi bi-door-open text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                                                                <h6 className="text-muted mb-2">No Units Yet</h6>
                                                                <div className="d-flex align-items-center">
                                                                    <i className="bi bi-plus-circle text-primary me-2"></i>
                                                                    <button 
                                                                        className="btn btn-link p-0 text-primary fw-semibold"
                                                                        onClick={() => setIsAddingUnit(true)}
                                                                        disabled={editingUnitId !== null}
                                                                    >
                                                                        Click here to add your first unit
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {!unitsLoading && units.length > 0 && (
                                    <>
                                        <div className="table-responsive">
                                            <table className="table table-hover align-middle">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Unit Name</th>
                                                        <th>Rent Amount</th>
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
                                                    
                                                    {/* Inline Add Unit Row */}
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
                                                    
                                                    {/* Add Unit Instruction Row */}
                                                    {!isAddingUnit && (
                                                        <tr className="table-light">
                                                            <td colSpan="7" className="text-center py-3">
                                                                <div className="d-flex align-items-center justify-content-center">
                                                                    <i className="bi bi-plus-circle text-primary me-2"></i>
                                                                    <span className="text-muted me-2">Want to add a new unit?</span>
                                                                    <button 
                                                                        className="btn btn-link p-0 text-primary"
                                                                        onClick={() => setIsAddingUnit(true)}
                                                                        disabled={editingUnitId !== null}
                                                                    >
                                                                        Click here to add unit
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {pagination && pagination.total_pages > 1 && (
                                            <nav aria-label="Units pagination" className="mt-3">
                                                <ul className="pagination justify-content-center">
                                                    <li className={`page-item ${pagination.current_page <= 1 ? 'disabled' : ''}`}>
                                                        <button 
                                                            className="page-link"
                                                            onClick={() => handlePageChange(pagination.current_page - 1)}
                                                            disabled={pagination.current_page <= 1}
                                                        >
                                                            Previous
                                                        </button>
                                                    </li>
                                                    
                                                    {[...Array(pagination.total_pages)].map((_, index) => {
                                                        const pageNum = index + 1;
                                                        return (
                                                            <li 
                                                                key={pageNum}
                                                                className={`page-item ${pagination.current_page === pageNum ? 'active' : ''}`}
                                                            >
                                                                <button 
                                                                    className="page-link"
                                                                    onClick={() => handlePageChange(pageNum)}
                                                                >
                                                                    {pageNum}
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                                    
                                                    <li className={`page-item ${pagination.current_page >= pagination.total_pages ? 'disabled' : ''}`}>
                                                        <button 
                                                            className="page-link"
                                                            onClick={() => handlePageChange(pagination.current_page + 1)}
                                                            disabled={pagination.current_page >= pagination.total_pages}
                                                        >
                                                            Next
                                                        </button>
                                                    </li>
                                                </ul>
                                            </nav>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
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
