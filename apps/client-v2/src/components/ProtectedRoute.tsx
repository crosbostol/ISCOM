import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { DashboardLayout } from './DashboardLayout';

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <CircularProgress color="primary" size={48} />
                    <Typography variant="caption" color="text.secondary">
                        Verificando Credenciales...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <DashboardLayout>
            <Outlet />
        </DashboardLayout>
    );
};
