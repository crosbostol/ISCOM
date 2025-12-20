import React, { useState } from 'react';
import { Box, Paper, InputBase, Button, Popover, Typography, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface OTFilterBarProps {
    searchText: string;
    onSearchChange: (text: string) => void;
    startDate: dayjs.Dayjs | null;
    endDate: dayjs.Dayjs | null;
    onDateRangeChange: (start: dayjs.Dayjs | null, end: dayjs.Dayjs | null) => void;
    onUploadClick: () => void;
}

export const OTFilterBar: React.FC<OTFilterBarProps> = ({
    searchText,
    onSearchChange,
    startDate,
    endDate,
    onDateRangeChange,
    onUploadClick
}) => {
    const [dateAnchorEl, setDateAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [tempStart, setTempStart] = useState<dayjs.Dayjs | null>(startDate);
    const [tempEnd, setTempEnd] = useState<dayjs.Dayjs | null>(endDate);

    const handleOpenDate = (event: React.MouseEvent<HTMLButtonElement>) => {
        setTempStart(startDate);
        setTempEnd(endDate);
        setDateAnchorEl(event.currentTarget);
    };

    const handleApplyDate = () => {
        onDateRangeChange(tempStart, tempEnd);
        setDateAnchorEl(null);
    };

    const handleClearDate = () => {
        setTempStart(null);
        setTempEnd(null);
        onDateRangeChange(null, null);
    };

    const hasDateFilter = startDate || endDate;

    return (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: (theme) => theme.palette.mode === 'light' ? theme.palette.action.hover : 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
                px: 2,
                py: 0.5,
                flexGrow: 1
            }}>
                <SearchIcon color="action" />
                <InputBase
                    placeholder="Buscar..."
                    value={searchText}
                    onChange={(e) => onSearchChange(e.target.value)}
                    sx={{ ml: 1, flex: 1, color: 'text.primary' }}
                />
            </Box>

            <Box>
                <Button
                    variant={hasDateFilter ? "contained" : "outlined"}
                    color={hasDateFilter ? "primary" : "inherit"}
                    startIcon={<DateRangeIcon />}
                    onClick={handleOpenDate}
                    sx={{
                        borderColor: 'divider',
                        color: hasDateFilter ? 'white' : 'text.secondary',
                        height: 40
                    }}
                >
                    {startDate ? `${startDate.format('DD/MM')} - ${endDate ? endDate.format('DD/MM') : 'Hoy'}` : 'Fecha'}
                </Button>
                <Popover
                    open={Boolean(dateAnchorEl)}
                    anchorEl={dateAnchorEl}
                    onClose={() => setDateAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, width: 300 }}>
                            <Typography variant="subtitle2" fontWeight="bold">Filtrar por Fecha Inicio</Typography>
                            <DatePicker
                                label="Desde"
                                value={tempStart}
                                format="DD-MM-YYYY"
                                onChange={(val) => setTempStart(val)}
                                slotProps={{ textField: { size: 'small' } }}
                            />
                            <DatePicker
                                label="Hasta"
                                value={tempEnd}
                                format="DD-MM-YYYY"
                                onChange={(val) => setTempEnd(val)}
                                slotProps={{ textField: { size: 'small', helperText: !tempEnd ? "Se asume: HOY" : "" } }}
                            />
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button size="small" color="inherit" onClick={handleClearDate}>Limpiar</Button>
                                <Button size="small" variant="contained" onClick={handleApplyDate}>Aplicar</Button>
                            </Stack>
                        </Box>
                    </LocalizationProvider>
                </Popover>
            </Box>

            <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={onUploadClick}>
                Cargar CSV
            </Button>
        </Paper>
    );
};
