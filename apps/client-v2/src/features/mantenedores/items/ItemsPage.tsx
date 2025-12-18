import React, { useState } from 'react';
import { Box, Button, Typography, IconButton, Paper, Tooltip, Dialog, DialogTitle, DialogActions, Stack, InputBase } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ItemModal } from './ItemModal';
import { useItems, useCreateItem, useUpdateItem, useDeleteItem } from '../../../hooks/useItems';
import type { Item } from '../../../hooks/useItems';

export const ItemsPage: React.FC = () => {
    const { data: items = [], isLoading } = useItems();
    const createMutation = useCreateItem();
    const updateMutation = useUpdateItem();
    const deleteMutation = useDeleteItem();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = items.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenCreate = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: Item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setItemToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (itemToDelete !== null) {
            try {
                await deleteMutation.mutateAsync(itemToDelete);
                setDeleteConfirmOpen(false);
                setItemToDelete(null);
            } catch (error) {
                console.error("Failed to delete", error);
            }
        }
    };

    const handleSave = async (data: any) => {
        try {
            if (selectedItem) {
                await updateMutation.mutateAsync({ id: selectedItem.item_id, data });
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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
    };

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
                        <IconButton onClick={() => handleOpenEdit(params.row as Item)} size="small">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <IconButton onClick={() => handleDeleteClick((params.row as Item).item_id)} size="small" color="error">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* HEADER: Igualamos a la vista de OTs */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">
                    Catálogo de Servicios (Items)
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ bgcolor: '#009688', '&:hover': { bgcolor: '#00796B' }, textTransform: 'none' }}
                >
                    Nuevo Item
                </Button>
            </Stack>

            {/* FILTRO / BUSCADOR: Esto es lo que le da "cuerpo" a la página */}
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
                        placeholder="Buscar item por descripción..."
                        sx={{ ml: 1, flex: 1 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Box>
                {/* Puedes añadir un selector de "Tipo" aquí para rellenar más */}
            </Paper>

            {/* TABLA: Usamos el mismo estilo de Paper que OTs */}
            <Paper sx={{
                flexGrow: 1,
                width: '100%',
                borderRadius: 2,
                boxShadow: 1,
                overflow: 'hidden',
                bgcolor: 'background.paper'
            }}>
                <DataGrid
                    rows={filteredItems}
                    columns={columns}
                    getRowId={(row) => row.item_id}
                    loading={isLoading}
                    disableRowSelectionOnClick
                    density="compact" // O "standard" para que no se vea tan vacío
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
            >
                <DialogTitle>¿Está seguro que desea eliminar este item?</DialogTitle>
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
