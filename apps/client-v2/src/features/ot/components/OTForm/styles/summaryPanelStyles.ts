import { alpha } from '@mui/material/styles';

/**
 * Theme-aware style constants for OT Summary HUD Panel
 * Implements cyber-engineering aesthetic with glassmorphism
 */
export const getSummaryPanelStyles = (theme: any) => ({
    // Sticky HUD Panel Container
    hudPanel: {
        position: 'sticky' as const,
        top: 24,
        p: 3,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(12px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        boxShadow: `0 0 24px ${alpha(theme.palette.primary.main, 0.15)}`,
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
            boxShadow: `0 0 32px ${alpha(theme.palette.primary.main, 0.25)}`,
        },
    },

    // Subtotal Line Item
    subtotalItem: {
        display: 'flex',
        justifyContent: 'space-between',
        py: 0.75,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    },

    // Grand Total Typography
    grandTotal: {
        fontFamily: 'monospace',
        fontSize: '2rem',
        fontWeight: 900,
        color: theme.palette.primary.main,
        textShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.4)}`,
        letterSpacing: '0.05em',
    },

    // Resource Card (Left column)
    resourceCard: {
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: 2,
        bgcolor: 'background.paper',
        transition: 'box-shadow 0.2s',
        '&:hover': {
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
    },
});
