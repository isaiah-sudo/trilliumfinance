'use client';

import { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  formatter: (val: number) => string;
  startOffset?: number;
}

export function AnimatedNumber({ value, formatter, startOffset = 0 }: AnimatedNumberProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const start = startOffset > 0 ? value - startOffset : 0;
    const end = value;
    const duration = 2200; // 2.2 seconds for a premium, smooth transition
    const startTime = performance.now();
    let animationFrameId: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo (fast start, slow crawl at the end)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = start + (end - start) * ease;
      
      setCurrent(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, startOffset]);

  return <span>{formatter(current)}</span>;
}
