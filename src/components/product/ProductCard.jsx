import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ id, name, meta, sellingPrice, mrp, img1, img2, accords, description, slug }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();
    const wishlisted = isWishlisted(String(id));

    return (
        <div className="product-card" onClick={() => navigate(`/product/${slug || id}`)}>

            <div className="img-container">
                <div
                    className="wishlist-overlay"
                    style={{ color: wishlisted ? '#e74c3c' : '#1d1d1f' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist({
                            id: String(id),
                            name,
                            badge: meta,
                            price: sellingPrice,
                            image: img1,
                            size: '100ml',
                            slug: slug || String(id),
                        });
                    }}
                >
                    <ion-icon name={wishlisted ? 'heart' : 'heart-outline'}></ion-icon>
                </div>
                <img src={img1} className="prod-img-primary" alt={name} />
                <img src={img2} className="prod-img-secondary" alt={`${name} Hover`} />
            </div>

            <div className="prod-text">
                <div className="prod-header-row">
                    <div className="name-and-type">
                        <h3 className="prod-name">{name}</h3>
                        <div className="prod-meta">{meta.split('•')[1] || meta}</div>
                    </div>
                    <div className="prod-rating-box">
                        <div className="stars">
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                        </div>
                        <span className="reviews-label">16 Reviews</span>
                    </div>
                </div>

                <div className="prod-accords-row">
                    {accords?.slice(0, 3).join(' | ')}
                </div>

                <div className="prod-sizes-row">
                    <div className="size-options">
                        <span className="size-pill">50ml</span>
                        <span className="size-pill">100ml</span>
                    </div>
                </div>

                <hr className="card-divider" />

                <p className="prod-description-mini">
                    {description?.substring(0, 120)}...
                </p>

                <button className="add-to-bag-btn" onClick={(e) => {
                    e.stopPropagation();
                    addToCart({
                        id: String(id),
                        name,
                        size: '100ml',
                        price: sellingPrice,
                        mrp: mrp,
                        quantity: 1,
                        image: img1,
                        slug: slug || String(id),
                    });
                    navigate('/cart');

                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                        <span>Add to Cart — ₹{Number(sellingPrice || 0).toLocaleString()}</span>
                        {mrp > sellingPrice && (
                            <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', opacity: 0.6 }}>₹{Number(mrp || 0).toLocaleString()}</span>
                        )}
                    </div>

                </button>

                <p className="complimentary-gift-text">
                    Complimentary Sample included with every order
                </p>
            </div>
        </div>
    );
};

export default ProductCard;
