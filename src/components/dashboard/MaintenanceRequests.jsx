import React from 'react';

const MaintenanceRequests = () => {
    const requests = [
        {
            id: 1,
            type: 'Plumbing',
            location: '721 Meadowview',
            issue: 'Broken Garbage',
            assignee: 'Jacob Jones',
            avatar: 'JJ',
            avatarColor: '#e3f2fd'
        },
        {
            id: 2,
            type: 'Electrical',
            location: '721 Meadowview',
            issue: 'No Heat Bathroom',
            assignee: 'Albert Flores',
            avatar: 'AF',
            avatarColor: '#e1f5fe'
        },
        {
            id: 3,
            type: 'HVAC',
            location: '721 Meadowview',
            issue: 'Non Functional Fan',
            assignee: 'Robert Fox',
            avatar: 'RF',
            avatarColor: '#f3e5f5'
        }
    ];

    const getTypeIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'plumbing':
                return { icon: 'bi-droplet-fill', color: '#3b82f6' };
            case 'electrical':
                return { icon: 'bi-lightning-fill', color: '#eab308' };
            case 'hvac':
                return { icon: 'bi-wind', color: '#8b5cf6' };
            default:
                return { icon: 'bi-tools', color: '#6b7280' };
        }
    };

    return (
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0" style={{ fontSize: '16px' }}>Maintenance Requests</h6>
                    <button className="btn btn-link p-0 text-primary" style={{ fontSize: '13px', textDecoration: 'none' }}>
                        See All
                    </button>
                </div>

                <div className="d-flex flex-column gap-3">
                    {requests.map((request) => {
                        const typeStyle = getTypeIcon(request.type);
                        return (
                            <div key={request.id} className="d-flex align-items-center gap-3">
                                <div 
                                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: `${typeStyle.color}20`,
                                        color: typeStyle.color
                                    }}
                                >
                                    <i className={`bi ${typeStyle.icon}`} style={{ fontSize: '20px' }}></i>
                                </div>
                                <div className="flex-grow-1 min-w-0">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <span className="fw-medium" style={{ fontSize: '14px', color: '#1a1a1a' }}>
                                            {request.type}
                                        </span>
                                        <span className="text-muted" style={{ fontSize: '13px' }}>
                                            | {request.location}
                                        </span>
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '12px' }}>
                                        {request.issue}
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                    <div 
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: request.avatarColor,
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            color: '#1a1a1a'
                                        }}
                                    >
                                        {request.avatar}
                                    </div>
                                    <span className="text-muted d-none d-md-inline" style={{ fontSize: '12px' }}>
                                        {request.assignee}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MaintenanceRequests;
