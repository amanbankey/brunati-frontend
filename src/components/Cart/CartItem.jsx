import React from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, closeCart } = useCart();

  const navigate = useNavigate();

  const handleImageClick = () => {
    closeCart();
    navigate(`/product/${item.id || item.slug || ''}`);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.size, item.quantity - 1);
    } else {
      removeFromCart(item.id, item.size);
    }
  };

  const handleIncrease = () => {
    updateQuantity(item.id, item.size, item.quantity + 1);
  };

  return (
    <div className="flex flex-row gap-4 py-4 border-b border-gray-100 box-border">
      <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 overflow-hidden cursor-pointer" onClick={handleImageClick}>
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between box-border overflow-hidden">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 
              className="font-medium text-sm text-gray-900 leading-snug line-clamp-2 cursor-pointer hover:underline"
              onClick={handleImageClick}
            >
              {item.name}
            </h3>
            <button 
              onClick={() => removeFromCart(item.id, item.size)}
              className="mt-1 text-gray-400 hover:text-red-500 focus:outline-none transition-colors"
              aria-label="Remove item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Size: {item.size}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="inline-flex items-center border border-gray-300 rounded box-border">
            <button
              onClick={handleDecrease}
              className="px-2 py-1 text-gray-600 hover:bg-gray-50 focus:outline-none"
              aria-label="Decrease quantity"
            >
              &minus;
            </button>
            <span className="px-2 py-1 text-sm font-medium text-gray-900 min-w-[2rem] text-center border-x border-gray-300">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="px-2 py-1 text-gray-600 hover:bg-gray-50 focus:outline-none"
              aria-label="Increase quantity"
            >
              &#43;
            </button>
          </div>
          <div className="text-sm font-medium text-gray-900">
            Rs. {(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
