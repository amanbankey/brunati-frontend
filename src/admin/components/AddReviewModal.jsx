import React, { useState, useEffect, useRef } from 'react';
import { X, Star, ChevronDown, Loader2, ShoppingBag } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { productService } from '../../services/productService';
import { toast } from 'react-hot-toast';

const AddReviewModal = ({ isOpen, onClose, onSuccess, editingReview }) => {
    const FONT_ROBOTO = '"Roboto", sans-serif';
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [products, setProducts] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const [formData, setFormData] = useState({
        productId: '',
        reviewerName: '',
        rating: 5,
        reviewText: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (editingReview) {
            setFormData({
                productId: editingReview.productId?._id || editingReview.productId || '',
                reviewerName: editingReview.reviewerName || '',
                rating: editingReview.rating || 5,
                reviewText: editingReview.reviewText || ''
            });
        } else {
            setFormData({
                productId: products.length > 0 ? products[0]._id : '',
                reviewerName: '',
                rating: 5,
                reviewText: ''
            });
        }
    }, [editingReview, isOpen, products]);

    const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const res = await productService.getAllAdminProducts();
            if (res.status) {
                setProducts(res.data);
            }
        } catch (error) {
            toast.error('Failed to load product catalog');
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.reviewerName || !formData.reviewText || !formData.productId) {
            toast.error('Please complete all required fields');
            return;
        }

        setIsSaving(true);
        try {
            let res;
            if (editingReview) {
                res = await reviewService.updateReview(editingReview._id, formData);
            } else {
                res = await reviewService.createReview(formData);
            }

            if (res.status) {
                toast.success(editingReview ? 'Review updated' : 'Review published');
                onSuccess();
                onClose();
            }
        } catch (error) {
            toast.error(error.message || 'Transmission failed');
        } finally {
            setIsSaving(false);
        }
    };

    const selectedProduct = products.find(p => p._id === formData.productId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-t-3xl md:rounded-2xl w-full max-w-2xl flex flex-col h-[92vh] md:h-auto md:max-h-[90vh] shadow-2xl overflow-hidden transition-all duration-300">
                
                {/* Modal Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="font-roboto font-bold text-xl text-black">
                        {editingReview ? 'Edit Product Review' : 'Add Manual Review'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-black p-1 transition-colors bg-transparent border-none cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1">
                    <form id="add-review-form" onSubmit={handleSave}>
                        <div className="flex flex-col gap-8">
                            
                            {/* Product & Name Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <label className="font-roboto font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-2 block">
                                        TARGET FRAGRANCE
                                    </label>
                                    
                                    {/* CUSTOM DROPDOWN */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => !isLoadingProducts && setIsDropdownOpen(!isDropdownOpen)}
                                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 bg-white focus:border-black transition-all text-left outline-none cursor-pointer h-[46px]"
                                            disabled={isLoadingProducts}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <ShoppingBag size={14} className="text-gray-400 shrink-0" />
                                                <span className="font-roboto text-sm text-black truncate">
                                                    {isLoadingProducts ? 'Loading catalog...' : (selectedProduct?.name || 'Select a product')}
                                                </span>
                                            </div>
                                            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isDropdownOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-[1100] max-h-[220px] overflow-y-auto py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                {products.length === 0 ? (
                                                    <div className="px-4 py-3 text-sm text-gray-500 font-roboto">No products found</div>
                                                ) : (
                                                    products.map(p => (
                                                        <div
                                                            key={p._id}
                                                            onClick={() => {
                                                                setFormData({...formData, productId: p._id});
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors ${formData.productId === p._id ? 'bg-gray-50' : ''}`}
                                                        >
                                                            <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                                                                <ShoppingBag size={14} className="text-gray-400" />
                                                            </div>
                                                            <span className={`font-roboto text-sm ${formData.productId === p._id ? 'font-bold text-black' : 'text-gray-600'}`}>
                                                                {p.name}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="font-roboto font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-2 block">
                                        CUSTOMER IDENTITY
                                    </label>
                                    <input 
                                        type="text"
                                        value={formData.reviewerName}
                                        onChange={(e) => setFormData({...formData, reviewerName: e.target.value})}
                                        placeholder="Full Name"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 font-roboto text-sm focus:border-black outline-none transition-all placeholder:text-gray-300 bg-white text-black h-[46px]"
                                    />
                                </div>
                            </div>

                            {/* Overall Rating */}
                            <div>
                                <label className="font-roboto font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-1 block">
                                    VERDICT (STARS)
                                </label>
                                <div className="flex gap-2.5 py-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            onClick={() => setFormData({...formData, rating: star})}
                                            className="bg-transparent border-none cursor-pointer p-0.5"
                                        >
                                            <Star 
                                                size={28} 
                                                className="transition-all duration-150"
                                                fill={(hoveredStar || formData.rating) >= star ? "#FACC15" : "none"} 
                                                color={(hoveredStar || formData.rating) >= star ? "#FACC15" : "#E5E7EB"} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Review Content */}
                            <div>
                                <label className="font-roboto font-bold text-[10px] uppercase tracking-[0.15em] text-gray-400 mb-2 block">
                                    VERIFICATION DETAILS
                                </label>
                                <textarea 
                                    value={formData.reviewText}
                                    onChange={(e) => setFormData({...formData, reviewText: e.target.value})}
                                    placeholder="Write detailed customer experience here..."
                                    className="w-full p-4 rounded-lg border border-gray-200 font-roboto text-sm focus:border-black outline-none h-32 resize-none transition-all placeholder:text-gray-300 bg-white text-black"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-5 md:p-6 border-t border-gray-100 flex flex-col md:flex-row justify-end gap-3 bg-white">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="w-full md:w-auto px-8 py-3 font-roboto font-bold text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        form="add-review-form"
                        type="submit"
                        disabled={isSaving}
                        className="w-full md:w-auto px-12 py-3 bg-black text-white font-roboto font-bold text-sm rounded-xl uppercase tracking-widest hover:bg-gray-900 transition-all disabled:bg-gray-400 flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                        {isSaving && <Loader2 className="animate-spin" size={18} />}
                        {isSaving ? 'Saving...' : (editingReview ? 'Update Review' : 'Publish Review')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddReviewModal;
