import React, { useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Stack,
    MenuItem,
    Typography,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useGetPayrollBankInfoPersonnelid } from '../../../api/generated/hooks/useGetPayrollBankInfoPersonnelid';
import { usePostPayrollBankInfo } from '../../../api/generated/hooks/usePostPayrollBankInfo';
import { usePutPayrollBankInfoPersonnelid } from '../../../api/generated/hooks/usePutPayrollBankInfoPersonnelid';
import { useQueryClient } from '@tanstack/react-query';
import { CHILEAN_BANKS, ACCOUNT_TYPES } from '../../../constants/payroll';

interface BankInfoFormData {
    bank_name: string;
    account_type: 'CUENTA_CORRIENTE' | 'CUENTA_VISTA' | 'CUENTA_RUT';
    account_number: string;
    rut: string;
    email?: string;
}

interface BankInfoFormProps {
    personnelId: number;
    personnelRut: string; // For validation
}

export const BankInfoForm: React.FC<BankInfoFormProps> = ({ personnelId, personnelRut }) => {
    const queryClient = useQueryClient();

    const { data: existingInfo, isLoading } = useGetPayrollBankInfoPersonnelid(personnelId);
    const createMutation = usePostPayrollBankInfo();
    const updateMutation = usePutPayrollBankInfoPersonnelid();

    const isEditMode = !!existingInfo;
    const mutation = isEditMode ? updateMutation : createMutation;

    const { control, handleSubmit, reset, formState: { errors } } = useForm<BankInfoFormData>({
        defaultValues: {
            bank_name: '',
            account_type: 'CUENTA_CORRIENTE',
            account_number: '',
            rut: personnelRut,
            email: ''
        }
    });

    // Populate form with existing data
    useEffect(() => {
        if (existingInfo) {
            reset({
                bank_name: existingInfo.bank_name,
                account_type: existingInfo.account_type as any,
                account_number: existingInfo.account_number,
                rut: existingInfo.rut,
                email: existingInfo.email || ''
            });
        }
    }, [existingInfo, reset]);

    const onSubmit = async (data: BankInfoFormData) => {
        if (isEditMode) {
            updateMutation.mutate(
                { personnelId, data },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['useGetPayrollBankInfoPersonnelid'] });
                    }
                }
            );
        } else {
            createMutation.mutate(
                {
                    data: {
                        ...data,
                        personnel_id: personnelId
                    }
                },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['useGetPayrollBankInfoPersonnelid'] });
                    }
                }
            );
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Información Bancaria
            </Typography>

            {mutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error al guardar información bancaria
                </Alert>
            )}

            {mutation.isSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Información bancaria guardada exitosamente
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                    {/* Bank Name and Account Type */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Controller
                            name="bank_name"
                            control={control}
                            rules={{ required: 'Debe seleccionar un banco' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Banco"
                                    fullWidth
                                    error={!!errors.bank_name}
                                    helperText={errors.bank_name?.message}
                                    required
                                >
                                    {CHILEAN_BANKS.map((bank) => (
                                        <MenuItem key={bank} value={bank}>
                                            {bank}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                        <Controller
                            name="account_type"
                            control={control}
                            rules={{ required: 'Debe seleccionar un tipo de cuenta' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Tipo de Cuenta"
                                    fullWidth
                                    error={!!errors.account_type}
                                    helperText={errors.account_type?.message}
                                    required
                                >
                                    {ACCOUNT_TYPES.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Stack>

                    {/* Account Number and RUT */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Controller
                            name="account_number"
                            control={control}
                            rules={{
                                required: 'Debe ingresar un número de cuenta',
                                pattern: {
                                    value: /^[0-9]+$/,
                                    message: 'Solo números, sin guiones ni espacios'
                                }
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Número de Cuenta"
                                    fullWidth
                                    error={!!errors.account_number}
                                    helperText={errors.account_number?.message || 'Sin guiones ni espacios'}
                                    required
                                />
                            )}
                        />
                        <Controller
                            name="rut"
                            control={control}
                            rules={{
                                required: 'El RUT es obligatorio',
                                validate: (value) =>
                                    value === personnelRut || 'El RUT debe coincidir con el del empleado'
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="RUT del Titular"
                                    fullWidth
                                    error={!!errors.rut}
                                    helperText={errors.rut?.message || `Debe ser: ${personnelRut}`}
                                    required
                                    disabled={isEditMode} // Cannot change RUT
                                />
                            )}
                        />
                    </Stack>

                    {/* Email (optional) */}
                    <Controller
                        name="email"
                        control={control}
                        rules={{
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Email inválido'
                            }
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Email (opcional)"
                                type="email"
                                fullWidth
                                error={!!errors.email}
                                helperText={errors.email?.message || 'Para notificaciones bancarias'}
                            />
                        )}
                    />

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={mutation.isPending}
                        fullWidth
                    >
                        {mutation.isPending
                            ? 'Guardando...'
                            : isEditMode
                                ? 'Actualizar Información Bancaria'
                                : 'Guardar Información Bancaria'}
                    </Button>
                </Stack>
            </form>
        </Paper>
    );
};
