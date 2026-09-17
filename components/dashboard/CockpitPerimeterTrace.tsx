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
  const { pathDataA, pathDataB, closedPath, maxRow = 0 } = useMemo(() => {
    const effectiveW = gridWidth > 0 ? gridWidth : W;
    if (effectiveW <= 0 || H <= 0 || !widgets || widgets.length === 0) {
      return { pathDataA: '', pathDataB: '', closedPath: '', maxRow: 0 };
    }

    const maxRow = widgets.reduce((acc, w) => Math.max(acc, w.y + w.h), 0);
    if (maxRow <= 0) return { pathDataA: '', pathDataB: '', closedPath: '', maxRow: 0 };

    const totalCols = effectiveW >= 1200 ? 12 : effectiveW >= 996 ? 10 : 6;

    // 1. Build discrete 2D occupancy grid [row][col]
    const grid: boolean[][] = Array.from({ length: maxRow }, () => Array(totalCols).fill(false));
    widgets.forEach((w) => {
      for (let r = w.y; r < w.y + w.h && r < maxRow; r++) {
        for (let c = w.x; c < w.x + w.w && c < totalCols; c++) {
          grid[r][c] = true;
        }
      }
    });

    // 2. Map grid coordinates to pixel bounds
    // Inset stroke by 1px so neon line sits squarely on top of card borders with zero clipping
    const pad = 1.0;
    const colW = effectiveW / totalCols;
    const rowH = 90;

    const pxX = (c: number) => {
      if (c === 0) return pad;
      if (c >= totalCols) return effectiveW - pad;
      return Math.round(c * colW);
    };

    const pxY = (r: number) => {
      if (r === 0) return pad;
      if (r >= maxRow) return Math.round(maxRow * rowH) - pad;
      return Math.round(r * rowH);
    };

    // Find top-left starting cell
    let rMin = 0;
    while (rMin < maxRow && !grid[rMin].some(Boolean)) {
      rMin++;
    }
    if (rMin >= maxRow) return { pathDataA: '', pathDataB: '', closedPath: '', maxRow: 0 };

    let cStart = 0;
    while (cStart < totalCols && !grid[rMin][cStart]) {
      cStart++;
    }

    // Find bottom-right ending cell
    let rMax = maxRow - 1;
    while (rMax >= 0 && !grid[rMax].some(Boolean)) {
      rMax--;
    }
    let cEnd = totalCols - 1;
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
    const topRowPerCol: (number | null)[] = Array(totalCols).fill(null);
    for (let c = 0; c < totalCols; c++) {
      for (let r = 0; r < maxRow; r++) {
        if (grid[r][c]) {
          topRowPerCol[c] = r;
          break;
        }
      }
    }

    const rightColPerRow: (number | null)[] = Array(maxRow).fill(null);
    for (let r = 0; r < maxRow; r++) {
      for (let c = totalCols - 1; c >= 0; c--) {
        if (grid[r][c]) {
          rightColPerRow[r] = c + 1;
          break;
        }
      }
    }

    // Trace along top edges
    let curC = cStart;
    let curR = rMin;

    while (curC < totalCols && topRowPerCol[curC] !== null) {
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
      for (let c = 0; c < totalCols; c++) {
        if (grid[r][c]) {
          leftColPerRow[r] = c;
          break;
        }
      }
    }

    const bottomRowPerCol: (number | null)[] = Array(totalCols).fill(null);
    for (let c = 0; c < totalCols; c++) {
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

    // 5. Build Closed Perimeter Path (Top-Left -> Branch A -> Bottom-Right -> Branch B reversed -> Top-Left)
    const verticesClosed: Point[] = [
      ...verticesA,
      ...verticesB.slice(1, -1).reverse(),
    ];

    // Helper: Convert point sequence to SVG path with rounded corners
    const buildRoundedPath = (pts: Point[], close = false): string => {
      // Remove consecutive duplicates
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

      if (close && clean.length > 2) {
        const first = clean[0];
        const last = clean[clean.length - 1];
        if (Math.abs(last.x - first.x) < 2 && Math.abs(last.y - first.y) < 2) {
          clean.pop();
        }
      }

      // Filter collinear points
      let filtered: Point[] = [...clean];
      let changed = true;
      let iters = 0;
      while (changed && iters < 10) {
        iters++;
        changed = false;
        const nextFiltered: Point[] = [];
        const n = filtered.length;
        for (let i = 0; i < n; i++) {
          if (!close && (i === 0 || i === n - 1)) {
            nextFiltered.push(filtered[i]);
            continue;
          }
          const prev = filtered[(i - 1 + n) % n];
          const curr = filtered[i];
          const next = filtered[(i + 1) % n];
          const dx1 = curr.x - prev.x;
          const dy1 = curr.y - prev.y;
          const dx2 = next.x - curr.x;
          const dy2 = next.y - curr.y;
          if ((dx1 === 0 && dx2 === 0 && dy1 * dy2 > 0) || (dy1 === 0 && dy2 === 0 && dx1 * dx2 > 0)) {
            changed = true;
            continue;
          }
          nextFiltered.push(filtered[i]);
        }
        filtered = nextFiltered;
      }

      const n = filtered.length;
      if (n < 2) return '';

      // 16px corner radius matching rounded-2xl on DashboardWidgetCard outer corners exactly
      const R = 16;

      if (close) {
        if (n < 3) return '';

        // Precompute arc geometry for each vertex i in [0..n-1]
        const arcs: {
          startX: number;
          startY: number;
          endX: number;
          endY: number;
          radius: number;
          sweep: number;
          isPoint: boolean;
        }[] = [];

        for (let i = 0; i < n; i++) {
          const p0 = filtered[(i - 1 + n) % n];
          const p1 = filtered[i];
          const p2 = filtered[(i + 1) % n];

          const ux = p1.x - p0.x;
          const uy = p1.y - p0.y;
          const lenU = Math.hypot(ux, uy);

          const vx = p2.x - p1.x;
          const vy = p2.y - p1.y;
          const lenV = Math.hypot(vx, vy);

          if (lenU < 1 || lenV < 1) {
            arcs.push({ startX: p1.x, startY: p1.y, endX: p1.x, endY: p1.y, radius: 0, sweep: 0, isPoint: true });
            continue;
          }

          const cross = ux * vy - uy * vx;
          const radius = Math.min(R, lenU / 2, lenV / 2);

          if (radius < 3) {
            arcs.push({ startX: p1.x, startY: p1.y, endX: p1.x, endY: p1.y, radius: 0, sweep: 0, isPoint: true });
            continue;
          }

          const startX = p1.x - (ux / lenU) * radius;
          const startY = p1.y - (uy / lenU) * radius;

          const endX = p1.x + (vx / lenV) * radius;
          const endY = p1.y + (vy / lenV) * radius;

          const sweep = cross > 0 ? 1 : 0;
          arcs.push({ startX, startY, endX, endY, radius, sweep, isPoint: false });
        }

        // Start path at the exit of vertex 0's rounded corner arc (along edge toward vertex 1)
        const a0 = arcs[0];
        let d = `M ${a0.endX.toFixed(1)},${a0.endY.toFixed(1)}`;

        // Traverse through subsequent vertices 1..n-1
        for (let i = 1; i < n; i++) {
          const a = arcs[i];
          if (a.isPoint) {
            d += ` L ${a.startX.toFixed(1)},${a.startY.toFixed(1)}`;
          } else {
            d += ` L ${a.startX.toFixed(1)},${a.startY.toFixed(1)}`;
            d += ` A ${a.radius.toFixed(1)},${a.radius.toFixed(1)} 0 0,${a.sweep} ${a.endX.toFixed(1)},${a.endY.toFixed(1)}`;
          }
        }

        // Connect back to vertex 0 and complete vertex 0's rounded corner arc smoothly
        if (a0.isPoint) {
          d += ` L ${a0.startX.toFixed(1)},${a0.startY.toFixed(1)}`;
        } else {
          d += ` L ${a0.startX.toFixed(1)},${a0.startY.toFixed(1)}`;
          d += ` A ${a0.radius.toFixed(1)},${a0.radius.toFixed(1)} 0 0,${a0.sweep} ${a0.endX.toFixed(1)},${a0.endY.toFixed(1)}`;
        }

        d += ' Z';
        return d;
      }

      // Open path: start at vertex 0, round intermediate vertices 1..n-2, end at vertex n-1
      let d = `M ${filtered[0].x.toFixed(1)},${filtered[0].y.toFixed(1)}`;

      for (let i = 1; i < n - 1; i++) {
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

      const lastPt = filtered[n - 1];
      d += ` L ${lastPt.x.toFixed(1)},${lastPt.y.toFixed(1)}`;
      return d;
    };

    return {
      pathDataA: buildRoundedPath(verticesA, false),
      pathDataB: buildRoundedPath(verticesB, false),
      closedPath: buildRoundedPath(verticesClosed, true),
      maxRow,
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

  const [laserOpacity, setLaserOpacity] = useState(0);
  const [underglowOpacity, setUnderglowOpacity] = useState(1);

  const hasStartedRef = useRef(false);
  const lastPlayTriggerRef = useRef(playTrigger);

  // Animation controller: Cockpit Intro traces around widgets, then fades smoothly into the underglow
  const startTrace = useCallback(() => {
    if (W <= 0 || H <= 0 || !pathDataA || !pathDataB) return;

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setAnimationState('tracing');
    setProgress(0);
    setLaserOpacity(1);
    setUnderglowOpacity(0.25); // Subtle ambient glow during Cockpit Intro trace

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
        // Cockpit intro has finished tracing around the widgets!
        setProgress(1);
        setAnimationState('fading');

        // Smooth cross-fade: Cockpit Intro fades OUT while the Portfolio underglow blooms IN
        const fadeStart = performance.now();
        const fadeDuration = 800; // 800ms luxurious crossfade

        const crossFade = (fadeNow: number) => {
          const fadeElapsed = fadeNow - fadeStart;
          const fadeP = Math.min(1, fadeElapsed / fadeDuration);
          const easedFadeP = easeInOutCubic(fadeP);

          setLaserOpacity(Math.max(0, 1 - easedFadeP));
          setUnderglowOpacity(Math.min(1, 0.25 + 0.75 * easedFadeP));

          if (fadeP < 1) {
            animFrameRef.current = requestAnimationFrame(crossFade);
          } else {
            setAnimationState('completed');
            setLaserOpacity(0);
            setUnderglowOpacity(1); // Keep underglow permanently active under widgets
          }
        };

        animFrameRef.current = requestAnimationFrame(crossFade);
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
    const effectiveW = gridWidth > 0 ? gridWidth : W;
    if (effectiveW <= 0 || H <= 0 || !pathDataA || !pathDataB) return;

    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      lastPlayTriggerRef.current = playTrigger;
      const cleanup = startTrace();
      return cleanup;
    }

    if (playTrigger !== lastPlayTriggerRef.current) {
      lastPlayTriggerRef.current = playTrigger;
      const cleanup = startTrace();
      return cleanup;
    }
  }, [playTrigger, gridWidth, W, H, pathDataA, pathDataB, startTrace]);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  if (W <= 0 || H <= 0 || !pathDataA || !pathDataB) {
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 pointer-events-none z-0 overflow-visible"
        aria-hidden="true"
      />
    );
  }

  const svgHeight = Math.max(H, maxRow * 90);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-visible">
      {/* 1. Ambient Underglow Layer: Positioned beneath widgets (z-0), casting the EXACT same underglow as Portfolio Overview */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-visible transition-opacity duration-700 ease-out"
        style={{ opacity: underglowOpacity }}
        aria-hidden="true"
      >
        <svg
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          viewBox={`0 0 ${W} ${svgHeight}`}
        >
          {closedPath && (
            <>
              {/* Layer 1A: Soft subtle ambient whisper path strictly hugging the widget perimeter */}
              <path
                d={closedPath}
                fill="none"
                stroke="var(--theme-accent-glow, rgba(168, 85, 247, 0.15))"
                strokeWidth="14"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{
                  filter: 'blur(14px)',
                  opacity: 0.22,
                }}
              />
            </>
          )}
        </svg>
      </div>

      {/* 2. Cockpit Intro Laser Tracing Layer: Positioned above widgets (z-30) during active Cockpit Intro */}
      {laserOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none z-30 overflow-visible transition-opacity duration-300 ease-out"
          style={{ opacity: laserOpacity }}
          aria-hidden="true"
        >
          <svg
            className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
            viewBox={`0 0 ${W} ${svgHeight}`}
          >
            {/* Top & Right Outer Boundary (Branch A) */}
            <path
              ref={pathRefA}
              d={pathDataA}
              fill="none"
              stroke="var(--theme-accent, #3b82f6)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - progress}
              style={{
                filter: 'drop-shadow(0 0 6px var(--theme-accent, #3b82f6)) drop-shadow(0 0 14px var(--theme-accent-glow, rgba(59, 130, 246, 0.6)))',
              }}
              opacity="0.95"
            />

            {/* Left & Bottom Outer Boundary (Branch B) */}
            <path
              ref={pathRefB}
              d={pathDataB}
              fill="none"
              stroke="var(--theme-accent, #3b82f6)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - progress}
              style={{
                filter: 'drop-shadow(0 0 6px var(--theme-accent, #3b82f6)) drop-shadow(0 0 14px var(--theme-accent-glow, rgba(59, 130, 246, 0.6)))',
              }}
              opacity="0.95"
            />

            {/* Leading Tips (Active during trace only; vanish upon arrival) */}
            {animationState === 'tracing' && progress > 0.01 && progress < 0.99 && (
              <>
                <circle
                  cx={headPosA.x}
                  cy={headPosA.y}
                  r="4"
                  fill="#ffffff"
                  stroke="var(--theme-accent, #3b82f6)"
                  strokeWidth="2"
                  style={{ filter: 'drop-shadow(0 0 8px var(--theme-accent, #3b82f6))' }}
                />
                <circle
                  cx={headPosB.x}
                  cy={headPosB.y}
                  r="4"
                  fill="#ffffff"
                  stroke="var(--theme-accent, #3b82f6)"
                  strokeWidth="2"
                  style={{ filter: 'drop-shadow(0 0 8px var(--theme-accent, #3b82f6))' }}
                />
              </>
            )}
          </svg>
        </div>
      )}
    </div>
  );
}
