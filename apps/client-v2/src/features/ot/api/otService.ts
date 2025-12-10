import { api } from '../../../api/axios';
import type { OT } from '../types/ot.types';

export const getOTs = async (): Promise<OT[]> => {
    const response = await api.get('/ottable');
    return response.data;
};

export const createOT = async (ot: Omit<OT, 'id'>): Promise<OT> => {
    const response = await api.post('/ot', ot);
    return response.data;
};

export const uploadOTsCsv = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await api.post('/ot/upload-csv', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': import.meta.env.VITE_API_KEY || ''
        },
    });
};
