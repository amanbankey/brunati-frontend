import axios from 'axios';

/**
 * Axios instance for all API calls.
 *
 * Authentication is handled entirely via httpOnly cookies set by the backend.
 * withCredentials: true instructs the browser to include those cookies on
 * every cross-origin request automatically — no manual token handling in JS.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // Sends the httpOnly JWT cookie on every request
});

// Request Interceptor: Attach token if available in localStorage
// This is critical for iOS devices where httpOnly cookies are often blocked.
api.interceptors.request.use(
    (config) => {
        // Fallback: Check for user token or admin token in localStorage
        const userToken = localStorage.getItem('token');
        const adminToken = localStorage.getItem('adminToken');

        // Use adminToken for admin routes, user token for customer routes
        const token = config.url.includes('/admin') ? adminToken : userToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);


/**
 * Response interceptor — handles expired / invalid sessions globally.
 * When the backend returns 401 (token expired or missing), wipe the stale
 * local user profile and redirect to the admin login page automatically.
 * This prevents broken UI when the 7-day session expires naturally.
 */
api.interceptors.response.use(
    (response) => response, // Pass successful responses straight through
    (error) => {
        if (error?.response?.status === 401) {
            const path = window.location.pathname;

            // Handle Admin Session Expiration
            if (path.startsWith('/admin')) {
                // DON'T redirect if:
                // 1. We are already on the login page
                // 2. This is the initial /admin/check-auth call (handled by AuthContext)
                // This prevents the "Login -> Dashboard -> Login" race condition
                const isCheckAuth = error.config.url.includes('/admin/check-auth');

                if (!path.includes('/admin/login') && !isCheckAuth) {
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('adminToken');
                    window.location.href = '/admin/login';
                }
            }
            // Handle Customer Session Expiration
            else {
                // If the user is on a page that likely requires auth (like /account or /checkout)
                // or if they just have a stale user object in storage
                if (!path.includes('/signin') && !path.includes('/signup')) {
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');

                    // Redirect to signin if they were on a protected/dashboard-like page
                    if (path.startsWith('/account') || path.startsWith('/checkout')) {
                        window.location.href = '/signin';
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;



