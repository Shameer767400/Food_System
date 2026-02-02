import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UtensilsCrossed, Mail, Lock, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, ping, API } = useAuth(); // Modified: Added ping, API
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pinging, setPinging] = useState(false); // Added: pinging state
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    hostel_id: ''
  });

  // Added: handlePing function
  const handlePing = async () => {
    setPinging(true);
    try {
      await ping();
      toast.success('API connection successful!');
    } catch (error) {
      console.error('Ping error:', error);
      const message = error.response?.data?.detail || error.message || 'API connection failed';
      toast.error(message);
    } finally {
      setPinging(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const user = await login(formData.email, formData.password);
        toast.success('Welcome back!');
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        const user = await register(formData.email, formData.password, formData.name, formData.hostel_id);
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.detail || error.message || 'Authentication failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        <img
          src={require('../assets/images/login-hero.png')}
          alt="Students dining"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-slate-900/40"></div>
        <div className="relative z-10 flex flex-col justify-center px-24 text-white">
          <div className="flex items-center gap-3 mb-8">
            <UtensilsCrossed className="w-12 h-12 text-white" />
            <h1 className="text-5xl font-bold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
              MealWise
            </h1>
          </div>
          <p className="text-xl text-slate-100 leading-relaxed mb-10 max-w-lg">
            Smart meal booking for hostel students. Reduce waste, improve planning, and never miss a meal.
          </p>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
              <span className="text-lg font-medium">Book meals within time windows</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
              <span className="text-lg font-medium">Track your booking history</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
              <span className="text-lg font-medium">Raise tickets for any issues</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h2>
            <p className="text-slate-500 text-lg">
              {isLogin ? 'Sign in to book your meals' : 'Join MealWise today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                      type="text"
                      data-testid="register-name-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all outline-none"
                      placeholder="Your name"
                      required={!isLogin}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Hostel ID (Optional)</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                      type="text"
                      data-testid="register-hostel-input"
                      value={formData.hostel_id}
                      onChange={(e) => setFormData({ ...formData, hostel_id: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all outline-none"
                      placeholder="H-123"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="email"
                  data-testid="login-email-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="password"
                  data-testid="login-password-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              data-testid="login-submit-btn"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>

            {/* Added: Test Connection button */}
            <button
              type="button"
              onClick={handlePing}
              disabled={pinging}
              className="w-full bg-white text-slate-900 border border-slate-200 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {pinging ? 'Testing...' : 'Test Connection'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-500 font-medium hover:text-orange-500 transition-colors"
            >
              {isLogin ? (
                <span>Don't have an account? <span className="text-orange-500 font-bold underline underline-offset-4">Sign up</span></span>
              ) : (
                <span>Already have an account? <span className="text-orange-500 font-bold underline underline-offset-4">Sign in</span></span>
              )}
            </button>
          </div>

          {/* Admin Demo Credentials */}
          <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Demo Credentials</p>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-600">Admin</span>
                <span className="text-xs text-slate-500">admin@hostel.com / admin123</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-600">Student</span>
                <span className="text-xs text-slate-500">student@hostel.com / student123</span>
              </div>
            </div>
          {/* API URL Info */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex flex-col items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-1">Target API URL</p>
              <code className="text-[10px] text-slate-600 font-mono break-all text-center">{API}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
