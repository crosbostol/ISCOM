import React from 'react';
import { Chip, Tooltip, Box, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import type { MovilDTO } from '../../../api/generated/models/MovilDTO';
import type { Conductor } from '../../../api/generated/models/Conductor';

interface MovilAssignmentChipProps {
    movilId: number | undefined;
    movilesMap: Map<string, MovilDTO>;
    conductorsMap: Map<number, Conductor>;
    expectedType?: 'HIDRAULICO' | 'OBRA CIVIL';
}

export const MovilAssignmentChip: React.FC<MovilAssignmentChipProps> = ({
    movilId,
    movilesMap,
    conductorsMap,
    expectedType
}) => {
    if (!movilId) return <>-</>;

    const movil = movilesMap.get(movilId.toString());
    if (!movil) return <Typography variant="body2">{movilId}</Typography>;

    const conductor = movil.conductor_id ? conductorsMap.get(movil.conductor_id) : undefined;
    const isWrongType = expectedType && movil.movil_type !== expectedType;

    // Determine chip color
    let chipColor: 'primary' | 'success' | 'warning' | 'default' = 'default';
    if (expectedType === 'HIDRAULICO') {
        chipColor = movil.movil_type === 'HIDRAULICO' ? 'primary' : 'default';
    } else if (expectedType === 'OBRA CIVIL') {
        chipColor = isWrongType ? 'warning' : 'success';
    }

    const tooltipText = conductor
        ? `Conductor: ${conductor.name}${isWrongType ? ' (Tipo Incorrecto)' : ''}`
        : `Sin Conductor asignado${isWrongType ? ' (Tipo Incorrecto)' : ''}`;

    const chip = (
        <Chip
            label={movil.movil_id}
            size="small"
            color={chipColor}
            variant="outlined"
            icon={isWrongType ? <WarningIcon /> : undefined}
        />
    );

    return (
        <Tooltip title={tooltipText} arrow>
            <Box>{chip}</Box>
        </Tooltip>
    );
};
