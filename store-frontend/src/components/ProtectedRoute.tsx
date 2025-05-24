import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import UserService, { UserRole } from '../services/UserService';

interface ProtectedRouteProps {
  requiredRoles?: UserRole | UserRole[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requiredRoles, 
  redirectPath = '/login'
}) => {
  const currentUser = UserService.getCurrentUser();
  const isAuthenticated = !!currentUser;

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} />;
  }

  // If roles are required, check if user has the required role
  if (requiredRoles) {
    const hasRequiredRole = UserService.hasRole(requiredRoles);
    
    if (!hasRequiredRole) {
      // If user doesn't have required role, redirect to a 'forbidden' page or home
      return <Navigate to="/forbidden" />;
    }
  }

  // If authenticated and has required role (or no role required), render the protected route
  return <Outlet />;
};

export default ProtectedRoute; 