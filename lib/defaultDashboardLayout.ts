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
  [key: string]: WidgetLayoutItem[];
}

// Exactly 3 default visible starting widgets: Graph, Account Overview, Holdings/Watchlist
export const DEFAULT_WIDGET_LAYOUTS: ResponsiveDashboardLayouts = {
  lg: [
    { i: 'portfolio-graph', x: 0, y: 0, w: 8, h: 5, minW: 4, minH: 3, maxW: 12, maxH: 8, visible: true },
    { i: 'account-summary', x: 8, y: 0, w: 4, h: 5, minW: 3, minH: 3, maxW: 12, maxH: 8, visible: true },
    { i: 'watchlist', x: 0, y: 5, w: 12, h: 5, minW: 4, minH: 3, maxW: 12, maxH: 8, visible: true },

    // Optional widgets available to add via "+ Add Widgets" modal
    { i: 'recent-trades', x: 0, y: 10, w: 12, h: 4, minW: 3, minH: 3, maxW: 12, maxH: 8, visible: false },
    { i: 'leaderboard-rankings', x: 0, y: 14, w: 12, h: 4, minW: 3, minH: 3, maxW: 12, maxH: 8, visible: false },
    { i: 'achievements-tracker', x: 0, y: 18, w: 12, h: 4, minW: 4, minH: 3, maxW: 12, maxH: 8, visible: false },
    { i: 'quick-trade', x: 0, y: 22, w: 12, h: 4, minW: 3, minH: 3, maxW: 12, maxH: 6, visible: false },
    { i: 'market-movers', x: 0, y: 26, w: 12, h: 4, minW: 3, minH: 3, maxW: 12, maxH: 6, visible: false },
    { i: 'portfolio-goals', x: 0, y: 30, w: 12, h: 4, minW: 3, minH: 3, maxW: 12, maxH: 6, visible: false },
    { i: 'financial-news', x: 0, y: 34, w: 12, h: 4, minW: 4, minH: 3, maxW: 12, maxH: 8, visible: false },
  ],
  md: [
    { i: 'portfolio-graph', x: 0, y: 0, w: 6, h: 5, minW: 3, minH: 3, maxW: 10, maxH: 8, visible: true },
    { i: 'account-summary', x: 6, y: 0, w: 4, h: 5, minW: 3, minH: 3, maxW: 10, maxH: 8, visible: true },
    { i: 'watchlist', x: 0, y: 5, w: 10, h: 5, minW: 3, minH: 3, maxW: 10, maxH: 8, visible: true },

    { i: 'recent-trades', x: 0, y: 10, w: 10, h: 4, minW: 3, minH: 3, maxW: 10, maxH: 8, visible: false },
    { i: 'leaderboard-rankings', x: 0, y: 14, w: 10, h: 4, minW: 3, minH: 3, maxW: 10, maxH: 8, visible: false },
    { i: 'achievements-tracker', x: 0, y: 18, w: 10, h: 4, minW: 4, minH: 3, maxW: 10, maxH: 8, visible: false },
    { i: 'quick-trade', x: 0, y: 22, w: 10, h: 4, minW: 3, minH: 3, maxW: 10, maxH: 6, visible: false },
    { i: 'market-movers', x: 0, y: 26, w: 10, h: 4, minW: 3, minH: 3, maxW: 10, maxH: 6, visible: false },
    { i: 'portfolio-goals', x: 0, y: 30, w: 10, h: 4, minW: 3, minH: 3, maxW: 10, maxH: 6, visible: false },
    { i: 'financial-news', x: 0, y: 34, w: 10, h: 4, minW: 4, minH: 3, maxW: 10, maxH: 8, visible: false },
  ],
  sm: [
    { i: 'portfolio-graph', x: 0, y: 0, w: 6, h: 5, minW: 2, minH: 3, maxW: 6, maxH: 8, visible: true },
    { i: 'account-summary', x: 0, y: 5, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 7, visible: true },
    { i: 'watchlist', x: 0, y: 9, w: 6, h: 5, minW: 2, minH: 3, maxW: 6, maxH: 8, visible: true },

    { i: 'recent-trades', x: 0, y: 14, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 8, visible: false },
    { i: 'leaderboard-rankings', x: 0, y: 18, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 8, visible: false },
    { i: 'achievements-tracker', x: 0, y: 22, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 8, visible: false },
    { i: 'quick-trade', x: 0, y: 26, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 6, visible: false },
    { i: 'market-movers', x: 0, y: 30, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 6, visible: false },
    { i: 'portfolio-goals', x: 0, y: 34, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 6, visible: false },
    { i: 'financial-news', x: 0, y: 38, w: 6, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 8, visible: false },
  ],
};
