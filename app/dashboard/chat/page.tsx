'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { Sparkles } from 'lucide-react';

export default function ChatPage() {
  return (
    <ComingSoon
      title="Chat Coming Soon"
      description="Real‑time discussion and AI‑assisted market insights will be available here. Stay tuned for the launch!"
      icon={<Sparkles className="h-12 w-12 text-blue-400" />}
    />
  );
}
