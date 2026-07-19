import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../context/UserAuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isLoggedIn } = useUserAuth();
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="nav-wrapper">
            <header className={`apple-header ${scrolled ? 'scrolled' : ''}`} id="mainHeader">
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <div className="nav-group left">
                        <button className="icon-btn menu-toggle-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
                            <ion-icon name={isMenuOpen ? "close-outline" : "menu-outline"}></ion-icon>
                        </button>
                        <Link to="/wishlist" className="icon-btn wishlist-mobile-btn" aria-label="Wishlist">
                            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ion-icon name="heart-outline"></ion-icon>
                                {wishlistCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: -6, right: -8,
                                        background: '#D4AF37', color: '#000',
                                        borderRadius: '50%', width: 15, height: 15,
                                        fontSize: 8, fontWeight: 800,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        lineHeight: 1, pointerEvents: 'none',
                                    }}>
                                        {wishlistCount}
                                    </span>
                                )}
                            </span>
                        </Link>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Link to="/" className="logo-text" style={{ position: 'static', transform: 'none', left: 'auto' }}>Brunati</Link>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div className="nav-group right">
                        {/* Desktop wishlist → /wishlist */}
                        <Link to="/wishlist" className="icon-btn wishlist-desktop-btn" aria-label="Wishlist">
                            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ion-icon name="heart-outline"></ion-icon>
                                {wishlistCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: -6, right: -8,
                                        background: '#D4AF37', color: '#000',
                                        borderRadius: '50%', width: 15, height: 15,
                                        fontSize: 8, fontWeight: 800,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        lineHeight: 1, pointerEvents: 'none',
                                    }}>
                                        {wishlistCount}
                                    </span>
                                )}
                            </span>
                        </Link>
                        <Link to="/cart" className="icon-btn" aria-label="Cart">
                            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ion-icon name="bag-handle-outline"></ion-icon>
                                {cartCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: -6, right: -8,
                                        background: '#D4AF37', color: '#000',
                                        borderRadius: '50%', width: 15, height: 15,
                                        fontSize: 8, fontWeight: 800,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        lineHeight: 1, pointerEvents: 'none',
                                    }}>
                                        {cartCount}
                                    </span>
                                )}
                            </span>
                        </Link>
                        <button 
                            onClick={() => navigate(isLoggedIn ? "/account" : "/signin")} 
                            className="icon-btn" 
                            aria-label="Account"
                        >
                            <ion-icon name="person-outline"></ion-icon>
                        </button>
                    </div>
                </div>
            </header>

            <nav className={`dropdown-menu ${isMenuOpen ? 'active' : ''}`}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span 
                        className="menu-item cursor-pointer" 
                        onClick={() => {
                            setIsMenuOpen(false);
                            if (window.location.pathname !== '/') {
                                navigate('/', { state: { scrollTo: 'home' } });
                            } else {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                    >
                        Home
                    </span>
                    <span 
                        className="menu-item cursor-pointer" 
                        onClick={() => {
                            setIsMenuOpen(false);
                            if (window.location.pathname !== '/') {
                                navigate('/', { state: { scrollTo: 'collections' } });
                            } else {
                                const el = document.getElementById('collections');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    >
                        Luxury Collections
                    </span>
                    <span 
                        className="menu-item cursor-pointer" 
                        onClick={() => {
                            setIsMenuOpen(false);
                            if (window.location.pathname !== '/') {
                                navigate('/', { state: { scrollTo: 'art-of-scent' } });
                            } else {
                                const el = document.getElementById('art-of-scent');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    >
                        The Art of Scent
                    </span>
                    <span 
                        className="menu-item cursor-pointer" 
                        onClick={() => {
                            setIsMenuOpen(false);
                            if (window.location.pathname !== '/') {
                                navigate('/', { state: { scrollTo: 'trends' } });
                            } else {
                                const el = document.getElementById('trends');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    >
                        Olfactory Trends
                    </span>
                    <span 
                        className="menu-item cursor-pointer" 
                        onClick={() => {
                            setIsMenuOpen(false);
                            if (window.location.pathname !== '/') {
                                navigate('/', { state: { scrollTo: 'reviews' } });
                            } else {
                                const el = document.getElementById('reviews');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                    >
                        Reviews
                    </span>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
