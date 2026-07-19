import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Check, AlertCircle, ChevronDown, Plus, Trash2, ImagePlus, Loader2 } from 'lucide-react';
import { useStorefront } from '../../context/StorefrontContext';
import { compressImage } from '../../utils/imageCompression';

const FONT = '"Roboto", sans-serif';

const CategoryDropdown = ({ value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const isMobile = window.innerWidth < 768;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === 'ArrowDown') setIsOpen(true);
            return;
        }

        if (e.key === 'ArrowDown') {
            setFocusedIndex(prev => Math.min(prev + 1, options.length - 1));
        } else if (e.key === 'ArrowUp') {
            setFocusedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && focusedIndex >= 0) {
            const opt = options[focusedIndex];
            onChange(typeof opt === 'string' ? opt : opt._id);
            setIsOpen(false);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const selectedOption = options.find(opt => (typeof opt === 'string' ? opt : opt._id) === value);
    const displayValue = selectedOption ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.name) : '';

    return (
        <div ref={dropdownRef} style={{ width: '100%', position: 'relative' }} onKeyDown={handleKeyDown}>
            {/* Trigger Box */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%', padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', 
                    fontSize: '0.9rem', outline: 'none', fontFamily: FONT, background: '#fff',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out', borderColor: isOpen ? '#000' : '#E5E7EB',
                    boxShadow: isOpen ? '0 0 0 1px #000' : 'none'
                }}
            >
                <span style={{ 
                    color: displayValue ? '#000' : '#9ca3af', 
                    fontWeight: 400 
                }}>
                    {displayValue || 'Select Category'}
                </span>

                <ChevronDown 
                    size={18} 
                    style={{ 
                        color: '#000', transition: 'transform 0.3s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' 
                    }} 
                />
            </div>

            {/* Popover Menu */}
            {isOpen && options.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    width: '100%',
                    background: '#fff',
                    zIndex: 2100,
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    border: '1px solid #E5E7EB',
                    padding: '6px'
                }}>

                    
                    {options.map((opt, idx) => {

                        const optId = typeof opt === 'string' ? opt : opt._id;
                        const optName = typeof opt === 'string' ? opt : opt.name;
                        const isSelected = optId === value;
                        const isFocused = idx === focusedIndex;

                        return (
                            <div
                                key={idx}
                                onClick={() => { onChange(optId); setIsOpen(false); }}
                                onMouseEnter={() => setFocusedIndex(idx)}
                                style={{
                                    padding: '12px 16px', fontSize: '0.9rem', fontFamily: FONT, cursor: 'pointer',
                                    color: isSelected ? '#000' : '#4b5563', fontWeight: isSelected ? 700 : 400,
                                    background: isFocused ? '#F9FAFB' : 'transparent',
                                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    transition: 'all 0.1s ease',
                                    marginBottom: '2px'
                                }}
                            >
                                {optName}
                                {isSelected && <Check size={16} strokeWidth={3} color="#000" />}
                            </div>
                        );
                    })}
                </div>
            )}



            {isMobile && isOpen && (
                <div 
                    onClick={() => setIsOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 2050 }}
                />
            )}
        </div>
    );
};

