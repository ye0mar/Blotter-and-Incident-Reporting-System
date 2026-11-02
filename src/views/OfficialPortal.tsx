import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BlotterRecord, BlotterStatus } from '../types';
import { 
  FileText, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Printer, 
  Calendar, 
  Plus, 
  MessageSquare, 
  Paperclip, 
  X,
  UserCheck
} from 'lucide-react';

export const OfficialPortal: React.FC = () => {
  const { 
    currentUser, 
    blotters, 
    users, 
    updateBlotterStatus, 
    assignBlotter, 
    addBlotterNote, 
    addBlotterAttachment, 
    addSchedule,
    setDossierBlotter, 
    setActiveTab,
    activeTab
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedBlotter, setSelectedBlotter] = useState<BlotterRecord | null>(null);

  // Note modal state
  const [noteText, setNoteText] = useState('');
  
  // Schedule hearing modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleLocation, setScheduleLocation] = useState('Barangay Session Hall, Sta. Ana');
  const [scheduleType, setScheduleType] = useState<'Hearing' | 'Mediator' | 'Investigating' | 'Follow-up'>('Hearing');
  const [scheduleNotes, setScheduleNotes] = useState('');

  // Stats
  const total = blotters.length;
  const pending = blotters.filter(b => b.status === 'pending').length;
  const investigating = blotters.filter(b => b.status === 'investigating').length;
  const resolved = blotters.filter(b => b.status === 'resolved').length;

  const filteredBlotters = blotters.filter(b => {
    const matchesSearch = 
      b.blotter_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.complainant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.respondent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.incident_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.incident_location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesType = typeFilter === 'all' || b.incident_type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesType;
  });

  const kagawadList = users.filter(u => (u.role === 'kagawad' || u.role === 'captain' || u.role === 'staff') && u.status === 'active');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlotter || !noteText.trim()) return;
    addBlotterNote(selectedBlotter.id, noteText.trim());
    // Refresh selected blotter
    const updated = blotters.find(b => b.id === selectedBlotter.id);
    if (updated) setSelectedBlotter(updated);
    setNoteText('');
  };

  const handleCreateHearing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlotter || !scheduleDate) return;
    addSchedule({
      blotter_id: selectedBlotter.blotter_id,
      blotter_record_id: selectedBlotter.id,
      schedule_date: scheduleDate,
      location: scheduleLocation,
      action_type: scheduleType,
      notes: scheduleNotes,
      complainant_name: selectedBlotter.complainant_name,
      respondent_name: selectedBlotter.respondent_name,
      incident_type: selectedBlotter.incident_type
    });
    setIsScheduleModalOpen(false);
    setScheduleNotes('');
    alert(`Hearing scheduled successfully for case ${selectedBlotter.blotter_id}!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      
      {/* View 1: Dashboard Overview (If activeTab === 'dashboard') */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#0d3461] to-[#1e4d99] rounded-2xl p-6 sm:p-8 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-blue-200 bg-white/10 px-3 py-1 rounded-full">
                  Official Dashboard — {currentUser?.role.toUpperCase()}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold mt-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Welcome, {currentUser?.full_name}
                </h2>
                <p className="text-sm text-blue-100/90 mt-1">
                  Barangay Sta. Ana, Pateros Blotter &amp; Incident Case Management
                </p>
              </div>
              <button
                onClick={() => setActiveTab('create-report')}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-colors shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>File New Blotter Report</span>
              </button>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
              <div className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total Incidents</div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{total}</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
              <div className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Pending Cases</div>
              <div className="text-3xl font-extrabold text-amber-600 tracking-tight">{pending}</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
              <div className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Under Investigation</div>
              <div className="text-3xl font-extrabold text-blue-600 tracking-tight">{investigating}</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
              <div className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Resolved Cases</div>
              <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">{resolved}</div>
            </div>
          </div>

          {/* Quick Recent Incidents Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Recent Incident Reports</h3>
              <button
                onClick={() => setActiveTab('all-incidents')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                View All &rarr;
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {blotters.slice(0, 5).map(b => (
                <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 font-mono">{b.blotter_id}</span>
                      <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        b.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      <span className="font-medium text-slate-900">{b.incident_type}</span> — Complainant:{' '}
                      <span className="font-semibold">{b.complainant_name}</span> vs Respondent:{' '}
                      <span className="font-semibold">{b.respondent_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => setSelectedBlotter(b)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => setDossierBlotter(b)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Print Official Record"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View 2: All Incidents (If activeTab === 'all-incidents') */}
      {activeTab === 'all-incidents' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">All Incident Records</h2>
              <p className="text-sm text-slate-500 mt-0.5">Comprehensive blotter registry and case investigation</p>
            </div>
            <button
              onClick={() => setActiveTab('create-report')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0d3461] hover:bg-[#1a457d] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>New Blotter Entry</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search blotter ID, complainant, respondent, location..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm rounded-xl border border-transparent focus:border-blue-400 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-100/80 text-sm rounded-xl border border-transparent focus:border-blue-400 focus:outline-none text-slate-700 font-medium"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-100/80 text-sm rounded-xl border border-transparent focus:border-blue-400 focus:outline-none text-slate-700 font-medium"
              >
                <option value="all">All Incident Types</option>
                <option value="Theft">Theft / Pagnanakaw</option>
                <option value="Physical">Physical Injury / Pananakit</option>
                <option value="Noise">Noise / Panggugulo</option>
                <option value="Trespassing">Trespassing</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-semibold uppercase text-slate-600 bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Blotter ID</th>
                  <th className="px-6 py-3.5">Complainant</th>
                  <th className="px-6 py-3.5">Respondent</th>
                  <th className="px-6 py-3.5">Incident Type</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5">Assigned Official</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredBlotters.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No blotter records found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredBlotters.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 font-mono whitespace-nowrap">
                        {b.blotter_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                        {b.complainant_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                        {b.respondent_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {b.incident_type}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <select
                          value={b.status}
                          onChange={e => updateBlotterStatus(b.id, e.target.value as BlotterStatus)}
                          className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full border border-transparent focus:outline-none cursor-pointer ${
                            b.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                            b.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="investigating">Investigating</option>
                          <option value="resolved">Resolved</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                        <select
                          value={b.assigned_to || ''}
                          onChange={e => assignBlotter(b.id, parseInt(e.target.value))}
                          className="bg-slate-100 px-2 py-1 rounded-md text-xs font-medium text-slate-700 border border-slate-200"
                        >
                          <option value="">-- Unassigned --</option>
                          {kagawadList.map(k => (
                            <option key={k.id} value={k.id}>
                              {k.full_name} ({k.role})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedBlotter(b)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>
                          <button
                            onClick={() => setDossierBlotter(b)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Print Official Case Record"
                          >
                            <Printer className="w-4 h-4" />
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

      {/* Blotter Details Modal */}
      {selectedBlotter && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedBlotter(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-lg font-bold text-[#0d3461]">{selectedBlotter.blotter_id}</span>
              <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                selectedBlotter.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                selectedBlotter.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {selectedBlotter.status}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500">Complainant:</span>
                  <div className="font-semibold text-slate-900">{selectedBlotter.complainant_name}</div>
                  <div className="text-xs text-slate-500">{selectedBlotter.complainant_phone || 'No phone'}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Respondent:</span>
                  <div className="font-semibold text-slate-900">{selectedBlotter.respondent_name}</div>
                  <div className="text-xs text-slate-500">{selectedBlotter.respondent_phone || 'No phone'}</div>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Narrative Description</span>
                <p className="mt-1 text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs sm:text-sm leading-relaxed">
                  {selectedBlotter.incident_description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-slate-500 font-medium">Location:</span> {selectedBlotter.incident_location}</div>
                <div><span className="text-slate-500 font-medium">Datetime:</span> {selectedBlotter.incident_datetime}</div>
              </div>

              {/* Action Buttons: Schedule Hearing & Print */}
              <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-100">
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule Hearing / Mediation</span>
                </button>
                <button
                  onClick={() => {
                    setDossierBlotter(selectedBlotter);
                  }}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Case Record</span>
                </button>
              </div>

              {/* Notes List */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Investigation Notes</h4>
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {selectedBlotter.notes && selectedBlotter.notes.length > 0 ? (
                    selectedBlotter.notes.map(n => (
                      <div key={n.id} className="p-2.5 bg-slate-50 rounded-lg text-xs">
                        <div className="flex justify-between font-semibold text-slate-800 mb-0.5">
                          <span>{n.noted_by_name}</span>
                          <span className="text-[10px] text-slate-400">{n.created_at}</span>
                        </div>
                        <p className="text-slate-600">{n.notes}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">No notes added yet.</div>
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add an investigation finding or note..."
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0d3461] hover:bg-blue-900 text-white text-xs font-semibold rounded-lg"
                  >
                    Add Note
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Hearing Schedule Modal */}
      {isScheduleModalOpen && selectedBlotter && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Schedule Hearing</h3>
            <p className="text-xs text-slate-500 mb-4">Set mediation or conciliation date for {selectedBlotter.blotter_id}</p>

            <form onSubmit={handleCreateHearing} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hearing Date &amp; Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Action Type</label>
                <select
                  value={scheduleType}
                  onChange={e => setScheduleType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Hearing">Hearing</option>
                  <option value="Mediator">Mediator</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={scheduleLocation}
                  onChange={e => setScheduleLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={scheduleNotes}
                  onChange={e => setScheduleNotes(e.target.value)}
                  placeholder="Summon both parties for first amicable settlement meeting."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
