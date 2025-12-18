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
import { cleanRut, formatRut, validateRut } from '../../../utils/rutValidation';
import type { Conductor } from '../../../hooks/useConductors';

// Iconos
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import SaveIcon from '@mui/icons-material/Save';

// Animación para el borde superior
const glow = keyframes`
  0% { box-shadow: 0 -4px 10px -2px rgba(77, 182, 172, 0.3); }
  50% { box-shadow: 0 -4px 20px -2px rgba(77, 182, 172, 0.6); }
  100% { box-shadow: 0 -4px 10px -2px rgba(77, 182, 172, 0.3); }
`;

const conductorSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    rut: z.string()
        .min(1, 'El RUT es obligatorio')
        .transform((val) => {
            const cleaned = cleanRut(val);
            return formatRut(cleaned).replace(/\./g, ''); // Guardar como XXXXXXXX-Y
        })
        .refine((val) => validateRut(val), { message: "RUT inválido" }),
});

type ConductorFormData = z.infer<typeof conductorSchema>;

interface ConductorModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ConductorFormData) => void;
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
    } = useForm<ConductorFormData>({
        resolver: zodResolver(conductorSchema),
        defaultValues: {
            name: '',
            rut: '',
        },
    });

    useEffect(() => {
        if (open) {
            reset(initialData ? {
                name: initialData.name,
                rut: formatRut(initialData.rut),
            } : { name: '', rut: '' });
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
                        {initialData ? 'EDITAR CONDUCTOR' : 'NUEVO CONDUCTOR'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: primaryTeal, fontWeight: 'bold' }}>
                        GESTIÓN DE PERSONAL
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
                            ID: #{initialData.id}
                        </Typography>
                    </Box>
                )}
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        {/* Campo Nombre */}
                        <Controller
                            name="name"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Nombre Completo"
                                    fullWidth
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon sx={{ color: primaryTeal }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={inputStyles}
                                />
                            )}
                        />

                        {/* Campo RUT */}
                        <Controller
                            name="rut"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="RUT"
                                    fullWidth
                                    placeholder="12.345.678-9"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    inputProps={{ maxLength: 12 }}
                                    onChange={(e) => {
                                        field.onChange(formatRut(e.target.value));
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <BadgeIcon sx={{ color: primaryTeal }} />
                                            </InputAdornment>
                                        ),
                                        sx: { fontFamily: 'monospace' }
                                    }}
                                    sx={inputStyles}
                                />
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
};
