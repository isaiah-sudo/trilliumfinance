import { create } from 'zustand';
import { getPortfolioSummary, handleTrade, PortfolioSummary } from '@/app/actions/trading';

interface PortfolioState {
  portfolio: PortfolioSummary | null;
  loading: boolean;
  error: string | null;
  fetchPortfolio: () => Promise<void>;
  executeTrade: (ticker: string, quantity: number, type: 'BUY' | 'SELL') => Promise<void>;
}

/**
 * Zustand store to synchronize portfolio state and handle safe execution of trades.
 */
export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolio: null,
  loading: false,
  error: null,

  fetchPortfolio: async () => {
    set({ loading: true, error: null });
    try {
      const summary = await getPortfolioSummary();
      set({ portfolio: summary, loading: false });
    } catch (err: any) {
      console.error('[Portfolio Store] Fetch Error:', err);
      set({ error: err.message || 'Failed to fetch portfolio summary', loading: false });
    }
  },

  executeTrade: async (ticker: string, quantity: number, type: 'BUY' | 'SELL') => {
    set({ loading: true, error: null });
    try {
      await handleTrade(ticker, quantity, type);
      // Immediately refetch summary to sync calculations deterministic state
      const summary = await getPortfolioSummary();
      set({ portfolio: summary, loading: false });
    } catch (err: any) {
      console.error('[Portfolio Store] Trade Error:', err);
      set({ error: err.message || 'Trade execution failed', loading: false });
      throw err; // rethrow so that local modals can render error states appropriately
    }
  }
}));
