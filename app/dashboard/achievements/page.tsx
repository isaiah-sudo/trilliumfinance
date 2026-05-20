'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { Trophy } from 'lucide-react';

export default function AchievementsPage() {
  return (
    <ComingSoon
      title="Achievements Coming Soon"
      description="Earn badges, unlock milestones, and showcase your trading mastery. Stay tuned for this exciting feature!"
      icon={<Trophy className="h-12 w-12 text-purple-400" />}
    />
  );
}
