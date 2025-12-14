import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';

// Types expected by Kubb generated hooks
export type RequestConfig<TData = unknown> = AxiosRequestConfig<TData>;
export type ResponseErrorConfig<TError = unknown> = AxiosError<TError>;

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
    baseURL: BASE_URL,
});

// Interceptor para agregar API Key
api.interceptors.request.use((config) => {
    // Check both standard naming and the one found in .env.production
    const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_API_SECRET_KEY;
    if (apiKey) {
        config.headers['x-api-key'] = apiKey;
    }
    return config;
});

// Custom instance matching Kubb's expected signature
export const customInstance = <TData, _TError = unknown, _TVariables = unknown>(
    config: AxiosRequestConfig,
): Promise<AxiosResponse<TData>> => {
    const source = axios.CancelToken.source();
    const promise = api({
        ...config,
        cancelToken: source.token,
    });

    // @ts-ignore
    promise.cancel = () => {
        source.cancel('Query was cancelled');
    };

    return promise;
};

export default customInstance;
