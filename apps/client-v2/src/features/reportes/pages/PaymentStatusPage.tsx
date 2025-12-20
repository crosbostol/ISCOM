import React, { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Box,
    Typography,
    Paper,
    Button,
    Stack,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    Tooltip,
    alpha,
    keyframes
} from '@mui/material';
import SummarizeIcon from '@mui/icons-material/Summarize';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { esES } from '@mui/x-data-grid/locales';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { api } from '../../../api/axios';

import { useGetOttable } from '../../../api/generated/hooks/useGetOttable';
import type { GetOttable200 } from '../../../api/generated/models/GetOttable';

dayjs.extend(isBetween);

type OT = GetOttable200[number];

export const PaymentStatusPage: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // 1. aura animation
    const pulseGlow = keyframes`
        0% { box-shadow: 0 0 5px rgba(77, 182, 172, 0.2); border-color: rgba(77, 182, 172, 0.3); }
        50% { box-shadow: 0 0 20px rgba(77, 182, 172, 0.4); border-color: rgba(77, 182, 172, 0.6); }
        100% { box-shadow: 0 0 5px rgba(77, 182, 172, 0.2); border-color: rgba(77, 182, 172, 0.3); }
    `;
    // -- State --
    const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf('month'));
    const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [generating, setGenerating] = useState(false);

    // -- Query Client for Cleanup --
    const queryClient = useQueryClient();

    // Clear cache on unmount to ensure table is empty when returning
    useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: ['/ottable'] });
        };
    }, [queryClient]);

    // -- Data Fetching --
    const params = useMemo(() => ({
        startDate: startDate?.format('YYYY-MM-DD'),
        endDate: endDate?.format('YYYY-MM-DD'),
        dateField: 'finished_at' as const
    }), [startDate, endDate]);

    const { data: ots, isLoading, refetch } = useGetOttable(params, {
        query: {
            enabled: false,
            // Include params in queryKey to differentiate cache
            queryKey: ['/ottable', params]
        }
    });

    // -- Filtering Logic --
    const filteredOts = useMemo(() => {
        if (!ots) return [];
        return ots;
        // Note: Server-side filtering is now responsible for the date range.
        // We trust the backend returned the correct data.
    }, [ots]);

    // -- Summary Calculation --
    const summary = useMemo(() => {
        const count = filteredOts.length;
        const totalNet = filteredOts.reduce((acc, ot) => acc + (Number((ot as any).total_value) || 0), 0);

        return { count, totalNet };
    }, [filteredOts]);

    // -- Handlers --
    const handleGenerateClick = () => {
        setConfirmationOpen(true);
    };

    const handleSearch = () => {
        refetch();
    };

    const handleConfirmGenerate = async () => {
        setGenerating(true);
        try {
            const start = startDate?.format('YYYY-MM-DD');
            const end = endDate?.format('YYYY-MM-DD');

            const response = await api.get('/reports/edp-export', {
                params: { startDate: start, endDate: end },
                responseType: 'blob'
            });

            // Trigger Download
            const now = dayjs();
            const filename = `EDP_${now.year()}_${now.format('MM')}_ISCOM.xlsx`;

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading report:', error);
            // Optionally set error state or show alert
        } finally {
            setGenerating(false);
            setConfirmationOpen(false);
        }
    };

    // -- Columns --
    const columns: GridColDef[] = [
        { field: 'external_ot_id', headerName: 'Folio', width: 120 },
        {
            field: 'started_at',
            headerName: 'Fecha Inicio',
            width: 130,
            valueFormatter: (value: string) => value ? dayjs(value).format('DD-MM-YYYY') : '-'
        },
        {
            field: 'address',
            headerName: 'Dirección',
            flex: 1,
            minWidth: 200,
            valueGetter: (_value, row: OT) => `${row.street || ''} ${row.number_street || ''}`.trim()
        },
        { field: 'commune', headerName: 'Comuna', width: 150 },
        {
            field: 'subtotal',
            headerName: 'Subtotal',
            width: 140,
            type: 'number',
            valueGetter: (_value, row: OT) => Number((row as any).total_value) || 0,
            valueFormatter: (value: number) =>
                new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value)
        }
    ];

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            // Deep Ocean logic for Dark Mode, standard grayish for Light Mode
            bgcolor: isDark ? '#0B1929' : 'background.default',
            p: 3
        }}>
            {/* Header */}
            <Box mb={3}>
                <Typography variant="h5" fontWeight="bold" color={isDark ? 'white' : 'text.primary'}>
                    Generar Estado de Pago
                </Typography>
                <Typography variant="caption" color={isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary'}>
                    Seleccione un rango de fechas para visualizar las OTs y generar el documento consolidado.
                </Typography>
            </Box>

            {/* Criteria Panel (HUD) */}
            <Paper sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                // HUD Style in Dark Mode
                bgcolor: isDark ? '#132F4C' : 'background.paper',
                border: isDark ? '1px solid rgba(0, 150, 136, 0.3)' : '1px solid #e0e0e0',
                boxShadow: isDark ? '0 0 15px rgba(0, 0, 0, 0.3)' : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap'
            }}>
                <Stack direction="row" spacing={2} alignItems="center" flexGrow={1}>
                    <FilterListIcon color={isDark ? "primary" : "action"} />
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                        <DatePicker
                            label="Desde (Término)"
                            value={startDate}
                            onChange={setStartDate}
                            format="DD-MM-YYYY"
                            slotProps={{ textField: { size: 'small', sx: { minWidth: 180 } } }}
                        />
                        <Typography color="text.secondary">-</Typography>
                        <DatePicker
                            label="Hasta (Término)"
                            value={endDate}
                            onChange={setEndDate}
                            format="DD-MM-YYYY"
                            slotProps={{ textField: { size: 'small', sx: { minWidth: 180 } } }}
                        />
                    </LocalizationProvider>
                </Stack>

                <Button
                    variant="outlined"
                    startIcon={<ManageSearchIcon />}
                    onClick={handleSearch}
                    sx={{
                        height: 40,
                        px: 3,
                        fontWeight: 'bold',
                        textTransform: 'none', // Mantiene la legibilidad
                        // Mantenemos el color Teal tanto en Light como en Dark para identidad de marca
                        color: 'primary.main',
                        borderColor: isDark ? alpha(theme.palette.primary.main, 0.5) : 'primary.main',

                        transition: 'all 0.2s ease-in-out',

                        '&:hover': {
                            // REGLA DE ORO: No cambiamos a blanco, usamos tinte Teal al 8%
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            // Añade un resplandor muy sutil en Dark Mode
                            boxShadow: isDark ? `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
                        }
                    }}
                >
                    Cargar OTs
                </Button>
            </Paper>

            {/* Preview Table */}
            <Paper sx={{
                flexGrow: 1,
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: isDark ? '#132F4C' : 'background.paper',
                boxShadow: isDark ? '0 4px 6px rgba(0,0,0,0.3)' : 1,
            }}>
                <DataGrid
                    rows={filteredOts}
                    columns={columns}
                    getRowId={(row) => row.id || Math.random()}
                    loading={isLoading}
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    disableRowSelectionOnClick
                    density="comfortable"
                    sx={{
                        border: 'none',
                        color: isDark ? 'rgba(255,255,255,0.9)' : 'text.primary',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 150, 136, 0.08)',
                            color: isDark ? '#4DB6AC' : 'text.primary',
                            fontWeight: 'bold'
                        },
                        '& .MuiDataGrid-footerContainer': {
                            bgcolor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                        }
                    }}
                    slots={{
                        footer: () => (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Total OTs: <b>{summary.count}</b>
                                </Typography>
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                    Total: {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(summary.totalNet)}
                                </Typography>

                                {/* Footer Action Button */}
                                <Tooltip title="Confirmar y exportar el listado actual">
                                    <span>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />}
                                            onClick={handleGenerateClick}
                                            // La lógica de deshabilitado se mantiene
                                            disabled={filteredOts.length === 0 || generating}
                                            sx={{
                                                ml: 2,
                                                minWidth: 180,
                                                height: 48, // Un poco más alto que el de cargar para marcar jerarquía
                                                fontWeight: 'bold',
                                                textTransform: 'none',
                                                borderRadius: 2,

                                                // Color base Teal
                                                bgcolor: 'primary.main',
                                                color: isDark ? '#0B1929' : 'white', // Texto oscuro en fondo brillante para Dark Mode

                                                transition: 'all 0.3s ease',

                                                '&:hover': {
                                                    // Un tono un poco más oscuro y saturado
                                                    bgcolor: '#00796B',
                                                    // Efecto de resplandor (Glow) más potente por ser el botón principal
                                                    boxShadow: (theme) => `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                    transform: 'translateY(-1px)', // Pequeño levantamiento visual
                                                },

                                                // Estilo cuando está deshabilitado (Cero filas o cargando)
                                                '&.Mui-disabled': {
                                                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.12)',
                                                    color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.26)',
                                                    borderColor: 'transparent',
                                                    boxShadow: 'none',
                                                }
                                            }}
                                        >
                                            {generating ? 'Generando...' : 'Generar .XLSX'}
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Box>
                        )
                    }}
                />
            </Paper>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmationOpen}
                onClose={() => !generating && setConfirmationOpen(false)}
                PaperProps={{
                    sx: {
                        bgcolor: '#132F4C',
                        backgroundImage: 'none',
                        borderRadius: 3,
                        border: '1px solid',
                        animation: `${pulseGlow} 3s infinite ease-in-out`,
                        minWidth: 400
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SummarizeIcon sx={{ color: '#4DB6AC' }} />
                    <Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', lineHeight: 1.2 }}>
                            Confirmar Generación
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#4DB6AC', fontWeight: 'bold', letterSpacing: 1 }}>
                            PROTOCOL_FINANCE_v1.0
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                        Se procederá a consolidar las OTs terminadas en el periodo seleccionado para la emisión del Estado de Pago.
                    </Typography>

                    {/* Info Card Estilizada */}
                    <Box sx={{
                        p: 2.5,
                        bgcolor: 'rgba(0,0,0,0.2)',
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': { // Decoración técnica lateral
                            content: '""',
                            position: 'absolute',
                            left: 0, top: 0, bottom: 0,
                            width: '4px',
                            bgcolor: '#4DB6AC'
                        }
                    }}>
                        <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ReceiptLongIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Cantidad de OTs</Typography>
                                </Box>
                                <Typography sx={{ color: 'white', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem' }}>
                                    {summary.count}
                                </Typography>
                            </Stack>

                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DateRangeIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Rango de Fechas</Typography>
                                </Box>
                                <Typography sx={{ color: 'white', fontWeight: 'medium', fontSize: '0.9rem' }}>
                                    {startDate?.format('DD/MM/YYYY')} - {endDate?.format('DD/MM/YYYY')}
                                </Typography>
                            </Stack>

                            <Box sx={{ my: 1, borderTop: '1px dashed rgba(255,255,255,0.1)' }} />

                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" sx={{ color: '#4DB6AC', fontWeight: 'bold' }}>TOTAL NETO</Typography>
                                <Typography variant="h5" sx={{ color: '#4DB6AC', fontWeight: '900', fontFamily: 'monospace' }}>
                                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(summary.totalNet)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        onClick={() => setConfirmationOpen(false)}
                        disabled={generating}
                        sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'none', '&:hover': { color: 'white' } }}
                    >
                        Abortar
                    </Button>
                    <Button
                        onClick={handleConfirmGenerate}
                        variant="contained"
                        disabled={generating}
                        autoFocus
                        sx={{
                            bgcolor: '#009688',
                            fontWeight: 'bold',
                            px: 3,
                            '&:hover': {
                                bgcolor: '#00796B',
                                boxShadow: '0 0 15px rgba(0, 150, 136, 0.4)'
                            }
                        }}
                    >
                        {generating ? <CircularProgress size={24} color="inherit" /> : 'EJECUTAR GENERACIÓN'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
