import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { ArrowLeft, Camera, User, Home, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function StudentProfilePage() {
  const navigate = useNavigate();
  const { token, user: authUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    room_number: '',
    profile_picture: ''
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (authUser) {
      setProfileData({
        name: authUser.name || '',
        email: authUser.email || '',
        room_number: authUser.room_number || '',
        profile_picture: authUser.profile_picture || ''
      });
      setPreviewImage(authUser.profile_picture || null);
    }
  }, [authUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setProfileData({ ...profileData, profile_picture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.patch(
        `${API}/profile`,
        {
          name: profileData.name,
          room_number: profileData.room_number,
          profile_picture: profileData.profile_picture
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Profile updated successfully!');
      await refreshUser();
    } catch (error) {
      toast.error('Failed to update profile');
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
                My Profile
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Manage your account</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture Section */}
          <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-sm">
            <h2 className="text-lg font-bold text-[#0F172A] mb-6">Profile Picture</h2>
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                      <User className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                <label 
                  htmlFor="profile-pic-upload"
                  className="absolute bottom-0 right-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-all shadow-lg group-hover:scale-110"
                >
                  <Camera className="w-5 h-5 text-white" />
                </label>
                <input
                  type="file"
                  id="profile-pic-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-slate-500 mt-4 text-center">
                Click the camera icon to upload a new photo
              </p>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#0F172A] mb-6">Personal Details</h2>
            
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-3 ml-1">
                Full Name <span className="text-orange-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0F172A] focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-3 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full pl-12 pr-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1">Email cannot be changed</p>
            </div>

            {/* Room Number */}
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-3 ml-1">
                Room Number
              </label>
              <div className="relative">
                <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={profileData.room_number}
                  onChange={(e) => setProfileData({ ...profileData, room_number: e.target.value })}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0F172A] focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="e.g., 205"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 shadow-xl shadow-orange-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
