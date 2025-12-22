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
import { useQueryClient } from '@tanstack/react-query';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Components & Utils
import { ItemModal } from '../components/ItemModal';

// Generated Kubb Hooks & Types
import { useGetItems, getItemsQueryKey } from '../../../api/generated/hooks/useGetItems';
import { usePostItems } from '../../../api/generated/hooks/usePostItems';
import { usePutItemsId } from '../../../api/generated/hooks/usePutItemsId';
import { useDeleteItemsId } from '../../../api/generated/hooks/useDeleteItemsId';
import type { ItemDTO } from '../../../api/generated/models/ItemDTO';

export const ItemsPage: React.FC = () => {
    const theme = useTheme();
    const queryClient = useQueryClient();

    // Hooks
    const { data: items = [], isLoading } = useGetItems();
    const createMutation = usePostItems();
    const updateMutation = usePutItemsId();
    const deleteMutation = useDeleteItemsId();

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ItemDTO | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Derived State
    const filteredItems = items.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handlers
    const handleOpenCreate = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: ItemDTO) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setItemToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const handleConfirmDelete = async () => {
        if (itemToDelete !== null) {
            try {
                await deleteMutation.mutateAsync({ id: itemToDelete });
                await queryClient.invalidateQueries({ queryKey: getItemsQueryKey() });
                setSnackbar({ open: true, message: 'Item eliminado correctamente', severity: 'success' });
                setDeleteConfirmOpen(false);
                setItemToDelete(null);
            } catch (error) {
                console.error("Failed to delete", error);
                setSnackbar({ open: true, message: 'Error al eliminar item', severity: 'error' });
            }
        }
    };

    const handleSave = async (data: any) => {
        try {
            if (selectedItem) {
                await updateMutation.mutateAsync({ id: selectedItem.item_id, data });
                setSnackbar({ open: true, message: 'Item actualizado correctamente', severity: 'success' });
            } else {
                await createMutation.mutateAsync({ data });
                setSnackbar({ open: true, message: 'Item creado correctamente', severity: 'success' });
            }
            await queryClient.invalidateQueries({ queryKey: getItemsQueryKey() });
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
    };

    // Columns
    const columns: GridColDef[] = [
        { field: 'item_id', headerName: 'Código', width: 120 },
        { field: 'description', headerName: 'Descripción', flex: 2 },
        { field: 'item_type', headerName: 'Tipo', width: 150 },
        {
            field: 'item_value',
            headerName: 'Valor Unitario',
            width: 150,
            type: 'number',
            valueFormatter: (value: number | null) => {
                if (value == null) return '';
                return formatCurrency(value);
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
                            onClick={() => handleOpenEdit(params.row as ItemDTO)}
                            size="small"
                            sx={{ color: theme.palette.text.secondary, '&:hover': { color: theme.palette.primary.main } }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton
                            onClick={() => handleDeleteClick((params.row as ItemDTO).item_id)}
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
                    Catálogo de Servicios (Items)
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
                    Nuevo Item
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
                        placeholder="Buscar item por descripción..."
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
                    rows={filteredItems}
                    columns={columns}
                    getRowId={(row) => row.item_id}
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

            <ItemModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSave}
                initialData={selectedItem}
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
                    ¿Está seguro que desea eliminar este item?
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
