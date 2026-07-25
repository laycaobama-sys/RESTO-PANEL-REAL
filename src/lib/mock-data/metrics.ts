/**
 * RestoPanel · Mock data — Aggregate metrics
 * Used by hero dashboard, animated counters and marketing sections.
 */

export interface RevenuePoint {
  month: string;
  revenue: number;
  forecast?: number;
}

export interface MockMetrics {
  reservationsManaged: number;
  activeCustomers: number;
  avgRating: number;
  noShowReduction: number; // percentage

  /** 7 days × 12 hours occupancy (each cell = % 0–100) */
  occupancyWeek: number[][];

  /** 12-month revenue trend with optional forecast */
  revenueTrend: RevenuePoint[];

  // Today's KPIs
  todayReservations: number;
  todayRevenue: number;
  todayOccupancy: number;
  todayTicketAvg: number;
  todayNoShows: number;
  vipArrivals: number;
  pendingConfirmations: number;
}

// Build 7×12 weekly occupancy matrix
// (Mon–Sun, lunch + dinner service hours, smoother than random)
const occupancyWeek: number[][] = [
  // Lunes
  [42, 68, 91, 84, 28, 12, 35, 76, 95, 88, 64, 22],
  // Martes
  [38, 62, 88, 80, 24, 10, 32, 72, 93, 86, 60, 20],
  // Miércoles
  [44, 70, 92, 88, 30, 14, 38, 80, 97, 91, 68, 26],
  // Jueves
  [50, 76, 94, 90, 34, 16, 44, 86, 99, 94, 74, 32],
  // Viernes
  [58, 84, 98, 95, 42, 22, 56, 95, 100, 99, 88, 60],
  // Sábado
  [62, 88, 99, 97, 48, 26, 60, 98, 100, 100, 92, 72],
  // Domingo
  [56, 82, 96, 92, 40, 18, 48, 90, 98, 95, 80, 54],
];

const revenueTrend: RevenuePoint[] = [
  { month: "Ene", revenue: 38200 },
  { month: "Feb", revenue: 41800 },
  { month: "Mar", revenue: 44600 },
  { month: "Abr", revenue: 47200 },
  { month: "May", revenue: 49800 },
  { month: "Jun", revenue: 52400 },
  { month: "Jul", revenue: 58200 },
  { month: "Ago", revenue: 60900 },
  { month: "Sep", revenue: 55600 },
  { month: "Oct", revenue: 57800 },
  { month: "Nov", revenue: 61400, forecast: 61400 },
  { month: "Dic", revenue: 0,     forecast: 65800 },
];

export const MOCK_METRICS: MockMetrics = {
  reservationsManaged: 127438,
  activeCustomers: 6532,
  avgRating: 4.9,
  noShowReduction: 98,

  occupancyWeek,
  revenueTrend,

  todayReservations: 47,
  todayRevenue: 4100,
  todayOccupancy: 78,
  todayTicketAvg: 89,
  todayNoShows: 3,
  vipArrivals: 8,
  pendingConfirmations: 17,
};
