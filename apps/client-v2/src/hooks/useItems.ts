import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as axios } from '../api/axios';

export interface Item {
    item_id: number; // Serial ID
    description: string;
    item_value: number;
    item_type?: string;
    item_unit?: string;
}

export type CreateItemDTO = Omit<Item, 'item_id'>;
export type UpdateItemDTO = Partial<Omit<Item, 'item_id'>>;

const fetchItems = async (): Promise<Item[]> => {
    const { data } = await axios.get('/items');
    return data;
};

const createItem = async (newItem: CreateItemDTO): Promise<Item> => {
    const { data } = await axios.post('/items', newItem);
    return data;
};

const updateItem = async ({ id, data }: { id: number; data: UpdateItemDTO }): Promise<Item> => {
    const response = await axios.put(`/items/${id}`, data);
    return response.data;
};

const deleteItem = async (id: number): Promise<void> => {
    await axios.delete(`/items/${id}`);
};

export const useItems = () => {
    return useQuery({
        queryKey: ['items'],
        queryFn: fetchItems,
    });
};

export const useCreateItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
        },
    });
};

export const useUpdateItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
        },
    });
};

export const useDeleteItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
        },
    });
};
