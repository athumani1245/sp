import React from "react";
import PropTypes from 'prop-types';
import { InfoTooltip } from '../common/Tooltip';

function Income({ data }) {
    // Format the income amount
    const formatAmount = (amount) => {
        const num = parseFloat(amount || 0);
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    };

    const rentCollected = data?.total_rent_collected || "0.00";
    const expectedRent = data?.total_expected_rent || "0.00";
    
    // Calculate collection efficiency
    const collectionRate = parseFloat(expectedRent) > 0 
        ? ((parseFloat(rentCollected) / parseFloat(expectedRent)) * 100).toFixed(1)
        : "0";
    
    const isGoodCollection = parseFloat(collectionRate) >= 80; // 80% or higher is considered good

    return (
        <div className="col-md-3 col-6">
            <div className="activity-card h-100">
                <div className="icon"><i className="bi bi-cash-stack"></i></div>
                <div className="stat-label">
                    Total Revenue
                    <InfoTooltip 
                        content={`<strong>Collection Rate: ${collectionRate}%</strong><br/>Collected: TSh ${parseFloat(rentCollected).toLocaleString()}<br/>Expected: TSh ${parseFloat(expectedRent).toLocaleString()}<br/><br/>Shows total rent collected vs. expected rent this period.`}
                        theme={isGoodCollection ? 'success' : 'warning'}
                    />
                </div>
                <div className="stat">
                    {formatAmount(rentCollected)} 
                    <span className={`stat-change ${isGoodCollection ? 'positive' : 'negative'}`}>
                        {collectionRate}%
                    </span>
                </div>
            </div>
        </div>
    );
}

Income.propTypes = {
    data: PropTypes.shape({
        total_rent_collected: PropTypes.string,
        total_expected_rent: PropTypes.string
    })
};

Income.defaultProps = {
    data: {
        total_rent_collected: "0.00",
        total_expected_rent: "0.00"
    }
};

export default Income;