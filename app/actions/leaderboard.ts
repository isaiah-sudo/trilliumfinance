import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  netWorth: number;
  rank: number;
}

const DEFAULT_TRADER_NAMES = [
  'Apex Capital Account',
  'Vanguard Portfolio',
  'Quantum Trading Account',
  'Summit Alpha Account',
  'Horizon Growth Portfolio',
  'Pinnacle Trader Account',
  'Starlight Equities Account',
  'Nexus Wealth Account',
  'Atlas Trading Portfolio',
  'Meridian Capital Account',
];

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const usersRef = collection(db, 'users');
    // Query users sorted by netWorth descending, limit to top 50
    const q = query(usersRef, orderBy('netWorth', 'desc'), limit(50));
    const snapshot = await getDocs(q);

    const currentUser = auth.currentUser;
    const leaderboard: LeaderboardEntry[] = [];
    let rank = 1;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Only include users who actually have a netWorth initialized
      if (data.netWorth !== undefined) {
        let name = data.displayName || data.accountName || data.username || data.name;
        if (!name && data.email) {
          name = data.email.split('@')[0];
        }
        if (!name && currentUser && docSnap.id === currentUser.uid) {
          name = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : null);
        }
        if (!name) {
          name = DEFAULT_TRADER_NAMES[(rank - 1) % DEFAULT_TRADER_NAMES.length] || `Trader Account ${rank}`;
        }

        leaderboard.push({
          id: docSnap.id,
          displayName: name,
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

