/**
 * Optimized Staggered Batch Scheduling & Rate Limit Protection System
 * Enforces hard rate limit of <= 60 requests per rolling 60-second window
 * with balanced group partitioning, single-flight coalescing, and priority scheduling.
 */

export interface RateLimiterOptions {
  maxRequestsPerWindow: number; // e.g., 50 (leaves safety buffer under 60)
  windowMs: number;            // e.g., 60,000 ms (1 minute)
  minDelayBetweenRequestsMs: number; // e.g., 150 ms minimum spacing
}

export class SlidingWindowRateLimiter {
  private timestamps: number[] = [];
  private maxRequests: number;
  private windowMs: number;
  private minDelayMs: number;
  private lastRequestTime = 0;
  private lockPromise: Promise<void> = Promise.resolve();

  constructor(options: Partial<RateLimiterOptions> = {}) {
    this.maxRequests = options.maxRequestsPerWindow ?? 50; // default 50 req/min (hard limit 60)
    this.windowMs = options.windowMs ?? 60000;
    this.minDelayMs = options.minDelayBetweenRequestsMs ?? 150;
  }

  /**
   * Acquire permission to execute 1 request, waiting if rate limit is reached.
   */
  async acquire(): Promise<void> {
    const nextLock = this.lockPromise.then(async () => {
      while (true) {
        const now = Date.now();
        // 1. Prune timestamps outside rolling window
        const cutoff = now - this.windowMs;
        while (this.timestamps.length > 0 && this.timestamps[0] <= cutoff) {
          this.timestamps.shift();
        }

        // 2. Check if we reached rolling window capacity
        if (this.timestamps.length >= this.maxRequests) {
          const oldest = this.timestamps[0];
          const waitTime = Math.max(10, oldest + this.windowMs - now + 50);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        // 3. Enforce minimum delay between consecutive calls
        const timeSinceLast = now - this.lastRequestTime;
        if (timeSinceLast < this.minDelayMs) {
          await new Promise((resolve) => setTimeout(resolve, this.minDelayMs - timeSinceLast));
          continue;
        }

        // 4. Record execution timestamp
        const execTime = Date.now();
        this.timestamps.push(execTime);
        this.lastRequestTime = execTime;
        break;
      }
    });

    this.lockPromise = nextLock.catch(() => {});
    return nextLock;
  }

  /**
   * Get current metrics for telemetry/diagnostics
   */
  getMetrics() {
    const now = Date.now();
    const activeInWindow = this.timestamps.filter((t) => now - t < this.windowMs).length;
    return {
      activeInWindow,
      remainingCapacity: Math.max(0, this.maxRequests - activeInWindow),
      maxCapacity: this.maxRequests,
      windowMs: this.windowMs
    };
  }
}

export interface StaggeredBatchOptions<T> {
  items: T[];
  groupCount?: number;             // Number of staggered groups
  staggerIntervalMs?: number;      // Spacing between group executions
  onBatchExecute: (group: T[], groupIndex: number, isPriority: boolean) => Promise<void>;
  priorityItems?: T[];             // High-priority items
  priorityIntervalMs?: number;     // Decoupled cadence for priority items (e.g. 30s)
}

/**
 * Staggered Batch Scheduler
 * Divides a large item universe into balanced partitions and rotates them with calculated delays,
 * with decoupled priority cadences to prevent core asset multiplier bottlenecks.
 */
export class StaggeredBatchScheduler<T> {
  private items: T[];
  private groupCount: number;
  private staggerIntervalMs: number;
  private onBatchExecute: (group: T[], groupIndex: number, isPriority: boolean) => Promise<void>;
  private priorityItems: T[];
  private priorityIntervalMs: number;
  private currentGroupIndex = 0;
  private rotationTimer: NodeJS.Timeout | null = null;
  private priorityTimer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(options: StaggeredBatchOptions<T>) {
    this.items = [...options.items];
    this.groupCount = options.groupCount ?? 6;
    this.staggerIntervalMs = options.staggerIntervalMs ?? Math.floor(60000 / this.groupCount);
    this.onBatchExecute = options.onBatchExecute;
    this.priorityItems = options.priorityItems || [];
    this.priorityIntervalMs = options.priorityIntervalMs ?? 30000; // 30s cadence (2x/min)
  }

  /**
   * Partitions the secondary universe into balanced groups (excluding priority items to avoid duplicate calls)
   */
  getPartitions(): T[][] {
    const prioritySet = new Set(this.priorityItems);
    const secondaryItems = this.items.filter((item) => !prioritySet.has(item));
    if (secondaryItems.length === 0) return [this.items];

    const count = Math.min(this.groupCount, secondaryItems.length);
    const partitions: T[][] = Array.from({ length: count }, () => []);
    secondaryItems.forEach((item, index) => {
      partitions[index % count].push(item);
    });
    return partitions.filter((p) => p.length > 0);
  }

  /**
   * Updates target universe items dynamically
   */
  setItems(newItems: T[], newPriority?: T[]) {
    this.items = [...newItems];
    if (newPriority) {
      this.priorityItems = [...newPriority];
    }
  }

  /**
   * Executes the next staggered partition of secondary items
   */
  async executeNextStep(): Promise<void> {
    const partitions = this.getPartitions();
    if (partitions.length === 0) return;

    this.currentGroupIndex = this.currentGroupIndex % partitions.length;
    const currentGroup = partitions[this.currentGroupIndex];
    const groupIdx = this.currentGroupIndex;
    this.currentGroupIndex++;

    try {
      await this.onBatchExecute(currentGroup, groupIdx, false);
    } catch (err) {
      console.warn(`[StaggeredBatchScheduler] Group ${groupIdx} execution error:`, err);
    }
  }

  /**
   * Executes priority items on their dedicated cadence
   */
  async executePriorityStep(): Promise<void> {
    if (this.priorityItems.length === 0) return;
    try {
      await this.onBatchExecute(this.priorityItems, -1, true);
    } catch (err) {
      console.warn('[StaggeredBatchScheduler] Priority batch execution error:', err);
    }
  }

  /**
   * Starts recurring staggered scheduling loops (decoupled priority and partition cycles)
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Trigger immediate first priority & rotation step
    this.executePriorityStep();
    this.executeNextStep();

    // Secondary partition rotation timer (e.g., every 10s for 6 groups = 60s full sweep)
    this.rotationTimer = setInterval(() => {
      if (this.isRunning) {
        this.executeNextStep();
      }
    }, this.staggerIntervalMs);

    // Dedicated priority cadence timer (e.g., every 30s = 2x/min)
    this.priorityTimer = setInterval(() => {
      if (this.isRunning) {
        this.executePriorityStep();
      }
    }, this.priorityIntervalMs);
  }

  /**
   * Stops all scheduler timers
   */
  stop(): void {
    this.isRunning = false;
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
    if (this.priorityTimer) {
      clearInterval(this.priorityTimer);
      this.priorityTimer = null;
    }
  }
}
