import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Item } from '../../../hooks/useItems';

const itemSchema = z.object({
    // item_id removed from schema (auto-generated or handled via props)
    description: z.string().min(1, 'La descripción es obligatoria'),
    item_value: z.number().min(0, 'El valor debe ser mayor o igual a 0'),
    item_type: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ItemFormData) => void;
    initialData: Item | null;
    isLoading: boolean;
    error: Error | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({ open, onClose, onSubmit, initialData, isLoading, error }) => {
    const { control, handleSubmit, reset } = useForm<ItemFormData>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            description: '',
            item_value: 0,
            item_type: ''
        }
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                reset({
                    description: initialData.description,
                    item_value: initialData.item_value,
                    item_type: initialData.item_type || ''
                });
            } else {
                reset({
                    description: '',
                    item_value: 0,
                    item_type: ''
                });
            }
        }
    }, [open, initialData, reset]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{initialData ? `Editar Item #${initialData.item_id}` : 'Nuevo Item (Auto-ID)'}</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {/* ID Field Removed for Create, displayed in Title for Edit */}
                        <Controller
                            name="description"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Descripción"
                                    multiline
                                    rows={2}
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    fullWidth
                                />
                            )}
                        />
                        <Controller
                            name="item_value"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Valor Unitario (Neto)"
                                    type="number"
                                    inputProps={{ step: "any" }}
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    fullWidth
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            )}
                        />
                        <Controller
                            name="item_type"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Tipo (Opcional)"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    fullWidth
                                />
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
