import api from './api';

export const testimonialService = {
    getAll: async () => {
        try {
            const response = await api.get(`/admin/testimonials`);
            return response.data;
        } catch (error) {
            console.error('Fetch testimonials error:', error);
            throw error;
        }
    },

    // Public
    getPublicAll: async () => {
        try {
            const response = await api.get(`/testimonials`);
            return response.data;
        } catch (error) {
            console.error('Fetch public testimonials error:', error);
            throw error;
        }
    },

    create: async (data) => {
        try {
            const response = await api.post(`/admin/testimonials`, data);
            return response.data;
        } catch (error) {
            console.error('Create testimonial error:', error);
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            const response = await api.put(`/admin/testimonials/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Update testimonial error:', error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const response = await api.delete(`/admin/testimonials/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete testimonial error:', error);
            throw error;
        }
    }
};
