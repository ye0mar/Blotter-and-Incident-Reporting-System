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

// Seed records for active demonstration and KPI numbers
export const INITIAL_BLOTTERS: BlotterRecord[] = [
  {
    id: 1,
    blotter_id: 'BLT-2026-0001',
    complainant_name: 'Juan Dela Cruz',
    complainant_phone: '0917-555-0101',
    complainant_address: '123 P. Rosales St., Purok 1, Sta. Ana, Pateros',
    complainant_relation: 'Complainant',
    respondent_name: 'Pedro Penduko',
    respondent_phone: '0918-555-0201',
    respondent_address: '125 P. Rosales St., Purok 1, Sta. Ana, Pateros',
    incident_type: 'Ingay sa Komunidad',
    incident_types: ['Ingay sa Komunidad'],
    incident_location: 'Purok 1, Sta. Ana, Pateros',
    incident_datetime: '2026-11-01T22:30:00',
    incident_description: 'Nagreklamo ang nag-uulat hinggil sa malakas na videoke at inuman sa tapat ng kanilang tahanan lampas alas-10:00 ng gabi.',
    status: 'pending',
    assigned_to: null,
    assigned_to_name: null,
    actions: ['Iskedyul ng Mediasyon', 'Pagpapadala ng Patawag (Summons)'],
    reported_at: '2026-11-02 08:45:00',
    official_name: 'Duty Desk Officer'
  },
  {
    id: 2,
    blotter_id: 'BLT-2026-0002',
    complainant_name: 'Maria Santos',
    complainant_phone: '0919-555-0102',
    complainant_address: '45 M. Almeda St., Purok 3, Sta. Ana, Pateros',
    complainant_relation: 'Property Owner',
    respondent_name: 'Ana Reyes',
    respondent_phone: '0920-555-0202',
    respondent_address: '47 M. Almeda St., Purok 3, Sta. Ana, Pateros',
    incident_type: 'Alitan sa Kapitbahay',
    incident_types: ['Alitan sa Kapitbahay'],
    incident_location: 'Purok 3, Sta. Ana, Pateros',
    incident_datetime: '2026-11-03T09:15:00',
    incident_description: 'Pagtatalo tungkol sa itinayong bakod na umano ay lumagpas sa hangganan ng lupa ng nag-uulat.',
    status: 'investigating',
    assigned_to: 3,
    assigned_to_name: 'Kagawad on Peace & Order',
    actions: ['Ocular Inspection', 'Unang Pagdinig ng Lupon'],
    notes: [
      {
        id: 1,
        noted_by: 3,
        noted_by_name: 'Kagawad on Peace & Order',
        notes: 'Nagsagawa ng paunang pagbisita sa lugar. Hiniling sa magkabilang panig na dalhin ang kopya ng titulo o sketch plan.',
        created_at: '2026-11-03 15:20:00'
      }
    ],
    reported_at: '2026-11-03 10:30:00',
    official_name: 'Kagawad on Peace & Order'
  },
  {
    id: 3,
    blotter_id: 'BLT-2026-0003',
    complainant_name: 'Roberto Gomez',
    complainant_phone: '0917-555-0103',
    complainant_address: '88 B. Morcilla St., Sta. Ana, Pateros',
    complainant_relation: 'Complainant',
    respondent_name: 'Hindi Kilala (Unknown)',
    respondent_phone: '',
    respondent_address: 'Sta. Ana, Pateros',
    incident_type: 'Pagnanakaw',
    incident_types: ['Pagnanakaw'],
    incident_location: 'Barangay Plaza, Sta. Ana, Pateros',
    incident_datetime: '2026-10-28T14:20:00',
    incident_description: 'Naiwan ang bisikleta malapit sa entrada ng plaza at nadiskubreng nawawala pagkalipas ng dalawampung minuto. Narekober ito sa tulong ng CCTV review.',
    status: 'resolved',
    assigned_to: 3,
    assigned_to_name: 'Kagawad on Peace & Order',
    actions: ['CCTV Review', 'Pagbabalik ng Ari-arian', 'Kasunduan'],
    notes: [
      {
        id: 1,
        noted_by: 3,
        noted_by_name: 'Kagawad on Peace & Order',
        notes: 'Naibalik ang bisikleta sa may-ari matapos ang imbestigasyon at nakipagkasundo sa himpilan ng barangay.',
        created_at: '2026-10-30 16:00:00'
      }
    ],
    reported_at: '2026-10-28 15:45:00',
    official_name: 'Hon. Barangay Captain'
  },
  {
    id: 4,
    blotter_id: 'BLT-2026-0004',
    complainant_name: 'Elena Villanueva',
    complainant_phone: '0921-555-0104',
    complainant_address: '19 Alley 4, Purok 2, Sta. Ana, Pateros',
    complainant_relation: 'Complainant',
    respondent_name: 'Marco Bautista',
    respondent_phone: '0922-555-0204',
    respondent_address: '22 Alley 4, Purok 2, Sta. Ana, Pateros',
    incident_type: 'Utang / Panloloko',
    incident_types: ['Utang / Panloloko'],
    incident_location: 'Purok 2, Sta. Ana, Pateros',
    incident_datetime: '2026-11-04T11:00:00',
    incident_description: 'Hindi pagbabayad ng napagkasunduang halaga na Php 8,500.00 na lampas na sa takdang petsa ng pagbabayad.',
    status: 'investigating',
    assigned_to: 3,
    assigned_to_name: 'Kagawad on Peace & Order',
    actions: ['Pagpapadala ng Patawag (Summons)', 'Iskedyul ng Mediasyon'],
    reported_at: '2026-11-04 13:10:00',
    official_name: 'Duty Desk Officer'
  },
  {
    id: 5,
    blotter_id: 'BLT-2026-0005',
    complainant_name: 'Carlos Mendoza',
    complainant_phone: '0918-555-0105',
    complainant_address: '71 F. Imson St., Sta. Ana, Pateros',
    complainant_relation: 'Victim',
    respondent_name: 'Ramon Navarro',
    respondent_phone: '0919-555-0205',
    respondent_address: '75 F. Imson St., Sta. Ana, Pateros',
    incident_type: 'Paninirang Puri',
    incident_types: ['Paninirang Puri', 'Pagbabanta'],
    incident_location: 'F. Imson St., Sta. Ana, Pateros',
    incident_datetime: '2026-10-20T17:30:00',
    incident_description: 'Pagbibitaw ng masasakit na salita at pananakot sa harap ng mga kapitbahay. Nagkaayos ang magkabilang panig sa harap ng Punong Barangay.',
    status: 'archived',
    assigned_to: 3,
    assigned_to_name: 'Kagawad on Peace & Order',
    actions: ['Mediasyon ng Lupon', 'Amicable Settlement'],
    notes: [
      {
        id: 1,
        noted_by: 2,
        noted_by_name: 'Hon. Barangay Captain',
        notes: 'Nilagdaan ng magkabilang panig ang Kasunduang Pag-aayos noong Oktubre 25, 2026.',
        created_at: '2026-10-25 11:00:00'
      }
    ],
    reported_at: '2026-10-20 18:15:00',
    official_name: 'Hon. Barangay Captain'
  }
];

