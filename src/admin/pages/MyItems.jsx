import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { productService } from '../../services/productService';

const FONT = '"Roboto", sans-serif';

const AdminInventory = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState(location.state?.filterCategory || '');
    const [viewMode, setViewMode] = useState(window.innerWidth <= 768 ? 'mobile' : 'desktop');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => setViewMode(window.innerWidth <= 768 ? 'mobile' : 'desktop');
        window.addEventListener('resize', handleResize);
        fetchProducts();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await productService.getAllProducts();
            if (res.status && res.data) {
                const data = res.data.luxury_collection || res.data.luxury || (Array.isArray(res.data) ? res.data : []);
                setProducts(data);
            }
        } catch (err) {
            console.error('Inventory fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const search = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(search) || 
               p.category?.toLowerCase() === search ||
               p._id?.toLowerCase().includes(search);
    });

    return (
        <div style={{ fontFamily: FONT, width: '100%', animation: 'fadeIn 0.3s ease-in-out' }}>
            {/* Header Area */}
            <div style={{ 
                display: 'flex', 
                flexDirection: viewMode === 'mobile' ? 'column' : 'row', 
                justifyContent: 'space-between', 
                alignItems: viewMode === 'mobile' ? 'flex-start' : 'center',
                gap: 16,
                marginBottom: 24,
                paddingBottom: 24,
                borderBottom: '1px solid rgba(0,0,0,0.08)'
            }}>
                <h1 style={{ fontFamily: FONT, fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 700, color: '#1d1d1f', margin: 0, letterSpacing: 'normal', textTransform: 'none' }}>My Items</h1>
                
                <div style={{ display: 'flex', gap: 12, width: viewMode === 'mobile' ? '100%' : 'auto' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: viewMode === 'mobile' ? 'auto' : '280px' }}>
                        <input 
                            type="text" 
                            placeholder="Filter products..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 12px 10px 32px', border: '1px solid #d1d5db',
                                borderRadius: '6px', fontSize: '0.85rem', outline: 'none', background: '#fff',
                                boxSizing: 'border-box', transition: 'border-color 0.2s', fontFamily: FONT
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = '#9ca3af'}
                            onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                        />
                        <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    
                    <button style={{
                        padding: '10px 16px', background: '#111827', color: '#fff', border: 'none',
                        borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                        whiteSpace: 'nowrap', transition: 'background-color 0.2s', fontFamily: FONT, height: '100%',
                        textTransform: 'none'
                    }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#000'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#111827'}>
                        Add Product
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', overflowX: 'auto', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: viewMode === 'mobile' ? '100%' : '800px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                            <th style={{ fontFamily: FONT, padding: '10px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', width: 60 }}>Image</th>
                            <th style={{ fontFamily: FONT, padding: '10px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#4b5563' }}>Product Name</th>
                            {viewMode === 'desktop' && (
                                <th style={{ fontFamily: FONT, padding: '10px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#4b5563' }}>Status</th>
                            )}
                            {viewMode === 'desktop' && (
                                <th style={{ fontFamily: FONT, padding: '10px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#4b5563' }}>Inventory</th>
                            )}
                            <th style={{ fontFamily: FONT, padding: '10px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#4b5563' }}>Price</th>
                            <th style={{ fontFamily: FONT, padding: '10px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? filteredProducts.map((p, idx) => (
                            <tr key={p._id} style={{ borderBottom: idx === filteredProducts.length - 1 ? 'none' : '1px solid #e5e7eb', transition: 'background-color 0.15s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <td style={{ padding: '8px 16px' }}>
                                    <div style={{ width: 40, height: 40, border: '1px solid #e5e7eb', borderRadius: 4, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        <img src={p.images?.[0]?.startsWith('http') ? p.images[0] : (p.images?.[0] ? `/${p.images[0]}` : '/placeholder.png')} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                </td>
                                <td style={{ padding: '8px 16px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>{p.name}</div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{p.category}</div>
                                </td>
                                {viewMode === 'desktop' && (
                                    <td style={{ padding: '8px 16px' }}>
                                        <span style={{ 
                                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            background: p.isActive ? '#dcfce7' : '#f3f4f6', color: p.isActive ? '#166534' : '#374151'
                                        }}>
                                            {p.isActive ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                )}
                                {viewMode === 'desktop' && (
                                    <td style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#4b5563' }}>
                                        {p.sizes?.[0]?.stock || 0} in stock
                                    </td>
                                )}
                                <td style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#4b5563' }}>₹{p.sizes?.[0]?.price?.toLocaleString() || '0'}</td>
                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                    <Link to={`/admin/inventory/edit/${p._id}`} state={{ product: p }} style={{
                                        display: 'inline-block', textDecoration: 'none', color: '#2563eb', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer', padding: '10px'
                                    }}>
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={viewMode === 'desktop' ? 6 : 4} style={{ padding: '32px 16px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280' }}>
                                    No products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AdminInventory;
