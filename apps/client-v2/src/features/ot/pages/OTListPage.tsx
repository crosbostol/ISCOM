import React, { useState, useMemo, useCallback } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import { Alert, Snackbar, Box, Typography, CircularProgress, Button, Stack, Backdrop, Paper, alpha, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PostAddIcon from '@mui/icons-material/PostAdd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import { useGetOttable } from '../../../api/generated/hooks/useGetOttable';
import { usePutOtId } from '../../../api/generated/hooks/usePutOtId';
import { useDeleteOtId } from '../../../api/generated/hooks/useDeleteOtId';
import { useGetMoviles } from '../../../api/generated/hooks/useGetMoviles';
import { useGetConductors } from '../../../api/generated/hooks/useGetConductors';
import { useQueryClient } from '@tanstack/react-query';

import { UploadOTs } from '../components/UploadOTs';
import { OTFormModal } from '../components/OTFormModal';
import { OTFilterBar } from '../components/OTFilterBar';
import { getColumns } from '../components/OTTableColumns';
import { getDaysDiff } from '../utils/otStatusUtils';

import type { OrdenTrabajoDTO } from '../../../api/generated/models/OrdenTrabajoDTO';
import type { MovilDTO } from '../../../api/generated/models/MovilDTO';
import type { Conductor } from '../../../api/generated/models/Conductor';

dayjs.extend(isBetween);

export const OTListPage: React.FC = () => {
    // -- State --
    const [uploadOpen, setUploadOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOtId, setSelectedOtId] = useState<number | null>(null);
    const [droppedFile, setDroppedFile] = useState<File | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [otToDelete, setOtToDelete] = useState<OrdenTrabajoDTO | null>(null);

    // Filters
    const [searchText, setSearchText] = useState('');
    const [filterDateStart, setFilterDateStart] = useState<dayjs.Dayjs | null>(null);
    const [filterDateEnd, setFilterDateEnd] = useState<dayjs.Dayjs | null>(null);

    // Feedback
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
        open: false, message: '', severity: 'success'
    });

    const handleNotify = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
        setSnackbar({ open: true, message, severity });
    };

    // -- Data --
    const queryClient = useQueryClient();
    const { data: ots, isLoading: isLoadingOts, isError, error } = useGetOttable();
    const { data: moviles = [], isLoading: isLoadingMoviles } = useGetMoviles();
    const { data: conductors = [], isLoading: isLoadingConductors } = useGetConductors();

    const { mutateAsync: updateOt } = usePutOtId();
    const { mutateAsync: deleteOt, isPending: isDeleting } = useDeleteOtId();

    const isLoading = isLoadingOts || isLoadingMoviles || isLoadingConductors;

    // -- Lookups --
    const movilesMap = useMemo(() => {
        const map = new Map<string, MovilDTO>();
        if (moviles) {
            moviles.forEach(m => {
                if (m.movil_id) map.set(m.movil_id, m);
            });
        }
        return map;
    }, [moviles]);

    const conductorsMap = useMemo(() => {
        const map = new Map<number, Conductor>();
        if (conductors) {
            conductors.forEach(c => {
                if (c.id) map.set(c.id, c);
            });
        }
        return map;
    }, [conductors]);

    // TODO: Implement server-side filtering for performance scalability
    const filteredOts = useMemo(() => {
        if (!ots) return [];
        return ots.filter((ot) => {
            // 1. Data Sanitization (Integrity Check)
            const hasIdentity = ot.id || ot.external_ot_id || (ot.street && ot.number_street && ot.started_at);
            if (!hasIdentity) return false; // Filter out garbage data to protect DataGrid

            // 2. Search Logic
            const searchLower = searchText.toLowerCase();
            const matchesText = !searchText || (
                (ot.external_ot_id?.toLowerCase() || '').includes(searchLower) ||
                (ot.street?.toLowerCase() || '').includes(searchLower) ||
                (ot.commune?.toLowerCase() || '').includes(searchLower) ||
                (ot.ot_state?.toLowerCase() || '').includes(searchLower) ||
                (String(ot.id).includes(searchLower))
            );

            if (!matchesText) return false;

            // 3. Date Logic
            if (!filterDateStart && !filterDateEnd) return true;
            if (!ot.started_at) return false;
            const otDate = dayjs(ot.started_at);
            const start = filterDateStart ? filterDateStart.startOf('day') : null;
            const end = filterDateEnd ? filterDateEnd.endOf('day') : dayjs().endOf('day');

            if (start && otDate.isBefore(start)) return false;
            if (otDate.isAfter(end)) return false;

            return true;
        });
    }, [ots, searchText, filterDateStart, filterDateEnd]);

    // -- Update logic --
    const processRowUpdate = async (newRow: OrdenTrabajoDTO, oldRow: OrdenTrabajoDTO) => {
        try {
            if (newRow.external_ot_id !== oldRow.external_ot_id || newRow.street !== oldRow.street ||
                newRow.number_street !== oldRow.number_street || newRow.commune !== oldRow.commune) {
                await updateOt({ id: newRow.id!, data: newRow as any });
            }
            return newRow;
        } catch (error) {
            handleNotify('Error al actualizar OT (Rollback)', 'error');
            throw error; // Essential for DataGrid to revert UI to oldRow
        }
    };

    // -- Delete logic --
    const handleDeleteClick = (ot: OrdenTrabajoDTO) => {
        setOtToDelete(ot);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!otToDelete?.id) return;

        try {
            await deleteOt({ id: otToDelete.id });
            handleNotify(`OT #${otToDelete.external_ot_id || otToDelete.id} eliminada correctamente`, 'success');
            queryClient.invalidateQueries({ queryKey: ['ottable'] });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || 'Error al eliminar OT';
            handleNotify(errorMessage, 'error');
        } finally {
            setDeleteDialogOpen(false);
            setOtToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setOtToDelete(null);
    };

    // -- Dropzone --
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) { setDroppedFile(file); setUploadOpen(true); }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { 'text/csv': ['.csv'] }, noClick: true, noKeyboard: true,
        onDropRejected: () => handleNotify('Solo archivos CSV', 'error')
    });

    const columns: GridColDef<OrdenTrabajoDTO>[] = useMemo(() => getColumns(
        (ot) => {
            setSelectedOtId(ot.id!);
            setModalOpen(true);
        },
        handleDeleteClick,
        movilesMap,
        conductorsMap
    ), [movilesMap, conductorsMap]);

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;

    return (
        <Box {...getRootProps()} sx={{ position: 'relative', height: '100%', outline: 'none', display: 'flex', flexDirection: 'column' }}>
            <input {...getInputProps()} />

            <UploadOTs open={uploadOpen} onClose={() => { setUploadOpen(false); setDroppedFile(null); }} initialFile={droppedFile} />
            <OTFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                otId={selectedOtId}
                onNotify={handleNotify}
                movilesList={moviles}
            />

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>

            <Snackbar open={isError} autoHideDuration={6000}>
                <Alert severity="error" sx={{ width: '100%' }}>Error al cargar OTs: {(error as Error)?.message || 'Unknown error'}</Alert>
            </Snackbar>

            {/* HEADER */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">Órdenes de Trabajo</Typography>
                <Button variant="contained" onClick={() => { setSelectedOtId(null); setModalOpen(true); }} startIcon={<PostAddIcon />} sx={{ bgcolor: 'theme.palette.primary.main', '&:hover': { bgcolor: 'theme.palette.primary.dark' } }}>
                    Nueva OT
                </Button>
            </Stack>

            {/* FILTER BAR */}
            <OTFilterBar
                searchText={searchText} onSearchChange={setSearchText}
                startDate={filterDateStart} endDate={filterDateEnd}
                onDateRangeChange={(s, e) => { setFilterDateStart(s); setFilterDateEnd(e); }}
                onUploadClick={() => setUploadOpen(true)}
            />

            {/* DATA TABLE */}
            <Paper sx={{ flexGrow: 1, width: '100%', borderRadius: 2, boxShadow: 1, overflow: 'hidden', bgcolor: 'background.paper' }}>
                <DataGrid
                    rows={filteredOts} columns={columns} localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    processRowUpdate={processRowUpdate}
                    onProcessRowUpdateError={(error) => console.error(error)} // Suppress console noise on revert
                    loading={isLoading}
                    getRowId={(row) => {
                        if (row.id) return row.id;
                        if (row.external_ot_id) return row.external_ot_id;
                        // Deterministic fallback for rows with missing ID but valid data
                        return `${row.street}-${row.number_street}-${row.started_at}`;
                    }}
                    initialState={{ pagination: { paginationModel: { pageSize: 15, page: 0 } } }}
                    pageSizeOptions={[15, 25, 50]} disableRowSelectionOnClick
                    getRowClassName={(params) => {
                        const days = getDaysDiff(params.row.started_at);
                        if (params.row.ot_state === 'PENDIENTE_OC' && days >= 3) return 'row-delayed';
                        return '';
                    }}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': { bgcolor: (theme) => theme.palette.action.hover, color: 'text.primary' },
                        '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
                        '& .row-delayed': {
                            bgcolor: (theme) => theme.palette.mode === 'light' ? '#FFEBEE' : 'rgba(211, 47, 47, 0.2)',
                            '&:hover': { bgcolor: (theme) => theme.palette.mode === 'light' ? '#FFCDD2' : 'rgba(211, 47, 47, 0.3)' }
                        },
                    }}
                />
            </Paper>

            {/* DELETE CONFIRMATION DIALOG */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                aria-labelledby="delete-dialog-title"
            >
                <DialogTitle id="delete-dialog-title">¿Confirmar eliminación?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Estás seguro de eliminar la OT <strong>#{otToDelete?.external_ot_id || otToDelete?.id}</strong>?
                        <br />
                        Se borrarán también sus ítems asociados.
                        <br />
                        <Typography component="span" color="error" fontWeight="bold">
                            Esta acción es irreversible.
                        </Typography>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} disabled={isDeleting}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                        autoFocus
                    >
                        {isDeleting ? 'Eliminando...' : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* DROP OVERLAY */}
            {isDragActive && (
                <Backdrop open={true} sx={{ position: 'absolute', zIndex: 10, bgcolor: (theme) => alpha(theme.palette.background.default, 0.9), border: '3px dashed', borderColor: 'primary.main', borderRadius: 2, display: 'flex', flexDirection: 'column', color: 'primary.main' }}>
                    <CloudUploadIcon sx={{ fontSize: 80, mb: 2 }} />
                    <Typography variant="h4" fontWeight="bold">Suelta el CSV aquí</Typography>
                </Backdrop>
            )}
        </Box>
    );
};
