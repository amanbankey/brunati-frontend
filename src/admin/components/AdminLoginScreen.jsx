import React, { useState } from 'react';
import useAdminAuth from '../hooks/useAdminAuth';

const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif';

/**
 * AdminLoginScreen — White, clean storefront-consistent login.
 */
const AdminLoginScreen = () => {
    const { adminLogin } = useAdminAuth();
    const [username, setUsername] = useState('');
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setTimeout(() => {
            const ok = adminLogin(username, passcode);
            if (!ok) setError('Invalid credentials. Access denied.');
            setLoading(false);
        }, 300);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#fbfbfb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT,
        }}>
            <div style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 0,
                padding: '48px 40px',
                width: '100%',
                maxWidth: 380,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}>
                {/* Lock icon */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 48, height: 48,
                        background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '50%',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 16,
                    }}>
                        <svg width="22" height="22" fill="none" stroke="#1d1d1f" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <h1 style={{
                        fontFamily: FONT, fontSize: '1.1rem', fontWeight: 700,
                        color: '#1d1d1f', margin: 0, letterSpacing: '-0.01em',
                    }}>
                        Admin Access
                    </h1>
                    <p style={{ fontFamily: FONT, fontSize: '0.76rem', color: '#6e6e73', marginTop: 6 }}>
                        Restricted area — authorised personnel only.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 14 }}>
                        <label style={{
                            display: 'block', fontSize: '0.72rem', fontWeight: 600,
                            color: '#6e6e73', marginBottom: 6,
                            textTransform: 'none', letterSpacing: '0.07em',
                            fontFamily: FONT,
                        }}>
                            Username
                        </label>
                        <input
                            type="text"
                            autoComplete="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                background: '#fff', border: '1px solid rgba(0,0,0,0.12)',
                                borderRadius: 0, padding: '10px 14px',
                                color: '#1d1d1f', fontFamily: FONT, fontSize: '0.88rem',
                                outline: 'none', transition: 'border-color 0.2s',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#111'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; }}
                        />
                    </div>

                    <div style={{ marginBottom: 22 }}>
                        <label style={{
                            display: 'block', fontSize: '0.72rem', fontWeight: 600,
                            color: '#6e6e73', marginBottom: 6,
                            textTransform: 'none', letterSpacing: '0.07em',
                            fontFamily: FONT,
                        }}>
                            Passcode
                        </label>
                        <input
                            type="password"
                            autoComplete="current-password"
                            value={passcode}
                            onChange={e => setPasscode(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                background: '#fff', border: '1px solid rgba(0,0,0,0.12)',
                                borderRadius: 0, padding: '10px 14px',
                                color: '#1d1d1f', fontFamily: FONT, fontSize: '0.88rem',
                                outline: 'none', transition: 'border-color 0.2s',
                            }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#111'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; }}
                        />
                    </div>

                    {error && (
                        <p style={{
                            fontSize: '0.76rem', color: '#ff3b30',
                            background: '#fff5f5', border: '1px solid rgba(255,59,48,0.2)',
                            padding: '8px 12px', marginBottom: 16, fontFamily: FONT,
                        }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '13px 0',
                        background: loading ? '#555' : '#111',
                        color: '#fff', fontFamily: FONT,
                        fontSize: '0.82rem', fontWeight: 600,
                        border: '1px solid #111', borderRadius: 0,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        letterSpacing: '0.06em', transition: 'background 0.2s',
                    }}
                        onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#111'; } }}
                        onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff'; } }}
                    >
                        {loading ? 'Verifying…' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginScreen;
