import React from 'react';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, IconButton, useTheme } from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import BuildIcon from '@mui/icons-material/Build';
import AssessmentIcon from '@mui/icons-material/Assessment';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useColorMode } from '../theme/AppTheme';

const DRAWER_WIDTH = 260;

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const theme = useTheme();
    const colorMode = useColorMode();

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>

            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        // El color ya se maneja en el ThemeProvider, pero podemos forzar overrides aqui si queremos
                        borderRight: '1px solid',
                        borderColor: 'divider'
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

                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        <ListItemButton
                            selected
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
                    </List>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
                {children}
            </Box>
        </Box>
    );
};
