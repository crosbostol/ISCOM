import * as React from 'react';
import { styled } from '@mui/material/styles';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import type { StepIconProps } from '@mui/material/StepIcon';
import Box from '@mui/material/Box';

// Íconos para cada paso
import PlaceIcon from '@mui/icons-material/Place'; // Ubicación
import WaterDropIcon from '@mui/icons-material/WaterDrop'; // Hidráulico
import EngineeringIcon from '@mui/icons-material/Engineering'; // Civil
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; // Retiro
import AssignmentIcon from '@mui/icons-material/Assignment'; // Resumen

// 1. LA TUBERÍA (Conector)
// Hacemos la línea más gruesa y le damos un gradiente cuando está activa
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22, // Alineación con el centro del icono
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage:
                'linear-gradient( 95deg, #009688 0%, #0288d1 100%)', // Teal -> Light Blue
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage:
                'linear-gradient( 95deg, #009688 0%, #0288d1 100%)',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 3, // Grosor de tubería
        border: 0,
        backgroundColor:
            theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
        borderRadius: 1,
        transition: 'all 0.4s ease-in-out', // Animación de llenado
    },
}));

// 2. EL NODO (Icono)
// Estilos para el contenedor del icono
const ColorlibStepIconRoot = styled('div')<{
    ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.3s ease',

    // Sombra suave por defecto
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.15)',

    // ESTADO ACTIVO (La Válvula Brillando)
    ...(ownerState.active && {
        backgroundImage:
            'linear-gradient( 136deg, #009688 0%, #00695c 100%)',
        boxShadow: '0 4px 20px 0 rgba(0, 150, 136, 0.5)', // Glow Teal
        transform: 'scale(1.1)', // Se agranda un poco
    }),

    // ESTADO COMPLETADO
    ...(ownerState.completed && {
        backgroundImage:
            'linear-gradient( 136deg, #009688 0%, #0288d1 100%)', // Mismo gradiente que la tubería
    }),
}));

// Función que elige qué icono mostrar según el paso
function ColorlibStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;

    const icons: { [index: string]: React.ReactElement } = {
        1: <PlaceIcon />,
        2: <WaterDropIcon />,
        3: <EngineeringIcon />,
        4: <LocalShippingIcon />,
        5: <AssignmentIcon />,
    };

    return (
        <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
            {icons[String(props.icon)]}
        </ColorlibStepIconRoot>
    );
}

// 3. COMPONENTE PRINCIPAL EXPORTABLE
interface LiquidStepperProps {
    activeStep: number;
    steps: string[]; // ['Ubicación', 'Hidráulico', 'Civil', 'Resumen']
}

export const LiquidStepper: React.FC<LiquidStepperProps> = ({ activeStep, steps }) => {
    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
}
