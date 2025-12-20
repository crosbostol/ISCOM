import React from 'react';
import { Box, Typography, Divider, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { getSummaryPanelStyles } from './styles/summaryPanelStyles';

interface Subtotal {
    label: string;
    amount: number;
}

interface OTSummaryHUDProps {
    subtotals: Subtotal[];
    grandTotal: number;
    formatCurrency: (value: number) => string;
}

/**
 * Sticky HUD Panel for OT Summary
 * Displays financial breakdown with cyber-engineering aesthetic
 */
export const OTSummaryHUD: React.FC<OTSummaryHUDProps> = ({
    subtotals,
    grandTotal,
    formatCurrency
}) => {
    const theme = useTheme();
    const styles = getSummaryPanelStyles(theme);

    return (
        <Box sx={styles.hudPanel}>
            {/* Header */}
            <Typography variant="h6" gutterBottom fontWeight={700}>
                Resumen Financiero
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Subtotals Breakdown */}
            <Stack spacing={1}>
                {subtotals
                    .filter(sub => sub.amount > 0) // Only show non-zero subtotals
                    .map((sub, idx) => (
                        <Box key={idx} sx={styles.subtotalItem}>
                            <Typography variant="body2" color="text.secondary">
                                {sub.label}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(sub.amount)}
                            </Typography>
                        </Box>
                    ))}
            </Stack>

            <Divider sx={{ my: 3 }} />

            {/* Grand Total with Glow Effect */}
            <Box textAlign="center">
                <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={1}
                    sx={{ letterSpacing: '0.1em' }}
                >
                    TOTAL GENERAL
                </Typography>
                <Typography sx={styles.grandTotal}>
                    {formatCurrency(grandTotal)}
                </Typography>
            </Box>
        </Box>
    );
};
