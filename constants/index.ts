// ── Cart & Shipping ───────────────────────────────────────────────────────────
export const FREE_SHIPPING_THRESHOLD = 5_000_000
export const SHIPPING_COST = 50_000

// ── LocalStorage Keys ─────────────────────────────────────────────────────────
export const LOCAL_STORAGE_KEYS = {
  CART: 'lumiere_cart',
  WISHLIST: 'lumiere_wishlist',
  USER: 'currentUser',
  TOKEN: 'lumiere_token',
} as const

// ── Routing ───────────────────────────────────────────────────────────────────
export const VALID_PAGES = [
  'home',
  'shop',
  'categories',
  'about',
  'contact',
  'account',
  'wishlist',
  'admin',
  'login',
  'register',
  'forgot-password',
  'reset-password',
] as const

// ── API ───────────────────────────────────────────────────────────────────────
export const API_BASE = '/api'

// ── Formatting ────────────────────────────────────────────────────────────────
export const CURRENCY_LOCALE = 'id-ID'
export const DATE_LOCALE = 'en-GB'
