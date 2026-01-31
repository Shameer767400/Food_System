import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { ArrowLeft, Clock, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MealSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    if (location.state?.selectedMenu) {
      const menu = location.state.selectedMenu;
      setSelectedMenu(menu);
      setSelectedItems(menu.selected_item_ids || []);
    }
  }, [location.state]);

  const fetchMenus = async () => {
    try {
      const response = await axios.get(`${API}/student/menus`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenus(response.data);
      
      // Auto-select first available menu if none selected
      if (!location.state?.selectedMenu && response.data.length > 0) {
        const openMenu = response.data.find(m => m.selection_window?.allowed);
        if (openMenu) {
          setSelectedMenu(openMenu);
          setSelectedItems(openMenu.selected_item_ids || []);
        }
      }
    } catch (error) {
      toast.error('Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = (itemId) => {
    if (!selectedMenu?.selection_window?.allowed) {
      toast.error('Selection window is closed');
      return;
    }

    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API}/student/selections`,
        {
          menu_id: selectedMenu.id,
          selected_item_ids: selectedItems
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Meal booked successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to book meal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-orange-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-10 w-px bg-slate-200"></div>
            <div>
              <h1 className="text-xl font-bold text-[#0F172A] leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                 Book Your Meal
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Select items from the menu</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Menu Selector */}
        <div className="mb-12">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Select Meal</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {menus.map((menu) => (
              <button
                key={menu.id}
                onClick={() => {
                  setSelectedMenu(menu);
                  setSelectedItems(menu.selected_item_ids || []);
                }}
                disabled={!menu.selection_window?.allowed}
                className={`p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${
                  selectedMenu?.id === menu.id
                    ? 'border-orange-500 bg-orange-50/30'
                    : menu.selection_window?.allowed
                    ? 'border-white bg-white hover:border-orange-200 shadow-sm'
                    : 'border-transparent bg-slate-50 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-extrabold text-[#0F172A] capitalize">{menu.meal_type}</h3>
                  {menu.user_selected && (
                    <div className="bg-green-500 rounded-full p-1 shadow-lg shadow-green-500/30">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-slate-500 font-semibold mb-6">{format(new Date(menu.date), 'MMM d, yyyy')}</p>
                {menu.selection_window?.allowed ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider">
                    <Clock className="w-4 h-4" />
                    <span>Open for booking</span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Window closed</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Item Selection */}
        {selectedMenu ? (
          <div className="bg-white border border-slate-100 rounded-[32px] p-10 shadow-sm">
            <div className="mb-10">
              <h2 className="text-3xl font-extrabold text-[#0F172A] mb-2 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {selectedMenu.meal_type.charAt(0).toUpperCase() + selectedMenu.meal_type.slice(1)} Menu
              </h2>
              <p className="text-lg text-slate-500 font-medium">
                Select your preferred items ({selectedItems.length} selected)
              </p>
            </div>

            {!selectedMenu.selection_window?.allowed && (
              <div className="mb-10 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                   <Clock className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-red-700 font-bold">
                  Selection window is closed. You cannot modify this booking.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-[#0F172A]">
              {selectedMenu.items?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemToggle(item.id)}
                  className={`p-6 rounded-3xl border-2 transition-all cursor-pointer group flex items-start justify-between gap-6 ${
                    selectedItems.includes(item.id)
                      ? 'border-orange-500 bg-orange-50/20'
                      : 'border-slate-50 bg-slate-50/50 hover:border-orange-200 hover:bg-white'
                  } ${!selectedMenu.selection_window?.allowed && 'opacity-60 cursor-not-allowed'}`}
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors">{item.name}</h3>
                    {item.description && (
                      <p className="text-slate-500 font-medium mb-4 leading-relaxed">{item.description}</p>
                    )}
                    <span className={`inline-block text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-lg ${
                      item.category === 'veg'
                        ? 'bg-green-50 text-green-600 border border-green-100'
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {item.category === 'veg' ? '🌱 Vegetarian' : '🍗 Non-Vegetarian'}
                    </span>
                  </div>
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                    selectedItems.includes(item.id)
                      ? 'border-orange-500 bg-orange-500 shadow-lg shadow-orange-500/30'
                      : 'border-slate-200 bg-white'
                  }`}>
                    {selectedItems.includes(item.id) && (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedMenu.selection_window?.allowed && (
              <div className="flex gap-6 max-w-2xl mx-auto">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-white border border-slate-200 text-slate-600 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || selectedItems.length === 0}
                  className="flex-1 bg-orange-500 text-white py-5 rounded-2xl font-bold text-lg hover:bg-orange-600 shadow-xl shadow-orange-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-[32px] p-24 text-center shadow-sm">
            <UtensilsCrossed className="w-20 h-20 text-slate-100 mx-auto mb-8" />
            <p className="text-2xl text-slate-400 font-bold">Please select a meal to view items</p>
          </div>
        )}
      </main>
    </div>
  );
}
