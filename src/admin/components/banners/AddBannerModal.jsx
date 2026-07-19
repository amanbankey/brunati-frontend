import React, { useState, useEffect } from 'react';
import { X, Camera, Save, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { compressImage } from '../../../utils/imageCompression';

const AddBannerModal = ({ isOpen, onClose, onSave, editingBanner, isSaving }) => {
    const FONT_ROBOTO_BOLD = '"Roboto", sans-serif';
    const FONT_ROBOTO_REGULAR = '"Roboto", sans-serif';

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        link: '',
        priority: 1,
        active: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isCompressing, setIsCompressing] = useState(false);

    useEffect(() => {
        if (isOpen) {

            document.body.style.overflow = 'hidden';
            const handleEsc = (e) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleEsc);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleEsc);
            };
        }
    }, [isOpen, onClose]);

    useEffect(() => {
        if (editingBanner) {
            setFormData({
                title: editingBanner.title || '',
                subtitle: editingBanner.subtitle || '',
                link: editingBanner.link || '',
                priority: editingBanner.priority || 1,
                active: editingBanner.active !== undefined ? editingBanner.active : true
            });
            const backendUrl = import.meta.env.VITE_API_URL;
            setPreviewUrl(editingBanner.imageUrl?.startsWith('http')
                ? editingBanner.imageUrl
                : `${backendUrl}/${editingBanner.imageUrl}`);
        } else {
            setFormData({
                title: '',
                subtitle: '',
                link: '',
                priority: 1,
                active: true
            });
            setImageFile(null);
            setPreviewUrl('');
        }
    }, [editingBanner, isOpen]);

    if (!isOpen) return null;

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsCompressing(true);
        try {
            // High quality for banners but still compressed
            const compressedFile = await compressImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.7 });
            setImageFile(compressedFile);
            setPreviewUrl(URL.createObjectURL(compressedFile));
        } catch (error) {
            console.error('Banner compression error:', error);
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        } finally {
            setIsCompressing(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!previewUrl && !editingBanner?.imageUrl) {
            toast.error('Banner image is required');
            return;
        }

        onSave(formData, imageFile, editingBanner?._id || null);
    };


    const isSaveDisabled = !previewUrl;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Body */}
            <div className="relative bg-white w-[95%] md:max-w-[460px] md:w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 scrollbar-thin scrollbar-thumb-gray-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-50 bg-gray-50/50">
                    <h2 className="text-xl font-bold tracking-tight text-black" style={{ fontFamily: FONT_ROBOTO_BOLD, textTransform: 'none' }}>
                        {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-black"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white font-roboto">
                    {/* Image Upload Area */}
                    <div className="relative group">
                        <input
                            type="file"
                            id="banner-image"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <label
                            htmlFor="banner-image"
                            className={`
                                relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed 
                                transition-all cursor-pointer overflow-hidden
                                ${previewUrl ? 'border-transparent h-40' : 'border-gray-200 h-32 md:h-36 bg-gray-50/30 hover:bg-gray-50 hover:border-black'}
                                ${isCompressing ? 'opacity-70 cursor-wait' : ''}
                            `}
                        >
                            {isCompressing ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="animate-spin text-black" size={24} />
                                    <span className="text-xs font-bold text-black">Optimizing...</span>
                                </div>
                            ) : previewUrl ? (
                                <>
                                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                        <Camera className="text-gray-400 group-hover:text-black transition-colors" size={20} />
                                    </div>
                                    <span className="text-xs font-normal text-gray-500 group-hover:text-black">
                                        Upload banner photo <span className="text-red-500">*</span>
                                    </span>
                                </div>
                            )}
                        </label>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="group">
                            <label className="text-[11px] font-bold text-gray-700 pl-1 mb-1.5 block" style={{ fontFamily: FONT_ROBOTO_BOLD }}>
                                Banner Title
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter title (optional)"
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:border-black transition-all text-sm font-normal text-gray-800 placeholder:text-gray-400 outline-none"
                            />
                        </div>

                        <div className="group">
                            <label className="text-[11px] font-bold text-gray-700 pl-1 mb-1.5 block" style={{ fontFamily: FONT_ROBOTO_BOLD }}>
                                Description
                            </label>
                            <textarea
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="Short description (optional)..."
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:border-black transition-all text-sm font-normal text-gray-800 placeholder:text-gray-400 resize-none h-20 outline-none"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 group">
                                <label className="text-[11px] font-bold text-gray-700 pl-1 mb-1.5 block" style={{ fontFamily: FONT_ROBOTO_BOLD }}>
                                    Link
                                </label>
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="/shop"
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:border-black transition-all text-sm font-normal text-gray-800 placeholder:text-gray-400 outline-none"
                                />
                            </div>
                            <div className="w-24 group">
                                <label className="text-[11px] font-bold text-gray-700 pl-1 mb-1.5 block" style={{ fontFamily: FONT_ROBOTO_BOLD }}>
                                    Priority
                                </label>
                                <input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl focus:border-black transition-all text-sm font-normal text-gray-800 text-center outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-white text-gray-500 hover:text-black py-3 rounded-xl font-bold border border-gray-200 hover:border-black transition-all text-sm"
                            style={{ fontFamily: FONT_ROBOTO_BOLD, textTransform: 'none' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaveDisabled || isSaving}
                            className={`flex-[2] py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isSaveDisabled || isSaving ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900 shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5'}`}
                            style={{ fontFamily: FONT_ROBOTO_BOLD, textTransform: 'none' }}
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {isSaving ? 'Saving...' : (editingBanner ? 'Save Changes' : 'Add Banner')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AddBannerModal;
