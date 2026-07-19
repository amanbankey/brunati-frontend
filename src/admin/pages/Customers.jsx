import React, { useState, useEffect } from 'react';

const FONT = '"Roboto", sans-serif';

const ALL_CUSTOMERS = [
    { id: 'usr_001', name: 'Sneha Kulkarni', email: 'sneha.k@example.com', location: 'Pune, MH', ordersCount: 4, totalSpent: 18500 },
    { id: 'usr_002', name: 'Arjun Mehta',    email: 'arjun.mehta9@example.com', location: 'Mumbai, MH', ordersCount: 2, totalSpent: 4500 },
    { id: 'usr_003', name: 'Priya Sharma',   email: 'priyasharma_12@example.com', location: 'Delhi, DL', ordersCount: 1, totalSpent: 1795 },
    { id: 'usr_004', name: 'Rahul Desai',    email: 'rahul.desai@example.com', location: 'Bengaluru, KA', ordersCount: 3, totalSpent: 8900 },
    { id: 'usr_005', name: 'Neha Gupta',     email: 'nehagupta_88@example.com', location: 'Hyderabad, TS', ordersCount: 1, totalSpent: 3590 },
    { id: 'usr_006', name: 'Vikram Singh',   email: 'vikram.singh@example.com', location: 'Jaipur, RJ', ordersCount: 5, totalSpent: 21000 },
];

const Customers = () => {
    const [customers, setCustomers] = useState(ALL_CUSTOMERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState(window.innerWidth <= 768 ? 'mobile' : 'desktop');

    useEffect(() => {
        const handleResize = () => setViewMode(window.innerWidth <= 768 ? 'mobile' : 'desktop');
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredCustomers = customers.filter(c => {
        return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               c.email.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleExport = (e) => {
        e.preventDefault();
        alert('Exporting customers CSV...');
    };

    return (
        <div style={{ fontFamily: FONT, width: '100%', animation: 'fadeIn 0.3s ease-in-out', padding: viewMode === 'mobile' ? '0 16px' : '0' }}>
            {/* Header Area */}
            <div style={{ 
                display: 'flex', 
                flexDirection: viewMode === 'mobile' ? 'column' : 'row', 
                justifyContent: 'space-between', 
                alignItems: viewMode === 'mobile' ? 'flex-start' : 'center',
                gap: 20,
                marginBottom: 24
            }}>
                <h1 style={{ fontFamily: FONT, fontSize: '1.5rem', fontWeight: 700, color: '#000', margin: 0, letterSpacing: '-0.01em', textTransform: 'none' }}>Customers</h1>
                
                <div style={{ display: 'flex', gap: 16, width: viewMode === 'mobile' ? '100%' : 'auto', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: viewMode === 'mobile' ? 'auto' : '280px' }}>
                        <input 
                            type="text" 
                            placeholder="Search customers..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 12px 12px 36px', border: '1px solid #D1D5DB', // High contrast
                                borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: '#fff',
                                boxSizing: 'border-box', transition: 'all 0.2s', fontFamily: FONT
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = '#000'}
                            onBlur={e => e.currentTarget.style.borderColor = '#D1D5DB'}
                        />
                        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <button onClick={handleExport} style={{
                        background: 'none', border: 'none', fontSize: '0.85rem', fontWeight: 700, color: '#000', cursor: 'pointer', fontFamily: FONT, textTransform: 'none'
                    }}>
                        Export
                    </button>
                </div>
            </div>

            {/* Customers Layout: Table for Desktop, 1-Column Grid for Mobile */}
            {viewMode === 'desktop' ? (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                                <th style={{ fontFamily: FONT, padding: '14px 20px', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>Customer</th>
                                <th style={{ fontFamily: FONT, padding: '14px 20px', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>Email</th>
                                <th style={{ fontFamily: FONT, padding: '14px 20px', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>Location</th>
                                <th style={{ fontFamily: FONT, padding: '14px 20px', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>Orders</th>
                                <th style={{ fontFamily: FONT, padding: '14px 20px', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textAlign: 'right' }}>Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length > 0 ? filteredCustomers.map((c, idx) => (
                                <tr key={c.id} style={{ borderBottom: idx === filteredCustomers.length - 1 ? 'none' : '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 700, color: '#000' }}>{c.name}</td>
                                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: '#666' }}>{c.email}</td>
                                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: '#666' }}>{c.location}</td>
                                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', color: '#000' }}>{c.ordersCount}</td>
                                    <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: 700, color: '#000', textAlign: 'right' }}>₹{c.totalSpent.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>No customers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                    {filteredCustomers.length > 0 ? filteredCustomers.map((c) => (
                        <div key={c.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#000' }}>{c.name}</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#000' }}>₹{c.totalSpent.toLocaleString()}</div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 12 }}>{c.email}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid #f9fafb' }}>
                                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{c.location}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666' }}>{c.ordersCount} {c.ordersCount === 1 ? 'Order' : 'Orders'}</div>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: 12 }}>No customers found.</div>
                    )}
                </div>
            )}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Customers;
