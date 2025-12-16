
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
        const initAuth = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.get('/auth/profile');
                setUser(response.data);
                setIsAuthenticated(true);
                // Optional: Refresh local storage user data
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
        window.location.href = '/login';
    };

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#121212', // Dark background to match theme
                color: '#4db6ac' // Teal color
            }}>
                <div className="spinner" style={{
                    border: '4px solid rgba(77, 182, 172, 0.1)',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    borderLeftColor: '#4db6ac',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
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
