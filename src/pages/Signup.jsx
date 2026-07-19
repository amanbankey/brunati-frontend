import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';
import { userService } from '../services/userService';

const Signup = () => {
    const navigate = useNavigate();
    const [authChecking, setAuthChecking] = React.useState(true);

    useEffect(() => {
        const checkUserAuth = async () => {
            try {
                const response = await userService.checkAuth();
                if (response.isLoggedIn) {
                    navigate('/account', { replace: true });
                } else {
                    setAuthChecking(false);
                }
            } catch (err) {
                console.error("Auth check failed on signup page", err);
                setAuthChecking(false);
            }
        };
        checkUserAuth();
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [navigate]);

    if (authChecking) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                <div style={{ width: 40, height: 40, border: '2px solid #f3f3f3', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#fff',
            paddingTop: 'var(--header-height, 64px)',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Back link — consistent with Cart and Wishlist pages */}
            <div style={{ maxWidth: 480, width: '100%', margin: '0 auto', padding: '32px 20px 0' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#6e6e73', fontSize: '0.8rem', letterSpacing: '0.5px',
                        padding: 0, transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#1d1d1f'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6e6e73'; }}
                >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back
                </button>
            </div>

            {/* Form centred below the back link */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px 60px' }}>
                <SignupForm />
            </div>
        </div>
    );
};

export default Signup;
