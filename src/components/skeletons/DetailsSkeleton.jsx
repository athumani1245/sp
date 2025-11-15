import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * DetailsSkeleton - Skeleton loader for detail pages (Property, Lease, Tenant details)
 */
const DetailsSkeleton = () => {
    return (
        <div className="main-content">
            <div className="mb-4">
                {/* Back button and title */}
                <div className="d-flex align-items-center mb-3">
                    <Skeleton width={80} height={36} className="me-3" borderRadius={4} />
                    <Skeleton width={250} height={32} />
                </div>
            </div>

            {/* Main content area */}
            <div className="row">
                {/* Left column - Details */}
                <div className="col-lg-8">
                    <div className="card mb-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <Skeleton width={150} height={24} />
                            <Skeleton width={100} height={36} borderRadius={4} />
                        </div>
                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-md-6 mb-3">
                                    <Skeleton width="40%" height={14} className="mb-2" />
                                    <Skeleton width="80%" height={20} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <Skeleton width="40%" height={14} className="mb-2" />
                                    <Skeleton width="80%" height={20} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <Skeleton width="40%" height={14} className="mb-2" />
                                    <Skeleton width="80%" height={20} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <Skeleton width="40%" height={14} className="mb-2" />
                                    <Skeleton width="80%" height={20} />
                                </div>
                                <div className="col-12 mb-3">
                                    <Skeleton width="40%" height={14} className="mb-2" />
                                    <Skeleton width="100%" height={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional section */}
                    <div className="card">
                        <div className="card-header">
                            <Skeleton width={120} height={24} />
                        </div>
                        <div className="card-body">
                            <Skeleton count={3} height={60} className="mb-2" />
                        </div>
                    </div>
                </div>

                {/* Right column - Summary/Stats */}
                <div className="col-lg-4">
                    <div className="card mb-4">
                        <div className="card-header">
                            <Skeleton width={100} height={20} />
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <Skeleton width="50%" height={14} className="mb-2" />
                                <Skeleton width="70%" height={28} />
                            </div>
                            <div className="mb-3">
                                <Skeleton width="50%" height={14} className="mb-2" />
                                <Skeleton width="70%" height={28} />
                            </div>
                            <div className="mb-3">
                                <Skeleton width="50%" height={14} className="mb-2" />
                                <Skeleton width="70%" height={28} />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-body">
                            <Skeleton width="100%" height={44} className="mb-2" borderRadius={4} />
                            <Skeleton width="100%" height={44} borderRadius={4} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailsSkeleton;
