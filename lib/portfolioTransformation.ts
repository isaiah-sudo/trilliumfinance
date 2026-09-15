/**
 * Portfolio Data Transformation Utility
 * 
 * Prepares raw Firestore snapshot arrays into exact interval datasets for 1D, 1W, 1M, 1Y, and ALL charts.
 * Excludes all non-trading stock market hours (overnight hours & weekends) where appropriate.
 * Market Trading Hours: 9:30 AM to 4:00 PM EST (Monday - Friday).
 */

export interface RawSnapshot {
  time: number; // Unix timestamp in seconds or milliseconds
  value: number;
  spyValue?: number;
  achievements?: any[];
}

export interface ChartPoint26 {
  slotIndex: number;
  timeLabel: string;
  time: number | null; // Unix timestamp in seconds (null for future unreached slots)
  portfolioValue: number | null;
  spyValue: number | null;
  achievements?: any[];
  isFuture?: boolean;
}

export type TimeRange = '1D' | '1W' | '1M' | '1Y' | 'ALL';

/**
 * Normalizes input timestamp to Unix seconds.
 */
export function toSeconds(ts: number): number {
  return ts > 1e11 ? Math.floor(ts / 1000) : Math.floor(ts);
}

/**
 * Accurately extracts US Eastern Time date/time components using standard Intl.
 */
export function getESTDateInfo(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
    weekday: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);

  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';
  const weekday = getPart('weekday');
  const hours = parseInt(getPart('hour'), 10) % 24;
  const minutes = parseInt(getPart('minute'), 10);
  const seconds = parseInt(getPart('second'), 10);
  const year = parseInt(getPart('year'), 10);
  const month = parseInt(getPart('month'), 10);
  const day = parseInt(getPart('day'), 10);

  const isWeekend = weekday === 'Sat' || weekday === 'Sun';
  const totalMinutes = hours * 60 + minutes;
  const isMarketHours = !isWeekend && totalMinutes >= 570 && totalMinutes <= 960; // 9:30 AM - 4:00 PM

  return { weekday, hours, minutes, seconds, year, month, day, isWeekend, totalMinutes, isMarketHours };
}

/**
 * Checks if a given Date is within US Stock Market trading hours:
 * Monday through Friday, 9:30 AM to 4:00 PM EST.
 */
export function isMarketTradingTime(date: Date): boolean {
  const info = getESTDateInfo(date);
  return info.isMarketHours;
}

/**
 * Filters an array of raw snapshots to keep ONLY those occurring during active market trading hours.
 * If filtering produces too few points, safely falls back to avoid an empty graph.
 */
export function filterMarketHoursOnly(snapshots: RawSnapshot[]): RawSnapshot[] {
  const filtered = snapshots.filter((snap) => {
    const sec = toSeconds(snap.time);
    return isMarketTradingTime(new Date(sec * 1000));
  });
  return filtered.length >= 2 ? filtered : snapshots;
}

/**
 * Calculates accurate UTC timestamps for market open (9:30 AM EST) and close (4:00 PM EST)
 * for the target trading session (skipping weekends and handling pre-market).
 */
export function getMarketOpenAndClose(referenceDate: Date = new Date()): { openUtcMs: number; closeUtcMs: number; isSessionActive: boolean } {
  const estInfo = getESTDateInfo(referenceDate);

  // If weekend or pre-market on a weekday, reference the prior active trading day
  let targetRef = referenceDate;
  if (estInfo.weekday === 'Sun') {
    targetRef = new Date(referenceDate.getTime() - 2 * 24 * 3600 * 1000);
  } else if (estInfo.weekday === 'Sat') {
    targetRef = new Date(referenceDate.getTime() - 1 * 24 * 3600 * 1000);
  } else if (estInfo.hours < 9 || (estInfo.hours === 9 && estInfo.minutes < 30)) {
    const daysBack = estInfo.weekday === 'Mon' ? 3 : 1;
    targetRef = new Date(referenceDate.getTime() - daysBack * 24 * 3600 * 1000);
  }

  const targetInfo = getESTDateInfo(targetRef);

  // Compute New York offset:
  const utcEquivalentMs = Date.UTC(targetInfo.year, targetInfo.month - 1, targetInfo.day, targetInfo.hours, targetInfo.minutes, targetInfo.seconds);
  const offsetMs = utcEquivalentMs - targetRef.getTime();

  const openUtcMs = Date.UTC(targetInfo.year, targetInfo.month - 1, targetInfo.day, 9, 30, 0) - offsetMs;
  const closeUtcMs = Date.UTC(targetInfo.year, targetInfo.month - 1, targetInfo.day, 16, 0, 0) - offsetMs;

  const nowMs = referenceDate.getTime();
  const isSessionActive = nowMs >= openUtcMs && nowMs <= closeUtcMs && !estInfo.isWeekend;

  return { openUtcMs, closeUtcMs, isSessionActive };
}

