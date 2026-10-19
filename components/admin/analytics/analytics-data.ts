export type Range = 'Week' | '30d' | '60d' | '90d' | '1y'

export interface Point {
  label: string
  dateRange?: string
  fullLabel?: string
  gmv: number
  orders: number
}

export interface RangeMetricData {
  range: Range
  periodLabel: string
  dateDescription: string
  grossSales: number
  netSales: number
  cancelledGmv: number
  totalOrders: number
  validOrdersCount: number
  cancelledOrdersCount: number
  avgOrderValue: number
  // Fulfillment metrics (strictly reconciled)
  pickupOrdersCount: number
  shippingOrdersCount: number
  pickupSales: number
  shippingSales: number
  pickupSalesPct: number
  shippingSalesPct: number
  pickupCountPct: number
  shippingCountPct: number
  pickupAov: number
  shippingAov: number
  // Seller metrics
  topSeller: {
    id: string
    name: string
    periodSales: number
    allTimeSales: number
    ordersCount: number
    plan: string
  }
}

// Trend series strictly reconciled with period sales and platform order aggregation
export const SERIES: Record<Range, Point[]> = {
  'Week': [
    { label: 'Mon', dateRange: 'Aug 10', fullLabel: 'Mon (Aug 10)', gmv: 560.00, orders: 1 },
    { label: 'Tue', dateRange: 'Aug 11', fullLabel: 'Tue (Aug 11)', gmv: 630.60, orders: 2 },
    { label: 'Wed', dateRange: 'Aug 12', fullLabel: 'Wed (Aug 12)', gmv: 389.75, orders: 1 },
    { label: 'Thu', dateRange: 'Aug 13', fullLabel: 'Thu (Aug 13)', gmv: 970.40, orders: 2 },
    { label: 'Fri', dateRange: 'Aug 14', fullLabel: 'Fri (Aug 14)', gmv: 1137.40, orders: 2 },
    { label: 'Sat', dateRange: 'Aug 15', fullLabel: 'Sat (Aug 15)', gmv: 1202.00, orders: 2 },
    { label: 'Sun', dateRange: 'Aug 16', fullLabel: 'Sun (Aug 16)', gmv: 1381.00, orders: 3 },
  ],
  '30d': [
    { label: 'Wk 1', dateRange: 'Jul 21 – 27', fullLabel: 'Wk 1 (Jul 21 – 27)', gmv: 24200.00, orders: 48 },
    { label: 'Wk 2', dateRange: 'Jul 28 – Aug 3', fullLabel: 'Wk 2 (Jul 28 – Aug 3)', gmv: 25900.00, orders: 52 },
    { label: 'Wk 3', dateRange: 'Aug 4 – 10', fullLabel: 'Wk 3 (Aug 4 – 10)', gmv: 25100.00, orders: 50 },
    { label: 'Wk 4', dateRange: 'Aug 11 – 17', fullLabel: 'Wk 4 (Aug 11 – 17)', gmv: 28600.00, orders: 58 },
  ],
  '60d': [
    { label: 'Wk 1-2', dateRange: 'Jul 1 – 14', fullLabel: 'Jul 1 – 14', gmv: 42100.00, orders: 84 },
    { label: 'Wk 3-4', dateRange: 'Jul 15 – 28', fullLabel: 'Jul 15 – 28', gmv: 48500.00, orders: 96 },
    { label: 'Wk 5-6', dateRange: 'Jul 29 – Aug 11', fullLabel: 'Jul 29 – Aug 11', gmv: 52400.00, orders: 105 },
    { label: 'Wk 7-8', dateRange: 'Aug 12 – 25', fullLabel: 'Aug 12 – 25', gmv: 56000.00, orders: 112 },
  ],
  '90d': [
    { label: 'Jul', dateRange: 'July 2026', fullLabel: 'July 2026', gmv: 83000.00, orders: 168 },
    { label: 'Aug', dateRange: 'August 2026', fullLabel: 'August 2026', gmv: 91000.00, orders: 184 },
    { label: 'Sep', dateRange: 'September 2026', fullLabel: 'September 2026', gmv: 108000.00, orders: 218 },
  ],
  '1y': [
    { label: 'Oct', dateRange: 'Oct 2025', fullLabel: 'Oct 2025', gmv: 18000.00, orders: 36 },
    { label: 'Nov', dateRange: 'Nov 2025', fullLabel: 'Nov 2025', gmv: 23000.00, orders: 46 },
    { label: 'Dec', dateRange: 'Dec 2025', fullLabel: 'Dec 2025', gmv: 31000.00, orders: 62 },
    { label: 'Jan', dateRange: 'Jan 2026', fullLabel: 'Jan 2026', gmv: 27000.00, orders: 54 },
    { label: 'Feb', dateRange: 'Feb 2026', fullLabel: 'Feb 2026', gmv: 32000.00, orders: 64 },
    { label: 'Mar', dateRange: 'Mar 2026', fullLabel: 'Mar 2026', gmv: 39000.00, orders: 78 },
    { label: 'Apr', dateRange: 'Apr 2026', fullLabel: 'Apr 2026', gmv: 48000.00, orders: 96 },
    { label: 'May', dateRange: 'May 2026', fullLabel: 'May 2026', gmv: 62000.00, orders: 124 },
    { label: 'Jun', dateRange: 'Jun 2026', fullLabel: 'Jun 2026', gmv: 70000.00, orders: 140 },
    { label: 'Jul', dateRange: 'Jul 2026', fullLabel: 'Jul 2026', gmv: 83000.00, orders: 168 },
    { label: 'Aug', dateRange: 'Aug 2026', fullLabel: 'Aug 2026', gmv: 91000.00, orders: 184 },
    { label: 'Sep', dateRange: 'Sep 2026', fullLabel: 'Sep 2026', gmv: 108000.00, orders: 218 },
  ],
}

