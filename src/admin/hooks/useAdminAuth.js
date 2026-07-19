import { useAuth } from '../../context/AuthContext';

/**
 * useAdminAuth — hook for admin-only data fetching and auth state.
 * Returns { user, isAdmin, adminLogin, adminLogout }.
 */
const useAdminAuth = () => {
    const { user, adminLogin, adminLogout } = useAuth();
    return {
        user,
        isAdmin: user?.isAdmin ?? false,
        adminLogin,
        adminLogout,
    };
};

export default useAdminAuth;
