import React, { useState } from 'react';
import '../../assets/styles/add-unit.css';
import { addPropertyUnit } from '../../services/propertyService';
import { formatNumberWithCommas, parseFormattedNumber } from '../../utils/formatUtils';

const AddUnitModal = ({ isOpen, onClose, onUnitAdded, propertyId }) => {
    const [formData, setFormData] = useState({
        unitNumber: '',
        floor: '',
        unitType: 'Standard',
        bedrooms: '',
        bathrooms: '',
        squareFootage: '',
        rentAmount: '',
        description: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        
        if (name === 'rentAmount') {
            // Handle monetary input with comma formatting
            const rawValue = parseFormattedNumber(value);
            setFormData(prev => ({
                ...prev,
                [name]: rawValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Format data for API
            const unitData = {
                unit_number: formData.unitNumber,
                floor: formData.floor ? Number(formData.floor) : null,
                unit_type: formData.unitType,
                bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
                bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
                square_footage: formData.squareFootage ? Number(formData.squareFootage) : null,
                rent_amount: formData.rentAmount ? Number(formData.rentAmount) : null,
                description: formData.description || null,
                status: 'available' // Default status
            };

            const result = await addPropertyUnit(propertyId, unitData);
            if (result.success) {
                setSuccess(result.message || 'Unit added successfully!');
                // Reset form
                setFormData({
                    unitNumber: '',
                    floor: '',
                    unitType: 'Standard',
                    bedrooms: '',
                    bathrooms: '',
                    squareFootage: '',
                    rentAmount: '',
                    description: ''
                });
                // Notify parent component
                if (onUnitAdded) {
                    onUnitAdded(result.data);
                }
                // Close modal after a short delay
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to add unit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError('');
        setSuccess('');
        // Reset form data when closing
        setFormData({
            unitNumber: '',
            floor: '',
            unitType: 'Standard',
            bedrooms: '',
            bathrooms: '',
            squareFootage: '',
            rentAmount: '',
            description: ''
        });
        onClose();
    };

    if (!isOpen) return null;
    
    return (
        <div 
            className="add-unit-modal" 
            tabIndex="-1"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
            onKeyDown={(e) => e.key === 'Escape' && handleClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="unit-modal-title"
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h5 id="unit-modal-title" className="modal-title">Add Unit</h5>
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
                            
                            {/* Unit Number */}
                            <div className="mb-3">
                                <label htmlFor="unitNumber" className="form-label">Unit Number *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="unitNumber"
                                    name="unitNumber"
                                    value={formData.unitNumber}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 101, A1, Unit 5"
                                    required
                                />
                            </div>

                            {/* Floor and Unit Type */}
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="floor" className="form-label">Floor</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="floor"
                                            name="floor"
                                            value={formData.floor}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 1, 2, 3"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="unitType" className="form-label">Unit Type</label>
                                        <select
                                            className="form-select"
                                            id="unitType"
                                            name="unitType"
                                            value={formData.unitType}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Standard">Standard</option>
                                            <option value="Studio">Studio</option>
                                            <option value="1-Bedroom">1-Bedroom</option>
                                            <option value="2-Bedroom">2-Bedroom</option>
                                            <option value="3-Bedroom">3-Bedroom</option>
                                            <option value="4+ Bedroom">4+ Bedroom</option>
                                            <option value="Penthouse">Penthouse</option>
                                            <option value="Commercial">Commercial</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Bedrooms and Bathrooms */}
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="bedrooms" className="form-label">Bedrooms</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="bedrooms"
                                            name="bedrooms"
                                            value={formData.bedrooms}
                                            onChange={handleInputChange}
                                            placeholder="Number of bedrooms"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="bathrooms" className="form-label">Bathrooms</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="bathrooms"
                                            name="bathrooms"
                                            value={formData.bathrooms}
                                            onChange={handleInputChange}
                                            placeholder="Number of bathrooms"
                                            min="0"
                                            step="0.5"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Square Footage and Rent Amount */}
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="squareFootage" className="form-label">Square Footage</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="squareFootage"
                                            name="squareFootage"
                                            value={formData.squareFootage}
                                            onChange={handleInputChange}
                                            placeholder="Size in sq ft"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label htmlFor="rentAmount" className="form-label">Rent Amount (TSh)</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="rentAmount"
                                            name="rentAmount"
                                            value={formatNumberWithCommas(formData.rentAmount)}
                                            onChange={handleInputChange}
                                            placeholder="Monthly rent amount"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">Description (Optional)</label>
                                <textarea
                                    className="form-control"
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Additional details about the unit..."
                                    rows="3"
                                ></textarea>
                            </div>
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
                                {loading ? 'Adding Unit...' : 'Add Unit'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUnitModal;
