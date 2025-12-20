import React from 'react';
import { TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import type { OTFormValues } from '../../schemas/otSchema';

interface OTGeneralInfoProps {
    control: Control<OTFormValues>;
    errors: FieldErrors<OTFormValues>;
}

export const OTGeneralInfo: React.FC<OTGeneralInfoProps> = ({ control, errors }) => {
    return (
        <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
                <Controller
                    name="external_ot_id"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            value={field.value ?? ''}
                            label="Folio OT"
                            fullWidth
                            error={!!errors.external_ot_id}
                            helperText={errors.external_ot_id?.message}
                            InputLabelProps={{ shrink: true }}
                        />
                    )}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
                <Controller
                    name="street"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Calle / Dirección"
                            fullWidth
                            error={!!errors.street}
                            helperText={errors.street?.message}
                            InputLabelProps={{ shrink: true }}
                        />
                    )}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                    name="number_street"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            value={field.value ?? ''}
                            label="Número"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    )}
                />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <Controller
                    name="commune"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Comuna"
                            fullWidth
                            error={!!errors.commune}
                            helperText={errors.commune?.message}
                            InputLabelProps={{ shrink: true }}
                        />
                    )}
                />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <Controller
                    name="observation"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            value={field.value ?? ''}
                            label="Observaciones"
                            fullWidth
                            multiline
                            rows={2}
                            InputLabelProps={{ shrink: true }}
                        />
                    )}
                />
            </Grid>
        </Grid>
    );
};
