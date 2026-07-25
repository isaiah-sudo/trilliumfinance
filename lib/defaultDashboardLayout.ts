import { LayoutItem } from 'react-grid-layout';

export interface WidgetLayoutItem extends LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  visible?: boolean;
}

export interface ResponsiveDashboardLayouts {
  lg: WidgetLayoutItem[];
  md: WidgetLayoutItem[];
  sm: WidgetLayoutItem[];
}

// Exactly 3 default visible starting widgets: Graph, Holdings/Watchlist, Account Overview
export const DEFAULT_WIDGET_LAYOUTS: ResponsiveDashboardLayouts = {
  lg: [
    { i: 'portfolio-graph', x: 0, y: 0, w: 8, h: 5, minW: 4, minH: 3, maxW: 12, maxH: 8, visible: true },
    { i: 'account-summary', x: 8, y: 0, w: 4, h: 5, minW: 3, minH: 3, maxW: 6, maxH: 7, visible: true },
    { i: 'watchlist', x: 0, y: 5, w: 12, h: 4, minW: 4, minH: 3, maxW: 12, maxH: 8, visible: true },

    // Optional widgets available in "+ Add Widgets" modal
    { i: 'recent-trades', x: 0, y: 9, w: 6, h: 4, minW: 3, minH: 3, maxW: 12, maxH: 8, visible: false },
    { i: 'leaderboard-rankings', x: 6, y: 9, w: 6, h: 4, minW: 3, minH: 3, maxW: 12, maxH: 8, visible: false },
    { i: 'achievements-tracker', x: 0, y: 13, w: 12, h: 4, minW: 4, minH: 3, maxW: 12, maxH: 8, visible: false },
    { i: 'quick-trade', x: 0, y: 17, w: 4, h: 4, minW: 3, minH: 3, maxW: 6, maxH: 6, visible: false },
    { i: 'market-movers', x: 4, y: 17, w: 4, h: 4, minW: 3, minH: 3, maxW: 6, maxH: 6, visible: false },
    { i: 'portfolio-goals', x: 8, y: 17, w: 4, h: 4, minW: 3, minH: 3, maxW: 6, maxH: 6, visible: false },
    { i: 'financial-news', x: 0, y: 21, w: 12, h: 4, minW: 4, minH: 3, maxW: 12, maxH: 8, visible: false },
  ],
  md: [
    { i: 'portfolio-graph', x: 0, y: 0, w: 10, h: 5, minW: 4, minH: 3, maxW: 10, maxH: 8, visible: true },
    { i: 'account-summary', x: 0, y: 5, w: 10, h: 4, minW: 3, minH: 3, maxW: 10, maxH: 7, visible: true },
    { i: 'watchlist', x: 0, y: 9, w: 10, h: 4, minW: 3, minH: 3, maxW: 10, maxH: 8, visible: true },

    { i: 'recent-trades', x: 0, y: 13, w: 5, h: 4, minW: 3, minH: 3, maxW: 10, maxH: 8, visible: false },
    { i: 'leaderboard-rankings', x: 5, y: 13, w: 5, h: 4, minW: 3, minH: 3, maxW: 10, maxH: 8, visible: false },
    { i: 'achievements-tracker', x: 0, y: 17, w: 10, h: 4, minW: 4, minH: 3, maxW: 10, maxH: 8, visible: false },
    { i: 'quick-trade', x: 0, y: 21, w: 5, h: 4, minW: 3, minH: 3, maxW: 10, maxH: 6, visible: false },
    { i: 'market-movers', x: 5, y: 21, w: 5, h: 4, minW: 3, minH: 3, maxW: 10, maxH: 6, visible: false },
    { i: 'portfolio-goals', x: 0, y: 25, w: 10, h: 4, minW: 3, minH: 3, maxW: 10, maxH: 6, visible: false },
    { i: 'financial-news', x: 0, y: 29, w: 10, h: 4, minW: 4, minH: 3, maxW: 10, maxH: 8, visible: false },
  ],
  sm: [
    { i: 'portfolio-graph', x: 0, y: 0, w: 6, h: 5, minW: 2, minH: 3, maxW: 6, maxH: 8, visible: true },
    { i: 'account-summary', x: 0, y: 5, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 7, visible: true },
    { i: 'watchlist', x: 0, y: 9, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 8, visible: true },

    { i: 'recent-trades', x: 0, y: 13, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 8, visible: false },
    { i: 'leaderboard-rankings', x: 0, y: 17, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 8, visible: false },
    { i: 'achievements-tracker', x: 0, y: 21, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 8, visible: false },
    { i: 'quick-trade', x: 0, y: 25, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 6, visible: false },
    { i: 'market-movers', x: 0, y: 29, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 6, visible: false },
    { i: 'portfolio-goals', x: 0, y: 33, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 6, visible: false },
    { i: 'financial-news', x: 0, y: 37, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 8, visible: false },
  ],
};
