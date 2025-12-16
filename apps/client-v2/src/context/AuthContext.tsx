
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/axios';

interface User {
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
        // Init: Check if token exists
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token) {
            setIsAuthenticated(true);
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) { console.error("Error parsing user data", e) }
            }
        }
        setIsLoading(false);
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
        window.location.href = '/login';
    };

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
