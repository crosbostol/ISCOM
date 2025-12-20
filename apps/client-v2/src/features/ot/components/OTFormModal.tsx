import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Alert, Stack, Chip, Typography
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CheckIcon from '@mui/icons-material/Check';
import dayjs from 'dayjs';
import { keyframes, alpha } from '@mui/material/styles';

// Hooks
import { usePostOt } from '../../../api/generated/hooks/usePostOt';
import { usePutOtId } from '../../../api/generated/hooks/usePutOtId';
import { useGetOtId } from '../../../api/generated/hooks/useGetOtId';
import { useGetItems } from '../../../api/generated/hooks/useGetItems';
import { useQueryClient } from '@tanstack/react-query';
import { getOttableQueryKey } from '../../../api/generated/hooks/useGetOttable';
import { getOtIdQueryKey } from '../../../api/generated/hooks/useGetOtId';

// Schema & Types
import { otSchema, type OTFormValues, getStepFields } from '../schemas/otSchema';
import type { MovilDTO } from '../../../api/generated/models/MovilDTO';
import type { Conductor } from '../../../api/generated/models/Conductor';

// Components
import { LiquidStepper } from './LiquidStepper';
import { OTGeneralInfo, OTResourceSection, OTSummary, OTTabs } from './OTForm';

interface OTFormModalProps {
    open: boolean;
    onClose: () => void;
    otId?: number | null;
    onNotify: (message: string, severity: 'success' | 'error') => void;
    movilesList: MovilDTO[];
    conductoresList?: Conductor[];
}

// Pulse glow animation
const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px ${alpha('#4DB6AC', 0.2)}, 0 0 40px ${alpha('#4DB6AC', 0.1)};
  }
  50% {
    box-shadow: 0 0 30px ${alpha('#4DB6AC', 0.3)}, 0 0 60px ${alpha('#4DB6AC', 0.15)};
  }
