import { useState, useMemo, useCallback } from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import { Alert, Snackbar, Chip, Box, Typography, CircularProgress, Button, Stack, Paper, InputBase, Popover, Tooltip, Backdrop } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { useGetOttable } from '../../../api/generated/hooks/useGetOttable';
import { UploadOTs } from '../components/UploadOTs';
import type { GetOttable200 } from '../../../api/generated/models/GetOttable';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

dayjs.extend(isBetween);


type OT = GetOttable200[number];

const getDaysDiff = (dateString?: string | null) => {
    if (!dateString) return 0;
    const start = new Date(dateString);
    const now = new Date();
    // Diferencia en milisegundos dividida por ms en un día
    const diffTime = now.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Mapeo de estados a UX
const STATE_CONFIG: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
    'CREADA': { label: '🆕 Creada', color: 'default' },
    'PENDIENTE_OC': { label: '🚧 Falta Civil', color: 'warning' }, // Match API Value
    'PENDIENTE_RET': { label: '🧹 Falta Retiro', color: 'info' },   // Match API Value
    'OBRA_TERMINADA': { label: '🏗️ Obra Lista', color: 'info' },   // Legacy/Fallback
    'POR_PAGAR': { label: '💰 Por Pagar', color: 'success' },
    'PAGADA': { label: '✅ Pagada', color: 'primary' },
    'ANULADA': { label: '🚫 Anulada', color: 'error' },
    'OBSERVADA': { label: '⚠️ Observada', color: 'warning' }, // New State
};

import { OTFormModal } from '../components/OTFormModal';
import EditIcon from '@mui/icons-material/Edit';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { usePutOtId } from '../../../api/generated/hooks/usePutOtId';

