/**
 * Portfolio Data Transformation Utility
 * 
 * Prepares raw Firestore snapshot arrays into fixed 26-point datasets for 1D, 1W, 1M, and 1Y charts.
 * Robinhood / TradingView aesthetic requirements.
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

export type TimeRange = '1D' | '1W' | '1M' | '1Y';

/**
 * Generates 26 fixed 1D time slots covering market hours:
 * 6:30 AM to 1:00 PM PST / 9:30 AM to 4:00 PM EST (390 total minutes)
 * 26 slots = 25 intervals of 15.6 minutes (936 seconds).
 */
/**
 * Generates 14 fixed 30-minute milestones covering market hours:
 * 9:30 AM to 4:00 PM EST (14 slots at 30-minute intervals: 9:30, 10:00, ..., 16:00 EST)
 */
export function generate1DSlots(referenceDate: Date = new Date()): Date[] {
  const estStr = referenceDate.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const localDate = new Date(estStr);
  
  const diffMs = referenceDate.getTime() - localDate.getTime();
  
  const target930 = new Date(localDate);
  target930.setHours(9, 30, 0, 0);
  
  const marketOpenMs = target930.getTime() + diffMs;
  const slotIntervalMs = 30 * 60 * 1000; // 30 minutes (1800 seconds) per milestone

  const slots: Date[] = [];
  for (let i = 0; i < 14; i++) {
    slots.push(new Date(marketOpenMs + i * slotIntervalMs));
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
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Normalizes input timestamp to Unix seconds.
 */
function toSeconds(ts: number): number {
  return ts > 1e11 ? Math.floor(ts / 1000) : Math.floor(ts);
}

/**
 * Transforms raw portfolio & benchmark snapshots for the 1D view into 14 fixed 30-min milestone slots (9:30 AM to 4:00 PM EST).
 * Past completed 30-min milestones display aggregated 30-min averages,
 * the active 30-min window displays 1-min live updates up to `now`,
 * and future milestone slots beyond `now` remain null to avoid glitching.
 */
export function process1DSnapshots(
  portfolioRaw: RawSnapshot[],
  benchmarkRaw: RawSnapshot[],
  now: Date = new Date()
): ChartPoint26[] {
  const slots = generate1DSlots(now);
  const marketOpenSec = Math.floor(slots[0].getTime() / 1000);
  const nowSec = Math.floor(now.getTime() / 1000);
  
  const sortedPort = [...portfolioRaw].sort((a, b) => toSeconds(a.time) - toSeconds(b.time));
  const sortedBench = [...benchmarkRaw].sort((a, b) => toSeconds(a.time) - toSeconds(b.time));

  const startPortVal = sortedPort[0]?.value ?? 10000;
  const startBenchVal = sortedBench[0]?.value ?? 510;

  // Map snapshots into 30-minute slots (0..13)
  const slotPortMap = new Map<number, RawSnapshot[]>();
  sortedPort.forEach((snapshot) => {
    const snapSec = toSeconds(snapshot.time);
    const calculatedIdx = Math.floor((snapSec - marketOpenSec) / 1800);
    const clampedIdx = Math.max(0, Math.min(13, calculatedIdx));
    if (!slotPortMap.has(clampedIdx)) {
      slotPortMap.set(clampedIdx, []);
    }
    slotPortMap.get(clampedIdx)!.push(snapshot);
  });

  const slotBenchMap = new Map<number, RawSnapshot[]>();
  sortedBench.forEach((snapshot) => {
    const snapSec = toSeconds(snapshot.time);
    const calculatedIdx = Math.floor((snapSec - marketOpenSec) / 1800);
    const clampedIdx = Math.max(0, Math.min(13, calculatedIdx));
    if (!slotBenchMap.has(clampedIdx)) {
      slotBenchMap.set(clampedIdx, []);
    }
    slotBenchMap.get(clampedIdx)!.push(snapshot);
  });

  let lastKnownPort: number | null = sortedPort[0]?.value ?? 10000;
  let lastKnownBench: number | null = sortedBench[0]?.value ?? 510;

  const result: ChartPoint26[] = [];

  for (let i = 0; i < 14; i++) {
    const slotDate = slots[i];
    const slotSec = Math.floor(slotDate.getTime() / 1000);
    const label = formatSlotLabel(slotDate, '1D');

    // Future slots (beyond current time) set to null to stop line cleanly at current time
    const isFuture = slotSec > nowSec + 120;

    if (isFuture) {
      result.push({
        slotIndex: i,
        timeLabel: label,
        time: slotSec,
        portfolioValue: null,
        spyValue: null,
        achievements: [],
        isFuture: true,
      });
      continue;
    }

    const portBucket = slotPortMap.get(i);
    const benchBucket = slotBenchMap.get(i);

    if (portBucket && portBucket.length > 0) {
      // Calculate average value over the 30-min block
      const sum = portBucket.reduce((acc, curr) => acc + curr.value, 0);
      lastKnownPort = sum / portBucket.length;
    } else {
      const prior = sortedPort.filter((p) => toSeconds(p.time) <= slotSec).pop();
      if (prior) lastKnownPort = prior.value;
    }

    if (benchBucket && benchBucket.length > 0) {
      const sum = benchBucket.reduce((acc, curr) => acc + (curr.spyValue || curr.value), 0);
      lastKnownBench = sum / benchBucket.length;
    } else {
      const prior = sortedBench.filter((b) => toSeconds(b.time) <= slotSec).pop();
      if (prior) lastKnownBench = prior.spyValue || prior.value;
    }

    const prevSlotSec = i > 0 ? Math.floor(slots[i - 1].getTime() / 1000) : 0;
    const slotAchievements = sortedPort
      .filter((p) => {
        const sec = toSeconds(p.time);
        return sec > prevSlotSec && sec <= slotSec && p.achievements?.length;
      })
      .flatMap((p) => p.achievements || []);

    let scaledSpy: number | null = null;
    if (lastKnownBench !== null) {
      scaledSpy = startBenchVal > 0
        ? (startPortVal > 0 ? startPortVal * (lastKnownBench / startBenchVal) : lastKnownBench)
        : lastKnownBench;
    }

    result.push({
      slotIndex: i,
      timeLabel: label,
      time: slotSec,
      portfolioValue: lastKnownPort !== null ? Number(lastKnownPort.toFixed(2)) : null,
      spyValue: scaledSpy !== null ? Number(scaledSpy.toFixed(2)) : null,
      achievements: slotAchievements,
      isFuture: false,
    });
  }

  return result;
}

/**
 * Group raw snapshots into 26 aggregated bucket intervals for 1W, 1M, 1Y views.
 * Empty buckets forward-fill from the prior bucket's close value so historical views have no null holes.
 */
export function processMultiTimeframeSnapshots(
  portfolioRaw: RawSnapshot[],
  benchmarkRaw: RawSnapshot[],
  timeRange: TimeRange
): ChartPoint26[] {
  const sortedPort = [...portfolioRaw].sort((a, b) => toSeconds(a.time) - toSeconds(b.time));
  const sortedBench = [...benchmarkRaw].sort((a, b) => toSeconds(a.time) - toSeconds(b.time));

  if (sortedPort.length === 0) {
    const dummyDate = new Date();
    return Array.from({ length: 26 }, (_, i) => ({
      slotIndex: i,
      timeLabel: formatSlotLabel(dummyDate, timeRange),
      time: Math.floor(dummyDate.getTime() / 1000),
      portfolioValue: null,
      spyValue: null,
      achievements: [],
      isFuture: false,
    }));
  }

  const minTime = toSeconds(sortedPort[0].time);
  const maxTime = toSeconds(sortedPort[sortedPort.length - 1].time);
  const timeSpan = Math.max(maxTime - minTime, 1);
  const bucketDuration = timeSpan / 26;

  const startPortVal = sortedPort[0]?.value ?? 0;
  const startBenchVal = sortedBench[0]?.value ?? 0;

  let lastKnownBucketPort = startPortVal;
  let lastKnownBucketBench = startBenchVal;

  const result: ChartPoint26[] = [];

  for (let i = 0; i < 26; i++) {
    const bucketStart = minTime + i * bucketDuration;
    const bucketEnd = bucketStart + bucketDuration;
    const centerTime = bucketStart + bucketDuration / 2;
    const slotDate = new Date(centerTime * 1000);
    const label = formatSlotLabel(slotDate, timeRange);

    const portBucket = sortedPort.filter((p) => {
      const sec = toSeconds(p.time);
      return sec >= bucketStart && (i === 25 ? sec <= bucketEnd : sec < bucketEnd);
    });

    const benchBucket = sortedBench.filter((b) => {
      const sec = toSeconds(b.time);
      return sec >= bucketStart && (i === 25 ? sec <= bucketEnd : sec < bucketEnd);
    });

    let portVal: number;
    if (portBucket.length > 0) {
      // Calculate bucket average / close value and record as last known
      const sum = portBucket.reduce((acc, curr) => acc + curr.value, 0);
      portVal = sum / portBucket.length;
      lastKnownBucketPort = portBucket[portBucket.length - 1].value;
    } else {
      // Empty bucket fallback: forward-fill from prior bucket's close value
      const prior = sortedPort.filter((p) => toSeconds(p.time) < bucketStart).pop();
      portVal = prior ? prior.value : lastKnownBucketPort;
      lastKnownBucketPort = portVal;
    }

    let benchVal: number;
    if (benchBucket.length > 0) {
      const sum = benchBucket.reduce((acc, curr) => acc + curr.value, 0);
      benchVal = sum / benchBucket.length;
      lastKnownBucketBench = benchBucket[benchBucket.length - 1].value;
    } else {
      const prior = sortedBench.filter((b) => toSeconds(b.time) < bucketStart).pop();
      benchVal = prior ? prior.value : lastKnownBucketBench;
      lastKnownBucketBench = benchVal;
    }

    const bucketAchievements = portBucket.flatMap((p) => p.achievements || []);

    let scaledSpy: number | null = null;
    if (benchVal !== null) {
      scaledSpy = startBenchVal > 0
        ? (startPortVal > 0 ? startPortVal * (benchVal / startBenchVal) : benchVal)
        : benchVal;
    }

    result.push({
      slotIndex: i,
      timeLabel: label,
      time: Math.floor(centerTime),
      portfolioValue: Math.round(portVal * 100) / 100,
      spyValue: scaledSpy !== null ? Math.round(scaledSpy * 100) / 100 : null,
      achievements: bucketAchievements,
      isFuture: false,
    });
  }

  return result;
}

/**
 * Main entry function to transform raw snapshot inputs into a consistent 26-point dataset.
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
