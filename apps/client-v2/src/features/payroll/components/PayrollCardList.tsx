import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    Fab,
    CircularProgress,
    alpha,
    useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useGetPayroll } from '../../../api/generated/hooks/useGetPayroll';
import { TransactionModal } from './TransactionModal';

export const PayrollCardList: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { data, isLoading } = useGetPayroll();
    const [openModal, setOpenModal] = useState(false);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 10 }}> {/* Padding bottom to prevent FAB overlap */}
            <Stack spacing={2}>
                {data?.map((employee) => {
                    const balance = employee.current_balance ?? 0;
                    const isPositive = balance > 0;

                    return (
                        <Card
                            key={employee.id}
                            onClick={() => navigate(`/payroll/${employee.personnel_id}`)}
                            sx={{
                                cursor: 'pointer',
                                transition: theme.transitions.create(['transform', 'box-shadow']),
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 3
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                                }
                            }}
                        >
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Box flex={1}>
                                        <Typography variant="h6" gutterBottom>
                                            {employee.employee_name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {employee.employee_rut} • {employee.employee_role}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                                            Sueldo Base: ${employee.base_salary?.toLocaleString('es-CL')}
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label={`$${balance.toLocaleString('es-CL')}`}
                                        color={isPositive ? 'success' : 'error'}
                                        sx={{
                                            fontWeight: 'bold',
                                            fontSize: '1rem',
                                            minWidth: '110px'
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>

            {/* Floating Action Button */}
            <Fab
                color="primary"
                onClick={() => setOpenModal(true)}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000
                }}
                aria-label="Agregar transacción"
            >
                <AddIcon />
            </Fab>

            <TransactionModal open={openModal} onClose={() => setOpenModal(false)} />
        </Box>
    );
};
