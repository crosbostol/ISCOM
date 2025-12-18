import React, { useState } from 'react';
import { Box, Button, Typography, IconButton, Paper, Tooltip, Dialog, DialogTitle, DialogActions, Stack, InputBase } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ConductorModal } from './ConductorModal';
import { useConductors, useCreateConductor, useUpdateConductor, useDeleteConductor } from '../../../hooks/useConductors';
import type { Conductor } from '../../../hooks/useConductors';
import { formatRut } from '../../../utils/rutValidation';

export const ConductorsPage: React.FC = () => {
    const { data: conductors = [], isLoading } = useConductors();
    const createMutation = useCreateConductor();
    const updateMutation = useUpdateConductor();
    const deleteMutation = useDeleteConductor();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [conductorToDelete, setConductorToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConductors = conductors.filter(conductor =>
        conductor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conductor.rut.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        {
            field: 'rut',
            headerName: 'RUT',
            width: 150,
            valueFormatter: (value: string | null | undefined) => formatRut(value)
        },
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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* HEADER */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">
                    Conductores
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ bgcolor: '#009688', '&:hover': { bgcolor: '#00796B' }, textTransform: 'none' }}
                >
                    Nuevo Conductor
                </Button>
            </Stack>

            {/* FILTRO / BUSCADOR */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: (theme) => theme.palette.mode === 'light' ? '#F5F5F5' : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 1,
                    px: 2,
                    py: 0.5,
                    flexGrow: 1
                }}>
                    <SearchIcon color="action" />
                    <InputBase
                        placeholder="Buscar por nombre o RUT..."
                        sx={{ ml: 1, flex: 1 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Box>
            </Paper>

            {/* TABLA */}
            <Paper sx={{
                flexGrow: 1,
                width: '100%',
                borderRadius: 2,
                boxShadow: 1,
                overflow: 'hidden',
                bgcolor: 'background.paper'
            }}>
                <DataGrid
                    rows={filteredConductors}
                    columns={columns}
                    getRowId={(row) => row.id}
                    loading={isLoading}
                    disableRowSelectionOnClick
                    density="compact"
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 15 },
                        },
                    }}
                    pageSizeOptions={[15, 25, 50]}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: (theme) => theme.palette.mode === 'light'
                                ? 'rgba(0, 150, 136, 0.08)'
                                : 'rgba(77, 182, 172, 0.15)',
                            color: 'text.primary',
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                        },
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
