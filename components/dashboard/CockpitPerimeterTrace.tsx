'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { WidgetLayoutItem } from '@/lib/defaultDashboardLayout';

interface CockpitPerimeterTraceProps {
  playTrigger?: number;
  widgets: WidgetLayoutItem[];
  gridWidth: number;
  durationMs?: number;
}

interface Point {
  x: number;
  y: number;
}

export default function CockpitPerimeterTrace({
  playTrigger = 0,
  widgets,
  gridWidth,
  durationMs = 3200,
}: CockpitPerimeterTraceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [animationState, setAnimationState] = useState<'idle' | 'tracing' | 'holding' | 'fading' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(0);

  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Measure container dimensions
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
    const t2 = setTimeout(updateSize, 250);

    return () => {
      if (ro) ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [gridWidth, widgets]);

  const { width: W, height: H } = dimensions;

  // Build the outer perimeter paths from the active widget layout
  const { pathDataA, pathDataB } = useMemo(() => {
    if (W <= 0 || H <= 0 || !widgets || widgets.length === 0) {
      return { pathDataA: '', pathDataB: '' };
    }

    const maxRow = widgets.reduce((acc, w) => Math.max(acc, w.y + w.h), 0);
    if (maxRow <= 0) return { pathDataA: '', pathDataB: '' };

    // 1. Build discrete 2D occupancy grid [row][col]
    const grid: boolean[][] = Array.from({ length: maxRow }, () => Array(12).fill(false));
    widgets.forEach((w) => {
      for (let r = w.y; r < w.y + w.h && r < maxRow; r++) {
        for (let c = w.x; c < w.x + w.w && c < 12; c++) {
          grid[r][c] = true;
        }
      }
    });

    // 2. Map grid coordinates to pixel bounds
    // Inset stroke by 1px so neon line sits squarely on top of card borders with zero clipping
    const pad = 1.0;
    const colW = W / 12;
    const rowH = 90;

    const pxX = (c: number) => {
      if (c === 0) return pad;
      if (c === 12) return W - pad;
      return Math.round(c * colW);
    };

    const pxY = (r: number) => {
      if (r === 0) return pad;
      if (r === maxRow) return H - pad;
      return Math.round(r * rowH);
    };

    // Find top-left starting cell
    let rMin = 0;
    while (rMin < maxRow && !grid[rMin].some(Boolean)) {
      rMin++;
    }
    if (rMin >= maxRow) return { pathDataA: '', pathDataB: '' };

    let cStart = 0;
    while (cStart < 12 && !grid[rMin][cStart]) {
      cStart++;
    }

    // Find bottom-right ending cell
    let rMax = maxRow - 1;
    while (rMax >= 0 && !grid[rMax].some(Boolean)) {
      rMax--;
    }
    let cEnd = 11;
    while (cEnd >= 0 && !grid[rMax][cEnd]) {
      cEnd--;
    }
    const cEndCol = cEnd + 1; // outer right of that cell
    const rEndRow = rMax + 1; // outer bottom of that cell

    // 3. Build Branch A vertices (Top-Left -> Top Perimeter -> Right Perimeter -> Bottom-Right)
    const verticesA: Point[] = [];
    verticesA.push({ x: pxX(cStart), y: pxY(rMin) });

    // Top profile: for each column c from cStart to the right-most column of top widgets
    // Find column ranges for the top-most boundary
    const topRowPerCol: (number | null)[] = Array(12).fill(null);
    for (let c = 0; c < 12; c++) {
      for (let r = 0; r < maxRow; r++) {
        if (grid[r][c]) {
          topRowPerCol[c] = r;
          break;
        }
      }
    }

    const rightColPerRow: (number | null)[] = Array(maxRow).fill(null);
    for (let r = 0; r < maxRow; r++) {
      for (let c = 11; c >= 0; c--) {
        if (grid[r][c]) {
          rightColPerRow[r] = c + 1;
          break;
        }
      }
    }

    // Trace along top edges
    let curC = cStart;
    let curR = rMin;

    while (curC < 12 && topRowPerCol[curC] !== null) {
      const nextR = topRowPerCol[curC]!;
      if (nextR !== curR) {
        // Vertical step in top profile
        verticesA.push({ x: pxX(curC), y: pxY(curR) });
        verticesA.push({ x: pxX(curC), y: pxY(nextR) });
        curR = nextR;
      }
      curC++;
    }

    const maxTopC = curC;
    verticesA.push({ x: pxX(maxTopC), y: pxY(curR) });

    // Trace along right edges down to bottom-right
    let rTrace = curR;
    let cTrace = maxTopC;

    while (rTrace < rEndRow) {
      const nextC = rightColPerRow[rTrace] ?? cTrace;
      if (nextC !== cTrace) {
        // Horizontal step in right profile
        verticesA.push({ x: pxX(cTrace), y: pxY(rTrace) });
        verticesA.push({ x: pxX(nextC), y: pxY(rTrace) });
        cTrace = nextC;
      }
      rTrace++;
    }
    verticesA.push({ x: pxX(cTrace), y: pxY(rEndRow) });
    if (cTrace !== cEndCol) {
      verticesA.push({ x: pxX(cEndCol), y: pxY(rEndRow) });
    }

    // 4. Build Branch B vertices (Top-Left -> Left Perimeter -> Bottom Perimeter -> Bottom-Right)
    const verticesB: Point[] = [];
    verticesB.push({ x: pxX(cStart), y: pxY(rMin) });

    const leftColPerRow: (number | null)[] = Array(maxRow).fill(null);
    for (let r = 0; r < maxRow; r++) {
      for (let c = 0; c < 12; c++) {
        if (grid[r][c]) {
          leftColPerRow[r] = c;
          break;
        }
      }
    }

    const bottomRowPerCol: (number | null)[] = Array(12).fill(null);
    for (let c = 0; c < 12; c++) {
      for (let r = maxRow - 1; r >= 0; r--) {
        if (grid[r][c]) {
          bottomRowPerCol[c] = r + 1;
          break;
        }
      }
    }

    // Trace down left edges
    let rLeft = rMin;
    let cLeft = cStart;

    while (rLeft < rEndRow) {
      const nextC = leftColPerRow[rLeft] ?? cLeft;
      if (nextC !== cLeft) {
        // Horizontal step in left profile
        verticesB.push({ x: pxX(cLeft), y: pxY(rLeft) });
        verticesB.push({ x: pxX(nextC), y: pxY(rLeft) });
        cLeft = nextC;
      }
      rLeft++;
    }
    verticesB.push({ x: pxX(cLeft), y: pxY(rEndRow) });

    // Trace across bottom edges to bottom-right
    let cBot = cLeft;
    let rBot = rEndRow;

    while (cBot < cEndCol) {
      const nextR = bottomRowPerCol[cBot] ?? rBot;
      if (nextR !== rBot) {
        // Vertical step in bottom profile
        verticesB.push({ x: pxX(cBot), y: pxY(rBot) });
        verticesB.push({ x: pxX(cBot), y: pxY(nextR) });
        rBot = nextR;
      }
      cBot++;
    }
    verticesB.push({ x: pxX(cEndCol), y: pxY(rBot) });
    if (rBot !== rEndRow) {
      verticesB.push({ x: pxX(cEndCol), y: pxY(rEndRow) });
    }

    // Helper: Convert point sequence to SVG path with rounded 16px corners
    const buildRoundedPath = (pts: Point[]): string => {
      // Remove consecutive duplicates or collinear points
      const clean: Point[] = [];
      pts.forEach((pt) => {
        if (clean.length === 0) {
          clean.push(pt);
          return;
        }
        const last = clean[clean.length - 1];
        if (Math.abs(last.x - pt.x) < 2 && Math.abs(last.y - pt.y) < 2) return;
        clean.push(pt);
      });

      // Filter collinear points
      const filtered: Point[] = [];
      for (let i = 0; i < clean.length; i++) {
        if (i > 0 && i < clean.length - 1) {
          const prev = clean[i - 1];
          const curr = clean[i];
          const next = clean[i + 1];
          const dx1 = curr.x - prev.x;
          const dy1 = curr.y - prev.y;
          const dx2 = next.x - curr.x;
          const dy2 = next.y - curr.y;
          // Collinear if both horizontal or both vertical
          if ((dx1 === 0 && dx2 === 0) || (dy1 === 0 && dy2 === 0)) {
            continue;
          }
        }
        filtered.push(clean[i]);
      }

      if (filtered.length < 2) return '';

      const R = 16;
      let d = `M ${filtered[0].x.toFixed(1)},${filtered[0].y.toFixed(1)}`;

      for (let i = 1; i < filtered.length - 1; i++) {
        const p0 = filtered[i - 1];
        const p1 = filtered[i];
        const p2 = filtered[i + 1];

        const ux = p1.x - p0.x;
        const uy = p1.y - p0.y;
        const lenU = Math.hypot(ux, uy);

        const vx = p2.x - p1.x;
        const vy = p2.y - p1.y;
        const lenV = Math.hypot(vx, vy);

        if (lenU < 1 || lenV < 1) {
          d += ` L ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
          continue;
        }

        const cross = ux * vy - uy * vx;
        const radius = Math.min(R, lenU / 2, lenV / 2);

        if (radius < 3) {
          d += ` L ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
          continue;
        }

        const startX = p1.x - (ux / lenU) * radius;
        const startY = p1.y - (uy / lenU) * radius;

        const endX = p1.x + (vx / lenV) * radius;
        const endY = p1.y + (vy / lenV) * radius;

        const sweep = cross > 0 ? 1 : 0;

        d += ` L ${startX.toFixed(1)},${startY.toFixed(1)}`;
        d += ` A ${radius.toFixed(1)},${radius.toFixed(1)} 0 0,${sweep} ${endX.toFixed(1)},${endY.toFixed(1)}`;
      }

      const lastPt = filtered[filtered.length - 1];
      d += ` L ${lastPt.x.toFixed(1)},${lastPt.y.toFixed(1)}`;

      return d;
    };

    return {
      pathDataA: buildRoundedPath(verticesA),
      pathDataB: buildRoundedPath(verticesB),
    };
  }, [W, H, widgets]);

  // Cubic easing
  const easeInOutCubic = useCallback((t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }, []);

  const pathRefA = useRef<SVGPathElement>(null);
  const pathRefB = useRef<SVGPathElement>(null);
  const [headPosA, setHeadPosA] = useState<Point>({ x: 0, y: 0 });
  const [headPosB, setHeadPosB] = useState<Point>({ x: 0, y: 0 });

  // Animation controller
  const startTrace = useCallback(() => {
    if (W <= 0 || H <= 0 || !pathDataA || !pathDataB) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setAnimationState('tracing');
    setProgress(0);
    setOpacity(1);

    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const rawP = Math.min(1, elapsed / durationMs);
      const easedP = easeInOutCubic(rawP);

      setProgress(easedP);

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

      if (rawP < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Both beams meet simultaneously at bottom-right
        setProgress(1);
        setAnimationState('holding');
        setTimeout(() => {
          setAnimationState('fading');
          const fadeStart = performance.now();
          const fadeDuration = 800;

          const fadeAnimate = (fadeNow: number) => {
            const fadeElapsed = fadeNow - fadeStart;
            const fadeP = Math.min(1, fadeElapsed / fadeDuration);
            setOpacity(Math.max(0, 1 - fadeP));

            if (fadeP < 1) {
              animFrameRef.current = requestAnimationFrame(fadeAnimate);
            } else {
              setAnimationState('completed');
              setOpacity(0);
            }
          };

          animFrameRef.current = requestAnimationFrame(fadeAnimate);
        }, 400);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [W, H, pathDataA, pathDataB, durationMs, easeInOutCubic]);

  useEffect(() => {
    if (W > 0 && H > 0 && pathDataA && pathDataB) {
      const cleanup = startTrace();
      return cleanup;
    }
  }, [playTrigger, W, H, pathDataA, pathDataB, startTrace]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  if (animationState === 'completed' || opacity <= 0) {
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
            <filter id="cockpit-unified-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Top & Right Outer Boundary (Branch A) */}
          <path
            ref={pathRefA}
            d={pathDataA}
            fill="none"
            stroke="#00f5d4"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - progress}
            filter="url(#cockpit-unified-glow)"
            opacity="0.95"
          />

          {/* Left & Bottom Outer Boundary (Branch B) */}
          <path
            ref={pathRefB}
            d={pathDataB}
            fill="none"
            stroke="#00f5d4"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - progress}
            filter="url(#cockpit-unified-glow)"
            opacity="0.95"
          />

          {/* Leading Tips (Active during trace only; vanish upon arrival) */}
          {animationState === 'tracing' && progress > 0.01 && progress < 0.99 && (
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
