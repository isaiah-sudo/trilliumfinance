import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { safeAdd } from '@/lib/portfolioMath';

// Helper to get authenticated UID on client/server action
async function getAuthenticatedUserId(): Promise<string> {
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
    if (process.env.NODE_ENV !== 'production') {
      return process.env.NEXT_PUBLIC_DEV_UID || 'dev-user-uid';
    }
    throw new Error('Unauthorized: No user is currently signed in.');
  }

  return user.uid;
}

export interface UserLessonData {
  completedLessonIds: number[];
  lessonCompletedDates: Record<number, number>;
  totalLessonXp: number;
}

export interface StreakCommitmentData {
  streakCount: number;
  lastLoginDate: string;
  activeCommitment: number; // 0 (none), 7, 14, 30, 60 days
  commitmentStartDate: string | null;
  claimedCommitmentRewards: number[]; // e.g. [7, 14]
}

export const STREAK_REWARDS: Record<number, { cash: number; trilliums: number; xp: number; title: string }> = {
  7: { cash: 50, trilliums: 15, xp: 100, title: '7-Day Commitment Bonus' },
  14: { cash: 150, trilliums: 35, xp: 250, title: '14-Day Commitment Bonus' },
  30: { cash: 350, trilliums: 80, xp: 600, title: '30-Day Commitment Bonus' },
  60: { cash: 1000, trilliums: 200, xp: 1500, title: '60-Day Master Commitment Bonus' },
};

/**
 * Fetch complete lesson progress and streak commitment data for current user.
 */
export async function getUserLessonAndStreakData() {
  try {
    const userId = await getAuthenticatedUserId();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const completedLessonIds: number[] = data.completedLessonIds || [1]; // default 1 completed
      const lessonCompletedDates: Record<number, number> = data.lessonCompletedDates || {};
      const totalLessonXp: number = data.totalLessonXp || 0;

      const streakCount: number = data.streakCount || 1;
      const lastLoginDate: string = data.lastLoginDate || new Date().toLocaleDateString('en-US');
      const activeCommitment: number = data.activeCommitment || 7; // default 7 day commitment
      const commitmentStartDate: string | null = data.commitmentStartDate || null;
      const claimedCommitmentRewards: number[] = data.claimedCommitmentRewards || [];

      return {
        completedLessonIds,
        lessonCompletedDates,
        totalLessonXp,
        streakCount,
        lastLoginDate,
        activeCommitment,
        commitmentStartDate,
        claimedCommitmentRewards,
      };
    }

    return {
      completedLessonIds: [1],
      lessonCompletedDates: { 1: Date.now() },
      totalLessonXp: 50,
      streakCount: 1,
      lastLoginDate: new Date().toLocaleDateString('en-US'),
      activeCommitment: 7,
      commitmentStartDate: new Date().toLocaleDateString('en-US'),
      claimedCommitmentRewards: [],
    };
  } catch (error) {
    console.error('Error in getUserLessonAndStreakData:', error);
    return {
      completedLessonIds: [1],
      lessonCompletedDates: { 1: Date.now() },
      totalLessonXp: 50,
      streakCount: 1,
      lastLoginDate: new Date().toLocaleDateString('en-US'),
      activeCommitment: 7,
      commitmentStartDate: null,
      claimedCommitmentRewards: [],
    };
  }
}

/**
 * Mark a lesson complete in Firestore and grant rewards.
 */
export async function completeLessonAction(lessonId: number, xp: number, trilliums: number) {
  const userId = await getAuthenticatedUserId();
  const userRef = doc(db, 'users', userId);

  try {
    let newlyCompleted = false;

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        transaction.set(userRef, {
          completedLessonIds: [lessonId],
          lessonCompletedDates: { [lessonId]: Date.now() },
          totalLessonXp: xp,
          updatedAt: serverTimestamp()
        }, { merge: true });
        newlyCompleted = true;
        return;
      }

      const data = userDoc.data();
      const currentCompleted: number[] = data.completedLessonIds || [];
      const dates: Record<number, number> = data.lessonCompletedDates || {};
      const currentXp: number = data.totalLessonXp || 0;
      const currentTrilliums: number = data.trilliums ?? 200;

      if (!currentCompleted.includes(lessonId)) {
        newlyCompleted = true;
        const updatedCompleted = [...currentCompleted, lessonId];
        dates[lessonId] = Date.now();
        const updatedXp = currentXp + xp;
        const updatedTrilliums = currentTrilliums + (trilliums || 0);

        transaction.set(userRef, {
          completedLessonIds: updatedCompleted,
          lessonCompletedDates: dates,
          totalLessonXp: updatedXp,
          trilliums: updatedTrilliums,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    });

    return { success: true, newlyCompleted };
  } catch (error: any) {
    console.error('Failed to complete lesson:', error);
    throw new Error(error.message || 'Failed to complete lesson.');
  }
}

