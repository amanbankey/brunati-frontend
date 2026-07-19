import api from './api';

export const adminDashboardService = {
    async getDashboardData() {
        try {
            const { data } = await api.get('/admin/dashboard');
            return data;
        } catch (error) {
            throw error;
        }
    }
};
