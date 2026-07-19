import React, { useRef, useEffect, useState } from 'react';
import { famousPeopleService } from '../../services/famousPeopleService';

const Influencers = () => {
    const influencersRef = useRef(null);
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(true);

    const MOCK_INFLUENCERS = [
        {
            name: "KATRINA KAIF",
            role: "INDIAN ACTRESS",
            wearing: "ILLUMINATI",
            isMock: true
        },
        {
            name: "RAFTAAR",
            role: "MUSICIAN, HIP HOP",
            wearing: "ILLUMINATI",
            isMock: true
        },
        {
            name: "PANTHER",
            role: "MUSICIAN, HIP HOP",
            wearing: "UM VISION",
            isMock: true
        },
        {
            name: "SHANAYA KAPOOR",
            role: "INDIAN ACTRESS",
            wearing: "NINJA NATION // 001",
            isMock: true
        },
        {
            name: "VICKY KAUSHAL",
            role: "INDIAN ACTOR",
            wearing: "OUD WOOD",
            isMock: true
        },
        {
            name: "ALIA BHATT",
            role: "INDIAN ACTRESS",
            wearing: "NIGHT BLOOM",
            isMock: true
        }
    ];

    useEffect(() => {
        const fetchInfluencers = async () => {
            try {
                const res = await famousPeopleService.getPublicAll();
                if (res.status && res.data && res.data.length > 0) {
                    setInfluencers(res.data);
                } else {
                    setInfluencers(MOCK_INFLUENCERS);
                }
            } catch (err) {
                console.error("Failed to fetch influencers, using fallback:", err);
                setInfluencers(MOCK_INFLUENCERS);
            } finally {
                setLoading(false);
            }
        };
        fetchInfluencers();
    }, []);

    useEffect(() => {
        if (!influencersRef.current || influencers.length === 0) return;

        const container = influencersRef.current;
        let isDown = false;
        let startX;
        let scrollLeft;

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
    }, [influencers]);

    const scrollInfluencers = (direction) => {
        if (influencersRef.current) {
            const scrollAmount = 300;
            influencersRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading) return null;

    // Double the list for seamless loop look
    const scrollingInfluencers = influencers.length > 0 ? [...influencers, ...influencers] : [];

    const baseUrl = import.meta.env.VITE_API_URL;

    return (
        <section className="influencers-section" id="famous" style={{ paddingTop: 0 }}>
            <div className="influencers-slider-wrapper">
                <button className="slider-arrow left-arrow" onClick={() => scrollInfluencers('left')}>
                    &#8249;
                </button>

                <div className="influencers-slider" ref={influencersRef}>
                    {scrollingInfluencers.map((influencer, idx) => {
                        let imgSrc = influencer.image;
                        if (imgSrc && !imgSrc.startsWith('http') && !influencer.isMock) {
                            imgSrc = `${baseUrl}/${imgSrc}`;
                        } else if (imgSrc && !imgSrc.startsWith('http')) {
                            imgSrc = `/${imgSrc}`;
                        }

                        return (
                            <div key={idx} className="influencer-card">
                                <div className="influencer-image-placeholder">
                                    {imgSrc && <img src={imgSrc} alt={influencer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <div className="influencer-info">
                                    <p className="influencer-name">{influencer.name}</p>
                                    <p className="influencer-role">{influencer.role || influencer.profession}</p>
                                    <p className="influencer-wearing">WEARING: {influencer.wearing || influencer.notes}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button className="slider-arrow right-arrow" onClick={() => scrollInfluencers('right')}>
                    &#8250;
                </button>
            </div>
        </section>
    );
};

export default Influencers;
