import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MenuManagementPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [menus, setMenus] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'veg',
    meal_type: 'breakfast',
    description: ''
  });
  
  const [newMenu, setNewMenu] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    meal_type: 'breakfast',
    item_ids: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, menusRes] = await Promise.all([
        axios.get(`${API}/admin/menu-items`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/admin/menus`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setMenuItems(itemsRes.data);
      setMenus(menusRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/menu-items`, newItem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Item created successfully');
      setShowItemModal(false);
      setNewItem({ name: '', category: 'veg', meal_type: 'breakfast', description: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await axios.delete(`${API}/admin/menu-items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Item deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleCreateMenu = async (e) => {
    e.preventDefault();
    if (newMenu.item_ids.length === 0) {
      toast.error('Please select at least one item');
      return;
    }
    
    try {
      await axios.post(`${API}/admin/menus`, newMenu, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Menu published successfully');
      setShowMenuModal(false);
      setNewMenu({ date: format(new Date(), 'yyyy-MM-dd'), meal_type: 'breakfast', item_ids: [] });
      fetchData();
    } catch (error) {
      toast.error('Failed to create menu');
    }
  };

  const toggleItemInMenu = (itemId) => {
    setNewMenu(prev => ({
      ...prev,
      item_ids: prev.item_ids.includes(itemId)
        ? prev.item_ids.filter(id => id !== itemId)
        : [...prev.item_ids, itemId]
    }));
  };

  const filteredItemsForMenu = menuItems.filter(item => item.meal_type === newMenu.meal_type);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-orange-500"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="h-10 w-px bg-slate-200"></div>
              <div>
                <h1 className="text-xl font-bold text-[#0F172A] leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Menu Management
                </h1>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Create items and publish menus</p>
              </div>
            </div>
            <button
              onClick={() => setShowMenuModal(true)}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              Publish Menu
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Menu Items Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#0F172A] tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Menu Items
            </h2>
            <button
              onClick={() => setShowItemModal(true)}
              className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-slate-300 transition-all flex items-center gap-2 active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-orange-500 transition-colors">{item.name}</h3>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-all text-slate-300 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {item.description && (
                  <p className="text-sm text-slate-500 font-medium mb-4 leading-relaxed line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-lg ${
                    item.category === 'veg'
                      ? 'bg-green-50 text-green-600 border border-green-100'
                      : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {item.category}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-100">
                    {item.meal_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Published Menus */}
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-6 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Published Menus
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all flex items-start justify-between group"
              >
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A] capitalize mb-1 group-hover:text-orange-500 transition-colors">{menu.meal_type}</h3>
                  <p className="text-slate-500 font-medium">{format(new Date(menu.date), 'EEEE, MMM d, yyyy')}</p>
                  <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">{menu.item_ids.length} items included</p>
                </div>
                <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Published
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Create Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">Add Menu Item</h3>
              <button onClick={() => setShowItemModal(false)}>
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Item Name</label>
                <input
                  type="text"
                  data-testid="item-name-input"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  data-testid="item-category-select"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Meal Type</label>
                <select
                  data-testid="item-mealtype-select"
                  value={newItem.meal_type}
                  onChange={(e) => setNewItem({ ...newItem, meal_type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description (Optional)</label>
                <textarea
                  data-testid="item-description-input"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  rows={3}
                />
              </div>
              
              <button
                type="submit"
                data-testid="submit-item-btn"
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98]"
              >
                Create Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Menu Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 my-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">Publish Menu</h3>
              <button onClick={() => setShowMenuModal(false)}>
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            
            <form onSubmit={handleCreateMenu} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <input
                    type="date"
                    data-testid="menu-date-input"
                    value={newMenu.date}
                    onChange={(e) => setNewMenu({ ...newMenu, date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Meal Type</label>
                  <select
                    data-testid="menu-mealtype-select"
                    value={newMenu.meal_type}
                    onChange={(e) => setNewMenu({ ...newMenu, meal_type: e.target.value, item_ids: [] })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Select Items ({newMenu.item_ids.length} selected)
                </label>
                <div className="border border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {filteredItemsForMenu.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No items available for {newMenu.meal_type}. Create items first.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredItemsForMenu.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newMenu.item_ids.includes(item.id)}
                            onChange={() => toggleItemInMenu(item.id)}
                            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-slate-600">{item.description}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.category === 'veg'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {item.category}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <button
                type="submit"
                data-testid="publish-menu-submit-btn"
                className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
                disabled={newMenu.item_ids.length === 0}
              >
                Publish Menu
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
