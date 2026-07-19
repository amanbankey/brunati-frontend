import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Star, Grid } from 'lucide-react';

const BottomNav = () => {
    const location = useLocation();
    const FONT_ROBOTO = '"Roboto", sans-serif';

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Orders',    path: '/admin/orders',    icon: ShoppingBag },
        { name: 'Inventory', path: '/admin/inventory', icon: Package },
        { name: 'Reviews',   path: '/admin/reviews',   icon: Star },
        { name: 'Edit Site', path: '/admin/editsite',  icon: Grid }
    ];

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '64px',
            background: '#ffffff',
            borderTop: '1px solid rgba(0,0,0,0.05)', // Thin top border
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 50,
            paddingBottom: 'env(safe-area-inset-bottom)',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.03)'
        }}>
            {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: isActive ? '#000000' : '#9ca3af', // Active: Black, Inactive: Gray-400
                            gap: '4px',
                            minWidth: '64px',
                            transition: 'color 0.2s ease'
                        }}
                    >
                        <item.icon size={20} className="shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                        <span style={{ 
                            fontSize: '10px', 
                            fontFamily: FONT_ROBOTO,
                            fontWeight: isActive ? 700 : 400,
                            letterSpacing: '0.01em',
                            textTransform: 'none'
                        }}>
                            {item.name}
                        </span>
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default BottomNav;
