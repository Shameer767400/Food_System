import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORIES = [
  'Food Quality',
  'Service',
  'Hygiene',
  'Billing',
  'Other'
];

const URGENCY_LEVELS = ['basic', 'medium', 'critical'];

export default function RaiseTicketPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    sub_category: '',
    urgency: 'basic',
    description: '',
    photos: []
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Convert selected files to base64
      const photoPromises = selectedFiles.map(fileObj => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(fileObj.file);
        });
      });

      const base64Photos = await Promise.all(photoPromises);

      // Submit with base64 photos
      await axios.post(
        `${API}/tickets`,
        {
          ...formData,
          photos: base64Photos
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Ticket submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to submit ticket');
    } finally {
      setSubmitting(false);
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
                Raise a Ticket
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Report an issue or complaint</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-10 shadow-sm space-y-10">
          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-3 ml-1">
              Category <span className="text-orange-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0F172A] focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none appearance-none cursor-pointer transition-all"
              required
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sub Category */}
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-3 ml-1">
              Sub Category
            </label>
            <input
              type="text"
              value={formData.sub_category}
              onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0F172A] focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300"
              placeholder="Optional"
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-3 ml-1">
              Urgency <span className="text-orange-500">*</span>
            </label>
            <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              {URGENCY_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: level })}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm capitalize transition-all duration-300 ${
                    formData.urgency === level
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-3 ml-1">
              Photos {selectedFiles.length > 0 && <span className="text-orange-500">({selectedFiles.length} selected)</span>}
            </label>
            
            {/* File Preview Grid */}
            {selectedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={file.preview} 
                      alt={file.name}
                      className="w-full h-32 object-cover rounded-xl border-2 border-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-xl">
                      <p className="text-white text-xs font-medium truncate">{file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-100 rounded-3xl p-12 text-center bg-slate-50/50 hover:bg-slate-50 hover:border-orange-300 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-bold mb-1">Upload photos (optional)</p>
              <p className="text-xs text-slate-400 font-medium mb-6 tracking-wide">Files up to 5MB in size</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="inline-block px-8 py-3 bg-white border border-slate-200 text-orange-500 rounded-xl font-bold text-sm hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer"
              >
                Choose Files
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-3 ml-1">
              Description <span className="text-orange-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[#0F172A] focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-300 resize-none"
              placeholder="Describe your issue in detail..."
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 shadow-xl shadow-orange-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
