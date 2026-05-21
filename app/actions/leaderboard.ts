import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  netWorth: number;
  rank: number;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const usersRef = collection(db, 'users');
    // Query users sorted by netWorth descending, limit to top 50
    const q = query(usersRef, orderBy('netWorth', 'desc'), limit(50));
    const snapshot = await getDocs(q);

    const leaderboard: LeaderboardEntry[] = [];
    let rank = 1;

    snapshot.forEach((doc) => {
      const data = doc.data();
      // Only include users who actually have a netWorth initialized
      if (data.netWorth !== undefined) {
        leaderboard.push({
          id: doc.id,
          displayName: data.displayName || data.email?.split('@')[0] || `Trader_${doc.id.substring(0, 5)}`,
          netWorth: data.netWorth,
          rank: rank++,
        });
      }
    });

    return leaderboard;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}
