import api from './api';

export const userService = {
    login: async (credentials) => {
        try {
            const response = await api.post('/users/login', credentials);
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    forgotPassword: async (data) => {
        try {
            const response = await api.post('/users/forgot-password', data);
            return response.data;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/users/register', userData);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            const response = await api.post('/users/logout');
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/users/me');
            return response.data;
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    updateAddress: async (addressData) => {
        try {
            const response = await api.put('/users/me/address', addressData);
            return response.data;
        } catch (error) {
            console.error('Update address error:', error);
            throw error;
        }
    },

    checkAuth: async () => {
        try {
            const response = await api.get('/users/check-auth');
            return response.data;
        } catch (error) {
            console.error('Check auth error:', error);
            throw error;
        }
    },

    getUserOrders: async () => {
        try {
            const response = await api.get('/users/orders');
            return response.data;
        } catch (error) {
            console.error('Get user orders error:', error);
            throw error;
        }
    }
};


export default userService;
