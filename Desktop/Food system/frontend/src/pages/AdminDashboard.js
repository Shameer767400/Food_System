import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { UtensilsCrossed, LogOut, Plus, BarChart3, Ticket, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLORS = ['#F97316', '#0F172A', '#22C55E', '#3B82F6', '#A855F7', '#EC4899'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [menus, setMenus] = useState([]);
  const [selectedMenuAnalytics, setSelectedMenuAnalytics] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menusRes, ticketsRes] = await Promise.all([
        axios.get(`${API}/admin/menus`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/tickets`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setMenus(menusRes.data);
      setTickets(ticketsRes.data);
      
      // Load analytics for first menu
      if (menusRes.data.length > 0) {
        fetchMenuAnalytics(menusRes.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuAnalytics = async (menuId) => {
    try {
      const response = await axios.get(`${API}/admin/analytics/${menuId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedMenuAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    }
  };

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const totalMenus = menus.length;

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
                  MealWise Admin
                </h1>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Management Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#0F172A]">{user?.name}</p>
                <p className="text-xs text-slate-500 font-medium">Administrator</p>
              </div>
              <div className="bg-green-50 border border-green-100 px-4 py-2 rounded-xl flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-green-700">Welcome back!</span>
              </div>
              <button
                onClick={logout}
                className="p-2.5 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-red-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Menus</p>
                <p className="text-4xl font-extrabold text-[#0F172A]">{totalMenus}</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Open Tickets</p>
                <p className="text-4xl font-extrabold text-[#0F172A]">{openTickets}</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Ticket className="w-5 h-5 text-[#FF6B35]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Bookings</p>
                <p className="text-4xl font-extrabold text-[#0F172A]">
                  {selectedMenuAnalytics?.total_selections || 0}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-6 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/admin/menu-management')}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all group text-left flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                <Plus className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A] mb-1">Manage Menus</h3>
                <p className="text-sm text-slate-500">Create and manage meal menus for students</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/tickets')}
              className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all group text-left flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                <Ticket className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A] mb-1">View Tickets</h3>
                <p className="text-sm text-slate-500">Manage student complaints and feedback</p>
              </div>
            </button>
          </div>
        </div>

        {/* Analytics Section */}
        {selectedMenuAnalytics && (
          <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-sm relative overflow-hidden group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Menu Analytics
                </h2>
                <p className="text-sm text-slate-500 font-semibold capitalize">
                  {selectedMenuAnalytics.menu.meal_type} - {format(new Date(selectedMenuAnalytics.menu.date), 'MMMM d, yyyy')}
                </p>
              </div>

              <div className="flex flex-col gap-2 min-w-[300px]">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Menu</label>
                <select
                  onChange={(e) => fetchMenuAnalytics(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0F172A] focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none appearance-none cursor-pointer transition-all"
                >
                  {menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.meal_type} - {format(new Date(menu.date), 'MMM d, yyyy')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Users</p>
                <p className="text-4xl font-extrabold text-[#0F172A]">{selectedMenuAnalytics.total_users}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Total Selections</p>
                <p className="text-4xl font-extrabold text-[#0F172A]">{selectedMenuAnalytics.total_selections}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-white rounded-2xl p-2">
                <h3 className="text-xl font-bold text-[#0F172A] mb-6 px-4">Item Demand</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={selectedMenuAnalytics.items}>
                    <XAxis 
                      dataKey="item_name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                      angle={-45} 
                      textAnchor="end" 
                      height={80} 
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'}}
                    />
                    <Bar dataKey="count" fill="#F97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl p-2">
                <h3 className="text-xl font-bold text-[#0F172A] mb-6 px-4">Distribution</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={selectedMenuAnalytics.items}
                      dataKey="percentage"
                      nameKey="item_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      stroke="none"
                    >
                      {selectedMenuAnalytics.items.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'}}
                    />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cooking Quantities for Chef */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#0F172A]">Cooking Quantities</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Recommended portions for chef based on selections</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-2">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Total Portions: {selectedMenuAnalytics.total_selections}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedMenuAnalytics.items.map((item, index) => (
                  <div key={index} className="bg-white border-2 border-slate-100 rounded-2xl p-6 hover:border-orange-200 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            item.category === 'veg' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <h4 className="font-bold text-[#0F172A] text-sm">{item.item_name}</h4>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{item.percentage.toFixed(1)}% selection rate</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-center shadow-lg shadow-orange-500/20">
                      <p className="text-xs font-bold text-orange-100 uppercase tracking-wider mb-1">Prepare</p>
                      <p className="text-3xl font-extrabold text-white">{item.count}</p>
                      <p className="text-xs font-bold text-orange-100 mt-1">portions</p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Out of {selectedMenuAnalytics.total_users} users</span>
                        <span className="font-bold text-orange-500">{item.count} selected</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Item Selection Percentages Table */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-[#0F172A] mb-6">Item Selection Statistics</h3>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Item Name</th>
                      <th className="text-center px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Selections</th>
                      <th className="text-center px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Percentage</th>
                      <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Visual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMenuAnalytics.items.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              item.category === 'veg' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className="font-bold text-[#0F172A]">{item.item_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-white rounded-lg font-bold text-[#0F172A] border border-slate-200">
                            {item.count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-4 py-1.5 bg-orange-50 text-orange-600 rounded-lg font-extrabold border border-orange-100">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
