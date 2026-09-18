'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, PropsWithChildren } from 'react';
import { fetchFinnhubQuote } from '@/app/actions/trading';
import { KNOWN_STOCKS_DATA, getStockLogo, getStockMetadata } from '@/lib/stockUtils';

import { StaggeredBatchScheduler } from '@/lib/rateLimitedBatchScheduler';

export interface StockQuote {
  ticker: string;
  name: string;
  category: string;
  price: number;
  change: number;
  logo: string;
  loading?: boolean;
}

export const BASE_STOCKS: StockQuote[] = Object.values(KNOWN_STOCKS_DATA).map(meta => ({
  ticker: meta.ticker,
  name: meta.name,
  category: meta.category,
  price: meta.basePrice,
  change: meta.baseChange,
  logo: getStockLogo(meta.ticker, meta.domain)
}));

interface StockMarketContextValue {
  stocks: StockQuote[];
  getStock: (ticker: string) => StockQuote | undefined;
  lastUpdated: number;
}

const StockMarketContext = createContext<StockMarketContextValue>({
  stocks: BASE_STOCKS,
  getStock: (ticker: string) => BASE_STOCKS.find(s => s.ticker === ticker.toUpperCase()),
  lastUpdated: Date.now(),
});

const CACHE_KEY = 'trillium_global_stock_market_v2';
const TIMESTAMP_KEY = 'trillium_global_stock_market_time_v2';
const CLIENT_CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour maximum cache age

// High priority items refreshed on fast-track
const PRIORITY_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'SPY', 'QQQ'];

/**
 * Formats a timestamp into US Eastern Trading Day string (America/New_York)
 * to prevent timezone drift across international client devices.
 */
function getMarketDateString(ts: number): string {
  try {
    return new Date(ts).toLocaleDateString('en-US', { timeZone: 'America/New_York' });
  } catch {
    return new Date(ts).toISOString().split('T')[0];
  }
}

export function StockMarketProvider({ children }: PropsWithChildren) {
  const [stocks, setStocks] = useState<StockQuote[]>(BASE_STOCKS);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Restore client cached quotes safely after hydration to avoid React error #418
  useEffect(() => {
    try {
      const lastTimeStr = localStorage.getItem(TIMESTAMP_KEY) || sessionStorage.getItem(TIMESTAMP_KEY);
      const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;
      const now = Date.now();

      const isExpiredByTime = !lastTime || (now - lastTime > CLIENT_CACHE_MAX_AGE_MS);
      const isExpiredByDate = lastTime > 0 && (getMarketDateString(lastTime) !== getMarketDateString(now));

      if (isExpiredByTime || isExpiredByDate) {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(TIMESTAMP_KEY);
        sessionStorage.removeItem(CACHE_KEY);
        sessionStorage.removeItem(TIMESTAMP_KEY);
        return;
      }

      const cached = localStorage.getItem(CACHE_KEY) || sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: StockQuote[] = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStocks((prev) =>
            prev.map((base) => {
              const item = parsed.find((p: any) => p.ticker === base.ticker);
              if (item && item.price > 0 && item.price > base.price * 0.2 && item.price < base.price * 5) {
                return {
                  ...base,
                  price: item.price,
                  change: item.change ?? base.change,
                  logo: base.logo || item.logo,
                  loading: false,
                };
              }
              return base;
            })
          );
        }
      }
    } catch (e) {
      console.error('Error loading stock cache:', e);
    }
  }, []);

  // Function to persist stock state to cache
  const saveToCache = (updatedStocks: StockQuote[], isNetworkFetch = false) => {
    if (typeof window !== 'undefined') {
      try {
        const now = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify(updatedStocks));
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(updatedStocks));
        if (isNetworkFetch) {
          localStorage.setItem(TIMESTAMP_KEY, now.toString());
          sessionStorage.setItem(TIMESTAMP_KEY, now.toString());
        }
      } catch (e) {
        console.error('Failed to save stock cache', e);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initialize Staggered Batch Scheduler with Decoupled Priority Cadence:
    // 1. High-priority core assets run on a dedicated 30s interval (6 tickers * 2x/min = 12 req/min)
    // 2. Secondary universe (~38-44 tickers) is partitioned into 6 balanced groups of ~6-7 tickers
    // 3. Spaced out by 10s per group (6 groups * ~6.5 tickers = 39 req/min)
    // Total API consumption = 12 + 38 = 50 req/min (strictly within 50 safe cap / 60 hard limit)
    const allTickers = BASE_STOCKS.map((s) => s.ticker);

    const scheduler = new StaggeredBatchScheduler<string>({
      items: allTickers,
      groupCount: 6,
      staggerIntervalMs: 10000,
      priorityItems: PRIORITY_TICKERS,
      priorityIntervalMs: 30000,
      onBatchExecute: async (batchTickers, groupIndex, isPriority) => {
        if (!mounted || typeof window === 'undefined' || batchTickers.length === 0) return;
        try {
          const { getMarketQuotes } = await import('@/app/actions/trading');
          const quotes = await getMarketQuotes(batchTickers);

          if (mounted && quotes && quotes.length > 0) {
            setStocks((prev) => {
              const updated = prev.map((stock) => {
                const quote = quotes.find((q) => q.ticker === stock.ticker);
                if (quote && quote.price > 0) {
                  return {
                    ...stock,
                    price: quote.price,
                    change: quote.change,
                    loading: false
                  };
                }
                return stock;
              });
              saveToCache(updated, true);
              return updated;
            });
            setLastUpdated(Date.now());
          }
        } catch (err) {
          console.warn('[StockMarketContext] Staggered batch update failed:', err);
        }
      }
    });

    scheduler.start();

    // Local micro-fluctuation loop to keep charts and market tickers alive smoothly between batch fetches
    let tickCounter = 0;
    const tickGlobalMarket = () => {
      if (!mounted) return;

      const batchSize = 4;
      const startIndex = (tickCounter * batchSize) % BASE_STOCKS.length;
      tickCounter++;
      const targetStocks = BASE_STOCKS.slice(startIndex, startIndex + batchSize);

      if (targetStocks.length === 0) return;

      setStocks((prev) => {
        let hasChange = false;
        const updated = prev.map((stock) => {
          const isTarget = targetStocks.some((ts) => ts.ticker === stock.ticker);
          if (isTarget) {
            // Tiny realistic micro-fluctuation (+/- 0.05% to 0.15%)
            const deltaPercent = Math.random() * 0.3 - 0.15;
            const newPrice = Number((stock.price * (1 + deltaPercent / 100)).toFixed(2));
            const newChange = Number((stock.change + deltaPercent * 0.1).toFixed(2));
            hasChange = true;
            return {
              ...stock,
              price: newPrice,
              change: newChange,
              loading: false
            };
          }
          return stock;
        });

        return updated;
      });
    };

    // Micro-walk interval every 3 seconds (zero network requests, zero synchronous disk writes)
    const tickInterval = setInterval(tickGlobalMarket, 3000);

    return () => {
      mounted = false;
      scheduler.stop();
      clearInterval(tickInterval);
    };
  }, []);

  const getStock = useCallback((ticker: string) => {
    const sym = (ticker || '').toUpperCase();
    return stocks.find(s => s.ticker === sym) || BASE_STOCKS.find(s => s.ticker === sym);
  }, [stocks]);

  const value = useMemo(() => ({
    stocks,
    getStock,
    lastUpdated
  }), [stocks, getStock, lastUpdated]);

  return (
    <StockMarketContext.Provider value={value}>
      {children}
    </StockMarketContext.Provider>
  );
}

export function useStockMarket() {
  return useContext(StockMarketContext);
}
