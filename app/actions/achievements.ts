import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, setDoc, getDocs, query, where } from 'firebase/firestore';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconType: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'FIRST_TRADE', title: 'First Trade', description: 'Execute your first trade.', iconType: 'Rocket' },
  { id: 'DIAMOND_HANDS', title: 'Diamond Hands', description: 'Make a trade that holds significant value.', iconType: 'Gem' },
  { id: 'WHALE', title: 'The Whale', description: 'Reach a net worth of $100,000.', iconType: 'Crown' },
  { id: 'DIVERSIFIED', title: 'Diversified', description: 'Hold 5 different stocks in your portfolio.', iconType: 'PieChart' },
  { id: 'DAY_TRADER', title: 'Day Trader', description: 'Execute 5 trades in a single day.', iconType: 'Zap' },
];

export async function getUserAchievements(userId?: string): Promise<string[]> {
  try {
    let uid = userId;
    if (!uid) {
      if (auth.currentUser) {
        uid = auth.currentUser.uid;
      } else {
        return [];
      }
    }
    
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.achievements || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}

export async function checkAndUnlockAchievements(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return;

    const data = userDoc.data();
    const currentAchievements: string[] = data.achievements || [];
    const newAchievements: string[] = [];

    // 1. FIRST_TRADE
    if (!currentAchievements.includes('FIRST_TRADE')) {
      const transactionsSnap = await getDocs(collection(db, 'users', userId, 'portfolio_history'));
      // Wait, transactions might be in 'portfolio_history' where trade logs are saved.
      // In trading.ts: collection(db, 'users', userId, 'portfolio_history') for transaction logs.
      // Actually let's just check if there's any document in portfolio_history.
      if (!transactionsSnap.empty) {
        newAchievements.push('FIRST_TRADE');
      }
    }

    // 2. WHALE
    if (!currentAchievements.includes('WHALE')) {
      if (data.netWorth && data.netWorth >= 100000) {
        newAchievements.push('WHALE');
      }
    }

    // 3. DIVERSIFIED
    if (!currentAchievements.includes('DIVERSIFIED')) {
      const holdingsSnap = await getDocs(collection(db, 'users', userId, 'portfolio', 'main', 'holdings'));
      if (holdingsSnap.size >= 5) {
        newAchievements.push('DIVERSIFIED');
      }
    }
    
    // 4. DAY_TRADER
    if (!currentAchievements.includes('DAY_TRADER')) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const q = query(collection(db, 'users', userId, 'portfolio_history'), where('timestamp', '>=', today));
      const todayTrades = await getDocs(q);
      if (todayTrades.size >= 5) {
        newAchievements.push('DAY_TRADER');
      }
    }

    // Save if any new achievements
    if (newAchievements.length > 0) {
      await setDoc(userRef, { achievements: [...currentAchievements, ...newAchievements] }, { merge: true });
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}
