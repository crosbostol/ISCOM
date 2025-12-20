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
import { formatRut } from '../../../utils/rutValidation';

// Generated Types & Schemas
import type { Conductor } from '../../../api/generated/models/Conductor';
import { conductorSchema, type ConductorFormData } from '../schemas/conductorSchema';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import SaveIcon from '@mui/icons-material/Save';

// Animation
const glow = keyframes`
  0% { box-shadow: 0 -4px 10px -2px rgba(77, 182, 172, 0.3); }
  50% { box-shadow: 0 -4px 20px -2px rgba(77, 182, 172, 0.6); }
  100% { box-shadow: 0 -4px 10px -2px rgba(77, 182, 172, 0.3); }
`;

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
    const theme = useTheme();
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

    const primaryColor = theme.palette.primary.main;
    const paperColor = theme.palette.background.paper;

    // Helper for error message
    const getErrorMessage = (err: any) => {
        return err?.response?.data?.error || err?.message || 'Error al guardar';
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
                    bgcolor: paperColor,
                    backgroundImage: 'none',
                    borderRadius: 3,
                    border: `1px solid ${alpha(primaryColor, 0.2)}`,
                    animation: `${glow} 3s infinite ease-in-out`,
                    overflow: 'hidden'
                }
            }}
        >
            {/* Styled Header */}
            <Box sx={{
                p: 3,
                pb: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box>
                    <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 'bold', letterSpacing: 1 }}>
                        {initialData ? 'EDITAR CONDUCTOR' : 'NUEVO CONDUCTOR'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: primaryColor, fontWeight: 'bold' }}>
                        GESTIÓN DE PERSONAL
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
                            ID: #{initialData.id}
                        </Typography>
                    </Box>
                )}
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                        {/* Name Field */}
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
                                                <PersonIcon sx={{ color: primaryColor }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: alpha(theme.palette.background.default, 0.5),
                                            '&:hover fieldset': { borderColor: alpha(primaryColor, 0.5) },
                                            '&.Mui-focused fieldset': { borderColor: primaryColor },
                                        }
                                    }}
                                />
                            )}
                        />

                        {/* RUT Field */}
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
                                                <BadgeIcon sx={{ color: primaryColor }} />
                                            </InputAdornment>
                                        ),
                                        sx: { fontFamily: 'monospace' }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: alpha(theme.palette.background.default, 0.5),
                                            '&:hover fieldset': { borderColor: alpha(primaryColor, 0.5) },
                                            '&.Mui-focused fieldset': { borderColor: primaryColor },
                                        }
                                    }}
                                />
                            )}
                        />

                        {error && (
                            <Typography variant="caption" sx={{ color: theme.palette.error.main, textAlign: 'center' }}>
                                {getErrorMessage(error)}
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
                        {isLoading ? 'Sincronizando...' : 'CONFIRMAR'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
