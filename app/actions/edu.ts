import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, setDoc, serverTimestamp, getDocs, writeBatch, query, where, limit, deleteDoc } from 'firebase/firestore';
import { ClassroomSettings } from '@/types/education';

// Helper to get authenticated UID on the client
async function getAuthenticatedUserId() {
  let user = auth.currentUser;
  
  if (!user) {
    await new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((u) => {
        user = u;
        unsubscribe();
        resolve();
      });
    });
  }

  if (!user) {
    throw new Error('Unauthorized: No user is currently signed in.');
  }

  return user.uid;
}

/**
 * Assigns a user their educational role ('teacher' or 'student' or 'regular')
 * Updates the Firestore user metadata.
 */
export async function setUserRole(role: 'teacher' | 'student' | 'regular', name: string) {
  const userId = await getAuthenticatedUserId();

  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      role,
      name,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { success: true, role };
  } catch (error: any) {
    console.error('Failed to set user role:', error);
    throw new Error(error.message || 'Failed to assign role.');
  }
}

/**
 * Generates a unique 6-character alphanumeric classroom code.
 */
function generateClassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Creates a classroom under a teacher's account. Supports multiple classrooms.
 */
export async function createClassroom(className: string, initialSettings?: Partial<ClassroomSettings>) {
  const userId = await getAuthenticatedUserId();
  const classCode = generateClassCode();

  try {
    const classroomRef = doc(collection(db, 'classrooms'));
    const settings: ClassroomSettings = {
      startingBalance: initialSettings?.startingBalance ?? 10000,
      allowShortSelling: initialSettings?.allowShortSelling ?? true,
      allowOptions: initialSettings?.allowOptions ?? true,
      maxPositions: initialSettings?.maxPositions ?? 10,
      restrictedAssets: initialSettings?.restrictedAssets ?? []
    };

    await setDoc(classroomRef, {
      classCode,
      className,
      teacherId: userId,
      createdAt: serverTimestamp(),
      settings
    });

    // Fetch existing teacher document to update teacherClassIds array and activeClassId
    const teacherRef = doc(db, 'users', userId);
    const teacherSnap = await getDoc(teacherRef);
    const teacherData = teacherSnap.exists() ? teacherSnap.data() : {};

    const existingClassIds: string[] = teacherData.teacherClassIds || (teacherData.classId ? [teacherData.classId] : []);
    if (!existingClassIds.includes(classroomRef.id)) {
      existingClassIds.push(classroomRef.id);
    }

    await setDoc(teacherRef, {
      role: 'teacher',
      classId: classroomRef.id,
      activeClassId: classroomRef.id,
      teacherClassIds: existingClassIds,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { success: true, classCode, classId: classroomRef.id };
  } catch (error: any) {
    console.error('Failed to create classroom:', error);
    throw new Error(error.message || 'Failed to create classroom.');
  }
}

/**
 * Switches teacher's currently active classroom.
 */
export async function switchActiveClassroom(targetClassId: string) {
  const userId = await getAuthenticatedUserId();
  try {
    const teacherRef = doc(db, 'users', userId);
    await setDoc(teacherRef, {
      classId: targetClassId,
      activeClassId: targetClassId
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to switch active classroom:', error);
    throw new Error(error.message || 'Failed to switch classroom.');
  }
}

/**
 * Gets all classrooms created by the current teacher.
 */
export async function getTeacherClassrooms() {
  const userId = await getAuthenticatedUserId();

  try {
    const classroomsRef = collection(db, 'classrooms');
    const q = query(classroomsRef, where('teacherId', '==', userId));
    const snap = await getDocs(q);

    const classrooms = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        className: data.className || 'Classroom',
        classCode: data.classCode || '',
        createdAt: data.createdAt,
        settings: data.settings
      };
    });

    return classrooms;
  } catch (error: any) {
    console.error('Failed to fetch teacher classrooms:', error);
    return [];
  }
}

/**
 * Enrolls a student in a classroom based on a 6-character code.
 */
export async function joinClassroom(classCode: string, studentName: string) {
  const userId = await getAuthenticatedUserId();
  const upperCode = classCode.toUpperCase().trim();

  try {
    // 1. Find classroom with code
    const classroomsRef = collection(db, 'classrooms');
    const q = query(classroomsRef, where('classCode', '==', upperCode), limit(1));
    const classroomsSnap = await getDocs(q);

    if (classroomsSnap.empty) {
      throw new Error(`Classroom code '${upperCode}' does not exist.`);
    }

    const classDoc = classroomsSnap.docs[0];
    const classData = classDoc.data();
    const classId = classDoc.id;
    const settings = classData.settings as ClassroomSettings;

    // 2. Register membership in `/classrooms/{classId}/roster/{studentId}`
    const rosterRef = doc(db, 'classrooms', classId, 'roster', userId);
    
    // Check starting balance rule (defaults to 10000)
    const startingBalance = settings?.startingBalance ?? 10000;

    // 3. Create or update user metadata and initialize portfolio
    const userRef = doc(db, 'users', userId);
    const batch = writeBatch(db);

    batch.set(rosterRef, {
      joinedAt: serverTimestamp(),
      displayName: studentName
    });

    batch.set(userRef, {
      classId,
      classCode: upperCode,
      role: 'student',
      name: studentName
    }, { merge: true });

    // Initialize custom student sandbox portfolio with the assigned balance
    const portfolioRef = doc(db, 'users', userId, 'portfolio', 'main');
    batch.set(portfolioRef, {
      cash: startingBalance,
      isEdu: true,
      classId
    }, { merge: true });

    await batch.commit();

    return { success: true, classId, className: classData.className };
  } catch (error: any) {
    console.error('Failed to join classroom:', error);
    throw new Error(error.message || 'Failed to join classroom.');
  }
}

/**
 * Gets student roster for a specific classroom or teacher's active classroom.
 */
export async function getClassroomRoster(targetClassId?: string) {
  const userId = await getAuthenticatedUserId();

  let classId = targetClassId;
  if (!classId) {
    const teacherDoc = await getDoc(doc(db, 'users', userId));
    classId = teacherDoc.data()?.activeClassId || teacherDoc.data()?.classId;
  }
  
  if (!classId) throw new Error('No active classroom found.');

  const classRef = doc(db, 'classrooms', classId);
  const rosterSnap = await getDocs(collection(db, 'classrooms', classId, 'roster'));
  const classroomDoc = await getDoc(classRef);
  const classroomData = classroomDoc.data();

  const roster = [];

  for (const memberDoc of rosterSnap.docs) {
    const data = memberDoc.data();
    const studentId = memberDoc.id;

    // Fetch student portfolio, lesson progress, and transactions
    const portfolioRef = doc(db, 'users', studentId, 'portfolio', 'main');
    const transactionsRef = collection(db, 'users', studentId, 'portfolio_history');
    const eduRef = doc(db, 'users', studentId, 'edu', 'progress');

    const [portDoc, transSnap, eduSnap] = await Promise.all([
      getDoc(portfolioRef),
      getDocs(transactionsRef),
      getDoc(eduRef)
    ]);

    const portData = portDoc.data();
    const cash = portData?.cash ?? 10000;
    
    // Fetch holding valuation
    let holdingsValue = 0;
    const holdingsSnap = await getDocs(collection(db, 'users', studentId, 'portfolio', 'main', 'holdings'));
    
    holdingsSnap.forEach(h => {
      const hData = h.data();
      holdingsValue += (hData.qty || 0) * (hData.avgPrice || 0);
    });

    const eduData = eduSnap.exists() ? eduSnap.data() : {};
    const completedLessonIds: number[] = eduData.completedLessonIds || [];

    roster.push({
      studentId,
      studentName: data.displayName || 'Anonymous Student',
      joinedAt: data.joinedAt?.toDate()?.toLocaleDateString() || 'N/A',
      cashBalance: cash,
      portfolioValue: cash + holdingsValue,
      tradesCount: transSnap.size,
      completedLessonCount: completedLessonIds.length,
      completedLessonIds
    });
  }

  return {
    classId,
    className: classroomData?.className || 'Classroom',
    classCode: classroomData?.classCode || '',
    settings: classroomData?.settings || {},
    roster: roster.sort((a, b) => b.portfolioValue - a.portfolioValue)
  };
}

/**
 * Updates trading settings for a classroom.
 */
export async function updateClassroomSettings(settings: ClassroomSettings, targetClassId?: string) {
  const userId = await getAuthenticatedUserId();

  let classId = targetClassId;
  if (!classId) {
    const teacherDoc = await getDoc(doc(db, 'users', userId));
    classId = teacherDoc.data()?.activeClassId || teacherDoc.data()?.classId;
  }
  if (!classId) throw new Error('No active classroom found.');

  const classRef = doc(db, 'classrooms', classId);
  
  await setDoc(classRef, {
    settings: {
      startingBalance: Number(settings.startingBalance),
      allowShortSelling: Boolean(settings.allowShortSelling),
      allowOptions: Boolean(settings.allowOptions),
      maxPositions: Number(settings.maxPositions),
      restrictedAssets: settings.restrictedAssets.map(t => t.toUpperCase().trim()).filter(Boolean)
    }
  }, { merge: true });

  return { success: true };
}

/**
 * Assign a lesson to a classroom.
 */
export async function assignLessonToClassroom(lessonId: number, title: string, dueDate?: string, targetClassId?: string) {
  const userId = await getAuthenticatedUserId();

  let classId = targetClassId;
  if (!classId) {
    const teacherDoc = await getDoc(doc(db, 'users', userId));
    classId = teacherDoc.data()?.activeClassId || teacherDoc.data()?.classId;
  }
  if (!classId) throw new Error('No active classroom selected.');

  const assignRef = doc(collection(db, 'classrooms', classId, 'assignments'));
  await setDoc(assignRef, {
    lessonId,
    title,
    assignedAt: serverTimestamp(),
    dueDate: dueDate || null
  });

  return { success: true, id: assignRef.id };
}

/**
 * Delete an assigned lesson from a classroom.
 */
export async function removeClassroomAssignment(assignmentId: string, targetClassId?: string) {
  const userId = await getAuthenticatedUserId();

  let classId = targetClassId;
  if (!classId) {
    const teacherDoc = await getDoc(doc(db, 'users', userId));
    classId = teacherDoc.data()?.activeClassId || teacherDoc.data()?.classId;
  }
  if (!classId) throw new Error('No active classroom selected.');

  await deleteDoc(doc(db, 'classrooms', classId, 'assignments', assignmentId));
  return { success: true };
}

/**
 * Fetch all assignments for a classroom.
 */
export async function getClassroomAssignments(targetClassId?: string) {
  const userId = await getAuthenticatedUserId();

  let classId = targetClassId;
  if (!classId) {
    const teacherDoc = await getDoc(doc(db, 'users', userId));
    classId = teacherDoc.data()?.activeClassId || teacherDoc.data()?.classId;
  }
  if (!classId) return [];

  const snap = await getDocs(collection(db, 'classrooms', classId, 'assignments'));
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

/**
 * Create a goal for students in a classroom (e.g. portfolio target, stock profit, orders executed).
 */
export async function setClassroomGoal(goal: {
  title: string;
  type: 'portfolio_value' | 'stock_profit' | 'execute_orders' | 'complete_lessons';
  targetValue: number;
  ticker?: string;
  description: string;
  studentId?: string; // Optional: target single student or all
  studentName?: string;
}, targetClassId?: string) {
  const userId = await getAuthenticatedUserId();

  let classId = targetClassId;
  if (!classId) {
    const teacherDoc = await getDoc(doc(db, 'users', userId));
    classId = teacherDoc.data()?.activeClassId || teacherDoc.data()?.classId;
  }
  if (!classId) throw new Error('No active classroom selected.');

  const goalRef = doc(collection(db, 'classrooms', classId, 'goals'));
  await setDoc(goalRef, {
    ...goal,
    ticker: goal.ticker ? goal.ticker.toUpperCase().trim() : '',
    assignedAt: serverTimestamp()
  });

  return { success: true, id: goalRef.id };
}

/**
 * Delete a goal from a classroom.
 */
export async function removeClassroomGoal(goalId: string, targetClassId?: string) {
  const userId = await getAuthenticatedUserId();

  let classId = targetClassId;
  if (!classId) {
    const teacherDoc = await getDoc(doc(db, 'users', userId));
    classId = teacherDoc.data()?.activeClassId || teacherDoc.data()?.classId;
  }
  if (!classId) throw new Error('No active classroom selected.');

  await deleteDoc(doc(db, 'classrooms', classId, 'goals', goalId));
  return { success: true };
}

/**
 * Fetch all goals for a classroom.
 */
export async function getClassroomGoals(targetClassId?: string) {
  const userId = await getAuthenticatedUserId();

  let classId = targetClassId;
  if (!classId) {
    const teacherDoc = await getDoc(doc(db, 'users', userId));
    classId = teacherDoc.data()?.activeClassId || teacherDoc.data()?.classId;
  }
  if (!classId) return [];

  const snap = await getDocs(collection(db, 'classrooms', classId, 'goals'));
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

/**
 * Create a classroom announcement/broadcast message.
 */
export async function postClassroomAnnouncement(title: string, content: string, targetClassId?: string) {
  const userId = await getAuthenticatedUserId();

  let classId = targetClassId;
  if (!classId) {
    const teacherDoc = await getDoc(doc(db, 'users', userId));
    classId = teacherDoc.data()?.activeClassId || teacherDoc.data()?.classId;
  }
  if (!classId) throw new Error('No active classroom selected.');

  const annRef = doc(collection(db, 'classrooms', classId, 'announcements'));
  await setDoc(annRef, {
    title,
    content,
    createdAt: serverTimestamp()
  });

  return { success: true, id: annRef.id };
}

/**
 * Fetch announcements for a classroom.
 */
export async function getClassroomAnnouncements(targetClassId?: string) {
  const userId = await getAuthenticatedUserId();

  let classId = targetClassId;
  if (!classId) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    classId = userDoc.data()?.activeClassId || userDoc.data()?.classId;
  }
  if (!classId) return [];

  const snap = await getDocs(collection(db, 'classrooms', classId, 'announcements'));
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

/**
 * Remove a student from a classroom roster.
 */
export async function removeStudentFromClassroom(studentId: string, targetClassId?: string) {
  const userId = await getAuthenticatedUserId();

  let classId = targetClassId;
  if (!classId) {
    const teacherDoc = await getDoc(doc(db, 'users', userId));
    classId = teacherDoc.data()?.activeClassId || teacherDoc.data()?.classId;
  }
  if (!classId) throw new Error('No active classroom selected.');

  await deleteDoc(doc(db, 'classrooms', classId, 'roster', studentId));
  
  // Reset student class link
  const studentRef = doc(db, 'users', studentId);
  await setDoc(studentRef, { classId: null, classCode: null }, { merge: true });

  return { success: true };
}

/**
 * Reset a student's portfolio cash balance to the classroom starting balance.
 */
export async function resetStudentPortfolio(studentId: string, targetClassId?: string) {
  const userId = await getAuthenticatedUserId();

  let classId = targetClassId;
  if (!classId) {
    const teacherDoc = await getDoc(doc(db, 'users', userId));
    classId = teacherDoc.data()?.activeClassId || teacherDoc.data()?.classId;
  }
  if (!classId) throw new Error('No active classroom selected.');

  const classDoc = await getDoc(doc(db, 'classrooms', classId));
  const startingBalance = classDoc.data()?.settings?.startingBalance ?? 10000;

  const portfolioRef = doc(db, 'users', studentId, 'portfolio', 'main');
  await setDoc(portfolioRef, { cash: startingBalance }, { merge: true });

  return { success: true };
}

/**
 * Gets student's active classroom details and settings.
 */
export async function getStudentClassroomDetails() {
  const userId = await getAuthenticatedUserId();

  const studentDoc = await getDoc(doc(db, 'users', userId));
  const classId = studentDoc.data()?.classId;
  if (!classId) return null; // Not in a classroom

  const classDoc = await getDoc(doc(db, 'classrooms', classId));
  if (!classDoc.exists()) return null;

  const data = classDoc.data()!;
  
  return {
    classId,
    classCode: data.classCode,
    className: data.className,
    settings: data.settings as ClassroomSettings
  };
}

/**
 * Updates trading rules constraints for a classroom (Legacy rules compat)
 */
export async function updateClassroomRules(rules: {
  maxDailyTrades: number;
  startingCash: number;
  allowedAssets: string[];
  blacklistedAssets: string[];
}) {
  const userId = await getAuthenticatedUserId();

  const teacherDoc = await getDoc(doc(db, 'users', userId));
  const classId = teacherDoc.data()?.activeClassId || teacherDoc.data()?.classId;
  if (!classId) throw new Error('No active classroom found.');

  const classRef = doc(db, 'classrooms', classId);
  
  await setDoc(classRef, {
    rules: {
      maxDailyTrades: Number(rules.maxDailyTrades),
      startingCash: Number(rules.startingCash),
      allowedAssets: rules.allowedAssets.map(t => t.toUpperCase().trim()).filter(Boolean),
      blacklistedAssets: rules.blacklistedAssets.map(t => t.toUpperCase().trim()).filter(Boolean)
    }
  }, { merge: true });

  return { success: true };
}

