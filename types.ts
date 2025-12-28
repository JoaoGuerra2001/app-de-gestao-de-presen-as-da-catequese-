
export type UserRole = 'ADMIN' | 'CATECHIST';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'JUSTIFIED';
export type ReportFormat = 'PDF' | 'EXCEL';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  parish: string;
  group?: string;
  phone?: string;
  photoUrl?: string;
  birthDate?: string;
  entryDate?: string;
  address?: string;
  formationLevel?: string;
  bio?: string;
}

export interface CatechesisClass {
  id: string;
  name: string;
  yearCycle: string;
  parish: string;
  room: string;
  schedule: string;
  assignedCatechistIds: string[];
  photoUrl?: string; // Novo campo
}

export interface Student {
  id: string;
  classId: string;
  fullName: string;
  birthDate: string;
  guardianName: string;
  guardianContact: string;
  isAnonymized?: boolean;
  photoUrl?: string;
}

export interface AttendanceItem {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface Attendance {
  id: string;
  classId: string;
  date: string;
  catechistId: string;
  items: AttendanceItem[];
  observation?: string;
}

export interface Report {
  id: string;
  classId: string;
  type: 'MONTHLY' | 'ANNUAL';
  dateGenerated: string;
  format: ReportFormat;
}

export interface AppNotification {
  id: string;
  classId: string;
  studentId?: string;
  message: string;
  date: string;
  read: boolean;
}

export type Screen = 
  | 'LOGIN' 
  | 'DASHBOARD' 
  | 'CLASS_DETAILS' 
  | 'ATTENDANCE_REGISTRY' 
  | 'STUDENT_HISTORY' 
  | 'PROFILE' 
  | 'NEW_STUDENT' 
  | 'NEW_CLASS' 
  | 'NEW_USER';
