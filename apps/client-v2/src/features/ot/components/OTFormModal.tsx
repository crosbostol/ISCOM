import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, IconButton, Typography,
    MenuItem, Box, Alert,
    Autocomplete, Stack, List, ListItem, Chip, Tabs, Tab, FormControlLabel, Checkbox
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Hooks
import { usePostOt } from '../../../api/generated/hooks/usePostOt';
import { usePutOtId } from '../../../api/generated/hooks/usePutOtId';
import { useGetOtId } from '../../../api/generated/hooks/useGetOtId';
import { useGetMovils } from '../../../api/generated/hooks/useGetMovils';
import { useGetItems } from '../../../api/generated/hooks/useGetItems';
import { useQueryClient } from '@tanstack/react-query';
import { getOttableQueryKey } from '../../../api/generated/hooks/useGetOttable';
import { getOtIdQueryKey } from '../../../api/generated/hooks/useGetOtId';
import { isSharedItem } from '../../../constants/businessRules';

// Helper for currency formatting
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
};

// Helper for safe quantity parsing (handles "1,5" strings from input)
const parseQty = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const parsed = parseFloat(val.replace(',', '.'));
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

import { LiquidStepper } from './LiquidStepper';

// --- SCHEMA DEFINITION ---
const OTSchema = z.object({
    external_ot_id: z.string().optional().nullable(),
    street: z.string().min(1, "La calle es obligatoria"),
    number_street: z.string().optional().nullable(),
    commune: z.string().min(1, "La comuna es obligatoria"),
    observation: z.string().optional(),
    hydraulic_movil_id: z.string().optional().nullable(),
    started_at: z.any().optional().nullable(),
    civil_movil_id: z.string().optional().nullable(),
    civil_work_at: z.any().optional().nullable(),
    debris_movil_id: z.string().optional().nullable(),
    debris_date: z.any().optional().nullable(),
    items: z.array(z.object({
        item_id: z.coerce.number().min(1, "Seleccione un ítem"),
        // Allow strings with commas, transform to number
        quantity: z.preprocess(
            (val) => (typeof val === 'string' ? val.replace(',', '.') : val),
            z.coerce.number().min(0.001, "Cantidad > 0")
        )
    }))
}).superRefine((data, ctx) => {
    // Logic: If movil selected (hyd/civ), items required. Debris does NOT require items.
    const hasHydraulic = !!data.hydraulic_movil_id;
    const hasCivil = !!data.civil_movil_id;


    // Validation removed as per user request (Optional date, defaults to today)
    // if (hasDebris && !data.debris_date) { ... }

    if ((hasHydraulic || hasCivil) && (!data.items || data.items.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Debe agregar al menos un ítem si asigna un móvil Hidráulico o Civil.",
            path: ["items"]
        });
    }
});

type OTFormValues = z.infer<typeof OTSchema>;

interface OTFormModalProps {
    open: boolean;
    onClose: () => void;
    otId?: number | null; // Optional ID for Edit Mode
    onNotify: (message: string, severity: 'success' | 'error') => void;
}

