import { Timestamp } from 'firebase/firestore';

export interface ClassroomSettings {
  startingBalance: number;
  allowShortSelling: boolean;
  allowOptions: boolean;
  maxPositions: number;
  restrictedAssets: string[];
}

export interface ClassroomAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

export interface ClassroomAssignment {
  id: string;
  lessonId: number;
  title: string;
  assignedAt: any;
  dueDate?: string | null;
  xpReward?: number;
}

export interface StudentGoal {
  id: string;
  studentId?: string; // empty/null = assigned to all students in classroom
  studentName?: string;
  title: string;
  type: 'portfolio_value' | 'stock_profit' | 'execute_orders' | 'complete_lessons';
  targetValue: number; // e.g. 12000 cash/portfolio, 500 profit, 5 orders, 3 lessons
  ticker?: string; // applicable if stock_profit or specific order
  description: string;
  assignedAt: any;
}

export interface Classroom {
  id: string;
  classCode: string; // 6-character unique string, e.g. TR389X
  className: string;
  teacherId: string;
  createdAt: Timestamp | any;
  settings: ClassroomSettings;
  archived?: boolean;
}

export interface StudentRosterMember {
  id: string; // Student UID
  joinedAt: Timestamp | any;
  displayName: string;
  portfolioValue?: number;
  cashBalance?: number;
  tradesCount?: number;
  completedLessonCount?: number;
  completedLessonIds?: number[];
  goalsProgress?: Record<string, { current: number; completed: boolean }>;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  classCode?: string | null;
  classId?: string | null;
  activeClassId?: string | null;
  teacherClassIds?: string[];
  role: 'teacher' | 'student' | 'regular';
  createdAt?: Timestamp | any;
}

