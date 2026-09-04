import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  netWorth: number;
  rank: number;
  isCurrentUser?: boolean;
}

const BENCHMARK_TRADERS: Array<{ name: string; baseNetWorth: number }> = [
  { name: 'Apex Alpha Fund', baseNetWorth: 28450 },
  { name: 'Vanguard Growth Portfolio', baseNetWorth: 18920 },
  { name: 'Summit Quantitative', baseNetWorth: 14780 },
  { name: 'Horizon Macro Trader', baseNetWorth: 12350 },
  { name: 'Pinnacle Capital Portfolio', baseNetWorth: 11150 },
  { name: 'Starlight Equities', baseNetWorth: 10450 },
  { name: 'Nexus Wealth Management', baseNetWorth: 9850 },
];

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('netWorth', 'desc'), limit(50));
    const snapshot = await getDocs(q);

    const currentUser = auth.currentUser;
    const entriesMap = new Map<string, LeaderboardEntry>();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.netWorth !== undefined && typeof data.netWorth === 'number') {
        let name = data.displayName || data.accountName || data.username || data.name;
        if (!name && data.email) {
          name = data.email.split('@')[0];
        }
        if (!name && currentUser && docSnap.id === currentUser.uid) {
          name = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : null);
        }
        if (!name) {
          name = `Trader ${docSnap.id.slice(0, 6)}`;
        }

        const isCurrent = currentUser ? docSnap.id === currentUser.uid : false;

        entriesMap.set(docSnap.id, {
          id: docSnap.id,
          displayName: name,
          netWorth: Math.round(data.netWorth),
          rank: 0,
          isCurrentUser: isCurrent,
        });
      }
    });

    // If current user is logged in but wasn't in the snapshot (or netWorth is unindexed)
    if (currentUser && !entriesMap.has(currentUser.uid)) {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        const userNetWorth = typeof userData?.netWorth === 'number' ? userData.netWorth : 10000;
        const name = currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'My Portfolio');

        entriesMap.set(currentUser.uid, {
          id: currentUser.uid,
          displayName: name,
          netWorth: Math.round(userNetWorth),
          rank: 0,
          isCurrentUser: true,
        });
      } catch {
        // Continue
      }
    }

    // If there are fewer than 3 real users, pad with benchmark accounts so podium is always complete
    if (entriesMap.size < 3) {
      BENCHMARK_TRADERS.forEach((bench, idx) => {
        const benchId = `benchmark-${idx}`;
        if (!entriesMap.has(benchId) && entriesMap.size < 7) {
          entriesMap.set(benchId, {
            id: benchId,
            displayName: bench.name,
            netWorth: bench.baseNetWorth,
            rank: 0,
            isCurrentUser: false,
          });
        }
      });
    }

    // Convert map to array, sort descending by netWorth, and assign 1-based ranks
    const sortedEntries = Array.from(entriesMap.values())
      .sort((a, b) => b.netWorth - a.netWorth)
      .map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
      }));

    return sortedEntries;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    // Fallback benchmark array
    return BENCHMARK_TRADERS.slice(0, 5).map((b, idx) => ({
      id: `bench-${idx}`,
      displayName: b.name,
      netWorth: b.baseNetWorth,
      rank: idx + 1,
      isCurrentUser: false,
    }));
  }
}