`;

export const OTFormModal: React.FC<OTFormModalProps> = ({
    open,
    onClose,
    otId,
    onNotify,
    movilesList,
    conductoresList = []
}) => {
    const queryClient = useQueryClient();
    const isEdit = !!otId;

    // --- Hooks ---
    const { mutate: createOt, isPending: isCreating } = usePostOt({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getOttableQueryKey() });
                handleClose();
                onNotify("Orden guardada correctamente", "success");
            },
            onError: (error: any) => {
                const msg = error.response?.data?.message || error.message || "Error al crear la OT";
                onNotify(msg, "error");
            }
        }
    });

    const { mutate: updateOt, isPending: isUpdating } = usePutOtId({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getOttableQueryKey() });
                if (otId) queryClient.invalidateQueries({ queryKey: getOtIdQueryKey(otId) });
                handleClose();
                onNotify("Orden guardada correctamente", "success");
            },
            onError: (error: any) => {
                const msg = error.response?.data?.message || error.message || "Error al actualizar la OT";
                onNotify(msg, "error");
            }
        }
    });

    const { data: otData } = useGetOtId(otId as number);
    const { data: itemsCatalog } = useGetItems();

    // Form
    const {
        control,
        handleSubmit,
        reset,
        watch,
        trigger,
        formState: { errors }
    } = useForm<OTFormValues>({
        resolver: zodResolver(otSchema) as any,
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
            finished_at: null
        },
        shouldUnregister: false
    });

    // --- State ---
    const [activeStep, setActiveStep] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // --- Effects ---
    useEffect(() => {
        if (open && isEdit && otData) {
            reset({
                external_ot_id: otData.external_ot_id || '',
                street: otData.street,
                number_street: otData.number_street ?? undefined,
                commune: otData.commune,
                observation: (otData as any).observation || '',
                hydraulic_movil_id: otData.hydraulic_movil_id?.toString() ?? undefined,
                started_at: otData.started_at ? dayjs(otData.started_at) : null,
                civil_movil_id: otData.civil_movil_id?.toString() ?? undefined,
                civil_work_at: (otData as any).civil_work_at ? dayjs((otData as any).civil_work_at) : null,
                debris_movil_id: (otData as any).debris_movil_id?.toString() ?? undefined,
                finished_at: (otData as any).finished_at ? dayjs((otData as any).finished_at) : null,
                items: (otData as any).items?.map((i: any) => ({
                    item_id: Number(i.item_id),
                    quantity: Number(i.quantity),
                    assigned_movil_id: i.assigned_movil_id
                })) || []
            });
        } else if (open && !isEdit) {
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
                debris_movil_id: null,
                finished_at: null
            });
            setActiveStep(0);
        }
    }, [open, isEdit, otData, reset]);

    const handleClose = () => {
        onClose();
        reset();
        setSubmitError(null);
    };

    // --- Handlers ---
    const handleNext = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();
        const fieldsToValidate = getStepFields(activeStep);
        const isValid = fieldsToValidate.length > 0 ? await trigger(fieldsToValidate as any) : true;
        if (isValid) setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);
    const handleTabChange = (_: any, newValue: number) => setActiveTab(newValue);

    const onSubmit = (data: OTFormValues) => {
        if (!isEdit && activeStep !== 4) return;

        const payload = {
            ...data,
            external_ot_id: data.external_ot_id || null,
            number_street: data.number_street || null,
            hydraulic_movil_id: data.hydraulic_movil_id || null,
            civil_movil_id: data.civil_movil_id || null,
            debris_movil_id: data.debris_movil_id || null,
            started_at: data.started_at ? dayjs(data.started_at).format('YYYY-MM-DDTHH:mm:ss') : null,
            civil_work_at: data.civil_work_at ? dayjs(data.civil_work_at).format('YYYY-MM-DDTHH:mm:ss') : null,
            finished_at: data.finished_at ? dayjs(data.finished_at).format('YYYY-MM-DDTHH:mm:ss') : null,
            items: data.items?.map(i => ({
                item_id: i.item_id.toString(),
                quantity: i.quantity,
                assigned_movil_id: i.assigned_movil_id
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

    // --- Render ---
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: alpha('#0B1929', 0.95),
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${alpha('#4DB6AC', 0.3)}`,
                    animation: `${pulseGlow} 3s ease-in-out infinite`,
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                {isEdit ? (
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <span>
                            Editar OT: {otData?.external_ot_id || `ADICIONAL-${otId}`}
                        </span>
                        {otData && (otData as any).ot_state && (
                            <Chip label={(otData as any).ot_state} size="small" variant="outlined" />
                        )}
                    </Stack>
                ) : (
                    'Nueva Orden de Trabajo'
                )}
            </DialogTitle>
            <DialogContent dividers sx={{
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-thumb': {
                    background: (theme) => theme.palette.mode === 'dark' ? '#009688' : '#B0BEC5',
                    borderRadius: '3px'
                }
            }}>
                {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

                <form id="ot-form" onSubmit={handleSubmit(onSubmit)}>
                    {isEdit ? (
                        <OTTabs
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            control={control}
                            errors={errors}
                            watch={watch}
                            movilesList={movilesList}
                            conductoresList={conductoresList}
                            itemsList={itemsCatalog || []}
                        />
                    ) : (
                        <>
                            <LiquidStepper activeStep={activeStep} steps={['Ubicación', 'Hidráulico', 'Civil', 'Retiro', 'Resumen']} />
                            <div style={{ display: activeStep === 0 ? 'block' : 'none' }}>
                                <OTGeneralInfo control={control} errors={errors} />
                            </div>
                            <div style={{ display: activeStep === 1 ? 'block' : 'none' }}>
                                <OTResourceSection
                                    control={control}
                                    errors={errors}
                                    watch={watch}
                                    label="Hidráulico"
                                    movilFieldName="hydraulic_movil_id"
                                    dateFieldName="started_at"
                                    movilTypeFilter="HIDRAULICO"
                                    itemFilterType="AGUA POTABLE"
                                    movilesList={movilesList}
                                    conductoresList={conductoresList}
                                    itemsList={itemsCatalog || []}
                                />
                            </div>
                            <div style={{ display: activeStep === 2 ? 'block' : 'none' }}>
                                <OTResourceSection
                                    control={control}
                                    errors={errors}
                                    watch={watch}
                                    label="Civil"
                                    movilFieldName="civil_movil_id"
                                    dateFieldName="civil_work_at"
                                    movilTypeFilter="OBRA CIVIL"
                                    itemFilterType="OBRAS"
                                    movilesList={movilesList}
                                    conductoresList={conductoresList}
                                    itemsList={itemsCatalog || []}
                                />
                            </div>
                            <div style={{ display: activeStep === 3 ? 'block' : 'none' }}>
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Cierre y Retiro (Opcional)</Typography>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Si la obra está lista para cierre, asigna un móvil de retiro y los items correspondientes.
                                    </Alert>
                                    <OTResourceSection
                                        control={control}
                                        errors={errors}
                                        watch={watch}
                                        label="Retiro"
                                        movilFieldName="debris_movil_id"
                                        dateFieldName="finished_at"
                                        movilTypeFilter="RETIRO"
                                        itemFilterType="RETIRO"
                                        movilesList={movilesList}
                                        conductoresList={conductoresList}
                                        itemsList={itemsCatalog || []}
                                    />
                                </Box>
                            </div>
                            <div style={{ display: activeStep === 4 ? 'block' : 'none' }}>
                                <OTSummary
                                    formValues={watch()}
                                    itemsList={itemsCatalog || []}
                                    movilesList={movilesList}
                                    conductoresList={conductoresList}
                                />
                            </div>
                        </>
                    )}
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">Cancelar</Button>
                <Box sx={{ flex: '1 1 auto' }} />

                {!isEdit ? (
                    <>
                        <Button disabled={activeStep === 0} onClick={handleBack} type="button">Atrás</Button>
                        {activeStep === 4 ? (
                            <Button type="submit" variant="contained" form="ot-form" disabled={isCreating} startIcon={<CheckIcon />}>
                                {isCreating ? 'Creando...' : 'Crear Orden'}
                            </Button>
                        ) : (
                            <Button onClick={handleNext} variant="contained" type="button">Siguiente</Button>
                        )}
                    </>
                ) : (
                    <Button type="submit" variant="contained" form="ot-form" disabled={isUpdating}>
                        {isUpdating ? 'Guardando...' : 'Guardar'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};
