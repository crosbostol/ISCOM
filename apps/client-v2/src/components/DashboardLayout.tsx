import React, { useState } from 'react';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, IconButton, useTheme, ButtonBase, alpha, Collapse } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import WorkIcon from '@mui/icons-material/Work';
import BuildIcon from '@mui/icons-material/Build';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '../theme/AppTheme';

import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CategoryIcon from '@mui/icons-material/Category';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BadgeIcon from '@mui/icons-material/Badge';

const DRAWER_WIDTH = 260;

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const theme = useTheme();
    const colorMode = useColorMode();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [openMantenedores, setOpenMantenedores] = useState(false);

    const handleClickMantenedores = () => setOpenMantenedores(!openMantenedores);

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>

            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',           // Flex Layout for sticky footer
                        flexDirection: 'column'    // Vertical stacking
                    },
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between', py: 2, px: 2 }}>
                    <Typography variant="h6" fontWeight="bold" color="inherit">
                        Sistema OT
                    </Typography>
                    {/* Botón Toggle Dark Mode en el Sidebar */}
                    <IconButton onClick={colorMode.toggleColorMode} color="inherit">
                        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>
                </Toolbar>

                <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                    <List>
                        <ListItemButton
                            selected={location.pathname === '/ots' || location.pathname === '/'}
                            onClick={() => navigate('/ots')}
                            sx={{
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(0, 150, 136, 0.15)',
                                    color: theme.palette.mode === 'dark' ? '#4DB6AC' : '#009688',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 150, 136, 0.25)',
                                    },
                                    borderLeft: `4px solid ${theme.palette.mode === 'dark' ? '#4DB6AC' : '#009688'}`
                                },
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.05)'
                                },
                                py: 1.5
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                <WorkIcon />
                            </ListItemIcon>
                            <ListItemText primary="Órdenes de Trabajo" primaryTypographyProps={{ fontWeight: 'medium' }} />
                        </ListItemButton>

                        {/* Items inactivos */}
                        {['Recursos', 'Reportes'].map((text, index) => (
                            <ListItemButton key={text} sx={{ py: 1.5, color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}>
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                    {index === 0 ? <BuildIcon /> : <AssessmentIcon />}
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        ))}

                        {/* PADRE: MANTENEDORES */}
                        <ListItemButton
                            onClick={handleClickMantenedores}
                            sx={{
                                py: 1.5,
                                color: 'text.secondary',
                                '&:hover': { color: 'text.primary', bgcolor: 'action.hover' }
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                <AdminPanelSettingsIcon />
                            </ListItemIcon>
                            <ListItemText primary="Mantenedores" />
                            {openMantenedores ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>

                        {/* HIJOS: LISTA COLAPSABLE */}
                        <Collapse in={openMantenedores} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>

                                {/* ÍTEMS */}
                                <ListItemButton sx={{ pl: 4, py: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/mantenedores/items')}>
                                    <ListItemIcon sx={{ color: 'inherit', minWidth: 35 }}>
                                        <CategoryIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Ítems" primaryTypographyProps={{ fontSize: '0.9rem' }} />
                                </ListItemButton>

                                {/* CONDUCTORES */}
                                <ListItemButton sx={{ pl: 4, py: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/mantenedores/conductores')}>
                                    <ListItemIcon sx={{ color: 'inherit', minWidth: 35 }}>
                                        <BadgeIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Conductores" primaryTypographyProps={{ fontSize: '0.9rem' }} />
                                </ListItemButton>

                                {/* MÓVILES */}
                                <ListItemButton sx={{ pl: 4, py: 1, color: 'text.secondary', '&:hover': { color: 'primary.main' } }} onClick={() => navigate('/mantenedores/moviles')}>
                                    <ListItemIcon sx={{ color: 'inherit', minWidth: 35 }}>
                                        <LocalShippingIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary="Móviles" primaryTypographyProps={{ fontSize: '0.9rem' }} />
                                </ListItemButton>

                            </List>
                        </Collapse>
                    </List>
                </Box>

                {/* Footer: Logout */}
                <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', mt: 'auto' }}>
                    <ButtonBase
                        onClick={logout}
                        sx={{
                            // --- ESTADO INICIAL (Círculo) ---
                            position: 'relative',
                            height: 48,
                            width: 48, // Empieza como círculo
                            borderRadius: '24px', // Radio alto para círculo perfecto

                            // Colores sutiles según tu paleta (se adapta a dark/light)
                            color: 'text.secondary',
                            bgcolor: 'transparent',

                            // Alineación para que el icono quede centrado en el círculo inicial
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start', // Importante para que se expanda a la derecha
                            paddingLeft: '12px', // (48px ancho total - 24px icono) / 2 = 12px para centrar

                            overflow: 'hidden', // Oculta el texto mientras está colapsado
                            whiteSpace: 'nowrap', // Evita que el texto salte de línea durante la animación

                            // --- TRANSICIONES SUAVES ---
                            transition: (theme) => theme.transitions.create(
                                ['width', 'background-color', 'color', 'border-radius', 'box-shadow'],
                                { duration: theme.transitions.duration.standard }
                            ),

                            // --- ESTADO HOVER (Expansión a Pastilla Roja) ---
                            '&:hover': {
                                width: '100%', // Se expande para llenar el contenedor
                                borderRadius: 2, // Pasa de círculo a forma de botón redondeado

                                // Aplicación de la paleta de error (Rojo)
                                color: 'error.main',
                                bgcolor: (theme) => alpha(theme.palette.error.main, 0.1), // Fondo rojo translúcido
                                boxShadow: 1,

                                // Hacemos visible el texto
                                '& .logout-text-label': {
                                    opacity: 1,
                                    transform: 'translateX(0px)',
                                }
                            }
                        }}
                    >
                        <LogoutIcon sx={{ fontSize: '24px' }} />

                        {/* El texto que aparece animado */}
                        <Box
                            component="span"
                            className="logout-text-label"
                            sx={{
                                ml: 2, // Separación del icono
                                opacity: 0, // Invisible al inicio
                                transform: 'translateX(-10px)', // Pequeño efecto de deslizamiento
                                transition: (theme) => theme.transitions.create(
                                    ['opacity', 'transform'],
                                    { duration: theme.transitions.duration.standard, delay: '100ms' }
                                )
                            }}
                        >
                            <Typography variant="button" fontWeight="bold">
                                Cerrar Sesión
                            </Typography>
                        </Box>
                    </ButtonBase>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{
                flexGrow: 1,
                p: 3,
                width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
                height: '100vh', // Force fixed height to viewport
                overflow: 'hidden', // Prevent page scroll, force internal scroll
                display: 'flex', // Enable flex children (the page content)
                flexDirection: 'column'
            }}>
                {children}
            </Box>
        </Box>
    );
};
