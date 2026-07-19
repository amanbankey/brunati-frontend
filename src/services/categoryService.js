import api from './api';

export const categoryService = {
    getAllCategories: async () => {
        const response = await api.get(`/admin/categories`);
        return response.data;
    },
    getPublicCategories: async () => {
        const response = await api.get(`/categories`);
        return response.data;
    },
    createCategory: async (data) => {
        const response = await api.post(`/admin/categories`, data);
        return response.data;
    },
    updateCategory: async (id, data) => {
        const response = await api.put(`/admin/categories/${id}`, data);
        return response.data;
    },
    deleteCategory: async (id) => {
        const response = await api.delete(`/admin/categories/${id}`);
        return response.data;
    }
};

