import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * LicenseInfoSkeleton - Skeleton loader for license/subscription information modal
 */
const LicenseInfoSkeleton = () => {
    return (
        <div className="py-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Skeleton width={120} height={24} />
                <Skeleton width={80} height={24} borderRadius={12} />
            </div>
            
            <div className="bg-light p-3 rounded mb-4">
                <div className="row">
                    <div className="col-6 mb-3">
                        <Skeleton width="60%" height={16} className="mb-2" />
                        <Skeleton width="80%" height={20} />
                    </div>
                    <div className="col-6 mb-3">
                        <Skeleton width="60%" height={16} className="mb-2" />
                        <Skeleton width="80%" height={20} />
                    </div>
                    <div className="col-6">
                        <Skeleton width="60%" height={16} className="mb-2" />
                        <Skeleton width="80%" height={20} />
                    </div>
                    <div className="col-6">
                        <Skeleton width="60%" height={16} className="mb-2" />
                        <Skeleton width="80%" height={20} />
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <Skeleton width="40%" height={18} className="mb-2" />
                <Skeleton width="100%" height={8} borderRadius={4} />
            </div>

            <div className="mb-3">
                <Skeleton count={2} height={16} />
            </div>

            <Skeleton width="100%" height={44} borderRadius={4} />
        </div>
    );
};

export default LicenseInfoSkeleton;
