import React from "react";
import PropTypes from 'prop-types';

function Occupied({ data }) {
    const occupiedUnits = data?.occupied_units || 0;
    const vacantUnits = data?.vacant_units || 0;
    const totalUnits = occupiedUnits + vacantUnits;
    
    // Calculate occupancy percentage
    const occupancyRate = totalUnits > 0 
        ? ((occupiedUnits / totalUnits) * 100).toFixed(1)
        : "0";
    
    const isGoodOccupancy = parseFloat(occupancyRate) >= 70; // 70% or higher is considered good

    return (
        <div className="col-md-3 col-6">
            <div className="activity-card h-100">
                <div className="icon"><i className="bi bi-door-open"></i></div>
                <div className="stat-label">Occupied & Vacant</div>
                <div className="stat">
                    {occupiedUnits} | {vacantUnits} 
                    <span className={`stat-change ${isGoodOccupancy ? 'positive' : 'negative'}`}>
                        {occupancyRate}%
                    </span>
                </div>
            </div>
        </div>
    );
}

Occupied.propTypes = {
    data: PropTypes.shape({
        occupied_units: PropTypes.number,
        vacant_units: PropTypes.number
    })
};

Occupied.defaultProps = {
    data: {
        occupied_units: 0,
        vacant_units: 0
    }
};

export default Occupied;