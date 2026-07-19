import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/landing/Hero';
import Collections from '../components/landing/Collections';
import ScentArt from '../components/landing/ScentArt';
import OlfactoryTrends from '../components/landing/OlfactoryTrends';
import Testimonials from '../components/landing/Testimonials';
import Influencers from '../components/landing/Influencers';

const Home = () => {
    const location = useLocation();

    useEffect(() => {
        // 1. Check for state-based scrolling (Clean URL)
        const scrollToId = location.state?.scrollTo;
        if (scrollToId) {
            const element = document.getElementById(scrollToId);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
                return;
            }
        }

        // 2. Fallback for direct hash links
        const hash = window.location.hash;
        if (hash) {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
                return;
            }
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.state, location.hash]);

    return (
        <main>
            <Hero />
            <Collections />
            <ScentArt />
            <OlfactoryTrends />
            <Testimonials />
            <Influencers />
        </main>
    );
};

export default Home;
