import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Movil } from '../../../hooks/useMoviles';
import { useConductors } from '../../../hooks/useConductors';

const movilSchema = z.object({
    movil_id: z.string().min(1, 'La Patente es obligatoria'),
    external_code: z.string().optional(),
    movil_type: z.string().min(1, 'El tipo es obligatorio'),
    movil_state: z.string().min(1, 'El estado es obligatorio'),
    conductor_id: z.number().nullable().optional()
});

type MovilFormData = z.infer<typeof movilSchema>;

interface MovilModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: MovilFormData) => void;
    initialData: Movil | null;
    isLoading: boolean;
    error: Error | null;
}

const MOVIL_TYPES = ['OBRA CIVIL', 'HIDRAULICO', 'RETIRO'];
const MOVIL_STATES = ['OPERATIVO', 'EN MANTENCION', 'FUERA DE SERVICIO'];

export const MovilModal: React.FC<MovilModalProps> = ({ open, onClose, onSubmit, initialData, isLoading, error }) => {
    const { data: conductors = [] } = useConductors();

    const { control, handleSubmit, reset } = useForm<MovilFormData>({
        resolver: zodResolver(movilSchema),
        defaultValues: {
            movil_id: '',
            external_code: '',
            movil_type: 'OBRA CIVIL',
            movil_state: 'OPERATIVO',
            conductor_id: null
        }
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    movil_id: initialData.movil_id,
                    external_code: initialData.external_code || '',
                    movil_type: initialData.movil_type,
                    movil_state: initialData.movil_state,
                    conductor_id: initialData.conductor_id
                });
            } else {
                reset({
                    movil_id: '',
                    external_code: '',
                    movil_type: 'OBRA CIVIL',
                    movil_state: 'OPERATIVO',
                    conductor_id: null
                });
            }
        }
    }, [open, initialData, reset]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? 'Editar Móvil' : 'Nuevo Móvil'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Controller
                            name="movil_id"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Patente (ID)"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="external_code"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Código Externo (Opcional)"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="movil_type"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Tipo"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    fullWidth
                                >
                                    {MOVIL_TYPES.map(option => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                        <Controller
                            name="movil_state"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Estado"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    fullWidth
                                >
                                    {MOVIL_STATES.map(option => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        {/* Conductor Selector */}
                        <Controller
                            name="conductor_id"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Conductor Asignado"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message || "Seleccione 'Sin Conductor' para desasignar"}
                                    fullWidth
                                    value={field.value === null ? '' : field.value} // Handle null for MUI Select
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Convert empty string back to null
                                        field.onChange(val === '' ? null : Number(val));
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Sin Conductor</em>
                                    </MenuItem>
                                    {conductors.map((conductor) => (
                                        <MenuItem key={conductor.id} value={conductor.id}>
                                            {conductor.name} ({conductor.rut})
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        {error && (
                            <Box color="error.main" sx={{ mt: 1 }}>
                                {(error as any)?.response?.data?.error || error.message || 'Error al guardar'}
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
