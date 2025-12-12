import { useState } from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { Alert, Snackbar, Chip, Box, Typography, CircularProgress, Button } from '@mui/material';
import { useGetOttable } from '../../../api/generated/hooks/useGetOttable';
import { UploadOTs } from '../components/UploadOTs';
import type { GetOttable200 } from '../../../api/generated/models/GetOttable';


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
};

export const OTListPage: React.FC = () => {
    const [uploadOpen, setUploadOpen] = useState(false);
    const { data: ots, isLoading, isError, error } = useGetOttable({
        query: {
            queryKey: ['ots'],
        }
    });

    // Snackbar state
    const isErrorOpen = isError;

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 250,
            renderCell: (params: GridRenderCellParams<OT>) => {
                const { external_ot_id, id } = params.row;
                if (external_ot_id) {
                    return <Typography variant="body2">{external_ot_id}</Typography>;
                }
                return <Chip label={`ADICIONAL (Int: ${id})`} color="secondary" size="small" variant="outlined" />;
            }
        },
        {
            field: 'ot_state',
            headerName: 'Estado',
            width: 200, // Un poco más ancho para el mensaje de atraso
            renderCell: (params: GridRenderCellParams<OT>) => {
                const stateCode = params.value as string;
                const config = STATE_CONFIG[stateCode] || { label: stateCode, color: 'default' };

                // --- LÓGICA DE ALERTA DE ATRASO ---
                // Regla: Si está pendiente de civil y pasaron 3+ días -> ROJO
                const daysElapsed = getDaysDiff(params.row.started_at);
                const isDelayed = stateCode === 'PENDIENTE_OC' && daysElapsed >= 3;

                // Si está atrasado, forzamos color error y agregamos texto
                const finalColor = isDelayed ? 'error' : config.color;
                const finalLabel = isDelayed ? `${config.label} (${daysElapsed}d)` : config.label;

                return (
                    <Chip
                        label={finalLabel}
                        color={finalColor}
                        variant={isDelayed ? "filled" : "outlined"} // Relleno si es urgente
                        size="small"
                        sx={{ fontWeight: isDelayed ? 'bold' : 'normal' }}
                    />
                );
            }
        },
        {
            field: 'address',
            headerName: 'Dirección',
            width: 300,
            valueGetter: (_value, row) => {
                return `${row.street || ''} ${row.number_street || ''} ${row.commune || ''}`.trim()
            }
        },
        { field: 'n_hidraulico', headerName: 'Móvil Hidráulico', width: 200 },
        { field: 'n_civil', headerName: 'Móvil Civil', width: 200 },
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
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{
            height: '80vh',
            width: '100%',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            resize: 'vertical', // User requested resizing like windows. 'both' allows width too. 'vertical' is safer for layout but user said 'windows'.
            overflow: 'auto', // Required for resize
            minHeight: 400
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Listado de Órdenes de Trabajo
                </Typography>
                <Button variant="contained" color="primary" onClick={() => setUploadOpen(true)}>
                    Importar CSV
                </Button>
            </Box>

            <UploadOTs open={uploadOpen} onClose={() => setUploadOpen(false)} />

            <DataGrid
                rows={ots || []}
                columns={columns}
                loading={isLoading}
                getRowId={(row) => row.id}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                    },
                }}
                pageSizeOptions={[5, 10, 25]}
                onRowClick={(params) => console.log('Row clicked:', params.row)}
                getRowClassName={(params) => {
                    const days = getDaysDiff(params.row.started_at);
                    if (params.row.ot_state === 'PENDIENTE_OC' && days >= 3) {
                        return 'row-delayed';
                    }
                    return '';
                }}
                sx={{
                    flex: 1, // Fill available space
                    minHeight: 0, // Flexbug fix
                    boxShadow: 2,
                    border: 2,
                    borderColor: 'primary.light',
                    '& .row-delayed': {
                        bgcolor: '#FFEBEE', // Rojo muy suave de fondo
                        '&:hover': { bgcolor: '#FFCDD2' }
                    },
                    '& .MuiDataGrid-cell:hover': {
                        color: 'primary.main',
                    },
                    /* Minimalist Scrollbar */
                    '& ::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px'
                    },
                    '& ::-webkit-scrollbar-track': {
                        background: '#E8F6FA' // Hover/State color
                    },
                    '& ::-webkit-scrollbar-thumb': {
                        background: '#6ABCE5', // Primary Action color
                        borderRadius: '4px',
                    },
                    '& ::-webkit-scrollbar-thumb:hover': {
                        background: '#1F6EB1' // Primary Dark color
                    }
                }}
            />

            <Snackbar open={isErrorOpen} autoHideDuration={6000}>
                <Alert severity="error" sx={{ width: '100%' }}>
                    Error al cargar OTs: {(error as Error)?.message || 'Unknown error'}
                </Alert>
            </Snackbar>
        </Box>
    );
};
