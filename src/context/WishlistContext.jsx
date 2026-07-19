import React, { createContext, useState, useContext } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);

    const isWishlisted = (id) => wishlistItems.some(i => i.id === id);

    const toggleWishlist = (item) => {
        setWishlistItems(prev => {
            const exists = prev.find(i => i.id === item.id);
            if (exists) return prev.filter(i => i.id !== item.id);
            return [...prev, item];
        });
    };

    const removeFromWishlist = (id) =>
        setWishlistItems(prev => prev.filter(i => i.id !== id));

    const wishlistCount = wishlistItems.length;

    return (
        <WishlistContext.Provider value={{ wishlistItems, wishlistCount, isWishlisted, toggleWishlist, removeFromWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
