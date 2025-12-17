import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as axios } from '../api/axios';

export interface Movil {
    movil_id: string; // The primary key (Patente)
    external_code?: string; // Nuevo campo "Codigo Externo"
    movil_type: string;
    movil_state: string;
    conductor_id: number | null;
    conductor_name?: string;
}

export type CreateMovilDTO = Omit<Movil, 'conductor_name'>;
export type UpdateMovilDTO = Partial<CreateMovilDTO>;

const fetchMoviles = async (): Promise<Movil[]> => {
    const { data } = await axios.get('/moviles');
    return data;
};

const createMovil = async (newMovil: CreateMovilDTO): Promise<Movil> => {
    const { data } = await axios.post('/moviles', newMovil);
    return data;
};

const updateMovil = async ({ id, data }: { id: string; data: UpdateMovilDTO }): Promise<Movil> => {
    const response = await axios.put(`/moviles/${id}`, data);
    return response.data;
};

const deleteMovil = async (id: string): Promise<void> => {
    await axios.delete(`/moviles/${id}`);
};

export const useMoviles = () => {
    return useQuery({
        queryKey: ['moviles'],
        queryFn: fetchMoviles,
    });
};

export const useCreateMovil = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createMovil,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moviles'] });
        },
    });
};

export const useUpdateMovil = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateMovil,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moviles'] });
        },
    });
};

export const useDeleteMovil = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteMovil,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moviles'] });
        },
    });
};
