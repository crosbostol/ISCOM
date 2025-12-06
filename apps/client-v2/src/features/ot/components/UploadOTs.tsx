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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadOTsCsv } from '../api/otService';

interface UploadOTsProps {
    open: boolean;
    onClose: () => void;
}

export const UploadOTs: React.FC<UploadOTsProps> = ({ open, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successOpen, setSuccessOpen] = useState(false);

    const queryClient = useQueryClient();

    const uploadMutation = useMutation({
        mutationFn: uploadOTsCsv,
        onSuccess: () => {
            setSuccessOpen(true);
            queryClient.invalidateQueries({ queryKey: ['ots'] });
            handleClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Error al subir el archivo');
        }
    });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0];

            // Check extension
            if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
                setError('El archivo debe tener extensión .csv');
                return;
            }

            // Check MIME type
            const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/x-csv', 'application/x-csv', 'text/comma-separated-values', 'text/x-comma-separated-values'];
            if (!validTypes.includes(selectedFile.type)) {
                // Some OS/Browsers might report empty type or specific weird ones, relying on extension is safer but MIME is good to have.
                // If strictly "accept=.csv" is used in input, the browser prevents selection mostly.
                // We'll log a warning but if extension is good we might allow it if type is empty? 
                // Let's stick to the prompt requirement: "Validación de Archivo... MIME type".
                // If type is empty (common in some systems), we rely on extension.
                if (selectedFile.type && !validTypes.includes(selectedFile.type)) {
                    setError(`Tipo de archivo no válido: ${selectedFile.type}. Se espera CSV.`);
                    return;
                }
            }

            setFile(selectedFile);
        }
    };

    const handleUpload = () => {
        if (file) {
            uploadMutation.mutate(file);
        }
    };

    const handleClose = () => {
        setFile(null);
        setError(null);
        uploadMutation.reset();
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
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                            border: '2px dashed #ccc',
                            borderRadius: 2,
                            backgroundColor: '#fafafa',
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: '#f0f0f0'
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
                        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6" color="textSecondary">
                            {file ? file.name : 'Selecciona o arrastra tu archivo CSV aquí'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Solo archivos .csv
                        </Typography>
                    </Box>

                    {uploadMutation.isPending && (
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
                    <Button onClick={handleClose} color="inherit" disabled={uploadMutation.isPending}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={!file || uploadMutation.isPending}
                        startIcon={<CloudUploadIcon />}
                    >
                        Importar CSV
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={successOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    Carga exitosa
                </Alert>
            </Snackbar>
        </>
    );
};
