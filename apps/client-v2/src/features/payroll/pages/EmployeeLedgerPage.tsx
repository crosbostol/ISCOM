import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Chip,
    Button,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Stack
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetPayrollPersonnelidLedger } from '../../../api/generated/hooks/useGetPayrollPersonnelidLedger';
import { useGetPayroll } from '../../../api/generated/hooks/useGetPayroll';
import { usePostPayrollExportSantanderTransfer } from '../../../api/generated/hooks/usePostPayrollExportSantanderTransfer';
import { BankInfoForm } from '../components/BankInfoForm';
import { TRANSACTION_TYPES } from '../../../constants/payroll';

export const EmployeeLedgerPage: React.FC = () => {
    const { personnelId } = useParams<{ personnelId: string }>();
    const navigate = useNavigate();
    const [exportError, setExportError] = useState<string | null>(null);

    // Fetch employee data from payroll list
    const { data: payrollList, isLoading: isLoadingPayroll } = useGetPayroll();
    const { data: ledger, isLoading: isLoadingLedger } = useGetPayrollPersonnelidLedger(Number(personnelId));
    const exportMutation = usePostPayrollExportSantanderTransfer();

    // Find current employee from payroll list
    const employee = useMemo(() => {
        if (!payrollList || !personnelId) return null;
        return payrollList.find(emp => emp.personnel_id === Number(personnelId));
    }, [payrollList, personnelId]);

    const handleExport = async () => {
        setExportError(null);
        exportMutation.mutate(
            undefined,
            {
                onSuccess: (data) => {
                    // Create blob and download
                    const blob = new Blob([data as unknown as BlobPart], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `nomina_${new Date().toISOString().split('T')[0]}.xlsx`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                },
                onError: () => {
                    setExportError('Error al exportar la nómina. Verifique que haya empleados elegibles.');
                }
            }
        );
    };

    if (!personnelId) {
        return (
            <Typography color="error">
                ID de empleado no válido
            </Typography>
        );
    }

    if (isLoadingPayroll || isLoadingLedger) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!employee) {
        return (
            <Box>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/payroll')} sx={{ mb: 2 }}>
                    Volver
                </Button>
                <Alert severity="error">
                    No se encontró el empleado con ID {personnelId}
                </Alert>
            </Box>
        );
    }

    // Calculate current balance from transactions
    const currentBalance = ledger?.reduce((sum, tx) => sum + (tx.amount ?? 0), 0) ?? 0;

    return (
        <Box>
            {/* Header with Back Button */}
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/payroll')} sx={{ mb: 2 }}>
                Volver
            </Button>

            {/* Employee Header Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        justifyContent="space-between"
                    >
                        <Box flex={1}>
                            <Typography variant="h4" gutterBottom fontWeight="bold">
                                {employee.employee_name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                RUT: {employee.employee_rut} • Cargo: {employee.employee_role}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                                Sueldo Base: ${employee.base_salary?.toLocaleString('es-CL')}
                            </Typography>
                        </Box>
                        <Box textAlign={{ xs: 'left', md: 'right' }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Saldo Actual
                            </Typography>
                            <Typography
                                variant="h3"
                                fontWeight="bold"
                                color={currentBalance > 0 ? 'success.main' : currentBalance < 0 ? 'error.main' : 'text.secondary'}
                            >
                                ${currentBalance.toLocaleString('es-CL')}
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Export Button */}
            <Box mb={3}>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    disabled={exportMutation.isPending}
                >
                    {exportMutation.isPending ? 'Exportando...' : 'Exportar Nómina Santander'}
                </Button>
                {exportError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {exportError}
                    </Alert>
                )}
                {exportMutation.isSuccess && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Nómina exportada exitosamente
                    </Alert>
                )}
            </Box>

            {/* Transaction History */}
            <Paper sx={{ mb: 3 }}>
                <Box p={2}>
                    <Typography variant="h6" gutterBottom>
                        Historial de Movimientos
                    </Typography>
                </Box>
                <Divider />
                {!ledger || ledger.length === 0 ? (
                    <Box p={3}>
                        <Typography color="text.secondary" textAlign="center">
                            No hay transacciones registradas
                        </Typography>
                    </Box>
                ) : (
                    <List>
                        {ledger.map((transaction) => {
                            const isCredit = (transaction.amount ?? 0) > 0;
                            const transactionType = transaction.transaction_type as keyof typeof TRANSACTION_TYPES;
                            const typeLabel = TRANSACTION_TYPES[transactionType] || transaction.transaction_type;

                            return (
                                <React.Fragment key={transaction.id}>
                                    <ListItem>
                                        <ListItemText
                                            primary={transaction.description || typeLabel}
                                            secondary={
                                                <>
                                                    {transaction.transaction_date
                                                        ? new Date(transaction.transaction_date).toLocaleDateString('es-CL')
                                                        : 'Sin fecha'
                                                    }
                                                    {transaction.created_by_username && ` • ${transaction.created_by_username}`}
                                                </>
                                            }
                                        />
                                        <Chip
                                            label={`${isCredit ? '+' : ''}$${Math.abs(transaction.amount ?? 0).toLocaleString('es-CL')}`}
                                            color={isCredit ? 'success' : 'error'}
                                            variant="outlined"
                                        />
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </Paper>

            {/* Banking Info (Collapsible) */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Información Bancaria</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <BankInfoForm
                        personnelId={Number(personnelId)}
                        personnelRut={employee.employee_rut ?? ''}
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};
