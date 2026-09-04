'use client';

import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { fetchFinnhubQuote } from '@/app/actions/trading';
import { KNOWN_STOCKS_DATA, getStockLogo, getStockMetadata } from '@/lib/stockUtils';

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
const REFRESH_INTERVAL_MS = 60 * 1000; // 60 seconds fresh cache sync

export function StockMarketProvider({ children }: PropsWithChildren) {
  const [stocks, setStocks] = useState<StockQuote[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY) || sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: StockQuote[] = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Merge cached data with BASE_STOCKS and ensure realistic prices
            return BASE_STOCKS.map(base => {
              const item = parsed.find((p: any) => p.ticker === base.ticker);
              // Reject corrupted legacy cache prices that deviate wildly (> 4x or < 0.2x) from basePrice
              if (item && item.price > 0 && item.price > base.price * 0.2 && item.price < base.price * 5) {
                return {
                  ...base,
                  price: item.price,
                  change: item.change ?? base.change,
                  logo: base.logo || item.logo,
                  loading: false
                };
              }
              return base;
            });
          }
        }
      } catch (e) {
        console.error('Error loading stock cache:', e);
      }
    }
    return BASE_STOCKS;
  });

  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Function to persist stock state and timestamp to cache
  const saveToCache = (updatedStocks: StockQuote[]) => {
    if (typeof window !== 'undefined') {
      try {
        const now = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify(updatedStocks));
        localStorage.setItem(TIMESTAMP_KEY, now.toString());
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(updatedStocks));
        sessionStorage.setItem(TIMESTAMP_KEY, now.toString());
      } catch (e) {
        console.error('Failed to save stock cache', e);
      }
    }
  };

  // Sweep to fetch fresh quotes for stocks if cache is stale or on initial launch
  const refreshCacheIfStale = async () => {
    if (typeof window === 'undefined') return;
    try {
      const lastTimeStr = localStorage.getItem(TIMESTAMP_KEY) || sessionStorage.getItem(TIMESTAMP_KEY);
      const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;
      const isStale = Date.now() - lastTime > REFRESH_INTERVAL_MS;

      if (isStale || lastTime === 0) {
        // Fetch quotes in batch
        const topTickers = BASE_STOCKS.map(s => s.ticker);
        const { getMarketQuotes } = await import('@/app/actions/trading');
        const quotes = await getMarketQuotes(topTickers);
        
        if (quotes && quotes.length > 0) {
          setStocks(prev => {
            const updated = prev.map(stock => {
              const quote = quotes.find(q => q.ticker === stock.ticker);
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
            saveToCache(updated);
            return updated;
          });
          setLastUpdated(Date.now());
        }
      }
    } catch (err) {
      console.warn('Daily cache refresh failed, continuing with current cached prices:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check and refresh cache on mount
    refreshCacheIfStale();

    // Local micro-fluctuation loop to keep charts and market tickers alive smoothly without network load
    let tickCounter = 0;
    const tickGlobalMarket = () => {
      if (!mounted) return;

      const batchSize = 4;
      const startIndex = (tickCounter * batchSize) % BASE_STOCKS.length;
      tickCounter++;
      const targetStocks = BASE_STOCKS.slice(startIndex, startIndex + batchSize);

      if (targetStocks.length === 0) return;

      setStocks(prev => {
        let hasChange = false;
        const updated = prev.map(stock => {
          const isTarget = targetStocks.some(ts => ts.ticker === stock.ticker);
          if (isTarget) {
            // Tiny realistic micro-fluctuation (+/- 0.05% to 0.15%)
            const deltaPercent = (Math.random() * 0.3 - 0.15);
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

        if (hasChange) {
          saveToCache(updated);
        }
        return updated;
      });
      setLastUpdated(Date.now());
    };

    // Micro-walk interval every 4 seconds (zero network requests)
    const tickInterval = setInterval(tickGlobalMarket, 4000);

    // Network cache sync every 60 seconds
    const syncInterval = setInterval(refreshCacheIfStale, REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(tickInterval);
      clearInterval(syncInterval);
    };
  }, []);

  const getStock = (ticker: string) => {
    const sym = (ticker || '').toUpperCase();
    return stocks.find(s => s.ticker === sym) || BASE_STOCKS.find(s => s.ticker === sym);
  };

  return (
    <StockMarketContext.Provider value={{ stocks, getStock, lastUpdated }}>
      {children}
    </StockMarketContext.Provider>
  );
}

export function useStockMarket() {
  return useContext(StockMarketContext);
}
