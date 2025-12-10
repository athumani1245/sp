import React from "react";
import PropTypes from 'prop-types';
import { InfoTooltip } from '../common/Tooltip';

function Outstanding({ data }) {
    // Format the pending income amount
    const formatAmount = (amount) => {
        const num = parseFloat(amount || 0);
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    };

    const pendingAmount = data?.pending_income || "0.00";
    const expectedAmount = data?.total_expected_rent || "0.00";
    
    // Calculate percentage of outstanding vs expected
    const outstandingPercentage = expectedAmount !== "0.00" 
        ? ((parseFloat(pendingAmount) / parseFloat(expectedAmount)) * 100).toFixed(1)
        : "0";

    return (
        <div className="col-md-3 col-6">
            <div className="activity-card h-100">
                <div className="icon"><i className="bi bi-hourglass-split"></i></div>
                <div className="stat-label">
                    Outstanding Rent Payment
                    <InfoTooltip 
                        content={`<strong>Pending: ${outstandingPercentage}% of expected</strong><br/>Outstanding: TSh ${parseFloat(pendingAmount).toLocaleString()}<br/>Total Expected: TSh ${parseFloat(expectedAmount).toLocaleString()}<br/><br/>Amount due but not yet collected from tenants.`}
                        theme="warning"
                    />
                </div>
                <div className="stat">
                    {formatAmount(pendingAmount)} 
                    <span className={`stat-change ${parseFloat(pendingAmount) > 0 ? 'negative' : 'positive'}`}>
                        {outstandingPercentage}%
                    </span>
                </div>
            </div>
        </div>
    );
}

Outstanding.propTypes = {
    data: PropTypes.shape({
        pending_income: PropTypes.string,
        total_expected_rent: PropTypes.string
    })
};

Outstanding.defaultProps = {
    data: {
        pending_income: "0.00",
        total_expected_rent: "0.00"
    }
};

export default Outstanding;