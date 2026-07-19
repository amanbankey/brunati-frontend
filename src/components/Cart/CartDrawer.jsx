import React, { useEffect } from 'react';
import CartItem from './CartItem';
import { useCart } from '../../context/CartContext';

const CartDrawer = () => {
  const { isCartOpen, closeCart, cartItems, getSubtotal } = useCart();

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const subtotal = getSubtotal();

  return (
    <div className="relative z-[9999] box-border block">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className={`fixed top-0 right-0 h-full min-h-[100dvh] w-full sm:w-[400px] md:w-[28rem] bg-white text-gray-900 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 box-border">
          <h2 className="text-xl font-bold tracking-wide">Cart</h2>
          <button
            onClick={closeCart}
            className="p-2 -mr-2 text-gray-500 hover:text-gray-800 focus:outline-none transition-colors"
            aria-label="Close cart"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 box-border">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <CartItem
                key={`${item.id}-${item.size}`}
                item={item}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>Your cart is empty.</p>
              <button 
                onClick={closeCart}
                className="px-6 py-2 border border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Footer Section */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0 box-border pb-[env(safe-area-inset-bottom,1rem)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Subtotal</span>
              <span className="text-lg font-bold text-gray-900">
                Rs. {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-4 text-center">
              Shipping, taxes, and discount codes calculated at checkout.
            </p>
            <button
              className="w-full bg-black text-white font-medium py-3 px-4 rounded hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
