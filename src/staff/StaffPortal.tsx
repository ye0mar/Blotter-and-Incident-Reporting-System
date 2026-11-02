import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BlotterRecord, BlotterStatus, ScheduleActionType } from '../types';
import { downloadBlotterDocument, downloadBlotterPDF } from '../components/PrintDossierModal';
import { 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Upload, 
  Plus, 
  CheckCircle, 
  Calendar as CalendarIcon, 
  Clock, 
  FileText, 
  ArrowLeft, 
  ArrowRight,
  Eye,
  Download,
  Image as ImageIcon,
  MapPin,
  Printer,
  Check,
  Archive
} from 'lucide-react';

export const StaffPortal: React.FC = () => {
  const { 
    currentUser, 
    blotters, 
    schedules, 
    addBlotter, 
    updateBlotterStatus, 
    archiveBlotter,
    addBlotterNote, 
    deleteBlotter, 
    addSchedule,
    deleteSchedule,
    activeTab, 
    setActiveTab,
    setDossierBlotter
  } = useApp();

  // Search & Filter state for All Incident
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Edit / Investigation Modal State
  const [editingBlotter, setEditingBlotter] = useState<BlotterRecord | null>(null);
  const [modalStatus, setModalStatus] = useState<BlotterStatus>('investigating');
  const [modalNotes, setModalNotes] = useState('');

  // ----------------------------------------------------
  // SCHEDULE MODAL STATE (FOR STAFF SCHEDULE TAB)
  // ----------------------------------------------------
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [schedBlotterId, setSchedBlotterId] = useState<number>(blotters[0]?.id || 1);
  const [schedDate, setSchedDate] = useState('');
  const [schedLocation, setSchedLocation] = useState('Barangay Session Hall, Sta. Ana');
  const [schedType, setSchedType] = useState<ScheduleActionType>('Hearing');
  const [schedNotes, setSchedNotes] = useState('');

  // ----------------------------------------------------
  // LOCALSTORAGE AUTO-SAVE FOR CREATE REPORT FORM
  // ----------------------------------------------------
  const STAFF_AUTOSAVE_KEY = 'staff_create_report_autosave';

  const savedStaffDraft = React.useMemo(() => {
    try {
      const data = localStorage.getItem(STAFF_AUTOSAVE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Create Report Wizard State
  const [reportStep, setReportStep] = useState<number>(savedStaffDraft?.reportStep || 1);
  
  // Step 1: Complainant, Respondent, Incident Types
  const [compName, setCompName] = useState(savedStaffDraft?.compName || '');
  const [compAddress, setCompAddress] = useState(savedStaffDraft?.compAddress || '');
  const [compReportDateTime, setCompReportDateTime] = useState(savedStaffDraft?.compReportDateTime || new Date().toISOString().slice(0, 16));
  const [compPhone, setCompPhone] = useState(savedStaffDraft?.compPhone || '');
  const [respName, setRespName] = useState(savedStaffDraft?.respName || '');
  const [respAddress, setRespAddress] = useState(savedStaffDraft?.respAddress || '');
  const [respRelation, setRespRelation] = useState(savedStaffDraft?.respRelation || '');
  const [respPhone, setRespPhone] = useState(savedStaffDraft?.respPhone || '');
  const [selectedIncidentTypes, setSelectedIncidentTypes] = useState<string[]>(savedStaffDraft?.selectedIncidentTypes || ['Pagnanakaw']);
  const [otherType, setOtherType] = useState(savedStaffDraft?.otherType || '');

  // Step 2: Location, Date, Narrative, Actions
  const [incLocation, setIncLocation] = useState(savedStaffDraft?.incLocation || 'Alley 11, Barangay Sta. Ana, Pateros');
  const [incDateTime, setIncDateTime] = useState(savedStaffDraft?.incDateTime || new Date().toISOString().slice(0, 16));
  const [incNarrative, setIncNarrative] = useState(savedStaffDraft?.incNarrative || '');
  const [selectedBarangayActions, setSelectedBarangayActions] = useState<string[]>(savedStaffDraft?.selectedBarangayActions || ['Iskedyul ng Mediasyon']);
  const [otherAction, setOtherAction] = useState(savedStaffDraft?.otherAction || '');

  // Auto-Save Effect
  React.useEffect(() => {
    try {
      const draft = {
        reportStep,
        compName,
        compAddress,
        compReportDateTime,
        compPhone,
        respName,
        respAddress,
        respRelation,
        respPhone,
        selectedIncidentTypes,
        otherType,
        incLocation,
        incDateTime,
        incNarrative,
        selectedBarangayActions,
        otherAction
      };
      localStorage.setItem(STAFF_AUTOSAVE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('Failed to save staff report to localStorage:', e);
    }
  }, [
    reportStep,
    compName,
    compAddress,
    compReportDateTime,
    compPhone,
    respName,
    respAddress,
    respRelation,
    respPhone,
    selectedIncidentTypes,
    otherType,
    incLocation,
    incDateTime,
    incNarrative,
    selectedBarangayActions,
    otherAction
  ]);

  const clearStaffDraft = () => {
    try {
      localStorage.removeItem(STAFF_AUTOSAVE_KEY);
    } catch (e) {}
  };

  // Step 3: Evidence & Attachments
  const [evidenceItems, setEvidenceItems] = useState<{
    id: string;
    name: string;
    size?: string;
    previewUrl?: string;
    isImage: boolean;
  }[]>([
    {
      id: 'staff-ev-1',
      name: 'ebidensya_dokumento_1.jpg',
      size: '1.4 MB',
      isImage: true,
      previewUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80'
    }
  ]);
  const [isDraggingEvidence, setIsDraggingEvidence] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const [submitSuccessCaseId, setSubmitSuccessCaseId] = useState<string | null>(null);

  const handleAddEvidenceFiles = (files: FileList | File[]) => {
    Array.from(files).forEach(file => {
      const isImg = file.type.startsWith('image/');
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      if (isImg) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setEvidenceItems(prev => [
            ...prev,
            {
              id: 'ev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
              name: file.name,
              size: sizeStr,
              previewUrl: ev.target?.result as string,
              isImage: true
            }
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        setEvidenceItems(prev => [
          ...prev,
          {
            id: 'ev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
            name: file.name,
            size: sizeStr,
            isImage: false
          }
        ]);
      }
    });
  };

  // 4 Top Metric Cards
  const pendingCount = blotters.filter(b => b.status === 'pending').length;
  const investigatingCount = blotters.filter(b => b.status === 'investigating').length;
  const resolvedCount = blotters.filter(b => b.status === 'resolved').length;
  const resolutionRate = blotters.length > 0 ? Math.round((resolvedCount / blotters.length) * 100) : 0;

  // Filtered blotters for All Incident
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

  const toggleIncidentType = (t: string) => {
    setSelectedIncidentTypes(prev => 
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  const toggleBarangayAction = (a: string) => {
    setSelectedBarangayActions(prev => 
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  };

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

  const handleCreateReportSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!compName.trim() || !respName.trim()) {
      alert('Pakiusap, punan ang buong pangalan ng complainant at respondent.');
      return;
    }

    clearStaffDraft();

    const finalTypes = [...selectedIncidentTypes];
    if (otherType.trim()) finalTypes.push(otherType.trim());

    const finalActions = [...selectedBarangayActions];
    if (otherAction.trim()) finalActions.push(otherAction.trim());

    const created = addBlotter({
      complainant_name: compName.trim(),
      complainant_address: compAddress.trim() || 'Barangay Sta. Ana, Pateros',
      complainant_phone: compPhone.trim(),
      complainant_relation: respRelation.trim() || 'Complainant',
      respondent_name: respName.trim(),
      respondent_address: respAddress.trim() || 'Barangay Sta. Ana, Pateros',
      respondent_phone: respPhone.trim(),
      incident_type: finalTypes.join(', ') || 'General Blotter',
      incident_types: finalTypes,
      incident_location: incLocation.trim(),
      incident_datetime: incDateTime,
      incident_description: incNarrative.trim() || 'Detalyadong salaysay ng insidente na naitala ng Barangay Staff.',
      actions: finalActions,
      official_name: currentUser?.full_name || 'Barangay Staff',
      status: 'pending'
    });

    setSubmitSuccessCaseId(created.blotter_id);
    setReportStep(4);
  };

  const handleCreateScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const blotter = blotters.find(b => b.id === schedBlotterId) || blotters[0];
    if (!blotter || !schedDate) return;

    addSchedule({
      blotter_id: blotter.blotter_id,
      blotter_record_id: blotter.id,
      schedule_date: schedDate,
      location: schedLocation,
      action_type: schedType,
      notes: schedNotes,
      complainant_name: blotter.complainant_name,
      respondent_name: blotter.respondent_name,
      incident_type: blotter.incident_type
    });

    setIsAddScheduleOpen(false);
    setSchedNotes('');
    alert(`Hearing scheduled successfully for case ${blotter.blotter_id}!`);
  };

  const buildDraftRecord = (): BlotterRecord => {
    const finalTypes = [...selectedIncidentTypes];
    if (otherType.trim()) finalTypes.push(otherType.trim());

    const finalActions = [...selectedBarangayActions];
    if (otherAction.trim()) finalActions.push(otherAction.trim());

    return {
      id: 0,
      blotter_id: 'DRAFT-' + Math.floor(1000 + Math.random() * 9000),
      complainant_name: compName.trim() || 'Hindi tinukoy na Complainant',
      complainant_phone: compPhone.trim() || undefined,
      complainant_address: compAddress.trim() || undefined,
      complainant_relation: respRelation.trim() || 'Complainant',
      respondent_name: respName.trim() || 'Hindi tinukoy na Respondent',
      respondent_phone: respPhone.trim() || undefined,
      respondent_address: respAddress.trim() || undefined,
      incident_type: finalTypes.join(', ') || 'General Blotter',
      incident_types: finalTypes,
      incident_location: incLocation.trim() || 'Barangay Sta. Ana, Pateros',
      incident_datetime: incDateTime || new Date().toLocaleString(),
      incident_description: incNarrative.trim() || 'Walang ibinigay na detalyadong salaysay.',
      actions: finalActions,
      reported_at: compReportDateTime || new Date().toLocaleString(),
      status: 'pending',
      official_name: currentUser?.full_name || 'Barangay Staff',
      attachments: evidenceItems.map(ev => ({
        id: ev.id,
        file_name: ev.name,
        file_size: ev.size,
        previewUrl: ev.previewUrl,
        isImage: ev.isImage,
        uploaded_by_name: currentUser?.full_name || 'Barangay Staff',
        uploaded_at: new Date().toLocaleTimeString()
      }))
    };
  };

  const handlePreviewDraft = () => {
    const draftRecord = buildDraftRecord();
    setDossierBlotter(draftRecord);
  };

  const handleDownloadDraft = () => {
    const draftRecord = buildDraftRecord();
    downloadBlotterDocument(draftRecord);
    setDossierBlotter(draftRecord);
  };

  const handleDownloadPdfDraft = () => {
    const draftRecord = buildDraftRecord();
    downloadBlotterPDF(draftRecord);
    setDossierBlotter(draftRecord);
  };

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
      
      {/* ================= VIEW 1: HOME / DASHBOARD ================= */}
      {(activeTab === 'staff-dashboard' || activeTab === 'dashboard' || activeTab === 'home') && (
        <div className="space-y-6">
          
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-[20px] border border-slate-100/80 border-l-4 border-l-[#FEF3C7] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Pending</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#92400E] tracking-tight mt-1" style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}>{pendingCount}</div>
            </div>

            <div className="bg-white rounded-[20px] border border-slate-100/80 border-l-4 border-l-[#3B82F6] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Investigating</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#1E40AF] tracking-tight mt-1" style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}>{investigatingCount}</div>
            </div>

            <div className="bg-white rounded-[20px] border border-slate-100/80 border-l-4 border-l-[#10B981] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Resolved</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#065F46] tracking-tight mt-1" style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}>{resolvedCount}</div>
            </div>

            <div className="bg-white rounded-[20px] border border-slate-100/80 border-l-4 border-l-[#7C3AED] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Resolution Rate</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#7C3AED] tracking-tight mt-1" style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}>{resolutionRate}%</div>
            </div>
          </div>

          {/* Quick Staff Actions Card */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#3730A3] bg-[#E0E7FF] px-3 py-1 rounded-full" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Barangay Staff Blotter Desk
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B] mt-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Welcome, {currentUser?.full_name}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Manage incident intake, update hearing statuses, and record official affidavits
              </p>
            </div>
            <div className="flex gap-2.5 self-start sm:self-auto">
              <button
                onClick={() => {
                  setReportStep(1);
                  setActiveTab('staff-create-report');
                }}
                className="bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
                style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}
              >
                <Plus className="w-4 h-4 text-[#3730A3]" />
                <span>Create Report</span>
              </button>
              <button
                onClick={() => setActiveTab('staff-all-incident')}
                className="px-5 py-2.5 bg-white hover:bg-slate-50 text-[#334155] border border-[#CBD5E1] font-semibold text-xs sm:text-sm rounded-full transition-colors cursor-pointer"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                View Incidents
              </button>
            </div>
          </div>

          {/* Recent Records Card */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-7 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#1E293B] text-lg" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Recent Blotter Intake
              </h3>
              <button
                onClick={() => setActiveTab('staff-all-incident')}
                className="text-xs font-semibold text-[#6366F1] hover:underline cursor-pointer"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                View All &rarr;
              </button>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {blotters.slice(0, 5).map(b => (
                <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-xs sm:text-sm text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{b.blotter_id}</span>
                      <span className={`text-[11px] font-bold uppercase px-3 py-0.5 rounded-full ${
                        b.status === 'resolved' 
                          ? 'bg-[#D1FAE5] text-[#065F46]' 
                          : b.status === 'investigating' 
                          ? 'bg-[#DBEAFE] text-[#1E40AF]' 
                          : 'bg-[#FEF3C7] text-[#92400E]'
                      }`} style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-[#64748B] mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      <strong className="text-[#1E293B]">{b.incident_type}</strong> — Complainant: {b.complainant_name} vs Respondent: {b.respondent_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="px-4 py-1.5 text-xs font-semibold text-[#6366F1] bg-[#E0E7FF] hover:bg-[#c7d2fe] rounded-full transition-colors cursor-pointer"
                      style={{ fontFamily: "'Quicksand', sans-serif" }}
                    >
                      Update Case
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= VIEW 2: ALL INCIDENT ================= */}
      {(activeTab === 'staff-all-incident' || activeTab === 'all-incidents') && (
        <div className="space-y-6">
          
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-[20px] border border-slate-100/80 border-l-4 border-l-[#FEF3C7] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Pending</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#92400E] tracking-tight mt-1" style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}>{pendingCount}</div>
            </div>

            <div className="bg-white rounded-[20px] border border-slate-100/80 border-l-4 border-l-[#3B82F6] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Investigating</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#1E40AF] tracking-tight mt-1" style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}>{investigatingCount}</div>
            </div>

            <div className="bg-white rounded-[20px] border border-slate-100/80 border-l-4 border-l-[#10B981] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Resolved</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#065F46] tracking-tight mt-1" style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}>{resolvedCount}</div>
            </div>

            <div className="bg-white rounded-[20px] border border-slate-100/80 border-l-4 border-l-[#7C3AED] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Resolution Rate</div>
              <div className="text-3xl sm:text-4xl font-bold text-[#7C3AED] tracking-tight mt-1" style={{ fontFamily: "'Fredoka', 'Nunito', sans-serif" }}>{resolutionRate}%</div>
            </div>
          </div>

          {/* Blotter Records Table Card */}
          <div className="bg-white rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border-0 overflow-hidden p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>Blotter Records</h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Search, filter, and manage incident reports</p>
            </div>

            {/* Filter controls */}
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
                    <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider text-center" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Status</th>
                    <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider text-center" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredBlotters.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        No incident records found.
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
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          {b.status === 'investigating' ? (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#DBEAFE] text-[#1E40AF]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              Investigating
                            </span>
                          ) : b.status === 'pending' ? (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              Pending
                            </span>
                          ) : b.status === 'archived' ? (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 text-slate-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              Archived
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#065F46]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              Resolved
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(b)}
                              className="text-[#64748B] hover:text-[#6366F1] p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Edit / Update Incident"
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

        </div>
      )}

      {/* ================= VIEW 3: CREATE REPORT (STAFF WIZARD) ================= */}
      {(activeTab === 'staff-create-report' || activeTab === 'create-report') && (
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="bg-white rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-6 sm:p-10 space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Create Official Blotter Entry
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Barangay Sta. Ana official incident recording desk
              </p>
            </div>

            {/* Step Wizard Indicator */}
            <div className="flex items-center justify-center gap-3 pt-1 pb-4">
              <div className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full ${reportStep === 1 ? 'bg-[#E0E7FF] text-[#3730A3]' : 'bg-slate-100 text-[#64748B]'}`}>
                <span>1. Nag-uulat at Nasasangkot</span>
              </div>
              <div className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full ${reportStep === 2 ? 'bg-[#E0E7FF] text-[#3730A3]' : 'bg-slate-100 text-[#64748B]'}`}>
                <span>2. Detalye at Aksyon</span>
              </div>
              <div className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full ${reportStep === 3 ? 'bg-[#E0E7FF] text-[#3730A3]' : 'bg-slate-100 text-[#64748B]'}`}>
                <span>3. Ebidensya at Kumpirmasyon</span>
              </div>
            </div>

            {/* STEP 1: Parties */}
            {reportStep === 1 && (
              <div className="space-y-5">
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1">Petsa at Oras ng Pag-uulat</label>
                    <input 
                      type="datetime-local" 
                      value={compReportDateTime}
                      onChange={e => setCompReportDateTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-[#E2E8F0] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1">Duty Staff Officer</label>
                    <input 
                      type="text" 
                      disabled 
                      value={currentUser?.full_name || 'Barangay Staff'}
                      className="w-full px-3 py-2 bg-slate-100 rounded-lg border border-[#E2E8F0] text-xs text-slate-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs uppercase font-bold tracking-wider text-[#6366F1] mb-3">COMPLAINANT (NAGREREKLAMO)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1">Buong Pangalan *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Juan Dela Cruz"
                        value={compName}
                        onChange={e => setCompName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1">Telepono #</label>
                      <input 
                        type="text" 
                        placeholder="09123456789"
                        value={compPhone}
                        onChange={e => setCompPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1">Tirahan / Address</label>
                      <input 
                        type="text" 
                        placeholder="Alley 11, Barangay Sta. Ana, Pateros"
                        value={compAddress}
                        onChange={e => setCompAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs uppercase font-bold tracking-wider text-[#6366F1] mb-3">RESPONDENT (INIREREKLAMO)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1">Buong Pangalan *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Pedro Penduko"
                        value={respName}
                        onChange={e => setRespName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1">Telepono #</label>
                      <input 
                        type="text" 
                        placeholder="09987654321"
                        value={respPhone}
                        onChange={e => setRespPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1">Tirahan / Address</label>
                      <input 
                        type="text" 
                        placeholder="Barangay Sta. Ana, Pateros"
                        value={respAddress}
                        onChange={e => setRespAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs uppercase font-bold tracking-wider text-[#6366F1] mb-3">URI NG INSIDENTE</div>
                  <div className="flex flex-wrap gap-3">
                    {['Pagnanakaw', 'Pisikal na Pananakit', 'Karahasang Domestiko', 'Gulo sa Kapitbahay', 'Paninira ng Ari-arian'].map(t => (
                      <label key={t} className="inline-flex items-center gap-2 cursor-pointer bg-[#F8FAFC] px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium">
                        <input 
                          type="checkbox"
                          checked={selectedIncidentTypes.includes(t)}
                          onChange={() => toggleIncidentType(t)}
                          className="accent-[#6366F1]"
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setReportStep(2)}
                    className="px-6 py-2.5 bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] font-semibold text-xs sm:text-sm rounded-full transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                    style={{ fontFamily: "'Quicksand', sans-serif" }}
                  >
                    <span>Next: Detalye ng Insidente</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Incident Details */}
            {reportStep === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">Eksaktong Lokasyon ng Insidente</label>
                  <input 
                    type="text" 
                    placeholder="Alley 11, Barangay Sta. Ana, Pateros"
                    value={incLocation}
                    onChange={e => setIncLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">Petsa at Oras ng Pangyayari</label>
                  <input 
                    type="datetime-local" 
                    value={incDateTime}
                    onChange={e => setIncDateTime(e.target.value)}
                    className="w-full max-w-xs px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">Detalyadong Salaysay / Narrative</label>
                  <textarea 
                    rows={5}
                    placeholder="Isulat ang kumpletong kwento at pahayag ng nag-uulat..."
                    value={incNarrative}
                    onChange={e => setIncNarrative(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs sm:text-sm"
                  />
                </div>

                <div className="pt-2">
                  <div className="text-xs uppercase font-bold tracking-wider text-[#6366F1] mb-3">AKSYONG ISINAGAWA NG BARANGAY</div>
                  <div className="flex flex-wrap gap-3">
                    {['Iskedyul ng Mediasyon', 'Inirefer sa Pulisya', 'Inirefer sa DSWD', 'Nagbigay ng Babala'].map(a => (
                      <label key={a} className="inline-flex items-center gap-2 cursor-pointer bg-[#F8FAFC] px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium">
                        <input 
                          type="checkbox"
                          checked={selectedBarangayActions.includes(a)}
                          onChange={() => toggleBarangayAction(a)}
                          className="accent-[#6366F1]"
                        />
                        <span>{a}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setReportStep(1)}
                    className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-full hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportStep(3)}
                    className="px-6 py-2.5 bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] font-semibold text-xs sm:text-sm rounded-full transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Next: Ebidensya &amp; Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Evidence & Confirm */}
            {reportStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">Ebidensya at Kalakip na Dokumento (Opsyonal)</label>
                  <div className="border-2 border-dashed border-[#E2E8F0] rounded-2xl p-6 text-center bg-[#F8FAFC]">
                    <Upload className="w-6 h-6 text-[#94A3B8] mx-auto mb-2" />
                    <label className="inline-block px-4 py-2 bg-white border border-[#CBD5E1] text-[#334155] rounded-full text-xs font-semibold cursor-pointer hover:bg-slate-50">
                      <span>Browse Files</span>
                      <input 
                        type="file" 
                        multiple 
                        onChange={e => e.target.files && handleAddEvidenceFiles(e.target.files)}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                {evidenceItems.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[#1E293B]">Attached Files ({evidenceItems.length}):</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {evidenceItems.map(item => (
                        <div key={item.id} className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <span className="truncate font-medium text-[#1E293B]">{item.name}</span>
                          <span className="text-[10px] text-[#64748B]">{item.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs space-y-1 text-[#3730A3]">
                  <div className="font-bold">Summary Review:</div>
                  <div>Complainant: <strong>{compName}</strong> vs Respondent: <strong>{respName}</strong></div>
                  <div>Location: {incLocation}</div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setReportStep(2)}
                    className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-full hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePreviewDraft}
                      className="px-5 py-2.5 bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] font-semibold text-xs sm:text-sm rounded-full transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="View Document Preview"
                    >
                      <Eye className="w-4 h-4 text-[#3730A3]" />
                      <span>View &amp; Print Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handlePreviewDraft();
                        setTimeout(() => window.print(), 350);
                      }}
                      className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
                      title="Print"
                    >
                      <Printer className="w-4 h-4 text-white" />
                      <span>Print</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateReportSubmit()}
                      className="px-7 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs sm:text-sm rounded-full shadow-xs transition-colors cursor-pointer"
                    >
                      Submit Official Entry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Success View */}
            {reportStep === 4 && (
              <div className="py-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <span className="bg-[#E0E7FF] text-[#3730A3] font-bold text-sm px-4 py-1.5 rounded-full inline-block mb-2">
                    {submitSuccessCaseId || 'BLT-2026-0001'}
                  </span>
                  <h3 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    Blotter Case Successfully Filed!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    The incident has been recorded in the Barangay Sta. Ana official database.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={() => handleDownloadDraft()}
                    className="px-6 py-2.5 bg-white border border-[#CBD5E1] text-[#334155] font-semibold text-xs sm:text-sm rounded-full hover:bg-slate-50 transition-colors inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-[#6366F1]" />
                    <span>Print Dossier</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('staff-all-incident')}
                    className="px-7 py-2.5 bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] font-semibold text-xs sm:text-sm rounded-full shadow-xs transition-colors cursor-pointer"
                  >
                    View All Incidents
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ================= VIEW 4: SCHEDULE (STAFF SCHEDULE TAB) ================= */}
      {(activeTab === 'staff-schedule' || activeTab === 'schedules' || activeTab === 'schedule') && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Complaint Schedule
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Schedule mediation and conciliation hearing dates
              </p>
            </div>

            <button
              onClick={() => setIsAddScheduleOpen(true)}
              className="bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              <Plus className="w-4 h-4 text-[#3730A3]" />
              <span>New Hearing Date</span>
            </button>
          </div>

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
                    <th className="py-4 px-6 text-center font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', sans-serif" }}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-[#334155]">
                  {schedules.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        No hearing schedules recorded.
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
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <button
                            onClick={() => {
                              if (window.confirm('Cancel and delete this hearing schedule?')) {
                                deleteSchedule(sched.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Schedule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* New Schedule Modal */}
      {isAddScheduleOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddScheduleOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>Schedule New Hearing</h3>
              <p className="text-xs text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Set mediation date linked to a blotter case</p>
            </div>

            <form onSubmit={handleCreateScheduleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>Blotter Case</label>
                <select
                  value={schedBlotterId}
                  onChange={e => setSchedBlotterId(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1] bg-white text-[#334155]"
                >
                  {blotters.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.blotter_id} — {b.complainant_name} vs {b.respondent_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>Date &amp; Time</label>
                <input
                  type="datetime-local"
                  required
                  value={schedDate}
                  onChange={e => setSchedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>Action Type</label>
                <select
                  value={schedType}
                  onChange={e => setSchedType(e.target.value as ScheduleActionType)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1] bg-white text-[#334155]"
                >
                  <option value="Hearing">Hearing</option>
                  <option value="Mediator">Mediator</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>Location</label>
                <input
                  type="text"
                  required
                  value={schedLocation}
                  onChange={e => setSchedLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>Notes</label>
                <textarea
                  rows={2}
                  value={schedNotes}
                  onChange={e => setSchedNotes(e.target.value)}
                  placeholder="Summon both parties for mediation..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddScheduleOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-full hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] text-xs font-semibold rounded-full shadow-xs transition-colors"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Update Case Modal */}
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
                Update Blotter Case: {editingBlotter.blotter_id}
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
                  Official Case Note / Affidavit Summary
                </label>
                <textarea
                  rows={4}
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  placeholder="Isulat dito ang mga panibagong tala o kasunduan sa kaso..."
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
