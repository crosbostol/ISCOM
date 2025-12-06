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