const ImageUploadArea = ({ images, onChange, label, multiple = true }) => {
    const fileInputRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsProcessing(true);
        try {
            const compressedResults = await Promise.all(
                files.map(async (file) => {
                    const compressedFile = await compressImage(file);
                    return {
                        url: URL.createObjectURL(compressedFile),
                        file: compressedFile,
                        id: `new-${Date.now()}-${Math.random()}`
                    };
                })
            );

            const existingItems = images.map(img => {
                if (typeof img === 'string') return { url: img, file: null, id: img };
                return img;
            });

            onChange([...existingItems, ...compressedResults].filter(Boolean));
        } catch (err) {
            console.error('Compression error:', err);
        } finally {
            setIsProcessing(false);
            e.target.value = '';
        }
    };

    const removeImage = (id) => {
        onChange(images.filter(img => (typeof img === 'string' ? img : img.id) !== id));
    };

    return (
        <div>
            <label className="font-roboto font-bold text-black uppercase tracking-widest text-[11px] block mb-6">{label}</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.filter(img => img && (typeof img === 'string' ? img.trim() !== '' : img.url.trim() !== '')).map((img, idx) => {
                    const url = typeof img === 'string' ? img : img.url;
                    const id = typeof img === 'string' ? img : img.id;
                    return (
                        <div key={id || idx} style={{ position: 'relative', background: '#FFF', borderRadius: '12px', border: '1px solid #E5E7EB', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            <img src={url.startsWith('http') || url.startsWith('blob:') ? url : `/${url}`} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button type="button" onClick={() => removeImage(id)} style={{ position: 'absolute', top: 6, right: 6, background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, minWidth: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', color: '#D82C0D' }}>
                                <Trash2 size={14} strokeWidth={3} />
                            </button>
                        </div>
                    );
                })}
                
                <button 
                    type="button" 
                    onClick={() => !isProcessing && fileInputRef.current?.click()} 
                    disabled={isProcessing}
                    style={{ background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: '10px', aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: isProcessing ? 'wait' : 'pointer', gap: 8, transition: 'all 0.2s', opacity: isProcessing ? 0.7 : 1 }}
                >
                    {isProcessing ? <Loader2 size={24} className="animate-spin text-gray-400" /> : <ImagePlus size={24} color="#6D7175" />}
                    <span className="font-roboto font-bold text-black uppercase tracking-widest text-[11px]">{isProcessing ? 'Processing' : 'Upload'}</span>
                    <span className="font-roboto font-normal text-[#6D7175] text-[10px]">{isProcessing ? 'Optimizing...' : 'Drag & Drop'}</span>
                </button>
                <input type="file" multiple={multiple} accept="image/*,video/*" ref={fileInputRef} hidden onChange={handleFileChange} />
            </div>
        </div>
    );
};

const ProductModal = ({ isOpen, onClose, product: initialProduct, onSave, onDelete }) => {
    const { categories } = useStorefront();
    const [activeTab, setActiveTab] = useState('basic');
    
    const [product, setProduct] = useState({
        name: '',
        description: '',
        category: '',
        isActive: true,
        images: [],
        mainAccords: '',
        perfumePyramid: { top: '', middle: '', base: '' },
        sizes: [{ size: 'Standard', sellingPrice: '', mrp: '', stock: '' }],
        story: { storyImages: [], sections: [{ title: '', description: '' }] }
    });
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const isEdit = !!initialProduct;

    useEffect(() => {
        if (initialProduct && isOpen) {
            setProduct({
                name: initialProduct.name || '',
                description: initialProduct.description || '',
                category: (typeof initialProduct.category === 'object' ? initialProduct.category?._id : initialProduct.category) || '',

                isActive: initialProduct.isActive !== undefined ? initialProduct.isActive : true,
                images: initialProduct.images?.length ? initialProduct.images : [],
                mainAccords: initialProduct.mainAccords?.join(', ') || '',
                perfumePyramid: {
                    top: initialProduct.perfumePyramid?.top?.join(', ') || '',
                    middle: initialProduct.perfumePyramid?.middle?.join(', ') || '',
                    base: initialProduct.perfumePyramid?.base?.join(', ') || ''
                },
                sizes: initialProduct.sizes?.length ? initialProduct.sizes.map(s => ({...s, sellingPrice: s.sellingPrice || s.price || '', mrp: s.mrp || ''})) : [{ size: 'Standard', sellingPrice: '', mrp: '', stock: '' }],
                story: {
                    storyImages: initialProduct.story?.storyImages?.length ? initialProduct.story.storyImages : [],
                    sections: initialProduct.story?.sections?.length ? initialProduct.story.sections.map(s => ({...s})) : [{ title: '', description: '' }]
                }
            });
            setActiveTab('basic');
        } else if (isOpen) {
            setProduct({
                name: '',
                description: '',
                category: '',
                isActive: true,
                images: [],
                mainAccords: '',
                perfumePyramid: { top: '', middle: '', base: '' },
                sizes: [{ size: 'Standard', sellingPrice: '', mrp: '', stock: 0 }],
                story: { storyImages: [], sections: [{ title: '', description: '' }] }
            });
            setActiveTab('basic');
        }
    }, [initialProduct, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({ ...prev, [name]: value }));
    };

    const handlePyramidChange = (level, value) => {
        setProduct(prev => ({
            ...prev,
            perfumePyramid: { ...prev.perfumePyramid, [level]: value }
        }));
    };

    const handleArrayItemChange = (field, index, value, subfield = null) => {
        setProduct(prev => {
            const newState = { ...prev };
            
            if (field === 'sizes') {
                newState.sizes = [...prev.sizes];
                newState.sizes[index][subfield] = value;
            } else if (field === 'images') {
                newState.images = [...prev.images];
                newState.images[index] = value;
            } else if (field === 'story.storyImages') {
                newState.story = { ...prev.story, storyImages: [...prev.story.storyImages] };
                newState.story.storyImages[index] = value;
            } else if (field === 'story.sections') {
                newState.story = { ...prev.story, sections: [...prev.story.sections] };
                newState.story.sections[index][subfield] = value;
            }
            return newState;
        });
    };

    const addArrayItem = (field) => {
        setProduct(prev => {
            const newState = { ...prev };
            if (field === 'sizes') newState.sizes = [...prev.sizes, { size: '', sellingPrice: '', mrp: '', stock: 0 }];
            else if (field === 'images') newState.images = [...prev.images, ''];
            else if (field === 'story.storyImages') newState.story = { ...prev.story, storyImages: [...prev.story.storyImages, ''] };
            else if (field === 'story.sections') newState.story = { ...prev.story, sections: [{ title: '', description: '' }, ...prev.story.sections] };
            return newState;
        });
    };

    const removeArrayItem = (field, index) => {
        setProduct(prev => {
            const newState = { ...prev };
            if (field === 'sizes') newState.sizes = prev.sizes.filter((_, i) => i !== index);
            else if (field === 'images') newState.images = prev.images.filter((_, i) => i !== index);
            else if (field === 'story.storyImages') newState.story = { ...prev.story, storyImages: prev.story.storyImages.filter((_, i) => i !== index) };
            else if (field === 'story.sections') newState.story = { ...prev.story, sections: prev.story.sections.filter((_, i) => i !== index) };
            return newState;
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!product.name || !product.category) {
            setError('Product Name and Category are required.');
            return;
        }

        setSaving(true);
        setError('');
        const parseCSV = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];

        // Prepare lists of existing paths and new files
        const existingImages = product.images
            .filter(img => typeof img === 'string')
            .filter(Boolean);
        const newImageFiles = product.images
            .filter(img => typeof img !== 'string' && img.file)
            .map(img => img.file);

        const existingStoryImages = product.story.storyImages
            .filter(img => typeof img === 'string')
            .filter(Boolean);
        const newStoryImageFiles = product.story.storyImages
            .filter(img => typeof img !== 'string' && img.file)
            .map(img => img.file);

        const payload = {
            name: product.name,
            description: product.description,
            category: product.category,
            isActive: product.isActive,
            // We pass both existing paths (so backend knows what to keep) and new files
            existingImages,
            newImageFiles,
            mainAccords: parseCSV(product.mainAccords),
            perfumePyramid: {
                top: parseCSV(product.perfumePyramid.top),
                middle: parseCSV(product.perfumePyramid.middle),
                base: parseCSV(product.perfumePyramid.base),
            },
            sizes: product.sizes.map(s => ({
                size: s.size,
                sellingPrice: Number(s.sellingPrice),
                mrp: Number(s.mrp),
                stock: Number(s.stock)
            })),

            story: {
                existingStoryImages,
                newStoryImageFiles,
                sections: product.story.sections.filter(s => s.title.trim() !== '' || s.description.trim() !== '')
            }
        };

        try {
            await onSave(payload);
            onClose();
        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to save product. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;
    const isMobile = window.innerWidth < 768;

    const TABS = [
        { id: 'basic', label: 'Overview' },
        { id: 'variants', label: 'Inventory' },
        { id: 'notes', label: 'Fragrance' },
        { id: 'media', label: 'Media' },
    ];

    const inputStyle = {
        width: '100%', padding: '12px 16px', fontSize: '0.95rem', outline: 'none', 
        fontFamily: FONT, fontWeight: 400, color: '#000',
        boxSizing: 'border-box', border: '1px solid #E5E7EB', borderRadius: '10px',
        transition: 'all 0.2s', background: '#FFF'
    };
    const labelStyle = { 
        display: 'block', 
        fontSize: '11px', 
        fontWeight: 700, 
        color: '#6D7175', 
        textTransform: 'uppercase', 
        marginBottom: 8, 
        fontFamily: FONT,
        letterSpacing: '0.05em'
    };
    const inputClassName = "w-full px-4 py-3 text-[0.95rem] outline-none font-roboto font-normal text-black border border-[#E5E7EB] rounded-lg transition-all focus:border-black focus:ring-1 focus:ring-black bg-white";

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
            padding: isMobile ? '0' : '40px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)', 
            overflowX: 'hidden'
        }}>

            <div style={{
                background: '#FFFFFF', width: '100%', maxWidth: '850px', height: isMobile ? '92vh' : 'auto', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                borderRadius: isMobile ? '24px 24px 0 0' : '16px', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.15)', 
                position: 'relative', 
                overflow: 'hidden'
            }}>

                {/* Header */}
                <div style={{
                    padding: isMobile ? '20px 24px' : '20px 32px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#FFFFFF'
                }}>
                    <h2 style={{ fontFamily: FONT, fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#000' }}>
                        {isEdit ? 'Edit Product' : 'New Product'}
                    </h2>
                    <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', cursor: 'pointer', color: '#000', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44 }}>
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Tabs */}

                <div className="scrollbar-hide" style={{ 
                    display: 'flex',
                    alignItems: 'flex-end',
                    borderBottom: '1px solid #E5E7EB', 
                    padding: '0 24px', 
                    overflowX: 'auto',
                    flexWrap: 'nowrap', 
                    background: '#FFFFFF',
                    gap: '32px',
                    minHeight: '56px'
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0 0 12px 0', 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer',
                                fontSize: '0.9rem', 
                                fontFamily: FONT,
                                fontWeight: activeTab === tab.id ? 700 : 400,
                                color: activeTab === tab.id ? '#000000' : '#6B7280',
                                borderBottom: activeTab === tab.id ? '2px solid #000' : '2px solid transparent',
                                marginBottom: '-1px',
                                transition: 'color 0.2s, border-color 0.2s', 
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '24px' : '32px', background: '#F9FAFB' }}>
                    {error && (
                        <div style={{ padding: '16px', background: '#FEF2F2', borderRadius: '12px', color: '#D82C0D', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, border: '1px solid #FEE2E2' }}>
                            <AlertCircle size={20} /> {error}
                        </div>
                    )}

                    <form id="productForm" onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                        {activeTab === 'basic' && (
                            <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={labelStyle}>Product Name</label>
                                        <input name="name" value={product.name} onChange={handleChange} placeholder="e.g. Brunati Aqua" className={inputClassName} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Category</label>
                                        <CategoryDropdown value={product.category} options={categories || []} onChange={(val) => setProduct(prev => ({ ...prev, category: val }))} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={labelStyle}>Description</label>
                                    <textarea name="description" value={product.description} onChange={handleChange} rows={5} placeholder="Full product story..." style={{...inputStyle, resize: 'none'}} className={inputClassName} />
                                </div>
                            </div>

                        )}

                        {activeTab === 'variants' && (
                            <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: isMobile ? '24px' : '32px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <label style={{...labelStyle, marginBottom: 0}}>Size Variants</label>
                                    <button type="button" onClick={() => addArrayItem('sizes')} style={{ background: '#F3F4F6', border: 'none', color: '#000', fontSize: '0.85rem', fontWeight: 700, fontFamily: FONT, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8 }}>
                                        <Plus size={16} /> Add Variant
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {product.sizes.map((size, idx) => (
                                        <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end bg-[#F9FAFB] p-5 rounded-xl border border-[#E5E7EB] relative">
                                            <div className="order-1 md:order-1">
                                                <label className="font-roboto font-bold text-[11px] uppercase tracking-wider text-[#6D7175] mb-1.5 block">Size (e.g. 100ml)</label>
                                                <input value={size.size} onChange={(e) => handleArrayItemChange('sizes', idx, e.target.value, 'size')} placeholder="Size" className={inputClassName} />
                                            </div>
                                            <div className="order-3 md:order-2">
                                                <label className="font-roboto font-bold text-[11px] uppercase tracking-wider text-[#6D7175] mb-1.5 block">Selling Price (₹)</label>
                                                <input type="number" value={size.sellingPrice} onChange={(e) => handleArrayItemChange('sizes', idx, e.target.value, 'sellingPrice')} placeholder="1195" className={inputClassName} />
                                            </div>
                                            <div className="order-4 md:order-3">
                                                <label className="font-roboto font-bold text-[11px] uppercase tracking-wider text-[#6D7175] mb-1.5 block">MRP (₹)</label>
                                                <input type="number" value={size.mrp} onChange={(e) => handleArrayItemChange('sizes', idx, e.target.value, 'mrp')} placeholder="1695" className={inputClassName} />
                                            </div>
                                            <div className="relative order-2 md:order-4 flex items-end justify-end pb-2">
                                                {product.sizes.length > 1 && (
                                                    <button type="button" onClick={() => removeArrayItem('sizes', idx)} className="text-[#D82C0D] p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 cursor-pointer border-none bg-transparent flex items-center justify-center m-0">
                                                        <Trash2 size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: isMobile ? '24px' : '32px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                <div style={{ marginBottom: '32px' }}>
                                    <label style={labelStyle}>Main Accords</label>
                                    <input 
                                        name="mainAccords" 
                                        value={product.mainAccords} 
                                        onChange={handleChange} 
                                        placeholder="e.g. Woody, Citrus, Fresh Spicy" 
                                        className={inputClassName} 
                                    />
                                    <p style={{ fontSize: '12px', color: '#6D7175', marginTop: '8px', fontFamily: FONT }}>Separate accords with commas (e.g. Woody, Amber, Musk)</p>
                                </div>
                                
                                <div style={{ borderTop: '1px solid #F4F6F8', paddingTop: '32px' }}>
                                    <h4 style={{ ...labelStyle, color: '#000', fontSize: '11px', marginBottom: '24px', fontWeight: 500 }}>Perfume Pyramid</h4>


                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div>
                                            <label style={labelStyle}>Top Notes</label>
                                            <input 
                                                value={product.perfumePyramid.top} 
                                                onChange={(e) => handlePyramidChange('top', e.target.value)} 
                                                placeholder="Light, evaporative scents..." 
                                                className={inputClassName} 
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Middle Notes</label>
                                            <input 
                                                value={product.perfumePyramid.middle} 
                                                onChange={(e) => handlePyramidChange('middle', e.target.value)} 
                                                placeholder="The heart of the fragrance..." 
                                                className={inputClassName} 
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Base Notes</label>
                                            <input 
                                                value={product.perfumePyramid.base} 
                                                onChange={(e) => handlePyramidChange('base', e.target.value)} 
                                                placeholder="Deep, long-lasting trails..." 
                                                className={inputClassName} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {activeTab === 'media' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                                <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: isMobile ? '24px' : '32px' }}>
                                    <ImageUploadArea 
                                        label="Primary Product Imagery" 
                                        images={product.images} 
                                        onChange={(newImages) => setProduct(prev => ({ ...prev, images: newImages }))} 
                                    />
                                </div>

                                <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: isMobile ? '24px' : '32px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <label style={{...labelStyle, marginBottom: 0}}>Brand Narrative Sections</label>
                                        <button type="button" onClick={() => addArrayItem('story.sections')} style={{ background: '#F3F4F6', border: 'none', color: '#000', fontSize: '0.85rem', fontWeight: 700, fontFamily: FONT, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8 }}>
                                            <Plus size={16} /> Add Section
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-5">
                                        {product.story.sections.map((section, idx) => (
                                            <div key={idx} className={`bg-[#F9FAFB] rounded-xl relative p-6 ${idx !== product.story.sections.length - 1 ? 'border-b border-gray-100 mb-6' : 'border border-[#E5E7EB]'}`}>
                                                {product.story.sections.length > 1 && (
                                                    <button type="button" onClick={() => removeArrayItem('story.sections', idx)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#D82C0D', cursor: 'pointer' }}>
                                                        <Trash2 size={20} />
                                                    </button>
                                                )}
                                                <div style={{ maxWidth: '90%' }}>
                                                    <label style={{ ...labelStyle, fontSize: '10px' }}>Section Header</label>
                                                    <input value={section.title} onChange={(e) => handleArrayItemChange('story.sections', idx, e.target.value, 'title')} placeholder="The Inspiration" className={inputClassName} style={{marginBottom: 16}} />
                                                    <label style={{ ...labelStyle, fontSize: '10px' }}>Content Body</label>
                                                    <textarea value={section.description} onChange={(e) => handleArrayItemChange('story.sections', idx, e.target.value, 'description')} placeholder="Draft the narrative..." rows={3} className={inputClassName} style={{resize: 'none'}} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: 32, borderTop: '1px solid #F4F6F8', paddingTop: 32 }}>
                                        <ImageUploadArea 
                                            label="Story elements" 
                                            images={product.story.storyImages} 
                                            onChange={(newImages) => setProduct(prev => ({ ...prev, story: { ...prev.story, storyImages: newImages } }))} 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div style={{ 
                    padding: isMobile ? '16px 24px 24px' : '24px 32px', borderTop: '1px solid #E5E7EB', background: '#FFFFFF',
                    display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: 20 
                }}>
                    <div style={{ width: isMobile ? '100%' : 'auto' }}>
                        {isEdit && (
                            <button type="button" onClick={() => onDelete(product._id || initialProduct._id)} style={{ 
                                background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 700, color: '#DC2626', 
                                cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8,
                                padding: isMobile ? '12px 0' : '0', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start'
                            }}>
                                <Trash2 size={18} /> Delete from Record
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
                        <button type="button" onClick={onClose} style={{ 
                            flex: 1, padding: '12px 24px', background: '#FFF', border: '1px solid #E5E7EB', 
                            borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#374151', 
                            cursor: 'pointer', fontFamily: FONT, minWidth: isMobile ? '0' : '100px'
                        }}>
                            Cancel
                        </button>
                        <button type="submit" form="productForm" disabled={saving} style={{
                            flex: 1, padding: '12px 28px', background: '#000', color: '#FFF', 
                            border: '1px solid #000', borderRadius: '10px', fontSize: '0.9rem', 
                            fontWeight: 700, cursor: 'pointer', fontFamily: FONT, minWidth: isMobile ? '0' : '140px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}>
                            {saving ? 'Saving...' : (isEdit ? 'Save Product' : 'Create Product')}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes slideUpMobile { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes slideDownFade { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default ProductModal;
