import React from 'react';
import { Box, Typography, Stack, Chip, Tooltip } from '@mui/material';
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import { useTheme } from '@mui/material/styles';
import type { OTFormValues } from '../../schemas/otSchema';
import type { MovilDTO } from '../../../../api/generated/models/MovilDTO';
import type { Conductor } from '../../../../api/generated/models/Conductor';
import { OTSummaryHUD } from './OTSummaryHUD';
import { getSummaryPanelStyles } from './styles/summaryPanelStyles';

// Helper
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

interface OTSummaryProps {
    formValues: OTFormValues;
    itemsList: any[];
    movilesList: MovilDTO[];
    conductoresList: Conductor[];
}

export const OTSummary: React.FC<OTSummaryProps> = ({
    formValues,
    itemsList,
    movilesList,
    conductoresList
}) => {
    const theme = useTheme();
    const styles = getSummaryPanelStyles(theme);

    // Helper to calculate total for a set of items
    const calculateResourceTotal = (itemsForResource: any[]) => {
        return itemsForResource.reduce((sum, i) => {
            const item = itemsList?.find(cat => Number(cat.item_id) === Number(i.item_id));
            const qty = typeof i.quantity === 'number' ? i.quantity : parseFloat(String(i.quantity).replace(',', '.'));
            return sum + ((item?.item_value || 0) * (qty || 0));
        }, 0);
    };

    const renderSummaryCard = (title: string, movilId: string | null | undefined, date: any, itemsForMovil: any[]) => {
        if (!movilId && itemsForMovil.length === 0) return null;

        const movil = movilesList?.find(m => m.movil_id === movilId);
        const conductor = movil?.conductor_id ? conductoresList?.find(c => c.id === movil.conductor_id) : undefined;
        const totalValue = calculateResourceTotal(itemsForMovil);

        return (
            <Box sx={styles.resourceCard}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>{title}</Typography>

                {movilId && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Móvil:</Typography>
                        <Chip label={movilId} size="small" color="primary" />
                        {conductor && (
                            <Tooltip title={`RUT: ${conductor.rut}`}>
                                <Chip label={conductor.name} size="small" variant="outlined" />
                            </Tooltip>
                        )}
                    </Stack>
                )}

                {date && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Fecha: {dayjs(date).format('DD-MM-YYYY')}
                    </Typography>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Items: {itemsForMovil.length}
                </Typography>

                <Typography variant="h6" color="primary.main" fontWeight="bold">
                    Total: {formatCurrency(totalValue)}
                </Typography>

                {itemsForMovil.length > 0 && (
                    <Box sx={{ mt: 2, maxHeight: '200px', overflowY: 'auto' }}>
                        {itemsForMovil.map((i, idx) => {
                            const item = itemsList?.find(cat => Number(cat.item_id) === Number(i.item_id));
                            const qty = typeof i.quantity === 'number' ? i.quantity : parseFloat(String(i.quantity).replace(',', '.'));

                            return (
                                <Box
                                    key={idx}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 1,
                                        py: 0.5
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            flex: '1 1 auto',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            minWidth: 0, // Important for text truncation in flex
                                        }}
                                    >
                                        {item?.description || `ID: ${i.item_id}`}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        fontWeight="medium"
                                        sx={{
                                            flexShrink: 0, // Never shrink the price
                                            whiteSpace: 'nowrap', // Keep on one line
                                        }}
                                    >
                                        {qty} × {formatCurrency(item?.item_value || 0)}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>
        );
    };

    // Filter items by assigned movil
    const hydraulicItems = formValues.items?.filter(i =>
        i.assigned_movil_id === formValues.hydraulic_movil_id
    ) || [];

    const civilItems = formValues.items?.filter(i =>
        i.assigned_movil_id === formValues.civil_movil_id
    ) || [];

    const debrisItems = formValues.items?.filter(i =>
        i.assigned_movil_id === formValues.debris_movil_id
    ) || [];

    // Legacy items without assignment
    const unassignedItems = formValues.items?.filter(i => !i.assigned_movil_id) || [];

    // Calculate totals
    const hydraulicTotal = calculateResourceTotal(hydraulicItems);
    const civilTotal = calculateResourceTotal(civilItems);
    const debrisTotal = calculateResourceTotal(debrisItems);
    const unassignedTotal = calculateResourceTotal(unassignedItems);
    const grandTotal = hydraulicTotal + civilTotal + debrisTotal + unassignedTotal;

    // Build subtotals array for HUD
    const subtotals = [
        { label: 'Recurso Hidráulico', amount: hydraulicTotal },
        { label: 'Recurso Civil', amount: civilTotal },
        { label: 'Cierre/Retiro', amount: debrisTotal },
        ...(unassignedTotal > 0 ? [{ label: 'Items Sin Asignar', amount: unassignedTotal }] : []),
    ];

    return (
        <Grid container spacing={3}>
            {/* LEFT COLUMN: Resource Breakdown (Scrollable) */}
            <Grid size={{ xs: 12, lg: 8 }}>
                <Typography variant="h6" gutterBottom>Detalle de Recursos</Typography>

                {/* Basic Info */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">Folio OT:</Typography>
                        <Typography variant="body1" fontWeight="medium">{formValues.external_ot_id || 'N/A'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">Dirección:</Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {formValues.street} {formValues.number_street}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="body2" color="text.secondary">Comuna:</Typography>
                        <Typography variant="body1" fontWeight="medium">{formValues.commune}</Typography>
                    </Grid>
                </Grid>

                {/* Resource Cards in Stack */}
                <Stack spacing={2}>
                    {formValues.hydraulic_movil_id && renderSummaryCard('Recurso Hidráulico', formValues.hydraulic_movil_id, formValues.started_at, hydraulicItems)}
                    {formValues.civil_movil_id && renderSummaryCard('Recurso Civil', formValues.civil_movil_id, formValues.civil_work_at, civilItems)}
                    {formValues.debris_movil_id && renderSummaryCard('Cierre/Retiro', formValues.debris_movil_id, formValues.finished_at, debrisItems)}
                    {unassignedItems.length > 0 && renderSummaryCard('Items Sin Asignar (Legacy)', null, null, unassignedItems)}
                </Stack>
            </Grid>

            {/* RIGHT COLUMN: Sticky HUD Panel */}
            <Grid size={{ xs: 12, lg: 4 }}>
                <OTSummaryHUD
                    subtotals={subtotals}
                    grandTotal={grandTotal}
                    formatCurrency={formatCurrency}
                />
            </Grid>
        </Grid>
    );
};
