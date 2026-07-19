import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';

const UserAuthContext = createContext(null);

export const useUserAuth = () => {
    const context = useContext(UserAuthContext);
    if (!context) {
        throw new Error('useUserAuth must be used within a UserAuthProvider');
    }
    return context;
};

export const UserAuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            console.error("Failed to parse user from localStorage:", e);
            localStorage.removeItem('user');
            return null;
        }
    });

    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const response = await userService.checkAuth();
            if (response.status && response.isLoggedIn) {
                // If logged in, get full profile to ensure state is fresh
                const profileRes = await userService.getProfile();
                if (profileRes.status) {
                    const userData = profileRes.data;
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                }
            } else {
                setUser(null);
                localStorage.removeItem('user');
            }
        } catch (error) {
            // Ignore standard 401 rejections for silent checks
            if (error?.response?.status !== 401) {
                console.error('Auth check failed:', error);
            }
            setUser(null);
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (token) {
            localStorage.setItem('token', token);
        }
    };

    const logout = async () => {
        try {
            await userService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
    };

    const value = {
        user,
        isLoggedIn: !!user,
        loading,
        login,
        logout,
        refreshUser: checkAuth
    };

    return (
        <UserAuthContext.Provider value={value}>
            {children}
        </UserAuthContext.Provider>
    );
};
