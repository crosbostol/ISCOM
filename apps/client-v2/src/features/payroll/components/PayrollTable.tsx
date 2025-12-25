import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Typography, Box, IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useGetPayroll } from '../../../api/generated/hooks/useGetPayroll';

export const PayrollTable: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading, refetch } = useGetPayroll();

    const columns: GridColDef[] = [
        {
            field: 'employee_name',
            headerName: 'Nombre',
            flex: 1,
            minWidth: 180
        },
        {
            field: 'employee_rut',
            headerName: 'RUT',
            width: 130
        },
        {
            field: 'employee_role',
            headerName: 'Rol',
            width: 140
        },
        {
            field: 'base_salary',
            headerName: 'Sueldo Base',
            width: 140,
            valueFormatter: (value) => {
                const num = Number(value);
                return `$${new Intl.NumberFormat('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num)}`;
            }
        },
        {
            field: 'current_balance',
            headerName: 'Saldo Actual',
            width: 150,
            renderCell: (params: GridRenderCellParams<any, number>) => {
                const value = Number(params.value ?? 0);
                const formatted = new Intl.NumberFormat('es-CL', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(value);

                return (
                    <Typography
                        fontWeight="bold"
                        color={value > 0 ? 'success.main' : value < 0 ? 'error.main' : 'text.secondary'}
                    >
                        ${formatted}
                    </Typography>
                );
            }
        }
    ];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Personal con Cuenta de Remuneraciones</Typography>
                <Tooltip title="Actualizar">
                    <IconButton onClick={() => refetch()} size="small">
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
                <DataGrid
                    rows={data ?? []}
                    columns={columns}
                    loading={isLoading}
                    getRowId={(row) => row.id ?? row.personnel_id}
                    onRowClick={(params) => navigate(`/payroll/${params.row.personnel_id}`)}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 25 } }
                    }}
                    sx={{
                        '& .MuiDataGrid-row': {
                            cursor: 'pointer'
                        }
                    }}
                />
            </Box>
        </Box>
    );
};
