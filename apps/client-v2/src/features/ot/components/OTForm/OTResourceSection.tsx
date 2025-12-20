import React from 'react';
import { Box, TextField, MenuItem, Alert, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Controller, type Control, type FieldErrors, type UseFormWatch } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import WarningIcon from '@mui/icons-material/Warning';
import { OTItemManager } from './OTItemManager';
import type { OTFormValues } from '../../schemas/otSchema';
import type { MovilDTO } from '../../../../api/generated/models/MovilDTO';
import type { Conductor } from '../../../../api/generated/models/Conductor';
import { Chip } from '@mui/material';

interface OTResourceSectionProps {
    control: Control<OTFormValues>;
    errors: FieldErrors<OTFormValues>;
    watch: UseFormWatch<OTFormValues>;
    label: string;
    movilFieldName: 'hydraulic_movil_id' | 'civil_movil_id' | 'debris_movil_id';
    dateFieldName: 'started_at' | 'civil_work_at' | 'finished_at';
    movilTypeFilter: 'HIDRAULICO' | 'OBRA CIVIL' | 'RETIRO';
    itemFilterType: 'AGUA POTABLE' | 'OBRAS' | 'RETIRO';
    movilesList: MovilDTO[];
    conductoresList: Conductor[];
    itemsList: any[];
}

export const OTResourceSection: React.FC<OTResourceSectionProps> = ({
    control,
    watch,
    label,
    movilFieldName,
    dateFieldName,
    movilTypeFilter,
    itemFilterType,
    movilesList,
    conductoresList,
    itemsList
}) => {
    const relevantMovilId = watch(movilFieldName);

    // Filter moviles by type
    const relevantMovils = movilesList?.filter(m =>
        m.movil_type?.trim().toUpperCase() === movilTypeFilter && m.movil_id != null
    ) || [];

    // Get selected movil details
    const selectedMovil = relevantMovils.find(m => m.movil_id === relevantMovilId);
    const isInMaintenance = selectedMovil?.movil_state === 'EN_TALLER' || selectedMovil?.movil_state === 'EN MANTENCION';
    const conductor = selectedMovil?.conductor_id
        ? conductoresList?.find(c => c.id === selectedMovil.conductor_id)
        : null;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Controller
                        name={movilFieldName}
                        control={control}
                        render={({ field }) => {
                            return (
                                <Box>
                                    <TextField
                                        {...field}
                                        select
                                        label={`Seleccionar Móvil ${label}`}
                                        fullWidth
                                        value={field.value || ''}
                                        helperText={!field.value ? "Seleccione un móvil para agregar partidas" : ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    >
                                        <MenuItem value=""><em>Ninguno</em></MenuItem>
                                        {relevantMovils.map(m => {
                                            const movilConductor = m.conductor_id ? conductoresList?.find(c => c.id === m.conductor_id) : null;
                                            const isMaintenance = m.movil_state === 'EN_TALLER' || m.movil_state === 'EN MANTENCION';

                                            return (
                                                <MenuItem key={m.movil_id!} value={m.movil_id!.toString()}>
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                                                        <Typography>{m.movil_id}</Typography>
                                                        {isMaintenance && (
                                                            <Chip
                                                                icon={<WarningIcon />}
                                                                label="Mantención"
                                                                size="small"
                                                                color="warning"
                                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                        {movilConductor && (
                                                            <Chip
                                                                label={movilConductor.name}
                                                                size="small"
                                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                    </Stack>
                                                </MenuItem>
                                            );
                                        })}
                                    </TextField>
                                    {isInMaintenance && (
                                        <Alert severity="warning" sx={{ mt: 1 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <WarningIcon fontSize="small" />
                                                <Typography variant="body2">
                                                    El móvil seleccionado está en mantención. {conductor && `Asignado a: ${conductor.name}`}
                                                </Typography>
                                            </Stack>
                                        </Alert>
                                    )}
                                </Box>
                            );
                        }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Controller
                        name={dateFieldName}
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                label={`Fecha ${label}`}
                                value={field.value || null}
                                onChange={(newValue) => field.onChange(newValue)}
                                format="DD-MM-YYYY"
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        )}
                    />
                </Grid>

                {/* Item Manager - Only show if movil is selected */}
                {relevantMovilId && (
                    <Grid size={{ xs: 12 }}>
                        <OTItemManager
                            control={control}
                            movilId={relevantMovilId}
                            filterType={itemFilterType}
                            itemsList={itemsList}
                        />
                    </Grid>
                )}
            </Grid>
        </LocalizationProvider>
    );
};
