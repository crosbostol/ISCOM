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
    Fade,
    useTheme
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Generated Types & Schemas
import type { ItemDTO } from '../../../api/generated/models/ItemDTO';
import { itemSchema, type ItemFormData } from '../schemas/itemSchema';

// Icons
import DescriptionIcon from '@mui/icons-material/Description';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import SaveIcon from '@mui/icons-material/Save';

// Animación
const glow = (color: string) => keyframes`
  0% { box-shadow: 0 -4px 10px -2px ${alpha(color, 0.3)}; }
  50% { box-shadow: 0 -4px 20px -2px ${alpha(color, 0.6)}; }
  100% { box-shadow: 0 -4px 10px -2px ${alpha(color, 0.3)}; }
`;

interface ItemModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ItemFormData) => void;
    initialData: ItemDTO | null;
    isLoading: boolean;
    error: Error | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({ open, onClose, onSubmit, initialData, isLoading, error }) => {
    const theme = useTheme();
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

    const primaryColor = theme.palette.primary.main;

    const inputInputProps = {
        sx: { fontFamily: 'monospace', fontWeight: 'bold' }
    };

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
                    bgcolor: theme.palette.background.paper,
                    backgroundImage: 'none',
                    borderRadius: 3,
                    border: `1px solid ${alpha(primaryColor, 0.2)}`,
                    animation: `${glow(primaryColor)} 3s infinite ease-in-out`,
                    overflow: 'hidden'
                }
            }}
        >
            {/* Header */}
            <Box sx={{
                p: 3,
                pb: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box>
                    <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 'bold', letterSpacing: 1 }}>
                        {initialData ? 'EDITAR ITEM' : 'NUEVO REGISTRO'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: primaryColor, fontWeight: 'bold' }}>
                        CATÁLOGO DE SERVICIOS ISCOM
                    </Typography>
                </Box>
                {initialData && (
                    <Box sx={{
                        bgcolor: alpha(primaryColor, 0.1),
                        px: 1.5, py: 0.5,
                        borderRadius: 1,
                        border: `1px solid ${primaryColor}`
                    }}>
                        <Typography variant="caption" sx={{ color: primaryColor, fontSize: '0.75rem', fontFamily: 'monospace' }}>
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
                                                <DescriptionIcon sx={{ color: primaryColor, mb: 4 }} />
                                            </InputAdornment>
                                        ),
                                    }}
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
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                        value={field.value !== undefined ? new Intl.NumberFormat('es-CL').format(field.value) : ''}
                                        onChange={(e) => {
                                            const rawValue = e.target.value.replace(/\./g, '').replace(/,/g, '');
                                            if (rawValue === '') {
                                                field.onChange(0);
                                                return;
                                            }
                                            const numberVal = parseInt(rawValue, 10);
                                            if (!isNaN(numberVal)) {
                                                field.onChange(numberVal);
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AttachMoneyIcon sx={{ color: primaryColor }} />
                                                </InputAdornment>
                                            ),
                                            ...inputInputProps
                                        }}
                                        inputProps={{
                                            inputMode: 'numeric',
                                            autoComplete: 'off'
                                        }}
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
                                                    <CategoryIcon sx={{ color: primaryColor }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        </Box>

                        {error && (
                            <Typography variant="caption" sx={{ color: theme.palette.error.main, textAlign: 'center' }}>
                                {(error as any)?.response?.data?.error || error.message || 'Error en el servidor'}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button
                        onClick={onClose}
                        sx={{ color: theme.palette.text.secondary, textTransform: 'none' }}
                    >
                        Descartar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                        startIcon={!isLoading && <SaveIcon />}
                        sx={{
                            bgcolor: primaryColor,
                            fontWeight: 'bold',
                            px: 4,
                            '&:hover': { bgcolor: alpha(primaryColor, 0.8) },
                            '&.Mui-disabled': { bgcolor: alpha(primaryColor, 0.3) }
                        }}
                    >
                        {isLoading ? 'Guardando...' : 'CONFIRMAR'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
