import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Star, Users, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import useAdminAuth from './hooks/useAdminAuth';

const Sidebar = ({ isOpen, onClose, isExpanded, onToggleExpand, isMobile, onMouseEnter, onMouseLeave }) => {
    const FONT_ROBOTO = '"Roboto", sans-serif';

    const location = useLocation();
    const navigate = useNavigate();
    const { adminLogout } = useAdminAuth();
    const [toast, setToast] = useState('');
    const [hoveredPath, setHoveredPath] = useState(null);

    const menuItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, pathsPrefix: '/admin/dashboard' },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingCart, pathsPrefix: '/admin/orders' },
        { name: 'Inventory', path: '/admin/inventory', icon: Package, pathsPrefix: '/admin/inventory' },
        { name: 'Reviews', path: '/admin/reviews', icon: Star, pathsPrefix: '/admin/reviews' },
        { name: 'Edit Site', path: '/admin/editsite', icon: LayoutDashboard, pathsPrefix: '/admin/editsite' },
    ];

    const handleLogout = async () => {
        try {
            await adminLogout();
            setToast('Logged out successfully');
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 800);
        } catch (error) {
            console.error("Logout failed:", error);
            navigate('/admin/login', { replace: true });
        }
    };

    return (
        <aside 
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            style={{
            width: isExpanded ? '256px' : '80px',
            background: '#ffffff',
            borderRight: '1px solid #EEEEEE',
            height: '100vh',
            position: 'fixed',
            left: isOpen ? 0 : (isExpanded ? '-256px' : '-80px'),
            top: 0,
            zIndex: 100,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 0',
            boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.05)' : 'none',
            overflowX: 'hidden'
        }}>
            
            {/* Log out Toast Wrapper Context */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', background: '#111827', color: '#fff',
                    padding: '12px 24px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500, fontFamily: FONT_ROBOTO,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 1000, animation: 'fadeInDown 0.3s ease-out'
                }}>
                    {toast}
                </div>
            )}
            {/* Admin Header Title in Sidebar */}
            <div style={{ padding: isExpanded ? '0 24px 32px' : '0 0 24px', position: 'relative' }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: isExpanded ? 'space-between' : 'center', 
                    width: '100%',
                    minHeight: '32px'
                }}>
                    {isExpanded && (
                        <h1 style={{
                            fontFamily: FONT_ROBOTO,
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            margin: 0,
                            color: '#000',
                            letterSpacing: '-0.02em'
                        }}>
                            Admin Access
                        </h1>
                    )}
                    {/* Desktop Toggle Hidden per Step 81 */}
                </div>
            </div>

            <nav style={{ flex: 1 }}>
                {menuItems.map(item => {
                    const isActive = location.pathname.startsWith(item.pathsPrefix);
                    const isHovered = hoveredPath === item.path;

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={onClose}
                            onMouseEnter={() => setHoveredPath(item.path)}
                            onMouseLeave={() => setHoveredPath(null)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isExpanded ? 'flex-start' : 'center',
                                padding: isExpanded ? '14px 24px' : '14px 0',
                                color: isActive ? '#000000' : '#666666',
                                backgroundColor: isHovered && !isActive ? '#f9fafb' : 'transparent',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontFamily: FONT_ROBOTO,
                                fontWeight: isActive ? 700 : 400,
                                borderLeft: isActive ? '2px solid #000000' : '2px solid transparent',
                                transition: 'all 0.15s ease-in-out',
                                gap: isExpanded ? '14px' : '0'
                            }}
                            title={!isExpanded ? item.name : ''}
                        >
                            <item.icon size={20} className="shrink-0" strokeWidth={isActive ? 2.5 : 2} style={{ margin: isExpanded ? '0' : 'auto' }} />
                            {isExpanded && <span style={{ marginTop: '2px', whiteSpace: 'nowrap' }}>{item.name}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Exit Action */}
            <div style={{ padding: isExpanded ? '0 24px' : '0' }}>
                <button 
                    onClick={handleLogout}
                    title={!isExpanded ? "Exit" : ""}
                    onMouseEnter={() => setHoveredPath('logout')}
                    onMouseLeave={() => setHoveredPath(null)}
                    style={{
                        display: 'flex', width: '100%', alignItems: 'center', justifyContent: isExpanded ? 'flex-start' : 'center', gap: isExpanded ? '14px' : '0', padding: isExpanded ? '14px' : '14px 0',
                        color: '#666666', backgroundColor: hoveredPath === 'logout' ? '#fef2f2' : 'transparent',
                        border: 'none', borderRadius: '6px', fontSize: '14px', fontFamily: FONT_ROBOTO, 
                        fontWeight: 400, cursor: 'pointer', transition: 'all 0.15s ease-in-out', textAlign: 'left'
                    }}
                >
                    <LogOut size={20} strokeWidth={2} style={{ color: hoveredPath === 'logout' ? '#ef4444' : '#666666', transition: 'color 0.15s', margin: isExpanded ? '0' : 'auto' }} />
                    {isExpanded && <span style={{ marginTop: '2px', color: hoveredPath === 'logout' ? '#ef4444' : '#666666', transition: 'color 0.15s', whiteSpace: 'nowrap' }}>Exit</span>}
                </button>
            </div>

            <style>{`@keyframes fadeInDown { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
        </aside>
    );
};

export default Sidebar;
