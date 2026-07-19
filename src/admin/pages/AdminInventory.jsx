import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';

import { productService } from '../../services/productService';
import ProductModal from '../components/ProductModal';
import CategoryManagement from '../components/CategoryManagement';
import { Search, Plus, Pencil, Trash2, Filter, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, XCircle, RotateCcw, Check, FileEdit, X, ShoppingBag } from 'lucide-react';


const FONT_SAFE = '"Roboto", sans-serif';
const SOFT_GREEN_BG = '#EBF9F1';
const DARK_GREEN_TEXT = '#00632B';
const SOFT_RED_BG = '#FFF5F5';
const DARK_RED_TEXT = '#B91B1B';
const BORDER_GRAY = '#E5E7EB';
const DARK_TEXT = '#111827';
const LIGHT_TEXT = '#6B7280';
const BG_OFF_WHITE = '#F4F6F8';
const FONT = FONT_SAFE;


const AdminInventory = () => {
    const location = useLocation();
    const filtersContainerRef = useRef(null);
    const longPressTimer = useRef(null);

    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState(location.state?.filterCategory || '');
    const [viewMode, setViewMode] = useState(window.innerWidth <= 768 ? 'mobile' : 'desktop');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [toast, setToast] = useState('');

    // Undo Logic
    const [undoItem, setUndoItem] = useState(null);
    const [undoTimer, setUndoTimer] = useState(0);
    const undoIntervalRef = useRef(null);

    // Native Shopify Extraneous States
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const [selectionMode, setSelectionMode] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [activeFilter, setActiveFilter] = useState(null);
    const itemsPerPage = 10;

    useEffect(() => {
        const handleResize = () => setViewMode(window.innerWidth <= 768 ? 'mobile' : 'desktop');
        const handleClickOutside = (e) => {
            if (filtersContainerRef.current && !filtersContainerRef.current.contains(e.target)) setActiveFilter(null);
        };
        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);
        fetchProducts();
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
        setSelectedProducts(new Set());
        if (selectedProducts.size === 0) setSelectionMode(false);
    }, [searchQuery, filterStatus, filterCategory, sortBy]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await productService.getAllAdminProducts();
            if (res.status && res.data) {
                setProducts(res.data);
            }
        } catch (err) {
            console.error('Inventory fetch error:', err);
        } finally {
            setLoading(false);
        }
    };


    // ----- PROCESSING PIPELINE -----
    const processedProducts = useMemo(() => {
        let result = [...(products || [])];

        const getCatId = (c) => typeof c === 'object' ? c?._id : c;
        const getCatName = (c) => typeof c === 'object' ? c?.name : c;
        const getPrice = (p) => p.sizes?.[0]?.sellingPrice || p.sizes?.[0]?.price || 0;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.name?.toLowerCase() || '').includes(query) ||
                (getCatName(p.category)?.toLowerCase() || '').includes(query)
            );
        }
        if (filterStatus === 'active') result = result.filter(p => p.isActive);
        if (filterStatus === 'draft') result = result.filter(p => !p.isActive);
        if (filterCategory !== 'all') {
            result = result.filter(p => getCatId(p.category) === filterCategory);
        }

        result.sort((a, b) => {
            if (sortBy === 'price-low') return getPrice(a) - getPrice(b);
            if (sortBy === 'price-high') return getPrice(b) - getPrice(a);
            if (sortBy === 'stock-low') return (a.sizes?.[0]?.stock || 0) - (b.sizes?.[0]?.stock || 0);
            return String(b._id).localeCompare(String(a._id)); // newest
        });

        return result;
    }, [products, searchQuery, filterStatus, filterCategory, sortBy]);

    // Derived from raw products to ensure we have IDs for filtering
    const categories = useMemo(() => {
        const rawCats = products.map(p => p.category).filter(Boolean);
        const map = new Map();
        rawCats.forEach(c => {
            const id = typeof c === 'object' ? c._id : c;
            const name = typeof c === 'object' ? c.name : c;
            if (id && !map.has(id)) map.set(id, { _id: id, name: name });
        });
        return Array.from(map.values());
    }, [products]);


    const totalPages = Math.ceil(processedProducts.length / itemsPerPage);
    const paginatedProducts = processedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // ----- LONG PRESS LOGIC -----
    const startLongPress = (id) => {
        if (viewMode !== 'mobile') return;
        longPressTimer.current = setTimeout(() => {
            setSelectionMode(true);
            setSelectedProducts(prev => { const s = new Set(prev); s.add(id); return s; });
            if (navigator.vibrate) navigator.vibrate(50);
        }, 500);
    };

    const stopLongPress = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const cancelLongPress = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    // ----- UNDO SYSTEM -----
    const triggerUndoableAction = (actionType, ids, message) => {
        const itemsToMove = products.filter(p => ids.has(p._id));
        const remainingItems = products.filter(p => !ids.has(p._id));

        setUndoItem({ type: actionType, items: itemsToMove, originalProducts: [...products] });
        setProducts(remainingItems);
        setUndoTimer(100);
        setToast(message);

        if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
        undoIntervalRef.current = setInterval(() => {
            setUndoTimer(prev => {
                if (prev <= 0) {
                    clearInterval(undoIntervalRef.current);
                    setUndoItem(null);
                    setToast('');
                    // Finalize deletion via API here if backend integration is present
                    return 0;
                }
                return prev - 2; // 5 seconds total (100 / 2 * 100ms = 5000ms)
            });
        }, 100);
    };

    const handleUndo = () => {
        if (undoItem) {
            setProducts(undoItem.originalProducts);
            setUndoItem(null);
            setToast('');
            if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
        }
    };

    // ----- ACTIONS -----
    const handleAddProduct = () => { setEditingProduct(null); setIsModalOpen(true); };
    const handleEditProduct = (product) => { setEditingProduct(product); setIsModalOpen(true); };

    const handleSaveProduct = async (productData) => {
        try {
            setLoading(true);
            const formData = new FormData();
            
            // Helper to clean array fields from comma-separated strings
            const toArray = (str) => {
                if (Array.isArray(str)) return str;
                if (!str || typeof str !== 'string') return [];
                return str.split(',').map(s => s.trim()).filter(Boolean);
            };

            formData.append('name', productData.name);
            formData.append('description', productData.description || '');
            formData.append('category', productData.category); // Now an ID
            formData.append('isActive', productData.isActive);
            
            // Convert strings to arrays as expected by the backend schema
            formData.append('mainAccords', JSON.stringify(toArray(productData.mainAccords)));
            
            const pyramid = {
                top: toArray(productData.perfumePyramid?.top),
                middle: toArray(productData.perfumePyramid?.middle),
                base: toArray(productData.perfumePyramid?.base)
            };
            formData.append('perfumePyramid', JSON.stringify(pyramid));
            
            formData.append('sizes', JSON.stringify(productData.sizes || []));
            
            // Handle Images
            if (productData.newImageFiles && productData.newImageFiles.length > 0) {
                productData.newImageFiles.forEach(file => {
                    formData.append('images', file);
                });
            }
            // Pass existing images so backend knows what to retain
            formData.append('existingImages', JSON.stringify(productData.existingImages || []));

            // Handle Story
            const storyObj = {
                sections: productData.story.sections || [],
                existingStoryImages: productData.story.existingStoryImages || []
            };
            formData.append('story', JSON.stringify(storyObj));
            
            if (productData.story.newStoryImageFiles && productData.story.newStoryImageFiles.length > 0) {
                productData.story.newStoryImageFiles.forEach(file => {
                    formData.append('storyImages', file);
                });
            }

            let res;
            if (editingProduct) {
                res = await productService.updateProduct(editingProduct._id, formData);
            } else {
                res = await productService.createProduct(formData);
            }

            if (res.status) {
                fetchProducts();
                setToast(`<b>${productData.name}</b> ${editingProduct ? 'updated' : 'added'} successfully`);
                setIsModalOpen(false);
            }
        } catch (err) {
            console.error('Save error:', err);
            setToast('Failed to save product');
        } finally {
            setLoading(false);
            setTimeout(() => setToast(''), 3000);
        }
    };



    const handleDeleteProduct = async (productId, name) => {
        try {
            const res = await productService.deleteProduct(productId);
            if (res.status) {
                setProducts(prev => prev.filter(p => p._id !== productId));
                setToast(`Deleted <b>${name}</b>`);
                setIsModalOpen(false);
            }
        } catch (err) {
            console.error('Delete error:', err);
            setToast('Failed to delete product');
        } finally {
            setTimeout(() => setToast(''), 3000);
        }
    };


    // ----- BULK MNGT -----
    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedProducts(new Set(paginatedProducts.map(p => p._id)));
        else setSelectedProducts(new Set());
    };

    const handleSelectProduct = (id) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(id)) {
            newSelected.delete(id);
            if (newSelected.size === 0) setSelectionMode(false);
        } else {
            newSelected.add(id);
        }
        setSelectedProducts(newSelected);
    };

    const handleBulkDelete = async () => {
        const count = selectedProducts.size;
        try {
            // Delete one by one if no bulk delete endpoint
            await Promise.all(Array.from(selectedProducts).map(id => productService.deleteProduct(id)));
            setProducts(prev => prev.filter(p => !selectedProducts.has(p._id)));
            setToast(`Deleted ${count} products`);
        } catch (err) {
            setToast('Failed to delete some products');
        } finally {
            setSelectedProducts(new Set());
            setSelectionMode(false);
            setTimeout(() => setToast(''), 3000);
        }
    };

    const handleBulkStatus = async (status) => {
        try {
            await Promise.all(Array.from(selectedProducts).map(id => productService.updateProduct(id, { isActive: status })));
            setProducts(prev => prev.map(p => selectedProducts.has(p._id) ? { ...p, isActive: status } : p));
            setToast(`Updated ${selectedProducts.size} products to ${status ? 'Active' : 'Draft'}`);
        } catch (err) {
            setToast('Failed to update status');
        } finally {
            setSelectedProducts(new Set());
            setSelectionMode(false);
            setTimeout(() => setToast(''), 3000);
        }
    };


    const filterBtnClass = "bg-white border border-gray-200 rounded-lg px-4 h-[44px] md:h-[42px] text-[13px] font-medium text-black flex items-center gap-2 hover:border-black transition-colors flex-shrink-0 whitespace-nowrap shadow-sm";


    const statusBadgeStyle = (active) => ({
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
        background: active ? '#E3F1DF' : '#F4F6F8', color: active ? '#008060' : '#6D7175', fontFamily: FONT
    });

    return (
        <div className="w-full relative overflow-x-hidden" style={{ background: BG_OFF_WHITE, minHeight: '100vh', fontFamily: FONT_SAFE, paddingBottom: 100, animation: 'fadeIn 0.3s ease-in-out' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: viewMode === 'mobile' ? '12px 16px' : '0 32px' }}>
                <div style={{ marginBottom: 24 }}>
                    <CategoryManagement onCategorySelect={(cat) => setSearchQuery(cat)} />
                </div>


                {/* Unified Shopify Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6 bg-transparent md:bg-white md:p-4 md:rounded-xl md:border md:border-gray-200">
                    <div className="flex flex-col md:flex-row gap-3 flex-1 w-full">
                        <div className="relative w-full md:w-96 order-1 md:order-none">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text" placeholder="Search inventory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-3 md:py-2.5 pl-11 pr-4 text-sm font-normal text-black bg-white border border-gray-200 rounded-lg outline-none focus:border-black transition-colors"
                            />
                        </div>

                        <div className="flex flex-nowrap overflow-visible gap-3 order-2 md:order-none pb-1 md:pb-0 w-full md:w-auto mt-2 md:mt-0" ref={filtersContainerRef}>
                            <div className="relative flex-shrink-0">
                                <button onClick={() => setActiveFilter(activeFilter === 'status' ? null : 'status')} className={filterBtnClass}>
                                    <Filter size={16} /> {filterStatus === 'all' ? 'Status' : (filterStatus === 'active' ? 'Active' : 'Draft')}
                                </button>
                                {activeFilter === 'status' && (
                                    <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2">
                                        {['all', 'active', 'draft'].map(s => {
                                            const isActive = filterStatus === s;
                                            return (
                                                <button key={s} onClick={() => { setFilterStatus(s); setActiveFilter(null); }}
                                                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex justify-between items-center text-[13px] ${isActive ? 'font-medium text-black' : 'font-normal text-gray-500'}`}>

                                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                                    {isActive && <Check size={16} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="relative flex-shrink-0">
                                <button onClick={() => setActiveFilter(activeFilter === 'category' ? null : 'category')} className={filterBtnClass}>
                                    <ChevronDown size={16} /> {filterCategory === 'all' ? 'Category' : (categories.find(c => (typeof c === 'string' ? c : c._id) === filterCategory)?.name || filterCategory)}
                                </button>

                                {activeFilter === 'category' && (
                                    <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2 max-h-64 overflow-y-auto">
                                        <button onClick={() => { setFilterCategory('all'); setActiveFilter(null); }}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex justify-between items-center text-[13px] ${filterCategory === 'all' ? 'font-medium text-black' : 'font-normal text-gray-500'}`}>

                                            All Categories
                                            {filterCategory === 'all' && <Check size={16} />}
                                        </button>
                                        {categories.map(cat => {
                                            const catId = typeof cat === 'string' ? cat : cat._id;
                                            const catName = typeof cat === 'string' ? cat : cat.name;
                                            const isActive = filterCategory === catId;
                                            return (
                                                <button key={catId} onClick={() => { setFilterCategory(catId); setActiveFilter(null); }}
                                                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex justify-between items-center text-[13px] ${isActive ? 'font-medium text-black' : 'font-normal text-gray-500'}`}>
                                                    {catName}
                                                    {isActive && <Check size={16} />}
                                                </button>
                                            );
                                        })}

                                    </div>
                                )}
                            </div>

                            <div className="relative flex-shrink-0">
                                <button onClick={() => setActiveFilter(activeFilter === 'sort' ? null : 'sort')} className={filterBtnClass}>
                                    <ChevronDown size={16} /> Sort
                                </button>
                                {activeFilter === 'sort' && (
                                    <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2 right-0 md:left-0 md:right-auto">
                                        {[
                                            { id: 'newest', label: 'Newest First' },
                                            { id: 'price-low', label: 'Price (Low to High)' },
                                            { id: 'price-high', label: 'Price (High to Low)' }
                                        ].map(s => {
                                            const isActive = sortBy === s.id;
                                            return (
                                                <button key={s.id} onClick={() => { setSortBy(s.id); setActiveFilter(null); }}
                                                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex justify-between items-center text-[13px] ${isActive ? 'font-medium text-black' : 'font-normal text-gray-500'}`}>

                                                    {s.label}
                                                    {isActive && <Check size={16} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleAddProduct}
                        className="bg-black text-white px-5 py-3 md:py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity font-bold text-sm shrink-0 whitespace-nowrap border-none order-3"
                    >
                        <Plus size={18} /> Add Product
                    </button>
                </div>

                {/* Undo Toast System */}
                {(toast || undoItem) && (
                    <div className={`fixed z-[2000] transition-all duration-300 ${viewMode === 'mobile' ? (selectionMode ? 'bottom-24' : 'bottom-8') + ' left-1/2 -translate-x-1/2 w-[90%]' : 'bottom-8 right-8 w-[360px]'}`}>
                        <div style={{ background: '#1A1A1A', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: undoItem ? 12 : 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
                                    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: toast }} />
                                </div>
                                {undoItem && (
                                    <button onClick={handleUndo} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <RotateCcw size={12} /> UNDO
                                    </button>
                                )}
                            </div>
                            {undoItem && (
                                <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                                    <div style={{ width: `${undoTimer}%`, height: '100%', background: '#fff', transition: 'width 0.1s linear' }} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Layout Transitions */}
                {loading ? (
                    <div className="flex justify-center items-center p-40">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                    </div>
                ) : viewMode === 'desktop' ? (
                    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                <tr>
                                    <th style={{ padding: '16px', width: 40, textAlign: 'center' }}>
                                        <input type="checkbox" checked={selectedProducts.size > 0 && selectedProducts.size === paginatedProducts.length} onChange={handleSelectAll} style={{ transform: 'scale(1.2)', cursor: 'pointer', accentColor: '#000' }} />
                                    </th>
                                    {selectedProducts.size > 0 ? (
                                        <th colSpan={6} style={{ padding: '10px 20px', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', fontFamily: FONT }}>{selectedProducts.size} selected</span>
                                                <div style={{ width: 1, height: 16, background: '#D1D5DB' }} />
                                                <button onClick={() => handleBulkStatus(true)} style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#374151', borderRadius: 8, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, fontFamily: FONT, cursor: 'pointer', transition: 'border-color 0.15s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#000'} onMouseOut={e => e.currentTarget.style.borderColor = '#E5E7EB'}>Mark Active</button>
                                                <button onClick={() => handleBulkStatus(false)} style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#374151', borderRadius: 8, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, fontFamily: FONT, cursor: 'pointer', transition: 'border-color 0.15s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#000'} onMouseOut={e => e.currentTarget.style.borderColor = '#E5E7EB'}>Mark Draft</button>
                                                <button onClick={handleBulkDelete} style={{ background: '#fff', border: '1px solid #FEE2E2', color: '#D82C0D', borderRadius: 8, padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, fontFamily: FONT, cursor: 'pointer', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = '#FFF5F5'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>Delete</button>
                                                <button onClick={() => { setSelectedProducts(new Set()); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '0.75rem', color: '#6B7280', fontWeight: 400, fontFamily: FONT, cursor: 'pointer' }}>Deselect All</button>
                                            </div>
                                        </th>
                                    ) : (
                                        <>
                                            <th style={{ fontFamily: FONT, padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#6D7175', textTransform: 'uppercase', tracking: '0.05em' }}>Image</th>
                                            <th style={{ fontFamily: FONT, padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#6D7175', textTransform: 'uppercase', tracking: '0.05em' }}>Product Name</th>
                                            <th style={{ fontFamily: FONT, padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#6D7175', textTransform: 'uppercase', tracking: '0.05em' }}>Status</th>
                                            <th style={{ fontFamily: FONT, padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#6D7175', textTransform: 'uppercase', tracking: '0.05em' }}>Price</th>
                                            <th style={{ fontFamily: FONT, padding: '16px 20px', fontSize: '11px', fontWeight: 700, color: '#6D7175', textTransform: 'uppercase', tracking: '0.05em', textAlign: 'right' }}>Actions</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProducts.length > 0 ? paginatedProducts.map((p, idx) => (
                                    <tr key={p._id} style={{ borderBottom: idx === paginatedProducts.length - 1 ? 'none' : '1px solid #E5E7EB', background: selectedProducts.has(p._id) ? '#F9FAFB' : 'transparent' }} className="hover:bg-gray-50/50">
                                        <td style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                                            <input type="checkbox" checked={selectedProducts.has(p._id)} onChange={() => handleSelectProduct(p._id)} style={{ transform: 'scale(1.2)', cursor: 'pointer', accentColor: '#000' }} />
                                        </td>
                                        <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                            <div style={{ width: 44, height: 44, border: '1px solid #E5E7EB', borderRadius: '8px', background: '#fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `/${p.images[0]}`) : '/placeholder.png'} alt={p.name} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#000', fontFamily: FONT, marginBottom: 2 }}>{p.name}</div>
                                            <div style={{ fontSize: '12px', color: '#6D7175' }}>{typeof p.category === 'object' ? p.category?.name : (categories.find(c => (typeof c === 'string' ? c : c._id) === p.category)?.name || p.category)}</div>

                                        </td>
                                        <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                            <div style={statusBadgeStyle(p.isActive)}>
                                                {p.isActive ? 'Active' : 'Draft'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px', verticalAlign: 'middle', fontSize: '0.85rem', color: '#000', fontWeight: 700 }}>₹{(p.sizes?.[0]?.sellingPrice || p.sizes?.[0]?.price || 0).toLocaleString()}</td>

                                        <td style={{ padding: '16px 20px', verticalAlign: 'middle', textAlign: 'right' }}>
                                            <div className="flex gap-4 justify-end items-center">
                                                <Link to={`/product/${p.slug}`} target="_blank" className="text-gray-500 font-bold text-sm hover:text-black hover:underline-none transition-colors" style={{ textDecoration: 'none' }}>View</Link>
                                                <button onClick={() => handleEditProduct(p)} className="text-black font-bold text-sm bg-transparent border-none p-0 cursor-pointer hover:opacity-70 transition-opacity">Edit</button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={7} style={{ padding: '100px 32px', textAlign: 'center', color: '#6D7175' }}>No products found.</td></tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20 }}>
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: 8, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.3 : 1 }}>
                                    <ChevronLeft size={18} />
                                </button>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000' }}>Page {currentPage} of {totalPages}</span>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 8, padding: 8, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.3 : 1 }}>
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Mobile View: Vertical Cards */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {paginatedProducts.map((p) => {
                            const isSelected = selectedProducts.has(p._id);
                            return (
                                <div
                                    key={p._id}
                                    onMouseDown={() => startLongPress(p._id)}
                                    onMouseUp={stopLongPress}
                                    onMouseMove={cancelLongPress}
                                    onTouchStart={() => startLongPress(p._id)}
                                    onTouchEnd={stopLongPress}
                                    onTouchMove={cancelLongPress}
                                    onClick={() => selectionMode ? handleSelectProduct(p._id) : handleEditProduct(p)}
                                    style={{
                                        background: '#FFFFFF',
                                        border: `2px solid ${isSelected ? '#000' : '#E5E7EB'}`,
                                        borderRadius: '16px', padding: '16px', display: 'flex', gap: 16, alignItems: 'center',
                                        transition: 'all 0.2s ease',
                                        boxShadow: isSelected ? '0 8px 24px -5px rgba(0,0,0,0.12)' : '0 1px 2px rgba(0,0,0,0.05)',
                                        userSelect: 'none', WebkitUserSelect: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        {/* Selection checkmark overlay */}
                                        {selectionMode && (
                                            <div style={{
                                                position: 'absolute', top: -6, left: -6, zIndex: 10,
                                                width: 22, height: 22, borderRadius: '50%',
                                                background: isSelected ? '#000' : '#fff',
                                                border: `2px solid ${isSelected ? '#000' : '#D1D5DB'}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.15s ease',
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                                            }}>
                                                {isSelected && <Check size={12} strokeWidth={3} color="#fff" />}
                                            </div>
                                        )}
                                        <div style={{ width: 80, height: 80, borderRadius: 12, background: '#F9FAFB', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #F1F1F1' }}>
                                            <img src={p.images?.[0] ? (p.images[0].startsWith('http') ? p.images[0] : `/${p.images[0]}`) : '/placeholder.png'} alt={p.name} style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, fontFamily: '"Roboto", sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{p.name}</h3>
                                            <div style={statusBadgeStyle(p.isActive)}>{p.isActive ? 'Active' : 'Draft'}</div>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#6D7175', margin: '0 0 12px 0', fontFamily: '"Roboto", sans-serif' }}>{typeof p.category === 'object' ? p.category?.name : (categories.find(c => (typeof c === 'string' ? c : c._id) === p.category)?.name || p.category)}</p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, fontFamily: '"Roboto", sans-serif' }}>₹{(p.sizes?.[0]?.sellingPrice || p.sizes?.[0]?.price || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Mobile Bulk Bar — Shopify-style pill */}
                        <div
                            style={{
                                position: 'fixed',
                                bottom: selectionMode ? 32 : -140,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 3000,
                                width: '92%',
                                maxWidth: 420,
                                opacity: selectionMode ? 1 : 0,
                                pointerEvents: selectionMode ? 'auto' : 'none',
                                transition: 'bottom 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease',
                            }}
                        >
                            <div style={{
                                background: '#000',
                                borderRadius: 24,
                                padding: '14px 18px',
                                boxShadow: '0 24px 48px -8px rgba(0,0,0,0.45)',
                                fontFamily: '"Roboto", sans-serif',
                            }}>
                                {/* Top row: count + deselect */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>
                                        {selectedProducts.size} Selected
                                    </span>
                                    <button
                                        onClick={() => { setSelectedProducts(new Set()); setSelectionMode(false); }}
                                        style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '0.78rem', fontWeight: 400, cursor: 'pointer', fontFamily: '"Roboto", sans-serif', padding: 0 }}
                                    >
                                        Deselect All
                                    </button>
                                </div>

                                {/* Divider */}
                                <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 12 }} />

                                {/* Action row */}
                                <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
                                    {/* Mark Active */}
                                    <button
                                        onClick={() => handleBulkStatus(true)}
                                        style={{
                                            background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff',
                                            borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center',
                                            gap: 7, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                                            fontFamily: '"Roboto", sans-serif', whiteSpace: 'nowrap', flexShrink: 0
                                        }}
                                    >
                                        <CheckCircle size={15} strokeWidth={2} />
                                        Mark Active
                                    </button>

                                    {/* Mark Draft */}
                                    <button
                                        onClick={() => handleBulkStatus(false)}
                                        style={{
                                            background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff',
                                            borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center',
                                            gap: 7, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                                            fontFamily: '"Roboto", sans-serif', whiteSpace: 'nowrap', flexShrink: 0
                                        }}
                                    >
                                        <FileEdit size={15} strokeWidth={2} />
                                        Mark Draft
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={handleBulkDelete}
                                        style={{
                                            background: 'rgba(216,44,13,0.18)', border: 'none', color: '#FF6B6B',
                                            borderRadius: 12, padding: '8px 14px', display: 'flex', alignItems: 'center',
                                            gap: 7, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                                            fontFamily: '"Roboto", sans-serif', whiteSpace: 'nowrap', flexShrink: 0
                                        }}
                                    >
                                        <Trash2 size={15} strokeWidth={2} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '24px 0' }}>
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '8px 16px', fontWeight: 700, opacity: currentPage === 1 ? 0.3 : 1 }}>Prev</button>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 12, padding: '8px 16px', fontWeight: 700, opacity: currentPage === totalPages ? 0.3 : 1 }}>Next</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
                product={editingProduct}
                onSave={handleSaveProduct}
                onDelete={(id) => handleDeleteProduct(id, editingProduct?.name)}
            />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { opacity: 0; transform: translate3d(0, 100%, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default AdminInventory;

