import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * DashboardSkeleton - Skeleton loader for dashboard stats cards
 */
const DashboardSkeleton = () => {
    return (
        <div className="row g-3">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="col-lg-3 col-md-6 col-sm-6">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <Skeleton circle width={48} height={48} />
                                <Skeleton width={80} height={24} />
                            </div>
                            <Skeleton width="60%" height={16} className="mb-2" />
                            <Skeleton width="90%" height={32} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardSkeleton;
