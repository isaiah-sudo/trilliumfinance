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
  AAPL: { ticker: 'AAPL', name: 'Apple Inc.', category: 'Technology', domain: 'apple.com', basePrice: 343.34, baseChange: 1.29 },
  MSFT: { ticker: 'MSFT', name: 'Microsoft Corp.', category: 'Technology', domain: 'microsoft.com', basePrice: 494.76, baseChange: -1.36 },
  NVDA: { ticker: 'NVDA', name: 'NVIDIA Corp.', category: 'Technology', domain: 'nvidia.com', basePrice: 228.36, baseChange: 0.43 },
  GOOGL: { ticker: 'GOOGL', name: 'Alphabet Inc.', category: 'Technology', domain: 'google.com', basePrice: 356.87, baseChange: 0.53 },
  AMZN: { ticker: 'AMZN', name: 'Amazon.com Inc.', category: 'Technology', domain: 'amazon.com', basePrice: 255.31, baseChange: -1.22 },
  META: { ticker: 'META', name: 'Meta Platforms Inc.', category: 'Technology', domain: 'meta.com', basePrice: 748.85, baseChange: 1.03 },
  TSLA: { ticker: 'TSLA', name: 'Tesla Inc.', category: 'Technology', domain: 'tesla.com', basePrice: 376.25, baseChange: 0.28 },
  TSM: { ticker: 'TSM', name: 'Taiwan Semiconductor', category: 'Technology', domain: 'tsmc.com', basePrice: 445.71, baseChange: 0.13 },
  AVGO: { ticker: 'AVGO', name: 'Broadcom Inc.', category: 'Technology', domain: 'broadcom.com', basePrice: 362.75, baseChange: 0.03 },
  ASML: { ticker: 'ASML', name: 'ASML Holding', category: 'Technology', domain: 'asml.com', basePrice: 1728.12, baseChange: 0.98 },
  ORCL: { ticker: 'ORCL', name: 'Oracle Corp.', category: 'Technology', domain: 'oracle.com', basePrice: 150.30, baseChange: 1.17 },
  AMD: { ticker: 'AMD', name: 'Advanced Micro Devices', category: 'Technology', domain: 'amd.com', basePrice: 619.71, baseChange: 0.68 },
  CRM: { ticker: 'CRM', name: 'Salesforce Inc.', category: 'Technology', domain: 'salesforce.com', basePrice: 230.84, baseChange: -2.36 },
  ADBE: { ticker: 'ADBE', name: 'Adobe Inc.', category: 'Technology', domain: 'adobe.com', basePrice: 241.38, baseChange: -3.26 },
  NFLX: { ticker: 'NFLX', name: 'Netflix Inc.', category: 'Technology', domain: 'netflix.com', basePrice: 72.06, baseChange: -1.76 },
  INTC: { ticker: 'INTC', name: 'Intel Corporation', category: 'Technology', domain: 'intel.com', basePrice: 121.96, baseChange: 0.15 },

  // Healthcare
  UNH: { ticker: 'UNH', name: 'UnitedHealth Group', category: 'Healthcare', domain: 'unitedhealthgroup.com', basePrice: 373.01, baseChange: -1.21 },
  LLY: { ticker: 'LLY', name: 'Eli Lilly & Co.', category: 'Healthcare', domain: 'lilly.com', basePrice: 1178.19, baseChange: 1.14 },
  JNJ: { ticker: 'JNJ', name: 'Johnson & Johnson', category: 'Healthcare', domain: 'jnj.com', basePrice: 269.58, baseChange: 0.04 },
  MRK: { ticker: 'MRK', name: 'Merck & Co.', category: 'Healthcare', domain: 'merck.com', basePrice: 152.93, baseChange: 2.29 },
  ABBV: { ticker: 'ABBV', name: 'AbbVie Inc.', category: 'Healthcare', domain: 'abbvie.com', basePrice: 266.52, baseChange: 0.77 },
  PFE: { ticker: 'PFE', name: 'Pfizer Inc.', category: 'Healthcare', domain: 'pfizer.com', basePrice: 27.91, baseChange: 0.59 },
  TMO: { ticker: 'TMO', name: 'Thermo Fisher Scientific', category: 'Healthcare', domain: 'thermofisher.com', basePrice: 661.97, baseChange: 0.49 },
  DHR: { ticker: 'DHR', name: 'Danaher Corp.', category: 'Healthcare', domain: 'danaher.com', basePrice: 220.63, baseChange: 2.22 },
  ABT: { ticker: 'ABT', name: 'Abbott Laboratories', category: 'Healthcare', domain: 'abbott.com', basePrice: 104.28, baseChange: 1.26 },
  AMGN: { ticker: 'AMGN', name: 'Amgen Inc.', category: 'Healthcare', domain: 'amgen.com', basePrice: 411.57, baseChange: 4.68 },

  // Energy
  XOM: { ticker: 'XOM', name: 'Exxon Mobil Corp.', category: 'Energy', domain: 'exxonmobil.com', basePrice: 159.14, baseChange: 0.53 },
  CVX: { ticker: 'CVX', name: 'Chevron Corp.', category: 'Energy', domain: 'chevron.com', basePrice: 203.84, baseChange: 0.08 },
  COP: { ticker: 'COP', name: 'ConocoPhillips', category: 'Energy', domain: 'conocophillips.com', basePrice: 126.73, baseChange: -0.63 },
  SLB: { ticker: 'SLB', name: 'Schlumberger N.V.', category: 'Energy', domain: 'slb.com', basePrice: 52.62, baseChange: 1.66 },
  EOG: { ticker: 'EOG', name: 'EOG Resources', category: 'Energy', domain: 'eogresources.com', basePrice: 141.09, baseChange: -0.20 },
  BP: { ticker: 'BP', name: 'BP plc', category: 'Energy', domain: 'bp.com', basePrice: 43.41, baseChange: 0.58 },
  MPC: { ticker: 'MPC', name: 'Marathon Petroleum', category: 'Energy', domain: 'marathonpetroleum.com', basePrice: 398.13, baseChange: -1.05 },
  PSX: { ticker: 'PSX', name: 'Phillips 66', category: 'Energy', domain: 'phillips66.com', basePrice: 260.51, baseChange: -0.47 },
  VLO: { ticker: 'VLO', name: 'Valero Energy', category: 'Energy', domain: 'valero.com', basePrice: 384.33, baseChange: -2.27 },
  OXY: { ticker: 'OXY', name: 'Occidental Petroleum', category: 'Energy', domain: 'oxy.com', basePrice: 57.25, baseChange: 0.00 },

  // Finance
  JPM: { ticker: 'JPM', name: 'JPMorgan Chase', category: 'Finance', domain: 'jpmorganchase.com', basePrice: 337.89, baseChange: -4.02 },
  V: { ticker: 'V', name: 'Visa Inc.', category: 'Finance', domain: 'visa.com', basePrice: 361.21, baseChange: -2.36 },
  MA: { ticker: 'MA', name: 'Mastercard Inc.', category: 'Finance', domain: 'mastercard.com', basePrice: 555.82, baseChange: -2.08 },
  BAC: { ticker: 'BAC', name: 'Bank of America', category: 'Finance', domain: 'bankofamerica.com', basePrice: 56.14, baseChange: -3.14 },
  WFC: { ticker: 'WFC', name: 'Wells Fargo', category: 'Finance', domain: 'wellsfargo.com', basePrice: 82.90, baseChange: -4.21 },
  GS: { ticker: 'GS', name: 'Goldman Sachs', category: 'Finance', domain: 'goldmansachs.com', basePrice: 942.28, baseChange: -1.78 },
  MS: { ticker: 'MS', name: 'Morgan Stanley', category: 'Finance', domain: 'morganstanley.com', basePrice: 198.82, baseChange: -3.54 },
  AXP: { ticker: 'AXP', name: 'American Express', category: 'Finance', domain: 'americanexpress.com', basePrice: 306.47, baseChange: -2.27 },
  C: { ticker: 'C', name: 'Citigroup Inc.', category: 'Finance', domain: 'citigroup.com', basePrice: 130.88, baseChange: -3.09 },
  BLK: { ticker: 'BLK', name: 'BlackRock Inc.', category: 'Finance', domain: 'blackrock.com', basePrice: 1065.07, baseChange: -2.31 },

  // Consumer
  WMT: { ticker: 'WMT', name: 'Walmart Inc.', category: 'Consumer', domain: 'walmart.com', basePrice: 108.83, baseChange: 1.29 },
  PG: { ticker: 'PG', name: 'Procter & Gamble', category: 'Consumer', domain: 'pg.com', basePrice: 147.55, baseChange: 1.01 },
  HD: { ticker: 'HD', name: 'Home Depot', category: 'Consumer', domain: 'homedepot.com', basePrice: 301.45, baseChange: 1.43 },
  COST: { ticker: 'COST', name: 'Costco Wholesale', category: 'Consumer', domain: 'costco.com', basePrice: 901.61, baseChange: 0.35 },
  KO: { ticker: 'KO', name: 'Coca-Cola Co.', category: 'Consumer', domain: 'coca-colacompany.com', basePrice: 88.18, baseChange: 1.22 },

  // Index ETFs
  SPY: { ticker: 'SPY', name: 'SPDR S&P 500 ETF', category: 'Index', domain: 'ssga.com', basePrice: 772.99, baseChange: -0.07 },
  QQQ: { ticker: 'QQQ', name: 'Invesco QQQ Trust', category: 'Index', domain: 'invesco.com', basePrice: 744.77, baseChange: 0.45 },
  IWM: { ticker: 'IWM', name: 'iShares Russell 2000 ETF', category: 'Index', domain: 'ishares.com', basePrice: 286.48, baseChange: 0.32 },
  SOX: { ticker: 'SOX', name: 'PHLX Semiconductor Index', category: 'Index', domain: 'nasdaq.com', basePrice: 12541.89, baseChange: 0.87 }
};

/**
 * Returns a high-resolution favicon logo URL for any stock ticker
 */
export function getStockLogo(ticker: string, customDomain?: string): string {
  if (!ticker) return '';
  const sym = ticker.toUpperCase();
  const meta = KNOWN_STOCKS_DATA[sym];
  const domain = customDomain || meta?.domain || `${sym.toLowerCase()}.com`;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
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
