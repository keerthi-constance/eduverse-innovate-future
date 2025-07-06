import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spin, Result } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'donor';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle={`This page is only accessible to ${requiredRole}s.`}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 
 
 