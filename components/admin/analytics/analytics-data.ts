export type Range = 'Week' | '30d' | '90d' | '1y'

export interface Point {
  label: string
  dateRange?: string
  fullLabel?: string
  gmv: number
  orders: number
}

// Trend series with date ranges next to week/day labels
export const SERIES: Record<Range, Point[]> = {
  'Week': [
    { label: 'Mon', dateRange: 'Aug 10', fullLabel: 'Mon (Aug 10)', gmv: 4200, orders: 28 },
    { label: 'Tue', dateRange: 'Aug 11', fullLabel: 'Tue (Aug 11)', gmv: 3900, orders: 25 },
    { label: 'Wed', dateRange: 'Aug 12', fullLabel: 'Wed (Aug 12)', gmv: 4800, orders: 32 },
    { label: 'Thu', dateRange: 'Aug 13', fullLabel: 'Thu (Aug 13)', gmv: 5100, orders: 35 },
    { label: 'Fri', dateRange: 'Aug 14', fullLabel: 'Fri (Aug 14)', gmv: 6400, orders: 42 },
    { label: 'Sat', dateRange: 'Aug 15', fullLabel: 'Sat (Aug 15)', gmv: 7200, orders: 49 },
    { label: 'Sun', dateRange: 'Aug 16', fullLabel: 'Sun (Aug 16)', gmv: 6100, orders: 39 },
  ],
  '30d': [
    { label: 'Wk 1', dateRange: 'Jul 21 – 27', fullLabel: 'Wk 1 (Jul 21 – 27)', gmv: 24200, orders: 158 },
    { label: 'Wk 2', dateRange: 'Jul 28 – Aug 3', fullLabel: 'Wk 2 (Jul 28 – Aug 3)', gmv: 25900, orders: 171 },
    { label: 'Wk 3', dateRange: 'Aug 4 – 10', fullLabel: 'Wk 3 (Aug 4 – 10)', gmv: 25100, orders: 166 },
    { label: 'Wk 4', dateRange: 'Aug 11 – 17', fullLabel: 'Wk 4 (Aug 11 – 17)', gmv: 28600, orders: 189 },
  ],
  '90d': [
    { label: 'Apr', gmv: 48000, orders: 300 },
    { label: 'May', gmv: 62000, orders: 390 },
    { label: 'Jun', gmv: 70000, orders: 460 },
    { label: 'Jul', gmv: 83000, orders: 540 },
    { label: 'Aug', gmv: 91000, orders: 610 },
    { label: 'Sep', gmv: 108000, orders: 710 },
  ],
  '1y': [
    { label: 'Oct', gmv: 18000, orders: 120 },
    { label: 'Nov', gmv: 23000, orders: 150 },
    { label: 'Dec', gmv: 31000, orders: 205 },
    { label: 'Jan', gmv: 27000, orders: 180 },
    { label: 'Feb', gmv: 32000, orders: 210 },
    { label: 'Mar', gmv: 39000, orders: 250 },
    { label: 'Apr', gmv: 48000, orders: 300 },
    { label: 'May', gmv: 62000, orders: 390 },
    { label: 'Jun', gmv: 70000, orders: 460 },
    { label: 'Jul', gmv: 83000, orders: 540 },
    { label: 'Aug', gmv: 91000, orders: 610 },
    { label: 'Sep', gmv: 108000, orders: 710 },
  ],
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
export const TICK = { fontSize: 12, fill: '#6B625F' }

export const kFormat = (v: number) => (v === 0 ? '$0' : `$${(v / 1000).toFixed(1)}k`)

// Rounded axis ceiling with ~10% headroom, split into four even steps.
export function axis(max: number, unit: number) {
  const top = Math.ceil((max * 1.1) / unit) * unit
  return { domain: [0, top] as [number, number], ticks: [0, 1, 2, 3, 4].map(i => (top / 4) * i) }
}
