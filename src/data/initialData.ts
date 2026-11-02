import { User, BlotterRecord, Schedule, ActivityLog } from '../types';

export const INITIAL_OFFICIAL_PASSWORDS: Record<string, string> = {
  'admin@staana.gov.ph': 'Admin#StaAna2026!',
  'captain@staana.gov.ph': 'Captain#StaAna2026!',
  'kagawad@staana.gov.ph': 'Kagawad#StaAna2026!',
  'staff@staana.gov.ph': 'Staff#StaAna2026!'
};

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    user_id: 'U001',
    full_name: 'System Administrator',
    email: 'admin@staana.gov.ph',
    role: 'admin',
    status: 'active',
    phone: '0917-000-0001',
    address: 'Barangay Hall, Sta. Ana, Pateros',
    created_at: '2026-01-01 08:00:00'
  },
  {
    id: 2,
    user_id: 'U002',
    full_name: 'Hon. Barangay Captain',
    email: 'captain@staana.gov.ph',
    role: 'captain',
    status: 'active',
    phone: '0917-000-0002',
    address: 'Office of the Punong Barangay, Sta. Ana, Pateros',
    created_at: '2026-01-02 08:00:00'
  },
  {
    id: 3,
    user_id: 'U003',
    full_name: 'Kagawad on Peace & Order',
    email: 'kagawad@staana.gov.ph',
    role: 'kagawad',
    status: 'active',
    phone: '0917-000-0003',
    address: 'Katarungang Pambarangay Office, Sta. Ana, Pateros',
    created_at: '2026-01-03 08:00:00'
  },
  {
    id: 4,
    user_id: 'U004',
    full_name: 'Duty Desk Officer',
    email: 'staff@staana.gov.ph',
    role: 'staff',
    status: 'active',
    phone: '0917-000-0004',
    address: 'Intake & Records Desk, Sta. Ana, Pateros',
    created_at: '2026-01-04 08:00:00'
  }
];

// Start with clean, empty states ready for actual database integration
export const INITIAL_BLOTTERS: BlotterRecord[] = [];
export const INITIAL_SCHEDULES: Schedule[] = [];
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];
