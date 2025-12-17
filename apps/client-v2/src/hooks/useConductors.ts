import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as axios } from '../api/axios';

export interface Conductor {
    id: number;
    name: string;
    rut: string;
}

export type CreateConductorDTO = Omit<Conductor, 'id'>;
export type UpdateConductorDTO = Partial<CreateConductorDTO>;

const fetchConductors = async (): Promise<Conductor[]> => {
    const { data } = await axios.get('/conductors');
    return data;
};

const createConductor = async (newConductor: CreateConductorDTO): Promise<Conductor> => {
    const { data } = await axios.post('/conductors', newConductor);
    return data;
};

const updateConductor = async ({ id, data }: { id: number; data: UpdateConductorDTO }): Promise<Conductor> => {
    const response = await axios.put(`/conductors/${id}`, data);
    return response.data;
};

const deleteConductor = async (id: number): Promise<void> => {
    await axios.delete(`/conductors/${id}`);
};

export const useConductors = () => {
    return useQuery({
        queryKey: ['conductors'],
        queryFn: fetchConductors,
    });
};

export const useCreateConductor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createConductor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conductors'] });
        },
    });
};

export const useUpdateConductor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateConductor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conductors'] });
        },
    });
};

export const useDeleteConductor = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteConductor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['conductors'] });
        },
    });
};
