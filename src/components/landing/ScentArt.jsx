// import React, { useRef, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { productService } from '../../services/productService';

// const ScentArt = () => {
//     const scrollRef = useRef(null);
//     const navigate = useNavigate();
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchAllProducts = async () => {
//             try {
//                 const response = await productService.getAllProducts();
//                 if (response.status) {
//                     let aosData = response.data?.art_of_scent || response.data?.aos || response.data?.gallery || [];
                    
//                     // Filter from global if no specialized key exists
//                     if (!aosData || aosData.length === 0) {
//                         const rawData = Array.isArray(response.data) ? response.data : [];
//                         aosData = rawData.filter(p => p?.collectionType === 'aos' || p?.collectionType === 'gallery' || p?.isAOS === true);
                        
//                         // Last fallback to showing all if specific Art of Scent flags aren't found
//                         if (aosData.length === 0) aosData = rawData;
//                     }
                    
//                     setProducts(aosData);
//                 }
//             } catch (err) {
//                 console.error('ScentArt fetch error:', err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchAllProducts();
//     }, []);

//     useEffect(() => {
//         let animationFrameId;
//         const container = scrollRef.current;
//         if (!container || products.length === 0) return;

//         let isDown = false;
//         const handleDown = () => isDown = true;
//         const handleUp = () => isDown = false;

//         container.addEventListener('mousedown', handleDown);
//         container.addEventListener('mouseup', handleUp);
//         container.addEventListener('mouseleave', handleUp);
//         container.addEventListener('touchstart', handleDown, { passive: true });
//         container.addEventListener('touchend', handleUp);

//         const scroll = () => {
//             if (!isDown) {
//                 container.scrollLeft += 1;
//                 if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 1) {
//                     container.scrollLeft = 0;
//                 }
//             }
//             animationFrameId = requestAnimationFrame(scroll);
//         };
//         animationFrameId = requestAnimationFrame(scroll);

//         return () => {
//             cancelAnimationFrame(animationFrameId);
//             container.removeEventListener('mousedown', handleDown);
//             container.removeEventListener('mouseup', handleUp);
//             container.removeEventListener('mouseleave', handleUp);
//             container.removeEventListener('touchstart', handleDown);
//             container.removeEventListener('touchend', handleUp);
//         };
//     }, [products]);

//     // Construct image list (repeat to create infinite scroll effect if few products)
//     const displayProducts = [...products, ...products];

//     return (
//         <section className="middle-poster content-wrap" id="art-of-scent">
//             <div className="section-header">
//                 <h2 className="section-title" style={{ fontFamily: '"Trojan", serif', fontWeight: 700, textTransform: 'none' }}>The Art of Scent</h2>
//                 <p className="section-subtitle" style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
//                     Explore a symphony of olfactory notes, meticulously crafted for the modern visionary who demands excellence.
//                 </p>
//             </div>
            
//             {products?.length > 0 ? (
//                 <div className="scent-carousel-base" ref={scrollRef}>
//                     <div className="scent-track">
//                         {displayProducts?.map((product, idx) => {
//                             const rawImg = product?.imageUrl || product?.image || product?.images?.[0] || '';
//                             const imgPath = rawImg?.startsWith('http') || rawImg?.startsWith('/') 
//                                 ? rawImg 
//                                 : `/${rawImg}`;
                            
//                             if (!rawImg) return null;
                            
//                             return (
//                                 <div 
//                                     key={`${product?._id || idx}-${idx}`} 
//                                     className="scent-slide-wrapper" 
//                                     style={{ cursor: 'pointer' }}
//                                     onClick={() => navigate(`/product/${product?.slug || product?._id}`)}
//                                 >
//                                     <img src={imgPath} className="scent-slide-img" alt={product?.name} />
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>
//             ) : (
//                 <div style={{
//                     width: '100%',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     padding: '80px 0',
//                     color: '#86868b',
//                     fontSize: '0.9rem',
//                     letterSpacing: '0.1em',
//                     textTransform: 'uppercase',
//                     textAlign: 'center'
//                 }}>
//                     {loading ? "Preparing our masterpieces..." : "New artistic expressions coming soon."}
//                 </div>
//             )}
//         </section>
//     );
// };

// export default ScentArt;














import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';

const ScentArt = () => {
    const scrollRef = useRef(null);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await productService.getAllProducts();
                if (response.status) {
                    let aosData = response.data?.art_of_scent || response.data?.aos || response.data?.gallery || [];
                    
                    // Filter from global if no specialized key exists
                    if (!aosData || aosData.length === 0) {
                        const rawData = Array.isArray(response.data) ? response.data : [];
                        aosData = rawData.filter(p => p?.collectionType === 'aos' || p?.collectionType === 'gallery' || p?.isAOS === true);
                        
                        // Last fallback to showing all if specific Art of Scent flags aren't found
                        if (aosData.length === 0) aosData = rawData;
                    }
                    
                    setProducts(aosData);
                }
            } catch (err) {
                console.error('ScentArt fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllProducts();
    }, []);

    useEffect(() => {
        let animationFrameId;
        const container = scrollRef.current;
        if (!container || products.length === 0) return;

        let isDown = false;
        const handleDown = () => isDown = true;
        const handleUp = () => isDown = false;

        container.addEventListener('mousedown', handleDown);
        container.addEventListener('mouseup', handleUp);
        container.addEventListener('mouseleave', handleUp);
        container.addEventListener('touchstart', handleDown, { passive: true });
        container.addEventListener('touchend', handleUp);

        const scroll = () => {
            if (!isDown) {
                container.scrollLeft += 1;
                if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 1) {
                    container.scrollLeft = 0;
                }
            }
            animationFrameId = requestAnimationFrame(scroll);
        };
        animationFrameId = requestAnimationFrame(scroll);

        return () => {
            cancelAnimationFrame(animationFrameId);
            container.removeEventListener('mousedown', handleDown);
            container.removeEventListener('mouseup', handleUp);
            container.removeEventListener('mouseleave', handleUp);
            container.removeEventListener('touchstart', handleDown);
            container.removeEventListener('touchend', handleUp);
        };
    }, [products]);

    // Construct image list (repeat to create infinite scroll effect if few products)
    const displayProducts = [...products, ...products];

    return (
        <section className="middle-poster content-wrap" id="art-of-scent">
            <div className="section-header">
                <h2 className="section-title" style={{ fontFamily: '"Trojan", serif', fontWeight: 700, textTransform: 'none' }}>The Art of Scent</h2>
                <p className="section-subtitle" style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
                    Explore a symphony of olfactory notes, meticulously crafted for the modern visionary who demands excellence.
                </p>
            </div>
            
            {products?.length > 0 ? (
                <div className="scent-carousel-base" ref={scrollRef}>
                    <div className="scent-track">
                        {displayProducts?.map((product, idx) => {
                            const rawImg = product?.imageUrl || product?.image || product?.images?.[0] || '';
                            const imgPath = rawImg?.startsWith('http') || rawImg?.startsWith('/') 
                                ? rawImg 
                                : `/${rawImg}`;
                            
                            if (!rawImg) return null;
                            
                            return (
                                <div 
                                    key={`${product?._id || idx}-${idx}`} 
                                    className="scent-slide-wrapper" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/product/${product?.slug || product?._id}`)}
                                >
                                    <img src={imgPath} className="scent-slide-img" alt={product?.name} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px 0',
                    color: '#86868b',
                    fontSize: '0.9rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textAlign: 'center'
                }}>
                    {loading ? "Preparing our masterpieces..." : "New artistic expressions coming soon."}
                </div>
            )}
        </section>
    );
};

export default ScentArt;