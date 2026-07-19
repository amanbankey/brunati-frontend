import React, { createContext, useState, useContext, useCallback } from 'react';
import { adminAuthService } from '../services/adminAuthService';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    // Initialise from localStorage so page refreshes don't log the admin out.
    // NOTE: only the non-sensitive user profile is stored here — the JWT lives
    // exclusively in the httpOnly cookie managed by the browser/backend.
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('adminUser');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const isLoginActive = React.useRef(false);

    React.useEffect(() => {
        const verifySession = async () => {
            const isAdminPath = window.location.pathname.startsWith('/admin');
            const hasLocalHint = !!localStorage.getItem('adminUser');

            // Only ping the backend if we are in admin territory OR we have a local session hint
            if (!isAdminPath && !hasLocalHint) return;

            try {
                const response = await adminAuthService.checkAuth();
                
                // CRITICAL: If a manual login happened while this was in flight, 
                // don't let this stale check override the fresh user state.
                if (isLoginActive.current) return;

                if (response.isLoggedIn) {
                    const adminUser = { ...response.data, isAdmin: true };
                    setUser(adminUser);
                    localStorage.setItem('adminUser', JSON.stringify(adminUser));
                } else {
                    // Backend says we are NOT logged in — wipe any stale local session
                    setUser(null);
                    localStorage.removeItem('adminUser');
                    localStorage.removeItem('adminToken');
                }
            } catch (err) {
                if (isLoginActive.current) return;
                
                if (err?.response?.status !== 401) {
                    console.error("Session verification failed:", err);
                }
                
                // On 401 or any other error, wipe the stale local session to be safe
                setUser(null);
                localStorage.removeItem('adminUser');
                localStorage.removeItem('adminToken');
            }
        };
        verifySession();
    }, []);

    /**
     * adminLogin — calls adminAuthService.login.
     */
    const adminLogin = useCallback(async (email, password) => {
        isLoginActive.current = true;
        try {
            const data = await adminAuthService.login(email, password);
            if (data.status) {
                const adminUser = { ...data.data, isAdmin: true };
                setUser(adminUser);
                localStorage.setItem('adminUser', JSON.stringify(adminUser));
                // Handle token if returned in JSON (iOS fallback)
                if (data.token || data.data.token) {
                    localStorage.setItem('adminToken', data.token || data.data.token);
                }
                return { ok: true };
            }
            return { ok: false, message: data.message || 'Login failed' };
        } catch (err) {
            const message = err?.response?.data?.message || 'Server error. Please try again.';
            return { ok: false, message };
        } finally {
            // Short delay before allowing background checks again
            setTimeout(() => {
                isLoginActive.current = false;
            }, 2000);
        }
    }, []);


    /**
     * adminLogout — calls adminAuthService.logout to clear the cookie and wipes state.
     */
    const adminLogout = useCallback(async () => {
        try {
            await adminAuthService.logout();
        } catch {
            // Proceed with local logout regardless
        }
        setUser(null);
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
    }, []);

    return (
        <AuthContext.Provider value={{ user, adminLogin, adminLogout }}>
            {children}
        </AuthContext.Provider>
    );
};
