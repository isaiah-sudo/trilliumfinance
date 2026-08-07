import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, setDoc, getDocs, query, where } from 'firebase/firestore';

export type RarityType = 'Purple' | 'Gold' | 'Silver' | 'Bronze';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconType: string;
  rarity: RarityType;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'FIRST_TRADE', title: 'First Trade', description: 'Execute your first trade.', iconType: 'Rocket', rarity: 'Bronze' },
  { id: 'DIAMOND_HANDS', title: 'Diamond Hands', description: 'Make a trade that holds significant value.', iconType: 'Gem', rarity: 'Gold' },
  { id: 'WHALE', title: 'The Whale', description: 'Reach a net worth of $100,000.', iconType: 'Crown', rarity: 'Purple' },
  { id: 'DIVERSIFIED', title: 'Diversified', description: 'Hold 5 different stocks in your portfolio.', iconType: 'PieChart', rarity: 'Silver' },
  { id: 'DAY_TRADER', title: 'Day Trader', description: 'Execute 5 trades in a single day.', iconType: 'Zap', rarity: 'Gold' },
  { id: 'RISK_TAKER', title: 'Risk Taker', description: 'Execute a single trade exceeding $10,000 value.', iconType: 'Zap', rarity: 'Purple' },
  { id: 'PIONEER', title: 'Pioneer', description: 'Read the latest stock analysis in the Market Explorer.', iconType: 'Rocket', rarity: 'Bronze' },
  { id: 'COMMUNITY_LEADER', title: 'Community Leader', description: 'Send messages and exchange strategies in chat.', iconType: 'Crown', rarity: 'Silver' },
  { id: 'BULL_MARKET', title: 'Bull Market', description: 'Achieve a portfolio performance over +15% total return.', iconType: 'Trophy', rarity: 'Purple' },
  { id: 'BEAR_SURVIVOR', title: 'Bear Survivor', description: 'Retain positive returns during active market downtrends.', iconType: 'Trophy', rarity: 'Gold' },
  { id: 'FINANCIAL_GURU', title: 'Financial Guru', description: 'Complete detailed analysis on at least 10 different stocks.', iconType: 'PieChart', rarity: 'Silver' },
  { id: 'HIGH_ROLLER', title: 'High Roller', description: 'Complete 25 or more transactions since opening your account.', iconType: 'Gem', rarity: 'Gold' },
  { id: 'SHREWD_INVESTOR', title: 'Shrewd Investor', description: 'Hold cash reserves equal to less than 10% of portfolio value.', iconType: 'PieChart', rarity: 'Silver' },
  { id: 'STEADY_HAND', title: 'Steady Hand', description: 'Retain a stock position for more than 5 market days.', iconType: 'TreePine', rarity: 'Bronze' },
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
      // Ensure we merge some mock ones to make testing new ones easier if none are unlocked yet
      const achievements: string[] = data.achievements || [];
      if (!achievements.includes('FIRST_TRADE')) achievements.push('FIRST_TRADE');
      if (!achievements.includes('PIONEER')) achievements.push('PIONEER');
      if (!achievements.includes('SHREWD_INVESTOR')) achievements.push('SHREWD_INVESTOR');
      if (!achievements.includes('STEADY_HAND')) achievements.push('STEADY_HAND');
      if (!achievements.includes('DIAMOND_HANDS')) achievements.push('DIAMOND_HANDS');
      if (!achievements.includes('BEAR_SURVIVOR')) achievements.push('BEAR_SURVIVOR');
      return achievements;
    }
    return ['FIRST_TRADE', 'PIONEER', 'SHREWD_INVESTOR', 'STEADY_HAND', 'DIAMOND_HANDS', 'BEAR_SURVIVOR'];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return ['FIRST_TRADE', 'PIONEER', 'SHREWD_INVESTOR', 'STEADY_HAND', 'DIAMOND_HANDS', 'BEAR_SURVIVOR'];
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

    // 5. HIGH_ROLLER
    if (!currentAchievements.includes('HIGH_ROLLER')) {
      const transactionsSnap = await getDocs(collection(db, 'users', userId, 'portfolio_history'));
      if (transactionsSnap.size >= 25) {
        newAchievements.push('HIGH_ROLLER');
      }
    }

    // Save if any new achievements
    if (newAchievements.length > 0) {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const newUnlocks: Record<string, number> = {};
      newAchievements.forEach(id => {
        newUnlocks[id] = nowSeconds;
      });
      const existingUnlocks = data?.achievementUnlocks || {};
      await setDoc(userRef, { 
        achievements: [...currentAchievements, ...newAchievements],
        achievementUnlocks: { ...existingUnlocks, ...newUnlocks }
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

export async function getUserAchievementUnlocks(userId?: string): Promise<Record<string, number>> {
  try {
    let uid = userId;
    if (!uid) {
      if (auth.currentUser) {
        uid = auth.currentUser.uid;
      } else {
        return {};
      }
    }

    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return {};
    }

    const data = userDoc.data();
    const achievements: string[] = data?.achievements || [];
    const dbUnlocks: Record<string, number> = data?.achievementUnlocks || {};
    
    const unlocks: Record<string, number> = { ...dbUnlocks };
    
    // Let's get the user's first transaction or use a default date (e.g. 5 days ago)
    let baseTime = Math.floor(Date.now() / 1000) - 5 * 24 * 3600; // 5 days ago
    try {
      const portfolioHistorySnap = await getDocs(collection(db, 'users', uid, 'portfolio_history'));
      if (!portfolioHistorySnap.empty) {
        let oldestTime = Date.now();
        portfolioHistorySnap.docs.forEach(doc => {
          const t = doc.data().timestamp;
          if (t) {
            const ms = t.toDate().getTime();
            if (ms < oldestTime) oldestTime = ms;
          }
        });
        baseTime = Math.floor(oldestTime / 1000);
      }
    } catch (e) {
      console.error('Error finding oldest transaction for achievements:', e);
    }

    // Assign fallback dates for achievements that don't have one in DB
    achievements.forEach((id, index) => {
      if (!unlocks[id]) {
        // Space them out by 6 hours starting from baseTime
        unlocks[id] = baseTime + index * 6 * 3600;
      }
    });

    return unlocks;
  } catch (error) {
    console.error('Error fetching achievement unlocks:', error);
    return {};
  }
}
