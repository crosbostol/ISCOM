import { useState } from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { Alert, Snackbar, Chip, Box, Typography, CircularProgress, Button } from '@mui/material';
import { useGetOttable } from '../../../api/generated/hooks/useGetOttable';
import { UploadOTs } from '../components/UploadOTs';
import type { GetOttable200 } from '../../../api/generated/models/GetOttable';

type OT = GetOttable200[number];

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
        { field: 'ot_state', headerName: 'Estado', width: 150 },
        {
            field: 'address',
            headerName: 'Dirección',
            width: 300,
            valueGetter: (value, row) => {
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
                sx={{
                    flex: 1, // Fill available space
                    minHeight: 0, // Flexbug fix
                    boxShadow: 2,
                    border: 2,
                    borderColor: 'primary.light',
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
