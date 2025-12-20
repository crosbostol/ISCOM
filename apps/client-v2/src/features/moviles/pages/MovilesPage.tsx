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
    Chip,
    Stack,
    InputBase,
    useTheme,
    alpha,
    Snackbar,
    Alert
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { useQueryClient } from '@tanstack/react-query';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Components & Utils
import { MovilModal } from '../components/MovilModal';

// Generated Kubb Hooks & Types
import { useGetMoviles, getMovilesQueryKey } from '../../../api/generated/hooks/useGetMoviles';
import { usePostMoviles } from '../../../api/generated/hooks/usePostMoviles';
import { usePutMovilesId } from '../../../api/generated/hooks/usePutMovilesId';
import { useDeleteMovilesId } from '../../../api/generated/hooks/useDeleteMovilesId';
import { useGetConductors } from '../../../api/generated/hooks/useGetConductors';
import type { MovilDTO } from '../../../api/generated/models/MovilDTO';

export const MovilesPage: React.FC = () => {
    const theme = useTheme();
    const queryClient = useQueryClient();

    // Hooks
    const { data: moviles = [], isLoading: isLoadingMoviles } = useGetMoviles();
    const { data: conductors = [], isLoading: isLoadingConductors } = useGetConductors();

    const createMutation = usePostMoviles();
    const updateMutation = usePutMovilesId();
    const deleteMutation = useDeleteMovilesId();

    const isLoading = isLoadingMoviles || isLoadingConductors;

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMovil, setSelectedMovil] = useState<MovilDTO | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [movilToDelete, setMovilToDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Derived State
    const filteredMoviles = moviles.filter(movil =>
        movil.movil_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (movil.external_code && movil.external_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        movil.movil_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers
    const handleOpenCreate = () => {
        setSelectedMovil(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (movil: MovilDTO) => {
        setSelectedMovil(movil);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setMovilToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const handleConfirmDelete = async () => {
        if (movilToDelete !== null) {
            try {
                await deleteMutation.mutateAsync({ id: movilToDelete });
                await queryClient.invalidateQueries({ queryKey: getMovilesQueryKey() });
                setSnackbar({ open: true, message: 'Móvil eliminado correctamente', severity: 'success' });
                setDeleteConfirmOpen(false);
                setMovilToDelete(null);
            } catch (error) {
                console.error("Failed to delete", error);
                setSnackbar({ open: true, message: 'Error al eliminar móvil', severity: 'error' });
            }
        }
    };

    const handleSave = async (data: any) => {
        try {
            if (selectedMovil) {
                await updateMutation.mutateAsync({ id: selectedMovil.movil_id, data });
                setSnackbar({ open: true, message: 'Móvil actualizado correctamente', severity: 'success' });
            } else {
                await createMutation.mutateAsync({ data });
                setSnackbar({ open: true, message: 'Móvil creado correctamente', severity: 'success' });
            }
            await queryClient.invalidateQueries({ queryKey: getMovilesQueryKey() });
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save", error);
            // Error handling managed in Modal
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        createMutation.reset();
        updateMutation.reset();
    };

    const getConductorName = (id: number | null | undefined) => {
        if (!id) return null;
        const conductor = conductors.find(c => c.id === id);
        return conductor ? conductor.name : 'Desconocido';
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
                const color = params.value === 'OPERATIVO' ? 'success' : params.value === 'EN MANTENCION' || params.value === 'EN_TALLER' ? 'warning' : 'error';
                return <Chip label={params.value} color={color} size="small" variant="outlined" />;
            }
        },
        {
            field: 'conductor_id',
            headerName: 'Conductor Asignado',
            flex: 1,
            valueGetter: (_, row) => row.conductor_id,
            renderCell: (params) => {
                const name = getConductorName(params.value);
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', width: '100%' }}>
                        {name ? (
                            <Typography variant="body2">{name}</Typography>
                        ) : (
                            <Typography variant="body2" color="text.secondary" fontStyle="italic">Sin Conductor</Typography>
                        )}
                    </Box>
                );
            }
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
                            onClick={() => handleOpenEdit(params.row as MovilDTO)}
                            size="small"
                            sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.primary.main } }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton
                            onClick={() => handleDeleteClick((params.row as MovilDTO).movil_id)}
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
                    Móviles
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
                    Nuevo Móvil
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
                        placeholder="Buscar por patente, código o tipo..."
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
                    rows={filteredMoviles}
                    columns={columns}
                    getRowId={(row) => row.movil_id}
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

            <MovilModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSave}
                initialData={selectedMovil}
                isLoading={createMutation.isPending || updateMutation.isPending}
                error={(createMutation.error || updateMutation.error) as Error | null}
                conductorsList={conductors}
            />

            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                PaperProps={{
                    sx: { bgcolor: theme.palette.background.paper }
                }}
            >
                <DialogTitle sx={{ color: theme.palette.text.primary }}>
                    ¿Está seguro que desea eliminar este móvil?
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
