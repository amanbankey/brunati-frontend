import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { orderService } from '../services/orderService';
import { useUserAuth } from '../context/UserAuthContext';
import toast from 'react-hot-toast';

/* ─── Font: same SF Pro / system stack as Cart & Wishlist ─── */
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif';

/* ─────────────── CONFIRM DIALOG ─────────────── */
const ConfirmDialog = ({ dialog, onConfirm, onDismiss }) => {
    if (!dialog) return null;
    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9900,
                background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20,
            }}
            onClick={onDismiss}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#fff', borderRadius: 14, padding: '32px 28px',
                    maxWidth: 380, width: '100%',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
                    fontFamily: FONT,
                    animation: 'dialogIn 0.22s cubic-bezier(.22,1,.36,1)',
                }}
            >
                <style>{`@keyframes dialogIn{from{opacity:0;transform:scale(.95)translateY(8px)}to{opacity:1;transform:scale(1)translateY(0)}}`}</style>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9CA3AF', marginBottom: 12 }}>
                    {dialog.danger ? '⚠️ Action Required' : 'Confirm'}
                </p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111', marginBottom: 8, lineHeight: 1.4 }}>{dialog.title}</p>
                <p style={{ fontSize: '0.82rem', color: '#6e6e73', marginBottom: 28, lineHeight: 1.65 }}>{dialog.message}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={onConfirm}
                        autoFocus
                        style={{
                            flex: 1, padding: '11px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: dialog.danger ? '#D7373F' : '#111', color: '#fff',
                            fontFamily: FONT, fontSize: '0.78rem', fontWeight: 700,
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                            transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >
                        {dialog.confirmLabel || 'Confirm'}
                    </button>
                    <button
                        onClick={onDismiss}
                        style={{
                            flex: 1, padding: '11px 0', borderRadius: 8,
                            border: '1px solid #E5E7EB', cursor: 'pointer',
                            background: '#fff', color: '#374151',
                            fontFamily: FONT, fontSize: '0.78rem', fontWeight: 600,
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};



const EMPTY_ADDRESS = { name: '', phone: '', alternatePhone: '', email: '', address1: '', city: '', state: '', pin: '' };

/* ─────────────── Address Validation (same as Checkout) ─────────────── */
const validateAddress = (addr) => {
    const errors = {};
    if (!addr.name.trim() || addr.name.trim().length < 2)
        errors.name = 'Full name must be at least 2 characters.';
    else if (!/^[a-zA-Z\s.'-]+$/.test(addr.name.trim()))
        errors.name = "Name can only contain letters, spaces, or . ' -";
    const phoneDigits = addr.phone.replace(/[\s+\-()]/g, '');
    if (!phoneDigits)
        errors.phone = 'Phone number is required.';
    else if (!/^(91)?[6-9]\d{9}$/.test(phoneDigits))
        errors.phone = 'Enter a valid 10-digit Indian mobile number.';
    if (!addr.email.trim())
        errors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email.trim()))
        errors.email = 'Enter a valid email address.';
    if (addr.alternatePhone && addr.alternatePhone.trim() !== '') {
        const altDigits = addr.alternatePhone.replace(/[\s+\-()]/g, '');
        if (!/^(91)?[6-9]\d{9}$/.test(altDigits)) errors.alternatePhone = 'Enter a valid alternate mobile number.';
    }
    if (!addr.address1.trim() || addr.address1.trim().length < 5)
        errors.address1 = 'Address must be at least 5 characters.';
    if (!addr.city.trim() || addr.city.trim().length < 2)
        errors.city = 'City is required (min 2 characters).';
    else if (!/^[a-zA-Z\s]+$/.test(addr.city.trim()))
        errors.city = 'City name can only contain letters.';
    if (!addr.state.trim() || addr.state.trim().length < 2)
        errors.state = 'State is required (min 2 characters).';
    else if (!/^[a-zA-Z\s]+$/.test(addr.state.trim()))
        errors.state = 'State name can only contain letters.';
    if (!addr.pin.trim())
        errors.pin = 'Pincode is required.';
    else if (!/^[1-9][0-9]{5}$/.test(addr.pin.trim()))
        errors.pin = 'Enter a valid 6-digit Indian pincode.';
    return errors;
};

const STATUS_STEPS = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];

const MOCK_ORDERS = [
    {
        id: 'BRN-2026-4821',
        date: '21 Mar 2026',
        status: 'Shipped',
        items: [{ name: 'Dominus', size: '100ml', price: 12999, image: '/media/dominus/D1.png' }],
        total: 12999,
    },
    {
        id: 'BRN-2026-3105',
        date: '15 Mar 2026',
        status: 'Delivered',
        items: [
            { name: 'Mestia', size: '50ml', price: 8999, image: '/media/mestia/M1.png' },
            { name: 'Lunara', size: '100ml', price: 11499, image: '/media/lunara/L1.png' },
        ],
        total: 20498,
    },
    {
        id: 'BRN-2026-1047',
        date: '02 Mar 2026',
        status: 'Delivered',
        items: [{ name: 'Etoile', size: '100ml', price: 13499, image: '/media/etoile/E1.png' }],
        total: 13499,
    },
];

/* ─────────────── Nav items ─────────────── */
const NAV_ITEMS = [
    {
        key: 'profile',
        label: 'My Profile',
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
    {
        key: 'orders',
        label: 'My Orders',
        icon: (
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
    },
];

/* ─────────────── Back Button (Cart-page style) ─────────────── */
const BackButton = ({ label, onClick }) => (
    <button
        onClick={onClick}
        style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6e6e73', fontSize: '0.8rem', letterSpacing: '0.5px',
            fontFamily: FONT, padding: 0, transition: 'color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#1d1d1f'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#6e6e73'; }}
    >
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        {label}
    </button>
);

/* ─────────────── Text-underline action button ─────────────── */
const TextBtn = ({ children, onClick }) => (
    <button
        onClick={onClick}
        type="button"
        style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: FONT, fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: '#111', textDecoration: 'underline', padding: 0,
            transition: 'color 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#555'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#111'; }}
    >
        {children}
    </button>
);

/* ─────────────── Status Badge ─────────────── */
const StatusBadge = ({ status }) => {
    const cfg = {
        Delivered: { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
        Shipped: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
        Confirmed: { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
        Placed: { bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB' },
        Cancelled: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
    }[status] || { bg: '#F9FAFB', color: '#6B7280', border: '#E5E7EB' };
    return (
        <span style={{
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', padding: '3px 10px',
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.border}`, borderRadius: 4,
            fontFamily: FONT,
        }}>
            {status}
        </span>
    );
};

/* ─────────────── Section heading ─────────────── */
const SectionHead = ({ title, sub }) => (
    <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #EEEEEE' }}>
        <h2 style={{
            fontFamily: FONT, fontSize: '1.2rem', fontWeight: 700,
            color: '#111', margin: 0, letterSpacing: '-0.01em',
        }}>{title}</h2>
        {sub && <p style={{ fontFamily: FONT, fontSize: '0.75rem', color: '#6e6e73', marginTop: 4 }}>{sub}</p>}
    </div>
);

/* ─────────────── Status Tracker ─────────────── */
const StatusTracker = ({ currentStatus }) => {
    const currentIdx = STATUS_STEPS.indexOf(currentStatus);
    return (
        <div style={{
            padding: '24px 0 28px',
            borderBottom: '1px solid #EEEEEE',
            marginBottom: 24,
        }}>
            <p style={{ fontFamily: FONT, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: 20 }}>
                Order Status
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                <div style={{
                    position: 'absolute', top: 8, left: '12.5%', right: '12.5%',
                    height: 2, background: '#E5E7EB', zIndex: 0,
                }}>
                    <div style={{
                        height: '100%',
                        width: `${(currentIdx / (STATUS_STEPS.length - 1)) * 100}%`,
                        background: '#111',
                        transition: 'width 0.5s ease',
                    }} />
                </div>
                {STATUS_STEPS.map((step, idx) => {
                    const done = idx <= currentIdx;
                    const active = idx === currentIdx;
                    return (
                        <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                            <div style={{
                                width: 18, height: 18, borderRadius: '50%',
                                border: `2px solid ${done ? '#111' : '#D1D5DB'}`,
                                background: done ? '#111' : '#fff',
                                marginBottom: 10,
                                transition: 'all 0.3s ease',
                                boxShadow: active ? '0 0 0 4px rgba(0,0,0,0.08)' : 'none',
                            }} />
                            <span style={{
                                fontFamily: FONT,
                                fontSize: '0.68rem',
                                fontWeight: active ? 800 : 500,
                                color: active ? '#111' : '#9CA3AF',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                textAlign: 'center',
                            }}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ─────────────── ORDER DETAIL ─────────────── */
const OrderDetail = ({ order, onBack, onCancel }) => (
    <div>
        <div style={{ marginBottom: 24 }}>
            <BackButton label="Back to Orders" onClick={onBack} />
        </div>
        <SectionHead
            title={`Order ${order.id}`}
            sub={`Placed on ${order.date}`}
        />
        {order.status === 'Cancelled' ? (
            <div style={{ margin: '24px 0', padding: '16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 4, textAlign: 'center' }}>
                <p style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#DC2626', margin: 0 }}>This order has been cancelled.</p>
            </div>
        ) : (
            <StatusTracker currentStatus={order.status} />
        )}

        {order.items.map((item, idx) => (
            <div key={idx} style={{
                display: 'flex', gap: 16, alignItems: 'center',
                padding: '20px 0', borderBottom: '1px solid #EEEEEE',
            }}>
                <div style={{
                    width: 76, height: 76, background: '#F3F4F6', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 4,
                }}>
                    <img src={item.image} alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 4 }}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.82rem', color: '#111', marginBottom: 4 }}>{item.name}</p>
                    <p style={{ fontFamily: FONT, fontSize: '0.72rem', color: '#6e6e73' }}>Size: {item.size}</p>
                </div>
                <p style={{ fontFamily: FONT, fontWeight: 600, fontSize: '0.82rem', color: '#111' }}>
                    ₹ {item.price.toLocaleString('en-IN')}.00
                </p>
            </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '20px 0' }}>
            <div>
                {['Placed', 'Confirmed'].includes(order.status) && (
                    <button
                        onClick={onCancel}
                        style={{
                            background: '#fff', color: '#D7373F', border: '1px solid #D7373F',
                            padding: '8px 16px', borderRadius: 4, cursor: 'pointer',
                            fontFamily: FONT, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                    >
                        Cancel Order
                    </button>
                )}
            </div>
            <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: FONT, fontSize: '0.72rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    Order Total
                </p>
                <p style={{ fontFamily: FONT, fontSize: '1.1rem', fontWeight: 700, color: '#111', margin: 0 }}>
                    ₹ {order.total.toLocaleString('en-IN')}.00
                </p>
            </div>
        </div>
    </div>
);

/* ─────────────── ORDERS VIEW ─────────────── */
const OrdersView = ({ orders = [], onCancelOrder }) => {
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Update selectedOrder dynamically if it gets cancelled in background
    useEffect(() => {
        if (selectedOrder) {
            const updated = orders.find(o => o.id === selectedOrder.id);
            if (updated) setSelectedOrder(updated);
        }
    }, [orders]);

    if (selectedOrder) {
        return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} onCancel={() => onCancelOrder(selectedOrder.id)} />;
    }

    return (
        <div>
            <SectionHead title="My Orders" sub={`${orders.length} orders placed`} />
            {orders.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', textAlign: 'center' }}>
                    <svg width="48" height="48" fill="none" stroke="#D1D5DB" viewBox="0 0 24 24" strokeWidth={1.2} style={{ marginBottom: 16 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                    </svg>
                    <p style={{ fontFamily: FONT, color: '#9CA3AF', fontSize: '0.9rem' }}>No orders placed yet.</p>
                </div>
            ) : (
                <div>
                    {orders.map(order => (
                        <button
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                width: '100%', padding: '20px 16px',
                                background: 'none', border: 'none', borderBottom: '1px solid #EEEEEE',
                                cursor: 'pointer', textAlign: 'left', gap: 16,
                                borderRadius: 0, transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                    width: 44, height: 44, background: '#F3F4F6', borderRadius: 4,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <svg width="18" height="18" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <div>
                                    <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.8rem', color: '#111', marginBottom: 4 }}>
                                        {order.id}
                                    </p>
                                    <p style={{ fontFamily: FONT, fontSize: '0.72rem', color: '#6e6e73' }}>
                                        {order.date} · {order.items.length} item{order.items.length > 1 ? 's' : ''} ·
                                         ₹ {order.total.toLocaleString('en-IN')}.00
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                                <StatusBadge status={order.status} />
                                <svg width="14" height="14" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─────────────── PROFILE VIEW (with merged Addresses) ─────────────── */
const ProfileView = ({ addresses, onAddAddress, onEditAddress, u, onLogout }) => {
    if (!u) return null;
    return (
        <div>
            <SectionHead title="My Profile" sub="Your personal information on file." />
            <div>
                {[
                    { label: 'Full Name', value: u.name },
                    { label: 'Email Address', value: u.email },
                    { label: 'Phone Number', value: u.phone },
                ].map(({ label, value }) => (
                    <div key={label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '16px 0', borderBottom: '1px solid #EEEEEE', gap: 16,
                    }}>
                        <span style={{ fontFamily: FONT, fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>
                            {label}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span style={{ fontFamily: FONT, fontSize: '0.82rem', color: '#111' }}>{value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Saved Addresses sub-section ── */}
            <div style={{ marginTop: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #EEEEEE' }}>
                    <div>
                        <h2 style={{ fontFamily: FONT, fontSize: '1.2rem', fontWeight: 700, color: '#111', margin: 0 }}>Saved Addresses</h2>
                        <p style={{ fontFamily: FONT, fontSize: '0.75rem', color: '#6e6e73', marginTop: 4 }}>Your saved delivery addresses.</p>
                    </div>
                    <TextBtn onClick={onAddAddress}>+ Add New Address</TextBtn>
                </div>

                {addresses.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', textAlign: 'center' }}>
                        <svg width="48" height="48" fill="none" stroke="#D1D5DB" viewBox="0 0 24 24" strokeWidth={1.2} style={{ marginBottom: 16 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p style={{ fontFamily: FONT, color: '#9CA3AF', fontSize: '0.9rem' }}>No addresses saved yet.</p>
                        <TextBtn onClick={onAddAddress}>+ Add your first address</TextBtn>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                        {addresses.map((addr, idx) => (
                            <div key={idx} style={{
                                border: '1px solid #E5E7EB', borderRadius: 4,
                                padding: '20px', background: '#fff',
                                position: 'relative',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <span style={{
                                        fontFamily: FONT, fontSize: '0.68rem', fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7280',
                                    }}>
                                        {addr.label || 'Address'}
                                    </span>
                                    <TextBtn onClick={() => onEditAddress(idx)}>Edit</TextBtn>
                                </div>
                                <p style={{ fontFamily: FONT, fontSize: '0.88rem', color: '#374151', lineHeight: 1.6 }}>
                                    {addr.name}<br />
                                    {addr.address1}<br />
                                    {addr.city}, {addr.state}<br />
                                    PIN: {addr.pin}
                                </p>
                                <p style={{ fontFamily: FONT, fontSize: '0.78rem', color: '#9CA3AF', marginTop: 8 }}>
                                    {addr.phone} · {addr.email}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Sign Out ── */}
            <div style={{ marginTop: 52, paddingTop: 24, borderTop: '1px solid #EEEEEE' }}>
                <button
                    onClick={onLogout}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'none', border: '1px solid #FECACA', borderRadius: 6,
                        padding: '9px 16px', cursor: 'pointer',
                        fontFamily: FONT, fontSize: '0.75rem', fontWeight: 700,
                        color: '#D7373F', letterSpacing: '0.07em', textTransform: 'uppercase',
                        transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </div>
    );
};

/* ─────────────── SIDEBAR ─────────────── */
const Sidebar = ({ active, onNavigate, user }) => (
    <aside style={{
        width: 220, flexShrink: 0,
        borderRight: '1px solid #EEEEEE',
        paddingRight: 0,
        display: 'flex', flexDirection: 'column',
        minHeight: 'calc(100vh - 64px)',
    }}>
        {/* User info */}
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid #EEEEEE', marginBottom: 8 }}>
            <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: '#111', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT, fontSize: '1rem', fontWeight: 700, marginBottom: 10,
            }}>
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
            </div>
            <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: '0.88rem', color: '#111', marginBottom: 2 }}>{user?.name || 'User'}</p>
            <p style={{ fontFamily: FONT, fontSize: '0.72rem', color: '#9CA3AF' }}>{user?.email || ''}</p>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, paddingTop: 8 }}>
            {NAV_ITEMS.map(item => {
                const isActive = active === item.key;
                return (
                    <button
                        key={item.key}
                        onClick={() => onNavigate(item.key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            width: '100%', padding: '12px 24px',
                            background: isActive ? '#F9FAFB' : 'none',
                            border: 'none',
                            borderLeft: `3px solid ${isActive ? '#111' : 'transparent'}`,
                            cursor: 'pointer', textAlign: 'left',
                            color: isActive ? '#111' : '#6B7280',
                            fontFamily: FONT, fontSize: '0.83rem', fontWeight: isActive ? 700 : 500,
                            transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                        }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#111'; } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6B7280'; } }}
                    >
                        <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                        {item.label}
                    </button>
                );
            })}
        </nav>

        {/* Spacer pushes Sign Out to the very bottom */}
        <div style={{ marginTop: 'auto' }} />
    </aside>
);

/* ─────────────── MOBILE TOP NAV ─────────────── */
const MobileTopNav = ({ active, onNavigate }) => (
    <div style={{
        display: 'flex', gap: 0, overflowX: 'auto',
        borderBottom: '1px solid #EEEEEE',
        scrollbarWidth: 'none', marginBottom: 24,
        marginLeft: -20, marginRight: -20, paddingLeft: 20,
    }}>
        <style>{`.mob-topnav::-webkit-scrollbar{display:none}`}</style>
        <div className="mob-topnav" style={{ display: 'flex', gap: 0 }}>
            {NAV_ITEMS.map(item => {
                const isActive = active === item.key;
                return (
                    <button
                        key={item.key}
                        onClick={() => onNavigate(item.key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '12px 16px', whiteSpace: 'nowrap',
                            background: 'none', border: 'none', borderBottom: `2px solid ${isActive ? '#111' : 'transparent'}`,
                            cursor: 'pointer', color: isActive ? '#111' : '#9CA3AF',
                            fontFamily: FONT, fontSize: '0.78rem', fontWeight: isActive ? 700 : 500,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                );
            })}
        </div>
    </div>
);

/* ─────────────── MAIN PAGE ─────────────── */
const AccountDashboard = () => {
    const navigate = useNavigate();
    const { user, isLoggedIn, logout, loading: authLoading } = useUserAuth();
    const [view, setView] = useState('orders');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [confirmDialog, setConfirmDialog] = useState(null);

    /* ── Address CRUD state ── */
    const [addresses, setAddresses] = useState([]);
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
    const [currentAddress, setCurrentAddress] = useState({ ...EMPTY_ADDRESS });
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Live Backend State
    const [isLoading, setIsLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [userOrders, setUserOrders] = useState([]);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (authLoading) return;
            if (!isLoggedIn) {
                navigate('/signin', { replace: true });
                return;
            }
            try {
                const profileRes = await userService.getProfile();
                const ordersRes = await userService.getUserOrders();

                if (profileRes.status && ordersRes.status) {
                    setUserProfile(profileRes.data);

                    if (profileRes.data.addresses) {
                        setAddresses(profileRes.data.addresses.map((addr, idx) => ({
                            label: idx === 0 && profileRes.data.addresses.length === 1 ? 'Home' : `Address ${idx + 1}`,
                            name: addr.name || profileRes.data.name || '',
                            phone: addr.phone || profileRes.data.phone || '',
                            alternatePhone: addr.alternatePhone || '',
                            email: profileRes.data.email || '',
                            address1: addr.street || '',
                            city: addr.city || '',
                            state: addr.state || '',
                            pin: addr.pincode || ''
                        })));
                    } else {
                        setAddresses([]);
                    }

                    const mappedOrders = ordersRes.data.map(o => ({
                        id: o.orderId,
                        date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        createdAt: o.createdAt,
                        status: o.orderStatus ? o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1) : 'Placed',
                        items: [
                            ...o.items.map(i => ({
                                name: i.productName,
                                size: i.size,
                                price: i.price,
                                image: i.productImage?.[0] || ''
                            })),
                            ...(o.freeSample ? [{
                                name: o.freeSample.productName + ' (Complimentary Gift)',
                                size: o.freeSample.size || 'Sample',
                                price: 0,
                                image: o.freeSample.productImage?.[0] || '/media/dominus/1.png'
                            }] : [])
                        ],
                        total: o.totalAmount,
                    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    setUserOrders(mappedOrders);
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
                navigate('/signin', { replace: true });
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [navigate, isLoggedIn, authLoading]);

    const reFetchOrdersOnly = async () => {
        try {
            const ordersRes = await userService.getUserOrders();
            if (ordersRes.status) {
                const mappedOrders = ordersRes.data.map(o => ({
                    id: o.orderId,
                    date: new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    createdAt: o.createdAt,
                    status: o.orderStatus ? o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1) : 'Placed',
                    items: [
                        ...o.items.map(i => ({
                            name: i.productName,
                            size: i.size,
                            price: i.price,
                            image: i.productImage?.[0] || ''
                        })),
                        ...(o.freeSample ? [{
                            name: o.freeSample.productName + ' (Complimentary Gift)',
                            size: o.freeSample.size || 'Sample',
                            price: 0,
                            image: o.freeSample.productImage?.[0] || '/media/dominus/1.png'
                        }] : [])
                    ],
                    total: o.totalAmount,
                })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setUserOrders(mappedOrders);
            }
        } catch (error) {
            console.error("Order refetch block failed", error);
        }
    };

    const handleCancelOrderProcess = (orderId) => {
        setConfirmDialog({
            title: 'Cancel this order?',
            message: 'This action cannot be undone. Your items will be returned to stock and you will receive a confirmation email.',
            confirmLabel: 'Yes, Cancel Order',
            danger: true,
            onConfirm: async () => {
                setConfirmDialog(null);
                try {
                    const res = await orderService.cancelOrder(orderId);
                    if (res.status) {
                        toast.success('Order cancelled successfully.');
                        reFetchOrdersOnly();
                    } else {
                        toast.error(res.message || 'Could not cancel the order.');
                    }
                } catch {
                    toast.error('Something went wrong. Please try again.');
                }
            },
        });
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [view]);

    const handleLogout = () => {
        setConfirmDialog({
            title: 'Sign out of your account?',
            message: 'You will need to sign in again to view your orders and profile.',
            confirmLabel: 'Sign Out',
            danger: false,
            onConfirm: async () => {
                setConfirmDialog(null);
                await logout();
                // Redirect to Home with replace: true to clear account section from history
                navigate('/', { replace: true });
            },
        });
    };

    /* ── Address form handlers ── */
    const handleAddAddress = () => {
        setCurrentAddress({ ...EMPTY_ADDRESS });
        setIsEditing(false);
        setEditIndex(null);
        setFormErrors({});
        setTouched({});
        setIsAddressFormOpen(true);
    };

    const handleEditAddress = (idx) => {
        setCurrentAddress({ ...addresses[idx] });
        setIsEditing(true);
        setEditIndex(idx);
        setFormErrors({});
        setTouched({});
        setIsAddressFormOpen(true);
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setTouched({ name: true, phone: true, alternatePhone: true, email: true, address1: true, city: true, state: true, pin: true });
        const errors = validateAddress(currentAddress);
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        let updatedAddresses;
        if (isEditing && editIndex !== null) {
            updatedAddresses = [...addresses];
            updatedAddresses[editIndex] = { ...currentAddress, label: addresses[editIndex].label || 'Address' };
        } else {
            updatedAddresses = [...addresses, { ...currentAddress, label: addresses.length === 0 ? 'Home' : 'Address' }];
        }

        try {
            const backendPayload = updatedAddresses.map(addr => ({
                name: addr.name,
                phone: addr.phone,
                alternatePhone: addr.alternatePhone || '',
                street: addr.address1,
                city: addr.city,
                state: addr.state,
                pincode: addr.pin
            }));
            const res = await userService.updateAddress({ addresses: backendPayload });
            if (res.status) {
                setAddresses(updatedAddresses);
                toast.success(isEditing ? 'Address updated.' : 'Address added.');
            } else {
                toast.error(res.message || 'Failed to save address.');
            }
        } catch (err) {
            toast.error('Could not save address. Please try again.');
        }

        setFormErrors({});
        setTouched({});
        setIsAddressFormOpen(false);
    };

    /* ── Inline-validated field change handler ── */
    const handleFieldChange = (field, value) => {
        const updated = { ...currentAddress, [field]: field === 'pin' ? value.replace(/\D/g, '').slice(0, 6) : value };
        setCurrentAddress(updated);
        if (touched[field]) setFormErrors(prev => ({ ...prev, [field]: validateAddress(updated)[field] }));
    };
    const handleFieldBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setFormErrors(prev => ({ ...prev, [field]: validateAddress(currentAddress)[field] }));
    };

    return (
        <div style={{
            fontFamily: FONT,
            background: '#F9FAFB',
            color: '#1d1d1f',
            minHeight: '100vh',
            paddingTop: 'var(--header-height, 64px)',
        }}>
            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <p style={{ fontFamily: FONT, fontSize: '0.9rem', color: '#6e6e73' }}>Loading Profile...</p>
                </div>
            ) : (
                <>
                    {/* ── Confirm Dialog ── */}
                    <ConfirmDialog
                        dialog={confirmDialog}
                        onConfirm={() => confirmDialog?.onConfirm()}
                        onDismiss={() => setConfirmDialog(null)}
                    />
                    {/* ── Address Form Modal (reuses checkout CSS classes) ── */}
                    {isAddressFormOpen && (
                        <div className="modal-overlay active form-overlay">
                            <div className="modal-content address-form-modal">
                                <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h2 className="modal-title">{isEditing ? 'Edit Address' : 'Add New Address'}</h2>
                                    <button className="modal-close-btn" onClick={() => setIsAddressFormOpen(false)} aria-label="Close">✕</button>
                                </div>

                                <form className="address-form" onSubmit={handleAddressSubmit}>
                                    <div className="form-grid">
                                        <div className="form-group full-width">
                                            <label>Full Name</label>
                                            <input type="text" value={currentAddress.name}
                                                onChange={e => handleFieldChange('name', e.target.value)}
                                                onBlur={() => handleFieldBlur('name')}
                                                placeholder="Enter full name"
                                                style={touched.name && formErrors.name ? { borderColor: '#e03030' } : {}}
                                            />
                                            {touched.name && formErrors.name && <span className="field-error">{formErrors.name}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input type="tel" value={currentAddress.phone}
                                                onChange={e => handleFieldChange('phone', e.target.value)}
                                                onBlur={() => handleFieldBlur('phone')}
                                                placeholder="+91 XXXXX XXXXX"
                                                style={touched.phone && formErrors.phone ? { borderColor: '#e03030' } : {}}
                                            />
                                            {touched.phone && formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Alternate Phone (Optional)</label>
                                            <input type="tel" value={currentAddress.alternatePhone}
                                                onChange={e => handleFieldChange('alternatePhone', e.target.value)}
                                                onBlur={() => handleFieldBlur('alternatePhone')}
                                                placeholder="+91 Optional"
                                                style={touched.alternatePhone && formErrors.alternatePhone ? { borderColor: '#e03030' } : {}}
                                            />
                                            {touched.alternatePhone && formErrors.alternatePhone && <span className="field-error">{formErrors.alternatePhone}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Email ID</label>
                                            <input type="email" value={currentAddress.email}
                                                onChange={e => handleFieldChange('email', e.target.value)}
                                                onBlur={() => handleFieldBlur('email')}
                                                placeholder="example@gmail.com"
                                                style={touched.email && formErrors.email ? { borderColor: '#e03030' } : {}}
                                            />
                                            {touched.email && formErrors.email && <span className="field-error">{formErrors.email}</span>}
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Building / Area / Street</label>
                                            <input type="text" value={currentAddress.address1}
                                                onChange={e => handleFieldChange('address1', e.target.value)}
                                                onBlur={() => handleFieldBlur('address1')}
                                                placeholder="Address line 1"
                                                style={touched.address1 && formErrors.address1 ? { borderColor: '#e03030' } : {}}
                                            />
                                            {touched.address1 && formErrors.address1 && <span className="field-error">{formErrors.address1}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>City</label>
                                            <input type="text" id="profile-field-city" value={currentAddress.city}
                                                onChange={e => handleFieldChange('city', e.target.value)}
                                                onBlur={() => handleFieldBlur('city')}
                                                placeholder="e.g. Mumbai"
                                                style={touched.city && formErrors.city ? { borderColor: '#e03030' } : {}}
                                            />
                                            {touched.city && formErrors.city && <span className="field-error">{formErrors.city}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>State</label>
                                            <input type="text" id="profile-field-state" value={currentAddress.state}
                                                onChange={e => handleFieldChange('state', e.target.value)}
                                                onBlur={() => handleFieldBlur('state')}
                                                placeholder="e.g. Maharashtra"
                                                style={touched.state && formErrors.state ? { borderColor: '#e03030' } : {}}
                                            />
                                            {touched.state && formErrors.state && <span className="field-error">{formErrors.state}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label>Pincode</label>
                                            <input type="text" id="profile-field-pin" value={currentAddress.pin}
                                                maxLength={6}
                                                onChange={e => handleFieldChange('pin', e.target.value)}
                                                onBlur={() => handleFieldBlur('pin')}
                                                placeholder="XXXXXX"
                                                style={touched.pin && formErrors.pin ? { borderColor: '#e03030' } : {}}
                                            />
                                            {touched.pin && formErrors.pin && <span className="field-error">{formErrors.pin}</span>}
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button type="submit" className="save-btn">Save Address</button>
                                        <button type="button" className="cancel-btn" onClick={() => setIsAddressFormOpen(false)}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px' }}>
                        {/* Back button row */}
                        <div style={{ padding: '24px 0 0' }}>
                            <BackButton label="Continue Shopping" onClick={() => navigate(-1)} />
                        </div>

                        {/* Page title */}
                        <div style={{ padding: '16px 0 24px', borderBottom: '1px solid #EEEEEE', marginBottom: 0 }}>
                            <h1 style={{
                                fontFamily: FONT, fontSize: 'clamp(1.3rem, 3vw, 1.75rem)',
                                fontWeight: 700, color: '#111', margin: 0,
                                letterSpacing: '-0.01em',
                            }}>
                                My Account
                            </h1>
                        </div>

                        {/* Body */}
                        <div style={{
                            display: 'flex', gap: 0,
                            alignItems: 'flex-start',
                            minHeight: 'calc(100vh - 180px)',
                        }}>
                            {/* Sidebar — desktop only */}
                            {!isMobile && (
                                <Sidebar active={view} onNavigate={setView} user={userProfile} />
                            )}

                            {/* Content area */}
                            <main style={{
                                flex: 1,
                                padding: isMobile ? '24px 0' : '32px 40px',
                                minWidth: 0,
                            }}>
                                {/* Mobile top nav */}
                                {isMobile && <MobileTopNav active={view} onNavigate={setView} />}

                                {view === 'orders'  && <OrdersView orders={userOrders} onCancelOrder={handleCancelOrderProcess} />}
                                {view === 'profile' && <ProfileView addresses={addresses} onAddAddress={handleAddAddress} onEditAddress={handleEditAddress} u={userProfile} onLogout={handleLogout} />}
                            </main>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AccountDashboard;
