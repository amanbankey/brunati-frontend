import React from 'react';
import { Edit2, Trash2, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BannerCard = ({ banner, onEdit, onDelete }) => {
    const FONT_ROBOTO_BOLD = '"Roboto", sans-serif';
    const FONT_ROBOTO_REGULAR = '"Roboto", sans-serif';

    const [isPending, setIsPending] = React.useState(false);

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        if (isPending) return;

        setIsPending(true);
        let shouldDelete = true;

        const toastId = toast((t) => (
            <div className="flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-300">
                <span className="text-sm font-normal" style={{ fontFamily: FONT_ROBOTO_REGULAR }}>Banner removed</span>
                <button
                    onClick={() => {
                        shouldDelete = false;
                        setIsPending(false);
                        toast.dismiss(t.id);
                        toast.success('Restored', { duration: 2000 });
                    }}
                    className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-bold border border-black hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
                    style={{ fontFamily: FONT_ROBOTO_BOLD }}
                >
                    Undo
                </button>
            </div>
        ), {
            duration: 6000,
            position: 'bottom-center',
            style: { background: '#000', color: '#fff', padding: '12px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }
        });

        // Effect for delayed execution
        setTimeout(() => {
            if (shouldDelete) {
                onDelete(banner._id || banner.id);
            }
        }, 6000);
    };

    if (isPending) return null;

    // Ensure image URL is handled properly (handling both local path and proxy)
    const backendUrl = import.meta.env.VITE_API_URL;
    const imgKey = banner.imageUrl || banner.image;
    const imageUrl = imgKey?.startsWith('http')
        ? imgKey
        : (imgKey ? `${backendUrl}/${imgKey}` : null);

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative group font-roboto h-64 w-full">
            <div className="relative w-full h-full bg-[#F4F6F8] overflow-hidden">
                {imageUrl ? (
                    <>
                        <img
                            src={imageUrl}
                            alt={banner?.title || 'Banner'}
                            className="h-full w-full object-cover"
                        />
                        {/* Luxury Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${(banner?.title || banner?.subtitle) ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}></div>

                        {/* Content Overlay */}
                        {(banner?.title || banner?.subtitle) && (
                            <div className="absolute inset-x-0 bottom-0 p-5 pb-12 flex flex-col justify-end select-none">
                                {banner?.title && (
                                    <h3
                                        className="text-white text-lg font-bold tracking-tight mb-1"
                                        style={{ fontFamily: FONT_ROBOTO_BOLD }}
                                    >
                                        {banner?.title}
                                    </h3>
                                )}
                                {banner?.subtitle && (
                                    <p
                                        className="text-white/90 text-sm font-normal line-clamp-2"
                                        style={{ fontFamily: FONT_ROBOTO_REGULAR }}
                                    >
                                        {banner?.subtitle}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Camera size={24} strokeWidth={1.5} />
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute bottom-4 left-5 z-20 flex items-center">
                    {banner?.active ? (
                        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-emerald-600 shadow-sm border border-black/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ fontFamily: FONT_ROBOTO_BOLD }}>Active</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-gray-500 shadow-sm border border-black/5">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ fontFamily: FONT_ROBOTO_BOLD }}>Inactive</span>
                        </div>
                    )}
                </div>

                {/* Top-Right Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(banner); }}
                        className="w-10 h-10 flex items-center justify-center bg-white text-black hover:bg-black hover:text-white transition-all rounded-full shadow-md"
                        title="Edit"
                    >
                        <Edit2 size={16} strokeWidth={2} />
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="w-10 h-10 flex items-center justify-center bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full shadow-md"
                        title="Delete"
                    >
                        <Trash2 size={16} strokeWidth={2} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BannerCard;
