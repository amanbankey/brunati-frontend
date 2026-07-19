import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Save, Eye, EyeOff, User, Mail, Phone, Lock, ChevronRight, CheckCircle } from 'lucide-react';
import useAdminAuth from '../hooks/useAdminAuth';
import api from '../../services/api';

const FONT = '"Roboto", sans-serif';

const AdminProfile = () => {
    const { user } = useAdminAuth();
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const [avatarPreview, setAvatarPreview] = useState(user?.profileImage || null);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, newPass: false, confirm: false });
    const [toast, setToast] = useState('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
            if (user.profileImage) setAvatarPreview(user.profileImage);
        }
    }, [user]);

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setErrors(p => ({ ...p, avatar: 'Max file size is 5MB' })); return; }
        setAvatarPreview(URL.createObjectURL(file));
        setErrors(p => ({ ...p, avatar: null }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Name is required';
        if (showPasswordSection) {
            if (passwords.newPass.length < 8) errs.newPass = 'Min 8 characters';
            if (passwords.newPass !== passwords.confirm) errs.confirm = 'Passwords do not match';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        setErrors({});

        try {
            const payload = {
                name: form.name,
                phone: form.phone,
            };

            if (showPasswordSection && passwords.newPass) {
                payload.newPass = passwords.newPass;
            }

            const response = await api.put('/admin/profile', payload);

            if (response.data.status) {
                setToast('Profile updated successfully');
                setTimeout(() => setToast(''), 3500);
                setPasswords({ newPass: '', confirm: '' });
                setShowPasswordSection(false);
            } else {
                setErrors(p => ({ ...p, general: response.data.message || 'Update failed' }));
                setToast('Failed to update profile');
                setTimeout(() => setToast(''), 3500);
            }
        } catch (error) {
            console.error('Update profile error:', error);
            setErrors(p => ({ ...p, general: error.response?.data?.message || 'Server error occurred' }));
            setToast('An error occurred');
            setTimeout(() => setToast(''), 3500);
        } finally {
            setSaving(false);
        }
    };

    const inputStyle = (hasError) => ({
        width: '100%', height: 44, padding: '0 14px',
        border: `1px solid ${hasError ? '#FCA5A5' : '#E5E7EB'}`,
        borderRadius: 8, fontSize: '0.875rem', fontFamily: FONT,
        color: '#111827', background: '#fff', outline: 'none',
        transition: 'border-color 0.15s', boxSizing: 'border-box',
    });

    const labelStyle = {
        display: 'block', fontSize: 10, fontWeight: 700, fontFamily: FONT,
        color: '#374151', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6,
    };

    // Section headers are intentionally lighter than field labels to preserve visual hierarchy
    const sectionLabelStyle = {
        fontSize: 10, fontWeight: 700, fontFamily: FONT,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 20,
    };

    const errText = (key) => errors[key]
        ? <span style={{ fontSize: 11, color: '#EF4444', fontFamily: FONT, marginTop: 4, display: 'block' }}>{errors[key]}</span>
        : null;

    const initials = form.name?.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'A';

    return (
        <div style={{ background: '#F4F6F8', minHeight: '100vh', fontFamily: FONT }}>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
                    background: '#111827', color: '#fff', borderRadius: 10, padding: '11px 22px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    fontSize: '0.875rem', fontWeight: 700, zIndex: 9999,
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', animation: 'slideDown 0.3s ease',
                    whiteSpace: 'nowrap'
                }}>
                    <CheckCircle size={14} color="#4ADE80" strokeWidth={3} />
                    {toast}
                </div>
            )}

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 60px' }}>

                {/* Breadcrumb — compact */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8, color: '#D1D5DB', fontSize: '0.72rem' }}>
                    <Link to="/admin/dashboard" style={{ color: '#D1D5DB', textDecoration: 'none', fontFamily: FONT }}>Admin</Link>
                    <ChevronRight size={12} strokeWidth={1.5} />
                    <span style={{ color: '#9CA3AF', fontWeight: 400 }}>Profile</span>
                </div>

                {/* Page Title — tight */}
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 16px', letterSpacing: '-0.025em', fontFamily: FONT }}>
                    Account Settings
                </h1>

                <form onSubmit={handleSave}>
                    {/* Main Card */}
                    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>

                        {/* Side-by-side layout on desktop */}
                        <div className="profile-layout">

                            {/* ── LEFT COLUMN: Avatar ── */}
                            <div className="profile-left">
                                <p style={sectionLabelStyle}>Profile Photo</p>

                                {/* Avatar circle */}
                                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 14 }}>
                                    <div
                                        style={{
                                            width: 96, height: 96, borderRadius: '50%',
                                            border: '2px solid #E5E7EB', overflow: 'hidden',
                                            background: '#F9FAFB', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem', fontWeight: 700, color: '#374151',
                                            position: 'relative', fontFamily: FONT,
                                        }}
                                    >
                                        {avatarPreview
                                            ? <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <span>{initials}</span>
                                        }
                                    </div>
                                </div>


                                {/* Admin role badge */}
                                <div style={{
                                    marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 5,
                                    background: '#F3F4F6', borderRadius: 100, padding: '4px 10px',
                                }}>
                                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', flexShrink: 0 }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#374151', fontFamily: FONT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        Admin
                                    </span>
                                </div>
                            </div>

                            {/* ── RIGHT COLUMN: Form ── */}
                            <div className="profile-right">
                                <p style={sectionLabelStyle}>Personal Information</p>

                                {/* 2-col form grid */}
                                <div className="form-grid">

                                    {/* Full Name */}
                                    <div>
                                        <label style={labelStyle}>Full Name</label>
                                        <input
                                            style={inputStyle(errors.name)}
                                            value={form.name}
                                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                            onFocus={e => e.target.style.borderColor = '#000'}
                                            onBlur={e => e.target.style.borderColor = errors.name ? '#FCA5A5' : '#E5E7EB'}
                                            placeholder="Your full name"
                                        />
                                        {errText('name')}
                                    </div>

                                    {/* Email — read-only */}
                                    <div>
                                        <label style={labelStyle}>Email Address</label>
                                        <input
                                            style={{ ...inputStyle(false), background: 'rgba(249,250,251,0.8)', color: '#9CA3AF', cursor: 'not-allowed', borderStyle: 'dashed' }}
                                            value={form.email}
                                            readOnly
                                            title="Email cannot be changed"
                                        />
                                        <span style={{ fontSize: 10, color: '#9CA3AF', fontFamily: FONT, marginTop: 4, display: 'block' }}>
                                            Contact support to update.
                                        </span>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label style={labelStyle}>Phone Number</label>
                                        <input
                                            style={inputStyle(false)}
                                            value={form.phone}
                                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                            onFocus={e => e.target.style.borderColor = '#000'}
                                            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                                            placeholder="+91 00000 00000"
                                            type="tel"
                                        />
                                    </div>

                                    {/* Password toggle */}
                                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordSection(p => !p)}
                                            style={{
                                                height: 44, width: '100%',
                                                background: showPasswordSection ? '#000' : '#fff',
                                                border: '1px solid #E5E7EB', borderRadius: 8,
                                                fontSize: '0.78rem', fontWeight: 700, fontFamily: FONT,
                                                color: showPasswordSection ? '#fff' : '#374151',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', gap: 8, transition: 'all 0.2s',
                                            }}
                                        >
                                            <Lock size={13} strokeWidth={2} />
                                            {showPasswordSection ? 'Cancel' : 'Change Password'}
                                        </button>
                                    </div>
                                </div>

                                {/* Password section — full width within right column */}
                                {showPasswordSection && (
                                    <div style={{ animation: 'fadeIn 0.25s ease' }}>
                                        <div style={{ height: 1, background: '#F3F4F6', margin: '20px 0' }} />
                                        <p style={{ ...labelStyle, marginBottom: 16 }}>Change Password</p>
                                        <div className="form-grid">
                                            {[
                                                { key: 'newPass', label: 'New Password', placeholder: 'Min 8 characters' },
                                                { key: 'confirm', label: 'Confirm New Password', placeholder: '••••••••' },
                                            ].map(({ key, label, placeholder }) => (
                                                <div key={key}>
                                                    <label style={labelStyle}>{label}</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type={showPw[key] ? 'text' : 'password'}
                                                            value={passwords[key]}
                                                            onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                                                            onFocus={e => e.target.style.borderColor = '#000'}
                                                            onBlur={e => e.target.style.borderColor = errors[key] ? '#FCA5A5' : '#E5E7EB'}
                                                            placeholder={placeholder}
                                                            style={{ ...inputStyle(errors[key]), paddingRight: 42 }}
                                                        />
                                                        <button type="button" onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                                                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}>
                                                            {showPw[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                                                        </button>
                                                    </div>
                                                    {errText(key)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Save button — bottom of right column */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="save-btn"
                                        style={{
                                            background: saving ? '#374151' : '#000', color: '#fff',
                                            border: 'none', borderRadius: 8, padding: '9px 24px',
                                            fontSize: '0.72rem', fontWeight: 700, fontFamily: FONT,
                                            letterSpacing: '0.1em', textTransform: 'uppercase',
                                            cursor: saving ? 'not-allowed' : 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            transition: 'opacity 0.15s, transform 0.1s', minWidth: 140,
                                        }}
                                    >
                                        {saving ? (
                                            <>
                                                <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                                Saving…
                                            </>
                                        ) : (
                                            <>
                                                <Save size={13} strokeWidth={2.5} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

                /* ── Layout ── */
                .profile-layout {
                    display: flex;
                    flex-direction: column;
                }
                .profile-left {
                    padding: 28px 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    border-bottom: 1px solid #F3F4F6;
                }
                .profile-right {
                    padding: 28px 24px;
                    flex: 1;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 18px;
                }

                /* ── Desktop Split ── */
                @media (min-width: 768px) {
                    .profile-layout {
                        flex-direction: row;
                        align-items: stretch;
                    }
                    .profile-left {
                        width: 33%;
                        min-width: 200px;
                        border-bottom: none;
                        border-right: 1px solid #F3F4F6;
                        align-items: flex-start;
                        padding: 32px 28px;
                    }
                    .profile-right {
                        padding: 32px 32px;
                    }
                    .form-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 16px 20px;
                    }
                }

                /* ── Avatar hover ── */
                .profile-left div:hover .avatar-overlay { opacity: 1 !important; }

                /* ── Animations ── */
                @keyframes slideDown { from { opacity:0; transform:translate(-50%,-10px); } to { opacity:1; transform:translate(-50%,0); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin { to { transform:rotate(360deg); } }

                /* ── Save button ── */
                .save-btn:hover:not(:disabled) { opacity: 0.82; }
                .save-btn:active:not(:disabled) { transform: scale(0.98); }
                @media (max-width: 767px) {
                    .save-btn { width: 100% !important; justify-content: center; }
                }
            `}</style>
        </div>
    );
};

export default AdminProfile;
