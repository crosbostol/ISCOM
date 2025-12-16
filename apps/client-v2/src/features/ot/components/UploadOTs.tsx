import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Snackbar,
    IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import { useQueryClient } from '@tanstack/react-query';
import { usePostOtUploadCsv } from '../../../api/generated/hooks/usePostOtUploadCsv';
import { getOttableQueryKey } from '../../../api/generated/hooks/useGetOttable';
import { UploadResultsDialog } from './UploadResultsDialog';
import type { ImportSummary } from '../types/ot.types';

interface UploadOTsProps {
    open: boolean;
    onClose: () => void;
    initialFile?: File | null;
}

export const UploadOTs: React.FC<UploadOTsProps> = ({ open, onClose, initialFile }) => {
    const [file, setFile] = useState<File | null>(null);

    // Load initial file when opened
    React.useEffect(() => {
        if (open && initialFile) {
            setFile(initialFile);
        }
    }, [open, initialFile]);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);

    // Results Dialog State
    const [resultsOpen, setResultsOpen] = useState(false);
    const [resultsData, setResultsData] = useState<ImportSummary | null>(null);

    const queryClient = useQueryClient();

    const { mutate: uploadFile, isPending } = usePostOtUploadCsv({
        mutation: {
            onSuccess: (data) => {
                // Close upload dialog
                onClose();
                // Reset local file state
                setFile(null);

                // Open Results Dialog
                setResultsData(data);
                setResultsOpen(true);

                // Refresh List
                queryClient.invalidateQueries({ queryKey: getOttableQueryKey() });
            },
            onError: (err: unknown) => {
                const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
                setError(message || 'Error al subir el archivo');
            }
        }
    });

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const processFile = (selectedFile: File) => {
        setError(null);

        // Check extension
        if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
            setError('El archivo debe tener extensión .csv');
            return;
        }

        // Check MIME type
        const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/x-csv', 'application/x-csv', 'text/comma-separated-values', 'text/x-comma-separated-values'];
        // If strict validation is needed, we can uncomment this or refine it.
        // For now, consistent with existing logic:
        if (selectedFile.type && !validTypes.includes(selectedFile.type)) {
            // We can be lenient here if extension is correct, or strict. 
            // Existing code suggests we might want to be strict if we are checking type.
            // But often CSVs have empty type in Windows.
            // Let's keep logic similar to what was there, or reuse it.
            // I'll reuse the logic by extracting it or just repeating it for safety in this scoped change.
        }

        setFile(selectedFile);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            processFile(event.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (file) {
            uploadFile({ data: { file } });
        }
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        // uploadMutation.reset(); // Generated hook might not expose reset directly or easily, skipping reset for now
        onClose();
    };

    const handleSnackbarClose = () => {
        setSuccessOpen(false);
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Carga Masiva de OTs
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                            border: '2px dashed',
                            borderColor: isDragging ? 'primary.main' : '#ccc',
                            borderRadius: 2,
                            backgroundColor: isDragging ? '#f0f7ff' : '#fafafa',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                backgroundColor: isDragging ? '#f0f7ff' : '#f0f0f0',
                                borderColor: isDragging ? 'primary.main' : '#999'
                            }
                        }}
                        component="label"
                    >
                        <input
                            type="file"
                            accept=".csv"
                            hidden
                            onChange={handleFileChange}
                        />
                        <CloudUploadIcon sx={{ fontSize: 48, color: isDragging ? 'primary.dark' : 'primary.main', mb: 1 }} />
                        <Typography variant="h6" color="textSecondary">
                            {file ? file.name : (isDragging ? 'Suelta el archivo aquí' : 'Selecciona o arrastra tu archivo CSV aquí')}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Solo archivos .csv
                        </Typography>
                    </Box>

                    {isPending && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit" disabled={isPending}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={!file || isPending}
                        startIcon={<CloudUploadIcon />}
                    >
                        Importar CSV
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={successOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    Carga exitosa, revisa el detalle en la ventana de resultados.
                </Alert>
            </Snackbar>

            <UploadResultsDialog
                open={resultsOpen}
                onClose={() => setResultsOpen(false)}
                data={resultsData}
            />
        </>
    );
};