export const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: 1,
    blotter_id: 'BLT-2026-0001',
    blotter_record_id: 1,
    schedule_date: '2026-11-16T09:30:00',
    location: 'Barangay Hall - Lupong Tagapamayapa Room',
    action_type: 'Mediator',
    notes: 'Unang paghaharap para sa reklamo sa ingay sa komunidad.',
    created_by: 4,
    created_by_name: 'Duty Desk Officer',
    complainant_name: 'Juan Dela Cruz',
    respondent_name: 'Pedro Penduko',
    incident_type: 'Ingay sa Komunidad',
    created_at: '2026-11-02'
  },
  {
    id: 2,
    blotter_id: 'BLT-2026-0002',
    blotter_record_id: 2,
    schedule_date: '2026-11-17T14:00:00',
    location: 'Purok 3 Boundary Site / Barangay Hall Conference Room',
    action_type: 'Investigating',
    notes: 'Ocular inspection at pagsusuri ng dokumento ng lupa.',
    created_by: 3,
    created_by_name: 'Kagawad on Peace & Order',
    complainant_name: 'Maria Santos',
    respondent_name: 'Ana Reyes',
    incident_type: 'Alitan sa Kapitbahay',
    created_at: '2026-11-03'
  },
  {
    id: 3,
    blotter_id: 'BLT-2026-0004',
    blotter_record_id: 4,
    schedule_date: '2026-11-18T10:00:00',
    location: 'Barangay Hall - Mediation Room A',
    action_type: 'Hearing',
    notes: 'Pagdinig ukol sa kasunduan sa pagbabayad ng utang.',
    created_by: 4,
    created_by_name: 'Duty Desk Officer',
    complainant_name: 'Elena Villanueva',
    respondent_name: 'Marco Bautista',
    incident_type: 'Utang / Panloloko',
    created_at: '2026-11-04'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 1,
    user_id: 1,
    user_name: 'System Administrator',
    action: 'SYSTEM_INITIALIZED',
    details: 'Initial system configuration verified and database schema deployed.',
    created_at: '2026-11-01 08:00:00'
  },
  {
    id: 2,
    user_id: 4,
    user_name: 'Duty Desk Officer',
    action: 'BLOTTER_CREATED',
    details: 'Recorded new incident BLT-2026-0001 (Ingay sa Komunidad).',
    created_at: '2026-11-02 08:46:00'
  },
  {
    id: 3,
    user_id: 3,
    user_name: 'Kagawad on Peace & Order',
    action: 'CASE_ASSIGNED',
    details: 'Assigned BLT-2026-0002 (Alitan sa Kapitbahay) for investigation and ocular inspection.',
    created_at: '2026-11-03 10:35:00'
  },
  {
    id: 4,
    user_id: 2,
    user_name: 'Hon. Barangay Captain',
    action: 'CASE_ARCHIVED',
    details: 'Approved settlement and archived BLT-2026-0005 after amicable resolution.',
    created_at: '2026-10-25 11:05:00'
  }
];
