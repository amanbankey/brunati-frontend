import React, { useState, useEffect } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { adminDashboardService } from '../../services/adminDashboardService';
import toast from 'react-hot-toast';

/* ─── DESIGN TOKENS ─── */
const FONT_ROBOTO = '"Roboto", sans-serif';
const BG_STAGING = '#F4F6F8';
const CARD_BORDER = '#E5E7EB';
const SOFT_RED = '#DC2626';

/* ─── SUB-COMPONENTS ─── */
const MetricCard = ({ label, value, meta, isAlert }) => (
    <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-center min-h-[120px] transition-all hover:shadow-md">
        <p style={{ 
            fontFamily: FONT_ROBOTO, 
            fontSize: '0.85rem', 
            fontWeight: isAlert ? 700 : 400, 
            color: isAlert ? SOFT_RED : '#6B7280',
            margin: 0,
            marginBottom: '4px'
        }}>
            {label}
        </p>
        <p style={{ 
            fontFamily: FONT_ROBOTO, 
            fontSize: '1.875rem', 
            fontWeight: 700, 
            color: '#111827',
            margin: 0,
            letterSpacing: '-0.025em'
        }}>
            {value}
        </p>
        <p style={{ 
            fontFamily: FONT_ROBOTO, 
            fontSize: '0.75rem', 
            fontWeight: 400, 
            color: '#6B7280',
            margin: 0,
            marginTop: '4px'
        }}>
            {meta}
        </p>
    </div>
);

