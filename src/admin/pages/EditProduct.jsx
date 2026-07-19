import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useStorefront } from '../../context/StorefrontContext';
import { productService } from '../../services/productService';

const FONT = '"Roboto", sans-serif';

const EditProduct = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { categories } = useStorefront();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [isMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                if (location.state?.product) {
                    const p = location.state.product;
                    setProduct({
                        ...p,
                        price: p.sizes?.[0]?.price || p.price || '',
                        stock: p.sizes?.[0]?.stock !== undefined ? p.sizes[0].stock : (p.stock || 0),
                        images: p.images || [],
                        isActive: p.isActive !== undefined ? p.isActive : true
                    });
                } else {
                    const res = await productService.getAllProducts();
                    const allProducts = res.data?.luxury_collection || res.data?.luxury || (Array.isArray(res.data) ? res.data : []);
                    const p = allProducts.find(item => item._id === id);
                    if (p) {
                        setProduct({
                            ...p,
                            price: p.sizes?.[0]?.price || p.price || '',
                            stock: p.sizes?.[0]?.stock !== undefined ? p.sizes[0].stock : (p.stock || 0),
                            images: p.images || [],
                            isActive: p.isActive !== undefined ? p.isActive : true
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setToast('Error loading product');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!product.name || !product.price) return;
        
        setSaving(true);
        
        const payload = {
            name: product.name,
            description: product.description,
            category: product.category,
            isActive: product.isActive,
            images: product.images,
            mainAccords: product.mainAccords || [],
            perfumePyramid: product.perfumePyramid || { top: [], middle: [], base: [] },
            sizes: [
                { 
                    size: 'Standard', 
                    price: Number(product.price), 
                    stock: Number(product.stock) 
                }
            ]
        };

        try {
            await productService.updateProduct(id, payload);
            setToast('Product updated successfully');
            setTimeout(() => navigate('/admin/inventory'), 1500);
        } catch (err) {
            console.error('Save error:', err);
            setToast('Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !product) {
        return <div style={{ fontFamily: FONT, padding: 40, color: '#6e6e73' }}>Loading product details...</div>;
    }

    return (
        <div style={{ fontFamily: FONT, animation: 'fadeIn 0.3s ease-in-out', maxWidth: 800, margin: '0 auto', position: 'relative' }}>
            
            {/* Toast Notification */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 32, right: 32, background: '#111827', color: '#fff',
                    padding: '12px 24px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700,
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    zIndex: 2000, animation: 'fadeInUp 0.3s ease-out', fontFamily: FONT
                }}>
                    {toast}
                </div>
            )}

            {/* Top Navigation */}
            <div style={{ marginBottom: 20 }}>
                <Link to="/admin/inventory" style={{ 
                    color: '#6e6e73', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
                    display: 'inline-flex', alignItems: 'center', transition: 'color 0.2s'
                }} onMouseEnter={e => e.currentTarget.style.color = '#111'} onMouseLeave={e => e.currentTarget.style.color = '#6e6e73'}>
                    ← Back to inventory
                </Link>
            </div>

            {/* Header */}
            <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(0,0,0,0.08)'
            }}>
                <h1 style={{ fontFamily: '"Roboto", sans-serif', fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 700, color: '#000', margin: 0, textTransform: 'none' }}>
                    Edit Product
                </h1>
                
                <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                        onClick={() => navigate('/admin/inventory')}
                        style={{
                            background: '#fff', color: '#666', border: '1px solid #d1d5db',
                            padding: '10px 20px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700,
                            cursor: 'pointer', transition: 'all 0.15s', fontFamily: '"Roboto", sans-serif'
                        }}
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: '#000', color: '#fff', border: 'none',
                            padding: '10px 24px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700,
                            cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.15s', fontFamily: '"Roboto", sans-serif',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}
                    >
                        {saving ? 'Saving...' : 'Update Product'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 80 }}>
                
                {/* Name & Category Section */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                    gap: 24,
                    background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb'
                }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#000', marginBottom: 8, fontFamily: '"Roboto", sans-serif' }}>Product Name</label>
                        <input 
                            name="name"
                            type="text" 
                            value={product.name}
                            onChange={handleChange}
                            required
                            style={{ 
                                width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '6px', 
                                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: '"Roboto", sans-serif', fontWeight: 400
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#000', marginBottom: 8, fontFamily: '"Roboto", sans-serif' }}>Category</label>
                        <select 
                            name="category"
                            value={product.category || ''}
                            onChange={handleChange}
                            style={{ 
                                width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '6px', 
                                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: '"Roboto", sans-serif', background: '#fff'
                            }}
                        >
                            <option value="" disabled>Select Category</option>
                            {(categories || []).map((cat, idx) => (
                                <option key={idx} value={typeof cat === 'string' ? cat : cat.name}>
                                    {typeof cat === 'string' ? cat : cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Price & Stock Section */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                    gap: 24,
                    background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb'
                }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#000', marginBottom: 8, fontFamily: '"Roboto", sans-serif' }}>Price (₹)</label>
                        <input 
                            name="price"
                            type="number" 
                            value={product.price}
                            onChange={handleChange}
                            required
                            style={{ 
                                width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '6px', 
                                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: '"Roboto", sans-serif', fontWeight: 400
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#000', marginBottom: 8, fontFamily: '"Roboto", sans-serif' }}>Stock</label>
                        <input 
                            name="stock"
                            type="number" 
                            value={product.stock}
                            onChange={handleChange}
                            required
                            style={{ 
                                width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '6px', 
                                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: '"Roboto", sans-serif', fontWeight: 400
                            }}
                        />
                    </div>
                </div>

                {/* Description */}
                <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#000', marginBottom: 8, fontFamily: '"Roboto", sans-serif' }}>Description</label>
                    <textarea 
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        rows={5}
                        style={{ 
                            width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '6px', 
                            fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: '"Roboto", sans-serif', resize: 'vertical', fontWeight: 400
                        }}
                    />
                </div>

                {/* Media */}
                <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#000', marginBottom: 8, fontFamily: '"Roboto", sans-serif' }}>Product Image URL</label>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ width: 80, height: 80, border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', background: '#f9fafb', flexShrink: 0 }}>
                            <img src={product.images?.[0] || 'https://via.placeholder.com/80'} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <input 
                            type="text"
                            value={product.images?.[0] || ''}
                            onChange={(e) => setProduct({...product, images: [e.target.value]})}
                            placeholder="https://res.cloudinary.com/..."
                            style={{ 
                                flex: 1, padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '6px', 
                                fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', fontFamily: '"Roboto", sans-serif', fontWeight: 400
                            }}
                        />
                    </div>
                </div>

                {/* Visibility Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb' }}>
                    <input 
                        type="checkbox" 
                        id="isActive" 
                        checked={product.isActive} 
                        onChange={(e) => setProduct(prev => ({ ...prev, isActive: e.target.checked }))}
                        style={{ width: 20, height: 20, cursor: 'pointer' }}
                    />
                    <label htmlFor="isActive" style={{ fontSize: '0.95rem', fontWeight: 400, color: '#000', cursor: 'pointer', fontFamily: '"Roboto", sans-serif' }}>
                        This product is currently <b>{product.isActive ? 'Active' : 'Hidden'}</b>. Toggle to change visibility on storefront.
                    </label>
                </div>

            </form>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default EditProduct;
