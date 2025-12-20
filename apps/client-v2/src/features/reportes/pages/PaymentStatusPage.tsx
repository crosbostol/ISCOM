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

import { useGetOttable, getOttableQueryKey } from '../../../api/generated/hooks/useGetOttable';
import { getReportsEdpExport } from '../../../api/generated';
import type { OrdenTrabajoDTO } from '../../../api/generated/models/OrdenTrabajoDTO';
import { downloadBlob } from '../../../utils/downloadUtils';

dayjs.extend(isBetween);

// Extend generated type for missing fields in frontend generation
interface OT extends OrdenTrabajoDTO {
    total_value?: number;
}

// Helpers
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};

export const PaymentStatusPage: React.FC = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Glow animation using theme colors
    const pulseGlow = keyframes`
        0% { 
            box-shadow: 0 0 5px ${alpha(theme.palette.primary.main, 0.2)}; 
            border-color: ${alpha(theme.palette.primary.main, 0.3)}; 
        }
        50% { 
            box-shadow: 0 0 20px ${alpha(theme.palette.primary.main, 0.4)}; 
            border-color: ${alpha(theme.palette.primary.main, 0.6)}; 
        }
        100% { 
            box-shadow: 0 0 5px ${alpha(theme.palette.primary.main, 0.2)}; 
            border-color: ${alpha(theme.palette.primary.main, 0.3)}; 
        }
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
            queryClient.removeQueries({ queryKey: getOttableQueryKey() });
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
            // Use proper query key generation
            queryKey: getOttableQueryKey(params)
        }
    });

    // -- Filtering Logic --
    const filteredOts = useMemo<OT[]>(() => {
        if (!ots) return [];
        return ots as OT[];
    }, [ots]);

    // -- Summary Calculation --
    const summary = useMemo(() => {
        const count = filteredOts.length;
        const totalNet = filteredOts.reduce((acc, ot) => acc + (Number(ot.total_value) || 0), 0);
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
        if (!startDate || !endDate) return;

        setGenerating(true);
        try {
            const start = startDate.format('YYYY-MM-DD');
            const end = endDate.format('YYYY-MM-DD');

            const blob = await getReportsEdpExport(
                { startDate: start, endDate: end },
                { responseType: 'blob' }
            );

            // Trigger Utils Download
            const now = dayjs();
            const filename = `EDP_${now.year()}_${now.format('MM')}_ISCOM.xlsx`;

            downloadBlob(blob as unknown as Blob, filename);

        } catch (error) {
            console.error('Error downloading report:', error);
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
            valueGetter: (_value, row: OT) => Number(row.total_value) || 0,
            valueFormatter: (value: number) => formatCurrency(value)
        }
    ];

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            p: 3
        }}>
            {/* Header */}
            <Box mb={3}>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Generar Estado de Pago
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Seleccione un rango de fechas para visualizar las OTs y generar el documento consolidado.
                </Typography>
            </Box>

            {/* Criteria Panel (HUD) */}
            <Paper sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.3 : 0.2)}`,
                boxShadow: isDark ? `0 0 15px ${alpha(theme.palette.common.black, 0.3)}` : 1,
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
                        textTransform: 'none',
                        color: 'primary.main',
                        borderColor: alpha(theme.palette.primary.main, isDark ? 0.5 : 0.8),
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            borderColor: 'primary.main',
                            color: 'primary.main',
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
                bgcolor: 'background.paper',
                boxShadow: isDark ? `0 4px 6px ${alpha(theme.palette.common.black, 0.3)}` : 1,
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
                        color: 'text.primary',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: isDark ? alpha(theme.palette.common.black, 0.2) : alpha(theme.palette.primary.main, 0.08),
                            color: isDark ? theme.palette.primary.light : 'text.primary',
                            fontWeight: 'bold'
                        },
                        '& .MuiDataGrid-footerContainer': {
                            bgcolor: isDark ? alpha(theme.palette.common.black, 0.2) : 'transparent',
                        }
                    }}
                    slots={{
                        footer: () => (
                            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Total OTs: <b>{summary.count}</b>
                                </Typography>
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                    Total: {formatCurrency(summary.totalNet)}
                                </Typography>

                                {/* Footer Action Button */}
                                <Tooltip title="Confirmar y exportar el listado actual">
                                    <span>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <CloudDownloadIcon />}
                                            onClick={handleGenerateClick}
                                            disabled={filteredOts.length === 0 || generating}
                                            sx={{
                                                ml: 2,
                                                minWidth: 180,
                                                height: 48,
                                                fontWeight: 'bold',
                                                textTransform: 'none',
                                                borderRadius: 2,
                                                bgcolor: 'primary.main',
                                                color: isDark ? 'common.black' : 'common.white',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    bgcolor: theme.palette.primary.dark,
                                                    boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                    transform: 'translateY(-1px)',
                                                },
                                                '&.Mui-disabled': {
                                                    bgcolor: alpha(theme.palette.action.disabledBackground, isDark ? 0.3 : 1),
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
                        bgcolor: theme.palette.background.paper,
                        backgroundImage: 'none',
                        borderRadius: 3,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        animation: `${pulseGlow} 3s infinite ease-in-out`,
                        minWidth: 400
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <SummarizeIcon sx={{ color: theme.palette.primary.main }} />
                    <Box>
                        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold', lineHeight: 1.2 }}>
                            Confirmar Generación
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', letterSpacing: 1 }}>
                            EDP_{dayjs().year()}_{dayjs().format('MM')}_ISCOM
                        </Typography>
                    </Box>
                </DialogTitle>

                <DialogContent>
                    <Typography variant="body2" sx={{ color: isDark ? alpha(theme.palette.common.white, 0.7) : 'text.secondary', mb: 3 }}>
                        Se procederá a consolidar las OTs terminadas en el periodo seleccionado para la emisión del Estado de Pago.
                    </Typography>

                    {/* Info Card con Estilo HUD / Glassmorphism */}
                    <Box sx={{
                        p: 2.5,
                        // Fondo Midnight Translucent
                        bgcolor: isDark ? alpha(theme.palette.common.black, 0.4) : alpha(theme.palette.common.black, 0.03),
                        borderRadius: 2,
                        // Borde con toque Teal
                        border: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.common.black, 0.1)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(6px)', // Efecto de cristal esmerilado
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0, top: 0, bottom: 0,
                            width: '4px',
                            bgcolor: theme.palette.primary.main,
                            // EL GLOW: Resplandor neón en la barra lateral
                            boxShadow: isDark ? `0 0 15px ${theme.palette.primary.main}` : 'none',
                        }
                    }}>
                        <Stack spacing={2}>
                            {/* Cantidad de OTs */}
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ReceiptLongIcon sx={{ fontSize: 18, color: isDark ? alpha(theme.palette.common.white, 0.5) : 'text.secondary' }} />
                                    <Typography variant="body2" sx={{ color: isDark ? alpha(theme.palette.common.white, 0.6) : 'text.secondary' }}>
                                        Cantidad de OTs
                                    </Typography>
                                </Box>
                                <Typography sx={{
                                    color: isDark ? theme.palette.common.white : 'text.primary',
                                    fontWeight: 'bold',
                                    fontFamily: 'monospace',
                                    fontSize: '1.1rem'
                                }}>
                                    {summary.count}
                                </Typography>
                            </Stack>

                            {/* Rango de Fechas */}
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DateRangeIcon sx={{ fontSize: 18, color: isDark ? alpha(theme.palette.common.white, 0.5) : 'text.secondary' }} />
                                    <Typography variant="body2" sx={{ color: isDark ? alpha(theme.palette.common.white, 0.6) : 'text.secondary' }}>
                                        Rango de Fechas
                                    </Typography>
                                </Box>
                                <Typography sx={{
                                    color: isDark ? theme.palette.common.white : 'text.primary',
                                    fontWeight: 'medium',
                                    fontSize: '0.9rem'
                                }}>
                                    {startDate?.format('DD/MM/YYYY')} - {endDate?.format('DD/MM/YYYY')}
                                </Typography>
                            </Stack>

                            {/* Línea Divisora Técnica */}
                            <Box sx={{
                                my: 1,
                                borderTop: `1px dashed ${isDark ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.divider, 0.3)}`
                            }} />

                            {/* Total Neto con Resalte Máximo */}
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" sx={{
                                    color: theme.palette.primary.main,
                                    fontWeight: 'bold',
                                    letterSpacing: 1
                                }}>
                                    TOTAL NETO
                                </Typography>
                                <Typography variant="h5" sx={{
                                    color: theme.palette.primary.main,
                                    fontWeight: '900',
                                    fontFamily: 'monospace',
                                    // Sutil sombra de texto para que los números "brillen"
                                    textShadow: isDark ? `0 0 10px ${alpha(theme.palette.primary.main, 0.3)}` : 'none'
                                }}>
                                    {formatCurrency(summary.totalNet)}
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        onClick={() => setConfirmationOpen(false)}
                        disabled={generating}
                        sx={{
                            color: 'text.secondary',
                            textTransform: 'none',
                            '&:hover': { color: 'text.primary' }
                        }}
                    >
                        Abortar
                    </Button>
                    <Button
                        onClick={handleConfirmGenerate}
                        variant="contained"
                        disabled={generating}
                        autoFocus
                        sx={{
                            bgcolor: theme.palette.primary.main,
                            fontWeight: 'bold',
                            px: 3,
                            '&:hover': {
                                bgcolor: theme.palette.primary.dark,
                                boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.4)}`
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
