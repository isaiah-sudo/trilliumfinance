import { create } from 'zustand';
import { getPortfolioSummary, handleTrade, PortfolioSummary } from '@/app/actions/trading';
import { getUserAchievements } from '@/app/actions/achievements';

interface LevelInfo {
  name: string;
  nextName: string;
  minXp: number;
  maxXp: number;
  progress: number;
  xpNeeded: number;
  accumulated: number;
}

interface PortfolioState {
  portfolio: PortfolioSummary | null;
  loading: boolean;
  error: string | null;
  unlockedAchievements: string[];
  streakCount: number;
  xp: number;
  levelInfo: LevelInfo | null;
  fetchPortfolio: () => Promise<void>;
  executeTrade: (ticker: string, quantity: number, type: 'BUY' | 'SELL') => Promise<void>;
  fetchAchievementsAndStreak: () => Promise<void>;
}

/**
 * Zustand store to synchronize portfolio state and handle safe execution of trades.
 */
export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolio: null,
  loading: false,
  error: null,
  unlockedAchievements: [],
  streakCount: 1,
  xp: 0,
  levelInfo: null,

  fetchPortfolio: async () => {
    set({ loading: true, error: null });
    try {
      const summary = await getPortfolioSummary();
      set({ portfolio: summary, loading: false });
    } catch (err: any) {
      console.error('[Portfolio Store] Fetch Error:', err);
      set({ error: err.message || 'Failed to fetch portfolio summary', loading: false });
    }
  },

  executeTrade: async (ticker: string, quantity: number, type: 'BUY' | 'SELL') => {
    set({ loading: true, error: null });
    try {
      await handleTrade(ticker, quantity, type);
      // Immediately refetch summary to sync calculations deterministic state
      const summary = await getPortfolioSummary();
      set({ portfolio: summary, loading: false });
      // Refetch achievements in case trading unlocks any new achievements/XP
      await get().fetchAchievementsAndStreak();
    } catch (err: any) {
      console.error('[Portfolio Store] Trade Error:', err);
      set({ error: err.message || 'Trade execution failed', loading: false });
      throw err; // rethrow so that local modals can render error states appropriately
    }
  },

  fetchAchievementsAndStreak: async () => {
    try {
      const achievements = await getUserAchievements();
      
      // Calculate streak with Firestore sync fallback
      let currentStreak = 1;
      try {
        const { updateUserStreakState } = await import('@/app/actions/lessons');
        const streakRes = await updateUserStreakState();
        currentStreak = streakRes.streakCount;
      } catch (err) {
        const todayStr = new Date().toLocaleDateString('en-US');
        const lastLogin = localStorage.getItem('trillium_last_login');
        currentStreak = parseInt(localStorage.getItem('trillium_streak_count') || '1', 10);
        
        if (!lastLogin) {
          currentStreak = 1;
        } else {
          const today = new Date();
          today.setHours(0,0,0,0);
          const lastDate = new Date(lastLogin);
          lastDate.setHours(0,0,0,0);
          const diffTime = today.getTime() - lastDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak = currentStreak + 1;
          } else if (diffDays > 1) {
            currentStreak = 1;
          }
        }
        localStorage.setItem('trillium_last_login', todayStr);
        localStorage.setItem('trillium_streak_count', currentStreak.toString());
      }

      // Calculate XP from achievements
      const getAchievementXp = (achievementId: string): number => {
        switch (achievementId) {
          case 'BULL_MARKET':
          case 'FINANCIAL_GURU':
          case 'HIGH_ROLLER':
            return 100; // Gem
          case 'WHALE':
          case 'DAY_TRADER':
          case 'RISK_TAKER':
            return 50;  // Gold
          case 'DIVERSIFIED':
          case 'DIAMOND_HANDS':
          case 'COMMUNITY_LEADER':
          case 'BEAR_SURVIVOR':
            return 25;  // Silver
          default:
            return 10;  // Copper
        }
      };

      const achievementXpSum = achievements.reduce((sum, id) => sum + getAchievementXp(id), 0);
      
      // Streak XP: 10 XP per day for consecutive logins, milestone week is 40 XP
      let streakXp = 0;
      for (let i = 1; i <= currentStreak; i++) {
        if (i === 7) {
          streakXp += 40;
        } else {
          streakXp += 10;
        }
      }

      const totalXp = achievementXpSum + streakXp;

      // Calculate level details
      let levelInfoVal: LevelInfo;
      if (totalXp < 100) {
        levelInfoVal = {
          name: 'Novice',
          nextName: 'Rookie',
          minXp: 0,
          maxXp: 100,
          progress: (totalXp / 100) * 100,
          xpNeeded: 100 - totalXp,
          accumulated: totalXp
        };
      } else if (totalXp < 250) {
        levelInfoVal = {
          name: 'Rookie',
          nextName: 'Intermediate',
          minXp: 100,
          maxXp: 250,
          progress: ((totalXp - 100) / 150) * 100,
          xpNeeded: 250 - totalXp,
          accumulated: totalXp
        };
      } else if (totalXp < 500) {
        levelInfoVal = {
          name: 'Intermediate',
          nextName: 'Pro',
          minXp: 250,
          maxXp: 500,
          progress: ((totalXp - 250) / 250) * 100,
          xpNeeded: 500 - totalXp,
          accumulated: totalXp
        };
      } else if (totalXp < 1000) {
        levelInfoVal = {
          name: 'Pro',
          nextName: 'Master',
          minXp: 500,
          maxXp: 1000,
          progress: ((totalXp - 500) / 500) * 100,
          xpNeeded: 1000 - totalXp,
          accumulated: totalXp
        };
      } else {
        levelInfoVal = {
          name: 'Master',
          nextName: 'Max Level',
          minXp: 1000,
          maxXp: 1000,
          progress: 100,
          xpNeeded: 0,
          accumulated: totalXp
        };
      }

      set({
        unlockedAchievements: achievements,
        streakCount: currentStreak,
        xp: totalXp,
        levelInfo: levelInfoVal
      });
    } catch (e) {
      console.error('Error fetching achievements & streak:', e);
    }
  }
}));
