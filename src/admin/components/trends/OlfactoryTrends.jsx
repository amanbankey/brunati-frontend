import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, Video, Package, AlertCircle, Image as ImageIcon, Play, Plus, X, Loader2 } from 'lucide-react';
import { useStorefront } from '../../../context/StorefrontContext';
import { trendService } from '../../../services/trendService';
import { toast } from 'react-hot-toast';
import '../../../components/landing/OlfactoryTrends.css';

const FONT = '"Inter", "Helvetica Neue", sans-serif';

const OlfactoryTrends = ({ isMobile }) => {
    const { inventoryProducts } = useStorefront();

    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Add form state
    const [selectedProduct, setSelectedProduct] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Play/pause
    const [playingId, setPlayingId] = useState(null);
    const videoRefs = useRef({});

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTrend, setEditingTrend] = useState(null);
    const [editProduct, setEditProduct] = useState('');
    const [editVideoFile, setEditVideoFile] = useState(null);
    const [editVideoPreview, setEditVideoPreview] = useState('');

    useEffect(() => {
        fetchTrends();
    }, []);

    const fetchTrends = async () => {
        setLoading(true);
        try {
            const res = await trendService.getAllTrends();
            if (res.status) {
                setTrends(res.data);
            }
        } catch (error) {
            toast.error('Failed to fetch trends');
        } finally {
            setLoading(false);
        }
    };

    /* ── Video Play/Pause ── */
    const handleVideoClick = (id) => {
        const video = videoRefs.current[id];
        if (!video) return;
        if (video.paused) { video.play(); setPlayingId(id); }
        else { video.pause(); setPlayingId(null); }
    };

    /* ── Add Trend ── */
    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (file) { setVideoFile(file); setVideoPreview(URL.createObjectURL(file)); }
    };

    const handleAddTrend = async () => {
        if (!selectedProduct) { toast.error('Please select a product'); return; }
        if (!videoFile) { toast.error('Please upload a video file'); return; }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('productId', selectedProduct);
            formData.append('video', videoFile);
            
            const res = await trendService.createTrend(formData);
            if (res.status) {
                toast.success('Trend added successfully');
                fetchTrends();
                setIsAddModalOpen(false);
                setVideoFile(null);
                setVideoPreview('');
                setSelectedProduct('');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to add trend');
        } finally {
            setIsSaving(false);
        }
    };

    /* ── Delete ── */
    const handleDeleteTrend = async (id) => {
        if (!window.confirm('Delete this trend?')) return;
        try {
            const res = await trendService.deleteTrend(id);
            if (res.status) {
                toast.success('Trend removed');
                setTrends(prev => prev.filter(t => t._id !== id));
            }
        } catch (error) {
            toast.error('Failed to delete trend');
        }
    };

    /* ── Edit Modal ── */
    const handleOpenEdit = (trend) => {
        setEditingTrend(trend);
        setEditProduct(trend.productId?._id || trend.productId || '');
        setEditVideoPreview(trend.videoUrl || '');
        setEditVideoFile(null);
        setIsEditModalOpen(true);
    };

    const handleEditVideoUpload = (e) => {
        const file = e.target.files[0];
        if (file) { setEditVideoFile(file); setEditVideoPreview(URL.createObjectURL(file)); }
    };

    const handleSaveEdit = async () => {
        if (!editingTrend) return;
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('productId', editProduct);
            if (editVideoFile) {
                formData.append('video', editVideoFile);
            }

            const res = await trendService.updateTrend(editingTrend._id, formData);
            if (res.status) {
                toast.success('Trend updated');
                fetchTrends();
                setIsEditModalOpen(false);
                setEditingTrend(null);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update trend');
        } finally {
            setIsSaving(false);
        }
    };


    /* ── Render ── */
    return (
        <div style={{ width: '100%' }}>
            {/* Section header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start', marginBottom: 24, flexDirection: isMobile ? 'column' : 'row', gap: 16, textAlign: isMobile ? 'center' : 'left' }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontFamily: FONT, fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 600, margin: '0 0 4px 0', color: '#202223' }}>Olfactory Trends</h2>
                    <p style={{ fontFamily: FONT, fontSize: '0.82rem', color: '#6D7175', margin: 0 }}>Manage featured video trends and associate them with your luxury products.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 8, padding: isMobile ? '10px 20px' : '9px 18px', fontSize: '0.85rem', fontWeight: 600, fontFamily: FONT, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
                >
                    <Plus size={15} /> Add Trend
                </button>
            </div>

            {/* ── Add Trend Modal ── */}
            {isAddModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setIsAddModalOpen(false)} />
                    <div style={{ position: 'relative', background: '#fff', width: '100%', maxWidth: 480, borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', overflow: 'hidden' }}>

                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F4F6F8' }}>
                            <h2 style={{ fontFamily: FONT, fontSize: '1.05rem', fontWeight: 600, color: '#202223', margin: 0 }}>Add Trend</h2>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6D7175', fontSize: 20 }}>✕</button>
                        </div>

                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#202223', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Package size={14} /> Select Product
                                </label>
                                {inventoryProducts?.length > 0 ? (
                                    <select
                                        value={selectedProduct}
                                        onChange={e => setSelectedProduct(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #C9CCCF', fontFamily: FONT, fontSize: '0.9rem', outline: 'none', background: '#fff', cursor: 'pointer' }}
                                        onFocus={e => e.target.style.border = '1px solid #000'}
                                        onBlur={e => e.target.style.border = '1px solid #C9CCCF'}
                                    >
                                        <option value="">-- Select a perfume --</option>
                                        {inventoryProducts.map(p => (
                                            <option key={p._id || p.id} value={p._id || p.id}>
                                                {p.name} {p.category ? `(${p.category})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div style={{ padding: '10px 14px', background: '#FAFAFA', border: '1px solid #E5E7EB', borderRadius: 8, color: '#6D7175', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <AlertCircle size={14} /> Loading products...
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#202223', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Video size={14} /> Upload Trend Video
                                </label>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    {videoPreview && (
                                        <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB', flexShrink: 0, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Video size={20} color="#fff" />
                                        </div>
                                    )}
                                    <label style={{ flex: 1, padding: '12px 0', border: '1px dashed #C9CCCF', borderRadius: 8, textAlign: 'center', fontSize: '0.85rem', fontFamily: FONT, color: '#202223', background: '#FAFAFA', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                                        <ImageIcon size={16} /> {videoFile ? videoFile.name : 'Select Video File...'}
                                        <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #E5E7EB', paddingTop: 20 }}>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    style={{ flex: 1, background: '#fff', border: '1px solid #C9CCCF', borderRadius: 8, padding: 10, fontSize: '0.85rem', fontWeight: 600, fontFamily: FONT, cursor: 'pointer', color: '#202223' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddTrend}
                                    disabled={isSaving}
                                    style={{ flex: 2, background: isSaving ? '#C9CCCF' : '#000', color: '#fff', border: 'none', borderRadius: 8, padding: 10, fontSize: '0.85rem', fontWeight: 600, fontFamily: FONT, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                                >
                                    {isSaving && <Loader2 className="animate-spin" size={16} />}
                                    {isSaving ? 'Saving...' : 'Save Trend'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Trend Cards ── */}
            {loading ? (
                <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <Loader2 className="animate-spin" size={32} color="#000" />
                    <p style={{ fontFamily: FONT, fontSize: '0.85rem', color: '#6D7175' }}>Retrieving trends...</p>
                </div>
            ) : trends.length === 0 ? (
                <div style={{ padding: '48px 20px', background: '#FAFAFA', border: '1px dashed #C9CCCF', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Video size={32} style={{ color: '#C9CCCF', marginBottom: 16 }} />
                    <p style={{ fontFamily: FONT, fontSize: '0.9rem', color: '#6D7175', margin: 0, fontStyle: 'italic' }}>No trends yet. Click "Add Trend" to create one.</p>
                </div>
            ) : (

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: isMobile ? 16 : 24, paddingBottom: 40 }}>
                    {trends.map(trend => (
                        <div key={trend._id} className="trend-card-admin" style={{ position: 'relative', margin: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>

                            {/* Video area */}
                            <div
                                className="trend-video-wrapper"
                                style={{ height: isMobile ? 300 : 240, position: 'relative', cursor: trend.videoUrl ? 'pointer' : 'default' }}
                                onClick={() => trend.videoUrl && handleVideoClick(trend._id)}
                            >
                                {trend.videoUrl ? (
                                    <>
                                        <video
                                            ref={el => { if (el) videoRefs.current[trend._id] = el; }}
                                            src={trend.videoUrl}
                                            loop muted playsInline
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: playingId === trend._id ? 'transparent' : 'rgba(0,0,0,0.25)', transition: 'background 0.2s' }}>
                                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: playingId === trend._id ? 0 : 1, transition: 'opacity 0.2s' }}>
                                                <Play size={18} color="#111" style={{ marginLeft: 2 }} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Video color="#fff" size={32} />
                                    </div>
                                )}
                            </div>

                            {/* Product name */}
                            <div style={{ padding: '10px 14px', background: '#fff', textAlign: 'center' }}>
                                <p style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#202223', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {trend.productId?.name || 'Unknown Product'}
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 8, zIndex: 10 }}>
                                <button onClick={e => { e.stopPropagation(); handleOpenEdit(trend); }} style={{ background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.12)' }} title="Edit">
                                    <Edit2 size={15} color="#6D7175" />
                                </button>
                                <button onClick={e => { e.stopPropagation(); handleDeleteTrend(trend._id); }} style={{ background: '#FEE2E2', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.12)' }} title="Delete">
                                    <Trash2 size={15} color="#D82C0D" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Edit Modal ── */}
            {isEditModalOpen && editingTrend && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setIsEditModalOpen(false)} />
                    <div style={{ position: 'relative', background: '#fff', width: '100%', maxWidth: 480, borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', overflow: 'hidden' }}>

                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F4F6F8' }}>
                            <h2 style={{ fontFamily: FONT, fontSize: '1.05rem', fontWeight: 600, color: '#202223', margin: 0 }}>Edit Trend</h2>
                            <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6D7175', fontSize: 20 }}>✕</button>
                        </div>

                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                            {editVideoPreview && (
                                <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E7EB', position: 'relative', height: 160, background: '#000' }}>
                                    <video src={editVideoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ color: '#fff', fontSize: '0.72rem', fontFamily: FONT, background: 'rgba(0,0,0,0.55)', padding: '4px 10px', borderRadius: 20 }}>Current video</span>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#202223', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Video size={14} /> Replace Video <span style={{ fontWeight: 400, color: '#6D7175' }}>(optional)</span>
                                </label>
                                <label style={{ padding: '10px 0', border: '1px dashed #C9CCCF', borderRadius: 8, textAlign: 'center', fontSize: '0.85rem', fontFamily: FONT, color: '#202223', background: '#FAFAFA', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                                    <ImageIcon size={15} /> {editVideoFile ? editVideoFile.name : 'Select new video...'}
                                    <input type="file" accept="video/*" onChange={handleEditVideoUpload} style={{ display: 'none' }} />
                                </label>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#202223', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Package size={14} /> Change Product <span style={{ fontWeight: 400, color: '#6D7175' }}>(optional)</span>
                                </label>
                                {inventoryProducts?.length > 0 ? (
                                    <select
                                        value={editProduct}
                                        onChange={e => setEditProduct(e.target.value)}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #C9CCCF', fontFamily: FONT, fontSize: '0.9rem', outline: 'none', background: '#fff', cursor: 'pointer' }}
                                        onFocus={e => e.target.style.border = '1px solid #000'}
                                        onBlur={e => e.target.style.border = '1px solid #C9CCCF'}
                                    >
                                        <option value="">-- Keep current: {editingTrend.productId?.name} --</option>
                                        {inventoryProducts.map(p => (
                                            <option key={p._id || p.id} value={p._id || p.id}>
                                                {p.name} {p.category ? `(${p.category})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div style={{ padding: '10px 14px', background: '#FAFAFA', border: '1px solid #E5E7EB', borderRadius: 8, color: '#6D7175', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <AlertCircle size={14} /> Loading products...
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #E5E7EB', paddingTop: 20 }}>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    style={{ flex: 1, background: '#fff', border: '1px solid #C9CCCF', borderRadius: 8, padding: 10, fontSize: '0.85rem', fontWeight: 600, fontFamily: FONT, cursor: 'pointer', color: '#202223' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                    style={{ flex: 2, background: isSaving ? '#C9CCCF' : '#000', color: '#fff', border: 'none', borderRadius: 8, padding: 10, fontSize: '0.85rem', fontWeight: 600, fontFamily: FONT, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                                >
                                    {isSaving && <Loader2 className="animate-spin" size={16} />}
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OlfactoryTrends;
