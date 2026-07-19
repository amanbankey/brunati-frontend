import api from './api';

export const orderService = {
    createOrder: async (orderData) => {
        try {
            const response = await api.post('/orders', orderData);
            return response.data;
        } catch (error) {
            console.error('Create order error:', error);
            throw error;
        }
    },

    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Get order error:', error);
            throw error;
        }
    },

    cancelOrder: async (orderId) => {
        try {
            const response = await api.post(`/orders/${orderId}/cancel`);
            return response.data;
        } catch (error) {
            console.error('Cancel order error:', error);
            throw error;
        }
    },

    // Admin Operations
    getAdminOrders: async (params = {}) => {
        try {
            const response = await api.get('/admin/orders', { params });
            return response.data;
        } catch (error) {
            console.error('Fetch admin orders error:', error);
            throw error;
        }
    },

    getAdminOrderDetails: async (orderId) => {
        try {
            const response = await api.get(`/admin/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Fetch admin order detail error:', error);
            throw error;
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await api.patch(`/admin/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Update order status error:', error);
            throw error;
        }
    },

    updatePaymentStatus: async (orderId, status) => {
        try {
            const response = await api.patch(`/admin/orders/${orderId}/payment-status`, { status });
            return response.data;
        } catch (error) {
            console.error('Update payment status error:', error);
            throw error;
        }
    },

    bulkUpdateOrders: async (orderIds, updates) => {
        try {
            const response = await api.patch('/admin/orders/bulk-update', { orderIds, updates });
            return response.data;
        } catch (error) {
            console.error('Bulk update orders error:', error);
            throw error;
        }
    },


    bulkDeleteOrders: async (orderIds) => {
        try {
            const response = await api.delete('/admin/orders/bulk-delete', { data: { orderIds } });
            return response.data;
        } catch (error) {
            console.error('Bulk delete orders error:', error);
            throw error;
        }
    }
};


export default orderService;
