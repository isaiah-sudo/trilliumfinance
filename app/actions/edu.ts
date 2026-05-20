import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, setDoc, serverTimestamp, getDocs, writeBatch, query, where, limit } from 'firebase/firestore';

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
 * Assigns a user their educational role ('teacher' or 'student')
 * Updates the Firestore user metadata.
 */
export async function setUserRole(role: 'teacher' | 'student', name: string) {
  const userId = await getAuthenticatedUserId();

  try {
    // Persist in Firestore for client queries and relational consistency
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
 * Creates a classroom under a teacher's account.
 * Generates a unique, readable Class Code like TRIL-8921.
 */
export async function createClassroom(className: string, initialRules?: {
  maxDailyTrades?: number;
  startingCash?: number;
  allowedAssets?: string[];
  blacklistedAssets?: string[];
}) {
  const userId = await getAuthenticatedUserId();

  // Generate a random readable code (TRIL-XXXX)
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const classCode = `TRIL-${randNum}`;

  try {
    // Create classroom document
    const classroomRef = doc(collection(db, 'classrooms'));
    const rules = {
      maxDailyTrades: initialRules?.maxDailyTrades ?? 3,
      startingCash: initialRules?.startingCash ?? 50000,
      allowedAssets: initialRules?.allowedAssets ?? [],
      blacklistedAssets: initialRules?.blacklistedAssets ?? []
    };

    await setDoc(classroomRef, {
      classCode,
      name: className,
      teacherId: userId,
      createdAt: serverTimestamp(),
      rules
    });

    // Save class relationship on the teacher's profile
    const teacherRef = doc(db, 'users', userId);
    await setDoc(teacherRef, {
      classId: classroomRef.id,
      classCode
    }, { merge: true });

    return { success: true, classCode, classId: classroomRef.id };
  } catch (error: any) {
    console.error('Failed to create classroom:', error);
    throw new Error(error.message || 'Failed to create classroom.');
  }
}

/**
 * Enrolls a student in a classroom based on a 9-character code (e.g. TRIL-8921).
 * Validates classroom existence, registers membership, and sets up a sandbox portfolio.
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

    // 2. Register membership in `/classrooms/{classId}/members/{studentId}`
    const memberRef = doc(db, 'classrooms', classId, 'members', userId);
    
    // Check custom rules to initialize portfolio with starting cash
    const startingCash = classData.rules?.startingCash ?? 50000;

    // 3. Create or update user metadata
    const userRef = doc(db, 'users', userId);
    const batch = writeBatch(db);

    batch.set(memberRef, {
      studentId: userId,
      studentName,
      joinedAt: serverTimestamp(),
      portfolioId: `edu_${classId}`
    });

    batch.set(userRef, {
      classId,
      classCode: upperCode,
      role: 'student',
      name: studentName
    }, { merge: true });

    // Initialize custom student sandbox portfolio with the assigned cash balance
    const portfolioRef = doc(db, 'users', userId, 'portfolio', 'main');
    batch.set(portfolioRef, {
      cash: startingCash,
      isEdu: true,
      classId
    }, { merge: true });

    await batch.commit();

    return { success: true, classId, className: classData.name };
  } catch (error: any) {
    console.error('Failed to join classroom:', error);
    throw new Error(error.message || 'Failed to join classroom.');
  }
}

/**
 * Gets student roster for a teacher's classroom, showing portfolios and trade counts.
 */
export async function getClassroomRoster() {
  const userId = await getAuthenticatedUserId();

  // Find class owned by this teacher
  const teacherDoc = await getDoc(doc(db, 'users', userId));
  const classId = teacherDoc.data()?.classId;
  if (!classId) throw new Error('No active classroom found for this teacher.');

  const classRef = doc(db, 'classrooms', classId);
  const membersSnap = await getDocs(collection(db, 'classrooms', classId, 'members'));
  const classroomDoc = await getDoc(classRef);
  const classroomData = classroomDoc.data();

  const roster = [];

  for (const memberDoc of membersSnap.docs) {
    const data = memberDoc.data();
    const studentId = data.studentId;

    // Fetch the student's portfolio and transaction counts
    const portfolioRef = doc(db, 'users', studentId, 'portfolio', 'main');
    const transactionsRef = collection(db, 'users', studentId, 'transactions');

    const [portDoc, transSnap] = await Promise.all([
      getDoc(portfolioRef),
      getDocs(transactionsRef)
    ]);

    const portData = portDoc.data();
    const cash = portData?.cash ?? 50000;
    
    // Fetch holding valuation
    let holdingsValue = 0;
    const holdingsSnap = await getDocs(collection(db, 'users', studentId, 'portfolio', 'main', 'holdings'));
    
    // We approximate or return simplified values since live fetch requires rate limit handling
    holdingsSnap.forEach(h => {
      const hData = h.data();
      holdingsValue += (hData.qty || 0) * (hData.avgPrice || 0); // Simplified using book cost
    });

    roster.push({
      studentId,
      studentName: data.studentName || 'Anonymous Student',
      joinedAt: data.joinedAt?.toDate()?.toLocaleDateString() || 'N/A',
      cashBalance: cash,
      portfolioValue: cash + holdingsValue,
      tradesCount: transSnap.size
    });
  }

  return {
    className: classroomData?.name || 'Classroom',
    classCode: classroomData?.classCode || '',
    rules: classroomData?.rules || {},
    roster: roster.sort((a, b) => b.portfolioValue - a.portfolioValue)
  };
}

/**
 * Updates trading rules constraints for a classroom.
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

/**
 * Gets student's active classroom details and rules.
 */
export async function getStudentRules() {
  const userId = await getAuthenticatedUserId();

  const studentDoc = await getDoc(doc(db, 'users', userId));
  const classId = studentDoc.data()?.classId;
  if (!classId) return null; // Not in a classroom

  const classDoc = await getDoc(doc(db, 'classrooms', classId));
  if (!classDoc.exists()) return null;

  const data = classDoc.data()!;
  
  // Count today's trades
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const transactionsRef = collection(db, 'users', userId, 'transactions');
  const q = query(transactionsRef, where('timestamp', '>=', today));
  const transactionsSnap = await getDocs(q);

  return {
    classCode: data.classCode,
    className: data.name,
    rules: data.rules || {},
    tradesToday: transactionsSnap.size
  };
}