export const OTListPage: React.FC = () => {
    const [uploadOpen, setUploadOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOtId, setSelectedOtId] = useState<number | null>(null);

    // Dropzone State
    const [droppedFile, setDroppedFile] = useState<File | null>(null);

    // Snackbar State
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Dropzone Logic
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setDroppedFile(file);
            setUploadOpen(true);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        noClick: true,
        noKeyboard: true,
        onDropRejected: () => {
            setSnackbar({ open: true, message: 'Solo archivos CSV', severity: 'error' });
        }
    });

    const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

    const handleNotify = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
        setSnackbar({ open: true, message, severity });
    };

    // Filter State
    const [searchText, setSearchText] = useState('');
    const [dateAnchorEl, setDateAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [filterDateStart, setFilterDateStart] = useState<dayjs.Dayjs | null>(null);
    const [filterDateEnd, setFilterDateEnd] = useState<dayjs.Dayjs | null>(null);

    // TODO: REFACTOR TO SERVER-SIDE PAGINATION
    const { data: ots, isLoading, isError, error } = useGetOttable();

    const filteredOts = useMemo(() => {
        if (!ots) return [];
        return ots.filter((ot) => {
            const searchLower = searchText.toLowerCase();
            const matchesText = !searchText || (
                (ot.external_ot_id?.toLowerCase() || '').includes(searchLower) ||
                (ot.street?.toLowerCase() || '').includes(searchLower) ||
                (ot.commune?.toLowerCase() || '').includes(searchLower) ||
                (ot.ot_state?.toLowerCase() || '').includes(searchLower) ||
                (String(ot.id).includes(searchLower))
            );

            if (!matchesText) return false;

            if (!filterDateStart && !filterDateEnd) return true;
            if (!ot.started_at) return false;

            const otDate = dayjs(ot.started_at);
            const start = filterDateStart ? filterDateStart.startOf('day') : null;
            const end = filterDateEnd ? filterDateEnd.endOf('day') : dayjs().endOf('day');

            if (start && otDate.isBefore(start)) return false;
            if (otDate.isAfter(end)) return false;

            return true;
        });
    }, [ots, searchText, filterDateStart, filterDateEnd]);

    const { mutate: updateOt } = usePutOtId();

    const handleCreate = () => {
        setSelectedOtId(null);
        setModalOpen(true);
    };

    const handleEditResources = (ot: OT) => {
        setSelectedOtId(ot.id!);
        setModalOpen(true);
    };

    const processRowUpdate = async (newRow: OT, oldRow: OT) => {
        // Optimistic update or wait?
        // Let's fire and forget for simple fields, but ideally handle errors.
        if (newRow.external_ot_id !== oldRow.external_ot_id ||
            newRow.street !== oldRow.street ||
            newRow.number_street !== oldRow.number_street ||
            newRow.commune !== oldRow.commune
        ) {
            updateOt({ id: newRow.id!, data: newRow as any });
        }
        return newRow;
    };

    // Snackbar state
    const isErrorOpen = isError;

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 150,
            renderCell: (params: GridRenderCellParams<OT>) => {
                const { external_ot_id, id } = params.row;
                const content = external_ot_id
                    ? <Typography variant="body2" sx={{ lineHeight: 'normal' }}>{external_ot_id}</Typography>
                    : <Chip label={`ADICIONAL (${id})`} color="secondary" size="small" variant="outlined" />;

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
                        {content}
                    </Box>
                );
            }
        },
        {
            field: 'ot_state',
            headerName: 'Estado',
            width: 180,
            type: 'singleSelect',
            valueOptions: Object.entries(STATE_CONFIG).map(([value, config]) => ({
                value,
                label: config.label
            })),
            renderCell: (params: GridRenderCellParams<OT>) => {
                const stateCode = params.value as string;
                const config = STATE_CONFIG[stateCode] || { label: stateCode, color: 'default' };

                // --- LÓGICA DE ALERTA DE ATRASO ---
                // Regla: Si está pendiente de civil y pasaron 3+ días -> ROJO
                const daysElapsed = getDaysDiff(params.row.started_at);
                const isDelayed = stateCode === 'PENDIENTE_OC' && daysElapsed >= 3;

                // --- LÓGICA DE OBSERVADA ---
                const isObservada = stateCode === 'OBSERVADA';
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const observationText = (params.row as any).observation;

                // Si está atrasado, forzamos color error
                const finalColor = isDelayed ? 'error' : config.color;
                const finalLabel = isDelayed ? `${config.label} (${daysElapsed}d)` : config.label;

                const chip = (
                    <Chip
                        label={finalLabel}
                        color={finalColor as any}
                        variant={isDelayed ? "filled" : (isObservada ? "outlined" : "filled")}
                        size="small"
                        sx={isObservada ? { borderColor: '#ed6c02', color: '#e65100', fontWeight: 'bold' } : (isDelayed ? { fontWeight: 'bold' } : {})}
                    />
                );

                if (isObservada && observationText) {
                    return (
                        <Tooltip title={observationText} arrow placement="top">
                            {chip}
                        </Tooltip>
                    );
                }
                return chip;
            }
        },
        { field: 'street', headerName: 'Calle', width: 150, editable: true },
        { field: 'number_street', headerName: 'Nro', width: 80, editable: true },
        { field: 'commune', headerName: 'Comuna', width: 120, editable: true },
        { field: 'n_hidraulico', headerName: 'Móvil Hid.', width: 120 },
        { field: 'n_civil', headerName: 'Móvil Civil', width: 120 },
        {
            field: 'started_at',
            headerName: 'Inicio',
            width: 120,
            valueFormatter: (value) => {
                if (!value) return '';
                const date = new Date(value);
                if (isNaN(date.getTime())) return value;
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Recursos',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Asignar Recursos"
                    onClick={() => handleEditResources(params.row)}
                />
            ]
        },
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <DashboardLayout>
            <Box {...getRootProps()} sx={{ position: 'relative', height: '100%', outline: 'none' }}>
                <input {...getInputProps()} />

                <UploadOTs
                    open={uploadOpen}
                    onClose={() => {
                        setUploadOpen(false);
                        setDroppedFile(null);
                    }}
                    initialFile={droppedFile}
                />

                {/* Modal */}
                <OTFormModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    otId={selectedOtId}
                    onNotify={handleNotify}
                />

                {/* Global Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    sx={{ zIndex: 2000 }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
                        {snackbar.message}
                    </Alert>
                </Snackbar>

                {/* HEADER */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">
                        Órdenes de Trabajo
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleCreate}
                        startIcon={<PostAddIcon />}
                        sx={{ bgcolor: '#009688', '&:hover': { bgcolor: '#00796B' } }}
                    >
                        Nueva OT
                    </Button>
                </Stack>

                {/* FILTER BAR */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 1,
                        px: 2,
                        py: 0.5,
                        flexGrow: 1
                    }}>
                        <SearchIcon color="action" />
                        <InputBase
                            placeholder="Buscar..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            sx={{ ml: 1, flex: 1, color: 'text.primary' }}
                        />
                    </Box>

                    <Box>
                        <Button
                            variant={filterDateStart || filterDateEnd ? "contained" : "outlined"}
                            color={filterDateStart || filterDateEnd ? "primary" : "inherit"}
                            startIcon={<DateRangeIcon />}
                            onClick={(e) => setDateAnchorEl(e.currentTarget)}
                            sx={{ borderColor: 'divider', color: filterDateStart || filterDateEnd ? 'white' : 'text.secondary', height: 40 }}
                        >
                            {filterDateStart ? `${filterDateStart.format('DD/MM')} - ${filterDateEnd ? filterDateEnd.format('DD/MM') : 'Hoy'}` : 'Fecha'}
                        </Button>
                        <Popover
                            open={Boolean(dateAnchorEl)}
                            anchorEl={dateAnchorEl}
                            onClose={() => setDateAnchorEl(null)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, width: 300 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">Filtrar por Fecha Inicio</Typography>
                                    <DatePicker
                                        label="Desde"
                                        value={filterDateStart}
                                        format="DD-MM-YYYY"
                                        onChange={(val) => setFilterDateStart(val)}
                                        slotProps={{ textField: { size: 'small' } }}
                                    />
                                    <DatePicker
                                        label="Hasta"
                                        value={filterDateEnd}
                                        format="DD-MM-YYYY"
                                        onChange={(val) => setFilterDateEnd(val)}
                                        slotProps={{ textField: { size: 'small', helperText: !filterDateEnd ? "Se asume: HOY" : "" } }}
                                    />
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Button size="small" color="inherit" onClick={() => { setFilterDateStart(null); setFilterDateEnd(null); }}>Limpiar</Button>
                                        <Button size="small" variant="contained" onClick={() => setDateAnchorEl(null)}>Aplicar</Button>
                                    </Stack>
                                </Box>
                            </LocalizationProvider>
                        </Popover>
                    </Box>



                    <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => setUploadOpen(true)}>
                        Cargar CSV
                    </Button>
                </Paper>

                {/* DATA TABLE */}
                <Paper sx={{
                    height: '70vh',
                    width: '100%',
                    borderRadius: 2,
                    boxShadow: 1,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    backgroundImage: 'none'
                }}>
                    <DataGrid
                        rows={filteredOts}
                        columns={columns}
                        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                        processRowUpdate={processRowUpdate}
                        loading={isLoading}
                        getRowId={(row) => row.id || Math.random()}
                        initialState={{
                            pagination: {
                                paginationModel: { pageSize: 15, page: 0 },
                            },
                        }}
                        pageSizeOptions={[15, 25, 50]}
                        disableRowSelectionOnClick
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                bgcolor: (theme) => theme.palette.mode === 'light'
                                    ? 'rgba(0, 150, 136, 0.08)'
                                    : 'rgba(77, 182, 172, 0.15)',
                                color: 'text.primary',
                            },
                            '& .MuiDataGrid-row:hover': {
                                bgcolor: 'action.hover',
                            },
                            '& .row-delayed': {
                                bgcolor: (theme) => theme.palette.mode === 'light'
                                    ? '#FFEBEE'
                                    : 'rgba(211, 47, 47, 0.2)',
                                '&:hover': {
                                    bgcolor: (theme) => theme.palette.mode === 'light'
                                        ? '#FFCDD2'
                                        : 'rgba(211, 47, 47, 0.3)'
                                }
                            },
                        }}
                        getRowClassName={(params) => {
                            const days = getDaysDiff(params.row.started_at);
                            if (params.row.ot_state === 'PENDIENTE_OC' && days >= 3) {
                                return 'row-delayed';
                            }
                            return '';
                        }}
                    />
                </Paper>

                <Snackbar open={isErrorOpen} autoHideDuration={6000}>
                    <Alert severity="error" sx={{ width: '100%' }}>
                        Error al cargar OTs: {(error as Error)?.message || 'Unknown error'}
                    </Alert>
                </Snackbar>

                {/* DROP OVERLAY */}
                {isDragActive && (
                    <Backdrop
                        open={true}
                        sx={{
                            position: 'absolute',
                            zIndex: 10,
                            color: '#009688',
                            bgcolor: 'rgba(11, 25, 41, 0.85)',
                            border: '3px dashed #009688',
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 80, mb: 2 }} />
                        <Typography variant="h4" fontWeight="bold">
                            Suelta el CSV aquí
                        </Typography>
                    </Backdrop>
                )}
            </Box>
        </DashboardLayout>
    );
};
