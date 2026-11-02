export type UserRole = 'admin' | 'captain' | 'kagawad' | 'staff' | 'resident';
export type UserStatus = 'active' | 'pending' | 'inactive';

export interface User {
  id: number;
  user_id: string; // e.g. U001
  full_name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  address?: string;
  created_at: string;
}

export type BlotterStatus = 'pending' | 'investigating' | 'resolved' | 'archived';

export interface BlotterNote {
  id: number;
  noted_by: number;
  noted_by_name: string;
  notes: string;
  created_at: string;
}

export interface BlotterAttachment {
  id: number | string;
  file_name: string;
  file_size?: string;
  file_type?: string;
  uploaded_by_name?: string;
  uploaded_at?: string;
  previewUrl?: string;
  isImage?: boolean;
}

export interface BlotterRecord {
  id: number;
  blotter_id: string; // e.g. BLT-2026-0001
  // Complainant
  complainant_id?: number | null;
  complainant_name: string;
  complainant_phone?: string;
  complainant_address?: string;
  complainant_relation?: string;
  // Respondent
  respondent_name: string;
  respondent_phone?: string;
  respondent_address?: string;
  // Incident details
  incident_type: string;
  incident_types?: string[];
  incident_location: string;
  incident_datetime: string;
  incident_description: string;
  // Status & assignment
  status: BlotterStatus;
  assigned_to?: number | null;
  assigned_to_name?: string | null;
  updated_by?: number | null;
  updated_by_name?: string | null;
  // Official signatures
  official_name?: string;
  official_signature?: string | null;
  complainant_signature?: string | null;
  // Actions taken
  actions?: string[];
  // Notes & Attachments
  notes?: BlotterNote[];
  attachments?: BlotterAttachment[];
  // Timestamps
  reported_at: string;
  updated_at?: string;
}

export type ScheduleActionType = 'Mediator' | 'Investigating' | 'Hearing' | 'Follow-up';

export interface Schedule {
  id: number;
  blotter_id: string; // BLT-2026-0001
  blotter_record_id: number;
  schedule_date: string; // YYYY-MM-DDTHH:mm or ISO
  location: string;
  action_type: ScheduleActionType;
  notes?: string;
  created_by?: number;
  created_by_name?: string;
  complainant_name?: string;
  respondent_name?: string;
  incident_type?: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  user_name?: string;
  action: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface SystemSettingsConfig {
  emailNotification: boolean;
  requireApproval: boolean;
  maintenanceMode: boolean;
  autoArchivePeriod: string; // '30 days' | '60 days' | '90 days' | '180 days' | 'Never'
  lastBackupDate?: string;
}

export interface IssueReport {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  feature_name: string;
  description: string;
  screenshot?: string;
  screenshot_name?: string;
  created_at: string;
}
