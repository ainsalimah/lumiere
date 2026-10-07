export const PAYMENT_METHOD = 'Konfirmasi pemilik'
export const SHIPPING_NOTE = 'Ongkir dan jadwal pengiriman dikonfirmasi pemilik sebelum pembayaran.'
export const formatMoney = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
export function productPrice(originalPrice: number, discount: number): number { return Math.round(originalPrice * (1 - discount / 100)) }
export const ORDER_LABELS: Record<string, string> = { Accepted: 'Menunggu konfirmasi', Processing: 'Diproses', 'On the Way': 'Dikirim', Delivered: 'Selesai', Cancelled: 'Dibatalkan' }
