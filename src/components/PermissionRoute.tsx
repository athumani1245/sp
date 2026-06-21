import React from 'react';
import { Result, Button } from 'antd';
import { useAuth } from '../context/AuthContext';

interface PermissionRouteProps {
  children: React.ReactNode;
  permission: string;
}

/**
 * Wraps a route and renders a 403 page if the user lacks the required permission.
 * Must be rendered inside AuthProvider.
 */
const PermissionRoute: React.FC<PermissionRouteProps> = ({ children, permission }) => {
  const { hasPermission, loading } = useAuth();

  if (loading) return null;

  if (!hasPermission(permission)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You don't have permission to access this page."
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
};

export default PermissionRoute;
