import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AccessDeniedPage } from './AccessDeniedPage';

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

/**
 * Component to protect routes based on user role.
 * 
 * Usage:
 * <RoleProtectedRoute allowedRoles={['MANAGER']}>
 *   <PayrollDashboard />
 * </RoleProtectedRoute>
 * 
 * If user doesn't have the required role, shows AccessDeniedPage instead.
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    // If not authenticated, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has one of the allowed roles
    const hasRequiredRole = allowedRoles.includes(user.role);

    if (!hasRequiredRole) {
        return <AccessDeniedPage />;
    }

    return <>{children}</>;
};
