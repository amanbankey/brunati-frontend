import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { Search, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, Trash2, Filter, Package, AlertCircle, CreditCard } from 'lucide-react';


/* ─── DESIGN TOKENS ─── */
const FONT_SAFE = '"Roboto", sans-serif';
const SOFT_GREEN_BG = '#EBF9F1';
const DARK_GREEN_TEXT = '#00632B';
const SOFT_AMBER_BG = '#FFF4E5';
const DARK_AMBER_TEXT = '#B45309';
const SOFT_RED_BG = '#FFF5F5';
const DARK_RED_TEXT = '#B91B1B';
const BORDER_GRAY = '#E5E7EB';
const DARK_TEXT = '#111827';
const LIGHT_TEXT = '#6B7280';

const defaultItems = [{ productName: 'Oud Mystique', size: '100 ml', price: 1295, quantity: 1, productImage: ['/placeholder.png'] }];
const defaultCustomer = { name: 'Priyanka Sundalam', email: 'priyanka.s@gmail.com', phone: '+91 98765 43210', street: '123 Luxury Avenue, Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' };


const AdminOrders = () => {
    const navigate = useNavigate();
    const localStorageKey = 'brunati_admin_orders_filters';
    const savedFilters = JSON.parse(localStorage.getItem(localStorageKey) || '{}');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(savedFilters.searchQuery || '');
    const [viewMode, setViewMode] = useState(window.innerWidth <= 1024 ? 'mobile' : 'desktop');
    const [toast, setToast] = useState('');

    const [selectedOrders, setSelectedOrders] = useState(new Set());
    const [paymentFilter, setPaymentFilter] = useState(savedFilters.paymentFilter || 'all');
    const [statusFilter, setStatusFilter] = useState(savedFilters.statusFilter || 'all');
    const [sortBy, setSortBy] = useState(savedFilters.sortBy || 'newest');
    const [currentPage, setCurrentPage] = useState(savedFilters.currentPage || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    
    const [showPaymentMenu, setShowPaymentMenu] = useState(false);
    const [showStatusMenu, setShowStatusMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const itemsPerPage = 10; 

    const paymentMenuRef = useRef(null);

    const statusMenuRef = useRef(null);
    const sortMenuRef = useRef(null);
    const longPressTimer = useRef(null);
    const lastRequestRef = useRef(0);
    
    // Undo Logic States
    const [deletionQueue, setDeletionQueue] = useState([]);
    const [undoVisible, setUndoVisible] = useState(false);
    const [undoTimer, setUndoTimer] = useState(100);
    const undoTimeoutRef = useRef(null);
    const undoIntervalRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setViewMode(window.innerWidth <= 1024 ? 'mobile' : 'desktop');
        const handleClickOutside = (e) => {
            if (paymentMenuRef.current && !paymentMenuRef.current.contains(e.target)) setShowPaymentMenu(false);
            if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) setShowStatusMenu(false);
            if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) setShowSortMenu(false);
        };
        
        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Save filters to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(localStorageKey, JSON.stringify({
            searchQuery,
            paymentFilter,
            statusFilter,
            sortBy,
            currentPage
        }));
    }, [searchQuery, paymentFilter, statusFilter, sortBy, currentPage]);

    // Fetch orders when filters change
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchOrders();
        }, 400); // 400ms debounce for search

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, paymentFilter, statusFilter, sortBy, currentPage]);

    const fetchOrders = async () => {
        const requestId = Date.now();
        lastRequestRef.current = requestId;
        try {
            setLoading(true);
            const params = {
                search: searchQuery,
                paymentStatus: paymentFilter,
                orderStatus: statusFilter,
                sortBy: sortBy,
                page: currentPage,
                limit: itemsPerPage
            };
            
            const res = await orderService.getAdminOrders(params);
            if (requestId !== lastRequestRef.current) return; // Prevent race conditions

            if (res.status && res.data) {
                setOrders(res.data.data || []);
                setTotalPages(res.data.pagination?.totalPages || 1);
                setTotalResults(res.data.pagination?.total || 0);
            }
        } catch (err) {
            if (requestId !== lastRequestRef.current) return;
            console.error('Fetch orders error:', err);
            setToast('Failed to load orders');
            setTimeout(() => setToast(''), 3000);
        } finally {
            if (requestId === lastRequestRef.current) {
                setLoading(false);
            }
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedOrders(new Set(orders.map(o => o.orderId).filter(Boolean)));
        else setSelectedOrders(new Set());
    };

    const handleSelectOrder = (id) => {
        if (!id) return;
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedOrders(newSelected);
    };


    const handleBulkDelete = () => {
        const idsToDelete = Array.from(selectedOrders);
        const itemsToDelete = orders.filter(o => selectedOrders.has(o.orderId));
        if (itemsToDelete.length === 0) return;

        // Clear any existing timers
        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
        if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);

        // Optimistic State Update: Pre-sort to maintain order integrity
        setOrders(prev => prev.filter(o => !selectedOrders.has(o.orderId)));
        setDeletionQueue(itemsToDelete);
        setSelectedOrders(new Set());
        setUndoVisible(true);
        setUndoTimer(100);

        // Start 5-second countdown for backend execution
        undoTimeoutRef.current = setTimeout(async () => {
            try {
                await orderService.bulkDeleteOrders(idsToDelete);
                setUndoVisible(false);
                setDeletionQueue([]);
                if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
                
                // If we've emptied the current page view, fetch fresh data
                if (orders.length < 3) fetchOrders(); 
                else setToast('Successfully deleted');
                
                setTimeout(() => setToast(''), 3000);
            } catch (err) {
                console.error('Bulk delete failed:', err);
                setToast('Server sync failed - refreshing list');
                fetchOrders(); // Revert on failure
            }
        }, 5000);

        // Timer Interval for Progress Bar (Smooth decay)
        undoIntervalRef.current = setInterval(() => {
            setUndoTimer(prev => {
                if (prev <= 0) {
                    clearInterval(undoIntervalRef.current);
                    return 0;
                }
                return prev - 2; // 2% every 100ms = 5s
            }); 
        }, 100);
    };

    const handleUndoDelete = () => {
        // Stop the execution of deletion
        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
        if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
        
        // Restore items to the top of the current view
        setOrders(prev => [...deletionQueue, ...prev]);
        setDeletionQueue([]);
        setUndoVisible(false);
        setToast('Action Restored');
        setTimeout(() => setToast(''), 2000);
    };


    const handleBulkUpdate = async (type, status) => {
        const ids = Array.from(selectedOrders);
        const updates = type === 'status' ? { orderStatus: status } : { paymentStatus: status };
        
        try {
            setLoading(true);
            const res = await orderService.bulkUpdateOrders(ids, updates);
            if (res.status) {
                setToast(`Updated ${selectedOrders.size} orders`);
                fetchOrders();
            } else {
                setToast(res.message || 'Update failed');
            }
        } catch (err) {
            setToast('Failed to update orders');
        } finally {
            setSelectedOrders(new Set());
            setLoading(false);
            setTimeout(() => setToast(''), 3000);
        }
    };


    // Mobile Selection Logic
    const handleCardTouchStart = (orderId) => {
        if (viewMode !== 'mobile') return;
        longPressTimer.current = setTimeout(() => {
            handleSelectOrder(orderId);
            // Silent catch to prevent intervention errors in some browsers
            try {
                if ('vibrate' in window.navigator) {
                    window.navigator.vibrate(50);
                }
            } catch (vibrateErr) {
                // Ignore vibration failures (unsupported or blocked)
            }
        }, 500);

    };

    const handleCardTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const handleCardClick = (o) => {
        if (selectedOrders.size > 0) {
            handleSelectOrder(o.orderId);
        } else {
            navigate(`/admin/orders/${o.orderId}`, { state: { order: o } });
        }
    };

    const getBadgeStyle = (status) => {
        const s = status?.toLowerCase();
        if (s === 'delivered') return { background: '#EBF9F1', color: '#00632B' }; // Green
        if (s === 'cancelled') return { background: '#FFF5F5', color: '#B91B1B' }; // Red
        if (s === 'shipped') return { background: '#EBF5FA', color: '#2C6ECB' };   // Blue
        if (s === 'placed') return { background: '#FFF4E5', color: '#B45309' };    // Amber
        if (s === 'paid') return { background: '#EBF9F1', color: '#00632B' };      // Green for Paid
        return { background: '#F3F4F6', color: '#6B7280' };
    };


    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const filterBtnClass = "h-[42px] px-3 md:px-4 bg-white border border-gray-300 rounded-lg text-sm font-normal text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all cursor-pointer w-full md:w-auto overflow-hidden text-ellipsis whitespace-nowrap";

    const dropdownListStyle = {
        position: 'absolute', top: 'calc(100% + 4px)', left: viewMode === 'mobile' ? '0' : 'auto', right: 0, width: 200, background: '#fff', 
        border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100, padding: 6
    };

    const dropdownItemStyle = {
        width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none',
        fontSize: '0.875rem', color: DARK_TEXT, fontFamily: FONT_SAFE, cursor: 'pointer', borderRadius: 6
    };

    const mobileBulkBtnStyle = "px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95";

    return (
        <div className="w-full relative overflow-x-hidden px-6 md:px-0" style={{ fontFamily: FONT_SAFE, animation: 'fadeIn 0.3s ease-in-out' }}>
            
            {/* Page Header */}
            <div className="flex justify-between items-center mb-8 pt-2">
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: DARK_TEXT, margin: 0 }}>Orders</h1>
            </div>

            {/* Shopify Toolbar Component */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by Order ID or Customer..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-[42px] pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 focus:bg-white transition-all font-normal text-gray-900" 
                    />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 md:flex gap-2">
                    {/* Payment Filter */}
                    <div className="relative" ref={paymentMenuRef}>
                        <button onClick={() => setShowPaymentMenu(!showPaymentMenu)} className={filterBtnClass} style={{ fontWeight: 700 }}>
                            <Filter size={14} className="flex-shrink-0" />
                            {paymentFilter === 'all' ? 'Payment' : `Payment: ${paymentFilter.charAt(0).toUpperCase() + paymentFilter.slice(1)}`}
                        </button>
                        {showPaymentMenu && (
                            <div style={dropdownListStyle}>
                                {['all', 'pending', 'paid', 'failed'].map(s => (
                                    <button key={s} onClick={() => { setPaymentFilter(s); setShowPaymentMenu(false); setCurrentPage(1); }} style={{...dropdownItemStyle, background: paymentFilter === s ? '#F9FAFB' : 'none', fontWeight: paymentFilter === s ? 700 : 400}}>
                                        {s === 'all' ? 'All Payments' : s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="relative" ref={statusMenuRef}>
                        <button onClick={() => setShowStatusMenu(!showStatusMenu)} className={filterBtnClass} style={{ fontWeight: 700 }}>
                            <Filter size={14} className="flex-shrink-0" />
                            {statusFilter === 'all' ? 'Status' : `Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
                        </button>
                        {showStatusMenu && (
                            <div style={dropdownListStyle}>
                                {['all', 'placed', 'shipped', 'delivered', 'cancelled'].map(s => (
                                    <button key={s} onClick={() => { setStatusFilter(s); setShowStatusMenu(false); setCurrentPage(1); }} style={{...dropdownItemStyle, background: statusFilter === s ? '#F9FAFB' : 'none', fontWeight: statusFilter === s ? 700 : 400}}>
                                        {s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort Filter */}
                    <div className="relative col-span-2 md:col-span-1" ref={sortMenuRef}>
                        <button onClick={() => setShowSortMenu(!showSortMenu)} className={filterBtnClass}>
                            <ChevronDown size={14} className="flex-shrink-0" />
                            Sort
                        </button>
                        {showSortMenu && (
                            <div style={dropdownListStyle}>
                                {[
                                    { id: 'newest', label: 'Newest First' },
                                    { id: 'oldest', label: 'Oldest First' },
                                    { id: 'total-high', label: 'Total (High to Low)' },
                                    { id: 'total-low', label: 'Total (Low to High)' }
                                ].map(s => (
                                    <button key={s.id} onClick={() => { setSortBy(s.id); setShowSortMenu(false); setCurrentPage(1); }} style={{...dropdownItemStyle, background: sortBy === s.id ? '#F9FAFB' : 'none', fontWeight: sortBy === s.id ? 700 : 400}}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* General Toast Banner */}
            {toast && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] animate-fadeIn">
                    <div className="bg-gray-900 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle size={14} color="white" strokeWidth={3} />
                        </div>
                        <span style={{ fontFamily: FONT_SAFE, fontWeight: 700 }}>{toast}</span>
                    </div>
                </div>
            )}

            {/* Undo Deletion Toast */}
            {undoVisible && (
                <div className="fixed bottom-8 md:right-8 left-1/2 -translate-x-1/2 md:translate-x-0 w-[90%] md:w-auto z-[100] animate-slideUp">
                    <div className="bg-black/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-8 border border-white/10 relative overflow-hidden">
                        <p className="text-sm font-normal" style={{ fontFamily: FONT_SAFE }}>
                            {deletionQueue.length > 1 ? `${deletionQueue.length} Orders Deleted` : `Order ${deletionQueue[0]?.orderId} Deleted`}
                        </p>
                        <button 
                            onClick={handleUndoDelete}
                            className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition-all"
                            style={{ fontFamily: FONT_SAFE }}
                        >
                            Undo
                        </button>
                        
                        {/* Timer Bar */}
                        <div 
                            className="absolute bottom-0 left-0 h-1 bg-white transition-all ease-linear"
                            style={{ width: `${undoTimer}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Mobile Bulk Banner */}
            {viewMode === 'mobile' && selectedOrders.size > 0 && (
                <div className="fixed bottom-24 left-4 right-4 z-[99] bg-black text-white p-4 rounded-2xl shadow-2xl flex flex-col gap-4 border border-white/5 animate-slideUp">
                    <div className="flex justify-between items-center bg-white/10 py-1.5 px-4 rounded-full">
                        <span style={{ fontFamily: FONT_SAFE, fontWeight: 700 }} className="text-sm">
                            {selectedOrders.size} Selected
                        </span>
                        <button 
                            onClick={() => setSelectedOrders(new Set())} 
                            style={{ fontFamily: FONT_SAFE, fontWeight: 700 }}
                            className="text-xs text-gray-400 hover:text-white transition-all"
                        >
                            Deselect All
                        </button>
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        <button onClick={() => handleBulkUpdate('payment', 'paid')} className={mobileBulkBtnStyle}><CreditCard size={14} className="inline mr-2" /> Mark Paid</button>
                        <button onClick={() => handleBulkUpdate('status', 'shipped')} className={mobileBulkBtnStyle}><Package size={14} className="inline mr-2" /> Mark Shipped</button>
                        <button onClick={() => handleBulkUpdate('status', 'delivered')} className={mobileBulkBtnStyle}><CheckCircle size={14} className="inline mr-2" /> Mark Delivered</button>
                        <button onClick={() => handleBulkUpdate('status', 'cancelled')} className={mobileBulkBtnStyle}><AlertCircle size={14} className="inline mr-2" /> Cancel Orders</button>
                        <button onClick={handleBulkDelete} className={`${mobileBulkBtnStyle} text-red-500 border-red-500/20 bg-red-500/10`}><Trash2 size={14} className="inline mr-2" /> Delete</button>
                    </div>

                </div>
            )}

            {/* Layout Transitions */}
            {loading ? (
                <div className="flex justify-center items-center p-40">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                </div>
            ) : viewMode === 'desktop' ? (
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className={`border-bottom border-gray-100 ${selectedOrders.size > 0 ? 'bg-gray-50' : 'bg-gray-50/50'}`}>
                            <tr>
                                <th className="p-4 w-12 text-center">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedOrders.size > 0 && selectedOrders.size === orders.length} 
                                        onChange={handleSelectAll} 
                                        className="w-4 h-4 cursor-pointer accent-black" 
                                    />
                                </th>
                                {selectedOrders.size > 0 ? (
                                    <th colSpan={5} className="py-2 px-4">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-bold text-gray-900">{selectedOrders.size} selected</span>
                                            <div className="w-[1px] h-4 bg-gray-300" />
                                            <button onClick={() => handleBulkUpdate('payment', 'paid')} className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:border-black transition-all">Mark Paid</button>
                                            <button onClick={() => handleBulkUpdate('status', 'shipped')} className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:border-black transition-all">Mark Shipped</button>
                                            <button onClick={() => handleBulkUpdate('status', 'delivered')} className="text-xs font-bold text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:border-black transition-all">Mark Delivered</button>
                                            <button onClick={handleBulkDelete} className="text-xs font-bold text-red-600 bg-white border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all text-red border-none">Delete</button>
                                        </div>
                                    </th>

                                ) : (
                                    <>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Payment</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Fulfillment</th>
                                    </>
                                )}
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.length > 0 ? orders.map((o) => (
                                <tr key={o.orderId} onClick={() => handleCardClick(o)} className={`hover:bg-gray-50/80 cursor-pointer transition-all ${selectedOrders.has(o.orderId) ? 'bg-gray-50' : ''}`}>
                                    <td onClick={e => e.stopPropagation()} className="p-4 text-center">
                                        <input type="checkbox" checked={selectedOrders.has(o.orderId)} onChange={() => handleSelectOrder(o.orderId)} className="w-4 h-4 cursor-pointer accent-black" />
                                    </td>
                                    <td className="p-4 text-sm font-bold text-gray-900">{o.orderId}</td>
                                    <td className="p-4 text-sm font-normal text-gray-500">{formatDate(o.createdAt)}</td>
                                    <td className="p-4 text-sm font-normal text-gray-900">{o.customer?.name || "Anonymous"}</td>
                                    <td className="p-4 text-center">
                                        <span style={getBadgeStyle(o.paymentStatus)} className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                            {o.paymentStatus || "unpaid"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span style={getBadgeStyle(o.orderStatus)} className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                            {o.orderStatus || "placed"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-gray-900 text-right">₹{o.totalAmount?.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={7} className="p-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300"><Search size={32} /></div>
                                        <p className="font-bold text-gray-900">No orders match your filters</p>
                                    </div>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                    
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-white">
                            <div className="text-sm text-gray-500 font-normal">
                                Showing <b>{((currentPage - 1) * itemsPerPage) + 1}</b> to <b>{Math.min(currentPage * itemsPerPage, totalResults)}</b> of <b>{totalResults}</b> orders
                            </div>
                            <div className="flex items-center gap-6">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-black transition-all flex items-center justify-center"><ChevronLeft size={18}/></button>
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-tighter">Page {currentPage} of {totalPages}</span>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:border-black transition-all flex items-center justify-center"><ChevronRight size={18}/></button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {orders.length > 0 ? orders.map((o) => (
                        <div 
                            key={o.orderId} 
                            onClick={() => handleCardClick(o)}
                            onTouchStart={() => handleCardTouchStart(o.orderId)}
                            onTouchEnd={handleCardTouchEnd}
                            onTouchMove={handleCardTouchEnd}
                            className={`bg-white border transition-all duration-200 rounded-xl p-5 shadow-sm active:scale-[0.98] cursor-pointer relative overflow-hidden ${selectedOrders.has(o.orderId) ? 'border-black ring-1 ring-black/5 bg-gray-50/50' : 'border-gray-100'}`}
                        >
                            {selectedOrders.has(o.orderId) && (
                                <div className="absolute top-0 right-0 p-2 bg-black text-white rounded-bl-xl shadow-lg animate-fadeIn">
                                    <CheckCircle size={12} strokeWidth={3} />
                                </div>
                            )}
                            
                            <div className="flex justify-between items-baseline mb-1">
                                <span className="text-base font-bold text-gray-900" style={{ fontFamily: FONT_SAFE }}>{o.orderId}</span>
                                <span className="text-lg font-bold text-gray-900" style={{ fontFamily: FONT_SAFE }}>₹{o.totalAmount?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-normal text-gray-900" style={{ fontFamily: FONT_SAFE }}>{o.customer?.name || "Anonymous"}</span>
                                <span className="text-[11px] font-normal text-gray-500" style={{ fontFamily: FONT_SAFE }}>{formatDate(o.createdAt)}</span>
                            </div>
                            <div className="flex gap-2">
                                <span style={getBadgeStyle(o.paymentStatus)} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    {o.paymentStatus || "unpaid"}
                                </span>
                                <span style={getBadgeStyle(o.orderStatus)} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                    {o.orderStatus || "placed"}
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="p-20 text-center bg-white border border-dashed border-gray-200 rounded-xl">
                            <p className="font-bold text-gray-900">No orders found</p>
                        </div>
                    )}
                    
                    {totalPages > 1 && (
                        <div className="py-8 flex flex-col items-center gap-6">
                            <div className="text-xs text-gray-500 font-normal">
                                Showing <b>{((currentPage - 1) * itemsPerPage) + 1}</b> - <b>{Math.min(currentPage * itemsPerPage, totalResults)}</b> of <b>{totalResults}</b>
                            </div>
                            <div className="flex items-center justify-center gap-6">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm active:scale-95 disabled:opacity-50"><ChevronLeft size={20}/></button>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Page {currentPage} of {totalPages}</span>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm active:scale-95 disabled:opacity-50"><ChevronRight size={20}/></button>
                            </div>
                        </div>
                    )}

                </div>
            )}

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { opacity: 0; transform: translate3d(0, 100%, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
                .text-red { color: #D82C0D !important; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default AdminOrders;