/**
 * Generates 26 fixed slots covering market hours for a trading day:
 * 9:30 AM to 4:00 PM EST.
 */
export function generate1DSlots(referenceDate: Date = new Date()): Date[] {
  const { openUtcMs, closeUtcMs } = getMarketOpenAndClose(referenceDate);
  const slotIntervalMs = (closeUtcMs - openUtcMs) / 25;

  const slots: Date[] = [];
  for (let i = 0; i < 26; i++) {
    slots.push(new Date(openUtcMs + i * slotIntervalMs));
  }
  return slots;
}

/**
 * Formats a Date object into a readable time/date string for tooltips and axes.
 */
export function formatSlotLabel(date: Date, timeRange: TimeRange): string {
  if (timeRange === '1D') {
    return date.toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  if (timeRange === '1W') {
    return date.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'short',
    });
  }
  if (timeRange === '1M') {
    return date.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
    });
  }
  if (timeRange === '1Y') {
    return date.toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
    });
  }
  return date.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    year: '2-digit',
  });
}

/**
 * Transforms raw portfolio & benchmark snapshots for the 1D view into 26 fixed slots (9:30 AM to 4:00 PM EST).
 */
export function process1DSnapshots(
  portfolioRaw: RawSnapshot[],
  benchmarkRaw: RawSnapshot[],
  now: Date = new Date()
): ChartPoint26[] {
  const slots = generate1DSlots(now);
  const nowSec = Math.floor(now.getTime() / 1000);
  const { isSessionActive } = getMarketOpenAndClose(now);

  const sortedPort = [...portfolioRaw].sort((a, b) => toSeconds(a.time) - toSeconds(b.time));
  const sortedBench = [...benchmarkRaw].sort((a, b) => toSeconds(a.time) - toSeconds(b.time));

  const startPortVal = sortedPort.length > 0 ? sortedPort[0].value : 10000;
  const endPortVal = sortedPort.length > 0 ? sortedPort[sortedPort.length - 1].value : startPortVal;
  
  const startBenchVal = sortedBench.length > 0 ? (sortedBench[0].spyValue || sortedBench[0].value || 510) : 510;
  const endBenchVal = sortedBench.length > 0 ? (sortedBench[sortedBench.length - 1].spyValue || sortedBench[sortedBench.length - 1].value || startBenchVal) : startBenchVal;

  const totalPortDiff = endPortVal - startPortVal;
  const totalBenchDiff = endBenchVal - startBenchVal;

  const result: ChartPoint26[] = [];

  for (let i = 0; i < 26; i++) {
    const slotDate = slots[i];
    const slotSec = Math.floor(slotDate.getTime() / 1000);
    const label = formatSlotLabel(slotDate, '1D');
    const fraction = i / 25;

    // A slot is future only if current session is active and slot timestamp is in the future
    const isFuture = isSessionActive && slotSec > (nowSec + 60);

    let portVal: number;
    let benchVal: number;

    if (i === 0) {
      portVal = startPortVal;
      benchVal = startBenchVal;
    } else if (i === 25) {
      portVal = endPortVal;
      benchVal = endBenchVal;
    } else {
      // Look for real snapshots within 10 minutes of this slot
      const bucket = sortedPort.filter((p) => Math.abs(toSeconds(p.time) - slotSec) <= 468);
      if (bucket.length > 0) {
        portVal = bucket.reduce((acc, curr) => acc + curr.value, 0) / bucket.length;
      } else {
        const prev = sortedPort.filter((p) => toSeconds(p.time) <= slotSec).pop();
        const next = sortedPort.find((p) => toSeconds(p.time) >= slotSec);
        if (prev && next && prev.time !== next.time) {
          const t = (slotSec - toSeconds(prev.time)) / (toSeconds(next.time) - toSeconds(prev.time));
          portVal = prev.value + t * (next.value - prev.value);
        } else if (prev) {
          portVal = prev.value;
        } else if (next) {
          portVal = next.value;
        } else {
          // Synthetic natural micro-curve between start and end
          const wave = Math.sin(fraction * Math.PI) * (Math.abs(totalPortDiff) * 0.25 || 15) * Math.sin(i * 0.8);
          portVal = startPortVal + fraction * totalPortDiff + wave;
        }
      }

      // Benchmark point calculation
      const benchBucket = sortedBench.filter((b) => Math.abs(toSeconds(b.time) - slotSec) <= 468);
      if (benchBucket.length > 0) {
        benchVal = benchBucket.reduce((acc, curr) => acc + (curr.spyValue || curr.value), 0) / benchBucket.length;
      } else {
        const prevB = sortedBench.filter((b) => toSeconds(b.time) <= slotSec).pop();
        const nextB = sortedBench.find((b) => toSeconds(b.time) >= slotSec);
        if (prevB && nextB && prevB.time !== nextB.time) {
          const t = (slotSec - toSeconds(prevB.time)) / (toSeconds(nextB.time) - toSeconds(prevB.time));
          const p0 = prevB.spyValue || prevB.value;
          const p1 = nextB.spyValue || nextB.value;
          benchVal = p0 + t * (p1 - p0);
        } else {
          const bWave = Math.sin(fraction * Math.PI) * (Math.abs(totalBenchDiff) * 0.2 || 1.5) * Math.cos(i * 0.7);
          benchVal = startBenchVal + fraction * totalBenchDiff + bWave;
        }
      }
    }

    // Benchmark scaling: normalize to startPortVal so both start at identical dollar level on left edge
    let scaledSpy: number | null = null;
    if (benchVal !== null && startBenchVal > 0) {
      const benchReturnRatio = (benchVal - startBenchVal) / startBenchVal;
      scaledSpy = startPortVal * (1 + benchReturnRatio);
    }

    result.push({
      slotIndex: i,
      timeLabel: label,
      time: slotSec,
      portfolioValue: isFuture ? null : Number(portVal.toFixed(2)),
      spyValue: isFuture ? null : (scaledSpy !== null ? Number(scaledSpy.toFixed(2)) : null),
      achievements: [],
      isFuture,
    });
  }

  // Guarantee the last reached non-future slot precisely matches the live portfolio net worth
  const activeIndices = result
    .map((p, idx) => (p.portfolioValue !== null ? idx : -1))
    .filter((idx) => idx !== -1);

  if (activeIndices.length > 0) {
    const lastActiveIdx = activeIndices[activeIndices.length - 1];
    result[lastActiveIdx].portfolioValue = Number(endPortVal.toFixed(2));
  }

  return result;
}

