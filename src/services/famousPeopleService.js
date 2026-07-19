import api from './api';

export const famousPeopleService = {
    // Admin
    getAll: async () => {
        try {
            const response = await api.get(`/admin/famous-people`);
            return response.data;
        } catch (error) {
            console.error('Fetch famous people error:', error);
            throw error;
        }
    },

    // Public
    getPublicAll: async () => {
        try {
            const response = await api.get(`/influencers`);
            return response.data;
        } catch (error) {
            console.error('Fetch public influencers error:', error);
            throw error;
        }
    },

    create: async (data) => {
        try {
            const response = await api.post(`/admin/famous-people`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Create famous person error:', error);
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            const response = await api.put(`/admin/famous-people/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            console.error('Update famous person error:', error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await api.delete(`/admin/famous-people/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete famous person error:', error);
            throw error;
        }
    }
};
