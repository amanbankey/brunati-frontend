import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './components/BottomNav';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* Child Pages */
import Summary from './pages/Summary';
import AdminInventory from './pages/AdminInventory';
import EditProduct from './pages/EditProduct';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetail from './pages/AdminOrderDetail';
import EditSite from './pages/EditSite';
import AdminProfile from './pages/AdminProfile';
import AdminReviews from './pages/AdminReviews';

const AdminLayout = () => {
    const { user, adminLogout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const location = useLocation();

    // Security check - redirect to home if not admin to break back-button loops
    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Sync sidebar closure and body scroll lock on mobile route changes
    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
            document.body.style.overflow = 'unset';
        }
    }, [location.pathname, isMobile]);

    // Handle body scroll lock when mobile sidebar is open
    useEffect(() => {
        if (isMobile && isSidebarOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = 'unset'; };
        }
    }, [isMobile, isSidebarOpen]);
    // Desktop Sidebar Auto-Close Timer (Step 76)
    useEffect(() => {
        let timer;
        const isDesktop = window.innerWidth >= 768;
        
        if (isDesktop && isSidebarOpen && !isSidebarHovered) {
            timer = setTimeout(() => {
                setIsSidebarOpen(false);
            }, 4000);
        }
        
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isSidebarOpen, isSidebarHovered, isMobile]);

    const handleLogout = async () => {
        await adminLogout();
        // Redirect to Home instead of Login to clearly exit the admin area
        navigate('/', { replace: true });
    };

    // Prevent rendering children while redirecting to avoid 401 API calls from child components
    // Moved below hooks to satisfy React's rules of hooks
    if (!user || !user.isAdmin) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F4F6F8', fontFamily: '"Roboto", sans-serif', overflowX: 'hidden', maxWidth: '100vw' }}>
            {!isMobile && (
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    isExpanded={isSidebarExpanded}
                    onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
                    onClose={() => isMobile && setIsSidebarOpen(false)} 
                    isMobile={isMobile}
                    onMouseEnter={() => setIsSidebarHovered(true)}
                    onMouseLeave={() => setIsSidebarHovered(false)}
                />
            )}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>
                {/* Header Bar - Permanently Visible (Step 76) */}
                <header style={{
                    height: '64px',
                    background: '#ffffff',
                    borderBottom: '1px solid #EEEEEE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    position: 'fixed',
                    top: 0,
                    left: isMobile ? 0 : (isSidebarOpen ? (isSidebarExpanded ? '256px' : '80px') : 0),
                    right: 0,
                    zIndex: 40,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    {!isMobile ? (
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5 }}
                        >
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    ) : <div style={{ width: 24 }}></div>}

                    <div style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        pointerEvents: 'none' // Ensure title doesn't block header clicks
                    }}>
                        <span style={{ 
                            fontFamily: '"Roboto", sans-serif', 
                            fontSize: '1.25rem',
                            fontWeight: 700, 
                            color: '#000000',
                            letterSpacing: '-0.01em',
                            textTransform: 'none',
                            textAlign: 'center'
                        }}>
                            Admin Access
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button 
                            onClick={handleLogout}
                            title="Log Out"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#666666',
                                padding: '8px', borderRadius: '6px', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = '#FEF2F2';
                                e.currentTarget.style.color = '#DC2626';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'none';
                                e.currentTarget.style.color = '#666666';
                            }}
                        >
                            <LogOut size={20} />
                        </button>

                        <Link
                            to="/admin/profile"
                            title="Profile Settings"
                            style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: '#f4f4f5', border: '1px solid #e5e7eb',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                                textDecoration: 'none', color: '#111827', transition: 'border-color 0.15s'
                            }}
                        >
                             {user?.name?.charAt(0) || 'A'}
                        </Link>
                    </div>
                </header>

                <main style={{
                    marginLeft: isMobile || !isSidebarOpen ? 0 : (isSidebarExpanded ? '256px' : '80px'),
                    padding: isMobile ? '88px 0 120px' : '112px 24px 120px', 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minHeight: '100vh',
                    background: '#F4F6F8',
                    overflowY: 'auto'
                }}>
                    <div style={{ 
                        maxWidth: '1280px', 
                        margin: '0 auto',
                        position: 'relative'
                    }}>
                        <Routes>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<Summary />} />
                            <Route path="inventory" element={<AdminInventory />} />
                            <Route path="inventory/edit/:id" element={<EditProduct />} />
                            <Route path="orders"    element={<AdminOrders />} />
                            <Route path="orders/:id" element={<AdminOrderDetail />} />
                            <Route path="reviews"   element={<AdminReviews />} />
                            <Route path="editsite"  element={<EditSite />} />
                            <Route path="profile"   element={<AdminProfile />} />
                            <Route path="*" element={<Navigate to="dashboard" replace />} />
                        </Routes>
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            {isMobile && <BottomNav />}
            
            {/* Mobile Sidebar Overlay */}
            {isMobile && isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 90,
                        transition: 'opacity 0.3s'
                    }}
                />
            )}
        </div>
    );
};

export default AdminLayout;
