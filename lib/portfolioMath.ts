/**
 * Portfolio Mathematical Utilities
 * 
 * Provides precision-safe floating-point calculations for financial data.
 * Standardizes core calculations and guarantees correct division-by-zero handling.
 */

/**
 * Precision-safe rounding helper using Number.EPSILON to avoid floating-point drift.
 * E.g., safeRound(1.005, 2) => 1.01 instead of 1
 */
export function safeRound(value: number, decimals: number = 2): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Safely adds two floating-point numbers.
 */
export function safeAdd(a: number, b: number): number {
  return safeRound(a + b, 8);
}

/**
 * Safely subtracts two floating-point numbers.
 */
export function safeSubtract(a: number, b: number): number {
  return safeRound(a - b, 8);
}

/**
 * Safely multiplies two floating-point numbers.
 */
export function safeMultiply(a: number, b: number): number {
  return safeRound(a * b, 8);
}

/**
 * Safely divides two floating-point numbers with zero-check.
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0 || isNaN(denominator) || !isFinite(denominator)) {
    return 0;
  }
  return safeRound(numerator / denominator, 8);
}

/**
 * Calculates Market Value (Per Asset)
 * Market Value = Quantity * Current Live Price
 */
export function calculateAssetMarketValue(qty: number, currentPrice: number): number {
  if (qty <= 0 || currentPrice <= 0) return 0;
  return safeRound(safeMultiply(qty, currentPrice), 2);
}

/**
 * Calculates Total Cost Basis (Per Asset)
 * Total Cost Basis = Quantity * Average Buy Price
 */
export function calculateAssetCostBasis(qty: number, avgPrice: number): number {
  if (qty <= 0 || avgPrice <= 0) return 0;
  return safeRound(safeMultiply(qty, avgPrice), 2);
}

/**
 * Calculates Asset P/L $ (Per Asset)
 * Asset P/L $ = Market Value - Cost Basis
 */
export function calculateAssetPLUSD(marketValue: number, costBasis: number): number {
  return safeRound(safeSubtract(marketValue, costBasis), 2);
}

/**
 * Calculates Asset P/L % (Per Asset)
 * Asset P/L % = ((Current Live Price - Avg Price) / Avg Price) * 100
 * Handles division-by-zero edges perfectly.
 */
export function calculateAssetPLPercent(currentPrice: number, avgPrice: number): number {
  if (avgPrice <= 0 || isNaN(avgPrice) || !isFinite(avgPrice)) {
    return 0;
  }
  const difference = safeSubtract(currentPrice, avgPrice);
  const ratio = safeDivide(difference, avgPrice);
  return safeRound(safeMultiply(ratio, 100), 2);
}

/**
 * Calculates Day P/L $ (Per Asset)
 * Day P/L = Quantity * (Current Price - Previous Close Price)
 */
export function calculateAssetDayPLUSD(qty: number, currentPrice: number, previousClose: number): number {
  if (qty <= 0) return 0;
  // If no valid previous close exists, fallback to current price (no intraday change)
  const refClose = previousClose > 0 ? previousClose : currentPrice;
  const difference = safeSubtract(currentPrice, refClose);
  return safeRound(safeMultiply(qty, difference), 2);
}

/**
 * Calculates Global Net Worth (Global Equity)
 * Net Worth = Available Cash + Total Market Value
 */
export function calculateNetWorth(cash: number, totalMarketValue: number): number {
  return safeRound(safeAdd(cash, totalMarketValue), 2);
}

/**
 * Calculates Global Total Performance $
 * Total Performance $ = Total Market Value - Total Cost Basis
 */
export function calculateGlobalTotalPerformanceUSD(totalMarketValue: number, totalCostBasis: number): number {
  return safeRound(safeSubtract(totalMarketValue, totalCostBasis), 2);
}

/**
 * Calculates Global Total Performance %
 * Total Performance % = (Total Performance $ / Total Cost Basis) * 100
 * Handles division-by-zero perfectly.
 */
export function calculateGlobalTotalPerformancePercent(totalPerformanceUSD: number, totalCostBasis: number): number {
  if (totalCostBasis <= 0) return 0;
  const ratio = safeDivide(totalPerformanceUSD, totalCostBasis);
  return safeRound(safeMultiply(ratio, 100), 2);
}

/**
 * Calculates Global Day P/L % (Day performance relative to starting day value)
 * Day Performance % = (Day P/L $ / Previous Net Worth) * 100
 * where Previous Net Worth = Current Net Worth - Day P/L $
 */
export function calculateGlobalDayPLPercent(dayPLUSD: number, currentNetWorth: number): number {
  const previousNetWorth = safeSubtract(currentNetWorth, dayPLUSD);
  if (previousNetWorth <= 0) return 0;
  const ratio = safeDivide(dayPLUSD, previousNetWorth);
  return safeRound(safeMultiply(ratio, 100), 2);
}
