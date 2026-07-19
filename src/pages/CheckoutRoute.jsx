import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckoutFlow from '../components/checkout/CheckoutFlow';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';

const CheckoutRoute = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const { isLoggedIn, loading: authLoading } = useUserAuth();
    const state = location.state || {};
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (authLoading) return;

        const validateAccess = () => {
            const hasItems = cartItems.length > 0 || state.isDirectBuy;

            if (!hasItems && !isAuthorized) {
                navigate('/cart', { replace: true });
                return;
            }

            if (!isLoggedIn) {
                navigate('/signin', { 
                    replace: true, 
                    state: { 
                        redirect: location.pathname, 
                        redirectState: state 
                    } 
                });
            } else {
                setIsAuthorized(true);
            }
        };

        validateAccess();
    }, [state, cartItems, navigate, location.pathname, isLoggedIn, authLoading, isAuthorized]);

    if (!isAuthorized) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#6e6e73' }}>Securing checkout session...</p>
            </div>
        );
    }

    return (
        <CheckoutFlow 
            isOpen={true} 
            onClose={() => navigate(-1)}
            isDirectBuy={state.isDirectBuy || false} 
            directBuyProduct={state.directBuyProduct || null} 
        />
    );
};

export default CheckoutRoute;
