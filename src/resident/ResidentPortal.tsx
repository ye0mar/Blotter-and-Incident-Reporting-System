import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BlotterRecord } from '../types';
import { downloadBlotterDocument, downloadBlotterPDF } from '../components/PrintDossierModal';
import { 
  FileText, 
  Shield, 
  CheckCircle, 
  Calendar, 
  Search, 
  ArrowRight,
  ArrowLeft,
  Upload,
  Plus,
  X,
  Printer,
  Download,
  Check,
  AlertTriangle,
  Info,
  Image as ImageIcon,
  Eye,
  Trash2
} from 'lucide-react';

export const ResidentPortal: React.FC = () => {
  const { 
    currentUser, 
    blotters, 
    schedules, 
    addBlotter, 
    activeTab, 
    setActiveTab, 
    setDossierBlotter 
  } = useApp();

  // ----------------------------------------------------
  // LOCALSTORAGE AUTO-SAVE FOR REPORT INCIDENT FORM
  // ----------------------------------------------------
  const RESIDENT_AUTOSAVE_KEY = 'resident_report_autosave';

  const savedResidentDraft = React.useMemo(() => {
    try {
      const data = localStorage.getItem(RESIDENT_AUTOSAVE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // STEP WIZARD STATE
  const [reportStep, setReportStep] = useState<1 | 2 | 3>(savedResidentDraft?.reportStep || 1);

  // Step 1: Letterhead & Parties
  const [reportDateTime, setReportDateTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  });

  const [complainantName, setComplainantName] = useState(savedResidentDraft?.complainantName || currentUser?.full_name || 'Juan Luna Dela Cruz');
  const [complainantPhone, setComplainantPhone] = useState(savedResidentDraft?.complainantPhone || currentUser?.phone || '09223151232');
  const [complainantAddress, setComplainantAddress] = useState(savedResidentDraft?.complainantAddress || currentUser?.address || 'Alley 1 P Rosales St.');
  const [complainantRelation, setComplainantRelation] = useState(savedResidentDraft?.complainantRelation || 'Biktima');

  const [respondentName, setRespondentName] = useState(savedResidentDraft?.respondentName ?? 'Jessie Santos');
  const [respondentPhone, setRespondentPhone] = useState(savedResidentDraft?.respondentPhone ?? '093215129741');
  const [respondentAddress, setRespondentAddress] = useState(savedResidentDraft?.respondentAddress ?? 'Blk 1 Lot 33 Alley 2');

  const [selectedIncidentTypes, setSelectedIncidentTypes] = useState<string[]>(savedResidentDraft?.selectedIncidentTypes || ['Pisikal na Pananakit']);
  const [otherIncidentType, setOtherIncidentType] = useState(savedResidentDraft?.otherIncidentType || '');

  // Step 2: Location, Date & Narrative
  const [incidentLocation, setIncidentLocation] = useState(savedResidentDraft?.incidentLocation || 'Alley 1 P Rosales St.');
  const [incidentDateTimeStr, setIncidentDateTimeStr] = useState(savedResidentDraft?.incidentDateTimeStr || 'May 2, 2026  2:00PM');
  const [incidentDescription, setIncidentDescription] = useState(savedResidentDraft?.incidentDescription ?? 'Naganap ang mainitang pagtatalo at pisikal na pananakit sa labas ng tindahan.');
  const [selectedActions, setSelectedActions] = useState<string[]>(savedResidentDraft?.selectedActions || ['Iskedyul ng Mediasyon']);
  const [otherAction, setOtherAction] = useState(savedResidentDraft?.otherAction || '');

  // Auto-Save Effect across sessions / accidental refreshes
  React.useEffect(() => {
    try {
      const draft = {
        reportStep,
        complainantName,
        complainantPhone,
        complainantAddress,
        complainantRelation,
        respondentName,
        respondentPhone,
        respondentAddress,
        selectedIncidentTypes,
        otherIncidentType,
        incidentLocation,
        incidentDateTimeStr,
        incidentDescription,
        selectedActions,
        otherAction
      };
      localStorage.setItem(RESIDENT_AUTOSAVE_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [
    reportStep,
    complainantName,
    complainantPhone,
    complainantAddress,
    complainantRelation,
    respondentName,
    respondentPhone,
    respondentAddress,
    selectedIncidentTypes,
    otherIncidentType,
    incidentLocation,
    incidentDateTimeStr,
    incidentDescription,
    selectedActions,
    otherAction
  ]);

  const clearResidentDraft = () => {
    try {
      localStorage.removeItem(RESIDENT_AUTOSAVE_KEY);
    } catch (e) {}
  };

  // Step 3: Evidence & Attachments (Online Submission)
  const [evidenceItems, setEvidenceItems] = useState<{
    id: string;
    name: string;
    size?: string;
    previewUrl?: string;
    isImage: boolean;
  }[]>([
    {
      id: 'ev-1',
      name: 'ebidensya_larawan_1.jpg',
      size: '1.2 MB',
      isImage: true,
      previewUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80'
    }
  ]);
  const [isDraggingEvidence, setIsDraggingEvidence] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);

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

  const handleEvidencePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          handleAddEvidenceFiles([file]);
        }
      }
    }
  };

  // Modals & Feedback
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showUploadSuccessModal, setShowUploadSuccessModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [submittedBlotterId, setSubmittedBlotterId] = useState<string | null>(null);
  const [showSubmitSuccessModal, setShowSubmitSuccessModal] = useState(false);
  const [draftToast, setDraftToast] = useState(false);

  // ----------------------------------------------------
  // MY COMPLAINTS STATE
  // ----------------------------------------------------
  const [complaintSearch, setComplaintSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedModalBlotter, setSelectedModalBlotter] = useState<BlotterRecord | null>(null);

  // Filter complaints for current resident
  const residentBlotters = blotters.filter(b => 
    b.complainant_id === currentUser?.id || 
    b.complainant_name.toLowerCase().includes(currentUser?.full_name.toLowerCase() || 'juan') ||
    b.complainant_name.toLowerCase().includes('juan')
  );

  const filteredComplaints = residentBlotters.filter(b => {
    const matchesSearch = 
      !complaintSearch.trim() ||
      b.blotter_id.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      b.incident_type.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      b.respondent_name.toLowerCase().includes(complaintSearch.toLowerCase());
    
    const matchesType = typeFilter === 'All Types' || b.incident_type.toLowerCase().includes(typeFilter.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || b.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  // Filter schedules for current resident
  const residentSchedules = schedules.filter(s => 
    residentBlotters.some(b => b.blotter_id === s.blotter_id) ||
    s.complainant_name?.toLowerCase().includes('juan')
  );

  const toggleIncidentType = (type: string) => {
    setSelectedIncidentTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleAction = (act: string) => {
    setSelectedActions(prev => 
      prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act]
    );
  };

  const handleStartNewReport = () => {
    setReportStep(1);
    setRespondentName('');
    setRespondentPhone('');
    setRespondentAddress('');
    setIncidentDescription('');
    setSelectedIncidentTypes(['Pisikal na Pananakit']);
    setSelectedActions(['Iskedyul ng Mediasyon']);
    setActiveTab('resident-report');
  };

  const handleSaveDraft = () => {
    setDraftToast(true);
    setTimeout(() => setDraftToast(false), 2500);
  };

  const buildDraftRecord = (): BlotterRecord => {
    const finalType = selectedIncidentTypes.length > 0 
      ? selectedIncidentTypes[0] 
      : (otherIncidentType.trim() || 'Pisikal na Pananakit');

    const allTypes = [...selectedIncidentTypes];
    if (otherIncidentType.trim()) allTypes.push(otherIncidentType.trim());

    const allActions = [...selectedActions];
    if (otherAction.trim()) allActions.push(otherAction.trim());

    return {
      id: 0,
      blotter_id: 'DRAFT-' + Math.floor(1000 + Math.random() * 9000),
      complainant_id: currentUser?.id || 4,
      complainant_name: complainantName.trim() || currentUser?.full_name || 'Juan Luna Dela Cruz',
      complainant_phone: complainantPhone.trim() || undefined,
      complainant_address: complainantAddress.trim() || undefined,
      complainant_relation: complainantRelation.trim() || 'Biktima',
      respondent_name: respondentName.trim() || 'Hindi tinukoy',
      respondent_phone: respondentPhone.trim() || undefined,
      respondent_address: respondentAddress.trim() || undefined,
      incident_type: finalType,
      incident_types: allTypes,
      incident_location: incidentLocation.trim() || 'Barangay Sta. Ana, Pateros',
      incident_datetime: incidentDateTimeStr.trim() || reportDateTime || new Date().toLocaleString(),
      incident_description: incidentDescription.trim() || 'Walang ibinigay na detalyadong salaysay.',
      actions: allActions,
      reported_at: reportDateTime || new Date().toLocaleString(),
      status: 'pending',
      official_name: 'Duty Desk Officer / Barangay Official',
      attachments: evidenceItems.map(ev => ({
        id: ev.id,
        file_name: ev.name,
        file_size: ev.size,
        previewUrl: ev.previewUrl,
        isImage: ev.isImage,
        uploaded_by_name: complainantName.trim() || 'Resident',
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

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    clearResidentDraft();
    setReportStep(1);
    setActiveTab('resident-home');
  };

  const handleFinalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearResidentDraft();

    const finalType = selectedIncidentTypes.length > 0 
      ? selectedIncidentTypes[0] 
      : (otherIncidentType.trim() || 'Pisikal na Pananakit');

    const allTypes = [...selectedIncidentTypes];
    if (otherIncidentType.trim()) allTypes.push(otherIncidentType.trim());

    const allActions = [...selectedActions];
    if (otherAction.trim()) allActions.push(otherAction.trim());

    const newRecord = addBlotter({
      complainant_id: currentUser?.id || 4,
      complainant_name: complainantName.trim() || currentUser?.full_name || 'Juan Luna Dela Cruz',
      complainant_phone: complainantPhone.trim() || '09223151232',
      complainant_address: complainantAddress.trim() || 'Alley 1 P Rosales St.',
      complainant_relation: complainantRelation.trim() || 'Biktima',
      respondent_name: respondentName.trim() || 'Jessie Santos',
      respondent_phone: respondentPhone.trim() || '093215129741',
      respondent_address: respondentAddress.trim() || 'Blk 1 Lot 33 Alley 2',
      incident_type: finalType,
      incident_types: allTypes,
      incident_location: incidentLocation.trim() || 'Alley 1 P Rosales St.',
      incident_datetime: new Date().toISOString(),
      incident_description: incidentDescription.trim() || 'Naganap ang insidente sa naturang lugar.',
      actions: allActions,
      official_name: 'Juan Dela Cruz'
    });

    setSubmittedBlotterId(newRecord.blotter_id);
    setShowSubmitSuccessModal(true);
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-between">
      
      {/* Toast Notice */}
      {draftToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1a3a6b] text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-blue-400 text-sm font-semibold animate-pulse">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Draft report saved successfully!</span>
        </div>
      )}

      <div className="flex-1 pb-10">

        {/* ========================================================================= */}
        {/* VIEW 1: DYNAMIC DASHBOARD HOME WITH REDESIGNED HEADER & HOW IT WORKS */}
        {/* ========================================================================= */}
        {activeTab === 'resident-home' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-10">
            
            {/* A. Top Header Banner (Large rounded white/pale gradient card) */}
            <div className="relative bg-gradient-to-br from-white via-slate-50/60 to-[#CAE1F7]/30 rounded-[24px] border border-slate-200/80 p-8 sm:p-12 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden">
              {/* Subtle ambient glow in background */}
              <div className="absolute -top-16 -right-16 w-60 h-60 bg-[#CAE1F7]/50 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-100/40 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="space-y-4 max-w-2xl">
                  {/* Small Date/Time */}
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB] stroke-[1.5]" />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight leading-tight" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    Digital Blotter &amp; Incident Reporting
                  </h2>

                  {/* Subtitle */}
                  <p className="text-sm sm:text-base text-[#64748B] leading-relaxed font-normal" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    A modern, secure platform to report incidents, track case status, and view mediation schedules in Barangay Sta. Ana, Pateros.
                  </p>

                  {/* B. "Report an Incident" Pill Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleStartNewReport}
                      className="inline-flex items-center gap-2.5 bg-[#CAE1F7] hover:bg-[#b5d8f8] text-[#1E3A8A] font-semibold text-sm px-7 py-3.5 rounded-full transition-all duration-200 shadow-xs hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                    >
                      <span>Report an Incident</span>
                      <ArrowRight className="w-4 h-4 text-[#1E3A8A] stroke-[1.5]" />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* C. The "How It Works" Section */}
            <div className="space-y-6 pt-2">
              <div className="text-center space-y-1.5">
                <h3 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  How It Works
                </h3>
                <p className="text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Simple steps to report and track incidents in Barangay Sta. Ana
                </p>
              </div>

              {/* 3 Step Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 Card */}
                <div className="bg-white rounded-[24px] border border-slate-100 p-8 sm:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-all duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-[#CAE1F7]/70 text-[#1E3A8A] flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      1. Submit Report
                    </h4>
                    <p className="text-sm text-[#64748B] leading-relaxed font-normal" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Fill out the online form with complete incident details and optional document evidence.
                    </p>
                  </div>
                </div>

                {/* Step 2 Card */}
                <div className="bg-white rounded-[24px] border border-slate-100 p-8 sm:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-all duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-[#CAE1F7]/70 text-[#1E3A8A] flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      2. Official Review
                    </h4>
                    <p className="text-sm text-[#64748B] leading-relaxed font-normal" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Barangay officials examine the report and assign an investigating officer or mediation schedule.
                    </p>
                  </div>
                </div>

                {/* Step 3 Card */}
                <div className="bg-white rounded-[24px] border border-slate-100 p-8 sm:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-all duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-[#CAE1F7]/70 text-[#1E3A8A] flex items-center justify-center shrink-0">
                    <CheckCircle className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      3. Resolution
                    </h4>
                    <p className="text-sm text-[#64748B] leading-relaxed font-normal" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Track status updates, attend scheduled hearings, and receive official resolution docs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: PAGE 1 - MY COMPLAINTS (LIST VIEW) */}
        {/* ========================================================================= */}
        {activeTab === 'resident-complaints' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
            
            {/* White Card Container without harsh outer borders */}
            <div className="bg-white rounded-[24px] p-6 sm:p-8 space-y-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
              
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    My Complaints
                  </h2>
                  <p className="text-sm text-[#64748B] mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    View all incident reports
                  </p>
                </div>
                <button
                  onClick={handleStartNewReport}
                  className="bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all inline-flex items-center gap-1.5 self-start sm:self-auto shadow-xs hover:-translate-y-0.5 cursor-pointer"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <span>New Report +</span>
                </button>
              </div>

              {/* Filter Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 border border-[#E2E8F0] rounded-xl px-4 py-2 bg-white flex-1 max-w-xs min-w-[200px] focus-within:ring-2 focus-within:ring-[#6366F1]/30 focus-within:border-[#6366F1] transition-all">
                  <Search className="w-4 h-4 text-[#64748B] shrink-0 stroke-[1.5]" />
                  <input 
                    type="text" 
                    placeholder="Search by ID"
                    value={complaintSearch}
                    onChange={e => setComplaintSearch(e.target.value)}
                    className="w-full text-xs sm:text-sm outline-none text-[#334155] placeholder:text-[#94A3B8] bg-transparent font-normal"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>

                <select 
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#334155] bg-white cursor-pointer outline-none font-medium focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] transition-all"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <option value="All Types">All Types</option>
                  <option value="Pisikal na Pananakit">Pisikal na Pananakit</option>
                  <option value="Pagnanakaw">Pagnanakaw</option>
                  <option value="Karahasang Domestiko">Karahasang Domestiko</option>
                </select>

                <select 
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-[#E2E8F0] rounded-xl text-xs sm:text-sm text-[#334155] bg-white cursor-pointer outline-none font-medium focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] transition-all"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <option value="All Status">All Status</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* The Table */}
              <div className="bg-white rounded-2xl overflow-hidden overflow-x-auto border border-[#F1F5F9]">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                      <th className="py-4 px-6 font-medium text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Blotter ID</th>
                      <th className="py-4 px-6 font-medium text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Incident Type</th>
                      <th className="py-4 px-6 font-medium text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Status</th>
                      <th className="py-4 px-6 text-right font-medium text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          No complaints found.
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map(b => (
                        <tr key={b.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                          <td className="py-4 px-6 font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {b.blotter_id}
                          </td>
                          <td className="py-4 px-6 text-[#334155]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {b.incident_type}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold ${
                              b.status === 'resolved' 
                                ? 'bg-[#DCFCE7] text-[#166534]'
                                : b.status === 'investigating'
                                ? 'bg-[#FFE4E6] text-[#9F1239]'
                                : 'bg-[#FEF3C7] text-[#92400E]'
                            }`} style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {b.status === 'resolved' ? 'Resolved' : b.status === 'investigating' ? 'Investigating' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => {
                                setSelectedModalBlotter(b);
                                setActiveTab('resident-incident-details');
                              }}
                              className="bg-white hover:bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
                              style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                              <Eye className="w-3.5 h-3.5 text-[#64748B] stroke-[1.5]" />
                              <span>Details</span>
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

        {/* ========================================================================= */}
        {/* VIEW 3: PAGE 2 - MY SCHEDULE (LIST VIEW) */}
        {/* ========================================================================= */}
        {activeTab === 'resident-schedules' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
            
            {/* White Card Container */}
            <div className="bg-white rounded-[24px] p-6 sm:p-8 space-y-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
              
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    Complaint Schedule
                  </h2>
                  <p className="text-sm text-[#64748B] mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Schedule hearing dates
                  </p>
                </div>
              </div>

              {/* Schedules Table */}
              <div className="bg-white rounded-2xl overflow-hidden overflow-x-auto border border-[#F1F5F9]">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                      <th className="py-4 px-6 font-medium text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Blotter ID</th>
                      <th className="py-4 px-6 font-medium text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Incident Type</th>
                      <th className="py-4 px-6 font-medium text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Date and Time</th>
                      <th className="py-4 px-6 font-medium text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residentSchedules.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          No complaint hearings scheduled yet.
                        </td>
                      </tr>
                    ) : (
                      residentSchedules.map(s => {
                        const dateObj = new Date(s.schedule_date);
                        const formattedDate = dateObj.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        });
                        const formattedTime = dateObj.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }).replace(' ', '');

                        return (
                          <tr key={s.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors cursor-pointer" onClick={() => {
                            const matchingBlotter = residentBlotters.find(b => b.blotter_id === s.blotter_id) || {
                              id: s.id,
                              blotter_id: s.blotter_id,
                              complainant_id: currentUser?.id || 4,
                              complainant_name: s.complainant_name || currentUser?.full_name || 'Juan Dela Cruz',
                              respondent_name: 'Pedro Penduko',
                              incident_type: s.incident_type || 'Theft / Pagnanakaw',
                              incident_location: s.location || 'Alley II, Sta. Ana, Pateros',
                              incident_datetime: s.schedule_date,
                              incident_description: 'Ninakaw ang bisikleta sa tapat ng bahay habang kumakain ng tanghalian. May nakakita na dinala ng nasasakdal patungo sa kabilang kanto.',
                              reported_at: s.schedule_date,
                              status: 'investigating',
                              complainant_phone: '09123456786',
                              respondent_phone: '09987654321',
                              respondent_address: 'Alley III, Sta. Ana, Pateros'
                            };
                            setSelectedModalBlotter(matchingBlotter as BlotterRecord);
                            setActiveTab('resident-incident-details');
                          }}>
                            <td className="py-4 px-6 font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {s.blotter_id}
                            </td>
                            <td className="py-4 px-6 text-[#334155]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {s.incident_type || 'Pisikal na Pananakit'}
                            </td>
                            <td className="py-4 px-6 text-[#475569] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {formattedDate}&nbsp; {formattedTime}
                            </td>
                            <td className="py-4 px-6 text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {s.location}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: PAGE 3 - INCIDENT DETAILS (FULL STANDALONE PAGE VIEW WITH ALL REPORT FIELDS) */}
        {/* ========================================================================= */}
        {activeTab === 'resident-incident-details' && (
          <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8 space-y-6">
            
            {/* Top Navigation Back Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveTab('resident-complaints');
                  setSelectedModalBlotter(null);
                }}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer group"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <ArrowLeft className="w-4 h-4 stroke-[2] transition-transform group-hover:-translate-x-1" />
                <span>Back to My Complaints</span>
              </button>

              <span className="text-xs text-[#64748B] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Report Status:&nbsp;
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${
                  selectedModalBlotter?.status === 'resolved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedModalBlotter?.status === 'investigating'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedModalBlotter?.status === 'resolved' ? 'Resolved' : selectedModalBlotter?.status === 'investigating' ? 'Investigating' : 'Pending Review'}
                </span>
              </span>
            </div>

            {/* Header Section */}
            <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100/80 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Blotter Report
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-[#E0E7FF] text-[#3730A3] font-bold px-4 py-1.5 rounded-full text-xs sm:text-sm tracking-wide" style={{ fontFamily: "'GT Walsheim', 'Urbanist', sans-serif" }}>
                    {selectedModalBlotter?.blotter_id || 'BLT-2026-0001'}
                  </span>
                  
                  {/* Display All Incident Types */}
                  {(selectedModalBlotter?.incident_types && selectedModalBlotter.incident_types.length > 0
                    ? selectedModalBlotter.incident_types
                    : [selectedModalBlotter?.incident_type || 'Pisikal na Pananakit']
                  ).map((typeItem, idx) => (
                    <span key={idx} className="bg-[#FFEDD5] text-[#C2410C] font-semibold px-3.5 py-1.5 rounded-full text-xs" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {typeItem}
                    </span>
                  ))}
                </div>
              </div>

              {/* Location & Timestamps Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm text-[#64748B] border-t border-slate-100" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <div className="flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-[#6366F1] shrink-0 stroke-[1.5]" />
                  <span className="font-semibold text-[#1E293B]">Lokasyon:</span>
                  <span className="truncate">{selectedModalBlotter?.incident_location || 'Barangay Sta. Ana, Pateros'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#6366F1] shrink-0 stroke-[1.5]" />
                  <span className="font-semibold text-[#1E293B]">Petsa ng Insidente:</span>
                  <span>{selectedModalBlotter?.incident_datetime || 'May 2, 2026 2:00 PM'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#6366F1] shrink-0 stroke-[1.5]" />
                  <span className="font-semibold text-[#1E293B]">Petsa ng Pag-uulat:</span>
                  <span>{selectedModalBlotter?.reported_at || 'May 2, 2026 2:30 PM'}</span>
                </div>
              </div>
            </div>

            {/* Main Content Card with Complete Submitted Data */}
            <div className="bg-white rounded-[24px] p-6 sm:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100/80 space-y-8">
              
              {/* People Grid (2 Columns: Complainant & Respondent) */}
              <div>
                <div className="text-xs uppercase tracking-wider font-bold text-[#6366F1] mb-4 pb-1 border-b border-slate-100" style={{ fontFamily: "'Century Gothic', 'Okta Neue', sans-serif" }}>
                  MGA TAONG SANGKOT (PARTIES INVOLVED)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100/90">
                  {/* Left Column: Complainant (Nagrereklamo) */}
                  <div className="space-y-4 pt-2 sm:pt-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                      <span className="text-xs uppercase tracking-wider font-bold text-[#64748B]" style={{ fontFamily: "'Century Gothic', 'Okta Neue', sans-serif" }}>
                        COMPLAINANT (NAGREREKLAMO)
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-[#64748B]" style={{ fontFamily: "'Century Gothic', sans-serif" }}>Pangalan</div>
                      <div className="text-base sm:text-lg font-bold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {selectedModalBlotter?.complainant_name || 'Juan Luna Dela Cruz'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-[#64748B]" style={{ fontFamily: "'Century Gothic', sans-serif" }}>Telepono</div>
                        <div className="text-xs sm:text-sm text-[#334155] font-semibold mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {selectedModalBlotter?.complainant_phone || '09223151232'}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-[#64748B]" style={{ fontFamily: "'Century Gothic', sans-serif" }}>Kaugnayan sa Isyu</div>
                        <div className="text-xs sm:text-sm text-[#334155] font-semibold mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {selectedModalBlotter?.complainant_relation || 'Biktima / Biktima Mismo'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[#64748B]" style={{ fontFamily: "'Century Gothic', sans-serif" }}>Tirahan / Anino</div>
                      <div className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {selectedModalBlotter?.complainant_address || 'Alley 1 P Rosales St., Sta. Ana, Pateros'}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Respondents (Inirereklamo / Nasasakdal) */}
                  <div className="space-y-4 pt-6 sm:pt-0 sm:pl-8">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs uppercase tracking-wider font-bold text-[#64748B]" style={{ fontFamily: "'Century Gothic', 'Okta Neue', sans-serif" }}>
                        RESPONDENT (INIREREKLAMO / NASASAKDAL)
                      </span>
                    </div>

                    <div>
                      <div className="text-xs text-[#64748B]" style={{ fontFamily: "'Century Gothic', sans-serif" }}>Pangalan</div>
                      <div className="text-base sm:text-lg font-bold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {selectedModalBlotter?.respondent_name || 'Jessie Santos'}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[#64748B]" style={{ fontFamily: "'Century Gothic', sans-serif" }}>Telepono</div>
                      <div className="text-xs sm:text-sm text-[#334155] font-semibold mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {selectedModalBlotter?.respondent_phone || '093215129741'}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-[#64748B]" style={{ fontFamily: "'Century Gothic', sans-serif" }}>Tirahan</div>
                      <div className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {selectedModalBlotter?.respondent_address || 'Blk 1 Lot 33 Alley 2, Sta. Ana, Pateros'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Narrative Description Section */}
              <div className="space-y-3 pt-2">
                <div className="text-xs uppercase tracking-wider font-bold text-[#6366F1]" style={{ fontFamily: "'Century Gothic', 'Okta Neue', sans-serif" }}>
                  SALAYSAY NG NANGYARI (NARRATIVE DESCRIPTION)
                </div>
                <div className="bg-[#F8FAFC] rounded-2xl p-5 sm:p-6 border border-slate-200/70 text-sm sm:text-base text-[#334155] leading-relaxed font-normal min-h-[110px]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {selectedModalBlotter?.incident_description || 'Naganap ang mainitang pagtatalo at pisikal na pananakit sa labas ng tindahan. Ninakaw ang bisikleta sa tapat ng bahay habang kumakain ng tanghalian.'}
                </div>
              </div>

              {/* Requested Barangay Actions & Official In Charge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                {/* Actions Requested */}
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wider font-bold text-[#6366F1]" style={{ fontFamily: "'Century Gothic', 'Okta Neue', sans-serif" }}>
                    HINIHINGING AKSYON SA BARANGAY
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(selectedModalBlotter?.actions && selectedModalBlotter.actions.length > 0 
                      ? selectedModalBlotter.actions 
                      : ['Iskedyul ng Mediasyon', 'Patawag sa Barangay Hearing']
                    ).map((action, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 bg-slate-100 text-[#334155] px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{action}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Duty Official / Officer in Charge */}
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wider font-bold text-[#6366F1]" style={{ fontFamily: "'Century Gothic', 'Okta Neue', sans-serif" }}>
                    OFFICER / DUTY OFFICIAL IN-CHARGE
                  </div>
                  <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/80 text-xs sm:text-sm font-semibold text-[#1E293B] flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    <Shield className="w-4 h-4 text-[#6366F1]" />
                    <span>{selectedModalBlotter?.official_name || selectedModalBlotter?.assigned_to_name || 'Duty Desk Officer / Barangay Official'}</span>
                  </div>
                </div>
              </div>

              {/* Attached Evidence Section */}
              {((selectedModalBlotter?.attachments && selectedModalBlotter.attachments.length > 0) || evidenceItems.length > 0) && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs uppercase tracking-wider font-bold text-[#6366F1]" style={{ fontFamily: "'Century Gothic', 'Okta Neue', sans-serif" }}>
                    NAKALAKIP NA EBIDENSYA / ATTACHED EVIDENCE
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedModalBlotter?.attachments && selectedModalBlotter.attachments.length > 0 ? (
                      selectedModalBlotter.attachments.map((att) => (
                        <div key={att.id} className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="font-semibold truncate text-slate-900">{att.file_name}</div>
                              {att.file_size && <div className="text-[10px] text-slate-400">{att.file_size}</div>}
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-[#6366F1]">Attached</span>
                        </div>
                      ))
                    ) : (
                      evidenceItems.map((att) => (
                        <div key={att.id} className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs text-slate-800">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {att.isImage && att.previewUrl ? (
                              <img
                                src={att.previewUrl}
                                alt={att.name}
                                className="w-10 h-8 object-cover rounded border border-slate-200 shrink-0 cursor-pointer hover:opacity-80"
                                onClick={() => setPreviewModalImg(att.previewUrl || null)}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}
                            <div className="truncate">
                              <div className="font-semibold truncate text-slate-900">{att.name}</div>
                              {att.size && <div className="text-[10px] text-slate-400">{att.size}</div>}
                            </div>
                          </div>
                          {att.isImage && att.previewUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewModalImg(att.previewUrl || null)}
                              className="text-xs font-semibold text-[#6366F1] hover:underline"
                            >
                              View Image
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setActiveTab('resident-complaints');
                    setSelectedModalBlotter(null);
                  }}
                  className="bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#334155] px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <ArrowLeft className="w-4 h-4 stroke-[2]" />
                  <span>Back to My Complaints</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (selectedModalBlotter) {
                        downloadBlotterDocument(selectedModalBlotter);
                      } else {
                        handleDownloadDraft();
                      }
                    }}
                    className="bg-white border border-[#CBD5E1] hover:bg-slate-50 text-[#334155] hover:text-[#1E293B] px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <Printer className="w-4 h-4 stroke-[1.5]" />
                    <span>Print Dossier</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('resident-complaints');
                      setSelectedModalBlotter(null);
                    }}
                    className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-7 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
                    style={{ fontFamily: "'Urbanist', 'Poppins', sans-serif" }}
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: REPORT WIZARD (Matches HTML: <div class="view" id="step1", "step2", "step3">) */}
        {/* ========================================================================= */}
        {activeTab === 'resident-report' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
            
            {/* Step Bar (Matches .step-bar, .step-item, .step-circle, .step-line) */}
            <div className="flex items-center justify-center pt-2 pb-4">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${
                  reportStep > 1 
                    ? 'bg-[#2563eb] border-[#2563eb] text-white' 
                    : 'border-[#2563eb] text-[#2563eb] bg-white'
                }`}>
                  {reportStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                </div>
                <div className={`w-16 h-0.5 ${reportStep > 1 ? 'bg-[#2563eb]' : 'bg-[#e2e8f0]'}`} />
              </div>

              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${
                  reportStep > 2 
                    ? 'bg-[#2563eb] border-[#2563eb] text-white' 
                    : reportStep === 2
                      ? 'border-[#2563eb] text-[#2563eb] bg-white'
                      : 'border-[#e2e8f0] text-[#64748b] bg-white'
                }`}>
                  {reportStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                </div>
                <div className={`w-16 h-0.5 ${reportStep > 2 ? 'bg-[#2563eb]' : 'bg-[#e2e8f0]'}`} />
              </div>

              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${
                  reportStep === 3 
                    ? 'border-[#2563eb] text-[#2563eb] bg-white' 
                    : 'border-[#e2e8f0] text-[#64748b] bg-white'
                }`}>
                  3
                </div>
              </div>
            </div>

            {/* Main Form Container */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 sm:p-10 shadow-xs space-y-6">
              
              {/* STEP 1: Letterhead & Personal Details */}
              {reportStep === 1 && (
                <div className="space-y-6">
                  {/* Letterhead */}
                  <div className="flex items-center justify-center gap-3 sm:gap-6 text-[#1e293b] pb-4 border-b border-slate-200 mx-auto">
                    <img 
                      src="/santa-ana-logo.png" 
                      alt="Barangay Sta. Ana Logo" 
                      className="w-12 h-12 sm:w-16 sm:h-16 object-contain flex-shrink-0"
                    />
                    <div className="text-center space-y-0.5 leading-relaxed">
                      <div className="font-bold text-xs sm:text-sm">Republic of the Philippines</div>
                      <div className="font-bold text-xs sm:text-sm text-slate-600">National Capital Region</div>
                      <div className="font-bold text-xs sm:text-sm text-slate-700">Municipality of Pateros</div>
                      <div className="font-extrabold text-sm sm:text-base text-[#0d3461]">BARANGAY STA. ANA</div>
                    </div>
                    <img 
                      src="/pateros-logo.png" 
                      alt="Municipality of Pateros Logo" 
                      className="w-12 h-12 sm:w-16 sm:h-16 object-contain flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/pateros-logo.svg';
                      }}
                    />
                  </div>

                  {/* Form Row: Blotter ID & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                        Bilang ng blotter entry
                      </label>
                      <input 
                        type="text" 
                        placeholder="Auto-generated upon submission" 
                        disabled 
                        className="w-full px-3 py-2 rounded-md border border-[#cbd5e1] text-xs sm:text-sm bg-[#f8fafc] text-[#94a3b8] cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                        Petsa at oras ng pag-uulat
                      </label>
                      <input 
                        type="text" 
                        placeholder="Petsa at oras ng pag-uulat" 
                        value={reportDateTime}
                        onChange={e => setReportDateTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-[#cbd5e1] text-xs sm:text-sm bg-white text-[#334155] outline-none focus:border-[#2563eb]"
                      />
                    </div>
                  </div>

                  {/* Section: NAG-UULAT NA TAO */}
                  <div className="pt-2">
                    <div className="font-bold text-xs sm:text-sm text-[#1e293b] border-b border-[#e2e8f0] pb-1.5 mb-3.5 tracking-wide">
                      NAG-UULAT NA TAO
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Pangalan</label>
                        <input 
                          type="text" 
                          placeholder="Buong Pangalan"
                          value={complainantName}
                          onChange={e => setComplainantName(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-[#cbd5e1] text-xs sm:text-sm outline-none focus:border-[#2563eb]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Telepono</label>
                        <input 
                          type="tel" 
                          placeholder="Numero ng cellphone o landline"
                          value={complainantPhone}
                          onChange={e => setComplainantPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-[#cbd5e1] text-xs sm:text-sm outline-none focus:border-[#2563eb]"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Tirahan</label>
                        <input 
                          type="text" 
                          placeholder="Kumpletong address"
                          value={complainantAddress}
                          onChange={e => setComplainantAddress(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-[#cbd5e1] text-xs sm:text-sm outline-none focus:border-[#2563eb]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Ugnayan sa Insidente</label>
                        <input 
                          type="text" 
                          placeholder="Hal. biktima, saksi, kamag-anak"
                          value={complainantRelation}
                          onChange={e => setComplainantRelation(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-[#cbd5e1] text-xs sm:text-sm outline-none focus:border-[#2563eb]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: INAANGKIN NA NASASANGKOT (RESPONDENT) */}
                  <div className="pt-2">
                    <div className="font-bold text-xs sm:text-sm text-[#1e293b] border-b border-[#e2e8f0] pb-1.5 mb-3.5 tracking-wide">
                      INAANGKIN NA NASASANGKOT (RESPONDENT)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Pangalan</label>
                        <input 
                          type="text" 
                          placeholder="Buong Pangalan"
                          value={respondentName}
                          onChange={e => setRespondentName(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-[#cbd5e1] text-xs sm:text-sm outline-none focus:border-[#2563eb]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Telepono</label>
                        <input 
                          type="tel" 
                          placeholder="Numero ng cellphone o landline"
                          value={respondentPhone}
                          onChange={e => setRespondentPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-[#cbd5e1] text-xs sm:text-sm outline-none focus:border-[#2563eb]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-[#334155] mb-1">Tirahan</label>
                        <input 
                          type="text" 
                          placeholder="Kumpletong address"
                          value={respondentAddress}
                          onChange={e => setRespondentAddress(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-[#cbd5e1] text-xs sm:text-sm outline-none focus:border-[#2563eb]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: URI NG INSIDENTE */}
                  <div className="pt-2">
                    <div className="font-bold text-xs sm:text-sm text-[#1e293b] border-b border-[#e2e8f0] pb-1.5 mb-3.5 tracking-wide">
                      URI NG INSIDENTE
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-xs sm:text-sm text-[#334155]">
                      {[
                        'Pisikal na Pananakit',
                        'Pagnanakaw',
                        'Karahasang Domestiko',
                        'Panlalait o Paninira',
                        'Pagsalakay sa Ari-arian',
                        'Paninira ng Ari-arian'
                      ].map(type => (
                        <label key={type} className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedIncidentTypes.includes(type)}
                            onChange={() => toggleIncidentType(type)}
                            className="accent-[#2563eb] w-4 h-4 rounded"
                          />
                          <span>{type}</span>
                        </label>
                      ))}

                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox"
                          checked={otherIncidentType.length > 0}
                          onChange={() => {
                            if (otherIncidentType.length > 0) setOtherIncidentType('');
                            else setOtherIncidentType('Iba pa');
                          }}
                          className="accent-[#2563eb] w-4 h-4 rounded"
                        />
                        <span>iba pa</span>
                        <input 
                          type="text"
                          placeholder="Ilagay dito"
                          value={otherIncidentType}
                          onChange={e => setOtherIncidentType(e.target.value)}
                          className="ml-1 px-2.5 py-1 rounded border border-[#cbd5e1] text-xs sm:text-sm outline-none w-44"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Step 1 Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-[#e2e8f0]">
                    <div />
                    <button
                      type="button"
                      onClick={() => setReportStep(2)}
                      className="bg-[#CAE1F7] hover:bg-[#B3D7F5] text-[#1E3A8A] px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>NEXT</span>
                      <ArrowRight className="w-4 h-4 text-[#1E3A8A]" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Location, Date & Narrative */}
              {reportStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Lugar ng Pangyayari:
                    </label>
                    <input 
                      type="text"
                      placeholder="Ilagay kung saan ng yari ang insidente o eksaktong lugar"
                      value={incidentLocation}
                      onChange={e => setIncidentLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-[#cbd5e1] text-xs sm:text-sm outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Petsa at oras ng pangyayari:
                    </label>
                    <input 
                      type="text"
                      placeholder="Ilagay ang etsa at oras ng pangyayari"
                      value={incidentDateTimeStr}
                      onChange={e => setIncidentDateTimeStr(e.target.value)}
                      className="w-full max-w-md px-3 py-2 rounded-md border border-[#cbd5e1] text-xs sm:text-sm outline-none focus:border-[#2563eb]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Detalye ng Insidente:
                    </label>
                    <textarea 
                      placeholder="Ikwento nang buo ang nangyari"
                      rows={5}
                      value={incidentDescription}
                      onChange={e => setIncidentDescription(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-md border border-[#cbd5e1] text-xs sm:text-sm outline-none focus:border-[#2563eb] resize-y leading-relaxed"
                    />
                  </div>

                  {/* Section: AKSYONG ISINAGAWA NG MGA OPISYAL NG BARANGAY */}
                  <div className="pt-2">
                    <div className="font-bold text-xs sm:text-sm text-[#1e293b] border-b border-[#e2e8f0] pb-1.5 mb-3.5 tracking-wide">
                      AKSYONG ISINAGAWA NG MGA OPISYAL NG BARANGAY
                    </div>
                    <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#334155]">
                      {[
                        'Iskedyul ng Mediasyon',
                        'Inirefer sa Pulisya',
                        'Inirefer sa DSWD',
                        'Nagbigay ng Babala'
                      ].map(act => (
                        <label key={act} className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={selectedActions.includes(act)}
                            onChange={() => toggleAction(act)}
                            className="accent-[#2563eb] w-4 h-4 rounded"
                          />
                          <span>{act}</span>
                        </label>
                      ))}

                      <label className="inline-flex items-center gap-2 cursor-pointer select-none pt-0.5">
                        <input 
                          type="checkbox"
                          checked={otherAction.length > 0}
                          onChange={() => {
                            if (otherAction.length > 0) setOtherAction('');
                            else setOtherAction('Iba pa');
                          }}
                          className="accent-[#2563eb] w-4 h-4 rounded"
                        />
                        <span>Iba pa:</span>
                        <input 
                          type="text"
                          placeholder="Ilagay dito"
                          value={otherAction}
                          onChange={e => setOtherAction(e.target.value)}
                          className="ml-1 px-2.5 py-1 rounded border border-[#cbd5e1] text-xs sm:text-sm outline-none w-56"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Step 2 Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-[#e2e8f0]">
                    <button
                      type="button"
                      onClick={() => setReportStep(1)}
                      className="bg-white hover:bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportStep(3)}
                      className="bg-[#CAE1F7] hover:bg-[#B3D7F5] text-[#1E3A8A] px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4 text-[#1E3A8A]" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Evidence & Final Actions */}
              {reportStep === 3 && (
                <div className="space-y-6" onPaste={handleEvidencePaste}>
                  
                  {/* Evidence Upload Block (Matching image_76db0ca8.png) */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-800 mb-0.5">
                        Mga Kalakip na Dokumento/Ebidensya (Opsyonal)
                      </label>
                      <p className="text-[12px] text-slate-500">
                        Mag-upload ng anumang dokumento, larawan, video, o audio file bilang suporta
                      </p>
                    </div>

                    {/* Dashed Drag-and-Drop & Paste Upload Box */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingEvidence(true); }}
                      onDragLeave={() => setIsDraggingEvidence(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingEvidence(false);
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          handleAddEvidenceFiles(e.dataTransfer.files);
                        }
                      }}
                      className={`border border-dashed rounded-xl p-6 sm:p-7 text-center transition-all bg-white ${
                        isDraggingEvidence 
                          ? 'border-blue-500 bg-blue-50/50' 
                          : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
                      }`}
                    >
                      <label className="flex flex-col items-center justify-center cursor-pointer select-none">
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx,.txt"
                          onChange={(e) => {
                            if (e.target.files) handleAddEvidenceFiles(e.target.files);
                          }}
                          className="hidden"
                        />
                        <ImageIcon className="w-6 h-6 text-slate-400 mb-1.5" />
                        <span className="text-[13px] font-medium text-slate-700">
                          Click to upload screenshot or drag and drop
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1">
                          PNG, JPG, WebP supported • You can also paste directly from clipboard (Ctrl+V)
                        </span>
                      </label>
                    </div>

                    {/* Attached Evidence List */}
                    {evidenceItems.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[12px] font-semibold text-slate-700">
                          Nakalakip na Ebidensya ({evidenceItems.length}):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {evidenceItems.map((att) => (
                            <div
                              key={att.id}
                              className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 gap-2"
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                {att.isImage && att.previewUrl ? (
                                  <img
                                    src={att.previewUrl}
                                    alt={att.name}
                                    className="w-10 h-8 object-cover rounded border border-slate-200 shrink-0 cursor-pointer hover:opacity-80"
                                    onClick={() => setPreviewModalImg(att.previewUrl || null)}
                                    title="Click to view enlarged image"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="truncate">
                                  <div className="font-medium truncate text-slate-900">{att.name}</div>
                                  {att.size && <div className="text-[10px] text-slate-400">{att.size}</div>}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {att.isImage && att.previewUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewModalImg(att.previewUrl || null)}
                                    className="p-1 text-slate-500 hover:text-slate-800"
                                    title="View preview"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setEvidenceItems(prev => prev.filter(x => x.id !== att.id))}
                                  className="p-1 text-slate-400 hover:text-red-500"
                                  title="Remove attachment"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 3 Form Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#e2e8f0]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReportStep(2)}
                        className="bg-white hover:bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Prev</span>
                      </button>
                      <button
                        type="button"
                        onClick={handlePreviewDraft}
                        className="bg-[#CAE1F7] hover:bg-[#B3D7F5] text-[#1E3A8A] px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="View Document Preview"
                      >
                        <Eye className="w-4 h-4 text-[#1E3A8A]" />
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
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDiscardModal(true)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFinalSubmit()}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                      >
                        Submit
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODALS SECTION */}
      {/* ========================================================================= */}



      {/* 2. File Upload Modal */}
      {showFileUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button 
              onClick={() => setShowFileUploadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#1e293b]">File Upload</h3>
              <p className="text-xs text-[#64748b]">Select and upload your file</p>
            </div>
            <div className="border-2 border-dashed border-[#cbd5e1] rounded-xl p-8 text-center space-y-3 bg-[#f8fafc]">
              <p className="text-xs text-[#64748b] font-medium">Drag files to upload or browse</p>
              <label className="inline-block px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-md cursor-pointer transition-colors shadow-sm">
                <span>Browse file</span>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={e => {
                    if (e.target.files) {
                      handleAddEvidenceFiles(e.target.files);
                      setShowFileUploadModal(false);
                      setShowUploadSuccessModal(true);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 3. Upload Success Modal */}
      {showUploadSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <Check className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-emerald-600">Success</h3>
              <p className="text-xs text-[#64748b]">The file was uploaded successfully.</p>
            </div>
            <button
              onClick={() => setShowUploadSuccessModal(false)}
              className="w-full py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold rounded-md transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 4. Discard Unsaved Report Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1e293b]">Discard Unsaved Report?</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">
                Your progress on this incident report has not been saved. If you cancel now, all entered data will be lost.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => setShowDiscardModal(false)}
                className="w-full py-2 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-[#334155] text-xs font-semibold rounded-md transition-colors"
              >
                Keep Editing
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="w-full py-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-semibold rounded-md transition-colors"
              >
                Discard Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Submit Success Modal */}
      {showSubmitSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563eb] flex items-center justify-center mx-auto border border-blue-200">
              <Check className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#1e293b]">
                Report Submitted Successfully
              </h3>
              <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
                Your report has been received and logged. Please keep your Reference Number for your records.
              </p>
              <div className="pt-1">
                <span className="text-xs sm:text-sm font-semibold text-[#1e293b]">
                  Reference No: <strong className="font-mono text-[#2563eb] font-bold">{submittedBlotterId}</strong>
                </span>
              </div>
            </div>
            <div className="pt-3">
              <button
                onClick={() => {
                  setShowSubmitSuccessModal(false);
                  setActiveTab('resident-complaints');
                }}
                className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-semibold rounded-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreviewModalImg(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <span className="text-[13px] font-bold text-slate-800">Preview Attachment</span>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="p-1 text-slate-500 hover:text-black rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-lg border border-slate-200 flex items-center justify-center bg-slate-900">
              <img
                src={previewModalImg}
                alt="Enlarged attachment"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
