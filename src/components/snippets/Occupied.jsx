import React from "react";

function Occupied() {
    return (
        <div className="col-md-3 col-6">
            <div className="activity-card h-100">
                <div className="icon"><i className="bi bi-door-open"></i></div>
                <div className="stat-label">Occupied & Vacant</div>
                <div className="stat">30 | 6 <span className="stat-change negative">-34%</span></div>
            </div>
        </div>
    );
}
export default Occupied;