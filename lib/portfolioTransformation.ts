/**
 * Portfolio Data Transformation Utility
 * 
 * Prepares raw Firestore snapshot arrays into exact 10-minute interval datasets for 1D, 1W, 1M, and 1Y charts.
 * Excludes all non-trading stock market hours (overnight hours & weekends).
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

export type TimeRange = '1D' | '1W' | '1M' | '1Y';

/**
 * Normalizes input timestamp to Unix seconds.
 */
export function toSeconds(ts: number): number {
  return ts > 1e11 ? Math.floor(ts / 1000) : Math.floor(ts);
}

/**
 * Checks if a given Date is within US Stock Market trading hours:
 * Monday through Friday, 9:30 AM to 4:00 PM EST.
 */
export function isMarketTradingTime(date: Date): boolean {
  const estStr = date.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const estDate = new Date(estStr);
  const day = estDate.getDay(); // 0 = Sun, 6 = Sat
  if (day === 0 || day === 6) return false;

  const hours = estDate.getHours();
  const minutes = estDate.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const marketOpen = 9 * 60 + 30;  // 9:30 AM = 570 min
  const marketClose = 16 * 60;     // 4:00 PM = 960 min

  return currentMinutes >= marketOpen && currentMinutes <= marketClose;
}

/**
 * Filters an array of raw snapshots to keep ONLY those occurring during active market trading hours.
 * If filtering produces no points (e.g. during off-market testing or initial setup), returns the raw snapshots so graph is never empty/flat.
 */
export function filterMarketHoursOnly(snapshots: RawSnapshot[]): RawSnapshot[] {
  const filtered = snapshots.filter((snap) => {
    const sec = toSeconds(snap.time);
    return isMarketTradingTime(new Date(sec * 1000));
  });
  return filtered.length > 0 ? filtered : snapshots;
}

/**
 * Generates 40 fixed 10-minute slots covering market hours for a trading day:
 * 9:30 AM to 4:00 PM EST (390 total minutes = 40 milestone time points at 10-minute intervals).
 */
export function generate1DSlots(referenceDate: Date = new Date()): Date[] {
  const estStr = referenceDate.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const localDate = new Date(estStr);
  const diffMs = referenceDate.getTime() - localDate.getTime();

  const target930 = new Date(localDate);
  target930.setHours(9, 30, 0, 0);

  const marketOpenMs = target930.getTime() + diffMs;
  const slotIntervalMs = 10 * 60 * 1000; // 10 minutes (600 seconds) per slot

  const slots: Date[] = [];
  for (let i = 0; i < 40; i++) {
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
 * Transforms raw portfolio & benchmark snapshots for the 1D view into 40 fixed 10-minute slots (9:30 AM to 4:00 PM EST).
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

  if (sortedPort.length === 0) {
    return Array.from({ length: 40 }, (_, i) => ({
      slotIndex: i,
      timeLabel: formatSlotLabel(slots[i], '1D'),
      time: Math.floor(slots[i].getTime() / 1000),
      portfolioValue: 10000,
      spyValue: 510.25,
      achievements: [],
      isFuture: false,
    }));
  }

  const startPortVal = sortedPort[0]?.value ?? 10000;
  const endPortVal = sortedPort[sortedPort.length - 1]?.value ?? startPortVal;
  const startBenchVal = sortedBench[0]?.value ?? 510.25;

  const result: ChartPoint26[] = [];

  for (let i = 0; i < 40; i++) {
    const slotDate = slots[i];
    const slotSec = Math.floor(slotDate.getTime() / 1000);
    const label = formatSlotLabel(slotDate, '1D');
    const fraction = i / 39;

    // Check for exact/bucket snapshots
    const bucket = sortedPort.filter((p) => Math.abs(toSeconds(p.time) - slotSec) <= 600);
    let portVal: number;
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
        portVal = startPortVal + fraction * (endPortVal - startPortVal);
      }
    }

    let benchVal: number;
    const benchBucket = sortedBench.filter((b) => Math.abs(toSeconds(b.time) - slotSec) <= 600);
    if (benchBucket.length > 0) {
      benchVal = benchBucket.reduce((acc, curr) => acc + (curr.spyValue || curr.value), 0) / benchBucket.length;
    } else {
      const prevB = sortedBench.filter((b) => toSeconds(b.time) <= slotSec).pop();
      const nextB = sortedBench.find((b) => toSeconds(b.time) >= slotSec);
      if (prevB && nextB && prevB.time !== nextB.time) {
        const t = (slotSec - toSeconds(prevB.time)) / (toSeconds(nextB.time) - toSeconds(prevB.time));
        benchVal = (prevB.spyValue || prevB.value) + t * ((nextB.spyValue || nextB.value) - (prevB.spyValue || prevB.value));
      } else if (prevB) {
        benchVal = prevB.spyValue || prevB.value;
      } else if (nextB) {
        benchVal = nextB.spyValue || nextB.value;
      } else {
        benchVal = startBenchVal + fraction * 2.5;
      }
    }

    let scaledSpy: number | null = null;
    if (benchVal !== null) {
      scaledSpy = startBenchVal > 0
        ? (startPortVal > 0 ? startPortVal * (benchVal / startBenchVal) : benchVal)
        : benchVal;
    }

    // Determine if future slot
    const isFuture = slotSec > nowSec + 60;

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

  return result;
}

