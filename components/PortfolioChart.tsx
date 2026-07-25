'use client';

import PortfolioGraph, { PortfolioGraphProps } from './PortfolioGraph';

/**
 * PortfolioChart component re-exporting PortfolioGraph to maintain 100% backward
 * compatibility with existing Dashboard pages and references across Trillium Finance.
 */
export type PortfolioChartProps = PortfolioGraphProps;

export default PortfolioGraph;
