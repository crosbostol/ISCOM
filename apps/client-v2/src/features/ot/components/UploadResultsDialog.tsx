import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Paper,
    Typography,
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SyncIcon from '@mui/icons-material/Sync';
import type { ImportSummary } from '../types/ot.types';

interface UploadResultsDialogProps {
    open: boolean;
    onClose: () => void;
    data: ImportSummary | null;
}

export const UploadResultsDialog: React.FC<UploadResultsDialogProps> = ({ open, onClose, data }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (!data) return null;

    const { summary, db_operations } = data;
    const { total_rows_processed, breakdown_by_type } = summary;
    const { created, updated } = db_operations;
    const totalProcessed = summary.unique_ots_found;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={isMobile}
            maxWidth="md"
            fullWidth={!isMobile}
        >
            <DialogTitle sx={{ bgcolor: '#1F6EB1', color: 'white', textAlign: 'center', mb: 0 }}>
                Resultados de Importación
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {/* Header Summary */}
                <Paper
                    elevation={0}
                    sx={{
                        bgcolor: '#A8DAED',
                        color: '#0D4A73',
                        p: 2,
                        mb: 4,
                        mt: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        borderRadius: 2
                    }}
                >
                    <InfoOutlinedIcon />
                    <Typography variant="body1" fontWeight="bold">
                        Procesamiento completado: Se analizaron {total_rows_processed} registros del archivo CSV.
                    </Typography>
                </Paper>

                <Grid container spacing={3}>
                    {/* Card 1: Unique OTs */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                bgcolor: '#F2FAFC',
                                border: '1px solid #E8F6FA',
                                borderRadius: 2,
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 12px 24px -10px rgba(31, 110, 177, 0.2)',
                                    borderColor: '#6ABCE5'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <ListAltIcon color="primary" />
                                <Typography variant="h6" color="textSecondary">
                                    Total OTs Únicas
                                </Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#1F6EB1', my: 1 }}>
                                {totalProcessed}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Detectadas {breakdown_by_type.normal} Normales, {breakdown_by_type.additional} Adicionales
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Card 2: Created (New) */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                bgcolor: '#F2FAFC',
                                border: created > 0 ? '2px solid #6ABCE5' : '1px solid #E8F6FA',
                                borderRadius: 2,
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 12px 24px -10px rgba(31, 110, 177, 0.2)',
                                    borderColor: '#6ABCE5'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AutoAwesomeIcon sx={{ color: '#E9C46A' }} />
                                <Typography variant="h6" color="textSecondary">
                                    Nuevas OTs
                                </Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#1F6EB1', my: 1 }}>
                                {created}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Ingresadas exitosamente a la BD
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Card 3: Updated */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                bgcolor: '#F2FAFC',
                                border: '1px solid #E8F6FA',
                                borderRadius: 2,
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 12px 24px -10px rgba(31, 110, 177, 0.2)',
                                    borderColor: '#6ABCE5'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <SyncIcon color="primary" />
                                <Typography variant="h6" color="textSecondary">
                                    OTs Actualizadas
                                </Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#1F6EB1', my: 1 }}>
                                {updated}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                Verificadas y enriquecidas
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {data.errors && data.errors.length > 0 && (
                    <Box sx={{ mt: 4, p: 2, bgcolor: '#fff5f5', borderRadius: 2, border: '1px solid #ffcdd2' }}>
                        <Typography variant="subtitle1" color="error" gutterBottom fontWeight="bold">
                            ⚠️ Errores ({data.errors.length})
                        </Typography>
                        <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                            {data.errors.map((err: any, i: number) => (
                                <Typography key={i} variant="body2" color="error" sx={{ mb: 0.5 }}>
                                    • {err.reason || JSON.stringify(err)}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                )}

            </DialogContent>

            <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        bgcolor: '#6ABCE5',
                        color: 'white',
                        px: 4,
                        py: 1,
                        fontSize: '1rem',
                        '&:hover': {
                            bgcolor: '#59a5c9'
                        }
                    }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};
