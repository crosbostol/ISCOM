import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { Alert, Snackbar, Chip, Box, Typography, CircularProgress, Button } from '@mui/material';
import { getOTs } from '../api/otService';
import { UploadOTs } from '../components/UploadOTs';
import type { OT } from '../types/ot.types';

export const OTListPage: React.FC = () => {
    const [uploadOpen, setUploadOpen] = useState(false);
    const { data: ots, isLoading, isError, error } = useQuery<OT[]>({
        queryKey: ['ots'],
        queryFn: getOTs,
        // Optional: retry: 1, refetchOnWindowFocus: false to avoid spamming if backend is flaky
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
        { field: 'started_at', headerName: 'Inicio', width: 120 },
    ];

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ height: 700, width: '100%', p: 3 }}>
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
                    boxShadow: 2,
                    border: 2,
                    borderColor: 'primary.light',
                    '& .MuiDataGrid-cell:hover': {
                        color: 'primary.main',
                    },
                }}
            />

            <Snackbar open={isErrorOpen} autoHideDuration={6000}>
                <Alert severity="error" sx={{ width: '100%' }}>
                    Error al cargar OTs: {(error as any)?.message || 'Unknown error'}
                </Alert>
            </Snackbar>
        </Box>
    );
};
