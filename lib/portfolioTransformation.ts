/**
 * Portfolio Data Transformation Utility
 * 
 * Prepares raw Firestore snapshot arrays into fixed 26-point datasets for 1D, 1W, 1M, and 1Y charts.
 * Robinhood / TradingView aesthetic requirements.
 */

export interface RawSnapshot {
  time: number; // Unix timestamp in seconds or milliseconds
  value: number;
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
export function generate1DSlots(referenceDate: Date = new Date()): Date[] {
  const estStr = referenceDate.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const localDate = new Date(estStr);
  
  const diffMs = referenceDate.getTime() - localDate.getTime();
  
  const target930 = new Date(localDate);
  target930.setHours(9, 30, 0, 0);
  
  const marketOpenMs = target930.getTime() + diffMs;
  const slotIntervalMs = 936 * 1000; // 936 seconds per slot

  const slots: Date[] = [];
  for (let i = 0; i < 26; i++) {
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
 * Transforms raw portfolio & benchmark snapshots for the 1D view into 26 fixed slots.
 * Uses exact nearest slot index math:
 * slotIndex = Math.round((snapshotTime - marketOpenTime) / 936 seconds)
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

  const startPortVal = sortedPort[0]?.value ?? 0;
  const startBenchVal = sortedBench[0]?.value ?? 0;

  // Map snapshots to 0..25 slot indices using exact formula
  const slotPortMap = new Map<number, RawSnapshot>();
  sortedPort.forEach((snapshot) => {
    const snapSec = toSeconds(snapshot.time);
    const calculatedIdx = Math.round((snapSec - marketOpenSec) / 936);
    const clampedIdx = Math.max(0, Math.min(25, calculatedIdx));
    // Overwrite or update with latest snapshot mapping to this slot
    slotPortMap.set(clampedIdx, snapshot);
  });

  const slotBenchMap = new Map<number, RawSnapshot>();
  sortedBench.forEach((snapshot) => {
    const snapSec = toSeconds(snapshot.time);
    const calculatedIdx = Math.round((snapSec - marketOpenSec) / 936);
    const clampedIdx = Math.max(0, Math.min(25, calculatedIdx));
    slotBenchMap.set(clampedIdx, snapshot);
  });

  let lastKnownPort: number | null = sortedPort[0]?.value ?? null;
  let lastKnownBench: number | null = sortedBench[0]?.value ?? null;

  const result: ChartPoint26[] = [];

  for (let i = 0; i < 26; i++) {
    const slotDate = slots[i];
    const slotSec = Math.floor(slotDate.getTime() / 1000);
    const label = formatSlotLabel(slotDate, '1D');

    // Future slots (unreached market hours today) set to null
    const isFuture = slotSec > nowSec + 300;

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

    // Direct slot match or forward-fill from prior slot
    const exactPortMatch = slotPortMap.get(i);
    const exactBenchMatch = slotBenchMap.get(i);

    if (exactPortMatch) {
      lastKnownPort = exactPortMatch.value;
    } else {
      // Check if any raw snapshot occurred up to slotSec
      const portMatch = sortedPort.filter((p) => toSeconds(p.time) <= slotSec).pop();
      if (portMatch) lastKnownPort = portMatch.value;
    }

    if (exactBenchMatch) {
      lastKnownBench = exactBenchMatch.value;
    } else {
      const benchMatch = sortedBench.filter((b) => toSeconds(b.time) <= slotSec).pop();
      if (benchMatch) lastKnownBench = benchMatch.value;
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
      portfolioValue: lastKnownPort,
      spyValue: scaledSpy,
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
