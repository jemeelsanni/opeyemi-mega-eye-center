// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

interface User {
    _id: string;
    fullName: string;
    name?: string; // For doctors
    email: string;
    role: string;
    speciality?: string; // For doctors
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    loginDoctor: (email: string, password: string) => Promise<void>;
    register: (fullName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
    updateUser?: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');

            if (storedToken) {
                try {
                    if (userRole === 'doctor') {
                        // Verify doctor token
                        const response = await apiClient.get('/doctors/profile', {
                            headers: {
                                Authorization: `Bearer ${storedToken}`
                            }
                        });
                        setUser({
                            ...response.data.data,
                            role: 'doctor',
                            fullName: response.data.data.name // Ensure compatibility
                        });
                    } else {
                        // Verify admin token
                        const response = await apiClient.get('/auth/me', {
                            headers: {
                                Authorization: `Bearer ${storedToken}`
                            }
                        });
                        setUser(response.data.data);
                    }
                    setToken(storedToken);
                } catch (error) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiClient.post('/auth/login', { email, password });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', user.role);
        setToken(token);
        setUser(user);
    };

    const loginDoctor = async (email: string, password: string) => {
        const response = await apiClient.post('/doctors/login', { email, password });
        const { token, doctor } = response.data;

        // Set user with doctor data
        const doctorUser = {
            _id: doctor._id,
            fullName: doctor.name, // Ensure name mapping for compatibility 
            name: doctor.name,
            email: doctor.email,
            role: 'doctor',
            speciality: doctor.speciality
        };

        localStorage.setItem('token', token);
        localStorage.setItem('userRole', 'doctor');
        setToken(token);
        setUser(doctorUser);
    };

    const register = async (fullName: string, email: string, password: string) => {
        const response = await apiClient.post('/auth/register', { fullName, email, password });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', user.role);
        setToken(token);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        setToken(null);
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
        setUser(prev => {
            if (!prev) return updatedUser;
            return { ...prev, ...updatedUser };
        });
    };

    const value = {
        user,
        token,
        login,
        loginDoctor,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
        updateUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};