const Summary = () => {
    const [loading, setLoading] = useState(true);
    const [chartPeriod, setChartPeriod] = useState('week');
    const [metrics, setMetrics] = useState({
        todaySales: '₹ 0',
        newOrders: '0',
        avgOrderValue: '₹ 0',
        salesGrowth: '0%'
    });
    const [salesData, setSalesData] = useState({
        week: [],
        month: [],
        year: []
    });
    const [recentActivity, setRecentActivity] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await adminDashboardService.getDashboardData();
            if (res.status) {
                const { revenue, orders, charts, products } = res.data;
                
                setMetrics({
                    todaySales: `₹ ${revenue.today.toLocaleString()}`,
                    newOrders: orders.today.toString(),
                    avgOrderValue: `₹ ${revenue.avgOrderValue.toLocaleString()}`,
                    salesGrowth: `${revenue.growthPercent}%`,
                    outOfStock: products.outOfStock,
                    lowStockCount: products.lowStock.length
                });


                setSalesData({
                    week: charts.week,
                    month: charts.month,
                    year: charts.year
                });

                const activities = orders.recent.map(order => {
                    // Use updatedAt to show when the activity (status change) actually happened
                    const timeAgo = formatTimeAgo(new Date(order.updatedAt || order.createdAt));

                    let icon = '📦';
                    let text = `Order #${order.orderId} placed by ${order.customer.name}`;
                    
                    if (order.orderStatus === 'shipped') {
                        icon = '🚚';
                        text = `Order #${order.orderId} shipped to ${order.customer.name}`;
                    } else if (order.orderStatus === 'delivered') {
                        icon = '✅';
                        text = `Order #${order.orderId} delivered to ${order.customer.name}`;
                    } else if (order.orderStatus === 'cancelled') {
                        icon = '❌';
                        text = `Order #${order.orderId} was cancelled`;
                    }

                    return {
                        id: order.orderId,
                        text,
                        time: timeAgo,
                        icon
                    };
                });
                setRecentActivity(activities);
            }
        } catch (error) {
            console.error('Dashboard Fetch Error:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor(Math.max(0, (new Date() - date) / 1000));
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " year ago" : " years ago");
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " month ago" : " months ago");
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " day ago" : " days ago");
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " hour ago" : " hours ago");
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + (Math.floor(interval) === 1 ? " min ago" : " mins ago");
        return Math.floor(seconds) + (Math.floor(seconds) === 1 ? " second ago" : " seconds ago");
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        fetchData();
    };

    if (loading && !metrics.todaySales) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '3px solid #f3f3f3', 
                    borderTop: '3px solid #111827', 
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
            </div>
        );
    }

    return (
        <div className="w-full relative overflow-x-hidden px-6 md:px-0" style={{ background: BG_STAGING }}>
            {/* Header Alignment */}
            <div style={{ 
                marginBottom: '32px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingBottom: '24px',
                borderBottom: `1px solid ${CARD_BORDER}`
            }}>
                <div>
                    <h1 style={{ 
                        fontFamily: FONT_ROBOTO, 
                        fontSize: '1.875rem', 
                        fontWeight: 700, 
                        color: '#111827', 
                        margin: 0 
                    }}>
                        Dashboard
                    </h1>
                    <p style={{ 
                        fontFamily: FONT_ROBOTO, 
                        fontSize: '0.875rem', 
                        fontWeight: 400, 
                        color: '#6B7280', 
                        marginTop: '4px' 
                    }}>
                        Analytics Overview
                    </p>
                </div>
                <button 
                    onClick={handleRefresh}
                    disabled={loading}
                    style={{
                        padding: '10px 20px', 
                        background: '#ffffff', 
                        border: `1px solid ${CARD_BORDER}`,
                        borderRadius: '8px', 
                        fontWeight: 700, 
                        fontSize: '0.875rem', 
                        cursor: 'pointer',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        transition: 'all 0.2s',
                        fontFamily: FONT_ROBOTO,
                        opacity: loading ? 0.7 : 1
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
                        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Shopify Grid (3 cols desktop, 1 col mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard 
                    label="Today's sales" 
                    value={metrics.todaySales} 
                    meta={`Active growth: ${metrics.salesGrowth}`} 
                />
                <MetricCard 
                    label="New orders" 
                    value={metrics.newOrders} 
                    meta="New orders received today" 
                />
                <MetricCard 
                    label="Avg order value" 
                    value={metrics.avgOrderValue} 
                    meta="Based on all lifetime orders" 
                />
            </div>

            {/* Inventory Alerts (Full width if any) */}
            {(metrics.outOfStock > 0 || metrics.lowStockCount > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {metrics.outOfStock > 0 && (
                        <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '1.5rem' }}>⚠️</div>
                            <div>
                                <p style={{ margin: 0, fontFamily: FONT_ROBOTO, fontWeight: 700, color: '#991B1B', fontSize: '0.9rem' }}>Out of Stock Items</p>
                                <p style={{ margin: 0, fontFamily: FONT_ROBOTO, color: '#B91C1C', fontSize: '0.8rem' }}>{metrics.outOfStock} products are currently unavailable.</p>
                            </div>
                        </div>
                    )}
                    {metrics.lowStockCount > 0 && (
                        <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ fontSize: '1.5rem' }}>📉</div>
                            <div>
                                <p style={{ margin: 0, fontFamily: FONT_ROBOTO, fontWeight: 700, color: '#92400E', fontSize: '0.9rem' }}>Low Stock Alert</p>
                                <p style={{ margin: 0, fontFamily: FONT_ROBOTO, color: '#B45309', fontSize: '0.8rem' }}>{metrics.lowStockCount} products are running low on stock.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Sales Chart Section */}

            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm mb-10 overflow-hidden">
                <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                    <div>
                        <h2 style={{ fontFamily: FONT_ROBOTO, fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#111827' }}>Sales Trend</h2>
                        <p style={{ fontFamily: FONT_ROBOTO, fontSize: '0.875rem', color: '#6B7280', marginTop: '2px' }}>
                            {chartPeriod === 'week' ? 'Last 7 days' : chartPeriod === 'month' ? 'Last 4 weeks' : 'Last 12 months'}
                        </p>
                    </div>
                    <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                        {['week', 'month', 'year'].map(p => (
                            <button
                                key={p}
                                onClick={() => setChartPeriod(p)}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: '6px',
                                    background: chartPeriod === p ? '#ffffff' : 'transparent',
                                    color: chartPeriod === p ? '#111827' : '#6B7280',
                                    border: 'none',
                                    boxShadow: chartPeriod === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 700,
                                    fontFamily: FONT_ROBOTO,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ width: '100%', height: '400px', minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData[chartPeriod]}>
                            <defs>
                                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#111827" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 12, fill: '#9CA3AF', fontFamily: FONT_ROBOTO, fontWeight: 400 }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9CA3AF', fontFamily: FONT_ROBOTO, fontWeight: 400 }}
                                tickFormatter={(value) => value >= 1000 ? `₹${(value/1000).toFixed(1)}k` : `₹${value}`}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    background: '#111827', color: '#ffffff', border: 'none', 
                                    borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700,
                                    fontFamily: FONT_ROBOTO
                                }}
                                itemStyle={{ color: '#ffffff' }}
                                cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="#111827" 
                                strokeWidth={2.5}
                                fillOpacity={1} 
                                fill="url(#colorAmt)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm mb-10 overflow-hidden">
                <h2 style={{ fontFamily: FONT_ROBOTO, fontSize: '1.125rem', fontWeight: 700, marginBottom: '20px', color: '#111827' }}>Recent Activity</h2>
                <div className="flex flex-col">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((activity, i, arr) => (
                            <div key={activity.id} style={{
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '16px',
                                padding: '16px 0',
                                borderBottom: i < arr.length - 1 ? '1px solid #F3F4F6' : 'none'
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', background: '#F9FAFB', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                                    flexShrink: 0, border: '1px solid #F3F4F6'
                                }}>
                                    {activity.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: FONT_ROBOTO, fontSize: '0.875rem', color: '#111827', margin: 0, lineHeight: 1.5 }}>{activity.text}</p>
                                    <p style={{ fontFamily: FONT_ROBOTO, fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>{activity.time}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ fontFamily: FONT_ROBOTO, fontSize: '0.875rem', color: '#6B7280', textAlign: 'center', padding: '20px' }}>No recent activity to show.</p>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .recharts-responsive-container { width: 100% !important; }
            `}</style>
        </div>
    );
};

export default Summary;

