import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * PlanCardsSkeleton - Skeleton loader for subscription plan cards
 * @param {number} count - Number of plan cards to show (default: 3)
 */
const PlanCardsSkeleton = ({ count = 3 }) => {
    return (
        <div className="row g-3">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="col-md-4">
                    <div className="card h-100">
                        <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <Skeleton width="60%" height={20} />
                            </div>
                            <div className="mb-3">
                                <Skeleton width="80%" height={28} />
                                <Skeleton width="40%" height={14} />
                            </div>
                            <hr className="my-3" />
                            <div>
                                <Skeleton width="50%" height={16} className="mb-2" />
                                <Skeleton count={2} height={14} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PlanCardsSkeleton;
