import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    ToggleButtonGroup,
    ToggleButton,
    Autocomplete,
    Box,
    Typography,
    IconButton,
    useMediaQuery,
    useTheme,
    Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import { usePostPayrollTransaction } from '../../../api/generated/hooks/usePostPayrollTransaction';
import { useGetPayroll } from '../../../api/generated/hooks/useGetPayroll';
import { useQueryClient } from '@tanstack/react-query';
import { TRANSACTION_TYPES } from '../../../constants/payroll';

interface TransactionFormData {
    employee_id: number;
    amount: number;
    description: string;
}

interface TransactionModalProps {
    open: boolean;
    onClose: () => void;
}

type TransactionType = 'BONUS' | 'ADVANCE' | 'ABSENCE';

export const TransactionModal: React.FC<TransactionModalProps> = ({ open, onClose }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const queryClient = useQueryClient();

    const [transactionType, setTransactionType] = useState<TransactionType>('BONUS');
    const { data: employees } = useGetPayroll();
    const mutation = usePostPayrollTransaction();

    const { control, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormData>({
        defaultValues: {
            employee_id: 0,
            amount: 0,
            description: ''
        }
    });

    const handleClose = () => {
        reset();
        setTransactionType('BONUS');
        onClose();
    };

    const onSubmit = async (data: TransactionFormData) => {
        // Convert amount based on transaction type
        const signedAmount = transactionType === 'BONUS'
            ? Math.abs(data.amount)
            : -Math.abs(data.amount);

        mutation.mutate(
            {
                data: {
                    employee_id: data.employee_id,
                    type: transactionType,
                    amount: signedAmount,
                    date: new Date().toISOString().split('T')[0],
                    description: data.description || undefined
                }
            },
            {
                onSuccess: () => {
                    // Invalidate payroll queries to refresh data
                    queryClient.invalidateQueries({ queryKey: ['useGetPayroll'] });
                    handleClose();
                }
            }
        );
    };

    const typeLabels: Record<TransactionType, { label: string; description: string }> = {
        BONUS: {
            label: TRANSACTION_TYPES.BONUS,
            description: 'Crédito a favor del empleado'
        },
        ADVANCE: {
            label: TRANSACTION_TYPES.ADVANCE,
            description: 'Débito - adelanto de sueldo'
        },
        ABSENCE: {
            label: TRANSACTION_TYPES.ABSENCE,
            description: 'Débito - ausencia o descuento'
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullScreen={isMobile}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    Nueva Transacción
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    {mutation.isError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Error al registrar transacción
                        </Alert>
                    )}

                    {/* Transaction Type Selector */}
                    <Box mb={3}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            Tipo de Transacción
                        </Typography>
                        <ToggleButtonGroup
                            value={transactionType}
                            exclusive
                            onChange={(_, value) => value && setTransactionType(value)}
                            fullWidth
                            sx={{
                                '& .MuiToggleButton-root': {
                                    py: 2,
                                    fontSize: '1rem'
                                }
                            }}
                        >
                            <ToggleButton value="BONUS" color="success">
                                {typeLabels.BONUS.label}
                            </ToggleButton>
                            <ToggleButton value="ADVANCE" color="warning">
                                {typeLabels.ADVANCE.label}
                            </ToggleButton>
                            <ToggleButton value="ABSENCE" color="error">
                                {typeLabels.ABSENCE.label}
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                            {typeLabels[transactionType].description}
                        </Typography>
                    </Box>

                    {/* Employee Selector */}
                    <Controller
                        name="employee_id"
                        control={control}
                        rules={{ required: 'Debe seleccionar un empleado', min: 1 }}
                        render={({ field }) => (
                            <Autocomplete
                                options={employees ?? []}
                                getOptionLabel={(option) => `${option.employee_name} (${option.employee_rut})`}
                                onChange={(_, value) => field.onChange(value?.personnel_id ?? 0)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Empleado"
                                        error={!!errors.employee_id}
                                        helperText={errors.employee_id?.message}
                                        required
                                    />
                                )}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />

                    {/* Amount Input */}
                    <Controller
                        name="amount"
                        control={control}
                        rules={{
                            required: 'Debe ingresar un monto',
                            min: { value: 1, message: 'El monto debe ser mayor a 0' }
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Monto"
                                type="number"
                                fullWidth
                                error={!!errors.amount}
                                helperText={errors.amount?.message}
                                required
                                InputProps={{
                                    startAdornment: <Typography mr={1}>$</Typography>,
                                    sx: { fontSize: '1.25rem' }
                                }}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />

                    {/* Description */}
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Descripción (opcional)"
                                multiline
                                rows={2}
                                fullWidth
                                placeholder="Ej: Bono por desempeño, Anticipo quincena, etc."
                            />
                        )}
                    />
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleClose} disabled={mutation.isPending}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Registrando...' : 'Registrar Transacción'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