// Reconciled range metrics for seamless multi-filter reporting
export const RANGE_METRICS: Record<Range, RangeMetricData> = {
  'Week': {
    range: 'Week',
    periodLabel: 'This Week',
    dateDescription: 'Aug 10 – Aug 16, 2026',
    grossSales: 6660.90,
    netSales: 6271.15,
    cancelledGmv: 389.75,
    totalOrders: 14,
    validOrdersCount: 13,
    cancelledOrdersCount: 1,
    avgOrderValue: 482.40,
    pickupOrdersCount: 4,
    shippingOrdersCount: 9,
    pickupSales: 1794.75,
    shippingSales: 4476.40,
    pickupSalesPct: 29,
    shippingSalesPct: 71,
    pickupCountPct: 31,
    shippingCountPct: 69,
    pickupAov: 448.69,
    shippingAov: 497.38,
    topSeller: {
      id: 'v-03',
      name: 'Root & Reign',
      periodSales: 2569.00,
      allTimeSales: 214600.00,
      ordersCount: 5,
      plan: 'Pro',
    },
  },
  '30d': {
    range: '30d',
    periodLabel: 'Last 30 Days',
    dateDescription: 'Jul 21 – Aug 17, 2026',
    grossSales: 107450.00,
    netSales: 103800.00,
    cancelledGmv: 3650.00,
    totalOrders: 215,
    validOrdersCount: 208,
    cancelledOrdersCount: 7,
    avgOrderValue: 499.04,
    pickupOrdersCount: 64,
    shippingOrdersCount: 144,
    pickupSales: 29680.00,
    shippingSales: 74120.00,
    pickupSalesPct: 29,
    shippingSalesPct: 71,
    pickupCountPct: 31,
    shippingCountPct: 69,
    pickupAov: 463.75,
    shippingAov: 514.72,
    topSeller: {
      id: 'v-03',
      name: 'Root & Reign',
      periodSales: 42600.00,
      allTimeSales: 214600.00,
      ordersCount: 84,
      plan: 'Pro',
    },
  },
  '60d': {
    range: '60d',
    periodLabel: 'Last 60 Days',
    dateDescription: 'Jul 1 – Aug 25, 2026',
    grossSales: 205800.00,
    netSales: 199000.00,
    cancelledGmv: 6800.00,
    totalOrders: 409,
    validOrdersCount: 397,
    cancelledOrdersCount: 12,
    avgOrderValue: 501.26,
    pickupOrdersCount: 123,
    shippingOrdersCount: 274,
    pickupSales: 56914.00,
    shippingSales: 142086.00,
    pickupSalesPct: 29,
    shippingSalesPct: 71,
    pickupCountPct: 31,
    shippingCountPct: 69,
    pickupAov: 462.72,
    shippingAov: 518.56,
    topSeller: {
      id: 'v-03',
      name: 'Root & Reign',
      periodSales: 81590.00,
      allTimeSales: 214600.00,
      ordersCount: 163,
      plan: 'Pro',
    },
  },
  '90d': {
    range: '90d',
    periodLabel: 'Last 90 Days',
    dateDescription: 'Jul 1 – Sep 30, 2026',
    grossSales: 291500.00,
    netSales: 282000.00,
    cancelledGmv: 9500.00,
    totalOrders: 588,
    validOrdersCount: 570,
    cancelledOrdersCount: 18,
    avgOrderValue: 494.74,
    pickupOrdersCount: 177,
    shippingOrdersCount: 393,
    pickupSales: 81780.00,
    shippingSales: 200220.00,
    pickupSalesPct: 29,
    shippingSalesPct: 71,
    pickupCountPct: 31,
    shippingCountPct: 69,
    pickupAov: 462.03,
    shippingAov: 509.47,
    topSeller: {
      id: 'v-03',
      name: 'Root & Reign',
      periodSales: 115800.00,
      allTimeSales: 214600.00,
      ordersCount: 234,
      plan: 'Pro',
    },
  },
  '1y': {
    range: '1y',
    periodLabel: 'Trailing 12 Months',
    dateDescription: 'Oct 2025 – Sep 2026',
    grossSales: 654200.00,
    netSales: 632000.00,
    cancelledGmv: 22200.00,
    totalOrders: 1312,
    validOrdersCount: 1270,
    cancelledOrdersCount: 42,
    avgOrderValue: 497.64,
    pickupOrdersCount: 394,
    shippingOrdersCount: 876,
    pickupSales: 183280.00,
    shippingSales: 448720.00,
    pickupSalesPct: 29,
    shippingSalesPct: 71,
    pickupCountPct: 31,
    shippingCountPct: 69,
    pickupAov: 465.18,
    shippingAov: 512.24,
    topSeller: {
      id: 'v-03',
      name: 'Root & Reign',
      periodSales: 214600.00,
      allTimeSales: 214600.00,
      ordersCount: 432,
      plan: 'Pro',
    },
  },
}

export const TEXTURES = [
  { label: 'Straight', pct: 38 },
  { label: 'Wavy', pct: 27 },
  { label: 'Curly', pct: 19 },
  { label: 'Kinky', pct: 16 },
]

export const INK = '#0C090E'
export const TAN = '#C4A887'
export const GRID = '#E6DEDA'
export const TICK = { fontSize: 11, fill: '#6B625F' }

export const kFormat = (v: number) => {
  if (v === 0) return '$0'
  if (v < 1000) return `$${v}`
  return `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
}

// Rounded axis ceiling with ~10% headroom, split into four even steps.
export function axis(max: number, unit: number) {
  const safeMax = Math.max(max, 10)
  const top = Math.ceil((safeMax * 1.1) / unit) * unit
  return { domain: [0, top] as [number, number], ticks: [0, 1, 2, 3, 4].map(i => (top / 4) * i) }
}
