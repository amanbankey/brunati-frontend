import api from './api';

/**
 * adminAuthService — encapsulated API calls for administrative authentication.
 * All functions return a consistent { status, data, message } or similar shape.
 */
export const adminAuthService = {
    /**
     * Attempts to log in an admin.
     * Backend sets an httpOnly cookie on success.
     */
    async login(email, password) {
        try {
            const { data } = await api.post('/admin/login', { email, password }, { withCredentials: true });
            return data; // { status: true, data: { id, name, email, isAdmin }, message }
        } catch (error) {
            throw error;
        }
    },

    /**
     * Checks if the admin is currently authenticated via the httpOnly cookie.
     */
    async checkAuth() {
        try {
            const { data } = await api.get('/admin/check-auth');
            return data; // { status: true, isLoggedIn: true, data: { ... } }
        } catch (error) {
            return { status: false, isLoggedIn: false };
        }
    },

    /**
     * Clears the admin session.
     */
    async logout() {
        try {
            const { data } = await api.post('/admin/logout');
            return data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Resets the admin password using email address.
     */
    async forgotPassword(email, newPassword) {
        try {
            const { data } = await api.post('/admin/forgot-password', { email, newPassword });
            return data;
        } catch (error) {
            throw error;
        }
    }
};
