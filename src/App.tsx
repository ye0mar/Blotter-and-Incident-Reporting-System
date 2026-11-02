import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AdminPortal } from './admin';
import { CaptainPortal } from './captain';
import { KagawadPortal } from './kagawad';
import { StaffPortal } from './staff';
import { ResidentPortal } from './resident';
import { LoginView } from './views/LoginView';
import { PendingApprovalView } from './views/PendingApprovalView';
import { ProfileView } from './views/ProfileView';
import { PreferencesView } from './views/PreferencesView';
import { ReportIssueView } from './views/ReportIssueView';
import { PrintDossierModal } from './components/PrintDossierModal';

export const App: React.FC = () => {
  const { currentUser, activeTab } = useApp();

  const renderContent = () => {
    if (!currentUser || activeTab === 'login') {
      return <LoginView />;
    }

    // Profile Page: User Information + Security & Password
    if (activeTab === 'profile' || activeTab === 'account' || activeTab === 'settings') {
      return <ProfileView />;
    }

    // Preferences & Notifications Page (Separate)
    if (activeTab === 'preferences' || activeTab === 'notifications') {
      return <PreferencesView />;
    }

    // Report a Broken Feature or Issue Page (Separate)
    if (activeTab === 'report-issue') {
      return <ReportIssueView />;
    }

    // Gatekeeping: If account is pending approval by admin
    if (currentUser.status === 'pending') {
      return <PendingApprovalView />;
    }

    // Role: ADMIN
    if (currentUser.role === 'admin') {
      return <AdminPortal />;
    }

    // Role: CAPTAIN
    if (currentUser.role === 'captain') {
      return <CaptainPortal />;
    }

    // Role: KAGAWAD
    if (currentUser.role === 'kagawad') {
      return <KagawadPortal />;
    }

    // Role: STAFF
    if (currentUser.role === 'staff') {
      return <StaffPortal />;
    }

    // Role: RESIDENT
    if (currentUser.role === 'resident') {
      return <ResidentPortal />;
    }

    return <StaffPortal />;
  };

  const showHeader = currentUser && activeTab !== 'login';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-800 selection:bg-slate-200 selection:text-slate-900">
      {showHeader && <Header />}
      <main id="app-main-layout" className="flex-1 pb-16 print:hidden">
        {renderContent()}
      </main>

      {/* Global Modals */}
      <PrintDossierModal />
    </div>
  );
};

export default App;
