import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const TrashIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const WishlistPage = () => {
    const navigate = useNavigate();
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const handleMoveToCart = (item) => {
        addToCart({ ...item, quantity: 1, size: item.size || '100ml', slug: item.slug || item.id });
        removeFromWishlist(item.id);
        navigate('/cart');
    };

    return (
        <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Roboto", sans-serif',
            background: '#fff',
            color: '#1d1d1f',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: 'var(--header-height, 64px)',
        }}>
            {/* ── Scrollable body ── */}
            <div style={{ flex: 1, maxWidth: 780, width: '100%', margin: '0 auto', padding: '40px 20px 0' }}>

                {/* Back — identical style to CartPage */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#6e6e73', fontSize: '0.8rem', letterSpacing: '0.5px',
                        marginBottom: 32, padding: 0, transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#1d1d1f'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6e6e73'; }}
                >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Continue Shopping
                </button>

                {/* Title — identical style to CartPage */}
                <h1 style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Roboto", sans-serif',
                    fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: '#1d1d1f',
                    marginBottom: 6,
                }}>
                    Wishlist ({wishlistItems.length})
                </h1>
                <div style={{ width: 40, height: 2, background: '#D4AF37', marginBottom: 32 }} />

                {/* ── Empty ── */}
                {wishlistItems.length === 0 && (
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        padding: '80px 0 120px', textAlign: 'center',
                    }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%',
                            background: '#f5f5f7',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 20,
                        }}>
                            <svg width="32" height="32" fill="none" stroke="#9e9ea3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <p style={{ color: '#1d1d1f', fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>
                            Your wishlist is empty
                        </p>
                        <p style={{ color: '#6e6e73', fontSize: '0.85rem', marginBottom: 28 }}>
                            Save items you love — they'll be waiting for you here.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                padding: '13px 36px', background: '#1d1d1f', color: '#fff',
                                border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                                letterSpacing: '1.5px', fontWeight: 600,
                            }}
                        >
                            Explore Collection
                        </button>
                    </div>
                )}

                {/* ── Items — same row layout as CartPage ── */}
                {wishlistItems.map((item, idx) => (
                    <div key={item.id} style={{
                        display: 'flex', gap: 20, alignItems: 'flex-start',
                        padding: '24px 0',
                        borderTop: idx === 0 ? '1px solid #e5e5e5' : 'none',
                        borderBottom: '1px solid #e5e5e5',
                    }}>
                        {/* Image */}
                        <div
                            onClick={() => navigate(`/product/${item.slug || item.id}`)}
                            style={{
                                width: 90, height: 90, flexShrink: 0,
                                background: '#f5f5f7', padding: 6,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1 }}>
                            {/* Name row + trash icon */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                                <p
                                    onClick={() => navigate(`/product/${item.slug || item.id}`)}
                                    style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1d1d1f', lineHeight: 1.4, cursor: 'pointer' }}
                                >
                                    {item.name}
                                </p>
                                {/* Trash delete — identical to CartPage */}
                                <button
                                    onClick={() => removeFromWishlist(item.id)}
                                    title="Remove from wishlist"
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#c0c0c5', flexShrink: 0, padding: 2, transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#ff3b30'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = '#c0c0c5'; }}
                                >
                                    <TrashIcon />
                                </button>
                            </div>

                            <p style={{ fontSize: '0.75rem', color: '#6e6e73', marginBottom: 14 }}>
                                {item.badge || 'Extrait de Parfum'}
                            </p>

                            {/* Price + Move to Cart */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1d1d1f' }}>
                                    ₹ {item.price?.toLocaleString('en-IN')}.00
                                </p>
                                <button
                                    onClick={() => handleMoveToCart(item)}
                                    style={{
                                        padding: '7px 18px',
                                        background: '#1d1d1f', color: '#fff',
                                        border: 'none', cursor: 'pointer',
                                        fontSize: '0.72rem', fontWeight: 600,
                                        letterSpacing: '1.2px', textTransform: 'uppercase',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#333'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#1d1d1f'; }}
                                >
                                    Move to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Spacer so content doesn't sit flush at bottom */}
                {wishlistItems.length > 0 && <div style={{ height: 80 }} />}
            </div>
        </div>
    );
};

export default WishlistPage;
