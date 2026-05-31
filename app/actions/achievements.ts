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
  // 9 New Trophies
  { id: 'RISK_TAKER', title: 'Risk Taker', description: 'Execute a single trade exceeding $10,000 value.', iconType: 'Zap' },
  { id: 'PIONEER', title: 'Pioneer', description: 'Read the latest stock analysis in the Market Explorer.', iconType: 'Rocket' },
  { id: 'COMMUNITY_LEADER', title: 'Community Leader', description: 'Send messages and exchange strategies in chat.', iconType: 'Crown' },
  { id: 'BULL_MARKET', title: 'Bull Market', description: 'Achieve a portfolio performance over +15% total return.', iconType: 'Trophy' },
  { id: 'BEAR_SURVIVOR', title: 'Bear Survivor', description: 'Retain positive returns during active market downtrends.', iconType: 'Trophy' },
  { id: 'FINANCIAL_GURU', title: 'Financial Guru', description: 'Complete detailed analysis on at least 10 different stocks.', iconType: 'PieChart' },
  { id: 'HIGH_ROLLER', title: 'High Roller', description: 'Complete 25 or more transactions since opening your account.', iconType: 'Gem' },
  { id: 'SHREWD_INVESTOR', title: 'Shrewd Investor', description: 'Hold cash reserves equal to less than 10% of portfolio value.', iconType: 'PieChart' },
  { id: 'STEADY_HAND', title: 'Steady Hand', description: 'Retain a stock position for more than 5 market days.', iconType: 'TreePine' },
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
      await setDoc(userRef, { achievements: [...currentAchievements, ...newAchievements] }, { merge: true });
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}
