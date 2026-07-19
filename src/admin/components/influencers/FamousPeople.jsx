import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Loader2, X, Save, Image as ImageIcon } from 'lucide-react';
import { famousPeopleService } from '../../../services/famousPeopleService';
import { toast } from 'react-hot-toast';
import { compressImage } from '../../../utils/imageCompression';

const FONT = '"Inter", "Helvetica Neue", sans-serif';

const FamousPeople = ({ isMobile }) => {
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        profession: '',
        wearing: '',
        imageUrl: '' 
    });

    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchPeople();
    }, []);

    const fetchPeople = async () => {
        setLoading(true);
        try {
            const res = await famousPeopleService.getAll();
            if (res.status) {
                setPeople(res.data);
            }
        } catch (error) {
            toast.error('Failed to fetch entries');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (person = null) => {
        if (person) {
            setEditingPerson(person);
            setFormData({
                name: person.name || '',
                profession: person.profession || '',
                wearing: person.wearing || '',
                imageUrl: person.imageUrl || ''
            });
        } else {
            setEditingPerson(null);
            setFormData({ name: '', profession: '', wearing: '', imageUrl: '' });
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPerson(null);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsCompressing(true);
        try {
            const compressedFile = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.8 });
            setImageFile(compressedFile);
            const tempUrl = URL.createObjectURL(compressedFile);
            setFormData(prev => ({ ...prev, imageUrl: tempUrl }));
        } catch (error) {
            console.error('Image compression error:', error);
            setImageFile(file);
            setFormData(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
        } finally {
            setIsCompressing(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.profession) {
            toast.error('Name and profession are required');
            return;
        }

        setIsSaving(true);
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('profession', formData.profession);
            data.append('wearing', formData.wearing);
            if (imageFile) {
                data.append('image', imageFile);
            }

            if (editingPerson) {
                const res = await famousPeopleService.update(editingPerson._id, data);
                if (res.status) {
                    toast.success('Person updated successfully');
                    fetchPeople();
                    handleCloseModal();
                }
            } else {
                if (!imageFile) {
                    toast.error('Profile image is required');
                    setIsSaving(false);
                    return;
                }
                const res = await famousPeopleService.create(data);
                if (res.status) {
                    toast.success('Person added to directory');
                    fetchPeople();
                    handleCloseModal();
                }
            }
        } catch (error) {
            toast.error(error.message || 'Error saving person');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this person from the site?')) return;
        try {
            const res = await famousPeopleService.delete(id);
            if (res.status) {
                toast.success('Entry removed');
                setPeople(prev => prev.filter(p => p._id !== id));
            }
        } catch (error) {
            toast.error('Failed to remove entry');
        }
    };


    return (
        <div style={{ width: '100%' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start', marginBottom: 24, flexDirection: isMobile ? 'column' : 'row', gap: 16, textAlign: isMobile ? 'center' : 'left' }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontFamily: FONT, fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 600, margin: '0 0 4px 0', color: '#202223' }}>Famous People</h2>
                    <p style={{ fontFamily: FONT, fontSize: '0.82rem', color: '#6D7175', margin: 0 }}>Manage your brand ambassadors and site influencers.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 8, padding: isMobile ? '10px 20px' : '8px 16px', fontSize: '0.85rem', fontWeight: 600, fontFamily: FONT, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
                >
                    <Plus size={16} /> Add Person
                </button>
            </div>


            {loading ? (
                <div style={{ py: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                    <Loader2 className="animate-spin" size={32} color="#000" />
                    <p style={{ fontFamily: FONT, fontSize: '0.85rem', color: '#6D7175' }}>Retrieving famous people...</p>
                </div>
            ) : people.length === 0 ? (
                <div style={{ padding: '64px 20px', background: '#F4F6F8', border: '1px dashed #C9CCCF', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={32} style={{ color: '#8C9196', margin: '0 0 16px 0' }} />
                    <h3 style={{ fontFamily: FONT, fontSize: '1rem', fontWeight: 600, color: '#202223', margin: '0 0 4px 0' }}>No Entries Found</h3>
                    <p style={{ fontFamily: FONT, fontSize: '0.85rem', color: '#6D7175', margin: 0 }}>Add your first famous person entry to populate the storefront.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: isMobile ? 16 : 24, paddingBottom: 40 }}>
                    {people.map(person => (
                        <div key={person._id} className="influencer-card-admin" style={{ position: 'relative', margin: 0, border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                            <div className="influencer-image-placeholder" style={{ backgroundImage: person.imageUrl && person.imageUrl !== '/placeholder.png' ? `url(${person.imageUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260 }}>
                                {(!person.imageUrl || person.imageUrl === '/placeholder.png') && <User size={32} style={{ color: '#C9CCCF' }} />}
                            </div>
                            <div className="influencer-info">
                                <p className="influencer-name">{person.name}</p>
                                <p className="influencer-role">{person.profession}</p>
                                {person.wearing && <p className="influencer-wearing">WEARING: {person.wearing}</p>}
                            </div>
                            
                            {/* Actions overlay */}
                            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 10 }}>
                                <button onClick={() => handleOpenModal(person)} style={{ background: '#fff', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} title="Edit"><Edit2 size={16} color="#6D7175" /></button>
                                <button onClick={() => handleDelete(person._id)} style={{ background: '#FEE2E2', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} title="Delete"><Trash2 size={16} color="#D82C0D" /></button>
                            </div>
                        </div>
                    ))}

                </div>
            )}


            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={handleCloseModal}></div>
                    <div style={{ position: 'relative', background: '#fff', width: '100%', maxWidth: 460, borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F4F6F8' }}>
                            <h2 style={{ fontFamily: FONT, fontSize: '1.05rem', fontWeight: 600, color: '#202223', margin: 0 }}>
                                {editingPerson ? 'Edit Person' : 'Add New Person'}
                            </h2>
                            <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6D7175' }}><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#202223', display: 'block', marginBottom: 8 }}>Full Name</label>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Enter personality name..."
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #C9CCCF', fontSize: '0.9rem', fontFamily: FONT, outline: 'none' }}
                                    onFocus={e => e.target.style.border = '1px solid #000'}
                                    onBlur={e => e.target.style.border = '1px solid #C9CCCF'}
                                />
                            </div>

                            <div>
                                <label style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#202223', display: 'block', marginBottom: 8 }}>Profession / Role</label>
                                <input 
                                    type="text"
                                    value={formData.profession}
                                    onChange={(e) => setFormData({...formData, profession: e.target.value})}
                                    placeholder="e.g. Actor, Musician..."
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #C9CCCF', fontSize: '0.9rem', fontFamily: FONT, outline: 'none' }}
                                    onFocus={e => e.target.style.border = '1px solid #000'}
                                    onBlur={e => e.target.style.border = '1px solid #C9CCCF'}
                                />
                            </div>

                            <div>
                                <label style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#202223', display: 'block', marginBottom: 8 }}>Wearing (Perfume Name)</label>
                                <input 
                                    type="text"
                                    value={formData.wearing}
                                    onChange={(e) => setFormData({...formData, wearing: e.target.value})}
                                    placeholder="e.g. ILLUMINATI"
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #C9CCCF', fontSize: '0.9rem', fontFamily: FONT, outline: 'none' }}
                                    onFocus={e => e.target.style.border = '1px solid #000'}
                                    onBlur={e => e.target.style.border = '1px solid #C9CCCF'}
                                />
                            </div>

                            <div>
                                <label style={{ fontFamily: FONT, fontSize: '0.85rem', fontWeight: 600, color: '#202223', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <ImageIcon size={16}/> Profile Image
                                </label>
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                    {formData.imageUrl && !isCompressing && (
                                        <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                                            <img src={formData.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <label style={{ cursor: isCompressing ? 'wait' : 'pointer', flex: 1, padding: '10px 0', border: '1px dashed #C9CCCF', borderRadius: 8, textAlign: 'center', fontSize: '0.85rem', fontFamily: FONT, color: '#202223', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        {isCompressing ? <Loader2 className="animate-spin" size={16} /> : null}
                                        {isCompressing ? 'Optimizing...' : 'Browse Image...'}
                                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={isCompressing} />
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #E5E7EB', paddingTop: 20, marginTop: 4 }}>
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{ flex: 1, background: '#fff', border: '1px solid #C9CCCF', borderRadius: 8, padding: '10px', fontSize: '0.85rem', fontWeight: 600, fontFamily: FONT, cursor: 'pointer', color: '#202223' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    style={{ flex: 2, background: isSaving ? '#C9CCCF' : '#000', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: '0.85rem', fontWeight: 600, fontFamily: FONT, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                                >
                                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {isSaving ? 'Saving...' : (editingPerson ? 'Save Changes' : 'Add Person')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamousPeople;
