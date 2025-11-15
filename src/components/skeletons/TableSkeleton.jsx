import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * TableSkeleton - Skeleton loader for table views
 * @param {number} rows - Number of skeleton rows to display (default: 5)
 * @param {number} columns - Number of columns in the table (default: 5)
 * @param {boolean} showHeader - Whether to show header skeleton (default: true)
 */
const TableSkeleton = ({ rows = 5, columns = 5, showHeader = true }) => {
    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                {showHeader && (
                    <thead className="table-light">
                        <tr>
                            {Array.from({ length: columns }).map((_, index) => (
                                <th key={index}>
                                    <Skeleton height={20} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <td key={colIndex}>
                                    <Skeleton height={20} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableSkeleton;
