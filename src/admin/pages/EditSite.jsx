import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Camera, Plus, Loader2 } from 'lucide-react';
import BannerCard from '../components/banners/BannerCard';
import AddBannerModal from '../components/banners/AddBannerModal';
import { bannerService } from '../../services/bannerService';
import { toast } from 'react-hot-toast';
import OlfactoryTrends from '../components/trends/OlfactoryTrends';
import Reviews from '../components/reviews/Reviews';
import FamousPeople from '../components/influencers/FamousPeople';

const FONT = '"Roboto", sans-serif';

const EditSite = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'banners';
    const setActiveTab = (tab) => { setSearchParams({ tab }); };


    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // ── Backend banner state ──
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        
        if (activeTab === 'banners') {
            fetchBanners();
        }

        return () => window.removeEventListener('resize', handleResize);
    }, [activeTab]);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await bannerService.getAllBanners();
            if (res.status) {
                setBanners(res.data);
            }
        } catch (error) {
            toast.error('Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    // ── Banner CRUD (Backend) ──
    const handleSaveBanner = async (formData, imageFile, id) => {
        setIsSaving(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('subtitle', formData.subtitle);
            data.append('link', formData.link);
            data.append('priority', formData.priority);
            data.append('active', formData.active);
            if (imageFile) {
                data.append('image', imageFile);
            }

            if (id) {
                const res = await bannerService.updateBanner(id, data);
                if (res.status) {
                    toast.success('Banner updated');
                    fetchBanners();
                    setIsModalOpen(false);
                    setEditingBanner(null);
                }
            } else {
                const res = await bannerService.createBanner(data);
                if (res.status) {
                    toast.success('Banner added');
                    fetchBanners();
                    setIsModalOpen(false);
                    setEditingBanner(null);
                }
            }
        } catch (error) {
            toast.error(error.message || 'Error saving banner');
        } finally {
            setIsSaving(false);
        }
    };

    const [deletingIds, setDeletingIds] = useState(new Set());

    const handleDeleteBanner = async (id) => {
        if (deletingIds.has(id)) return;

        setDeletingIds(prev => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });

        // Optimistically remove from UI for instant feedback
        const originalBanners = [...banners];
        setBanners(prev => prev.filter(b => b._id !== id));

        try {
            const res = await bannerService.deleteBanner(id);
            if (res.status) {
                toast.success('Banner removed');
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            toast.error('Failed to remove banner');
            // Revert state on error
            setBanners(originalBanners);
        } finally {
            setDeletingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };


    const tabs = [
        { id: 'banners',     label: 'Storefront Banners' },
        { id: 'trends',      label: 'Olfactory Trends' },
        { id: 'reviews',     label: 'Storefront Testimonials' },
        { id: 'influencers', label: 'Famous People' },
    ];

    const getTabLabel = (tab) => tab.label;


    const renderSection = (id) => {
        switch (id) {
            case 'banners':
                return (
                    <div className="w-full">
                        <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'} mb-6 gap-4`}>
                            <div className="flex-1">
                                <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-black mb-1`}>Storefront Banners</h2>
                                <p className="text-sm font-normal text-gray-500">Manage the primary hero slides on your landing page.</p>
                            </div>
                            <button
                                onClick={() => { setEditingBanner(null); setIsModalOpen(true); }}
                                className={`${isMobile ? 'w-full py-3' : 'py-2.5 px-5'} bg-black text-white border-none rounded-lg text-sm font-bold cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors`}
                            >
                                <Plus size={16} /> Add Banner
                            </button>
                        </div>


                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-black" size={32} />
                                <p className="text-sm font-normal text-gray-500">Retrieving banners...</p>
                            </div>
                        ) : banners.length === 0 ? (
                            <div className="py-20 px-5 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm">
                                    <Camera size={22} className="text-gray-400" />
                                </div>
                                <p className="text-sm font-bold text-black m-0">No banners yet</p>
                                <p className="text-sm font-normal text-gray-500 m-0">Add your first banner to populate the storefront hero.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 w-full">
                                {banners.map(b => (
                                    <BannerCard
                                        key={b._id}
                                        banner={b}
                                        onEdit={(bm) => { setEditingBanner(bm); setIsModalOpen(true); }}
                                        onDelete={handleDeleteBanner}
                                    />
                                ))}
                            </div>
                        )}

                    </div>
                );
            case 'trends':     return <OlfactoryTrends isMobile={isMobile} />;
            case 'reviews':    return <Reviews isMobile={isMobile} />;
            case 'influencers': return <FamousPeople isMobile={isMobile} />;
            default: return null;
        }
    };

    return (
        <div className="w-full font-roboto px-6 md:px-0">
            {/* Page header + tabs */}
            <div style={{ 
                marginBottom: '32px', 
                textAlign: 'left'
            }}>

                <h1 style={{ 
                    fontFamily: FONT, 
                    fontSize: '1.875rem', 
                    fontWeight: 700, 
                    color: '#111827', 
                    margin: 0 
                }}>
                    Online Store
                </h1>
            </div>

            {/* Tabs Navigation */}
            <div className="mb-8">
                <div 
                    className="flex overflow-x-auto gap-4 flex-nowrap border-b border-gray-200 w-full no-scrollbar" 
                    style={{ 
                        scrollSnapType: 'x mandatory',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        overflowY: 'hidden'
                    }}
                >
                    <style>{`
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>


                    {tabs.map(t => {
                        const isActive = activeTab === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`px-4 py-3 text-sm focus:outline-none whitespace-nowrap flex-shrink-0 ${
                                    isActive 
                                    ? 'border-b-2 border-black font-bold text-black -mb-[1px]' 
                                    : 'border-b-2 border-transparent font-normal text-gray-500 hover:text-black hover:border-gray-200'
                                }`}
                                style={{ scrollSnapAlign: 'start' }}
                            >
                                {getTabLabel(t)}
                            </button>
                        );
                    })}
                </div>
            </div>



            <div className="mt-6">
                {renderSection(activeTab)}
            </div>

            <AddBannerModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingBanner(null); }}
                onSave={handleSaveBanner}
                editingBanner={editingBanner}
                isSaving={isSaving}
            />

        </div>
    );
};

export default EditSite;
