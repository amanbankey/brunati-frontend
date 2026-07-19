import React, { useState, useEffect } from 'react';
import { Plus, Star, Search, Filter, Edit2, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import AddReviewModal from '../components/AddReviewModal';
import { reviewService } from '../../services/reviewService';
import { toast } from 'react-hot-toast';

const AdminReviews = () => {
    const FONT_ROBOTO = '"Roboto", sans-serif';
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentReview, setCurrentReview] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await reviewService.getAllReviews();
            if (res.status) {
                setReviews(res.data);
            }
        } catch (error) {
            toast.error('Failed to fetch product reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (review) => {
        setCurrentReview(review);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product review?')) return;
        
        try {
            const res = await reviewService.deleteReview(id);
            if (res.status) {
                toast.success('Review deleted');
                setReviews(reviews.filter(r => r._id !== id));
            }
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    const handleOpenAddModal = () => {
        setCurrentReview(null);
        setIsModalOpen(true);
    };

    const renderStars = (rating) => {
        return (
            <div style={{ display: 'flex', gap: '2px' }}>
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={12} 
                        strokeWidth={2}
                        fill={i < rating ? "#FACC15" : "none"} 
                        color={i < rating ? "#FACC15" : "#E5E7EB"} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div style={{ padding: '0 0 40px', background: 'transparent' }}>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>

            {/* Header Row */}
            <div className="flex justify-between items-center mb-10 px-6 md:px-0">
                <div>
                    <h1 style={{ 
                        fontFamily: FONT_ROBOTO, 
                        fontSize: '1.875rem', 
                        fontWeight: 700, 
                        color: '#111827', 
                        margin: 0,
                        letterSpacing: '-0.025em'
                    }}>
                        Product Reviews
                    </h1>
                    <p style={{ 
                        fontFamily: FONT_ROBOTO, 
                        fontSize: '0.875rem', 
                        fontWeight: 400, 
                        color: '#6B7280', 
                        marginTop: '4px' 
                    }}>
                        Moderate and manage customer feedback for your fragrance catalog.
                    </p>
                </div>
                <button 
                    onClick={handleOpenAddModal}
                    className="bg-black text-white border-none rounded-lg px-4 md:px-6 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-all hover:bg-gray-800 shadow-sm"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    <span className="hidden md:inline font-roboto font-bold text-sm">Add Review</span>
                </button>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center min-h-[400px]">
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '3px solid #f3f3f3', 
                        borderTop: '3px solid #000', 
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }}></div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="py-24 px-5 bg-white border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Star size={24} className="text-gray-300" />
                    </div>
                    <h3 className="font-roboto font-bold text-lg text-black mb-1">No reviews yet</h3>
                    <p className="text-sm text-gray-500 font-roboto max-w-xs mx-auto">Manual reviews or customer submissions will appear here for management.</p>
                </div>
            ) : (
                <>
                    {/* Desktop View */}
                    <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
                                    <th style={{ padding: '16px 24px', fontFamily: FONT_ROBOTO, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280' }}>PRODUCT</th>
                                    <th style={{ padding: '16px 24px', fontFamily: FONT_ROBOTO, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280' }}>AUTHOR</th>
                                    <th style={{ padding: '16px 24px', fontFamily: FONT_ROBOTO, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280' }}>COMMENT</th>
                                    <th style={{ padding: '16px 24px', fontFamily: FONT_ROBOTO, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B7280' }}>RATING</th>
                                    <th style={{ padding: '16px 24px', width: '120px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                        <td style={{ padding: '20px 24px' }}>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                                                    <ShoppingBag size={18} className="text-gray-400" />
                                                </div>
                                                <span className="font-roboto font-bold text-gray-900 text-sm">
                                                    {review.productId?.name || 'Standard Product'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <span className="font-roboto font-medium text-gray-700 text-sm">
                                                {review.reviewerName}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 24px', maxWidth: '300px' }}>
                                            <p className="font-roboto text-gray-500 text-sm m-0 line-clamp-2 italic">
                                                "{review.reviewText}"
                                            </p>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            {renderStars(review.rating)}
                                        </td>
                                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                            <div className="flex gap-4 justify-end">
                                                <button onClick={() => handleEdit(review)} className="text-blue-600 hover:text-blue-800 transition-colors bg-transparent border-none cursor-pointer">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(review._id)} className="text-red-600 hover:text-red-800 transition-colors bg-transparent border-none cursor-pointer">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-4 px-6 md:px-0">
                        {reviews.map((review) => (
                            <div key={review._id} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                                            <ShoppingBag size={18} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-roboto font-bold text-sm text-black m-0 leading-tight">
                                                {review.productId?.name || 'Standard Product'}
                                            </h4>
                                            <p className="text-xs text-gray-400 font-roboto mt-0.5">{review.reviewerName}</p>
                                        </div>
                                    </div>
                                    {renderStars(review.rating)}
                                </div>
                                <p className="text-sm font-roboto text-gray-600 font-italic italic leading-relaxed">
                                    "{review.reviewText}"
                                </p>
                                <div className="flex gap-5 pt-3 border-t border-gray-50 justify-end">
                                    <button 
                                        onClick={() => handleEdit(review)} 
                                        className="text-blue-600 transition-colors bg-transparent border-none cursor-pointer p-1"
                                        title="Edit Review"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(review._id)} 
                                        className="text-red-600 transition-colors bg-transparent border-none cursor-pointer p-1"
                                        title="Delete Review"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {isModalOpen && (
                <AddReviewModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={fetchReviews}
                    editingReview={currentReview}
                />
            )}
        </div>
    );
};

export default AdminReviews;
