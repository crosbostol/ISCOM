import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    IconButton,
    Paper,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogActions,
    Stack,
    InputBase,
    useTheme,
    alpha,
    Snackbar,
    Alert
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQueryClient } from '@tanstack/react-query';

// Components & Utils
import { ConductorModal } from '../components/ConductorModal';
import { formatRut } from '../../../utils/rutValidation';

// Generated Kubb Hooks & Types
import { useGetConductors, getConductorsQueryKey } from '../../../api/generated/hooks/useGetConductors';
import { usePostConductors } from '../../../api/generated/hooks/usePostConductors';
import { usePutConductorsId } from '../../../api/generated/hooks/usePutConductorsId';
import { useDeleteConductorsId } from '../../../api/generated/hooks/useDeleteConductorsId';
import type { Conductor } from '../../../api/generated/models/Conductor';

export const ConductorsPage: React.FC = () => {
    const theme = useTheme();
    const queryClient = useQueryClient();

    // Hooks
    const { data: conductors = [], isLoading } = useGetConductors();
    const createMutation = usePostConductors();
    const updateMutation = usePutConductorsId();
    const deleteMutation = useDeleteConductorsId();

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConductor, setSelectedConductor] = useState<Conductor | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [conductorToDelete, setConductorToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Derived State
    const filteredConductors = conductors.filter(conductor =>
        conductor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conductor.rut.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers
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

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const handleConfirmDelete = async () => {
        if (conductorToDelete !== null) {
            try {
                await deleteMutation.mutateAsync({ id: conductorToDelete });
                await queryClient.invalidateQueries({ queryKey: getConductorsQueryKey() });
                setSnackbar({ open: true, message: 'Conductor eliminado correctamente', severity: 'success' });
                setDeleteConfirmOpen(false);
                setConductorToDelete(null);
            } catch (error) {
                console.error("Failed to delete", error);
                setSnackbar({ open: true, message: 'Error al eliminar conductor', severity: 'error' });
            }
        }
    };

    const handleSave = async (data: { name: string; rut: string }) => {
        try {
            if (selectedConductor) {
                await updateMutation.mutateAsync({ id: selectedConductor.id, data });
                setSnackbar({ open: true, message: 'Conductor actualizado correctamente', severity: 'success' });
            } else {
                await createMutation.mutateAsync({ data });
                setSnackbar({ open: true, message: 'Conductor creado correctamente', severity: 'success' });
            }
            await queryClient.invalidateQueries({ queryKey: getConductorsQueryKey() });
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save", error);
            // Error handling is also managed within the Modal for validation errors
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        createMutation.reset();
        updateMutation.reset();
    };

    // Columns
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
                        <IconButton
                            onClick={() => handleOpenEdit(params.row as Conductor)}
                            size="small"
                            sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.primary.main } }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton
                            onClick={() => handleDeleteClick((params.row as Conductor).id)}
                            size="small"
                            sx={{ color: theme.palette.error.main, '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}
                        >
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
                    sx={{
                        bgcolor: theme.palette.primary.main,
                        '&:hover': { bgcolor: theme.palette.primary.dark },
                        textTransform: 'none',
                        fontWeight: 'bold'
                    }}
                >
                    Nuevo Conductor
                </Button>
            </Stack>

            {/* FILTRO / BUSCADOR */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center', bgcolor: theme.palette.background.paper }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                    borderRadius: 1,
                    px: 2,
                    py: 0.5,
                    flexGrow: 1
                }}>
                    <SearchIcon sx={{ color: theme.palette.text.secondary }} />
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
                bgcolor: theme.palette.background.paper
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
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.text.primary,
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: `1px solid ${theme.palette.divider}`,
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
                PaperProps={{
                    sx: { bgcolor: theme.palette.background.paper }
                }}
            >
                <DialogTitle sx={{ color: theme.palette.text.primary }}>
                    ¿Está seguro que desea eliminar este conductor?
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: theme.palette.text.secondary }}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};
