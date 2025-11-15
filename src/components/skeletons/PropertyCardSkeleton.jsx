import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * PropertyCardSkeleton - Skeleton loader specifically for property cards
 * @param {number} count - Number of skeleton cards to display (default: 3)
 */
const PropertyCardSkeleton = ({ count = 3 }) => {
    return (
        <div className="row">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="col-md-4 col-sm-6 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div style={{ flex: 1 }}>
                                    <Skeleton width="70%" height={22} className="mb-2" />
                                    <Skeleton width="90%" height={16} />
                                </div>
                            </div>
                            <hr className="my-3" />
                            <div className="mb-2">
                                <Skeleton width="40%" height={14} className="mb-1" />
                                <Skeleton width="60%" height={18} />
                            </div>
                            <div className="mb-2">
                                <Skeleton width="40%" height={14} className="mb-1" />
                                <Skeleton width="50%" height={18} />
                            </div>
                            <div className="text-center mt-3">
                                <Skeleton width="100%" height={36} borderRadius={4} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PropertyCardSkeleton;
