import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API } from '../contexts/AuthContext';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await axios.get(`${API}/student/menus`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenus(response.data);
    } catch (error) {
      toast.error('Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  const getMealImage = (mealType) => {
    const images = {
      breakfast: require('../assets/images/breakfast.png'),
      lunch: require('../assets/images/lunch.png'),
      dinner: require('../assets/images/lunch.png') // Using lunch image for dinner as well
    };
    return images[mealType] || images.lunch;
  };

  const getStatusBadge = (menu) => {
    if (menu.user_selected) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          Booked
        </span>
      );
    }
    
    if (menu.selection_window?.allowed) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-medium">
          <Clock className="w-3.5 h-3.5" />
          Booking Open
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-xs font-medium">
        <XCircle className="w-3.5 h-3.5" />
        Window Closed
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#0F172A] rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div className="h-10 w-px bg-slate-200"></div>
              <div>
                <h1 className="text-xl font-bold text-[#0F172A] leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  MealWise
                </h1>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Student Portal</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#0F172A]">{user?.name}</p>
                <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
              </div>
              <div className="bg-green-50 border border-green-100 px-4 py-2 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-green-700">Welcome back!</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={logout}
                  className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-red-500"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-[#0F172A] mb-2 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-base text-slate-500">Book your meals and manage your preferences</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <button
            onClick={() => navigate('/meals')}
            className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all group text-center"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <UtensilsCrossed className="w-6 h-6 text-[#FF6B35]" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">Book a Meal</h3>
            <p className="text-sm text-slate-500">Select your meals for today and tomorrow</p>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all group text-center"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <History className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">Booking History</h3>
            <p className="text-sm text-slate-500">View your past meal bookings</p>
          </button>

          <button
            onClick={() => navigate('/raise-ticket')}
            className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all group text-center"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Ticket className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">Raise Ticket</h3>
            <p className="text-sm text-slate-500">Report issues or complaints</p>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all group text-center"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <User className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A] mb-1">My Profile</h3>
            <p className="text-sm text-slate-500">Update your profile and details</p>
          </button>
        </div>

        {/* Available Meals Section */}
        <div>
          <h3 className="text-xl font-bold text-[#0F172A] mb-6 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Available Meals
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : menus.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-20 text-center shadow-sm">
              <UtensilsCrossed className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <p className="text-xl text-slate-500 font-medium">No menus published for today or tomorrow</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 group"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={getMealImage(menu.meal_type)}
                      alt={menu.meal_type}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute top-6 right-6 scale-110">
                      {getStatusBadge(menu)}
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <h4 className="text-3xl font-extrabold text-[#0F172A] capitalize mb-1">{menu.meal_type}</h4>
                        <p className="text-slate-500 font-semibold">{format(new Date(menu.date), 'EEEE, MMM d')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-500 font-bold text-lg">{menu.items?.length || 0} items</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">available</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {menu.items?.map((item) => (
                        <span 
                          key={item.id} 
                          className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold border border-slate-100 group-hover:border-slate-200 transition-colors"
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>

                    {menu.selection_window?.allowed ? (
                      <button
                        onClick={() => navigate('/meals', { state: { selectedMenu: menu } })}
                        className="w-full bg-orange-500 text-white py-5 rounded-2xl font-bold text-lg hover:bg-orange-600 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                      >
                        {menu.user_selected ? (
                          <>
                            <CheckCircle className="w-6 h-6" />
                            <span>Modify Booking</span>
                          </>
                        ) : (
                          <span>Book Now</span>
                        )}
                      </button>
                    ) : (
                      <div className="w-full bg-slate-50 text-slate-400 py-5 rounded-2xl font-bold text-lg text-center border border-slate-100 flex items-center justify-center gap-2">
                        <Clock className="w-6 h-6" />
                        <span>Selection Window Closed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
