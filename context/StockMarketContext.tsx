'use client';

import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';
import { fetchFinnhubQuote } from '@/app/actions/trading';

export interface StockQuote {
  ticker: string;
  name: string;
  category: string;
  price: number;
  change: number;
  logo: string;
  loading?: boolean;
}

export const BASE_STOCKS: StockQuote[] = [
  // Technology
  { ticker: 'AAPL', name: 'Apple Inc.', category: 'Technology', price: 224.23, change: 1.45, logo: 'https://logo.clearbit.com/apple.com' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', category: 'Technology', price: 448.37, change: 0.82, logo: 'https://logo.clearbit.com/microsoft.com' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', category: 'Technology', price: 128.54, change: 3.12, logo: 'https://logo.clearbit.com/nvidia.com' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', category: 'Technology', price: 178.20, change: -0.45, logo: 'https://logo.clearbit.com/google.com' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', category: 'Technology', price: 186.40, change: 1.15, logo: 'https://logo.clearbit.com/amazon.com' },
  { ticker: 'META', name: 'Meta Platforms Inc.', category: 'Technology', price: 512.90, change: 2.05, logo: 'https://logo.clearbit.com/meta.com' },
  { ticker: 'TSM', name: 'Taiwan Semiconductor', category: 'Technology', price: 172.80, change: 1.88, logo: 'https://logo.clearbit.com/tsmc.com' },
  { ticker: 'AVGO', name: 'Broadcom Inc.', category: 'Technology', price: 168.30, change: -0.32, logo: 'https://logo.clearbit.com/broadcom.com' },
  { ticker: 'ASML', name: 'ASML Holding', category: 'Technology', price: 924.10, change: 0.95, logo: 'https://logo.clearbit.com/asml.com' },
  { ticker: 'ORCL', name: 'Oracle Corp.', category: 'Technology', price: 142.50, change: 1.12, logo: 'https://logo.clearbit.com/oracle.com' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', category: 'Technology', price: 156.40, change: -1.20, logo: 'https://logo.clearbit.com/amd.com' },
  { ticker: 'CRM', name: 'Salesforce Inc.', category: 'Technology', price: 254.60, change: 0.64, logo: 'https://logo.clearbit.com/salesforce.com' },
  { ticker: 'ADBE', name: 'Adobe Inc.', category: 'Technology', price: 542.10, change: -0.15, logo: 'https://logo.clearbit.com/adobe.com' },
  { ticker: 'NFLX', name: 'Netflix Inc.', category: 'Technology', price: 684.30, change: 2.45, logo: 'https://logo.clearbit.com/netflix.com' },
  { ticker: 'INTC', name: 'Intel Corporation', category: 'Technology', price: 21.40, change: -2.10, logo: 'https://logo.clearbit.com/intel.com' },

  // Healthcare
  { ticker: 'UNH', name: 'UnitedHealth Group', category: 'Healthcare', price: 564.20, change: 0.42, logo: 'https://logo.clearbit.com/unitedhealthgroup.com' },
  { ticker: 'LLY', name: 'Eli Lilly & Co.', category: 'Healthcare', price: 942.80, change: 1.85, logo: 'https://logo.clearbit.com/lilly.com' },
  { ticker: 'JNJ', name: 'Johnson & Johnson', category: 'Healthcare', price: 162.30, change: -0.25, logo: 'https://logo.clearbit.com/jnj.com' },
  { ticker: 'MRK', name: 'Merck & Co.', category: 'Healthcare', price: 114.70, change: 0.55, logo: 'https://logo.clearbit.com/merck.com' },
  { ticker: 'ABBV', name: 'AbbVie Inc.', category: 'Healthcare', price: 192.50, change: 1.05, logo: 'https://logo.clearbit.com/abbvie.com' },
  { ticker: 'PFE', name: 'Pfizer Inc.', category: 'Healthcare', price: 28.90, change: -0.40, logo: 'https://logo.clearbit.com/pfizer.com' },
  { ticker: 'TMO', name: 'Thermo Fisher', category: 'Healthcare', price: 578.40, change: 0.72, logo: 'https://logo.clearbit.com/thermofisher.com' },
  { ticker: 'DHR', name: 'Danaher Corp.', category: 'Healthcare', price: 264.10, change: 0.38, logo: 'https://logo.clearbit.com/danaher.com' },
  { ticker: 'ABT', name: 'Abbott Labs', category: 'Healthcare', price: 112.60, change: 0.18, logo: 'https://logo.clearbit.com/abbott.com' },
  { ticker: 'AMGN', name: 'Amgen Inc.', category: 'Healthcare', price: 324.50, change: -0.85, logo: 'https://logo.clearbit.com/amgen.com' },

  // Energy
  { ticker: 'XOM', name: 'Exxon Mobil Corp.', category: 'Energy', price: 118.40, change: 1.25, logo: 'https://logo.clearbit.com/exxonmobil.com' },
  { ticker: 'CVX', name: 'Chevron Corp.', category: 'Energy', price: 146.20, change: 0.92, logo: 'https://logo.clearbit.com/chevron.com' },
  { ticker: 'COP', name: 'ConocoPhillips', category: 'Energy', price: 112.30, change: 1.40, logo: 'https://logo.clearbit.com/conocophillips.com' },
  { ticker: 'SLB', name: 'Schlumberger N.V.', category: 'Energy', price: 44.80, change: -0.60, logo: 'https://logo.clearbit.com/slb.com' },
  { ticker: 'EOG', name: 'EOG Resources', category: 'Energy', price: 124.50, change: 0.85, logo: 'https://logo.clearbit.com/eogresources.com' },
  { ticker: 'BP', name: 'BP plc', category: 'Energy', price: 34.20, change: 0.45, logo: 'https://logo.clearbit.com/bp.com' },
  { ticker: 'MPC', name: 'Marathon Petroleum', category: 'Energy', price: 168.90, change: 1.10, logo: 'https://logo.clearbit.com/marathonpetroleum.com' },
  { ticker: 'PSX', name: 'Phillips 66', category: 'Energy', price: 138.40, change: 0.70, logo: 'https://logo.clearbit.com/phillips66.com' },
  { ticker: 'VLO', name: 'Valero Energy', category: 'Energy', price: 148.60, change: 1.35, logo: 'https://logo.clearbit.com/valero.com' },
  { ticker: 'OXY', name: 'Occidental Petroleum', category: 'Energy', price: 58.20, change: 0.22, logo: 'https://logo.clearbit.com/oxy.com' },

  // Finance
  { ticker: 'JPM', name: 'JPMorgan Chase', category: 'Finance', price: 214.80, change: 1.12, logo: 'https://logo.clearbit.com/jpmorganchase.com' },
  { ticker: 'V', name: 'Visa Inc.', category: 'Finance', price: 272.40, change: 0.65, logo: 'https://logo.clearbit.com/visa.com' },
  { ticker: 'MA', name: 'Mastercard Inc.', category: 'Finance', price: 462.10, change: 0.88, logo: 'https://logo.clearbit.com/mastercard.com' },
  { ticker: 'BAC', name: 'Bank of America', category: 'Finance', price: 39.50, change: 0.40, logo: 'https://logo.clearbit.com/bankofamerica.com' },
  { ticker: 'WFC', name: 'Wells Fargo', category: 'Finance', price: 56.40, change: -0.15, logo: 'https://logo.clearbit.com/wellsfargo.com' },
  { ticker: 'GS', name: 'Goldman Sachs', category: 'Finance', price: 488.30, change: 1.60, logo: 'https://logo.clearbit.com/goldmansachs.com' },
  { ticker: 'MS', name: 'Morgan Stanley', category: 'Finance', price: 102.50, change: 0.95, logo: 'https://logo.clearbit.com/morganstanley.com' },
  { ticker: 'AXP', name: 'American Express', category: 'Finance', price: 248.90, change: 1.20, logo: 'https://logo.clearbit.com/americanexpress.com' },
  { ticker: 'C', name: 'Citigroup Inc.', category: 'Finance', price: 62.10, change: 0.35, logo: 'https://logo.clearbit.com/citigroup.com' },
  { ticker: 'BLK', name: 'BlackRock Inc.', category: 'Finance', price: 884.20, change: 1.45, logo: 'https://logo.clearbit.com/blackrock.com' },

  // Consumer
  { ticker: 'WMT', name: 'Walmart Inc.', category: 'Consumer', price: 74.30, change: 0.50, logo: 'https://logo.clearbit.com/walmart.com' },
  { ticker: 'PG', name: 'Procter & Gamble', category: 'Consumer', price: 168.20, change: 0.15, logo: 'https://logo.clearbit.com/pg.com' },
  { ticker: 'HD', name: 'Home Depot', category: 'Consumer', price: 364.50, change: -0.45, logo: 'https://logo.clearbit.com/homedepot.com' },
  { ticker: 'COST', name: 'Costco Wholesale', category: 'Consumer', price: 852.40, change: 1.80, logo: 'https://logo.clearbit.com/costco.com' },
  { ticker: 'KO', name: 'Coca-Cola Co.', category: 'Consumer', price: 68.90, change: 0.25, logo: 'https://logo.clearbit.com/coca-colacompany.com' },
];

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

const CACHE_KEY = 'trillium_global_stock_market_v1';
const TIMESTAMP_KEY = 'trillium_global_stock_market_time_v1';
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours threshold for full daily sync

export function StockMarketProvider({ children }: PropsWithChildren) {
  const [stocks, setStocks] = useState<StockQuote[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY) || sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: StockQuote[] = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Merge cached data with BASE_STOCKS to ensure logo & category exist and price is non-zero
            return BASE_STOCKS.map(base => {
              const item = parsed.find((p: any) => p.ticker === base.ticker);
              if (item && item.price > 0) {
                return {
                  ...base,
                  price: item.price,
                  change: item.change ?? base.change,
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

  // Background EOD / Daily sweep to fetch fresh quotes for all stocks if cache is stale (>6 hrs)
  const refreshCacheIfStale = async () => {
    if (typeof window === 'undefined') return;
    try {
      const lastTimeStr = localStorage.getItem(TIMESTAMP_KEY) || sessionStorage.getItem(TIMESTAMP_KEY);
      const lastTime = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;
      const isStale = Date.now() - lastTime > REFRESH_INTERVAL_MS;

      if (isStale || lastTime === 0) {
        // Fetch top stocks in batch to update daily closing prices
        const topTickers = BASE_STOCKS.map(s => s.ticker).slice(0, 15);
        const { getMarketQuotes } = await import('@/app/actions/trading');
        const quotes = await getMarketQuotes(topTickers);
        
        if (quotes && quotes.length > 0) {
          setStocks(prev => {
            const updated = prev.map(stock => {
              const quote = quotes.find(q => q.ticker === stock.ticker);
              if (quote && quote.price > 0) {
                return { ...stock, price: quote.price, change: quote.change, loading: false };
              }
              return stock;
            });
            saveToCache(updated);
            return updated;
          });
        }
      }
    } catch (err) {
      console.warn('Daily cache refresh failed, continuing with current cached prices:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check and refresh cache on mount if stale
    refreshCacheIfStale();

    // Staggered global tick synchronized by timestamp
    const tickGlobalMarket = async () => {
      if (!mounted) return;
      
      // Calculate synchronized ticker index based on global epoch time (4000ms steps)
      const nowSeconds = Math.floor(Date.now() / 4000);
      const rotationIndex = nowSeconds % BASE_STOCKS.length;
      const targetStock = BASE_STOCKS[rotationIndex];

      if (!targetStock) return;

      try {
        const quote = await fetchFinnhubQuote(targetStock.ticker);
        if (mounted && quote && quote.c && quote.c > 0) {
          setStocks(prev => {
            const updated = prev.map(stock => {
              if (stock.ticker === targetStock.ticker) {
                const price = quote.c;
                const pc = quote.pc || stock.price || price;
                const change = pc > 0 ? ((price - pc) / pc) * 100 : stock.change;
                return { ...stock, price, change, loading: false };
              }
              return stock;
            });

            saveToCache(updated);
            return updated;
          });
          setLastUpdated(Date.now());
        }
      } catch (err) {
        console.error(`Global ticker update error for ${targetStock.ticker}:`, err);
      }
    };

    // Initial tick right away
    tickGlobalMarket();

    // Synchronized interval every 4000ms
    const interval = setInterval(tickGlobalMarket, 4000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const getStock = (ticker: string) => {
    const sym = ticker.toUpperCase();
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

