'use client';

import { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  formatter: (val: number) => string;
}

export function AnimatedNumber({ value, formatter }: AnimatedNumberProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200; // ms
    const startTime = performance.now();
    let animationFrameId: number;

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = start + (end - start) * ease;
      
      setCurrent(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{formatter(current)}</span>;
}
