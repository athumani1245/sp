import React from 'react';


const addProperty = ({isOpen, onClose})=>{
    if (!isOpen) return null;
    return (
                <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.3)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form>
                                <div className="modal-header">
                                    <h5 className="modal-title">Add Property</h5>
                                    <button type="button" className="btn-close" onClick={onClose}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Property Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value=""
                                            // onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Location</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="location"
                                            value=""
                                            // onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Rent Amount</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="rent"
                                            value=""
                                            // onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-select"
                                            name="status"
                                            value=""
                                            // onChange={handleChange}
                                        >
                                            <option value="Vacant">Vacant</option>
                                            <option value="Occupied">Occupied</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Save Property
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
    );

}

export default addProperty;