/**
 * Update user streak count and log user check-in day.
 */
export async function updateUserStreakState() {
  const userId = await getAuthenticatedUserId();
  const userRef = doc(db, 'users', userId);
  const todayStr = new Date().toLocaleDateString('en-US');

  try {
    const userDoc = await getDoc(userRef);
    let currentStreak = 1;
    let lastLogin = todayStr;

    if (userDoc.exists()) {
      const data = userDoc.data();
      lastLogin = data.lastLoginDate || '';
      currentStreak = data.streakCount || 1;

      if (!lastLogin) {
        currentStreak = 1;
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastDate = new Date(lastLogin);
        lastDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak = currentStreak + 1;
        } else if (diffDays > 1) {
          currentStreak = 1; // streak reset if missed a day
        }
      }
    }

    await setDoc(userRef, {
      streakCount: currentStreak,
      lastLoginDate: todayStr,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { streakCount: currentStreak, lastLoginDate: todayStr };
  } catch (error) {
    console.error('Error updating streak state:', error);
    return { streakCount: 1, lastLoginDate: todayStr };
  }
}

/**
 * Set user's active streak commitment goal (7, 14, 30, 60 days).
 */
export async function selectStreakCommitment(daysTarget: number) {
  const userId = await getAuthenticatedUserId();
  const userRef = doc(db, 'users', userId);
  const todayStr = new Date().toLocaleDateString('en-US');

  try {
    await setDoc(userRef, {
      activeCommitment: daysTarget,
      commitmentStartDate: todayStr,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { success: true, activeCommitment: daysTarget };
  } catch (error: any) {
    console.error('Error setting streak commitment:', error);
    throw new Error(error.message || 'Failed to select streak commitment target.');
  }
}

/**
 * Claim cash reward capital for reaching a committed streak target.
 * Adds funds directly to portfolio cash and updates claimed rewards array.
 */
export async function claimStreakCapitalReward(targetDays: number) {
  const userId = await getAuthenticatedUserId();
  const userRef = doc(db, 'users', userId);
  const portfolioRef = doc(db, 'users', userId, 'portfolio', 'main');

  const rewardConfig = STREAK_REWARDS[targetDays];
  if (!rewardConfig) {
    throw new Error(`Invalid reward target of ${targetDays} days.`);
  }

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const portDoc = await transaction.get(portfolioRef);

      if (!userDoc.exists()) {
        throw new Error('User profile not found.');
      }
      if (!portDoc.exists()) {
        throw new Error('Portfolio not found.');
      }

      const userData = userDoc.data();
      const portData = portDoc.data();

      const currentStreak = userData.streakCount || 1;
      const claimed: number[] = userData.claimedCommitmentRewards || [];

      if (currentStreak < targetDays) {
        throw new Error(`You need a ${targetDays}-day streak to claim this reward. Current streak: ${currentStreak} days.`);
      }

      if (claimed.includes(targetDays)) {
        throw new Error(`You have already claimed your ${targetDays}-day streak reward!`);
      }

      const currentCash = Number(portData.cash ?? 10000);
      const newCash = safeAdd(currentCash, rewardConfig.cash);
      const updatedClaimed = [...claimed, targetDays];
      const currentTrilliums = Number(userData.trilliums ?? 200);
      const updatedTrilliums = currentTrilliums + (rewardConfig.trilliums || 0);

      // Update cash in portfolio
      transaction.set(portfolioRef, {
        cash: newCash
      }, { merge: true });

      // Update claimed rewards and trilliums in user doc
      transaction.set(userRef, {
        claimedCommitmentRewards: updatedClaimed,
        trilliums: updatedTrilliums,
        updatedAt: serverTimestamp()
      }, { merge: true });
    });

    return {
      success: true,
      rewardCash: rewardConfig.cash,
      rewardTrilliums: rewardConfig.trilliums,
      rewardXp: rewardConfig.xp,
      title: rewardConfig.title
    };
  } catch (error: any) {
    console.error('Failed to claim streak reward:', error);
    throw new Error(error.message || 'Failed to claim streak capital reward.');
  }
}
