import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Conductor, CreateConductorDTO } from '../../../hooks/useConductors';

const conductorSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    rut: z.string().min(1, 'El RUT es obligatorio'),
});

interface ConductorModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateConductorDTO) => void;
    initialData?: Conductor | null;
    isLoading?: boolean;
    error?: Error | null;
}

export const ConductorModal: React.FC<ConductorModalProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    isLoading,
    error,
}) => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CreateConductorDTO>({
        resolver: zodResolver(conductorSchema),
        defaultValues: {
            name: '',
            rut: '',
        },
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    rut: initialData.rut,
                });
            } else {
                reset({
                    name: '',
                    rut: '',
                });
            }
        }
    }, [open, initialData, reset]);

    const handleFormSubmit = (data: CreateConductorDTO) => {
        onSubmit(data);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {initialData ? 'Editar Conductor' : 'Nuevo Conductor'}
            </DialogTitle>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {/* @ts-ignore - handling specific error structure */}
                            {error.response?.data?.error || error.message || 'Error al guardar'}
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Nombre"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                />
                            )}
                        />
                        <Controller
                            name="rut"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="RUT"
                                    fullWidth
                                    error={!!errors.rut}
                                    helperText={errors.rut?.message}
                                />
                            )}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
