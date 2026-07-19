import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { categoryService } from '../../services/categoryService';


const FONT = '"Roboto", sans-serif';

const CategoryHeader = ({ title, subtitle }) => (
  <div className="mb-0">
    <h2 className="text-xl font-bold text-black tracking-tight" style={{ fontFamily: FONT }}>
      {title}
    </h2>
    {subtitle && (
      <p className="text-[13px] text-gray-500 font-normal mt-1" style={{ fontFamily: FONT }}>
        {subtitle}
      </p>
    )}
  </div>
);

const CategoryForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">

      <div className="bg-white rounded-xl shadow-2xl w-full md:max-w-[460px] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-lg text-black" style={{ fontFamily: FONT }}>
            {initialData ? 'Edit Category' : 'Add New Category'}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-black transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ fontFamily: FONT }}>Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}

              className="admin-input w-full p-3 text-sm focus:ring-1 focus:ring-black"
              style={{ fontFamily: FONT, borderRadius: '6px', border: '1px solid #D1D5DB' }}
              placeholder="e.g. Men's Fragrance"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ fontFamily: FONT }}>Description</label>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider" style={{ fontFamily: FONT }}>(Optional)</span>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="admin-input w-full p-3 text-sm resize-none"
              style={{ fontFamily: FONT, borderRadius: '6px', border: '1px solid #D1D5DB' }}
              placeholder="Brief description of this collection..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
              style={{ fontFamily: FONT }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-sm font-bold bg-black text-white rounded-lg hover:opacity-90 shadow-lg shadow-black/10 transition-all"
              style={{ fontFamily: FONT }}
            >
              {initialData ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CategoryList = ({ categories, onEdit, onDelete, onSelect }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-6">
    {categories.map((cat) => (
      <div 
        key={cat._id} 
        onClick={() => onSelect(cat.name)}
        className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-800 transition-all cursor-pointer flex flex-col justify-between shadow-none"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded bg-gray-50 flex items-center justify-center shrink-0">
               <span className="text-gray-900 text-lg font-bold" style={{ fontFamily: FONT }}>{cat.name[0]}</span>
          </div>
            <div className="text-left w-full">
            <div className="flex justify-between items-start">
               <h3 className="text-base font-bold text-black tracking-wide" style={{ fontFamily: FONT }}>{cat.name}</h3>

               <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={(e) => { e.stopPropagation(); onEdit(cat); }} className="text-gray-400 hover:text-black">
                   <Edit2 size={14} />
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); onDelete(cat); }} className="text-gray-400 hover:text-red-600">
                   <Trash2 size={14} />
                 </button>
               </div>
            </div>
            <p className="text-xs text-gray-500 font-normal line-clamp-2 mt-1 pr-6" style={{ fontFamily: FONT }}>
              {cat.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
);


const CategoryManagement = ({ onCategorySelect }) => {
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await categoryService.getAllCategories();
            if (res.status) setCategories(res.data);
        } catch (err) {
            console.error("Fetch categories error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data) => {
        try {
            setLoading(true);
            const res = await categoryService.createCategory(data);
            if (res.status) {
                setCategories([res.data, ...categories]);
                setShowForm(false);
            }
        } catch (err) {
            alert(err.message || "Failed to create category");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (data) => {
        try {
            setLoading(true);
            const res = await categoryService.updateCategory(editingCategory._id, data);
            if (res.status) {
                setCategories(categories.map(c => c._id === editingCategory._id ? res.data : c));
                setEditingCategory(null);
                setShowForm(false);
            }
        } catch (err) {
            alert(err.message || "Failed to update category");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (category) => {
        setConfirmDelete(category);
    };

    const executeDelete = async () => {
        try {
            setLoading(true);
            const res = await categoryService.deleteCategory(confirmDelete._id);
            if (res.status) {
                setCategories(categories.filter(c => c._id !== confirmDelete._id));
                setConfirmDelete(null);
            }
        } catch (err) {
            alert(err.message || "Failed to delete category");
        } finally {
            setLoading(false);
        }
    };


    const startEdit = (cat) => {
        setEditingCategory(cat);
        setShowForm(true);
    };

    return (
        <div className="w-full border-b border-gray-200 pb-8 px-6 md:px-0">
            <div className="flex justify-between items-start md:items-center">
                <CategoryHeader 
                    title="Product Categories" 
                    subtitle="Organize your inventory by high-level collections."
                />
                <button 
                    onClick={() => setShowForm(true)}
                    className="flex items-center justify-center gap-2 bg-black text-white px-5 h-[42px] rounded-lg hover:opacity-90 transition-colors font-bold text-sm shrink-0 shadow-none border-none"
                    style={{ fontFamily: FONT }}
                >
                    <Plus size={16} />
                    <span className="hidden md:inline">Add Category</span>
                </button>
            </div>

            {loading && categories.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                </div>
            ) : (
                <CategoryList 
                    categories={categories} 
                    onEdit={startEdit} 
                    onDelete={handleDelete}
                    onSelect={onCategorySelect}
                />
            )}

            {showForm && (
                <CategoryForm 
                    onSubmit={editingCategory ? handleUpdate : handleCreate} 
                    onCancel={() => { setShowForm(false); setEditingCategory(null); }}
                    initialData={editingCategory}
                />
            )}

            {/* Confirm Delete Popup */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl p-8 max-w-[400px] w-full text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: FONT }}>Confirm Delete</h3>
                        <p className="text-gray-500 mb-8 text-sm leading-relaxed" style={{ fontFamily: FONT }}>
                            Are you sure you want to delete <span className="font-bold text-black uppercase">{confirmDelete.name}</span>? 
                            This will remove the category from all products.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                                style={{ fontFamily: FONT }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={executeDelete}
                                className="flex-1 px-4 py-3 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl transition-all"
                                style={{ fontFamily: FONT }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default CategoryManagement;
