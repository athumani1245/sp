import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * CardSkeleton - Skeleton loader for card-based mobile views
 * @param {number} count - Number of skeleton cards to display (default: 3)
 */
const CardSkeleton = ({ count = 3 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="card mb-3">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div style={{ flex: 1 }}>
                                <Skeleton width="60%" height={24} className="mb-2" />
                                <Skeleton width="40%" height={16} />
                            </div>
                            <Skeleton circle width={40} height={40} />
                        </div>
                        <hr />
                        <div className="row">
                            <div className="col-6 mb-2">
                                <Skeleton width="50%" height={14} className="mb-1" />
                                <Skeleton width="80%" height={18} />
                            </div>
                            <div className="col-6 mb-2">
                                <Skeleton width="50%" height={14} className="mb-1" />
                                <Skeleton width="80%" height={18} />
                            </div>
                            <div className="col-6 mb-2">
                                <Skeleton width="50%" height={14} className="mb-1" />
                                <Skeleton width="80%" height={18} />
                            </div>
                            <div className="col-6 mb-2">
                                <Skeleton width="50%" height={14} className="mb-1" />
                                <Skeleton width="80%" height={18} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default CardSkeleton;
