import React from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { PayrollTable } from '../components/PayrollTable';
import { PayrollCardList } from '../components/PayrollCardList';

export const PayrollDashboard: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
                Remuneraciones
            </Typography>

            {isMobile ? <PayrollCardList /> : <PayrollTable />}
        </Box>
    );
};
