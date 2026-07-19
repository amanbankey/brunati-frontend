import api from './api';

export const bannerService = {
    // Public
    getActiveBanners: async () => {
        try {
            const response = await api.get('/banners');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Admin
    getAllBanners: async () => {
        try {
            const response = await api.get('/admin/banners');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    createBanner: async (formData) => {
        try {
            const response = await api.post('/admin/banners', formData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateBanner: async (id, formData) => {
        try {
            const response = await api.put(`/admin/banners/${id}`, formData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    deleteBanner: async (id) => {
        try {
            const response = await api.delete(`/admin/banners/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};
