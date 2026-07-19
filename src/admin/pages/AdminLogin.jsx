import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminAuth from '../hooks/useAdminAuth';
import { toast } from 'react-hot-toast';
import { adminAuthService } from '../../services/adminAuthService';

const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif';

/**
 * AdminLogin — dedicated /admin/login page.
 * Independent of the customer auth flow.
 * Minimalist "Staff Entry" look: white, black borders, 0px radius.
 */
const AdminLogin = () => {
    const { adminLogin, user } = useAdminAuth();
    const navigate = useNavigate();
    
    // If already logged in, skip the sign-in page
    React.useEffect(() => {
        if (user && user.isAdmin) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const [view, setView] = useState('login'); // 'login' or 'forgot'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await adminLogin(email, password);

        if (result.ok) {
            toast.success('Sign-in successful');
            setTimeout(() => {
                navigate('/admin/dashboard', { replace: true });
            }, 1200); 
        } else {
            toast.error(result.message || 'Invalid credentials');
        }

        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!forgotEmail || !newPassword) {
            toast.error('Please fill in all fields');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const result = await adminAuthService.forgotPassword(forgotEmail, newPassword);
            if (result.status) {
                toast.success('Password reset successful. Please sign in.');
                setView('login');
                setForgotEmail('');
                setNewPassword('');
            } else {
                toast.error(result.message || 'Failed to reset password');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#ffffff',
            display: 'flex',
            fontFamily: FONT,
        }}>
            {/* Left decorative panel */}
            <div style={{
                display: 'none',
                width: '40%',
                background: '#1d1d1f',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '48px',
            }}
                className="admin-login-panel"
            >
                <div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'none', margin: 0 }}>
                        Brunati
                    </p>
                    <p style={{ fontFamily: '"Roboto", sans-serif', color: '#ffffff', fontSize: '1.4rem', fontWeight: 700, margin: '4px 0 0', textTransform: 'none', letterSpacing: 'normal' }}>
                        Admin panel
                    </p>
                </div>
                <div>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', letterSpacing: '0.04em', lineHeight: 1.6 }}>
                        Restricted access. Authorised staff only.<br />
                        All sessions are logged.
                    </p>
                </div>
            </div>

            {/* Right — form panel */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
            }}>
                <div style={{ width: '100%', maxWidth: 360 }}>

                    {/* Header */}
                    <div style={{ marginBottom: 40 }}>
                        <p style={{
                            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em',
                            textTransform: 'none', color: '#6e6e73', margin: '0 0 10px',
                        }}>
                            Brunati · Staff Entry
                        </p>
                        <h1 style={{
                            fontFamily: '"Roboto", sans-serif',
                            fontSize: '1.4rem', fontWeight: 700, color: '#1d1d1f',
                            margin: 0, textTransform: 'none', letterSpacing: 'normal', lineHeight: 1.2,
                        }}>
                            {view === 'login' ? <>Sign in to<br />Admin panel</> : <>Reset Admin<br />Password</>}
                        </h1>
                    </div>

                    {view === 'login' ? (
                        <form onSubmit={handleSubmit} noValidate>
                            {/* Email */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{
                                    display: 'block', fontSize: '0.72rem', fontWeight: 600,
                                    color: '#6e6e73', marginBottom: 8,
                                    textTransform: 'none', letterSpacing: '0.07em',
                                }}>
                                    Email Address
                                </label>
                                <input
                                    id="admin-email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="staff@brunati.com"
                                    required
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        background: '#fff',
                                        border: '1px solid rgba(0,0,0,0.15)',
                                        borderRadius: 0,
                                        padding: '12px 14px',
                                        color: '#1d1d1f', fontFamily: FONT, fontSize: '0.92rem',
                                        outline: 'none', transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => { e.currentTarget.style.borderColor = '#111'; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                                />
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: 8 }}>
                                <label style={{
                                    display: 'block', fontSize: '0.72rem', fontWeight: 600,
                                    color: '#6e6e73', marginBottom: 8,
                                    textTransform: 'none', letterSpacing: '0.07em',
                                }}>
                                    Password
                                </label>
                                <input
                                    id="admin-password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••••"
                                    required
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        background: '#fff',
                                        border: '1px solid rgba(0,0,0,0.15)',
                                        borderRadius: 0,
                                        padding: '12px 14px',
                                        color: '#1d1d1f', fontFamily: FONT, fontSize: '0.92rem',
                                        outline: 'none', transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => { e.currentTarget.style.borderColor = '#111'; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                                />
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: 24 }}>
                                <button
                                    id="admin-forgot-password-link"
                                    type="button"
                                    onClick={() => setView('forgot')}
                                    style={{
                                        background: 'none', border: 'none', padding: 0,
                                        color: '#6e6e73', fontSize: '0.7rem', cursor: 'pointer',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Submit */}
                            <button
                                id="admin-login-btn"
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '14px 0',
                                    background: loading ? '#555' : '#111',
                                    color: '#fff', fontFamily: FONT,
                                    fontSize: '0.85rem', fontWeight: 600,
                                    border: '1px solid #111', borderRadius: 0,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    letterSpacing: '0.06em', transition: 'all 0.25s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111'; } }}
                                onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff'; } }}
                            >
                                {loading ? (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ animation: 'spin 0.8s linear infinite' }}>
                                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                        </svg>
                                        Verifying…
                                    </>
                                ) : 'Staff Login'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} noValidate>
                            {/* Email */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{
                                    display: 'block', fontSize: '0.72rem', fontWeight: 600,
                                    color: '#6e6e73', marginBottom: 8,
                                    textTransform: 'none', letterSpacing: '0.07em',
                                }}>
                                    Registered Email Address
                                </label>
                                <input
                                    type="email"
                                    value={forgotEmail}
                                    onChange={e => setForgotEmail(e.target.value)}
                                    placeholder="staff@brunati.com"
                                    required
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        background: '#fff',
                                        border: '1px solid rgba(0,0,0,0.15)',
                                        borderRadius: 0,
                                        padding: '12px 14px',
                                        color: '#1d1d1f', fontFamily: FONT, fontSize: '0.92rem',
                                        outline: 'none', transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => { e.currentTarget.style.borderColor = '#111'; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                                />
                            </div>

                            {/* New Password */}
                            <div style={{ marginBottom: 28 }}>
                                <label style={{
                                    display: 'block', fontSize: '0.72rem', fontWeight: 600,
                                    color: '#6e6e73', marginBottom: 8,
                                    textTransform: 'none', letterSpacing: '0.07em',
                                }}>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="min 8 characters"
                                    required
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        background: '#fff',
                                        border: '1px solid rgba(0,0,0,0.15)',
                                        borderRadius: 0,
                                        padding: '12px 14px',
                                        color: '#1d1d1f', fontFamily: FONT, fontSize: '0.92rem',
                                        outline: 'none', transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => { e.currentTarget.style.borderColor = '#111'; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
                                />
                            </div>

                            {/* Submit Reset */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '14px 0',
                                    background: loading ? '#555' : '#111',
                                    color: '#fff', fontFamily: FONT,
                                    fontSize: '0.85rem', fontWeight: 600,
                                    border: '1px solid #111', borderRadius: 0,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    letterSpacing: '0.06em', transition: 'all 0.25s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111'; } }}
                                onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff'; } }}
                            >
                                {loading ? 'Resetting…' : 'Update Password'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setView('login')}
                                style={{
                                    width: '100%', marginTop: 12, padding: '10px 0',
                                    background: 'none', border: 'none',
                                    color: '#6e6e73', fontFamily: FONT, fontSize: '0.75rem',
                                    cursor: 'pointer', textDecoration: 'underline'
                                }}
                            >
                                Back to Login
                            </button>
                        </form>
                    )}

                    <p style={{
                        marginTop: 32, fontSize: '0.7rem', color: '#9ca3af',
                        textAlign: 'center', lineHeight: 1.6,
                    }}>
                        Restricted access. This page is not linked from the public site.<br />
                        All login attempts are monitored.
                    </p>
                </div>
            </div>

            {/* Spinning animation for loading */}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (min-width: 769px) {
                    .admin-login-panel { display: flex !important; }
                }
            `}</style>
        </div>
    );
};

export default AdminLogin;
