import React, { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    MenuItem,
    InputAdornment,
    alpha,
    keyframes,
    Fade
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Movil } from '../../../hooks/useMoviles';
import { useConductors } from '../../../hooks/useConductors';

// Iconos
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CategoryIcon from '@mui/icons-material/Category';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';

// Animación para el borde superior
const glow = keyframes`
  0% { box-shadow: 0 -4px 10px -2px rgba(77, 182, 172, 0.3); }
  50% { box-shadow: 0 -4px 20px -2px rgba(77, 182, 172, 0.6); }
  100% { box-shadow: 0 -4px 10px -2px rgba(77, 182, 172, 0.3); }
`;

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
            reset(initialData ? {
                movil_id: initialData.movil_id,
                external_code: initialData.external_code || '',
                movil_type: initialData.movil_type,
                movil_state: initialData.movil_state,
                conductor_id: initialData.conductor_id
            } : {
                movil_id: '',
                external_code: '',
                movil_type: 'OBRA CIVIL',
                movil_state: 'OPERATIVO',
                conductor_id: null
            });
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
                    bgcolor: '#132F4C', // Deep Ocean
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
                        {initialData ? 'EDITAR MÓVIL' : 'NUEVO MÓVIL'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: primaryTeal, fontWeight: 'bold' }}>
                        FLOTA DE VEHÍCULOS
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
                            ID: {initialData.movil_id}
                        </Typography>
                    </Box>
                )}
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {/* Patente */}
                            <Controller
                                name="movil_id"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Patente (ID)"
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocalShippingIcon sx={{ color: primaryTeal }} />
                                                </InputAdornment>
                                            ),
                                            sx: { fontFamily: 'monospace', textTransform: 'uppercase' }
                                        }}
                                        sx={inputStyles}
                                    />
                                )}
                            />

                            {/* Código Externo */}
                            <Controller
                                name="external_code"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Cod. Externo"
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <QrCodeIcon sx={{ color: primaryTeal }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={inputStyles}
                                    />
                                )}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {/* Tipo */}
                            <Controller
                                name="movil_type"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Tipo de Vehículo"
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
                                    >
                                        {MOVIL_TYPES.map(option => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />

                            {/* Estado */}
                            <Controller
                                name="movil_state"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Estado Operativo"
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <HealthAndSafetyIcon sx={{ color: primaryTeal }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={inputStyles}
                                    >
                                        {MOVIL_STATES.map(option => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Box>

                        {/* Conductor Asignado */}
                        <Controller
                            name="conductor_id"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Conductor Asignado"
                                    fullWidth
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message || "Seleccione 'Sin Conductor' para desasignar"}
                                    value={field.value === null ? '' : field.value}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        field.onChange(val === '' ? null : Number(val));
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon sx={{ color: primaryTeal }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={inputStyles}
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
                            <Typography variant="caption" sx={{ color: '#ff5252', textAlign: 'center' }}>
                                {(error as any)?.response?.data?.error || error.message || 'Error al guardar'}
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

// Estilos comunes
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
    '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.5)' },
};
