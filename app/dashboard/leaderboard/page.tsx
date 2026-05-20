'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { Star } from 'lucide-react';

export default function LeaderboardPage() {
  return (
    <ComingSoon
      title="Leaderboard Coming Soon"
      description="Compete with peers, track rankings, and rise to the top of the Trillium community. Coming very soon!"
      icon={<Star className="h-12 w-12 text-yellow-400" />}
    />
  );
}
