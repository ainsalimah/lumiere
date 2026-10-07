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
  'cart',
  'admin',
  'login',
  'register',
  'forgot-password',
  'reset-password',
] as const

// ── API ───────────────────────────────────────────────────────────────────────
export const API_BASE = '/api'
export const DEFAULT_PRODUCT_COLOR = 'Sesuai foto'

// ── Formatting ────────────────────────────────────────────────────────────────
export const CURRENCY_LOCALE = 'id-ID'
export const DATE_LOCALE = 'en-GB'

// ── Category & Filter Localization ───────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
  Chair: 'Kursi',
  Sofa: 'Sofa',
  Table: 'Meja',
  Bundle: 'Paket Bundel',
  Seating: 'Kursi',
  Storage: 'Penyimpanan',
  Lighting: 'Lampu & Penerangan',
  Decor: 'Dekorasi',
  Bed: 'Tempat Tidur',
  Chairs: 'Kursi',
  Sofas: 'Sofa',
  Tables: 'Meja',
  chair: 'Kursi',
  sofa: 'Sofa',
  table: 'Meja',
}

export const ROOM_LABELS: Record<string, string> = {
  'Living Room': 'Ruang Tamu',
  'Bedroom': 'Kamar Tidur',
  'Dining Room': 'Ruang Makan',
  'Office': 'Ruang Kerja',
  'Outdoor': 'Luar Ruangan',
}

export const COLOR_LABELS: Record<string, string> = {
  Natural: 'Alami',
  Beige: 'Krem',
  White: 'Putih',
  Grey: 'Abu-abu',
  Black: 'Hitam',
  Brown: 'Cokelat',
  Walnut: 'Walnut',
  Oak: 'Oak',
  Mixed: 'Kombinasi',
  'Sesuai foto': 'Sesuai foto',
}

export const SUBCATEGORY_LABELS: Record<string, string> = {
  'Lounge Chair': 'Kursi Santai',
  'Dining Chair': 'Kursi Makan',
  'Armchair': 'Kursi Berlengan',
  'Bar Stool': 'Kursi Bar',
  'Accent Chair': 'Kursi Aksen',
  'Rocking Chair': 'Kursi Goyang',
  'Office Chair': 'Kursi Kerja',
  'Club Chair': 'Kursi Klub',
  '3-Seater Sofa': 'Sofa 3 Dudukan',
  '2-Seater Loveseat': 'Sofa 2 Dudukan',
  'Corner Sectional': 'Sofa Sudut',
  'Chaise Lounge': 'Kursi Panjang',
  'Sleeper Sofa': 'Sofa Bed',
  'Modular Sofa': 'Sofa Modular',
  'Daybed': 'Daybed',
  'Dining Table': 'Meja Makan',
  'Coffee Table': 'Meja Kopi',
  'Side Table': 'Meja Samping',
  'Console Table': 'Meja Konsol',
  'Desk': 'Meja Kerja',
  'Nesting Tables': 'Meja Bersusun',
  'Bar Table': 'Meja Bar',
}

export function formatCategory(cat?: string | null): string {
  if (!cat) return ''
  return CATEGORY_LABELS[cat] || cat
}

export function formatRoom(room?: string | null): string {
  if (!room) return ''
  return ROOM_LABELS[room] || room
}

export function formatSubcategory(sub?: string | null): string {
  if (!sub) return ''
  return SUBCATEGORY_LABELS[sub] || sub
}

export function formatColor(color?: string | null): string {
  if (!color) return ''
  return COLOR_LABELS[color] || color
}
