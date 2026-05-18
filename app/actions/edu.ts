'use server';

import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

// Helper to get authenticated UID on the server
async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) throw new Error('Unauthorized: No auth token cookie found');

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (!decodedToken.uid) throw new Error('UID missing from token');
    return decodedToken.uid;
  } catch (error: any) {
    throw new Error(`Unauthorized: ${error.message}`);
  }
}

/**
 * Assigns a user their educational role ('teacher' or 'student')
 * Sets both a secure Firebase Custom Claim and updates the Firestore user metadata.
 */
export async function setUserRole(role: 'teacher' | 'student', name: string) {
  const userId = await getAuthenticatedUserId();

  try {
    // 1. Set Custom Claims for Route & API Middleware Protection
    await adminAuth.setCustomUserClaims(userId, { role });

    // 2. Persist in Firestore for client queries and relational consistency
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.set({
      role,
      name,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    return { success: true, role };
  } catch (error: any) {
    console.error('Failed to set user role claims:', error);
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
    const classroomRef = adminDb.collection('classrooms').doc();
    const rules = {
      maxDailyTrades: initialRules?.maxDailyTrades ?? 3,
      startingCash: initialRules?.startingCash ?? 50000,
      allowedAssets: initialRules?.allowedAssets ?? [],
      blacklistedAssets: initialRules?.blacklistedAssets ?? []
    };

    await classroomRef.set({
      classCode,
      name: className,
      teacherId: userId,
      createdAt: FieldValue.serverTimestamp(),
      rules
    });

    // Save class relationship on the teacher's profile
    const teacherRef = adminDb.collection('users').doc(userId);
    await teacherRef.set({
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
    const classroomsSnap = await adminDb
      .collection('classrooms')
      .where('classCode', '==', upperCode)
      .limit(1)
      .get();

    if (classroomsSnap.empty) {
      throw new Error(`Classroom code '${upperCode}' does not exist.`);
    }

    const classDoc = classroomsSnap.docs[0];
    const classData = classDoc.data();
    const classId = classDoc.id;

    // 2. Register membership in `/classrooms/{classId}/members/{studentId}`
    const memberRef = classDoc.ref.collection('members').doc(userId);
    
    // Check custom rules to initialize portfolio with starting cash
    const startingCash = classData.rules?.startingCash ?? 50000;

    // 3. Create or update user metadata
    const userRef = adminDb.collection('users').doc(userId);
    const batch = adminDb.batch();

    batch.set(memberRef, {
      studentId: userId,
      studentName,
      joinedAt: FieldValue.serverTimestamp(),
      portfolioId: `edu_${classId}`
    });

    batch.set(userRef, {
      classId,
      classCode: upperCode,
      role: 'student',
      name: studentName
    }, { merge: true });

    // Initialize custom student sandbox portfolio with the assigned cash balance
    const portfolioRef = userRef.collection('portfolio').doc('main');
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
  const teacherDoc = await adminDb.collection('users').doc(userId).get();
  const classId = teacherDoc.data()?.classId;
  if (!classId) throw new Error('No active classroom found for this teacher.');

  const classRef = adminDb.collection('classrooms').doc(classId);
  const membersSnap = await classRef.collection('members').get();
  const classroomDoc = await classRef.get();
  const classroomData = classroomDoc.data();

  const roster = [];

  for (const doc of membersSnap.docs) {
    const data = doc.data();
    const studentId = data.studentId;

    // Fetch the student's portfolio and transaction counts
    const portfolioRef = adminDb.collection('users').doc(studentId).collection('portfolio').doc('main');
    const transactionsRef = adminDb.collection('users').doc(studentId).collection('transactions');

    const [portDoc, transSnap] = await Promise.all([
      portfolioRef.get(),
      transactionsRef.get()
    ]);

    const portData = portDoc.data();
    const cash = portData?.cash ?? 50000;
    
    // Fetch holding valuation
    let holdingsValue = 0;
    const holdingsSnap = await portfolioRef.collection('holdings').get();
    
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

  const teacherDoc = await adminDb.collection('users').doc(userId).get();
  const classId = teacherDoc.data()?.classId;
  if (!classId) throw new Error('No active classroom found.');

  const classRef = adminDb.collection('classrooms').doc(classId);
  
  await classRef.set({
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

  const studentDoc = await adminDb.collection('users').doc(userId).get();
  const classId = studentDoc.data()?.classId;
  if (!classId) return null; // Not in a classroom

  const classDoc = await adminDb.collection('classrooms').doc(classId).get();
  if (!classDoc.exists) return null;

  const data = classDoc.data()!;
  
  // Count today's trades
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const transactionsSnap = await adminDb
    .collection('users')
    .doc(userId)
    .collection('transactions')
    .where('timestamp', '>=', today)
    .get();

  return {
    classCode: data.classCode,
    className: data.name,
    rules: data.rules || {},
    tradesToday: transactionsSnap.size
  };
}