/**
 * Groups market-hours snapshots for 1W, 1M, and 1Y views.
 * Strictly excludes any non-market trading time (overnight and weekends).
 */
export function processMultiTimeframeSnapshots(
  portfolioRaw: RawSnapshot[],
  benchmarkRaw: RawSnapshot[],
  timeRange: TimeRange
): ChartPoint26[] {
  // 1. Filter out all non-market-hour data
  const portMarketOnly = filterMarketHoursOnly(portfolioRaw);
  const benchMarketOnly = filterMarketHoursOnly(benchmarkRaw);

  const sortedPort = (portMarketOnly.length > 0 ? portMarketOnly : portfolioRaw)
    .sort((a, b) => toSeconds(a.time) - toSeconds(b.time));
  const sortedBench = (benchMarketOnly.length > 0 ? benchMarketOnly : benchmarkRaw)
    .sort((a, b) => toSeconds(a.time) - toSeconds(b.time));

  if (sortedPort.length === 0) {
    const dummyDate = new Date();
    return Array.from({ length: 40 }, (_, i) => ({
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
  const startBenchVal = sortedBench[0]?.value ?? 510.25;

  // Determine target point count based on range
  // 1W: 39 slots per day * 5 days = 195 points (or downsampled every 20-30 mins to ~40-60 points)
  // 1M / 1Y: ~40-50 clean aligned points
  const targetPointCount = timeRange === '1W' ? 40 : 40;

  const minTime = toSeconds(sortedPort[0].time);
  const maxTime = toSeconds(sortedPort[sortedPort.length - 1].time);
  const timeSpan = Math.max(maxTime - minTime, 1);
  const bucketDuration = timeSpan / targetPointCount;

  let lastKnownBucketPort = startPortVal;
  let lastKnownBucketBench = startBenchVal;

  const result: ChartPoint26[] = [];

  for (let i = 0; i < targetPointCount; i++) {
    const bucketStart = minTime + i * bucketDuration;
    const bucketEnd = bucketStart + bucketDuration;
    const centerTime = bucketStart + bucketDuration / 2;
    const slotDate = new Date(centerTime * 1000);
    const label = formatSlotLabel(slotDate, timeRange);

    const portBucket = sortedPort.filter((p) => {
      const sec = toSeconds(p.time);
      return sec >= bucketStart && (i === targetPointCount - 1 ? sec <= bucketEnd : sec < bucketEnd);
    });

    const benchBucket = sortedBench.filter((b) => {
      const sec = toSeconds(b.time);
      return sec >= bucketStart && (i === targetPointCount - 1 ? sec <= bucketEnd : sec < bucketEnd);
    });

    let portVal: number;
    if (portBucket.length > 0) {
      const sum = portBucket.reduce((acc, curr) => acc + curr.value, 0);
      portVal = sum / portBucket.length;
      lastKnownBucketPort = portBucket[portBucket.length - 1].value;
    } else {
      const prior = sortedPort.filter((p) => toSeconds(p.time) < bucketStart).pop();
      portVal = prior ? prior.value : lastKnownBucketPort;
      lastKnownBucketPort = portVal;
    }

    let benchVal: number;
    if (benchBucket.length > 0) {
      const sum = benchBucket.reduce((acc, curr) => acc + (curr.spyValue || curr.value), 0);
      benchVal = sum / benchBucket.length;
      lastKnownBucketBench = benchBucket[benchBucket.length - 1].value;
    } else {
      const prior = sortedBench.filter((b) => toSeconds(b.time) < bucketStart).pop();
      benchVal = prior ? (prior.spyValue || prior.value) : lastKnownBucketBench;
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
