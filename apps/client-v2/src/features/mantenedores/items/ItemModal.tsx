import React, { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    InputAdornment,
    alpha,
    keyframes,
    Fade
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Item } from '../../../hooks/useItems';

// Iconos para el "look" técnico
import DescriptionIcon from '@mui/icons-material/Description';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import SaveIcon from '@mui/icons-material/Save';

// Animación para el borde superior
const glow = keyframes`
  0% { box-shadow: 0 -4px 10px -2px rgba(77, 182, 172, 0.3); }
  50% { box-shadow: 0 -4px 20px -2px rgba(77, 182, 172, 0.6); }
  100% { box-shadow: 0 -4px 10px -2px rgba(77, 182, 172, 0.3); }
`;

const itemSchema = z.object({
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
        defaultValues: { description: '', item_value: 0, item_type: '' }
    });

    useEffect(() => {
        if (open) {
            reset(initialData ? {
                description: initialData.description,
                item_value: initialData.item_value,
                item_type: initialData.item_type || ''
            } : { description: '', item_value: 0, item_type: '' });
        }
    }, [open, initialData, reset]);

    const primaryTeal = '#4DB6AC';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Fade}
            transitionDuration={400}
            PaperProps={{
                sx: {
                    bgcolor: '#132F4C', // Deep Ocean de tu paleta
                    backgroundImage: 'none',
                    borderRadius: 3,
                    border: `1px solid ${alpha(primaryTeal, 0.2)}`,
                    animation: `${glow} 3s infinite ease-in-out`,
                    overflow: 'hidden'
                }
            }}
        >
            {/* Header Estilizado */}
            <Box sx={{
                p: 3,
                pb: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', letterSpacing: 1 }}>
                        {initialData ? 'EDITAR ITEM' : 'NUEVO REGISTRO'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: primaryTeal, fontWeight: 'bold' }}>
                        CATÁLOGO DE SERVICIOS ISCOM
                    </Typography>
                </Box>
                {initialData && (
                    <Box sx={{
                        bgcolor: alpha(primaryTeal, 0.1),
                        px: 1.5, py: 0.5,
                        borderRadius: 1,
                        border: `1px solid ${primaryTeal}`
                    }}>
                        <Typography variant="caption" sx={{ color: primaryTeal, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                            ID: #{initialData.item_id}
                        </Typography>
                    </Box>
                )}
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        {/* Campo Descripción */}
                        <Controller
                            name="description"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Descripción del Servicio"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    placeholder="Ej: REPARACIÓN DE ARRANQUE AGUA POTABLE..."
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <DescriptionIcon sx={{ color: primaryTeal, mb: 4 }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={inputStyles}
                                />
                            )}
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {/* Campo Valor */}
                            <Controller
                                name="item_value"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Valor Unitario"
                                        type="number"
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AttachMoneyIcon sx={{ color: primaryTeal }} />
                                                </InputAdornment>
                                            ),
                                            sx: { fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.1rem' }
                                        }}
                                        sx={inputStyles}
                                    />
                                )}
                            />

                            {/* Campo Tipo */}
                            <Controller
                                name="item_type"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Categoría"
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CategoryIcon sx={{ color: primaryTeal }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={inputStyles}
                                    />
                                )}
                            />
                        </Box>

                        {error && (
                            <Typography variant="caption" sx={{ color: '#ff5252', textAlign: 'center' }}>
                                {(error as any)?.response?.data?.error || error.message || 'Error en el enlace'}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={onClose}
                        sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}
                    >
                        Descartar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        startIcon={!isLoading && <SaveIcon />}
                        sx={{
                            bgcolor: primaryTeal,
                            fontWeight: 'bold',
                            px: 4,
                            '&:hover': { bgcolor: alpha(primaryTeal, 0.8) },
                            '&.Mui-disabled': { bgcolor: alpha(primaryTeal, 0.3) }
                        }}
                    >
                        {isLoading ? 'Sincronizando...' : 'CONFIRMAR'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

// Estilos comunes para los inputs "HUD"
const inputStyles = {
    '& .MuiOutlinedInput-root': {
        color: 'white',
        bgcolor: 'rgba(0,0,0,0.2)',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
        '&:hover fieldset': { borderColor: 'rgba(77, 182, 172, 0.5)' },
        '&.Mui-focused fieldset': { borderColor: '#4DB6AC' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#4DB6AC' },
};
