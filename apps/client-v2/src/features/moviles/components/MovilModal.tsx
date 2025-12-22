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
    Fade,
    useTheme
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Generated Types & Schemas
import type { MovilDTO } from '../../../api/generated/models/MovilDTO';
import type { Conductor } from '../../../api/generated/models/Conductor';
import { movilSchema, type MovilFormData, MOVIL_TYPES, MOVIL_STATES } from '../schemas/movilSchema';

// Icons
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CategoryIcon from '@mui/icons-material/Category';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';

// Animación
const glow = (color: string) => keyframes`
  0% { box-shadow: 0 -4px 10px -2px ${alpha(color, 0.3)}; }
  50% { box-shadow: 0 -4px 20px -2px ${alpha(color, 0.6)}; }
  100% { box-shadow: 0 -4px 10px -2px ${alpha(color, 0.3)}; }
`;

interface MovilModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: MovilFormData) => void;
    initialData: MovilDTO | null;
    isLoading: boolean;
    error: Error | null;
    conductorsList: Conductor[];
}

export const MovilModal: React.FC<MovilModalProps> = ({ open, onClose, onSubmit, initialData, isLoading, error, conductorsList }) => {
    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;

    const { control, handleSubmit, reset } = useForm<MovilFormData>({
        resolver: zodResolver(movilSchema) as any,
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
            reset({
                movil_id: initialData?.movil_id ?? '',
                external_code: initialData?.external_code ?? '',
                movil_type: (initialData?.movil_type as any) ?? 'OBRA CIVIL', // Cast needed if DTO type is plain string vs Enum type
                movil_state: (initialData?.movil_state as any) ?? 'OPERATIVO',
                conductor_id: initialData?.conductor_id ?? null
            });
        }
    }, [open, initialData, reset]);

    const handleFormSubmit = (data: MovilFormData) => {
        onSubmit(data);
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
                        {initialData ? 'EDITAR MÓVIL' : 'NUEVO MÓVIL'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: primaryColor, fontWeight: 'bold' }}>
                        FLOTA DE VEHÍCULOS
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
                            ID: {initialData.movil_id}
                        </Typography>
                    </Box>
                )}
            </Box>

            <form onSubmit={handleSubmit(handleFormSubmit)}>
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
                                        disabled={!!initialData} // PK no editable
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocalShippingIcon sx={{ color: primaryColor }} />
                                                </InputAdornment>
                                            ),
                                            sx: { fontFamily: 'monospace', textTransform: 'uppercase' }
                                        }}
                                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
                                        value={field.value ?? ''}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <QrCodeIcon sx={{ color: primaryColor }} />
                                                </InputAdornment>
                                            ),
                                        }}
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
                                                    <CategoryIcon sx={{ color: primaryColor }} />
                                                </InputAdornment>
                                            ),
                                        }}
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
                                                    <HealthAndSafetyIcon sx={{ color: primaryColor }} />
                                                </InputAdornment>
                                            ),
                                        }}
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
                                    value={field.value ?? ''}
                                    onChange={(e) => {
                                        // Pass the value as is, preprocess in schema handles the logic
                                        // or pass specific value. Schema expects string/number/null.
                                        field.onChange(e.target.value);
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon sx={{ color: primaryColor }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>Sin Conductor</em>
                                    </MenuItem>
                                    {conductorsList.map((conductor) => (
                                        <MenuItem key={conductor.id} value={conductor.id}>
                                            {conductor.name} ({conductor.rut})
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        {error && (
                            <Typography variant="caption" sx={{ color: theme.palette.error.main, textAlign: 'center' }}>
                                {(() => {
                                    const err = error as any;
                                    const data = err?.response?.data;
                                    if (data?.error) {
                                        return typeof data.error === 'object' ? (data.error.message || JSON.stringify(data.error)) : data.error;
                                    }
                                    return err.message || 'Error al guardar';
                                })()}
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
