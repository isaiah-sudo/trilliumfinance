import { Timestamp } from 'firebase/firestore';

export interface ClassroomSettings {
  startingBalance: number;
  allowShortSelling: boolean;
  allowOptions: boolean;
  maxPositions: number;
  restrictedAssets: string[];
}

export interface Classroom {
  id: string;
  classCode: string; // 6-character unique string, e.g. TR389X
  className: string;
  teacherId: string;
  createdAt: Timestamp | any;
  settings: ClassroomSettings;
}

export interface StudentRosterMember {
  id: string; // Student UID
  joinedAt: Timestamp | any;
  displayName: string;
  portfolioValue?: number;
  cashBalance?: number;
  tradesCount?: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  classCode?: string | null;
  role: 'teacher' | 'student' | 'regular';
  createdAt?: Timestamp | any;
}
