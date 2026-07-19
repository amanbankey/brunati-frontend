import React, { useRef, useEffect, useState } from 'react';
import { testimonialService } from '../../services/testimonialService';

const Testimonials = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const reviewsRef = useRef(null);

    const MOCK_REVIEWS = [
        {
            rating: 5,
            reviewText: "The Art of Scent has truly outdone itself. Mistia is a masterpiece that lingers beautifully throughout the day.",
            reviewerName: "Sophia Loren"
        },
        {
            rating: 5,
            reviewText: "Dominus is commanding and sophisticated. It’s my go-to for evening events where I want to make an impression.",
            reviewerName: "Alexander V."
        },
        {
            rating: 4,
            reviewText: "Aqua is incredibly fresh and vibrant. It feels like a sea breeze captured in a bottle. Highly recommended.",
            reviewerName: "Elena Grace"
        },
        {
            rating: 5,
            reviewText: "The complexity of Midnight Glimmer is astounding. Every hour reveals a new, mysterious layer of notes.",
            reviewerName: "Marcus Thorne"
        }
    ];

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const res = await testimonialService.getPublicAll();
                if (res.status && res.data && res.data.length > 0) {
                    setReviews(res.data);
                } else {
                    setReviews(MOCK_REVIEWS);
                }
            } catch (err) {
                console.error("Failed to fetch testimonials, using fallback:", err);
                setReviews(MOCK_REVIEWS);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, []);

    useEffect(() => {
        if (!reviewsRef.current || reviews.length === 0) return;

        const container = reviewsRef.current;
        let isDown = false;
        let startX;
        let scrollLeft;
        let animationFrameId;
        let subpixelScroll = 0;
        const speed = 0.5;

        const handleDown = (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            container.style.scrollBehavior = 'auto';
            startX = (e.pageX || e.touches[0]?.pageX || 0) - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        };

        const handleLeaveOrUp = () => {
            isDown = false;
            container.style.cursor = 'grab';
            container.style.scrollBehavior = '';
        };

        const handleMove = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = (e.pageX || e.touches[0]?.pageX || 0) - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        };

        const autoScroll = () => {
            if (!isDown) {
                subpixelScroll += speed;
                if (subpixelScroll >= 1) {
                    const step = Math.floor(subpixelScroll);
                    container.scrollLeft += step;
                    subpixelScroll -= step;
                }
                if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 1) {
                    container.scrollLeft = 0;
                }
            }
            animationFrameId = requestAnimationFrame(autoScroll);
        };

        animationFrameId = requestAnimationFrame(autoScroll);

        container.style.cursor = 'grab';
        container.addEventListener('mousedown', handleDown);
        container.addEventListener('mouseleave', handleLeaveOrUp);
        container.addEventListener('mouseup', handleLeaveOrUp);
        container.addEventListener('mousemove', handleMove);

        return () => {
            container.removeEventListener('mousedown', handleDown);
            container.removeEventListener('mouseleave', handleLeaveOrUp);
            container.removeEventListener('mouseup', handleLeaveOrUp);
            container.removeEventListener('mousemove', handleMove);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [reviews]);

    if (loading) return null;

    return (
        <section className="reviews-section" id="reviews">
            <div className="section-header">
                <h2 className="section-title" style={{ fontFamily: '"Trojan", serif', fontWeight: 700, textTransform: 'none' }}>
                    Reviews
                </h2>
            </div>
            <div className="scroll-container" ref={reviewsRef}>
                {reviews.map((r, idx) => (
                    <div key={idx} className="review-card">
                        <div>
                            <div className="stars">
                                {'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}
                            </div>
                            <p className="review-text">"{r.reviewText}"</p>
                        </div>
                        <p className="review-author">{r.reviewerName}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;
