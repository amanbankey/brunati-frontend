import api from './api';

export const trendService = {
    // Public
    getPublicTrends: async () => {
        try {
            const response = await api.get('/trends');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Admin
    getAllTrends: async () => {
        try {
            const response = await api.get('/admin/trends');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    createTrend: async (formData) => {
        try {
            const response = await api.post('/admin/trends', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateTrend: async (id, formData) => {
        try {
            const response = await api.put(`/admin/trends/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteTrend: async (id) => {
        try {
            const response = await api.delete(`/admin/trends/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
