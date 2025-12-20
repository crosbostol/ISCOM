import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    InputAdornment,
    IconButton,
    Alert,
    keyframes,
    alpha,
    CircularProgress,
    useTheme
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    PersonOutline as PersonOutlineIcon,
    LockOutlined as LockOutlinedIcon,
    WaterDrop as WaterDropIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// --- 1. DEFINICIÓN DE SCHEMA ---
const loginSchema = z.object({
    username: z.string().min(1, 'Usuario requerido'),
    password: z.string().min(1, 'Contraseña requerida')
});

type LoginFormData = z.infer<typeof loginSchema>;

// --- 2. DEFINICIÓN DE ANIMACIONES ---
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

export const LoginPage: React.FC = () => {
    const theme = useTheme();
    const { login } = useAuth();
    const navigate = useNavigate();

    // Colores dinámicos del tema
    const primaryColor = theme.palette.primary.main;
    const deepBg = theme.palette.background.default;
    const cardBg = theme.palette.background.paper;

    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const { control, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: ''
        }
    });

    const onSubmit = async (data: LoginFormData) => {
        setLoginError(null);
        try {
            await login(data.username, data.password);
            navigate('/');
        } catch (err: any) {
            setLoginError(err.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                // Fondo Gradiente Profundo usando colores del tema
                background: `radial-gradient(circle at 50% 50%, ${alpha(deepBg, 0.8)} 0%, ${deepBg} 100%)`,
                bgcolor: deepBg // Fallback
            }}
        >
            {/* ELEMENTOS DECORATIVOS DE FONDO (Burbujas Flotantes) */}
            <Box sx={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(primaryColor, 0.1)} 0%, transparent 70%)`,
                animation: `${float} 10s ease-in-out infinite`,
                zIndex: 0,
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: '-5%',
                right: '-5%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(primaryColor, 0.05)} 0%, transparent 70%)`,
                animation: `${float} 15s ease-in-out infinite reverse`,
                zIndex: 0,
            }} />

            {/* --- WRAPPER CON BORDE ANIMADO "LIQUID" --- */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '400px', // Ancho máximo controlado
                    m: 2, // Margen para móviles
                    zIndex: 1,
                    borderRadius: '16px',
                    // Efecto de tubería de luz giratoria
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: `conic-gradient(transparent, transparent, transparent, ${primaryColor})`,
                        animation: `${rotate} 4s linear infinite`,
                        zIndex: -1,
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: '3px',
                        background: cardBg,
                        borderRadius: '14px',
                        zIndex: -1,
                    },
                    boxShadow: `0 0 50px ${alpha(primaryColor, 0.2)}`,
                    p: '3px',
                    overflow: 'hidden'
                }}
            >
                {/* TARJETA DEL FORMULARIO */}
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: cardBg,
                        p: { xs: 3, md: 5 }, // Padding responsivo
                        borderRadius: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        color: theme.palette.text.primary,
                    }}
                >
                    {/* LOGO E IDENTIDAD */}
                    <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{
                            width: 60,
                            height: 60,
                            bgcolor: alpha(primaryColor, 0.1),
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 2,
                            color: primaryColor
                        }}>
                            <WaterDropIcon sx={{ fontSize: 30 }} />
                        </Box>
                        <Typography variant="h5" fontWeight="bold" sx={{ letterSpacing: 2 }}>
                            ISCOM
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, letterSpacing: 1 }}>
                            GESTIÓN DE OBRAS
                        </Typography>
                    </Box>

                    {/* MANEJO DE ERRORES */}
                    {loginError && (
                        <Alert
                            severity="error"
                            variant="filled"
                            sx={{ width: '100%', mb: 2, bgcolor: theme.palette.error.main }}
                        >
                            {loginError}
                        </Alert>
                    )}

                    {/* FORMULARIO */}
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
                        <Controller
                            name="username"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    margin="normal"
                                    fullWidth
                                    id="username"
                                    label="Usuario"
                                    autoComplete="username"
                                    autoFocus
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonOutlineIcon sx={{ color: theme.palette.text.secondary }} />
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            color: theme.palette.text.primary,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.text.primary, 0.05),
                                            '& fieldset': { borderColor: alpha(theme.palette.text.primary, 0.2) },
                                            '&:hover fieldset': { borderColor: alpha(theme.palette.text.primary, 0.5) },
                                            '&.Mui-focused fieldset': { borderColor: primaryColor }
                                        }
                                    }}
                                    InputLabelProps={{ sx: { color: theme.palette.text.secondary } }}
                                />
                            )}
                        />

                        <Controller
                            name="password"
                            control={control}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    margin="normal"
                                    fullWidth
                                    label="Contraseña"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    autoComplete="current-password"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlinedIcon sx={{ color: theme.palette.text.secondary }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                    sx={{ color: theme.palette.text.secondary }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            color: theme.palette.text.primary,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.text.primary, 0.05),
                                            '& fieldset': { borderColor: alpha(theme.palette.text.primary, 0.2) },
                                            '&:hover fieldset': { borderColor: alpha(theme.palette.text.primary, 0.5) },
                                            '&.Mui-focused fieldset': { borderColor: primaryColor }
                                        }
                                    }}
                                    InputLabelProps={{ sx: { color: theme.palette.text.secondary } }}
                                />
                            )}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isSubmitting}
                            sx={{
                                mt: 4,
                                mb: 2,
                                height: 50,
                                borderRadius: 2,
                                bgcolor: primaryColor,
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: `0 0 20px ${alpha(primaryColor, 0.4)}`,
                                '&:hover': {
                                    bgcolor: alpha(primaryColor, 0.9), // Use Theme logic for hover state
                                    boxShadow: `0 0 30px ${alpha(primaryColor, 0.6)}`,
                                },
                                '&:disabled': {
                                    bgcolor: alpha(primaryColor, 0.3),
                                    color: alpha(theme.palette.text.primary, 0.3)
                                }
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'INGRESAR'}
                        </Button>
                    </Box>
                </Paper>
            </Box>

            {/* FOOTER TEXT */}
            <Typography variant="caption" sx={{ position: 'absolute', bottom: 20, color: theme.palette.text.secondary, opacity: 0.5 }}>
                © 2025 ISCOM Ingeniería y Construcción
            </Typography>
        </Box>
    );
};