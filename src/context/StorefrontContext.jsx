import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';

const StorefrontContext = createContext();

export const useStorefront = () => useContext(StorefrontContext);

export const StorefrontProvider = ({ children }) => {

    const [categories, setCategories] = useState([]);
    const [inventoryProducts, setInventoryProducts] = useState([]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await categoryService.getPublicCategories();
            if (res.status && res.data) {
                setCategories(res.data);
            }
        } catch (err) {
            console.error('Categories fetch error:', err);
        }
    }, []);

    const fetchInventoryProducts = useCallback(async () => {
        try {
            const res = await productService.getAllProducts();
            if (res.status && res.data) {
                // Collect products from all keys in the response data
                const rawData = res.data;
                const products = Array.isArray(rawData) ? rawData : Object.values(rawData).filter(val => Array.isArray(val)).flat();
                
                setInventoryProducts(products.map(p => ({
                    _id: p._id,
                    id: p._id,
                    name: p.name,
                    category: typeof p.category === 'object' ? p.category?.name : p.category,
                    image: p.images?.[0] || '',
                })));
            }
        } catch (err) {
            console.error('Inventory products fetch error:', err);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
        fetchInventoryProducts();
    }, [fetchCategories, fetchInventoryProducts]);

    return (
        <StorefrontContext.Provider value={{
            categories, setCategories,
            inventoryProducts, setInventoryProducts,
            fetchCategories,
            fetchInventoryProducts,
        }}>
            {children}
        </StorefrontContext.Provider>
    );
};
