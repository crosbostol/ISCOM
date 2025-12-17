import React, { useState } from 'react';
import { Box, Button, Typography, IconButton, Paper, Tooltip, Dialog, DialogTitle, DialogActions, Chip } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { MovilModal } from './MovilModal';
import { useMoviles, useCreateMovil, useUpdateMovil, useDeleteMovil } from '../../../hooks/useMoviles';
import type { Movil } from '../../../hooks/useMoviles';

export const MovilesPage: React.FC = () => {
    const { data: moviles = [], isLoading } = useMoviles();
    const createMutation = useCreateMovil();
    const updateMutation = useUpdateMovil();
    const deleteMutation = useDeleteMovil();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMovil, setSelectedMovil] = useState<Movil | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [movilToDelete, setMovilToDelete] = useState<string | null>(null);

    const handleOpenCreate = () => {
        setSelectedMovil(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (movil: Movil) => {
        setSelectedMovil(movil);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setMovilToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (movilToDelete !== null) {
            try {
                await deleteMutation.mutateAsync(movilToDelete);
                setDeleteConfirmOpen(false);
                setMovilToDelete(null);
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const handleSave = async (data: any) => {
        try {
            if (selectedMovil) {
                await updateMutation.mutateAsync({ id: selectedMovil.movil_id, data });
            } else {
                await createMutation.mutateAsync(data);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save", error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        createMutation.reset();
        updateMutation.reset();
    };

    const columns: GridColDef[] = [
        { field: 'movil_id', headerName: 'Patente (ID)', width: 120 },
        { field: 'external_code', headerName: 'Cód. Externo', width: 120 },
        { field: 'movil_type', headerName: 'Tipo', flex: 1 },
        {
            field: 'movil_state',
            headerName: 'Estado',
            width: 150,
            renderCell: (params) => {
                const color = params.value === 'OPERATIVO' ? 'success' : params.value === 'EN MANTENCION' ? 'warning' : 'error';
                return <Chip label={params.value} color={color} size="small" variant="outlined" />;
            }
        },
        {
            field: 'conductor_name',
            headerName: 'Conductor Asignado',
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
                    {params.value ? (
                        <Typography variant="body2">{params.value}</Typography>
                    ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">Sin Conductor</Typography>
                    )}
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 120,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <Tooltip title="Editar">
                        <IconButton onClick={() => handleOpenEdit(params.row as Movil)} size="small">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton onClick={() => handleDeleteClick((params.row as Movil).movil_id)} size="small" color="error">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Móviles
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ bgcolor: '#009688', '&:hover': { bgcolor: '#00796B' } }}
                >
                    Nuevo Móvil
                </Button>
            </Box>

            <Paper sx={{ flexGrow: 1, p: 0, overflow: 'hidden' }}>
                <DataGrid
                    rows={moviles}
                    columns={columns}
                    getRowId={(row) => row.movil_id}
                    loading={isLoading}
                    disableRowSelectionOnClick
                    density="comfortable"
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 25 },
                        },
                    }}
                    pageSizeOptions={[25, 50, 100]}
                    sx={{
                        border: 'none',
                        // --- SCROLLBAR STYLING ---
                        '& ::-webkit-scrollbar': {
                            width: 8,
                            height: 8,
                        },
                        '& ::-webkit-scrollbar-track': {
                            backgroundColor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.05)',
                        },
                        '& ::-webkit-scrollbar-thumb': {
                            borderRadius: 4,
                            backgroundColor: (theme) => theme.palette.mode === 'light' ? '#bdbdbd' : 'rgba(255, 255, 255, 0.3)',
                            '&:hover': {
                                backgroundColor: (theme) => theme.palette.mode === 'light' ? '#9e9e9e' : 'rgba(255, 255, 255, 0.5)',
                            }
                        },
                        // --- END SCROLLBAR ---
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: (theme) => theme.palette.mode === 'light'
                                ? 'rgba(0, 150, 136, 0.08)'
                                : 'rgba(77, 182, 172, 0.15)',
                            color: 'text.primary',
                        },
                        '& .MuiDataGrid-row:hover': {
                            bgcolor: 'action.hover',
                        }
                    }}
                />
            </Paper>

            <MovilModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSave}
                initialData={selectedMovil}
                isLoading={createMutation.isPending || updateMutation.isPending}
                error={(createMutation.error || updateMutation.error) as Error | null}
            />

            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle>¿Está seguro que desea eliminar este móvil?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
