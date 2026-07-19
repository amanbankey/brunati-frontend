import api from './api';

export const productService = {
    // Get all products (public)
    getAllProducts: async () => {
        try {
            const response = await api.get('/products');
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Get all products (admin)
    getAllAdminProducts: async () => {
        try {
            const response = await api.get('/admin/products');
            return response.data;
        } catch (error) {
            console.error('Error fetching admin products:', error);
            throw error;
        }
    },

    // Get a specific product by slug
    getProductBySlug: async (slug) => {
        try {
            const encodedSlug = encodeURIComponent(slug);
            const response = await api.get(`/products/${encodedSlug}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product with slug ${slug}:`, error);
            throw error;
        }
    },

    // Get reviews for a specific product
    getReviewsByProduct: async (id) => {
        try {
            const response = await api.get(`/reviews/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching reviews for product ${id}:`, error);
            throw error;
        }
    },

    // Get available free samples
    getAvailableSamples: async () => {
        try {
            const response = await api.get('/samples');
            return response.data;
        } catch (error) {
            console.error('Error fetching available samples:', error);
            throw error;
        }
    },

    // Update product
    updateProduct: async (id, data) => {
        try {
            const response = await api.put(`/admin/products/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating product ${id}:`, error);
            throw error;
        }
    },

    // Create product
    createProduct: async (data) => {
        try {
            const response = await api.post('/admin/products', data);
            return response.data;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    // Delete product
    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/admin/products/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting product ${id}:`, error);
            throw error;
        }
    }
};



export default productService;
