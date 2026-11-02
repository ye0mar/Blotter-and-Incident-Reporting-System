import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BlotterRecord, BlotterStatus } from '../types';
import { Search, Edit3, Trash2, X, Archive } from 'lucide-react';

export const KagawadPortal: React.FC = () => {
  const { 
    blotters, 
    schedules, 
    updateBlotterStatus, 
    archiveBlotter,
    addBlotterNote, 
    deleteBlotter, 
    activeTab 
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Edit / Investigation Modal State
  const [editingBlotter, setEditingBlotter] = useState<BlotterRecord | null>(null);
  const [modalStatus, setModalStatus] = useState<BlotterStatus>('investigating');
  const [modalNotes, setModalNotes] = useState('');

  // Filtered blotters for Investigate view
  const filteredBlotters = blotters.filter(b => {
    const matchesSearch = 
      b.blotter_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.complainant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.incident_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.incident_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesType = typeFilter === 'all' || b.incident_type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenEdit = (b: BlotterRecord) => {
    setEditingBlotter(b);
    setModalStatus(b.status);
    setModalNotes(b.notes && b.notes.length > 0 ? b.notes[b.notes.length - 1].notes : '');
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlotter) return;

    if (modalStatus !== editingBlotter.status) {
      updateBlotterStatus(editingBlotter.id, modalStatus);
    }

    if (modalNotes.trim()) {
      addBlotterNote(editingBlotter.id, modalNotes.trim());
    }

    setEditingBlotter(null);
  };

  // Helper for schedule date badge
  const formatScheduleBadge = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 font-sans">
      
      {/* ================= VIEW 1: INVESTIGATE ================= */}
      {activeTab === 'kagawad-investigate' && (
        <div className="bg-white rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border-0 p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>Blotter Records</h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Search, filter, and manage incident reports</p>
          </div>

          {/* Search & Filter Row */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#1E293B]" style={{ fontFamily: "'Quicksand', sans-serif" }}>Report Period</div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ID, name, location..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-[#E2E8F0] focus:border-[#6366F1] focus:outline-none text-[#334155]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-[#E2E8F0] focus:border-[#6366F1] focus:outline-none text-[#334155] font-medium cursor-pointer"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-[#E2E8F0] focus:border-[#6366F1] focus:outline-none text-[#334155] font-medium cursor-pointer"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <option value="all">All Types</option>
                  <option value="Theft">Theft</option>
                  <option value="Loss Item">Loss Item</option>
                  <option value="Violence">Violence</option>
                  <option value="Noise">Noise</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Incident ID</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Date</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Type</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Complainant</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Location</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Update by</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider text-center" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Status</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider text-center" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredBlotters.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      No blotter records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredBlotters.map(b => (
                    <tr key={b.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6 font-semibold text-[#1E293B] whitespace-nowrap" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {b.blotter_id}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {b.incident_datetime ? new Date(b.incident_datetime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'April 30, 2026'}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-[#334155]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {b.incident_type}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-[#1E293B] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {b.complainant_name}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {b.incident_location}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-[#64748B] text-xs" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {b.assigned_to_name ? `Kagawad / ${b.assigned_to_name.replace('Kagawad ', '')}` : (b.updated_by_name ? `Staff / ${b.updated_by_name}` : 'Staff 1 / Rumeo')}
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        {b.status === 'investigating' ? (
                          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#DBEAFE] text-[#1E40AF]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Investigating
                          </span>
                        ) : b.status === 'pending' ? (
                          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Pending
                          </span>
                        ) : b.status === 'archived' ? (
                          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Archived
                          </span>
                        ) : (
                          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#065F46]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Resolved
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="text-[#64748B] hover:text-[#6366F1] p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit / Investigate Blotter"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {b.status !== 'archived' && (
                            <button
                              onClick={() => archiveBlotter(b.id)}
                              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                              title={b.status === 'resolved' ? 'Archive Case' : 'Only resolved cases can be archived'}
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete incident report ${b.blotter_id}?`)) {
                                deleteBlotter(b.id);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete incident"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: MY SCHEDULE ================= */}
      {activeTab === 'kagawad-schedule' && (
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>Schedule</h2>

          <div className="bg-white rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                  <tr>
                    <th className="w-32 py-4 px-6 text-center font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', sans-serif" }}>Badge</th>
                    <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', sans-serif" }}>Blotter ID</th>
                    <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', sans-serif" }}>Type Incident</th>
                    <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', sans-serif" }}>Complainant</th>
                    <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', sans-serif" }}>Respondent</th>
                    <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', sans-serif" }}>Date &amp; Time</th>
                    <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', sans-serif" }}>Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                  {schedules.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        No schedules recorded.
                      </td>
                    </tr>
                  ) : (
                    schedules.map(sched => (
                      <tr key={sched.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                        <td className="p-3 text-center align-middle">
                          <span className="bg-[#E0E7FF] text-[#3730A3] font-bold text-xs py-1.5 px-3 rounded-full inline-block" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                            {formatScheduleBadge(sched.schedule_date)}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-[#1E293B] whitespace-nowrap" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {sched.blotter_id}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-[#334155]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {sched.incident_type || 'Pagnanakaw'}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-[#1E293B] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {sched.complainant_name || 'Delacruz, Juan Antonio'}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-[#334155]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {sched.respondent_name || 'Penduko, Filipe'}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {sched.schedule_date}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {sched.location}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Investigation Modal */}
      {editingBlotter && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setEditingBlotter(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Update Case: {editingBlotter.blotter_id}
              </h3>
              <p className="text-xs text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Complainant: {editingBlotter.complainant_name} vs {editingBlotter.respondent_name}
              </p>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  Case Status
                </label>
                <select
                  value={modalStatus}
                  onChange={e => setModalStatus(e.target.value as BlotterStatus)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1] bg-white text-[#334155] font-medium cursor-pointer"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <option value="pending">Pending</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  Kagawad Notes / Investigation Update
                </label>
                <textarea
                  rows={4}
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  placeholder="Isulat dito ang resulta ng imbestigasyon..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1] text-[#334155]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBlotter(null)}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold rounded-full hover:bg-slate-50 transition-colors"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] text-xs sm:text-sm font-semibold rounded-full shadow-xs transition-colors"
                  style={{ fontFamily: "'Quicksand', sans-serif" }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
