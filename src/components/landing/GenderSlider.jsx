import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const GenderSlider = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const products = [
        {
            id: 1,
            name: "Dominus Emperor",
            fullName: "Dominus Emperor",
            gender: "For Him",
            description: "A commanding presence. Sicilian Bergamot and Pink Pepper open the gates to a heart of rich Patchouli and exotic spices. Designed for the leader who demands excellence.",
            intro: "Sicilian Bergamot / Pink Pepper",
            discovery: "Patchouli / Spiced Nutmeg",
            impression: "Amber / Vetiver",
            sellingPrice: 1795,
            mrp: 2495,
            image: "/media/dominus/1.png",
            reviews: 38
        },

        {
            id: 2,
            name: "Brunati Aqua",
            fullName: "Brunati Aqua",
            gender: "For Him",
            description: "The spirit of the Mediterranean. A surge of mineral freshness combined with Sea Salt and Atlas Cedarwood. Capturing the power of the ocean in its most refined form.",
            intro: "Sea Salt / Bergamot",
            discovery: "Cardamom / Sage",
            impression: "Atlas Cedarwood / Mineral Musk",
            sellingPrice: 1795,
            mrp: 2495,
            image: "/media/aqua/1.png",
            reviews: 52
        },

        {
            id: 3,
            name: "Mistia",
            fullName: "Mestia",
            gender: "For Her",
            description: "Ethereal and timeless. A delicate dance of Rose De Grasse and Jasmine, anchored by the subtle depth of White Musk and Sandalwood. Elegance in its pure essence.",
            intro: "Rose De Grasse / Pear",
            discovery: "Jasmine / Tuberose",
            impression: "White Musk / Sandalwood",
            sellingPrice: 1795,
            mrp: 2495,
            image: "/media/mistia/1.png",
            reviews: 45
        }

    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState('50ml');

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    };

    const currentProduct = products[currentIndex];

    return (
        <section className="spotlight-section">
            <div className="slider-nav">
                <button className="nav-arr" onClick={prevSlide}>
                    <ion-icon name="chevron-back-outline"></ion-icon>
                </button>
                <button className="nav-arr" onClick={nextSlide}>
                    <ion-icon name="chevron-forward-outline"></ion-icon>
                </button>
            </div>

            <div className="spotlight-container">
                <div className="spotlight-image-wrap">
                    <img 
                        src={currentProduct.image} 
                        alt={currentProduct.fullName} 
                        className="spotlight-image"
                        key={currentProduct.id}
                    />
                </div>

                <div className="spotlight-info">
                    <div className="spotlight-header">
                        <h2 className="spotlight-title">{currentProduct.fullName}</h2>
                        <span className="spotlight-divider">\</span>
                        <span className="spotlight-gender">{currentProduct.gender}</span>
                    </div>

                    <div className="spotlight-reviews">
                        <div className="stars">
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                            <ion-icon name="star"></ion-icon>
                        </div>
                        <span className="review-count">{currentProduct.reviews} reviews</span>
                    </div>

                    <p className="spotlight-desc">{currentProduct.description}</p>

                    <div className="notes-grid">
                        <div className="note-item">
                            <h4>The Introduction:</h4>
                            <p>{currentProduct.intro}</p>
                        </div>
                        <div className="note-item">
                            <h4>The Discovery:</h4>
                            <p>{currentProduct.discovery}</p>
                        </div>
                        <div className="note-item">
                            <h4>The Impression:</h4>
                            <p>{currentProduct.impression}</p>
                        </div>
                    </div>

                    <div className="size-btns">
                        {['50ml', '100ml'].map((size) => (
                            <button 
                                key={size}
                                className={`size-btn-minimal ${selectedSize === size ? 'active' : ''}`}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    <div 
                        className="add-to-cart-bar"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            addToCart({
                                id: String(currentProduct.id),
                                name: currentProduct.fullName,
                                size: selectedSize,
                                price: currentProduct.sellingPrice,
                                quantity: 1,
                                image: currentProduct.image,
                                slug: currentProduct.name.toLowerCase().replace(/\s+/g, '-'),
                            });
                            navigate('/cart');
                        }}
                    >
                        <span>Add to cart</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700 }}>₹{currentProduct.sellingPrice.toLocaleString()}</span>
                            {currentProduct.mrp > currentProduct.sellingPrice && (
                                <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', opacity: 0.6 }}>₹{currentProduct.mrp.toLocaleString()}</span>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default GenderSlider;
