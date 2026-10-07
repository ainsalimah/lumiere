import type { SVGProps } from 'react'
const paths = {
  arrow: 'M5 12h14M13 6l6 6-6 6', plus: 'M12 5v14M5 12h14', close: 'M6 6l12 12M18 6 6 18',
  bag: 'M5 7h14l1 14H4L5 7ZM9 7V5a3 3 0 0 1 6 0v2',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  box: 'M21 8l-9-5-9 5v9l9 5 9-5V8ZM3 8l9 5 9-5M12 13v9M7.5 5.5l9 5',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  orders: 'M8 5H5v16h14V5h-3M8 3h8v4H8zM8 12h8M8 16h5',
  users: 'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M17 3a4 4 0 0 1 0 8M22 21v-3a4 4 0 0 0-3-3.9',
  search: 'M21 21l-5-5M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16',
  check: 'M5 12l4 4L19 6', edit: 'M16 3l5 5L9 20l-6 1 1-6L16 3Z',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
  external: 'M15 3h6v6M10 14 21 3M11 3H3v18h18v-8',
  menu: 'M4 6h16M4 12h16M4 18h16', logout: 'M9 3H3v18h6M13 7l5 5-5 5M8 12h10',
  clock: 'M12 8v4l3 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20',
  image: 'M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5M8 7h.01',
  refresh: 'M20 7V3l-4 4M4 17v4l4-4M20 7a9 9 0 0 0-15-2M4 17a9 9 0 0 0 15 2',
} as const
export default function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]} /></svg>
}
