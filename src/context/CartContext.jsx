import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};

// Helpers — keep localStorage in sync (same pattern used by Shopify storefronts,
// WooCommerce, and most headless commerce stacks for guest/anonymous sessions)
const STORAGE_KEY = 'brunati_cart';

const loadFromStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveToStorage = (items) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
        // storage quota exceeded — fail silently
    }
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(loadFromStorage);

    // Keep localStorage in sync on every change
    useEffect(() => {
        saveToStorage(cartItems);
    }, [cartItems]);

    const addToCart = (item) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id && i.size === item.size);
            if (existing) {
                return prev.map(i =>
                    i.id === item.id && i.size === item.size
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, item];
        });
    };

    const updateQuantity = (id, size, newQty) => {
        if (newQty < 1) return;
        setCartItems(prev =>
            prev.map(i => i.id === id && i.size === size ? { ...i, quantity: newQty } : i)
        );
    };

    const removeFromCart = (id, size) => {
        setCartItems(prev => prev.filter(i => !(i.id === id && i.size === size)));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getSubtotal = () =>
        cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, cartCount, addToCart, updateQuantity, removeFromCart, clearCart, getSubtotal }}>
            {children}
        </CartContext.Provider>
    );
};
