import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, setDoc, serverTimestamp, getDocs, writeBatch, query, where, limit } from 'firebase/firestore';
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
 * Creates a classroom under a teacher's account.
 */
export async function createClassroom(className: string, initialSettings?: Partial<ClassroomSettings>) {
  const userId = await getAuthenticatedUserId();
  const classCode = generateClassCode();

  try {
    const classroomRef = doc(collection(db, 'classrooms'));
    const settings: ClassroomSettings = {
      startingBalance: initialSettings?.startingBalance ?? 100000,
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

    // Save relationship and role on the teacher's profile
    const teacherRef = doc(db, 'users', userId);
    await setDoc(teacherRef, {
      classId: classroomRef.id,
      classCode,
      role: 'teacher'
    }, { merge: true });

    return { success: true, classCode, classId: classroomRef.id };
  } catch (error: any) {
    console.error('Failed to create classroom:', error);
    throw new Error(error.message || 'Failed to create classroom.');
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
    
    // Check starting balance rule
    const startingBalance = settings?.startingBalance ?? 100000;

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
 * Gets student roster for a teacher's classroom.
 */
export async function getClassroomRoster() {
  const userId = await getAuthenticatedUserId();

  // Find class owned by this teacher
  const teacherDoc = await getDoc(doc(db, 'users', userId));
  const classId = teacherDoc.data()?.classId;
  if (!classId) throw new Error('No active classroom found for this teacher.');

  const classRef = doc(db, 'classrooms', classId);
  const rosterSnap = await getDocs(collection(db, 'classrooms', classId, 'roster'));
  const classroomDoc = await getDoc(classRef);
  const classroomData = classroomDoc.data();

  const roster = [];

  for (const memberDoc of rosterSnap.docs) {
    const data = memberDoc.data();
    const studentId = memberDoc.id;

    // Fetch the student's portfolio and transaction counts
    const portfolioRef = doc(db, 'users', studentId, 'portfolio', 'main');
    const transactionsRef = collection(db, 'users', studentId, 'portfolio_history');

    const [portDoc, transSnap] = await Promise.all([
      getDoc(portfolioRef),
      getDocs(transactionsRef)
    ]);

    const portData = portDoc.data();
    const cash = portData?.cash ?? 100000;
    
    // Fetch holding valuation
    let holdingsValue = 0;
    const holdingsSnap = await getDocs(collection(db, 'users', studentId, 'portfolio', 'main', 'holdings'));
    
    holdingsSnap.forEach(h => {
      const hData = h.data();
      holdingsValue += (hData.qty || 0) * (hData.avgPrice || 0); // Simplified using book cost
    });

    roster.push({
      studentId,
      studentName: data.displayName || 'Anonymous Student',
      joinedAt: data.joinedAt?.toDate()?.toLocaleDateString() || 'N/A',
      cashBalance: cash,
      portfolioValue: cash + holdingsValue,
      tradesCount: transSnap.size
    });
  }

  return {
    className: classroomData?.className || 'Classroom',
    classCode: classroomData?.classCode || '',
    settings: classroomData?.settings || {},
    roster: roster.sort((a, b) => b.portfolioValue - a.portfolioValue)
  };
}

/**
 * Updates trading settings for a classroom.
 */
export async function updateClassroomSettings(settings: ClassroomSettings) {
  const userId = await getAuthenticatedUserId();

  const teacherDoc = await getDoc(doc(db, 'users', userId));
  const classId = teacherDoc.data()?.classId;
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
  const classId = teacherDoc.data()?.classId;
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
