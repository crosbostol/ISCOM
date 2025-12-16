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
    CircularProgress
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

// --- 1. DEFINICIÓN DE ANIMACIONES Y ESTILOS ---
const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

// Colores del tema (Ajustados a tu paleta Dark Mode / Teal)
const primaryColor = '#009688';
const deepBg = '#0B1929';
const cardBg = '#132F4C';

export const LoginPage: React.FC = () => {
    // --- 2. TU LÓGICA ORIGINAL (INTACTA) ---
    const { login } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(username, password);
            navigate('/');
        } catch (err: any) {
            // Mantenemos tu manejo de errores
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    // --- 3. EL NUEVO DISEÑO VISUAL (RENDER) ---
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                // Fondo Gradiente Profundo
                background: `radial-gradient(circle at 50% 50%, #1a4064 0%, ${deepBg} 100%)`,
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
                        color: 'white',
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
                            {/* Puedes reemplazar esto por <img src="/logo.png" /> */}
                            <WaterDropIcon sx={{ fontSize: 30 }} />
                        </Box>
                        <Typography variant="h5" fontWeight="bold" sx={{ letterSpacing: 2 }}>
                            ISCOM
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 1 }}>
                            GESTIÓN DE OBRAS
                        </Typography>
                    </Box>

                    {/* MANEJO DE ERRORES (Mantenido de tu código original, estilizado) */}
                    {error && (
                        <Alert
                            severity="error"
                            variant="filled" // Para que resalte sobre el fondo oscuro
                            sx={{ width: '100%', mb: 2, bgcolor: alpha('#d32f2f', 0.8) }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* FORMULARIO CONECTADO A TU LÓGICA */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Usuario"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            // Conexión con tus estados
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            // Estilos Dark/Modern
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonOutlineIcon sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    color: 'white',
                                    borderRadius: 2,
                                    bgcolor: alpha('#000', 0.2),
                                    '& fieldset': { borderColor: alpha('#fff', 0.2) },
                                    '&:hover fieldset': { borderColor: alpha('#fff', 0.5) },
                                    '&.Mui-focused fieldset': { borderColor: primaryColor }
                                }
                            }}
                            InputLabelProps={{ sx: { color: 'text.secondary' } }}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Contraseña"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            // Conexión con tus estados
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            // Estilos Dark/Modern
                            variant="outlined"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                            sx={{ color: 'text.secondary' }}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: {
                                    color: 'white',
                                    borderRadius: 2,
                                    bgcolor: alpha('#000', 0.2),
                                    '& fieldset': { borderColor: alpha('#fff', 0.2) },
                                    '&:hover fieldset': { borderColor: alpha('#fff', 0.5) },
                                    '&.Mui-focused fieldset': { borderColor: primaryColor }
                                }
                            }}
                            InputLabelProps={{ sx: { color: 'text.secondary' } }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
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
                                    bgcolor: '#00796B',
                                    boxShadow: `0 0 30px ${alpha(primaryColor, 0.6)}`,
                                },
                                '&:disabled': {
                                    bgcolor: alpha(primaryColor, 0.3),
                                    color: alpha('#fff', 0.3)
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'INGRESAR'}
                        </Button>
                    </Box>
                </Paper>
            </Box>

            {/* FOOTER TEXT */}
            <Typography variant="caption" sx={{ position: 'absolute', bottom: 20, color: 'text.secondary', opacity: 0.5 }}>
                © 2025 ISCOM Ingeniería y Construcción
            </Typography>
        </Box>
    );
};