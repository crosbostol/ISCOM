import React, { createContext, useContext, useMemo, useState } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import type { } from '@mui/x-data-grid/themeAugmentation';
import { esES } from '@mui/x-data-grid/locales';

// Contexto para manejar el toggle
const ColorModeContext = createContext({ toggleColorMode: () => { } });

export const useColorMode = () => useContext(ColorModeContext);

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<'light' | 'dark'>('dark');

    const colorMode = useMemo(() => ({
        toggleColorMode: () => {
            setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
        },
    }), []);

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    // PALETA LIGHT (Tu diseño actual)
                    primary: { main: '#009688' },
                    background: { default: '#E0F2F1', paper: '#FFFFFF' },
                    text: { primary: '#0D4A73', secondary: '#546E7A' },
                }
                : {
                    // PALETA DARK (Deep Ocean)
                    primary: { main: '#4DB6AC' }, // Teal más brillante
                    background: { default: '#0B1929', paper: '#132F4C' }, // Fondos azulados oscuros
                    text: { primary: '#E3F2FD', secondary: '#B0BEC5' },
                    divider: 'rgba(194, 224, 255, 0.08)',
                }),
        },
        components: {
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'light' ? '#263238' : '#001E3C',
                        color: 'white',
                    }
                }
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
                        backgroundImage: 'none',
                    }
                }
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? 'inherit' : 'rgba(255, 255, 255, 0.03)',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: mode === 'light' ? '#009688' : '#4DB6AC',
                        },
                    },
                    input: {
                        color: mode === 'light' ? 'inherit' : '#ffffff',
                        '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
                            WebkitBoxShadow: mode === 'light' ? '0 0 0 100px #fff inset !important' : '0 0 0 100px #132F4C inset !important',
                            WebkitTextFillColor: mode === 'light' ? 'inherit !important' : '#fff !important',
                            caretColor: mode === 'light' ? 'inherit' : '#fff',
                            borderRadius: 'inherit',
                        }
                    }
                }
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        color: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : '#94a3b8',
                        '&.Mui-focused': {
                            color: mode === 'light' ? '#009688' : '#4DB6AC',
                        }
                    }
                }
            },
            MuiSelect: {
                styleOverrides: {
                    icon: {
                        color: mode === 'light' ? 'rgba(0, 0, 0, 0.54)' : '#ffffff',
                    }
                }
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        '&.Mui-selected': {
                            backgroundColor: mode === 'light' ? 'rgba(0, 150, 136, 0.08)' : 'rgba(77, 182, 172, 0.16)',
                            '&:hover': {
                                backgroundColor: mode === 'light' ? 'rgba(0, 150, 136, 0.12)' : 'rgba(77, 182, 172, 0.24)',
                            }
                        }
                    }
                }
            },
            MuiTabs: {
                styleOverrides: {
                    indicator: {
                        backgroundColor: mode === 'light' ? '#009688' : '#4DB6AC',
                    }
                }
            },
            MuiTab: {
                styleOverrides: {
                    root: {
                        color: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : '#94a3b8',
                        '&.Mui-selected': {
                            color: mode === 'light' ? '#009688' : '#4DB6AC',
                        }
                    }
                }
            },
            MuiStepIcon: {
                styleOverrides: {
                    root: {
                        color: mode === 'light' ? '#9e9e9e' : 'rgba(255, 255, 255, 0.3)',
                        '&.Mui-active': {
                            color: mode === 'light' ? '#009688' : '#4DB6AC',
                        },
                        '&.Mui-completed': {
                            color: mode === 'light' ? '#009688' : '#4DB6AC',
                        },
                    },
                    text: {
                        fill: '#fff',
                    }
                }
            },
            MuiStepLabel: {
                styleOverrides: {
                    label: {
                        color: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : '#94a3b8',
                        '&.Mui-active': {
                            color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
                        },
                        '&.Mui-completed': {
                            color: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
                        },
                    }
                }
            },
            MuiDataGrid: {
                styleOverrides: {
                    root: {
                        border: 'none',
                        // Darken borders in Light Mode
                        '& .MuiDataGrid-cell': {
                            borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.25)' : undefined,
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.25)' : undefined,
                        },
                        '& .MuiDataGrid-columnHeader': {
                            borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.25)' : undefined,
                        },
                    },
                    columnHeaders: {
                        backgroundColor: mode === 'light' ? 'rgba(0, 150, 136, 0.08)' : 'rgba(77, 182, 172, 0.15)',
                        color: mode === 'light' ? '#0D4A73' : '#E3F2FD',
                        borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.25)' : undefined,
                    },
                    footerContainer: {
                        borderTop: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(194, 224, 255, 0.08)'}`,
                    }
                }
            }
        }
    }, esES), [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline /> {/* Normaliza estilos y aplica el background default */}
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};
