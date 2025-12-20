import React, { createContext, useContext, useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, Stack } from '@mui/material';
import { api } from '../api/axios';

// Export User interface for use in other components
export interface User {
    id: number;
    username: string;
    role: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (username: string, pass: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                setIsLoading(false);
                return;
            }

            // Optimistic loading: Set user from localStorage immediately
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.warn('Failed to parse stored user:', err);
                }
            }

            // Validate token with API
            try {
                const response = await api.get('/auth/profile');
                setUser(response.data);
                setIsAuthenticated(true);
                // Refresh local storage user data
                localStorage.setItem('user', JSON.stringify(response.data));
            } catch (error) {
                console.error('Token validation failed:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (username: string, pass: string) => {
        try {
            const response = await api.post('/auth/login', { username, password: pass });
            const { token, user: userData } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            setIsAuthenticated(true);
            setUser(userData);
        } catch (error) {
            console.error('Login Failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        // Let Router handle redirection - no forced page reload
    };

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <CircularProgress color="primary" size={48} />
                    <Typography variant="caption" color="text.secondary">
                        Iniciando Sistema...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
