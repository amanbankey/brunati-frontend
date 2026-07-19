import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../product/ProductCard';
import { useCart } from '../../context/CartContext';
import { productService } from '../../services/productService';

import { useStorefront } from '../../context/StorefrontContext';

const Collections = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { categories, setCategories, fetchCategories } = useStorefront();
    const [activeTab, setActiveTab] = useState('');
    const [sliderIndex, setSliderIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState('100ml');
    const [productsByTab, setProductsByTab] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchAndCategorize = async () => {
            try {
                setLoading(true);
                const response = await productService.getAllProducts();
                if (response.status) {
                    
                    let allProducts = response.data?.luxury_collection || response.data?.luxury || [];
                    
                    // If no explicit luxury collection key, filter from global product array using new backend keys
                    if (!allProducts || allProducts.length === 0) {
                        const rawData = Array.isArray(response.data) ? response.data : [];
                        allProducts = rawData.filter(p => p?.collectionType === 'luxury' || p?.isLuxury === true);
                        
                        // Fallback to basic categorizing if collectionType isn't found
                        if (allProducts.length === 0) {
                            allProducts = Array.isArray(rawData) ? rawData : (Object.values(rawData).filter(val => Array.isArray(val)).flat() || []);
                        }
                    }

                    const categorized = {};
                    
                    // Initialize array for all loaded categories
                    categories?.forEach(c => {
                        const id = typeof c === 'string' ? c : c._id;
                        categorized[id] = [];
                    });

                    // Identify specific categories for cross-listing
                    const menCat = categories?.find(c => (c.name || c).toLowerCase() === 'men');
                    const womenCat = categories?.find(c => (c.name || c).toLowerCase() === 'women');
                    const unisexCat = categories?.find(c => (c.name || c).toLowerCase() === 'unisex');

                    allProducts?.forEach(p => {
                        const catId = typeof p?.category === 'object' ? p?.category?._id : p?.category;
                        if (catId) {
                            if (!categorized[catId]) categorized[catId] = [];
                            categorized[catId].push(p);
                        }
                    });

                    // Cross-listing logic: Add Unisex products to Men and Women tabs at the end
                    if (unisexCat) {
                        const unisexId = unisexCat._id || unisexCat;
                        const unisexProducts = categorized[unisexId] || [];
                        
                        if (unisexProducts.length > 0) {
                            if (menCat) {
                                const menId = menCat._id || menCat;
                                categorized[menId] = [...(categorized[menId] || []), ...unisexProducts];
                            }
                            if (womenCat) {
                                const womenId = womenCat._id || womenCat;
                                categorized[womenId] = [...(categorized[womenId] || []), ...unisexProducts];
                            }
                        }
                    }

                    setProductsByTab(categorized);
                    
                    if (categories && categories.length > 0) {
                        const firstId = typeof categories[0] === 'string' ? categories[0] : categories[0]._id;
                        setActiveTab(prev => prev || firstId);
                    }
                }
            } catch (err) {
                console.error('Collections fetch error:', err);
                setError('Failed to load collections.');
            } finally {
                setLoading(false);
            }
        };

        if (categories && categories.length > 0) {
            fetchAndCategorize();
        } else {
            setLoading(false);
        }
    }, [categories]);

    // Reset slider index when tab changes
    useEffect(() => {
        setSliderIndex(0);
    }, [activeTab]);

    if (loading) {
        return (
            <section className="content-wrap" style={{ minHeight: '600px' }}>
                <div className="section-header">
                    <h2 className="section-title" style={{ fontFamily: '"Trojan", serif', fontWeight: 700, textTransform: 'none' }}>Luxury Collections</h2>
                </div>
                <div className="flex justify-center items-center" style={{ padding: '100px 0' }}>
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                </div>
            </section>
        );
    }
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    const currentTabProducts = productsByTab[activeTab] || [];

    const getProductInfo = (p) => {
        if (!p) return {};
        const catName = typeof p?.category === 'object' ? p?.category?.name : (categories?.find(c => (typeof c === 'string' ? c : c._id) === p?.category)?.name || p?.category);
        return {
            id: p?._id,
            slug: p?.slug,
            name: p?.name,
            meta: `${catName} • Extrait De Parfum`,
            sellingPrice: p?.sizes?.[0]?.sellingPrice || p?.sizes?.[0]?.price || 0,
            mrp: p?.sizes?.[0]?.mrp || p?.sizes?.[0]?.sellingPrice || p?.sizes?.[0]?.price || 0,



            img1: p?.images?.[0]?.startsWith('http') ? p?.images?.[0] : `/${p?.images?.[0]}`,
            img2: p?.images?.[1] ? (p?.images?.[1]?.startsWith('http') ? p?.images?.[1] : `/${p?.images?.[1]}`) : (p?.images?.[0]?.startsWith('http') ? p?.images?.[0] : `/${p?.images?.[0]}`),
            accords: p?.mainAccords,
            description: p?.description,
            topNotes: p?.perfumePyramid?.top?.join(', '),
            middleNotes: p?.perfumePyramid?.middle?.join(', '),
            baseNotes: p?.perfumePyramid?.base?.join(', '),
            gender: catName,
            sizes: p?.sizes || []
        };
    };

    const nextSlide = () => {
        setSliderIndex((prev) => (prev + 1) % currentTabProducts.length);
    };

    const prevSlide = () => {
        setSliderIndex((prev) => (prev - 1 + currentTabProducts.length) % currentTabProducts.length);
    };

    const currentProduct = getProductInfo(currentTabProducts?.[sliderIndex]);

    const activeCatName = categories?.find(c => (typeof c === 'string' ? c : c._id) === activeTab) || {};
    const displayActiveName = typeof activeCatName === 'string' ? activeCatName : activeCatName?.name;
    console.log("dddd", currentProduct)

    if (!currentTabProducts || currentTabProducts.length === 0) {
        return (
            <section className="content-wrap">
                <div className="section-header">
                    <h2 className="section-title" style={{ fontFamily: '"Trojan", serif', fontWeight: 700, textTransform: 'none' }}>Luxury Collections</h2>
                    <div className="tabs">
                        {categories?.map(cat => {
                            const id = typeof cat === 'string' ? cat : cat._id;
                            const name = typeof cat === 'string' ? cat : cat.name;
                            return (
                                <button 
                                    key={id}
                                    className={`tab-btn ${activeTab === id ? 'active' : ''}`} 
                                    onClick={() => setActiveTab(id)}
                                >
                                    {name}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div style={{ 
                    padding: '80px 0', 
                    textAlign: 'center', 
                    color: '#86868b', 
                    fontSize: '0.9rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%'
                }}>
                    Discover our {displayActiveName} collection soon.
                </div>
            </section>
        );
    }

    return (
        <section className="content-wrap" id="collections">
            <div className="section-header" style={{ marginBottom: '20px' }}>
                <h2 className="section-title" style={{ fontFamily: '"Trojan", serif', fontWeight: 700, textTransform: 'none' }}>Luxury Collections</h2>
                <div className="tabs">
                    {categories?.map(cat => {
                        const id = typeof cat === 'string' ? cat : cat._id;
                        const name = typeof cat === 'string' ? cat : cat.name;
                        return (
                            <button 
                                key={id}
                                className={`tab-btn ${activeTab === id ? 'active' : ''}`} 
                                onClick={() => setActiveTab(id)}
                            >
                                {name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Desktop Slider View */}
            <div className="product-slider-desktop">
                <div className="slider-side-nav">
                    <button className="side-nav-btn" onClick={prevSlide}>
                        <svg width="20" height="34" viewBox="0 0 24 40" fill="none" stroke="#e74c3c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 2 2 20 20 38"></polyline></svg>
                    </button>
                    <button className="side-nav-btn" onClick={nextSlide}>
                        <svg width="20" height="34" viewBox="0 0 24 40" fill="none" stroke="#e74c3c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 2 22 20 4 38"></polyline></svg>
                    </button>
                </div>

                <div className="slider-main-container">
                    <div 
                        className="slider-img-wrap" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/product/${currentProduct.slug}`)}
                    >
                        <img 
                            src={currentProduct.img1} 
                            alt={currentProduct.name} 
                            className="slider-img" 
                            key={currentProduct.id}
                        />
                    </div>

                    <div className="slider-info-col">
                        <div 
                            className="slider-title-row" 
                            style={{ display: 'flex', alignItems: 'baseline', cursor: 'pointer' }}
                            onClick={() => navigate(`/product/${currentProduct.slug}`)}
                        >
                            <h2 className="slider-title" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: 700, textTransform: 'none' }}>{currentProduct.name}</h2>
                            <span className="slider-divider" style={{ margin: '0 8px' }}>\</span>
                            <span className="slider-category">{currentProduct.gender}</span>
                            <div className="red-dot" style={{ width: '4px', height: '4px', background: '#D22B2B', borderRadius: '50%', marginLeft: '4px', alignSelf: 'baseline' }}></div>
                        </div>

                        <div className="slider-rating">
                            <div className="stars">★★★★★</div>
                            <span className="review-text-link">16 reviews</span>
                        </div>

                        <p className="slider-description">
                            {currentProduct.description}
                        </p>

                        <div className="slider-accords-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '20px', marginBottom: '32px' }}>
                            {currentProduct.accords && currentProduct.accords.length > 0 ? (
                                currentProduct.accords.map((accord, idx) => (
                                    <span key={idx} style={{ 
                                        padding: '5px 12px', 
                                        background: '#f5f5f7', 
                                        borderRadius: '4px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 600,
                                        color: '#1d1d1f',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        border: '1px solid #e5e5e7'
                                    }}>
                                        {accord}
                                    </span>
                                ))
                            ) : null}
                        </div>

                        <div className="slider-size-row">
                            {currentProduct.sizes?.map(s => (
                                <button 
                                    key={s.size} 
                                    className={`slider-size-btn ${selectedSize.toLowerCase() === s.size.toLowerCase() ? 'active' : ''}`}
                                    onClick={() => setSelectedSize(s.size)}
                                >
                                    {s.size}
                                </button>
                            ))}
                        </div>

                        {(() => {
                            const activeVariant = currentProduct.sizes?.find(s => s.size.toLowerCase() === selectedSize.toLowerCase()) || currentProduct.sizes?.[0] || {};
                            const sPrice = activeVariant.sellingPrice || activeVariant.price || 0;
                            const mPrice = activeVariant.mrp || sPrice;

                            return (
                                
                                <div 
                                    className="slider-add-bar"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        addToCart({
                                            id: currentProduct.id,
                                            name: currentProduct.name,
                                            size: selectedSize,
                                            price: sPrice,
                                            mrp: mPrice,
                                            quantity: 1,
                                            image: currentProduct.img1,
                                            slug: currentProduct.slug || currentProduct.id,
                                        });
                                        navigate('/cart');
                                    }}
                                >
                                    <span>Add to cart</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                        <span>₹ {Number(sPrice).toLocaleString()}</span>
                                        {mPrice > sPrice && (
                                            <span style={{ fontSize: '0.7rem', textDecoration: 'line-through', opacity: 0.6 }}>₹ {Number(mPrice).toLocaleString()}</span>
                                        )}
                                    </div>
                                  
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Mobile Grid View */}
            <div className="category-view active mobile-only-grid">
                <div className="product-grid">
                    {currentTabProducts?.map(p => (
                        <ProductCard key={p?._id || Math.random()} {...getProductInfo(p)} />
                    ))}
                </div>
            </div>

        </section>
    );
};

export default Collections;
