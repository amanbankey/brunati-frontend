import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
    const pressTimer = useRef(null);
    const [isPressing, setIsPressing] = useState(false);

    const handlePressStart = (e) => {
        // Prevent multiple simultaneous timers
        if (pressTimer.current) return;

        setIsPressing(true);
        pressTimer.current = setTimeout(() => {
            setIsPressing(false);
            pressTimer.current = null;
            // Use navigate instead of window.open to avoid iOS popup blockers
            navigate('/admin/login');
        }, 1500); // Reduced to 1.5s for better UX
    };

    const handlePressEnd = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
        setIsPressing(false);
    };

    const handleContextMenu = (e) => {
        // Prevent system context menu on long press (crucial for iOS)
        e.preventDefault();
        return false;
    };

    return (
        <footer style={{
            padding: '60px 24px',
            textAlign: 'center',
            borderTop: '1px solid var(--apple-border)',
            background: 'var(--apple-bg)'
        }}>
            <div
                className="footer-logo"
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                onTouchMove={handlePressEnd}
                onTouchCancel={handlePressEnd}
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onContextMenu={handleContextMenu}
                style={{
                    cursor: 'pointer',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    display: 'inline-block',
                    transition: 'all 0.3s ease',
                    transform: isPressing ? 'scale(0.95)' : 'scale(1)',
                    opacity: isPressing ? 0.7 : 1,
                    fontWeight: 'normal',
                }}
            >
                Brunati
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Curated luxury • Timeless scents • Global presence
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '1px' }}>
                © 2026 Brunati Parfums. All rights reserved.
            </p>
        </footer>
    );
};

export default Footer;

