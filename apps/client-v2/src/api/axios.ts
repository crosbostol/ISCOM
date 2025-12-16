import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';

// Types expected by Kubb generated hooks
export type RequestConfig<TData = unknown> = AxiosRequestConfig<TData>;
export type ResponseErrorConfig<TError = unknown> = AxiosError<TError>;

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
    baseURL: BASE_URL,
});

// Interceptor para agregar API Key
// Interceptor to add Authorization Header (JWT)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor to handle 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear session and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user'); // Optional: Clear user data if stored

            // Avoid redirect loops if already on login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

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
