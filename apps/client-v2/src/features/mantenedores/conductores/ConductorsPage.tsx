import React, { useState } from 'react';
import { Box, Button, Typography, IconButton, Paper, Tooltip, Dialog, DialogTitle, DialogActions } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConductorModal } from './ConductorModal';
import { useConductors, useCreateConductor, useUpdateConductor, useDeleteConductor } from '../../../hooks/useConductors';
import type { Conductor } from '../../../hooks/useConductors';

export const ConductorsPage: React.FC = () => {
    const { data: conductors = [], isLoading } = useConductors();
    const createMutation = useCreateConductor();
    const updateMutation = useUpdateConductor();
    const deleteMutation = useDeleteConductor();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [conductorToDelete, setConductorToDelete] = useState<number | null>(null);

    const handleOpenCreate = () => {
        setSelectedConductor(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (conductor: Conductor) => {
        setSelectedConductor(conductor);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setConductorToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (conductorToDelete !== null) {
            try {
                await deleteMutation.mutateAsync(conductorToDelete);
                setDeleteConfirmOpen(false);
                setConductorToDelete(null);
            } catch (error) {
                console.error("Failed to delete", error);
                // Ideally show a snackbar here
            }
        }
    };

    const handleSave = async (data: { name: string; rut: string }) => {
        try {
            if (selectedConductor) {
                await updateMutation.mutateAsync({ id: selectedConductor.id, data });
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
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Nombre', flex: 1 },
        { field: 'rut', headerName: 'RUT', width: 150 },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 120,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <Tooltip title="Editar">
                        <IconButton onClick={() => handleOpenEdit(params.row as Conductor)} size="small">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton onClick={() => handleDeleteClick((params.row as Conductor).id)} size="small" color="error">
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
                    Conductores
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ bgcolor: '#009688', '&:hover': { bgcolor: '#00796B' } }}
                >
                    Nuevo Conductor
                </Button>
            </Box>

            <Paper sx={{ flexGrow: 1, p: 0, overflow: 'hidden' }}>
                <DataGrid
                    rows={conductors}
                    columns={columns}
                    getRowId={(row) => row.id}
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

            <ConductorModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSave}
                initialData={selectedConductor}
                isLoading={createMutation.isPending || updateMutation.isPending}
                error={(createMutation.error || updateMutation.error) as Error | null}
            />

            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
            >
                <DialogTitle>¿Está seguro que desea eliminar este conductor?</DialogTitle>
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
