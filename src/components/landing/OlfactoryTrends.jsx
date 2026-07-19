import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsData } from '../../data/products';
import { trendService } from '../../services/trendService';
import './OlfactoryTrends.css';

const TrendVideo = ({ src }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
    };

    return (
        <div className="trend-video-wrapper" onClick={togglePlay}>
            <video
                ref={videoRef}
                className="trend-main-video placeholder-dark"
                loop
                muted
                playsInline
                src={src}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            >
                Your browser does not support the video tag.
            </video>
            {!isPlaying && (
                <div className="video-play-overlay">
                    <div className="play-icon">&#9654;</div>
                </div>
            )}
        </div>
    );
};

const OlfactoryTrends = () => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);
    const [trends, setTrends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // MOCK FALLBACK DATA prep
    const getMockTrends = () => {
        return Object.keys(productsData)
            .filter(key => key !== 'gift1')
            .map(id => {
                const p = productsData[id];
                return {
                    _id: id,
                    isMock: true,
                    videoUrl: p.videoReel,
                    product: {
                        _id: id,
                        name: p.name,
                        images: p.images,
                        slug: p.slug || id
                    }
                };
            });
    };

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const response = await trendService.getPublicTrends();
                if (response.status && response.data.length > 0) {
                    setTrends(response.data.map(t => ({
                        ...t,
                        videoUrl: t.videoUrl, // Already set in backend
                        product: t.productId // populated
                    })));
                } else {
                    setTrends(getMockTrends());
                }
            } catch (err) {
                console.error("Trends fetch failed:", err);
                setTrends(getMockTrends());
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrends();
    }, []);

    const handleProductClick = (product) => {
        const identifier = product?.slug || product?._id;
        if (identifier) navigate(`/product/${identifier}`);
    };

    const scroll = (direction) => {
        if (!scrollContainerRef.current) return;
        const container = scrollContainerRef.current;
        const scrollAmount = 300;
        if (direction === 'left') {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        const handleDown = (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            container.style.scrollBehavior = 'auto'; // Disable CSS smooth scroll during interaction
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
        };
    }, []);

    return (
        <section className="olfactory-trends-section" id="trends">
            <h2 className="section-title text-center" style={{ fontFamily: '"Trojan", serif', fontWeight: 700, textTransform: 'none' }}>Olfactory Trends</h2>
            <div className="trends-container">
                <div className="trends-scroll-container" ref={scrollContainerRef}>
                    {trends.map((item, idx) => {
                        const product = item.product;
                        if (!product) return null;

                        const API_BASE_URL = import.meta.env.VITE_API_URL;

                        // Handle video source
                        let videoSrc = item.videoUrl;
                        if (videoSrc && !videoSrc.startsWith('http') && !item.isMock) {
                            videoSrc = `${API_BASE_URL}/${videoSrc}`;
                        }

                        // Handle product image source
                        let imgSrc = product.images?.[0];
                        if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/') && !item.isMock) {
                            imgSrc = `${API_BASE_URL}/${imgSrc}`;
                        } else if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
                            imgSrc = `/${imgSrc}`;
                        }

                        return (
                            <div key={item._id || idx} className="trend-card">
                                <TrendVideo src={videoSrc} />
                                <div className="trend-bottom-area">
                                    <div
                                        className="trend-small-image placeholder-light"
                                        onClick={() => handleProductClick(product)}
                                        title={`View ${product.name}`}
                                    >
                                        <img
                                            src={imgSrc}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                                        />
                                    </div>
                                    <button className="trend-buy-btn" onClick={() => handleProductClick(product)}>Buy Now</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button className="trend-arrow trend-arrow-left" onClick={() => scroll('left')} aria-label="Scroll left">
                    &#8249;
                </button>
                <button className="trend-arrow trend-arrow-right" onClick={() => scroll('right')} aria-label="Scroll right">
                    &#8250;
                </button>
            </div>
        </section>
    );
};

export default OlfactoryTrends;
