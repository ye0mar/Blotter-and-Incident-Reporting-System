import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Schedule, ScheduleActionType } from '../types';
import { Calendar, Plus, MapPin, Clock, Trash2, Search, FileText } from 'lucide-react';

export const SchedulesView: React.FC = () => {
  const { schedules, blotters, addSchedule, deleteSchedule, setDossierBlotter } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Add modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [blotterRecordId, setBlotterRecordId] = useState<number>(blotters[0]?.id || 1);
  const [scheduleDate, setScheduleDate] = useState('');
  const [location, setLocation] = useState('Barangay Session Hall, Sta. Ana');
  const [actionType, setActionType] = useState<ScheduleActionType>('Hearing');
  const [notes, setNotes] = useState('');

  const filtered = schedules.filter(s => {
    const matchesSearch = 
      s.blotter_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.complainant_name && s.complainant_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.respondent_name && s.respondent_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || s.action_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const blotter = blotters.find(b => b.id === blotterRecordId);
    if (!blotter || !scheduleDate) return;

    addSchedule({
      blotter_id: blotter.blotter_id,
      blotter_record_id: blotter.id,
      schedule_date: scheduleDate,
      location,
      action_type: actionType,
      notes,
      complainant_name: blotter.complainant_name,
      respondent_name: blotter.respondent_name,
      incident_type: blotter.incident_type
    });

    setIsAddOpen(false);
    setNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Hearing &amp; Mediation Schedules</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Lupong Tagapamayapa and barangay conciliation proceedings calendar
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0d3461] hover:bg-[#1a457d] text-white rounded-lg text-sm font-semibold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Hearing Date</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by case ID, complainant, respondent, location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm rounded-xl border border-transparent focus:border-blue-400 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3.5 py-2 bg-slate-100/80 text-sm rounded-xl border border-transparent focus:border-blue-400 focus:outline-none text-slate-700 font-medium"
        >
          <option value="all">All Action Types</option>
          <option value="Hearing">Hearing</option>
          <option value="Mediator">Mediator</option>
          <option value="Investigating">Investigating</option>
          <option value="Follow-up">Follow-up</option>
        </select>
      </div>

      {/* Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200/80">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">No hearings or mediation sessions found.</p>
          </div>
        ) : (
          filtered.map(item => {
            const dateObj = new Date(item.schedule_date);
            return (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-sm text-[#0d3461]">{item.blotter_id}</span>
                    <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      item.action_type === 'Hearing' ? 'bg-amber-100 text-amber-800' :
                      item.action_type === 'Mediator' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {item.action_type}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{dateObj.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-700 space-y-1">
                    <div>
                      <span className="text-slate-400">Complainant:</span>{' '}
                      <span className="font-semibold">{item.complainant_name || 'Complainant'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Respondent:</span>{' '}
                      <span className="font-semibold">{item.respondent_name || 'Respondent'}</span>
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 p-2 rounded-lg">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      const b = blotters.find(rec => rec.id === item.blotter_record_id);
                      if (b) setDossierBlotter(b);
                    }}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Blotter</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Cancel and delete this hearing schedule?')) {
                        deleteSchedule(item.id);
                      }
                    }}
                    className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Cancel schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Schedule Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Schedule New Hearing</h3>
            <p className="text-xs text-slate-500 mb-4">Set mediation date linked to a blotter case</p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blotter Case</label>
                <select
                  value={blotterRecordId}
                  onChange={e => setBlotterRecordId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {blotters.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.blotter_id} — {b.complainant_name} vs {b.respondent_name} ({b.incident_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date &amp; Time</label>
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
                  value={actionType}
                  onChange={e => setActionType(e.target.value as ScheduleActionType)}
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
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Summon both parties for first amicable settlement meeting."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[#0d3461] hover:bg-blue-900 text-white rounded-lg shadow-sm"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
