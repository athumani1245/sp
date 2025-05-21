import React from "react";


function Outstanding() {
    return (
        <div className="col-md-3 col-6">
            <div className="activity-card h-100">
                <div className="icon"><i className="bi bi-hourglass-split"></i></div>
                <div className="stat-label">Outstanding Rent Payment</div>
                <div className="stat">2.1 M <span className="stat-change positive">+13%</span></div>
            </div>
        </div>
    );
}
export default Outstanding;