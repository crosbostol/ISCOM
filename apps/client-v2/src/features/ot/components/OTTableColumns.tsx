import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { Chip, Typography, Box, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import type { OrdenTrabajoDTO } from '../../../api/generated/models/OrdenTrabajoDTO';
import type { MovilDTO } from '../../../api/generated/models/MovilDTO';
import type { Conductor } from '../../../api/generated/models/Conductor';
import { getDaysDiff, getOTStateConfig, isOTDelayed, STATE_CONFIG } from '../utils/otStatusUtils';
import { MovilAssignmentChip } from './MovilAssignmentChip';

export const getColumns = (
    handleEditResources: (ot: OrdenTrabajoDTO) => void,
    movilesMap: Map<string, MovilDTO>,
    conductorsMap: Map<number, Conductor>
): GridColDef<OrdenTrabajoDTO>[] => [
        {
            field: 'id',
            headerName: 'ID',
            width: 140,
            renderCell: (params: GridRenderCellParams<OrdenTrabajoDTO>) => {
                const [copied, setCopied] = useState(false);
                const { external_ot_id, id } = params.row;
                const textToCopy = external_ot_id || `ADICIONAL-${id}`;

                const handleCopy = async (e: React.MouseEvent) => {
                    e.stopPropagation(); // Prevent row selection
                    try {
                        await navigator.clipboard.writeText(textToCopy);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000); // Reset after 2s
                    } catch (err) {
                        console.error('Failed to copy:', err);
                    }
                };

                const content = external_ot_id
                    ? <Typography variant="body2" sx={{ lineHeight: 'normal' }}>{external_ot_id}</Typography>
                    : <Chip label={`ADICIONAL (${id})`} color="secondary" size="small" variant="outlined" />;

                return (
                    <Tooltip
                        title={copied ? "¡Copiado!" : "Click para copiar"}
                        arrow
                        placement="top"
                    >
                        <Box
                            onClick={handleCopy}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                height: '100%',
                                width: '100%',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                    borderRadius: 1,
                                },
                                '&:active': {
                                    backgroundColor: 'action.selected',
                                }
                            }}
                        >
                            {content}
                        </Box>
                    </Tooltip>
                );
            }
        },
        {
            field: 'ot_state',
            headerName: 'Estado',
            flex: 1,
            minWidth: 150,
            type: 'singleSelect',
            valueOptions: Object.entries(STATE_CONFIG).map(([value, config]) => ({
                value,
                label: config.label
            })),
            renderCell: (params: GridRenderCellParams<OrdenTrabajoDTO>) => {
                const stateCode = params.value as string;
                const config = getOTStateConfig(stateCode);

                const daysElapsed = getDaysDiff(params.row.started_at);
                const isDelayed = isOTDelayed(stateCode, params.row.started_at);

                const isObservada = stateCode === 'OBSERVADA';
                // @ts-ignore: observation might be missing in DTO but present in backend response
                const observationText = params.row.observation;

                const finalColor = isDelayed ? 'error' : config.color;
                const finalLabel = isDelayed ? `${config.label} (${daysElapsed}d)` : config.label;

                const chip = (
                    <Chip
                        label={finalLabel}
                        color={finalColor as any}
                        variant={isDelayed ? "filled" : (isObservada ? "outlined" : "filled")}
                        size="small"
                        sx={isObservada ? { borderColor: '#ed6c02', color: '#e65100', fontWeight: 'bold' } : (isDelayed ? { fontWeight: 'bold' } : {})}
                    />
                );

                if (isObservada && observationText) {
                    return (
                        <Tooltip title={observationText} arrow placement="top">
                            {chip}
                        </Tooltip>
                    );
                }
                return chip;
            }
        },
        { field: 'street', headerName: 'Calle', flex: 1, minWidth: 200, editable: true },
        { field: 'number_street', headerName: 'Nro', width: 80, editable: true },
        { field: 'commune', headerName: 'Comuna', flex: 1, minWidth: 120, editable: true },
        {
            field: 'hydraulic_movil_id',
            headerName: 'Móvil Hid.',
            width: 100,
            renderCell: (params: GridRenderCellParams<OrdenTrabajoDTO>) => (
                <MovilAssignmentChip
                    movilId={params.value}
                    movilesMap={movilesMap}
                    conductorsMap={conductorsMap}
                    expectedType="HIDRAULICO"
                />
            )
        },
        {
            field: 'civil_movil_id',
            headerName: 'Móvil Civil',
            width: 100,
            renderCell: (params: GridRenderCellParams<OrdenTrabajoDTO>) => (
                <MovilAssignmentChip
                    movilId={params.value}
                    movilesMap={movilesMap}
                    conductorsMap={conductorsMap}
                    expectedType="OBRA CIVIL"
                />
            )
        },
        {
            field: 'started_at',
            headerName: 'Inicio',
            width: 110,
            valueFormatter: (value: string | undefined) => {
                if (!value) return '';
                const date = new Date(value);
                if (isNaN(date.getTime())) return value;
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Recursos',
            width: 80,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Asignar Recursos"
                    onClick={() => handleEditResources(params.row)}
                />
            ]
        },
    ];
