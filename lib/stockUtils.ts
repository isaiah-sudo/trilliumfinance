/**
 * Central Stock Market Metadata & Price Helpers for Trillium Finance
 */

export interface StockMetadata {
  ticker: string;
  name: string;
  category: 'Technology' | 'Healthcare' | 'Energy' | 'Finance' | 'Consumer' | 'Index';
  domain: string;
  basePrice: number;
  baseChange: number;
}

export const KNOWN_STOCKS_DATA: Record<string, StockMetadata> = {
  // Technology
  AAPL: { ticker: 'AAPL', name: 'Apple Inc.', category: 'Technology', domain: 'apple.com', basePrice: 327.30, baseChange: 0.73 },
  MSFT: { ticker: 'MSFT', name: 'Microsoft Corp.', category: 'Technology', domain: 'microsoft.com', basePrice: 514.90, baseChange: 3.64 },
  NVDA: { ticker: 'NVDA', name: 'NVIDIA Corp.', category: 'Technology', domain: 'nvidia.com', basePrice: 230.20, baseChange: 2.56 },
  GOOGL: { ticker: 'GOOGL', name: 'Alphabet Inc.', category: 'Technology', domain: 'google.com', basePrice: 342.60, baseChange: 1.62 },
  GOOG: { ticker: 'GOOG', name: 'Alphabet Inc.', category: 'Technology', domain: 'google.com', basePrice: 342.60, baseChange: 1.62 },
  AMZN: { ticker: 'AMZN', name: 'Amazon.com Inc.', category: 'Technology', domain: 'amazon.com', basePrice: 259.40, baseChange: 1.73 },
  META: { ticker: 'META', name: 'Meta Platforms Inc.', category: 'Technology', domain: 'meta.com', basePrice: 614.70, baseChange: 3.68 },
  TSLA: { ticker: 'TSLA', name: 'Tesla Inc.', category: 'Technology', domain: 'tesla.com', basePrice: 382.70, baseChange: 7.19 },
  TSM: { ticker: 'TSM', name: 'Taiwan Semiconductor', category: 'Technology', domain: 'tsmc.com', basePrice: 198.50, baseChange: 1.88 },
  AVGO: { ticker: 'AVGO', name: 'Broadcom Inc.', category: 'Technology', domain: 'broadcom.com', basePrice: 215.30, baseChange: 1.45 },
  ASML: { ticker: 'ASML', name: 'ASML Holding', category: 'Technology', domain: 'asml.com', basePrice: 945.10, baseChange: 0.95 },
  ORCL: { ticker: 'ORCL', name: 'Oracle Corp.', category: 'Technology', domain: 'oracle.com', basePrice: 168.50, baseChange: 1.12 },
  AMD: { ticker: 'AMD', name: 'Advanced Micro Devices', category: 'Technology', domain: 'amd.com', basePrice: 164.40, baseChange: 0.85 },
  CRM: { ticker: 'CRM', name: 'Salesforce Inc.', category: 'Technology', domain: 'salesforce.com', basePrice: 298.60, baseChange: 0.64 },
  ADBE: { ticker: 'ADBE', name: 'Adobe Inc.', category: 'Technology', domain: 'adobe.com', basePrice: 532.10, baseChange: -0.15 },
  NFLX: { ticker: 'NFLX', name: 'Netflix Inc.', category: 'Technology', domain: 'netflix.com', basePrice: 712.30, baseChange: 2.45 },
  INTC: { ticker: 'INTC', name: 'Intel Corporation', category: 'Technology', domain: 'intel.com', basePrice: 24.80, baseChange: -0.90 },

  // Healthcare
  UNH: { ticker: 'UNH', name: 'UnitedHealth Group', category: 'Healthcare', domain: 'unitedhealthgroup.com', basePrice: 582.20, baseChange: 0.42 },
  LLY: { ticker: 'LLY', name: 'Eli Lilly & Co.', category: 'Healthcare', domain: 'lilly.com', basePrice: 965.80, baseChange: 1.85 },
  JNJ: { ticker: 'JNJ', name: 'Johnson & Johnson', category: 'Healthcare', domain: 'jnj.com', basePrice: 165.30, baseChange: -0.25 },
  MRK: { ticker: 'MRK', name: 'Merck & Co.', category: 'Healthcare', domain: 'merck.com', basePrice: 118.70, baseChange: 0.55 },
  ABBV: { ticker: 'ABBV', name: 'AbbVie Inc.', category: 'Healthcare', domain: 'abbvie.com', basePrice: 198.50, baseChange: 1.05 },
  PFE: { ticker: 'PFE', name: 'Pfizer Inc.', category: 'Healthcare', domain: 'pfizer.com', basePrice: 29.40, baseChange: -0.40 },
  TMO: { ticker: 'TMO', name: 'Thermo Fisher Scientific', category: 'Healthcare', domain: 'thermofisher.com', basePrice: 592.40, baseChange: 0.72 },
  DHR: { ticker: 'DHR', name: 'Danaher Corp.', category: 'Healthcare', domain: 'danaher.com', basePrice: 271.10, baseChange: 0.38 },
  ABT: { ticker: 'ABT', name: 'Abbott Laboratories', category: 'Healthcare', domain: 'abbott.com', basePrice: 118.60, baseChange: 0.18 },
  AMGN: { ticker: 'AMGN', name: 'Amgen Inc.', category: 'Healthcare', domain: 'amgen.com', basePrice: 334.50, baseChange: -0.85 },

  // Energy
  XOM: { ticker: 'XOM', name: 'Exxon Mobil Corp.', category: 'Energy', domain: 'exxonmobil.com', basePrice: 122.40, baseChange: 1.25 },
  CVX: { ticker: 'CVX', name: 'Chevron Corp.', category: 'Energy', domain: 'chevron.com', basePrice: 152.20, baseChange: 0.92 },
  COP: { ticker: 'COP', name: 'ConocoPhillips', category: 'Energy', domain: 'conocophillips.com', basePrice: 118.30, baseChange: 1.40 },
  SLB: { ticker: 'SLB', name: 'Schlumberger N.V.', category: 'Energy', domain: 'slb.com', basePrice: 46.80, baseChange: -0.60 },
  EOG: { ticker: 'EOG', name: 'EOG Resources', category: 'Energy', domain: 'eogresources.com', basePrice: 129.50, baseChange: 0.85 },
  BP: { ticker: 'BP', name: 'BP plc', category: 'Energy', domain: 'bp.com', basePrice: 36.20, baseChange: 0.45 },
  MPC: { ticker: 'MPC', name: 'Marathon Petroleum', category: 'Energy', domain: 'marathonpetroleum.com', basePrice: 174.90, baseChange: 1.10 },
  PSX: { ticker: 'PSX', name: 'Phillips 66', category: 'Energy', domain: 'phillips66.com', basePrice: 142.40, baseChange: 0.70 },
  VLO: { ticker: 'VLO', name: 'Valero Energy', category: 'Energy', domain: 'valero.com', basePrice: 154.60, baseChange: 1.35 },
  OXY: { ticker: 'OXY', name: 'Occidental Petroleum', category: 'Energy', domain: 'oxy.com', basePrice: 61.20, baseChange: 0.22 },

  // Finance
  JPM: { ticker: 'JPM', name: 'JPMorgan Chase', category: 'Finance', domain: 'jpmorganchase.com', basePrice: 228.80, baseChange: 1.12 },
  V: { ticker: 'V', name: 'Visa Inc.', category: 'Finance', domain: 'visa.com', basePrice: 288.40, baseChange: 0.65 },
  MA: { ticker: 'MA', name: 'Mastercard Inc.', category: 'Finance', domain: 'mastercard.com', basePrice: 495.10, baseChange: 0.88 },
  BAC: { ticker: 'BAC', name: 'Bank of America', category: 'Finance', domain: 'bankofamerica.com', basePrice: 42.50, baseChange: 0.40 },
  WFC: { ticker: 'WFC', name: 'Wells Fargo', category: 'Finance', domain: 'wellsfargo.com', basePrice: 61.40, baseChange: -0.15 },
  GS: { ticker: 'GS', name: 'Goldman Sachs', category: 'Finance', domain: 'goldmansachs.com', basePrice: 512.30, baseChange: 1.60 },
  MS: { ticker: 'MS', name: 'Morgan Stanley', category: 'Finance', domain: 'morganstanley.com', basePrice: 112.50, baseChange: 0.95 },
  AXP: { ticker: 'AXP', name: 'American Express', category: 'Finance', domain: 'americanexpress.com', basePrice: 268.90, baseChange: 1.20 },
  C: { ticker: 'C', name: 'Citigroup Inc.', category: 'Finance', domain: 'citigroup.com', basePrice: 66.10, baseChange: 0.35 },
  BLK: { ticker: 'BLK', name: 'BlackRock Inc.', category: 'Finance', domain: 'blackrock.com', basePrice: 924.20, baseChange: 1.45 },

  // Consumer
  WMT: { ticker: 'WMT', name: 'Walmart Inc.', category: 'Consumer', domain: 'walmart.com', basePrice: 82.30, baseChange: 0.50 },
  PG: { ticker: 'PG', name: 'Procter & Gamble', category: 'Consumer', domain: 'pg.com', basePrice: 172.20, baseChange: 0.15 },
  HD: { ticker: 'HD', name: 'Home Depot', category: 'Consumer', domain: 'homedepot.com', basePrice: 382.50, baseChange: -0.45 },
  COST: { ticker: 'COST', name: 'Costco Wholesale', category: 'Consumer', domain: 'costco.com', basePrice: 928.50, baseChange: 1.80 },
  KO: { ticker: 'KO', name: 'Coca-Cola Co.', category: 'Consumer', domain: 'coca-colacompany.com', basePrice: 71.90, baseChange: 0.25 },

  // Index ETFs
  SPY: { ticker: 'SPY', name: 'SPDR S&P 500 ETF', category: 'Index', domain: 'ssga.com', basePrice: 773.80, baseChange: 1.13 },
  QQQ: { ticker: 'QQQ', name: 'Invesco QQQ Trust', category: 'Index', domain: 'invesco.com', basePrice: 718.70, baseChange: 1.34 },
  DIA: { ticker: 'DIA', name: 'SPDR Dow Jones Industrial', category: 'Index', domain: 'ssga.com', basePrice: 438.00, baseChange: 0.40 },
  IWM: { ticker: 'IWM', name: 'iShares Russell 2000 ETF', category: 'Index', domain: 'ishares.com', basePrice: 232.00, baseChange: 1.10 }
};

/**
 * Returns a high-resolution favicon logo URL for any stock ticker
 */
export function getStockLogo(ticker: string, customDomain?: string): string {
  if (!ticker) return '';
  const sym = ticker.toUpperCase();
  const meta = KNOWN_STOCKS_DATA[sym];
  const domain = customDomain || meta?.domain || `${sym.toLowerCase()}.com`;
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;
}

/**
 * Returns company metadata or a clean fallback
 */
export function getStockMetadata(ticker: string): StockMetadata {
  const sym = (ticker || '').toUpperCase();
  if (KNOWN_STOCKS_DATA[sym]) {
    return KNOWN_STOCKS_DATA[sym];
  }
  return {
    ticker: sym,
    name: `${sym} Inc.`,
    category: 'Technology',
    domain: `${sym.toLowerCase()}.com`,
    basePrice: 150.00,
    baseChange: 0.50
  };
}
