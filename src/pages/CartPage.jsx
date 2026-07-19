import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';

const CartPage = () => {
    const navigate = useNavigate();
    const { cartItems, cartCount, updateQuantity, removeFromCart, getSubtotal } = useCart();
    const subtotal = getSubtotal();

    // Calculate total savings from MRP
    const totalSavings = cartItems.reduce((sum, item) => {
        const itemMrp = item.mrp || item.price || 0;
        const savingPerUnit = Math.max(0, itemMrp - item.price);
        return sum + (savingPerUnit * item.quantity);
    }, 0);


    // Shopify behaviour: always land at the top
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    const handleProductClick = async (item) => {
        if (item.slug) {
            navigate(`/product/${item.slug}`);
            return;
        }
        try {
            const res = await productService.getProductBySlug(item.id);
            if (res.status && res.data?.slug) {
                navigate(`/product/${res.data.slug}`);
            } else {
                navigate(`/product/${item.id}`);
            }
        } catch (err) {
            navigate(`/product/${item.id}`);
        }
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

                {/* Back */}
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

                {/* Title */}
                <h1 style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Roboto", sans-serif',
                    fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: '#1d1d1f',
                    marginBottom: 6,
                }}>
                    Your Cart ({cartCount})
                </h1>
                <div style={{ width: 40, height: 2, background: '#D4AF37', marginBottom: 32 }} />

                {/* ── Empty ── */}
                {cartItems.length === 0 && (
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <p style={{
                            color: '#1d1d1f', fontSize: '1rem', fontWeight: 600,
                            marginBottom: 6, letterSpacing: '0.02em',
                        }}>Your cart is empty</p>
                        <p style={{ color: '#6e6e73', fontSize: '0.85rem', marginBottom: 28 }}>
                            Add items to get started.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                padding: '13px 36px', background: '#1d1d1f', color: '#fff',
                                border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                                letterSpacing: '1.5px', fontWeight: 600,
                            }}
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}

                {/* ── Items ── */}
                {cartItems.map((item, idx) => (
                    <div key={`${item.id}-${item.size}`} style={{
                        display: 'flex', gap: 20, alignItems: 'flex-start',
                        padding: '24px 0',
                        borderTop: idx === 0 ? '1px solid #e5e5e5' : 'none',
                        borderBottom: '1px solid #e5e5e5',
                    }}>
                        {/* Image */}
                        <div 
                            onClick={() => handleProductClick(item)}
                            style={{
                            width: 90, height: 90, flexShrink: 0,
                            background: '#f5f5f7', padding: 6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}>
                            <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                                <p 
                                    onClick={() => handleProductClick(item)}
                                    style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1d1d1f', lineHeight: 1.4, cursor: 'pointer' }}
                                    className="hover-underline"
                                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                >
                                    {item.name}
                                </p>
                                {/* Delete */}
                                <button
                                    onClick={() => removeFromCart(item.id, item.size)}
                                    title="Remove"
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#c0c0c5', flexShrink: 0, padding: 2, transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#ff3b30'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = '#c0c0c5'; }}
                                >
                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </div>

                            <p style={{ fontSize: '0.75rem', color: '#6e6e73', marginBottom: 14 }}>Size: {item.size}</p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                {/* Qty */}
                                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #d2d2d7' }}>
                                    <button
                                        onClick={() => {
                                            if (item.quantity > 1) updateQuantity(item.id, item.size, item.quantity - 1);
                                            else removeFromCart(item.id, item.size);
                                        }}
                                        style={{
                                            width: 32, height: 32, background: 'none', border: 'none',
                                            cursor: 'pointer', color: '#6e6e73', fontSize: '1rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >&minus;</button>
                                    <span style={{
                                        width: 28, textAlign: 'center', fontSize: '0.85rem',
                                        fontWeight: 600, borderLeft: '1px solid #d2d2d7',
                                        borderRight: '1px solid #d2d2d7', lineHeight: '32px',
                                    }}>
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                        style={{
                                            width: 32, height: 32, background: 'none', border: 'none',
                                            cursor: 'pointer', color: '#6e6e73', fontSize: '1rem',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >&#43;</button>
                                </div>

                                {/* Price */}
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1d1d1f' }}>
                                    ₹ {(item.price * item.quantity).toLocaleString('en-IN')}.00
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Spacer so footer doesn't overlap last item */}
                {cartItems.length > 0 && <div style={{ height: 160 }} />}
            </div>

            {/* ── Sticky Subtotal Footer (Shopify-style) ── */}
            {cartItems.length > 0 && (
                <div style={{
                    position: 'sticky', bottom: 0, background: '#fff',
                    borderTop: '1px solid #e5e5e5',
                    padding: '20px 20px 28px',
                    zIndex: 100,
                }}>
                    <div style={{ maxWidth: 780, margin: '0 auto' }}>
                        {/* Subtotal row — exact layout from reference image */}
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                            marginBottom: 4,
                        }}>
                            <span style={{
                                fontSize: '0.72rem', fontWeight: 700,
                                letterSpacing: '0.18em', textTransform: 'uppercase',
                                color: '#1d1d1f',
                            }}>
                                Subtotal
                            </span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1d1d1f' }}>
                                Rs. {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        {totalSavings > 0 && (
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                                marginBottom: 8,
                            }}>
                                <span style={{
                                    fontSize: '0.65rem', fontWeight: 700,
                                    letterSpacing: '0.1em', textTransform: 'uppercase',
                                    color: '#27ae60',
                                }}>
                                    Total Savings
                                </span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#27ae60' }}>
                                    &minus; Rs. {totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}

                        <p style={{
                            fontSize: '0.75rem', color: '#6e6e73',
                            textAlign: 'center', marginBottom: 16,
                        }}>
                            Shipping, taxes, and discount codes calculated at checkout.
                        </p>
                        <button
                            className="add-to-bag-btn"
                            style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.78rem', border: 'none' }}
                            onClick={() => navigate('/checkout', { state: { fromCheckout: true } })}
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
