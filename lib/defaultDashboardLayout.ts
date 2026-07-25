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

export const DEFAULT_WIDGET_LAYOUTS: ResponsiveDashboardLayouts = {
  lg: [
    { i: 'portfolio-graph', x: 0, y: 0, w: 8, h: 5, minW: 5, minH: 4, visible: true },
    { i: 'account-summary', x: 8, y: 0, w: 4, h: 5, minW: 3, minH: 3, visible: true },
    { i: 'watchlist', x: 0, y: 5, w: 4, h: 4, minW: 3, minH: 3, visible: true },
    { i: 'recent-trades', x: 4, y: 5, w: 4, h: 4, minW: 3, minH: 3, visible: true },
    { i: 'leaderboard-rankings', x: 8, y: 5, w: 4, h: 4, minW: 3, minH: 3, visible: true },
    { i: 'achievements-tracker', x: 0, y: 9, w: 12, h: 4, minW: 4, minH: 3, visible: true },
  ],
  md: [
    { i: 'portfolio-graph', x: 0, y: 0, w: 10, h: 5, minW: 4, minH: 4, visible: true },
    { i: 'account-summary', x: 0, y: 5, w: 10, h: 4, minW: 3, minH: 3, visible: true },
    { i: 'watchlist', x: 0, y: 9, w: 5, h: 4, minW: 3, minH: 3, visible: true },
    { i: 'recent-trades', x: 5, y: 9, w: 5, h: 4, minW: 3, minH: 3, visible: true },
    { i: 'leaderboard-rankings', x: 0, y: 13, w: 10, h: 4, minW: 3, minH: 3, visible: true },
    { i: 'achievements-tracker', x: 0, y: 17, w: 10, h: 4, minW: 3, minH: 3, visible: true },
  ],
  sm: [
    { i: 'portfolio-graph', x: 0, y: 0, w: 6, h: 5, minW: 2, minH: 3, visible: true },
    { i: 'account-summary', x: 0, y: 5, w: 6, h: 4, minW: 2, minH: 3, visible: true },
    { i: 'watchlist', x: 0, y: 9, w: 6, h: 4, minW: 2, minH: 3, visible: true },
    { i: 'recent-trades', x: 0, y: 13, w: 6, h: 4, minW: 2, minH: 3, visible: true },
    { i: 'leaderboard-rankings', x: 0, y: 17, w: 6, h: 4, minW: 2, minH: 3, visible: true },
    { i: 'achievements-tracker', x: 0, y: 21, w: 6, h: 4, minW: 2, minH: 3, visible: true },
  ],
};
