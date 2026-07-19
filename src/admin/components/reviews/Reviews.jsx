import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, Loader2, X, Save } from 'lucide-react';
import { testimonialService } from '../../../services/testimonialService';
import { toast } from 'react-hot-toast';

const FONT = '"Inter", "Helvetica Neue", sans-serif';

const Reviews = ({ isMobile }) => {
    // Backend integrated state
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        reviewerName: '',
        rating: 5,
        reviewText: ''
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        setLoading(true);
        try {
            const res = await testimonialService.getAll();
            if (res.status) {
                setReviews(res.data);
            }
        } catch (error) {
            toast.error('Failed to fetch testimonials');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (review = null) => {
        if (review) {
            setEditingReview(review);
            setFormData({
                reviewerName: review.reviewerName || '',
                rating: review.rating || 5,
                reviewText: review.reviewText || ''
            });
        } else {
            setEditingReview(null);
            setFormData({ reviewerName: '', rating: 5, reviewText: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingReview(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.reviewerName || !formData.reviewText) {
            toast.error('Please fill all required fields');
            return;
        }

        setIsSaving(true);
        try {
            if (editingReview) {
                const res = await testimonialService.update(editingReview._id, formData);
                if (res.status) {
                    toast.success('Testimonial updated');
                    fetchTestimonials();
                    handleCloseModal();
                }
            } else {
                const res = await testimonialService.create(formData);
                if (res.status) {
                    toast.success('Testimonial added');
                    fetchTestimonials();
                    handleCloseModal();
                }
            }
        } catch (error) {
            toast.error(error.message || 'Error saving testimonial');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            const res = await testimonialService.delete(id);
            if (res.status) {
                toast.success('Testimonial deleted');
                setReviews(reviews.filter(r => r._id !== id));
            }
        } catch (error) {
            toast.error('Failed to eliminate entry');
        }
    };



    return (
        <div style={{ width: '100%' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start', marginBottom: 24, flexDirection: isMobile ? 'column' : 'row', gap: 16, textAlign: isMobile ? 'center' : 'left' }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontFamily: FONT, fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 600, margin: '0 0 4px 0', color: '#202223' }}>Storefront Testimonials</h2>
                    <p style={{ fontFamily: FONT, fontSize: '0.82rem', color: '#6D7175', margin: 0 }}>Manage curated customer testimonials and storefront feedback.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 8, padding: isMobile ? '10px 20px' : '8px 16px', fontSize: '0.85rem', fontWeight: 600, fontFamily: FONT, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
                >
                    <Plus size={16} /> Add Testimonial
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <Loader2 className="animate-spin" size={32} color="#000" />
                    <p style={{ fontFamily: FONT, fontSize: '0.85rem', color: '#6D7175' }}>Retrieving testimonials...</p>
                </div>
            ) : reviews.length === 0 ? (
                <div style={{ padding: '64px 20px', background: '#F4F6F8', border: '1px dashed #C9CCCF', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Star size={32} style={{ color: '#8C9196', margin: '0 0 16px 0' }} />
                    <h3 style={{ fontFamily: FONT, fontSize: '1rem', fontWeight: 600, color: '#202223', margin: '0 0 4px 0' }}>No Testimonials Yet</h3>
                    <p style={{ fontFamily: FONT, fontSize: '0.85rem', color: '#6D7175', margin: 0 }}>Be the first to add a customer testimonial to your storefront.</p>
                </div>
            ) : (

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: isMobile ? 16 : 24, paddingBottom: 40 }}>
                    {reviews.map(rev => (
                        <div key={rev._id} className="review-card-admin" style={{ position: 'relative', margin: 0, padding: 24, border: '1px solid #E5E7EB', borderRadius: 12, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div>
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={14} 
                                            fill={i < rev.rating ? "#FBBF24" : "none"} 
                                            color={i < rev.rating ? "#FBBF24" : "#E5E7EB"} 
                                            style={{ display: 'inline' }}
                                        />
                                    ))}
                                </div>
                                <p className="review-text">"{rev.reviewText}"</p>
                            </div>
                            <p className="review-author">{rev.reviewerName}</p>
                            
                            {/* Actions overlay */}
                            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 10 }}>
                                <button onClick={() => handleOpenModal(rev)} style={{ background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} title="Edit"><Edit2 size={16} color="#6D7175" /></button>
                                <button onClick={() => handleDelete(rev._id)} style={{ background: '#FEE2E2', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} title="Delete"><Trash2 size={16} color="#D82C0D" /></button>
                            </div>
                        </div>
                    ))}
                </div>

            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={handleCloseModal}></div>
                    <div style={{ position: 'relative', background: '#fff', width: '100%', maxWidth: 460, borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F4F6F8' }}>
                            <h2 style={{ fontFamily: FONT, fontSize: '1.05rem', fontWeight: 600, color: '#202223', margin: 0 }}>
                                {editingReview ? 'Edit Testimonial' : 'Add New Testimonial'}
                            </h2>
                            <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6D7175' }}><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#202223', display: 'block', marginBottom: 8 }}>Customer Name</label>
                                <input 
                                    type="text"
                                    value={formData.reviewerName}
                                    onChange={(e) => setFormData({...formData, reviewerName: e.target.value})}
                                    placeholder="e.g. Julian V."
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #C9CCCF', fontSize: '0.9rem', fontFamily: FONT, outline: 'none' }}
                                    onFocus={e => e.target.style.border = '1px solid #000'}
                                    onBlur={e => e.target.style.border = '1px solid #C9CCCF'}
                                />
                            </div>

                            <div>
                                <label style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#202223', display: 'block', marginBottom: 8 }}>Rating (1-5 Stars)</label>
                                <div style={{ display: 'flex', gap: 8, padding: 12, background: '#FAFAFA', borderRadius: 8, border: '1px solid #E5E7EB', justifyContent: 'center' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({...formData, rating: star})}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                        >
                                            <Star 
                                                size={28} 
                                                fill={star <= formData.rating ? "#FBBF24" : "none"} 
                                                color={star <= formData.rating ? "#FBBF24" : "#C9CCCF"} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#202223', display: 'block', marginBottom: 8 }}>Testimonial Text</label>
                                <textarea 
                                    value={formData.reviewText}
                                    onChange={(e) => setFormData({...formData, reviewText: e.target.value})}
                                    placeholder="Write the storefront testimonial here..."
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #C9CCCF', fontSize: '0.9rem', fontFamily: FONT, outline: 'none', height: 120, resize: 'none' }}
                                    onFocus={e => e.target.style.border = '1px solid #000'}
                                    onBlur={e => e.target.style.border = '1px solid #C9CCCF'}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #E5E7EB', paddingTop: 20, marginTop: 4 }}>
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{ flex: 1, background: '#fff', border: '1px solid #C9CCCF', borderRadius: 8, padding: '10px', fontSize: '0.85rem', fontWeight: 600, fontFamily: FONT, cursor: 'pointer', color: '#202223' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    style={{ flex: 2, background: isSaving ? '#C9CCCF' : '#000', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: '0.85rem', fontWeight: 600, fontFamily: FONT, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {isSaving ? 'Saving...' : (editingReview ? 'Save Changes' : 'Add Testimonial')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


export default Reviews;
