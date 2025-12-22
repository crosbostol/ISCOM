import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BlockIcon from '@mui/icons-material/Block';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const AccessDeniedPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 500,
                    textAlign: 'center'
                }}
            >
                <BlockIcon
                    sx={{
                        fontSize: 80,
                        color: 'error.main',
                        mb: 2
                    }}
                />

                <Typography variant="h4" gutterBottom fontWeight="bold">
                    Acceso Denegado
                </Typography>

                <Typography variant="body1" color="text.secondary" paragraph>
                    No tienes permisos para acceder a esta sección.
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                    Si crees que deberías tener acceso, contacta al administrador del sistema.
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                >
                    Volver al Inicio
                </Button>
            </Paper>
        </Box>
    );
};
