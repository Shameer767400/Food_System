import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { ArrowLeft, CheckCircle, XCircle, Clock, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminTicketsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API}/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Tickets data:', response.data);
      response.data.forEach((ticket, i) => {
        console.log(`Ticket ${i} photos:`, ticket.photos);
      });
      setTickets(response.data);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      await axios.patch(
        `${API}/admin/tickets/${ticketId}?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Ticket status updated');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
      in_progress: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
      closed: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle }
    };
    
    const badge = badges[status] || badges.open;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 ${badge.color} border px-3 py-1 rounded-full text-xs font-medium`}>
        <Icon className="w-3.5 h-3.5" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      basic: 'text-slate-600',
      medium: 'text-orange-600',
      critical: 'text-red-600'
    };
    return colors[urgency] || colors.basic;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              data-testid="back-to-admin-btn"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Manage Tickets
              </h1>
              <p className="text-sm text-slate-600">Review and resolve student issues</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent mx-auto"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-xl p-12 text-center">
            <p className="text-slate-600">No tickets found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                data-testid={`ticket-${ticket.id}`}
                className="bg-white border border-slate-100 rounded-xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{ticket.category}</h3>
                      <span className={`text-xs font-medium uppercase ${getUrgencyColor(ticket.urgency)}`}>
                        {ticket.urgency}
                      </span>
                    </div>
                    {ticket.sub_category && (
                      <p className="text-sm text-slate-600 mb-2">{ticket.sub_category}</p>
                    )}
                    
                    {/* Student Info */}
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-600">
                            {ticket.student_name ? ticket.student_name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{ticket.student_name || 'Unknown Student'}</p>
                          <p className="text-xs text-slate-500">Room: {ticket.room_number || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-slate-500">
                      {format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-slate-700">{ticket.description}</p>
                </div>

                {/* Photos Section */}
                {ticket.photos && ticket.photos.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Attached Photos ({ticket.photos.length})
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {ticket.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`Ticket photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-slate-100 hover:border-orange-300 transition-all cursor-pointer"
                            onClick={() => window.open(photo, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white rounded-full p-2 shadow-lg">
                                <ImageIcon className="w-4 h-4 text-orange-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ticket.status !== 'closed' && (
                  <div className="flex gap-2">
                    {ticket.status === 'open' && (
                      <button
                        onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                        data-testid={`mark-progress-${ticket.id}`}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all"
                      >
                        Mark In Progress
                      </button>
                    )}
                    <button
                      onClick={() => updateTicketStatus(ticket.id, 'closed')}
                      data-testid={`mark-resolved-${ticket.id}`}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
