import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Package, User, MapPin, CreditCard, Mail, Phone, Calendar } from 'lucide-react';
import { orderService } from '../../services/orderService';

const FONT = '"Inter", "Helvetica Neue", sans-serif';

const MOCK_ORDERS = [
    { orderId: 'BRN-DEMO-0017', customer: { name: 'Priyanka Sundalam', email: 'priyanka@example.com', phone: '+91 98765 43210', street: '123 Luxury Avenue', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' }, items: [{ productName: 'Oud Mystique', size: '100ml', price: 1295, quantity: 1, productImage: ['/api/placeholder/400'] }], totalAmount: 1295, createdAt: '2026-04-03T10:00:00Z', paymentStatus: 'paid', orderStatus: 'delivered' },
    // Only keeping one full mock schema fallback for testability if API fails
];

const AdminOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    
    // Support either passed state (instant load) or fetch via API
    const [order, setOrder] = useState(state?.order || MOCK_ORDERS.find(o => o.orderId === id) || null);
    const [loading, setLoading] = useState(!state?.order);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!state?.order) {
            fetchOrderDetail();
        }
    }, [id]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            const res = await orderService.getAdminOrderDetails(id);
            if (res.status && res.data) {
                setOrder(res.data);
            }
        } catch (err) {
            console.error('Fetch order detail error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            setIsUpdating(true);
            // Use the numeric ID if available, otherwise fallback to public orderId
            await orderService.updateOrderStatus(id, newStatus);
            setOrder(prev => ({ ...prev, orderStatus: newStatus })); 
        } catch (error) {
            console.error('Failed to update status', error);
            alert('Status update failed. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div style={{ fontFamily: FONT, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ padding: '8px 16px', background: '#000', color: '#fff', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, animation: 'pulse 1.5s infinite' }}>Loading Order...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ fontFamily: FONT, padding: 40, textAlign: 'center' }}>
                <h2 style={{ color: '#202223' }}>Order not found</h2>
                <button onClick={() => navigate('/admin/orders')} style={{ marginTop: 16, background: '#fff', border: '1px solid #C9CCCF', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: FONT, fontWeight: 600 }}>Back to Orders</button>
            </div>
        );
    }

    const { customer = {}, items = [], freeSample, totalAmount, paymentStatus, orderStatus, createdAt } = order;

    const getPaymentBadgeStyle = (status) => {
        const s = status?.toLowerCase();
        if (s === 'paid') return { background: '#E3F1DF', color: '#008060' };
        if (s === 'failed') return { background: '#FEF2F2', color: '#D82C0D' };
        return { background: '#FEF0D4', color: '#8A6116' };
    };

    const getStatusBadgeStyle = (status) => {
        const s = status?.toLowerCase();
        if (s === 'delivered') return { background: '#EBF9F1', color: '#00632B' }; // Vivid Green
        if (s === 'cancelled') return { background: '#FFF5F5', color: '#B91B1B' }; // Vivid Red
        if (s === 'shipped') return { background: '#EBF5FA', color: '#2C6ECB' };   // Vivid Blue
        if (s === 'placed') return { background: '#FFF4E5', color: '#B45309' };    // Vivid Amber
        return { background: '#F4F6F8', color: '#6D7175' };
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    return (
        <div style={{ fontFamily: FONT, maxWidth: '1040px', margin: '0 auto', animation: 'fadeIn 0.3s ease-in-out', paddingBottom: 64 }}>
            
            {/* Header Area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                <button onClick={() => navigate('/admin/orders')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 4, color: '#202223' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#F4F6F8'} onMouseOut={e=>e.currentTarget.style.backgroundColor='transparent'}>
                    <ChevronLeft size={20} />
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#202223', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                    {order.orderId}
                    <span style={{ ...getPaymentBadgeStyle(paymentStatus), padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', letterSpacing: '0.02em', textTransform: 'capitalize' }}>
                        {paymentStatus === 'paid' && <CreditCard size={12} style={{marginRight: 4}}/>}
                        {paymentStatus}
                    </span>
                    <span style={{ ...getStatusBadgeStyle(orderStatus), padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', letterSpacing: '0.02em', textTransform: 'capitalize' }}>
                        {orderStatus}
                    </span>
                </h1>
            </div>
            
            <div style={{ marginLeft: 48, fontSize: '0.85rem', color: '#6D7175', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={14} /> {formatDate(createdAt)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '2fr 1fr' : '1fr', gap: 24 }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    {/* Fulfillment Card */}
                    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ background: orderStatus === 'placed' ? '#FFF4E5' : '#EBF5FA', padding: 8, borderRadius: '50%', color: orderStatus === 'placed' ? '#B45309' : '#2C6ECB', display: 'flex' }}>
                                    <Package size={20} />
                                </div>
                                <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#202223' }}>
                                    {orderStatus === 'placed' ? 'Unfulfilled' : orderStatus === 'shipped' ? 'Shipped' : orderStatus === 'delivered' ? 'Delivered' : 'Cancelled'} 
                                    <span style={{ color: '#6D7175', fontWeight: 400, marginLeft: 8 }}>({items.length + (freeSample && freeSample.productName ? 1 : 0)})</span>
                                </h2>

                            </div>
                        </div>
                        
                        <div style={{ padding: '8px 24px' }}>
                            {items.length > 0 && (
                                <div style={{ display: 'flex', padding: '8px 0', borderBottom: '1px solid #F3F4F6', fontSize: '0.75rem', fontWeight: 700, color: '#6D7175', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <div style={{ flex: 1, paddingLeft: 64 }}>Product</div>
                                    <div style={{ width: '100px', textAlign: 'right' }}>Price</div>
                                    <div style={{ width: '100px', textAlign: 'right' }}>Total</div>
                                </div>
                            )}
                            {items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: (idx < items.length - 1 || freeSample) ? '1px solid #F3F4F6' : 'none' }}>
                                    <div style={{ width: 48, height: 48, border: '1px solid #E5E7EB', borderRadius: 6, overflow: 'hidden', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                        <img src={item.productId?.images?.[0] || item.productImage?.[0] || '/placeholder.png'} alt={item.productName} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: '#202223', fontSize: '0.9rem', marginBottom: 2 }}>{item.productName}</div>
                                        <div style={{ color: '#6D7175', fontSize: '0.8rem' }}>{item.size}</div>
                                    </div>
                                    <div style={{ width: '80px', textAlign: 'right', fontSize: '0.9rem', color: '#202223' }}>
                                        ₹{item.price?.toLocaleString()} <span style={{ color: '#6D7175' }}>× {item.quantity}</span>
                                    </div>
                                    <div style={{ width: '100px', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem', color: '#202223' }}>
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}

                            {/* Free Sample Display */}
                            {freeSample && freeSample.productName && (
                                <div style={{ display: 'flex', alignItems: 'center', padding: '16px 0' }}>
                                    <div style={{ width: 48, height: 48, border: '1px solid #E3F1DF', borderRadius: 6, overflow: 'hidden', background: '#F9FFF9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                                        {freeSample.productImage?.[0] ? (
                                            <img src={freeSample.productImage[0]} alt={freeSample.productName} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                        ) : freeSample.productId?.images?.[0] ? (
                                            <img src={freeSample.productId.images[0]} alt={freeSample.productName} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                        ) : (
                                            <Package size={20} color="#008060" />
                                        )}

                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: '#008060', fontSize: '0.9rem', marginBottom: 2 }}>{freeSample.productName}</div>
                                        <div style={{ color: '#6D7175', fontSize: '0.8rem' }}>Complimentary {freeSample.size || 'Discovery'} Sample</div>
                                    </div>
                                    <div style={{ width: '100px', textAlign: 'right' }}>
                                        <span style={{ background: '#E3F1DF', color: '#008060', padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600 }}>FREE</span>
                                    </div>
                                </div>
                            )}

                        </div>



                        {/* Fulfillment Action Bar */}
                        {orderStatus === 'placed' && (
                            <div style={{ background: '#FAFAFA', padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => handleUpdateStatus('shipped')} disabled={isUpdating} style={{ opacity: isUpdating ? 0.7 : 1, pointerEvents: isUpdating ? 'none' : 'auto', background: '#008060', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#006e52'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#008060'}>
                                    {isUpdating ? 'Updating...' : 'Fulfill Items'}
                                </button>
                            </div>
                        )}
                        {orderStatus === 'shipped' && (
                            <div style={{ background: '#FAFAFA', padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => handleUpdateStatus('delivered')} disabled={isUpdating} style={{ opacity: isUpdating ? 0.7 : 1, pointerEvents: isUpdating ? 'none' : 'auto', background: '#202223', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='#111'} onMouseOut={e=>e.currentTarget.style.backgroundColor='#202223'}>
                                    {isUpdating ? 'Updating...' : 'Mark as Delivered'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Paid / Financials Card */}
                    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ background: paymentStatus === 'paid' ? '#E3F1DF' : '#FEF0D4', padding: 8, borderRadius: '50%', color: paymentStatus === 'paid' ? '#008060' : '#8A6116', display: 'flex' }}>
                                    <CreditCard size={20} />
                                </div>
                                <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#202223' }}>{paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}</h2>
                            </div>
                            {paymentStatus !== 'paid' && (
                                <button 
                                    onClick={async () => {
                                        try {
                                             await orderService.updatePaymentStatus(order.orderId, 'paid');
                                             setOrder(prev => ({ ...prev, paymentStatus: 'paid' }));
                                        } catch (e) { alert('Failed to update payment'); }
                                    }}
                                    style={{ background: '#fff', border: '1px solid #C9CCCF', borderRadius: 6, padding: '4px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Mark as Paid
                                </button>
                            )}
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#6D7175', fontSize: '0.9rem' }}>
                                <span>Subtotal</span>
                                <span>₹{(totalAmount || 0).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: '#6D7175', fontSize: '0.9rem' }}>
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: '#6D7175', fontSize: '0.9rem' }}>
                                <span>Tax</span>
                                <span>Inclusive</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: 16, color: '#202223', fontWeight: 600, fontSize: '1rem' }}>
                                <span>Total</span>
                                <span>₹{(totalAmount || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    {/* Customer Info Card */}
                    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB' }}>
                            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: '#202223' }}>Customer</h2>
                        </div>
                        <div style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                <div style={{ width: 40, height: 40, background: '#E3F1DF', borderRadius: '50%', color: '#008060', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1.1rem' }}>
                                    {customer.name?.charAt(0) || <User size={20}/>}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#202223', fontSize: '0.95rem' }}>{customer.name || 'Guest User'}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#6D7175' }}>1 Order</div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6D7175', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Contact Information</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#202223', fontSize: '0.9rem', marginBottom: 12 }}>
                                    <Mail size={16} style={{ color: '#6D7175' }} />
                                    <a href={`mailto:${customer.email}`} style={{ color: '#006E52', textDecoration: 'none' }}>{customer.email || 'No email provided'}</a>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#202223', fontSize: '0.9rem' }}>
                                    <Phone size={16} style={{ color: '#6D7175' }} />
                                    {customer.phone || 'No phone provided'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address Card */}
                    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0, color: '#202223' }}>Shipping Address</h2>
                        </div>
                        <div style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <MapPin size={18} style={{ color: '#6D7175', marginTop: 2 }} />
                                <div style={{ color: '#202223', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{customer.name}</div>
                                    <div>{customer.street}</div>
                                    <div>{customer.city}, {customer.state} {customer.pincode}</div>
                                    <div style={{ marginTop: 4, color: '#6D7175' }}>India</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

        </div>
    );
};

export default AdminOrderDetail;
