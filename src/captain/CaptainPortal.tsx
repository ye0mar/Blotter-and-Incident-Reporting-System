import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportCaptainReport } from '../utils/reportExporter';
import { 
  TrendingUp, 
  Layers, 
  Calendar as CalendarIcon, 
  Download, 
  Eye, 
  Folder, 
  Briefcase,
  Archive,
  CheckCircle2
} from 'lucide-react';

export const CaptainPortal: React.FC = () => {
  const { blotters, schedules, activityLogs, archiveBlotter, updateBlotterStatus, setDossierBlotter, activeTab } = useApp();
  
  // Selected period for reports
  const [reportPeriod, setReportPeriod] = useState<string>('Last Week');
  const [archivedSuccessMsg, setArchivedSuccessMsg] = useState<string | null>(null);

  // 5 KPI Metrics
  const totalIncidents = blotters.length;
  const pendingIncidents = blotters.filter(b => b.status === 'pending').length;
  const investigatingIncidents = blotters.filter(b => b.status === 'investigating').length;
  const resolvedIncidents = blotters.filter(b => b.status === 'resolved').length;
  const archivedIncidents = blotters.filter(b => b.status === 'archived').length;
  const resolutionRate = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0;
  const activeCasesRate = totalIncidents > 0 ? Math.round(((pendingIncidents + investigatingIncidents) / totalIncidents) * 100) : 0;

  // Status breakdown percentages
  const pendingPct = totalIncidents > 0 ? Math.round((pendingIncidents / totalIncidents) * 100) : 0;
  const investigatingPct = totalIncidents > 0 ? Math.round((investigatingIncidents / totalIncidents) * 100) : 0;
  const resolvedPct = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0;

  // Group incidents by type
  const typeCounts: { [key: string]: number } = {};
  blotters.forEach(b => {
    const t = b.incident_type || 'Other';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  // Last 7 days labels & mock counts for trend chart
  const days = ['May 1', 'May 2', 'May 3', 'May 4', 'May 5', 'May 6', 'May 7'];
  const dayCounts = [1, 0, 2, 0, 1, 0, blotters.length > 3 ? 1 : 0];

  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleDownloadReport = async (type: string) => {
    setIsExporting(true);
    try {
      await exportCaptainReport({
        type: type as 'Incident Summary' | 'Statistical Report' | 'Detailed Log',
        period: reportPeriod,
        blotters,
        schedules,
        activityLogs
      });
    } catch (err) {
      console.error('Error exporting report:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleArchiveCase = (bId: number) => {
    const res = archiveBlotter(bId);
    if (res.success) {
      setArchivedSuccessMsg(res.message);
      setTimeout(() => setArchivedSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 font-sans">
      
      {/* 5 Top Stat Cards (Soft Pastel Design System) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Total Incidents: Soft Indigo Left Border / Subtle Gradient */}
        <div className="bg-gradient-to-br from-[#E0E7FF]/50 via-white to-white rounded-[20px] border border-slate-100 border-l-4 border-l-[#6366F1] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Total Incidents
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-[#3730A3] tracking-tight mt-1" style={{ fontFamily: "'GT Walsheim', 'Circular', 'Urbanist', sans-serif" }}>
            {totalIncidents}
          </div>
        </div>

        {/* Pending: Soft Emerald */}
        <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Pending
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#10B981] tracking-tight mt-1" style={{ fontFamily: "'GT Walsheim', 'Circular', 'Urbanist', sans-serif" }}>
            {pendingIncidents}
          </div>
        </div>

        {/* Investigating: Soft Blue */}
        <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Investigating
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#3B82F6] tracking-tight mt-1" style={{ fontFamily: "'GT Walsheim', 'Circular', 'Urbanist', sans-serif" }}>
            {investigatingIncidents}
          </div>
        </div>

        {/* Resolved: Soft Amber */}
        <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Resolved
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#F59E0B] tracking-tight mt-1" style={{ fontFamily: "'GT Walsheim', 'Circular', 'Urbanist', sans-serif" }}>
            {resolvedIncidents}
          </div>
        </div>

        {/* Resolution Rate: Deep Violet */}
        <div className="bg-white rounded-[20px] border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Resolution Rate
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#7C3AED] tracking-tight mt-1" style={{ fontFamily: "'GT Walsheim', 'Circular', 'Urbanist', sans-serif" }}>
            {resolutionRate}%
          </div>
        </div>
      </div>

      {/* ================= VIEW 1: HOME / OVERVIEW ================= */}
      {(activeTab === 'captain-dashboard' || activeTab === 'dashboard' || activeTab === 'home') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Card: Incident Trend (Last 7 Days) */}
            <div className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-[#6366F1]" />
                <h3 className="font-bold text-[#1E293B] text-lg" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Incident Trend (Last 7 Days)
                </h3>
              </div>

              {/* Chart visualization */}
              <div className="pt-4 pb-2">
                <div className="relative h-44 flex items-end justify-between px-4 border-b border-[#F1F5F9]">
                  {/* Faint grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[11px] text-[#94A3B8] font-mono">
                    <div className="border-b border-[#F1F5F9] flex items-center justify-between"><span>4</span></div>
                    <div className="border-b border-[#F1F5F9] flex items-center justify-between"><span>3</span></div>
                    <div className="border-b border-[#F1F5F9] flex items-center justify-between"><span>2</span></div>
                    <div className="border-b border-[#F1F5F9] flex items-center justify-between"><span>1</span></div>
                    <div className="flex items-center justify-between"><span>0</span></div>
                  </div>

                  {/* Vertical day columns */}
                  {days.map((day, idx) => {
                    const count = dayCounts[idx];
                    const heightPercent = (count / 4) * 100;
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center justify-end h-full z-10">
                        {count > 0 && (
                          <div 
                            className="w-5 bg-[#818CF8] hover:bg-[#6366F1] rounded-t-md transition-all duration-300 shadow-xs cursor-pointer"
                            style={{ height: `${Math.max(heightPercent, 18)}%` }}
                            title={`${day}: ${count} incident(s)`}
                          />
                        )}
                        <div className="w-px h-full bg-[#F1F5F9]" style={{ display: count > 0 ? 'none' : 'block' }} />
                      </div>
                    );
                  })}
                </div>

                {/* Day labels */}
                <div className="flex justify-between px-2 pt-3 text-xs text-[#94A3B8] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {days.map(d => (
                    <span key={d} className="flex-1 text-center">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Card: Status Distribution */}
            <div className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-[#6366F1]" />
                <h3 className="font-bold text-[#1E293B] text-lg" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Status Distribution
                </h3>
              </div>

              {totalIncidents === 0 ? (
                <div className="py-16 text-center text-[#94A3B8] text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  No incident records available.
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  {/* Pending */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs sm:text-sm font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] inline-block"></span>
                        Pending
                      </span>
                      <span className="text-[#64748B]">{pendingIncidents} ({pendingPct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#34D399] rounded-full transition-all duration-300" style={{ width: `${pendingPct}%` }}></div>
                    </div>
                  </div>

                  {/* Investigating */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs sm:text-sm font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA] inline-block"></span>
                        Investigating
                      </span>
                      <span className="text-[#64748B]">{investigatingIncidents} ({investigatingPct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#60A5FA] rounded-full transition-all duration-300" style={{ width: `${investigatingPct}%` }}></div>
                    </div>
                  </div>

                  {/* Resolved */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs sm:text-sm font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24] inline-block"></span>
                        Resolved
                      </span>
                      <span className="text-[#64748B]">{resolvedIncidents} ({resolvedPct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-[#FBBF24] rounded-full transition-all duration-300" style={{ width: `${resolvedPct}%` }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Card: Recent Incidents */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div>
              <h3 className="font-bold text-[#1E293B] text-lg" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Recent Incidents
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Latest incident reports
              </p>
            </div>

            {blotters.length === 0 ? (
              <div className="py-12 text-center text-[#94A3B8] text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
                No incidents recorded
              </div>
            ) : (
              <div className="divide-y divide-slate-100/90">
                {blotters.slice(0, 5).map(b => (
                  <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-xs sm:text-sm text-[#334155]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {b.blotter_id}
                        </span>
                        
                        {/* Soft Pastel Badges */}
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full ${
                          b.status === 'resolved' 
                            ? 'bg-[#D1FAE5] text-[#065F46]' 
                            : b.status === 'investigating' 
                            ? 'bg-[#DBEAFE] text-[#1E40AF]' 
                            : 'bg-[#FEF3C7] text-[#92400E]'
                        }`} style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {b.status}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        <span className="font-semibold text-[#1E293B]">{b.incident_type}</span> — Complainant:{' '}
                        <strong className="text-[#334155] font-semibold">{b.complainant_name}</strong> vs Respondent: <strong className="text-[#334155] font-semibold">{b.respondent_name}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setDossierBlotter(b)}
                        className="px-4 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200/60 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        <Eye className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>View Dossier</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW 2: ANALYTICS ================= */}
      {activeTab === 'captain-analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Card: Incidents by Type */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div>
              <h3 className="font-bold text-[#1E293B] text-lg" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Incidents by Type
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Distribution of incident categories
              </p>
            </div>

            {Object.keys(typeCounts).length === 0 ? (
              <div className="py-16 text-center text-[#94A3B8] text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
                No incidents categorized yet.
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {Object.entries(typeCounts).map(([type, count]) => {
                  const pct = Math.round((count / totalIncidents) * 100);
                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="flex justify-between text-xs sm:text-sm font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        <span>{type}</span>
                        <span className="text-[#64748B]">{count} case(s) ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#6366F1] rounded-full transition-all duration-300" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Card: Performance Metrics */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
            <div>
              <h3 className="font-bold text-[#1E293B] text-lg" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Performance Metrics
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Key performance indicators
              </p>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Card 1: Resolution Rate */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Resolution Rate</div>
                  <div className="text-3xl font-extrabold text-[#10B981] mt-1" style={{ fontFamily: "'GT Walsheim', 'Circular', 'Urbanist', sans-serif" }}>
                    {resolutionRate}%
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-[#10B981]" />
              </div>

              {/* Card 2: Active Cases */}
              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Active Cases</div>
                  <div className="text-3xl font-extrabold text-[#3B82F6] mt-1" style={{ fontFamily: "'GT Walsheim', 'Circular', 'Urbanist', sans-serif" }}>
                    {activeCasesRate}%
                  </div>
                </div>
                <Folder className="w-8 h-8 text-[#3B82F6]" />
              </div>

              {/* Card 3: Total Cases */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Total Cases</div>
                  <div className="text-3xl font-extrabold text-[#7C3AED] mt-1" style={{ fontFamily: "'GT Walsheim', 'Circular', 'Urbanist', sans-serif" }}>
                    {totalIncidents > 0 ? `${totalIncidents}` : '0%'}
                  </div>
                </div>
                <Briefcase className="w-8 h-8 text-[#7C3AED]" />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ================= VIEW 3: REPORTS ================= */}
      {activeTab === 'captain-report' && (
        <div className="bg-white rounded-[24px] border border-slate-100 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-[#6366F1]" />
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Generate Reports
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Create comprehensive reports for record-keeping and analysis
              </p>
            </div>
          </div>

          {/* Report Period Selector */}
          <div className="space-y-1.5 max-w-sm">
            <label className="block text-xs sm:text-sm font-semibold text-[#1E293B]" style={{ fontFamily: "'Century Gothic', 'Poppins', sans-serif" }}>
              Report Period
            </label>
            <select
              value={reportPeriod}
              onChange={e => setReportPeriod(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm font-medium text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] cursor-pointer"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <option value="Last Week">Last Week</option>
              <option value="This Month">This Month</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Year">This Year</option>
              <option value="All Time">All Time</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <button
              onClick={() => handleDownloadReport('Incident Summary')}
              className="py-3 px-5 bg-[#CAE1F7] hover:bg-[#B3D7F5] text-[#1E3A8A] font-semibold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <Download className="w-4 h-4" />
              <span>Incident Summary</span>
            </button>

            <button
              onClick={() => handleDownloadReport('Statistical Report')}
              className="py-3 px-5 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#334155] font-semibold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <Download className="w-4 h-4" />
              <span>Statistical Report</span>
            </button>

            <button
              onClick={() => handleDownloadReport('Detailed Log')}
              className="py-3 px-5 bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#334155] font-semibold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <Download className="w-4 h-4" />
              <span>Detailed Log</span>
            </button>
          </div>

          {/* Report Summary Subcard */}
          <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/70">
            <h4 className="font-bold text-[#1E293B] text-sm mb-4" style={{ fontFamily: "'GT Walsheim', 'Circular', 'Urbanist', sans-serif" }}>
              Report Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-[#64748B] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>Period</div>
                <div className="text-base font-bold text-[#1E293B] mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{reportPeriod}</div>
              </div>
              <div>
                <div className="text-xs text-[#64748B] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>Total Incidents</div>
                <div className="text-base font-bold text-[#1E293B] mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{totalIncidents}</div>
              </div>
              <div>
                <div className="text-xs text-[#64748B] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>Resolved</div>
                <div className="text-base font-bold text-[#1E293B] mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{resolvedIncidents}</div>
              </div>
              <div>
                <div className="text-xs text-[#64748B] font-medium" style={{ fontFamily: "'Poppins', sans-serif" }}>Pending</div>
                <div className="text-base font-bold text-[#1E293B] mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{pendingIncidents}</div>
              </div>
            </div>
          </div>

          {/* Records Table Preview */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-[#1E293B] text-sm" style={{ fontFamily: "'GT Walsheim', 'Circular', 'Urbanist', sans-serif" }}>
                Included Blotter Records
              </h4>
              {archivedSuccessMsg && (
                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{archivedSuccessMsg}</span>
                </div>
              )}
            </div>
            <div className="border border-slate-100/90 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F8FAFC] text-[#64748B] font-medium uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3.5" style={{ fontFamily: "'Century Gothic', 'Okta Neue', sans-serif" }}>Case ID</th>
                    <th className="px-5 py-3.5" style={{ fontFamily: "'Century Gothic', 'Okta Neue', sans-serif" }}>Complainant</th>
                    <th className="px-5 py-3.5" style={{ fontFamily: "'Century Gothic', 'Okta Neue', sans-serif" }}>Respondent</th>
                    <th className="px-5 py-3.5" style={{ fontFamily: "'Century Gothic', 'Okta Neue', sans-serif" }}>Type</th>
                    <th className="px-5 py-3.5 text-center" style={{ fontFamily: "'Century Gothic', 'Okta Neue', sans-serif" }}>Status</th>
                    <th className="px-5 py-3.5 text-right" style={{ fontFamily: "'Century Gothic', 'Okta Neue', sans-serif" }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#334155]">
                  {blotters.map(b => (
                    <tr key={b.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-3 font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{b.blotter_id}</td>
                      <td className="px-5 py-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{b.complainant_name}</td>
                      <td className="px-5 py-3" style={{ fontFamily: "'Poppins', sans-serif" }}>{b.respondent_name}</td>
                      <td className="px-5 py-3 text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{b.incident_type}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase ${
                          b.status === 'resolved' 
                            ? 'bg-[#D1FAE5] text-[#065F46]' 
                            : b.status === 'investigating' 
                            ? 'bg-[#DBEAFE] text-[#1E40AF]' 
                            : b.status === 'archived'
                            ? 'bg-[#E2E8F0] text-[#475569]'
                            : 'bg-[#FEF3C7] text-[#92400E]'
                        }`} style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setDossierBlotter(b)}
                            className="text-[#6366F1] hover:text-[#4F46E5] font-semibold cursor-pointer"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            Print / View
                          </button>
                          {b.status !== 'archived' && (
                            <button
                              onClick={() => handleArchiveCase(b.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-[#475569] hover:text-[#1E293B] bg-slate-100 hover:bg-slate-200 rounded-full transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title={b.status === 'resolved' ? 'Archive Case' : 'Only resolved cases can be archived'}
                            >
                              <Archive className="w-3 h-3" />
                              <span>Archive</span>
                            </button>
                          )}
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

    </div>
  );
};
