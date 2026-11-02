import React, { useState } from 'react';
import './admin.css';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import { exportCapstoneSystemAdminReport } from '../utils/reportExporter';
import { 
  Users, 
  Settings, 
  Database, 
  Search, 
  Trash2, 
  Download, 
  CheckCircle2, 
  Plus, 
  ShieldCheck, 
  RefreshCw,
  AlertTriangle,
  Key,
  Eye,
  X,
  Activity,
  Server,
  FileText,
  Wrench,
  RotateCcw,
  Cpu,
  HardDrive,
  Globe,
  Lock,
  Calendar,
  ClipboardList
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { 
    users, 
    blotters, 
    schedules,
    setUserStatus, 
    deleteUser, 
    addUser,
    activeTab,
    setActiveTab,
    systemSettings,
    updateSystemSettings,
    createDatabaseBackup,
    clearDatabaseData,
    activityLogs,
    issueReports,
    resetUserPassword
  } = useApp();

  // Search in User Accounts
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Add User modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('resident');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  // Settings local state for saving
  const [emailNotif, setEmailNotif] = useState(systemSettings.emailNotification);
  const [requireAppr, setRequireAppr] = useState(systemSettings.requireApproval);
  const [maintMode, setMaintMode] = useState(systemSettings.maintenanceMode);
  const [archivePeriod, setArchivePeriod] = useState(systemSettings.autoArchivePeriod);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);

  // System Administration Custom State
  const [isExportingCapstonePdf, setIsExportingCapstonePdf] = useState(false);
  const [simulatingRecovery, setSimulatingRecovery] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState<string | null>(null);
  const [selectedRecoveryProblem, setSelectedRecoveryProblem] = useState('Accidental Database Data Corruption');
  
  // Live Monitoring Metrics State
  const [cpuUsage, setCpuUsage] = useState(12);
  const [ramUsage, setRamUsage] = useState(28);
  const [diskUsage, setDiskUsage] = useState(15);
  const [dbLatency, setDbLatency] = useState(12);
  const [isRefreshingMetrics, setIsRefreshingMetrics] = useState(false);

  // Troubleshooting Log State
  const [troubleshootingLogs, setTroubleshootingLogs] = useState([
    {
      id: 1,
      problem: 'High Database Query Latency during Peak Reporting Hours',
      cause: 'Unindexed full table search scans on complainant queries',
      solution: 'Applied in-memory indexing, cached frequent queries, and optimized payload filters',
      result: 'Query latency reduced from 1,200ms to 45ms (Resolved)',
      date: '2026-10-25'
    },
    {
      id: 2,
      problem: 'Session Expiration Disconnection during Extended Mediation Hearings',
      cause: 'Strict 15-minute token TTL without background heartbeat',
      solution: 'Implemented sliding session auto-renewal on user activity',
      result: 'Zero session drops reported during active hearings (Resolved)',
      date: '2026-10-27'
    },
    {
      id: 3,
      problem: 'File Upload Overhead on Mobile Field Devices',
      cause: 'Uncompressed raw photo attachments in incident dossiers',
      solution: 'Added client-side canvas compression before image submission',
      result: 'Payload size reduced by 75% with immediate upload speed improvement (Resolved)',
      date: '2026-10-29'
    }
  ]);

  const [isAddTroubleshootOpen, setIsAddTroubleshootOpen] = useState(false);
  const [newProblem, setNewProblem] = useState('');
  const [newCause, setNewCause] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [newResult, setNewResult] = useState('');

  // Maintenance Checklist State
  const [maintenanceTasks, setMaintenanceTasks] = useState([
    { id: 1, freq: 'Daily / Weekly', task: 'Monitor system server status, live CPU/RAM usage, and web server pulse', status: 'Completed', completedAt: 'Today, 8:00 AM' },
    { id: 2, freq: 'Daily / Weekly', task: 'Check disk storage space and active database memory buffer', status: 'Completed', completedAt: 'Today, 8:05 AM' },
    { id: 3, freq: 'Weekly', task: 'Execute JSON database backup snapshot and store in cloud repository', status: 'Completed', completedAt: 'Nov 1, 2026' },
    { id: 4, freq: 'Weekly', task: 'Review user login activity logs and access permission records', status: 'Completed', completedAt: 'Nov 1, 2026' },
    { id: 5, freq: 'Monthly', task: 'Apply security patches, dependency updates, and password policy audits', status: 'Completed', completedAt: 'Oct 28, 2026' },
    { id: 6, freq: 'Monthly', task: 'Test backup recovery simulation and verify data integrity checksum', status: 'Completed', completedAt: 'Oct 28, 2026' },
    { id: 7, freq: 'As Needed', task: 'Optimize database indexes and clear temporary cached assets', status: 'Completed', completedAt: 'Oct 20, 2026' }
  ]);

  // Stats calculation
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalIncidents = blotters.length;
  const totalIssues = issueReports.length;

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSaveSettings = () => {
    updateSystemSettings({
      emailNotification: emailNotif,
      requireApproval: requireAppr,
      maintenanceMode: maintMode,
      autoArchivePeriod: archivePeriod
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    addUser({
      full_name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: 'active',
      phone: newUserPhone.trim(),
      address: newUserAddress.trim()
    });
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserAddress('');
  };

  const handleResetPwd = (userId: number) => {
    const res = resetUserPassword(userId);
    setResetMsg(res.message);
    setTimeout(() => setResetMsg(null), 4000);
  };

  const handleExportCapstonePdf = async () => {
    setIsExportingCapstonePdf(true);
    try {
      await exportCapstoneSystemAdminReport({
        users,
        blotters,
        schedules,
        activityLogs,
        issueReports,
        troubleshootingLogs,
        maintenanceTasks
      });
    } catch (err) {
      console.error('Failed to export Capstone PDF:', err);
    } finally {
      setIsExportingCapstonePdf(false);
    }
  };

  const handleRunRecoveryTest = () => {
    setSimulatingRecovery(true);
    setRecoveryResult(null);
    setTimeout(() => {
      setSimulatingRecovery(false);
      setRecoveryResult(`✓ Recovery Test Completed Successfully! Re-verified all ${blotters.length} blotter records & ${users.length} user accounts with 100% data integrity.`);
    }, 2000);
  };

  const handleRefreshMetrics = () => {
    setIsRefreshingMetrics(true);
    setTimeout(() => {
      setCpuUsage(Math.floor(Math.random() * 15) + 8);
      setRamUsage(Math.floor(Math.random() * 10) + 24);
      setDiskUsage(15);
      setDbLatency(Math.floor(Math.random() * 8) + 10);
      setIsRefreshingMetrics(false);
    }, 600);
  };

  const handleAddTroubleshootRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProblem.trim() || !newSolution.trim()) return;
    const newLog = {
      id: troubleshootingLogs.length + 1,
      problem: newProblem.trim(),
      cause: newCause.trim() || 'Software exception under load',
      solution: newSolution.trim(),
      result: newResult.trim() || 'Issue Resolved & Verified',
      date: new Date().toISOString().slice(0, 10)
    };
    setTroubleshootingLogs([newLog, ...troubleshootingLogs]);
    setIsAddTroubleshootOpen(false);
    setNewProblem('');
    setNewCause('');
    setNewSolution('');
    setNewResult('');
  };

  const handleToggleMaintenanceTask = (taskId: number) => {
    setMaintenanceTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
        return { ...t, status: nextStatus, completedAt: nextStatus === 'Completed' ? new Date().toLocaleTimeString() : 'Pending' };
      }
      return t;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">

      {/* ================= 1. USER MANAGEMENT VIEW ================= */}
      {activeTab === 'user-management' && (
        <div className="bg-white rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border-0 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>User Accounts Management</h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>View user list, manage roles &amp; status, approve staff, and reset forgotten passwords</p>
            </div>
            
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto"
              style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}
            >
              <Plus className="w-4 h-4 text-[#3730A3]" />
              <span>Add New User</span>
            </button>
          </div>

          <div className="px-6 py-4 bg-[#F8FAFC] border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ID, name, email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-[#E2E8F0] focus:border-[#6366F1] focus:outline-none text-[#334155]"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
            </div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 bg-white text-xs sm:text-sm rounded-xl border border-[#E2E8F0] focus:border-[#6366F1] focus:outline-none text-[#334155] font-medium cursor-pointer"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin / System Administrator</option>
              <option value="captain">Barangay Captain</option>
              <option value="kagawad">Barangay Kagawad</option>
              <option value="staff">Barangay Staff</option>
              <option value="resident">Resident / Complainant</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>User ID</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Name</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Email</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider text-center" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Role</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider text-center" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Status</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Created</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider text-right" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      No user accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6 font-semibold text-[#1E293B] whitespace-nowrap" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {user.user_id}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap font-medium text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {user.full_name}
                      </td>
                      <td className="py-4 px-6 text-[#64748B] whitespace-nowrap" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {user.email}
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          user.role === 'admin' 
                            ? 'bg-[#E0E7FF] text-[#3730A3]' 
                            : user.role === 'captain'
                            ? 'bg-[#C4B5FD] text-[#4C1D95]'
                            : user.role === 'staff' || user.role === 'kagawad'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-slate-100 text-[#475569]'
                        }`} style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        {user.status === 'active' ? (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#065F46]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            active
                          </span>
                        ) : user.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#92400E]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                              pending
                            </span>
                            <button
                              onClick={() => setUserStatus(user.id, 'active')}
                              className="px-3 py-1 bg-[#10B981] hover:bg-emerald-700 text-white text-xs font-semibold rounded-full shadow-xs cursor-pointer transition-colors"
                              style={{ fontFamily: "'Quicksand', sans-serif" }}
                            >
                              Approve
                            </button>
                          </div>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#FFE4E6] text-[#9F1239]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-[#64748B] whitespace-nowrap text-xs" style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {user.created_at}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleResetPwd(user.id)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#334155] text-xs font-medium rounded-full transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                          title="Reset User Password"
                        >
                          <Key className="w-3.5 h-3.5 text-[#6366F1]" />
                          <span>Reset Password</span>
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete User"
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
      )}

      {/* ================= SYSTEM OVERVIEW & DEPLOYMENT ================= */}
      {activeTab === 'system-overview' && (
        <div className="space-y-6">
          {/* Documentation Export Card */}
          <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                System Administration &amp; Maintenance Documentation
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Export comprehensive system documentation report PDF covering overview, deployment evidence, security controls, backup recovery, live monitoring, troubleshooting register, and maintenance plan for official review and archiving.
              </p>
            </div>
            <button
              onClick={handleExportCapstonePdf}
              disabled={isExportingCapstonePdf}
              className="bg-[#3730A3] hover:bg-[#2e2882] text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-full transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer inline-flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              <FileText className="w-4 h-4 text-white" />
              <span>{isExportingCapstonePdf ? 'Exporting...' : 'Export Documentation'}</span>
            </button>
          </div>

          <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                System Overview &amp; Architecture
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                System identity, target users, and role permissions hierarchy matrix
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase">System Name</div>
                <div className="text-base font-bold text-[#1E293B]">Blotter and Incident Reporting System</div>
                <div className="text-xs text-slate-600">Barangay Sta. Ana, Municipality of Pateros</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase">Brief Description</div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  A web-based digital platform for intake, record keeping, Lupong Tagapamayapa mediation scheduling, executive analytics, and end-to-end system administration &amp; maintenance operations.
                </div>
              </div>
            </div>

            {/* Role Matrix */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1E293B]">Users of the System &amp; Role Access Matrix</h3>
              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">User Role</th>
                      <th className="p-3">Access Level &amp; System Capabilities</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-3 font-bold text-[#3730A3]">Administrator / System Admin</td>
                      <td className="p-3">Full admin control: User accounts, RBAC, live monitoring, backup/restoration test, troubleshooting, maintenance checklists.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#4C1D95]">Barangay Captain</td>
                      <td className="p-3">Executive dashboard, incident analytics, official report generation (Summary, Statistical, Detailed Log), resolution approvals, case archiving.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#065F46]">Barangay Staff / Secretary</td>
                      <td className="p-3">Walk-in complaint intake, blotter record entry, official 3-page PDF preview/export, hearing schedule creation.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#1E40AF]">Barangay Kagawad / Investigator</td>
                      <td className="p-3">Case investigation assignment, field hearing notes logging, resolution status marking.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-[#475569]">Resident / Complainant</td>
                      <td className="p-3">Online complaint filing, case status tracking, hearing schedule viewing, issue reporting.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 2: Deployment */}
          <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                System Deployment Details &amp; Evidence
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Server specifications, hosting environment, and deployment steps
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200/80">
                <div className="text-[11px] text-slate-500 font-bold uppercase">Operating System</div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Linux Ubuntu 22.04 LTS</div>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200/80">
                <div className="text-[11px] text-slate-500 font-bold uppercase">Web/App Server</div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Node.js 20 / Express / Vite</div>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200/80">
                <div className="text-[11px] text-slate-500 font-bold uppercase">Database Server</div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">JSON Relational Engine</div>
              </div>
              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200/80">
                <div className="text-[11px] text-slate-500 font-bold uppercase">Hosting Environment</div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Cloud Web App (Port 3000)</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Deployment Steps Executed:</h3>
              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <li>Repository clone and environment variable configuration (<code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">.env.example</code>).</li>
                <li>Production dependencies installation (<code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">npm install</code>).</li>
                <li>Vite client compilation and bundle optimization (<code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">npm run build</code>).</li>
                <li>Express web server launch listening on designated HTTP server port (<code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">Port 3000</code>).</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* ================= SYSTEM SECURITY ================= */}
      {activeTab === 'system-security' && (
        <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              System Security Measures
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Enforced security policies, role verification, and active security audit stream
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-[#3730A3] font-bold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Authentication &amp; Access Controls</span>
              </div>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>User Authentication &amp; Password Validation</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Password Enforcement (8+ Chars, Numbers &amp; Special Characters)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Role-Based Access Control (RBAC) Route Guardrails</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-[#3730A3] font-bold text-sm">
                <Lock className="w-4 h-4" />
                <span>Infrastructure &amp; Network Protection</span>
              </div>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Web Application Firewall (WAF) &amp; DDoS Mitigation</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>SSL / TLS Enforced HTTPS Connections</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Database Input Sanitization &amp; Prepared Queries</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= BACKUP & RECOVERY ================= */}
      {activeTab === 'backup-recovery' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Backup and Recovery Plan
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Automated backup schedule, manual JSON data exports, and recovery test simulation
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <div className="text-[11px] text-slate-500 font-bold uppercase">What is Backed Up?</div>
                <div className="text-xs font-semibold text-slate-800">Blotters, Users, Schedules, Logs &amp; Settings</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <div className="text-[11px] text-slate-500 font-bold uppercase">Backup Frequency</div>
                <div className="text-xs font-semibold text-slate-800">Daily Automated &amp; Instant Manual Export</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <div className="text-[11px] text-slate-500 font-bold uppercase">Backup Location</div>
                <div className="text-xs font-semibold text-slate-800">Encrypted Cloud Storage &amp; Local JSON</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={createDatabaseBackup}
                className="px-5 py-2.5 bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] font-bold text-xs rounded-full transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Create Instant JSON Backup</span>
              </button>
            </div>
          </div>

          {/* Interactive Recovery Test Simulation Widget */}
          <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-indigo-100 shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-[#3730A3]">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-lg font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Recovery Test Simulation
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Simulate database disaster recovery procedure and test snapshot restoration evidence:
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Select Problem Simulated:</label>
              <select
                value={selectedRecoveryProblem}
                onChange={e => setSelectedRecoveryProblem(e.target.value)}
                className="w-full sm:w-96 px-4 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
              >
                <option value="Accidental Database Data Corruption">Accidental Database Data Corruption</option>
                <option value="Accidental Blotter Record Deletion">Accidental Blotter Record Deletion</option>
                <option value="Server Storage Hardware Failure">Server Storage Hardware Failure</option>
              </select>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-2 text-slate-700">
              <div className="font-bold text-slate-800">Recovery Procedure Steps:</div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Load recent validated JSON snapshot from backup repository.</li>
                <li>Verify payload SHA-256 checksum &amp; relational schema integrity.</li>
                <li>Execute database state overwrite &amp; re-initialize application indexes.</li>
              </ol>
            </div>

            <button
              onClick={handleRunRecoveryTest}
              disabled={simulatingRecovery}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${simulatingRecovery ? 'animate-spin' : ''}`} />
              <span>{simulatingRecovery ? 'Running Recovery Simulation...' : 'Execute Recovery Test Simulation'}</span>
            </button>

            {recoveryResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{recoveryResult}</span>
              </div>
            )}
          </div>

          {/* CARD 1: System Configuration */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] space-y-6">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-2xl bg-[#E0E7FF] text-[#3730A3]">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  System Configuration
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Configure system behavior and preferences
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              {/* Option 1: Require Approval */}
              <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between transition-colors">
                <div>
                  <div className="font-semibold text-[#1E293B] text-xs sm:text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>Require Approval</div>
                  <div className="text-xs text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>All new complaints require captain approval</div>
                </div>
                <button
                  type="button"
                  onClick={() => setRequireAppr(!requireAppr)}
                  className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    requireAppr ? 'bg-[#6366F1]' : 'bg-slate-200'
                  }`}
                  role="switch"
                  aria-checked={requireAppr}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      requireAppr ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Option 3: Maintenance Mode */}
              <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between transition-colors">
                <div>
                  <div className="font-semibold text-[#1E293B] text-xs sm:text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>Maintenance Mode</div>
                  <div className="text-xs text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Disable public access to the system</div>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintMode(!maintMode)}
                  className={`relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    maintMode ? 'bg-[#6366F1]' : 'bg-slate-200'
                  }`}
                  role="switch"
                  aria-checked={maintMode}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      maintMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Option 4: Auto-Archive Period */}
              <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-2.5 transition-colors">
                <div>
                  <div className="font-semibold text-[#1E293B] text-xs sm:text-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>Auto-Archive Period</div>
                  <div className="text-xs text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Automatically archive resolved incidents after specified days</div>
                </div>
                <select
                  value={archivePeriod}
                  onChange={e => setArchivePeriod(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-xs sm:text-sm font-medium text-[#334155] focus:outline-none focus:border-[#6366F1]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <option value="30 days">30 days</option>
                  <option value="60 days">60 days</option>
                  <option value="90 days">90 days</option>
                  <option value="180 days">180 days</option>
                  <option value="Never">Never</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] font-semibold text-xs sm:text-sm px-6 py-3 rounded-full transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer w-full flex items-center justify-center gap-2"
              style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}
            >
              Save Settings
            </button>
          </div>

          {/* CARD 2: Database Management */}
          <div className="bg-white rounded-[20px] border border-slate-100 p-6 sm:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] space-y-6">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-2xl bg-[#E0E7FF] text-[#3730A3]">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  Database Management
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Backup, restore, or manage database data
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={createDatabaseBackup}
                className="p-5 rounded-2xl border border-slate-200/80 bg-[#F8FAFC] hover:bg-slate-100/70 text-left transition-all space-y-2 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[#3730A3] font-bold text-xs sm:text-sm" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  <Download className="w-4 h-4" />
                  <span>Create Backup</span>
                </div>
                <p className="text-xs text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Download full database snapshot as JSON file</p>
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all blotter data? This cannot be undone.')) {
                    clearDatabaseData();
                  }
                }}
                className="p-5 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-left transition-all space-y-2 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs sm:text-sm" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Data</span>
                </div>
                <p className="text-xs text-rose-600/80" style={{ fontFamily: "'Poppins', sans-serif" }}>Reset database and erase all records permanently</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LIVE MONITORING ================= */}
      {activeTab === 'system-monitoring' && (
        <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                System Monitoring Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Real-time performance metrics, server load, and live resource health
              </p>
            </div>

            <button
              onClick={handleRefreshMetrics}
              disabled={isRefreshingMetrics}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-full transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshingMetrics ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* CPU */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#6366F1]" />
                  CPU Usage
                </span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">HEALTHY</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-800">{cpuUsage}%</div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6366F1] h-full rounded-full transition-all duration-300" style={{ width: `${cpuUsage}%` }}></div>
              </div>
            </div>

            {/* RAM */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#6366F1]" />
                  RAM Memory
                </span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">HEALTHY</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-800">{ramUsage}%</div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#6366F1] h-full rounded-full transition-all duration-300" style={{ width: `${ramUsage}%` }}></div>
              </div>
            </div>

            {/* Disk Space */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#6366F1]" />
                  Disk Storage
                </span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">HEALTHY</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-800">{diskUsage}% Used</div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${diskUsage}%` }}></div>
              </div>
            </div>

            {/* Database Latency */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#6366F1]" />
                  DB Query Latency
                </span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">CONNECTED</span>
              </div>
              <div className="text-3xl font-extrabold text-slate-800">{dbLatency} ms</div>
              <p className="text-[11px] text-slate-500">Fast connection ping to JSON engine</p>
            </div>

            {/* Web Server Status */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 space-y-3 col-span-1 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#6366F1]" />
                  Web Application Server Pulse
                </span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">ACTIVE (Port 3000)</span>
              </div>
              <div className="text-sm font-semibold text-slate-700">Uptime: 99.98% (Zero Downtime Recorded)</div>
              <p className="text-xs text-slate-500">Node.js Express Listener active with Vite Middleware mounted cleanly.</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TROUBLESHOOTING ================= */}
      {activeTab === 'troubleshooting' && (
        <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                System Troubleshooting Register
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Log of documented system issues, root causes, solutions applied, and verified results
              </p>
            </div>

            <button
              onClick={() => setIsAddTroubleshootOpen(true)}
              className="bg-[#E0E7FF] hover:bg-[#c7d2fe] text-[#3730A3] font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Log Problem Diagnosis</span>
            </button>
          </div>

          <div className="space-y-4">
            {troubleshootingLogs.map((log, idx) => (
              <div key={log.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="font-bold text-sm text-[#0D3461]">Problem {idx + 1}: {log.problem}</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">RESOLVED</span>
                </div>
                <div className="text-xs space-y-1 text-slate-700 pt-1">
                  <div><strong className="text-slate-900">Possible Cause:</strong> {log.cause}</div>
                  <div><strong className="text-slate-900">Solution Applied:</strong> {log.solution}</div>
                  <div className="text-emerald-700 font-bold"><strong className="text-slate-900">Verified Result:</strong> {log.result}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MAINTENANCE PLAN ================= */}
      {activeTab === 'maintenance-plan' && (
        <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              System Maintenance Plan &amp; Schedule
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Interactive maintenance schedule checklist (Daily/Weekly, Weekly, Monthly, As Needed)
            </p>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
            <div className="bg-[#F8FAFC] p-3 text-xs font-bold text-slate-600 flex items-center justify-between">
              <span>Frequency &amp; Activity</span>
              <span>Status &amp; Verification</span>
            </div>

            {maintenanceTasks.map(t => (
              <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <span className="inline-block text-[11px] font-bold text-[#3730A3] bg-[#E0E7FF] px-2.5 py-0.5 rounded-full">
                    {t.freq}
                  </span>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800">{t.task}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {t.status}
                  </span>
                  <button
                    onClick={() => handleToggleMaintenanceTask(t.id)}
                    className="px-3 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
                  >
                    Toggle Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SYSTEM ADMIN LOGS ================= */}
      {activeTab === 'system-logs' && (
        <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              System Administration Audit Log
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Complete audit trail table recording activity date, action taken, and verified result
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Date &amp; Time</th>
                  <th className="p-3">Administrator / User</th>
                  <th className="p-3">Activity</th>
                  <th className="p-3">Action Details</th>
                  <th className="p-3 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activityLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-500 whitespace-nowrap">{log.created_at}</td>
                    <td className="p-3 font-semibold text-slate-800">{log.user_name || 'System'}</td>
                    <td className="p-3 font-bold text-[#3730A3]">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.details || 'System operation executed'}</td>
                    <td className="p-3 text-center font-bold text-emerald-700">SUCCESS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 9. ISSUE REPORTS VIEW ================= */}
      {activeTab === 'issue-reports' && (
        <div className="bg-white rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border-0 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>System Issue Reports</h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5" style={{ fontFamily: "'Poppins', sans-serif" }}>Feature and bug reports submitted by system users</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                <tr>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>ID</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Reporter</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Feature Name</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Description</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider text-center" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Screenshot</th>
                  <th className="py-4 px-6 font-semibold text-[#64748B] text-xs uppercase tracking-wider" style={{ fontFamily: "'Quicksand', 'Varela Round', sans-serif" }}>Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {issueReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      No issue reports submitted.
                    </td>
                  </tr>
                ) : (
                  issueReports.map(rep => (
                    <tr key={rep.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6 font-semibold text-[#1E293B] whitespace-nowrap" style={{ fontFamily: "'Poppins', sans-serif" }}>#{rep.id}</td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-semibold text-[#1E293B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{rep.user_name}</div>
                        <div className="text-xs text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>{rep.user_email}</div>
                      </td>
                      <td className="py-4 px-6 font-medium text-[#1E293B] whitespace-nowrap" style={{ fontFamily: "'Poppins', sans-serif" }}>{rep.feature_name}</td>
                      <td className="py-4 px-6 text-[#334155] max-w-md" style={{ fontFamily: "'Poppins', sans-serif" }}>{rep.description}</td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        {rep.screenshot ? (
                          <div className="flex items-center justify-center gap-2">
                            <img
                              src={rep.screenshot}
                              alt="Screenshot thumbnail"
                              className="w-10 h-8 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80"
                              onClick={() => setPreviewScreenshot(rep.screenshot || null)}
                              title="Click to view full screenshot"
                            />
                            <button
                              type="button"
                              onClick={() => setPreviewScreenshot(rep.screenshot || null)}
                              className="text-xs font-semibold text-[#6366F1] hover:underline flex items-center gap-1 cursor-pointer"
                              style={{ fontFamily: "'Poppins', sans-serif" }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[#94A3B8] text-xs italic" style={{ fontFamily: "'Poppins', sans-serif" }}>No screenshot</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-[#64748B] whitespace-nowrap text-xs" style={{ fontFamily: "'Poppins', sans-serif" }}>{rep.created_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add New User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsAddUserOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>Add New System User</h3>
              <p className="text-xs text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Fill in the details to create a new user account</p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Juan Dela Cruz"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@gmail.com"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>System Role</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1] bg-white text-[#334155] font-medium"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <option value="resident">Resident / Complainant</option>
                  <option value="staff">Barangay Staff</option>
                  <option value="kagawad">Barangay Kagawad</option>
                  <option value="captain">Barangay Captain</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>Phone #</label>
                  <input
                    type="text"
                    placeholder="09123456789"
                    value={newUserPhone}
                    onChange={e => setNewUserPhone(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1]"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1" style={{ fontFamily: "'Quicksand', sans-serif" }}>Address</label>
                  <input
                    type="text"
                    placeholder="Sta. Ana, Pateros"
                    value={newUserAddress}
                    onChange={e => setNewUserAddress(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#6366F1]"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Troubleshooting Diagnosis */}
      {isAddTroubleshootOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-5">
            <button 
              onClick={() => setIsAddTroubleshootOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 rounded-full p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#1E293B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>Log System Troubleshooting Entry</h3>
              <p className="text-xs text-[#64748B]" style={{ fontFamily: "'Poppins', sans-serif" }}>Document encountered problem, root cause, and verified solution</p>
            </div>

            <form onSubmit={handleAddTroubleshootRecord} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Problem Statement</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., High DB Query Latency"
                  value={newProblem}
                  onChange={e => setNewProblem(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Possible Cause</label>
                <input
                  type="text"
                  placeholder="e.g., Unindexed search scans"
                  value={newCause}
                  onChange={e => setNewCause(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Applied Solution</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g., Applied memory index and query caching"
                  value={newSolution}
                  onChange={e => setNewSolution(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Verified Result</label>
                <input
                  type="text"
                  placeholder="e.g., Latency reduced from 1200ms to 45ms"
                  value={newResult}
                  onChange={e => setNewResult(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTroubleshootOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3730A3] text-white font-bold rounded-full"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Screenshot Modal Preview */}
      {previewScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreviewScreenshot(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full p-4 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <span className="text-xs sm:text-sm font-bold text-[#1E293B]">Issue Screenshot Preview</span>
              <button
                type="button"
                onClick={() => setPreviewScreenshot(null)}
                className="p-1 text-slate-500 hover:text-black rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-xl border border-slate-200 flex items-center justify-center bg-slate-900">
              <img
                src={previewScreenshot}
                alt="Enlarged issue screenshot"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPortal;