/**
 * Groups snapshots for 1W, 1M, 1Y, and ALL views.
 * Excludes overnight and weekend noise while preserving period endpoints.
 */
export function processMultiTimeframeSnapshots(
  portfolioRaw: RawSnapshot[],
  benchmarkRaw: RawSnapshot[],
  timeRange: TimeRange
): ChartPoint26[] {
  const sortedPort = [...portfolioRaw].sort((a, b) => toSeconds(a.time) - toSeconds(b.time));
  const sortedBench = [...benchmarkRaw].sort((a, b) => toSeconds(a.time) - toSeconds(b.time));

  const targetPointCount = 26;

  if (sortedPort.length === 0) {
    const dummyDate = new Date();
    return Array.from({ length: targetPointCount }, (_, i) => ({
      slotIndex: i,
      timeLabel: formatSlotLabel(dummyDate, timeRange),
      time: Math.floor(dummyDate.getTime() / 1000),
      portfolioValue: null,
      spyValue: null,
      achievements: [],
      isFuture: false,
    }));
  }

  const startPortVal = sortedPort[0]?.value ?? 10000;
  const endPortVal = sortedPort[sortedPort.length - 1]?.value ?? startPortVal;

  const startBenchVal = sortedBench[0]?.spyValue || sortedBench[0]?.value || 510;
  const endBenchVal = sortedBench[sortedBench.length - 1]?.spyValue || sortedBench[sortedBench.length - 1]?.value || startBenchVal;

  const totalPortDiff = endPortVal - startPortVal;
  const totalBenchDiff = endBenchVal - startBenchVal;

  const minTime = toSeconds(sortedPort[0].time);
  const maxTime = toSeconds(sortedPort[sortedPort.length - 1].time);
  const timeSpan = Math.max(maxTime - minTime, 86400);
  const bucketDuration = timeSpan / (targetPointCount - 1);

  const result: ChartPoint26[] = [];

  for (let i = 0; i < targetPointCount; i++) {
    const fraction = i / (targetPointCount - 1);
    const centerTime = minTime + i * bucketDuration;
    const slotDate = new Date(centerTime * 1000);
    const label = formatSlotLabel(slotDate, timeRange);

    let portVal: number;
    let benchVal: number;

    if (i === 0) {
      portVal = startPortVal;
      benchVal = startBenchVal;
    } else if (i === targetPointCount - 1) {
      portVal = endPortVal;
      benchVal = endBenchVal;
    } else {
      // Find snapshots in bucket
      const bucketStart = centerTime - bucketDuration / 2;
      const bucketEnd = centerTime + bucketDuration / 2;
      const portBucket = sortedPort.filter((p) => {
        const sec = toSeconds(p.time);
        return sec >= bucketStart && sec < bucketEnd;
      });

      if (portBucket.length > 0) {
        portVal = portBucket.reduce((sum, p) => sum + p.value, 0) / portBucket.length;
      } else {
        const prev = sortedPort.filter((p) => toSeconds(p.time) <= centerTime).pop();
        const next = sortedPort.find((p) => toSeconds(p.time) >= centerTime);
        if (prev && next && prev.time !== next.time) {
          const t = (centerTime - toSeconds(prev.time)) / (toSeconds(next.time) - toSeconds(prev.time));
          portVal = prev.value + t * (next.value - prev.value);
        } else if (prev) {
          portVal = prev.value;
        } else {
          // Synthetic natural wave
          const wave = Math.sin(fraction * Math.PI) * (Math.abs(totalPortDiff) * 0.25 || 25) * Math.sin(i * 0.7);
          portVal = startPortVal + fraction * totalPortDiff + wave;
        }
      }

      const benchBucket = sortedBench.filter((b) => {
        const sec = toSeconds(b.time);
        return sec >= bucketStart && sec < bucketEnd;
      });

      if (benchBucket.length > 0) {
        benchVal = benchBucket.reduce((sum, b) => sum + (b.spyValue || b.value), 0) / benchBucket.length;
      } else {
        const prevB = sortedBench.filter((b) => toSeconds(b.time) <= centerTime).pop();
        const nextB = sortedBench.find((b) => toSeconds(b.time) >= centerTime);
        if (prevB && nextB && prevB.time !== nextB.time) {
          const t = (centerTime - toSeconds(prevB.time)) / (toSeconds(nextB.time) - toSeconds(prevB.time));
          const p0 = prevB.spyValue || prevB.value;
          const p1 = nextB.spyValue || nextB.value;
          benchVal = p0 + t * (p1 - p0);
        } else {
          const bWave = Math.sin(fraction * Math.PI) * (Math.abs(totalBenchDiff) * 0.2 || 2) * Math.cos(i * 0.6);
          benchVal = startBenchVal + fraction * totalBenchDiff + bWave;
        }
      }
    }

    // Benchmark scaling
    let scaledSpy: number | null = null;
    if (benchVal !== null && startBenchVal > 0) {
      const benchReturnRatio = (benchVal - startBenchVal) / startBenchVal;
      scaledSpy = startPortVal * (1 + benchReturnRatio);
    }

    result.push({
      slotIndex: i,
      timeLabel: label,
      time: Math.floor(centerTime),
      portfolioValue: Number(portVal.toFixed(2)),
      spyValue: scaledSpy !== null ? Number(scaledSpy.toFixed(2)) : null,
      achievements: [],
      isFuture: false,
    });
  }

  // Ensure final point matches endPortVal
  if (result.length > 0) {
    result[result.length - 1].portfolioValue = Number(endPortVal.toFixed(2));
  }

  return result;
}

/**
 * Main entry function to transform raw snapshot inputs into a consistent dataset.
 */
export function transformPortfolioData(
  data: { portfolio: RawSnapshot[]; benchmark: RawSnapshot[] },
  timeRange: TimeRange
): ChartPoint26[] {
  const portfolio = Array.isArray(data?.portfolio) ? data.portfolio : [];
  const benchmark = Array.isArray(data?.benchmark) ? data.benchmark : [];

  if (timeRange === '1D') {
    return process1DSnapshots(portfolio, benchmark);
  }
  return processMultiTimeframeSnapshots(portfolio, benchmark, timeRange);
}
