'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';

interface WidgetBorderTraceProps {
  playTrigger?: number;
  sequenceIndex?: number;
  totalWidgets?: number;
  durationPerWidget?: number;
  holdDurationMs?: number;
  fadeDurationMs?: number;
  isTopLeftCorner?: boolean;
  isTopRightCorner?: boolean;
  isBottomLeftCorner?: boolean;
  isBottomRightCorner?: boolean;
}

export default function WidgetBorderTrace({
  playTrigger = 0,
  sequenceIndex = 0,
  totalWidgets = 1,
  durationPerWidget = 1300,
  holdDurationMs = 450,
  fadeDurationMs = 800,
  isTopLeftCorner = true,
  isTopRightCorner = true,
  isBottomLeftCorner = true,
  isBottomRightCorner = true,
}: WidgetBorderTraceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [animationState, setAnimationState] = useState<'idle' | 'tracing' | 'holding' | 'fading' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(0);

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Measure card dimensions directly from DOM
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };

    updateSize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => {
        updateSize();
      });
      ro.observe(containerRef.current);
    }

    const t1 = setTimeout(updateSize, 60);
    const t2 = setTimeout(updateSize, 200);

    return () => {
      if (ro) ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const { width: W, height: H } = dimensions;

  // Geometry configuration:
  // Stroke width 1.75px.
  // Inset path by pad = strokeWidth / 2 = 0.875px so stroke aligns perfectly with card border.
  const strokeWidth = 1.75;
  const pad = strokeWidth / 2;

  const { pathDataA, pathDataB } = useMemo(() => {
    if (W <= 0 || H <= 0) return { pathDataA: '', pathDataB: '' };

    const x0 = pad;
    const y0 = pad;
    const x1 = W - pad;
    const y1 = H - pad;
    const wEff = x1 - x0;
    const hEff = y1 - y0;

    const baseR = Math.max(0, 16 - pad);
    const maxR = Math.min(wEff / 2, hEff / 2);

    const rTL = isTopLeftCorner ? Math.min(baseR, maxR) : 0;
    const rTR = isTopRightCorner ? Math.min(baseR, maxR) : 0;
    const rBL = isBottomLeftCorner ? Math.min(baseR, maxR) : 0;
    const rBR = isBottomRightCorner ? Math.min(baseR, maxR) : 0;

    // 45-degree diagonal offset constant for corner arcs: (1 - 1/sqrt(2))
    const K = 0.2928932;

    // Start point at Top-Left (45-deg diagonal of TL corner arc)
    const startX = rTL > 0 ? x0 + rTL * K : x0;
    const startY = rTL > 0 ? y0 + rTL * K : y0;

    // End point at Bottom-Right (45-deg diagonal of BR corner arc)
    const endX = rBR > 0 ? x1 - rBR * K : x1;
    const endY = rBR > 0 ? y1 - rBR * K : y1;

    // Path A: Top & Right branch (Clockwise from Top-Left to Bottom-Right)
    let dA = `M ${startX.toFixed(2)},${startY.toFixed(2)}`;
    if (rTL > 0) {
      dA += ` A ${rTL.toFixed(2)},${rTL.toFixed(2)} 0 0,1 ${(x0 + rTL).toFixed(2)},${y0.toFixed(2)}`;
    }
    dA += ` L ${(x1 - rTR).toFixed(2)},${y0.toFixed(2)}`;
    if (rTR > 0) {
      dA += ` A ${rTR.toFixed(2)},${rTR.toFixed(2)} 0 0,1 ${x1.toFixed(2)},${(y0 + rTR).toFixed(2)}`;
    }
    dA += ` L ${x1.toFixed(2)},${(y1 - rBR).toFixed(2)}`;
    if (rBR > 0) {
      dA += ` A ${rBR.toFixed(2)},${rBR.toFixed(2)} 0 0,1 ${endX.toFixed(2)},${endY.toFixed(2)}`;
    }

    // Path B: Left & Bottom branch (Counter-Clockwise from Top-Left to Bottom-Right)
    let dB = `M ${startX.toFixed(2)},${startY.toFixed(2)}`;
    if (rTL > 0) {
      dB += ` A ${rTL.toFixed(2)},${rTL.toFixed(2)} 0 0,0 ${x0.toFixed(2)},${(y0 + rTL).toFixed(2)}`;
    }
    dB += ` L ${x0.toFixed(2)},${(y1 - rBL).toFixed(2)}`;
    if (rBL > 0) {
      dB += ` A ${rBL.toFixed(2)},${rBL.toFixed(2)} 0 0,0 ${(x0 + rBL).toFixed(2)},${y1.toFixed(2)}`;
    }
    dB += ` L ${(x1 - rBR).toFixed(2)},${y1.toFixed(2)}`;
    if (rBR > 0) {
      dB += ` A ${rBR.toFixed(2)},${rBR.toFixed(2)} 0 0,0 ${endX.toFixed(2)},${endY.toFixed(2)}`;
    }

    return { pathDataA: dA, pathDataB: dB };
  }, [W, H, pad, isTopLeftCorner, isTopRightCorner, isBottomLeftCorner, isBottomRightCorner]);

  // Cubic easing for sleek, natural cockpit power-on pacing
  const easeInOutCubic = useCallback((t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }, []);

  const pathRefA = useRef<SVGPathElement>(null);
  const pathRefB = useRef<SVGPathElement>(null);
  const [headPosA, setHeadPosA] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [headPosB, setHeadPosB] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Synchronized sequential cockpit trace animation loop
  const startTrace = useCallback(() => {
    if (W <= 0 || H <= 0) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setAnimationState('idle');
    setProgress(0);
    setOpacity(0);

    const myStart = sequenceIndex * durationPerWidget;
    const myEnd = myStart + durationPerWidget;
    const totalTraceTime = Math.max(1, totalWidgets * durationPerWidget);
    const fadeStart = totalTraceTime + holdDurationMs;
    const fadeEnd = fadeStart + fadeDurationMs;

    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;

      if (elapsed < myStart) {
        // Not reached yet in sequence
        setAnimationState('idle');
        setProgress(0);
        setOpacity(0);
        animFrameRef.current = requestAnimationFrame(animate);
      } else if (elapsed < myEnd) {
        // ACTIVELY TRACING this widget's borders
        setAnimationState('tracing');
        const rawP = Math.min(1, (elapsed - myStart) / durationPerWidget);
        const easedP = easeInOutCubic(rawP);
        setProgress(easedP);
        setOpacity(1);

        if (pathRefA.current) {
          const lenA = pathRefA.current.getTotalLength();
          if (lenA > 0) {
            const ptA = pathRefA.current.getPointAtLength(lenA * easedP);
            setHeadPosA({ x: ptA.x, y: ptA.y });
          }
        }

        if (pathRefB.current) {
          const lenB = pathRefB.current.getTotalLength();
          if (lenB > 0) {
            const ptB = pathRefB.current.getPointAtLength(lenB * easedP);
            setHeadPosB({ x: ptB.x, y: ptB.y });
          }
        }

        animFrameRef.current = requestAnimationFrame(animate);
      } else if (elapsed < fadeStart) {
        // HOLDING illuminated while subsequent widgets trace and until all are done
        setAnimationState('holding');
        setProgress(1);
        setOpacity(1);
        animFrameRef.current = requestAnimationFrame(animate);
      } else if (elapsed < fadeEnd) {
        // FADING simultaneously with all other widgets back to normal card borders
        setAnimationState('fading');
        setProgress(1);
        const fadeP = Math.min(1, (elapsed - fadeStart) / fadeDurationMs);
        setOpacity(Math.max(0, 1 - fadeP));
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // COMPLETED
        setAnimationState('completed');
        setProgress(1);
        setOpacity(0);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [W, H, sequenceIndex, totalWidgets, durationPerWidget, holdDurationMs, fadeDurationMs, easeInOutCubic]);

  useEffect(() => {
    if (W > 0 && H > 0) {
      const cleanup = startTrace();
      return cleanup;
    }
  }, [playTrigger, W, H, startTrace]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  if (animationState === 'idle' || animationState === 'completed' || opacity <= 0) {
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 pointer-events-none z-30 overflow-visible"
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-30 overflow-visible transition-opacity duration-75 ease-out"
      style={{ opacity }}
      aria-hidden="true"
    >
      {W > 0 && H > 0 && pathDataA && pathDataB && (
        <svg
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          viewBox={`0 0 ${W} ${H}`}
        >
          <defs>
            <filter id={`widget-glow-${sequenceIndex}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Top & Right Branch (Branch A) */}
          <path
            ref={pathRefA}
            d={pathDataA}
            fill="none"
            stroke="#00f5d4"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - progress}
            filter={`url(#widget-glow-${sequenceIndex})`}
            opacity="0.95"
          />

          {/* Left & Bottom Branch (Branch B) */}
          <path
            ref={pathRefB}
            d={pathDataB}
            fill="none"
            stroke="#00f5d4"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - progress}
            filter={`url(#widget-glow-${sequenceIndex})`}
            opacity="0.95"
          />

          {/* Leading Tips (Active during trace only; no lingering circle or explosion) */}
          {animationState === 'tracing' && progress > 0.02 && progress < 0.98 && (
            <>
              <circle
                cx={headPosA.x}
                cy={headPosA.y}
                r="2.2"
                fill="#ffffff"
                stroke="#00f5d4"
                strokeWidth="1"
              />
              <circle
                cx={headPosB.x}
                cy={headPosB.y}
                r="2.2"
                fill="#ffffff"
                stroke="#00f5d4"
                strokeWidth="1"
              />
            </>
          )}
        </svg>
      )}
    </div>
  );
}