export const OTFormModal: React.FC<OTFormModalProps> = ({ open, onClose, otId, onNotify }) => {
    const queryClient = useQueryClient();
    const isEdit = !!otId;

    // --- Hooks ---
    const { mutate: createOt, isPending: isCreating } = usePostOt({
        mutation: {
            onSuccess: () => {
                // Invalidate using the specific key from the generated hook
                queryClient.invalidateQueries({ queryKey: getOttableQueryKey() });
                handleClose();
                onNotify("Orden guardada correctamente", "success");
            },
            onError: (error: any) => {
                console.error("Failed to create OT", error);
                const msg = error.response?.data?.message || error.response?.data?.error_description || error.message || "Error al crear la OT";
                onNotify(msg, "error");
            }
        }
    });

    const { mutate: updateOt, isPending: isUpdating } = usePutOtId({
        mutation: {
            onSuccess: () => {
                // Invalidate list
                queryClient.invalidateQueries({ queryKey: getOttableQueryKey() });
                // Invalidate specific OT
                if (otId) {
                    // Use the GENERATED key structure
                    queryClient.invalidateQueries({ queryKey: getOtIdQueryKey(otId) });
                }
                handleClose();
                onNotify("Orden guardada correctamente", "success");
            },
            onError: (error: any) => {
                console.error("Failed to update OT", error);
                const msg = error.response?.data?.message || error.response?.data?.error_description || error.message || "Error al actualizar la OT";
                onNotify(msg, "error");
            }
        }
    });

    // Fetch Data if Edit Mode
    const { data: otData } = useGetOtId(otId as number);
    const { data: movils } = useGetMovils();
    const { data: items } = useGetItems();

    // Form
    const {
        control,
        handleSubmit,
        reset,
        watch,
        trigger,
        setValue,
        formState: { errors }
    } = useForm<OTFormValues>({
        resolver: zodResolver(OTSchema as any),
        defaultValues: {
            external_ot_id: '',
            street: '',
            number_street: '',
            commune: '',
            observation: '',
            items: [],
            hydraulic_movil_id: null,
            started_at: null,
            civil_movil_id: null,
            civil_work_at: null,
            debris_movil_id: null,
            debris_date: null
        },
        shouldUnregister: false
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    // --- State ---
    const [activeStep, setActiveStep] = useState(0); // For Create Mode
    const [activeTab, setActiveTab] = useState(0);   // For Edit Mode
    const [debrisSectionOpen, setDebrisSectionOpen] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Pending Item State
    const [pendingItem, setPendingItem] = useState<any | null>(null);
    const [pendingQty, setPendingQty] = useState<string>('');
    const itemInputRef = useRef<HTMLInputElement>(null);

    const hydraulicMovils = useMemo(() => movils?.filter(m => m.movil_type === 'HIDRAULICO' && m.movil_id != null) || [], [movils]);
    const civilMovils = useMemo(() => movils?.filter(m => m.movil_type === 'OBRA CIVIL' && m.movil_id != null) || [], [movils]);
    const debrisMovils = useMemo(() => movils?.filter(m => m.movil_type === 'RETIRO' && m.movil_id != null) || [], [movils]);

    // --- Effects ---
    useEffect(() => {
        if (open) {
            setSubmitError(null);
            if (isEdit && otData) {
                // Populate Form
                reset({
                    external_ot_id: otData.external_ot_id,
                    street: otData.street,
                    number_street: otData.number_street,
                    commune: otData.commune,
                    observation: (otData as any).observation || '',
                    hydraulic_movil_id: otData.hydraulic_movil_id?.toString() || null,
                    started_at: otData.started_at ? dayjs(otData.started_at) : null,
                    civil_movil_id: otData.civil_movil_id?.toString() || null,
                    civil_work_at: (otData as any).civil_work_at ? dayjs((otData as any).civil_work_at) : null,
                    debris_movil_id: (otData as any).debris_movil_id?.toString() || null,
                    debris_date: (otData as any).finished_at ? dayjs((otData as any).finished_at) : null,
                    items: (otData as any).items?.map((i: any) => ({
                        item_id: Number(i.item_id),
                        quantity: Number(i.quantity)
                    })) || []
                });
                setActiveTab(0);
                setDebrisSectionOpen(!!(otData as any).debris_movil_id);
            } else if (!isEdit) {
                // Reset for Create
                reset({
                    external_ot_id: '',
                    street: '',
                    number_street: '',
                    commune: '',
                    observation: '',
                    items: [],
                    hydraulic_movil_id: null,
                    started_at: null,
                    civil_movil_id: null,
                    civil_work_at: null,
                    debris_movil_id: null
                });
                setActiveStep(0);
                setDebrisSectionOpen(false);
            }
        }
    }, [open, isEdit, otData, reset]);

    const handleClose = () => {
        onClose();
        reset();
    };

    // --- Handlers ---
    const handleNext = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        let isValid = false;
        if (activeStep === 0) {
            isValid = await trigger(['external_ot_id', 'street', 'number_street', 'commune']);
        } else {
            isValid = true;
        }

        if (isValid) setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleTabChange = (_: any, newValue: number) => setActiveTab(newValue);

    const handleAddItem = () => {
        // Ensure pendingQty is a string before using replace
        if (typeof pendingQty !== 'string') return;
        // Parse quantity handling comma
        const parsedQty = parseFloat(pendingQty.replace(',', '.'));
        if (!pendingItem || !pendingQty || isNaN(parsedQty) || parsedQty <= 0) return;
        append({
            item_id: pendingItem.item_id,
            quantity: parsedQty // Store as number in the array
        });
        setPendingItem(null);
        setPendingQty('');
        setTimeout(() => itemInputRef.current?.focus(), 0);
    };

    const onSubmit = (data: OTFormValues) => {
        console.log("onSubmit Triggered. Mode:", isEdit ? "Edit" : "Create", "Step:", activeStep);

        // Prevent premature submission in Create Mode
        if (!isEdit && activeStep !== 3) {
            console.warn("Blocked premature submission in Step", activeStep);
            return;
        }

        const payload = {
            ...data,
            external_ot_id: data.external_ot_id || null,
            number_street: data.number_street || null,
            hydraulic_movil_id: data.hydraulic_movil_id || null,
            civil_movil_id: data.civil_movil_id || null,
            debris_movil_id: data.debris_movil_id || null,
            started_at: data.started_at ? dayjs(data.started_at).format('YYYY-MM-DDTHH:mm:ss') : null,
            civil_work_at: data.civil_work_at ? dayjs(data.civil_work_at).format('YYYY-MM-DDTHH:mm:ss') : null,
            finished_at: data.debris_date ? dayjs(data.debris_date).format('YYYY-MM-DDTHH:mm:ss') : null,
            items: data.items?.map(i => ({
                item_id: i.item_id.toString(),
                quantity: i.quantity
            })) || []
        };

        if (isEdit && otId) {
            // @ts-ignore
            updateOt({ id: otId, data: payload });
        } else {
            // @ts-ignore
            createOt({ data: payload });
        }
    };

    // --- Renderers ---

    const renderGeneralFields = () => (
        <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
                <Controller
                    name="external_ot_id"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} value={field.value ?? ''} label="Folio OT" fullWidth error={!!errors.external_ot_id} helperText={errors.external_ot_id?.message} InputLabelProps={{ shrink: true }} />
                    )}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
                <Controller
                    name="street"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Calle / Dirección" fullWidth error={!!errors.street} helperText={errors.street?.message} InputLabelProps={{ shrink: true }} />
                    )}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                    name="number_street"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Número" fullWidth error={!!errors.number_street} helperText={errors.number_street?.message} InputLabelProps={{ shrink: true }} />
                    )}
                />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <Controller
                    name="commune"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Comuna" fullWidth error={!!errors.commune} helperText={errors.commune?.message} InputLabelProps={{ shrink: true }} />
                    )}
                />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <Controller
                    name="observation"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Observación" fullWidth multiline rows={3} InputLabelProps={{ shrink: true }} />
                    )}
                />
            </Grid>
        </Grid>
    );

    // --- Item Manager Renderer (Reusable) ---
    const renderItemsManager = (movilId: string | null | undefined, filter: string) => {
        if (!movilId) return null;

        return (
            <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Materiales y Partidas ({filter})
                    </Typography>
                    {/* Input Row */}
                    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
                        <Autocomplete
                            options={items?.filter(i => {
                                // Filter Logic:
                                // 1. Exact Match on Type
                                if (i.item_type === filter) return true;
                                // 2. Closing Items always show (Except in Debris/RETIRO where we want strict list)
                                if (i.item_type === 'CLOSING_ITEM' && filter !== 'RETIRO') return true;
                                // 3. Shared Items Logic: Show in CIVIL ('OBRAS') and DEBRIS ('RETIRO')
                                if ((filter === 'OBRAS' || filter === 'RETIRO') && isSharedItem(i.description || '')) return true;
                                // 4. Uncategorized (Show everywhere to be safe, or just fallbacks) match List filter
                                const isUncategorized = (i as any).item_type !== 'AGUA POTABLE' && (i as any).item_type !== 'OBRAS' && !(i as any).item_type;
                                if (isUncategorized) return true;

                                return false;
                            }) || []}
                            getOptionLabel={(option) => `${option.item_id} - ${option.description}`}
                            value={pendingItem}
                            onChange={(_, newValue) => setPendingItem(newValue)}
                            renderOption={(props, option: any) => {
                                const { key, ...otherProps } = props;
                                return (
                                    <li key={key} {...otherProps}>
                                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="body2">{option.description}</Typography>
                                                <Typography variant="caption" color="text.secondary">Cod: {option.item_id}</Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                                {formatCurrency(option.item_value || 0)} / un
                                            </Typography>
                                        </Box>
                                    </li>
                                );
                            }}
                            renderInput={(params) => <TextField {...params} label="Buscar Ítem" inputRef={itemInputRef} />}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Cant."
                            value={pendingQty}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9,.]/g, '');
                                setPendingQty(val);
                            }}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddItem(); } }}
                            sx={{ width: 100 }}
                            inputProps={{ inputMode: 'decimal' }}
                        />
                        <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddItem} disabled={!pendingItem || !pendingQty} sx={{ height: 56 }}>
                            Agregar
                        </Button>
                    </Stack>

                    {/* List */}
                    <List dense sx={{ bgcolor: (theme) => theme.palette.mode === 'light' ? 'grey.50' : 'rgba(0,0,0,0.2)', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        {fields.map((field, index) => {
                            const currentItem = items?.find(i => Number(i.item_id) === Number(field.item_id));
                            const isMissingFromCatalogue = !currentItem;

                            if (isMissingFromCatalogue) {
                                return (
                                    <ListItem
                                        key={field.id}
                                        secondaryAction={
                                            <IconButton edge="end" onClick={() => remove(index)} color="error"><DeleteIcon /></IconButton>
                                        }
                                        sx={{ borderBottom: '1px solid #f0f0f0', bgcolor: 'error.lighter' }}
                                    >
                                        <Box>
                                            <Typography variant="body2" color="error">Ítem ID {field.item_id} (No encontrado)</Typography>
                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                                                <Controller
                                                    name={`items.${index}.quantity`}
                                                    control={control}
                                                    render={({ field: qtyField }) => (
                                                        <TextField
                                                            {...qtyField}
                                                            size="small"
                                                            variant="outlined"
                                                            label="Cant."
                                                            sx={{ width: 80 }}
                                                            value={qtyField.value}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/[^0-9,.]/g, '');
                                                                qtyField.onChange(val);
                                                            }}
                                                            inputProps={{ inputMode: 'decimal' }}
                                                        />
                                                    )}
                                                />
                                            </Stack>
                                        </Box>
                                    </ListItem>
                                );
                            }

                            // Filter Logic for List Display
                            // 1. Match current filter?
                            const matchesFilter = (currentItem as any).item_type === filter;
                            // 2. Is it a Closing Item?
                            const isClosing = (currentItem as any).item_type === 'CLOSING_ITEM' && filter !== 'RETIRO';
                            // 3. Shared Items
                            const isShared = (filter === 'OBRAS' || filter === 'RETIRO') && isSharedItem((currentItem as any).description || '');
                            // 4. Uncategorized (Show everywhere to be safe, or just fallbacks)
                            const isUncategorized = (currentItem as any).item_type !== 'AGUA POTABLE' && (currentItem as any).item_type !== 'OBRAS' && !(currentItem as any).item_type;

                            if (!matchesFilter && !isClosing && !isShared && !isUncategorized) return null;

                            const qty = parseQty(field.quantity);
                            const total = ((currentItem as any).item_value || 0) * qty;

                            return (
                                <ListItem
                                    key={field.id}
                                    secondaryAction={
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Typography variant="body2" fontWeight="bold" color="primary.main">{formatCurrency(total)}</Typography>
                                            <IconButton edge="end" onClick={() => remove(index)} color="error"><DeleteIcon /></IconButton>
                                        </Stack>
                                    }
                                    sx={{ borderBottom: '1px solid #f0f0f0' }}
                                >
                                    <Box>
                                        <Typography variant="body2" fontWeight="medium">{(currentItem as any).description}</Typography>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                                            <Controller
                                                name={`items.${index}.quantity`}
                                                control={control}
                                                render={({ field: qtyField }) => (
                                                    <TextField
                                                        {...qtyField}
                                                        size="small"
                                                        variant="outlined"
                                                        label="Cant."
                                                        sx={{ width: 80 }}
                                                        value={qtyField.value}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/[^0-9,.]/g, '');
                                                            qtyField.onChange(val);
                                                        }}
                                                        inputProps={{ inputMode: 'decimal' }}
                                                    />
                                                )}
                                            />
                                            <Typography variant="body2" color="text.secondary">x {formatCurrency((currentItem as any)?.item_value || 0)}</Typography>
                                        </Stack>
                                    </Box>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>
            </Grid>
        );
    };

    const renderResourceSection = (type: string, fieldName: 'hydraulic_movil_id' | 'civil_movil_id' | 'debris_movil_id', dateFieldName: 'started_at' | 'civil_work_at' | 'debris_date', itemFilter: string) => {
        const relevantMovilId = watch(fieldName);

        // Define movil list based on type
        let relevantMovils: any[] = [];
        if (type === 'HIDRAULICO') {
            relevantMovils = hydraulicMovils;
        } else if (type === 'OBRA CIVIL') {
            relevantMovils = civilMovils;
        } else if (type === 'CIERRE / RETIRO') {
            relevantMovils = debrisMovils;
        }

        return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Controller
                            name={fieldName}
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label={`Seleccionar Móvil`}
                                    fullWidth
                                    value={field.value || ''}
                                    helperText={!field.value ? "Seleccione un móvil para agregar partidas" : ""}
                                    onChange={(e) => {
                                        field.onChange(e.target.value);
                                    }}
                                >
                                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                                    {relevantMovils.map(m => (
                                        <MenuItem key={m.movil_id!} value={m.movil_id!.toString()}>
                                            {m.movil_id}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Controller
                            name={dateFieldName}
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    label="Fecha Ejecución"
                                    value={field.value || null}
                                    format="DD-MM-YYYY"
                                    onChange={(newValue) => field.onChange(newValue)}
                                    slotProps={{ textField: { fullWidth: true, error: !!errors[dateFieldName], helperText: errors[dateFieldName]?.message as string } }}
                                />
                            )}
                        />
                    </Grid>

                    {renderItemsManager(relevantMovilId, itemFilter)}
                </Grid>
            </LocalizationProvider>
        );
    };

    const renderSummaryStep = () => {
        const fValues = {
            id: watch('external_ot_id'),
            address: `${watch('street')} ${watch('number_street')}`,
            commune: watch('commune'),
            obs: watch('observation'),
            hyd: watch('hydraulic_movil_id'),
            civ: watch('civil_movil_id'),
            deb: watch('debris_movil_id'),
            startDate: watch('started_at'),
            civilDate: watch('civil_work_at'),
        };

        const renderSummaryCard = (title: string, movilId: string | null | undefined, dateVal: any, filter: string, badgeIndex: number) => {
            if (!movilId) return null;
            const cardItems = fields.filter(f => {
                const i = items?.find(it => Number(it.item_id) === Number(f.item_id));
                return i?.item_type === filter;
            });
            const total = cardItems.reduce((acc, curr) => {
                const i = items?.find(it => Number(it.item_id) === Number(curr.item_id));
                return acc + ((i as any)?.item_value || 0) * parseQty(curr.quantity);
            }, 0);

            return (
                <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, height: '100%', bgcolor: 'background.paper' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="caption" color="text.secondary">{title}</Typography>
                            <Chip label={badgeIndex} size="small" variant="outlined" color={filter === 'AGUA POTABLE' ? 'info' : 'secondary'} />
                        </Stack>
                        <Typography variant="h6" fontWeight="bold">Móvil {movilId}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>Fecha: {dateVal ? dayjs(dateVal).format('DD-MM-YYYY') : '---'}</Typography>

                        <Box sx={{
                            maxHeight: 250,
                            overflowY: 'auto',
                            pr: 1,
                            '&::-webkit-scrollbar': {
                                width: '6px',
                                height: '6px'
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#E8F6FA'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#6ABCE5',
                                borderRadius: '3px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: '#1F6EB1'
                            }
                        }}>
                            <List dense disablePadding>
                                {cardItems.map((f, idx) => {
                                    const it = items?.find(i => Number(i.item_id) === Number(f.item_id));
                                    return (
                                        <ListItem key={idx} sx={{ px: 0, py: 0.5, borderBottom: '1px dashed #bdbdbd' }}>
                                            <Box sx={{ width: '100%' }}>
                                                <Typography variant="body2">{it?.description}</Typography>
                                                <Stack direction="row" justifyContent="space-between">
                                                    <Chip label={`${f.quantity} un.`} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                    <Typography variant="body2" fontWeight="bold">{formatCurrency(((it as any)?.item_value || 0) * parseQty(f.quantity))}</Typography>
                                                </Stack>
                                            </Box>
                                        </ListItem>
                                    )
                                })}
                            </List>
                        </Box>

                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                            <Typography variant="subtitle2" color="primary.main" fontWeight="bold">Total: {formatCurrency(total)}</Typography>
                        </Box>
                    </Box>
                </Grid>
            );
        };

        return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2} sx={{ mt: 1.5 }}>
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1.5, overflow: 'hidden' }}>
                            <Box sx={{ px: 2, py: 1.5, bgcolor: (theme) => theme.palette.mode === 'light' ? '#f5f5f5' : 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid', borderColor: 'divider' }}><Typography variant="subtitle1" fontWeight="bold" color="primary.main">RESUMEN DE LA ORDEN</Typography></Box>
                            <Grid container>
                                <Grid size={{ xs: 12, md: 4 }} sx={{ p: 2, borderRight: { md: '1px solid #e0e0e0' }, borderBottom: { xs: '1px solid #e0e0e0', md: 'none' } }}>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 'bold', mb: 0.5 }}>FOLIO OT</Typography>
                                    <Typography variant="h6" fontWeight="bold">{fValues.id || "PENDIENTE"}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }} sx={{ p: 2, borderRight: { md: '1px solid #e0e0e0' }, borderBottom: { xs: '1px solid #e0e0e0', md: 'none' } }}>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 'bold', mb: 0.5 }}>DIRECCIÓN</Typography>
                                    <Typography variant="body1" sx={{ lineHeight: 1.2 }}>{fValues.address}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }} sx={{ p: 2 }}>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 'bold', mb: 0.5 }}>COMUNA</Typography>
                                    <Typography variant="body1">{fValues.commune}</Typography>
                                </Grid>
                            </Grid>
                            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 'bold', mb: 0.5 }}>NOTAS / OBSERVACIÓN</Typography>
                                <Typography variant="body2" sx={{ color: fValues.obs ? 'text.primary' : 'text.secondary' }}>{fValues.obs || "Sin observaciones."}</Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {renderSummaryCard('Recurso Hidráulico', fValues.hyd, fValues.startDate, 'AGUA POTABLE', 6)}
                    {renderSummaryCard('Recurso Civil', fValues.civ, fValues.civilDate, 'OBRAS', 2)}

                    <Grid size={{ xs: 12 }}>
                        <Box sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'warning.main',
                            borderRadius: 1,
                            bgcolor: (theme) => theme.palette.mode === 'light' ? '#fff8e1' : 'rgba(255, 193, 7, 0.1)'
                        }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={debrisSectionOpen}
                                        onChange={(e) => {
                                            setDebrisSectionOpen(e.target.checked);
                                            if (!e.target.checked) {
                                                setValue('debris_movil_id', null);
                                                setValue('debris_date', null);
                                            }
                                        }}
                                    />
                                }
                                label={<Typography variant="subtitle2" fontWeight="bold">Asignar Retiro de Escombros Ahora</Typography>}
                            />
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ ml: 4, mb: 1 }}>
                                Active esto solo si el retiro ya se encuentra realizado. De lo contrario, déjelo vacío.
                            </Typography>

                            {debrisSectionOpen && (
                                <Box sx={{ mt: 2, ml: 4 }}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <Controller
                                            name="debris_movil_id"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField {...field} select label="Seleccionar Camión" fullWidth size="small" value={field.value || ''}>
                                                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                                                    {debrisMovils.map(m => <MenuItem key={m.movil_id} value={m.movil_id!.toString()}>{m.movil_id}</MenuItem>)}
                                                </TextField>
                                            )}
                                        />
                                        <Controller
                                            name="debris_date"
                                            control={control}
                                            render={({ field }) => (
                                                <DatePicker
                                                    label="Fecha de Retiro"
                                                    value={field.value || null}
                                                    format="DD-MM-YYYY"
                                                    onChange={(newValue) => field.onChange(newValue)}
                                                    slotProps={{ textField: { fullWidth: true, size: 'small', error: !!errors.debris_date, helperText: errors.debris_date?.message as string } }}
                                                />
                                            )}
                                        />
                                    </Stack>

                                    {/* Item Manager for Debris in Create Mode */}
                                    {renderItemsManager(watch('debris_movil_id'), 'RETIRO')}

                                    <Alert severity="warning" sx={{ mt: 2 }}>
                                        La OT se creará con estado de retiro activo. Si completa los 3 recursos, pasará a <b>POR PAGAR</b>.
                                    </Alert>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </LocalizationProvider>
        );
    };

    const renderTabsContent = () => {
        return (
            <Box sx={{ mt: 0 }}>
                {/* Sticky Header with negative margin to counteract DialogContent padding if needed, or better: Use P-0 on DialogContent */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 11, mx: -3, px: 3, pt: 1 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="ot edit tabs">
                        <Tab label="Información" />
                        <Tab label="Hidráulico" />
                        <Tab label="Civil" />
                        <Tab label="Cierre / Retiro" />
                    </Tabs>
                </Box>
                <Box sx={{ p: 2 }}>
                    {activeTab === 0 && renderGeneralFields()}
                    {activeTab === 1 && renderResourceSection('HIDRAULICO', 'hydraulic_movil_id', 'started_at', 'AGUA POTABLE')}
                    {activeTab === 2 && renderResourceSection('OBRA CIVIL', 'civil_movil_id', 'civil_work_at', 'OBRAS')}
                    {activeTab === 3 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2 }}>Cierre y Retiro</Typography>
                            {renderResourceSection('CIERRE / RETIRO', 'debris_movil_id', 'debris_date', 'RETIRO')}
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Asignar un camión de retiro implica que la obra ha concluido o hay escombros por retirar.
                                Si la OT tiene todos sus recursos asignados, el sistema asumirá que el trabajo está completo.
                            </Alert>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>{isEdit ? `Editar OT #${otId}` : 'Nueva Orden de Trabajo'}</DialogTitle>
            <DialogContent dividers className="custom-scrollbar">
                {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

                <form id="ot-form" onSubmit={handleSubmit(onSubmit)}>
                    {isEdit ? (
                        renderTabsContent()
                    ) : (
                        // Stepper for Create Mode
                        <>
                            <LiquidStepper activeStep={activeStep} steps={['Ubicación', 'Hidráulico', 'Civil', 'Resumen']} />
                            <div style={{ display: activeStep === 0 ? 'block' : 'none' }}>{renderGeneralFields()}</div>
                            <div style={{ display: activeStep === 1 ? 'block' : 'none' }}>{renderResourceSection('HIDRAULICO', 'hydraulic_movil_id', 'started_at', 'AGUA POTABLE')}</div>
                            <div style={{ display: activeStep === 2 ? 'block' : 'none' }}>{renderResourceSection('OBRA CIVIL', 'civil_movil_id', 'civil_work_at', 'OBRAS')}</div>
                            <div style={{ display: activeStep === 3 ? 'block' : 'none' }}>{renderSummaryStep()}</div>
                        </>
                    )}
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">Cancelar</Button>
                <Box sx={{ flex: '1 1 auto' }} />

                {!isEdit ? (
                    // Stepper Actions
                    <>
                        <Button disabled={activeStep === 0} onClick={handleBack} type="button">Atrás</Button>
                        {activeStep === 3 ? (
                            <Button type="submit" variant="contained" form="ot-form" disabled={isCreating} startIcon={<CheckIcon />}>
                                {isCreating ? 'Creando...' : 'Crear Orden'}
                            </Button>
                        ) : (
                            <Button onClick={handleNext} variant="contained" type="button">Siguiente</Button>
                        )}
                    </>
                ) : (
                    // Edit Actions
                    <Button type="submit" variant="contained" form="ot-form" disabled={isUpdating}>
                        {isUpdating ? 'Guardar Cambios' : 'Guardar'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
