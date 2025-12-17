import React, { useState } from 'react';
import { Box, Button, Typography, IconButton, Paper, Tooltip, Dialog, DialogTitle, DialogActions } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Catálogo de Servicios (Items)
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ bgcolor: '#009688', '&:hover': { bgcolor: '#00796B' } }}
                >
                    Nuevo Item
                </Button>
            </Box>

            <Paper sx={{ flexGrow: 1, p: 0, overflow: 'hidden' }}>
                <DataGrid
                    rows={items}
                    columns={columns}
                    getRowId={(row) => row.item_id}
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
