import React from 'react';
import { Box, Tabs, Tab, Alert, Typography } from '@mui/material';
import type { Control, FieldErrors, UseFormWatch } from 'react-hook-form';
import type { OTFormValues } from '../../schemas/otSchema';
import type { MovilDTO } from '../../../../api/generated/models/MovilDTO';
import type { Conductor } from '../../../../api/generated/models/Conductor';
import { OTGeneralInfo } from './OTGeneralInfo';
import { OTResourceSection } from './OTResourceSection';

interface OTTabsProps {
    activeTab: number;
    onTabChange: (event: any, newValue: number) => void;
    control: Control<OTFormValues>;
    errors: FieldErrors<OTFormValues>;
    watch: UseFormWatch<OTFormValues>;
    movilesList: MovilDTO[];
    conductoresList: Conductor[];
    itemsList: any[];
}

export const OTTabs: React.FC<OTTabsProps> = ({
    activeTab,
    onTabChange,
    control,
    errors,
    watch,
    movilesList,
    conductoresList,
    itemsList
}) => {
    return (
        <Box>
            <Box sx={{ borderBottom: 'none' }}>
                <Tabs
                    value={activeTab}
                    onChange={onTabChange}
                    sx={{
                        borderBottom: 'none',
                        '& .MuiTab-root': {
                            minHeight: '48px',
                            transition: 'all 0.3s',
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            '&.Mui-selected': {
                                color: 'primary.main',
                                fontWeight: 700,
                            },
                            '&:hover': {
                                color: 'primary.light',
                            }
                        },
                        '& .MuiTabs-indicator': {
                            height: '3px',
                            borderRadius: '3px 3px 0 0',
                            backgroundColor: 'primary.main',
                            boxShadow: '0 0 8px rgba(77, 182, 172, 0.6)',
                        },
                        '& .MuiTabs-flexContainer': {
                            borderBottom: 'none',
                        }
                    }}
                >
                    <Tab label="Información" />
                    <Tab label="Hidráulico" />
                    <Tab label="Civil" />
                    <Tab label="Cierre / Retiro" />
                </Tabs>
            </Box>
            <Box sx={{ p: 2 }}>
                {activeTab === 0 && <OTGeneralInfo control={control} errors={errors} />}
                {activeTab === 1 && (
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
                        itemsList={itemsList}
                    />
                )}
                {activeTab === 2 && (
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
                        itemsList={itemsList}
                    />
                )}
                {activeTab === 3 && (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>Cierre y Retiro</Typography>
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
                            itemsList={itemsList}
                        />
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Asignar un camión de retiro implica que la obra ha concluido o hay escombros por retirar.
                        </Alert>
                    </Box>
                )}
            </Box>
        </Box>
    );
};
