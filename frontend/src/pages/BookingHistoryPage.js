import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { ArrowLeft, Calendar, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/student/booking-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (error) {
      toast.error('Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
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
                 Booking History
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">View all your past meal bookings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[32px] p-24 text-center shadow-sm">
            <UtensilsCrossed className="w-20 h-20 text-slate-100 mx-auto mb-8" />
            <h3 className="text-2xl font-bold text-[#0F172A] mb-4">No bookings yet</h3>
            <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Start booking your meals to see them here</p>
            <button
              onClick={() => navigate('/meals')}
              className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 shadow-xl shadow-orange-500/30 transition-all active:scale-[0.98]"
            >
              Book a Meal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {history.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#0F172A] capitalize mb-1 group-hover:text-orange-500 transition-colors">
                      {booking.menu?.meal_type || 'Meal'}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(booking.menu?.date || new Date()), 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                  </div>
                  <span className="bg-green-50 text-green-600 border border-green-100 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Booked
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Selected Items</p>
                  <div className="flex flex-wrap gap-2">
                    {booking.items?.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-2 bg-slate-50 text-[#0F172A] px-4 py-2 rounded-xl text-sm font-bold border border-slate-100 group-hover:border-slate-200 transition-colors"
                      >
                        <span>{item.name}</span>
                        <span className="text-lg leading-none">
                          {item.category === 'veg' ? '🌱' : '🍗'}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
