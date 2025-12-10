import React from "react";
import PropTypes from 'prop-types';
import { InfoTooltip } from '../common/Tooltip';

function Properties({ data }) {
    const totalProperties = data?.total_number_of_properties || 0;
    const totalUnits = data?.total_units || 0;
    
    // Show growth indicator (you can customize this logic based on historical data)
    const showGrowth = totalProperties > 0;

    return (
        <div className="col-md-3 col-6">
            <div className="activity-card h-100">
                <div className="icon"><i className="bi bi-buildings"></i></div>
                <div className="stat-label">
                    Total Properties
                    <InfoTooltip 
                        content={`<strong>Portfolio Summary</strong><br/>Properties: ${totalProperties}<br/>Total Units: ${totalUnits}<br/><br/>`}
                        theme="info"
                    />
                </div>
                <div className="stat">
                    {totalProperties} 
                    {showGrowth && (
                        <span className="stat-change positive">
                            {totalUnits} units
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

Properties.propTypes = {
    data: PropTypes.shape({
        total_number_of_properties: PropTypes.number,
        total_units: PropTypes.number
    })
};

Properties.defaultProps = {
    data: {
        total_number_of_properties: 0,
        total_units: 0
    }
};

export default Properties;