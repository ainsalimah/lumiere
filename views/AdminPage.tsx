'use client'
import { useContext, useEffect, useMemo, useState } from 'react'
import type { Page, Product, Order } from '@/types'
import type { CreateProductDTO } from '@/services/ProductService'
import { ProductsContext, ProductsStatusContext, useRefreshProducts } from '@/context'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/context/ToastContext'
import { apiClient } from '@/services/apiClient'
import { formatCategory, formatColor } from '@/constants'
import { formatMoney, ORDER_LABELS, SHIPPING_NOTE } from '@/lib/store'
import ProductEditor from '@/components/ProductEditor'
import Dialog from '@/components/Dialog'
import Icon from '@/components/Icon'
import LogoutConfirmModal from '@/components/LogoutConfirmModal'

type Tab = 'dashboard' | 'products' | 'orders' | 'customers'
interface Customer { name: string; email: string; orders: number; spent: number; joined: string; phone: string }
export const ORDER_STATUS_LABELS = ORDER_LABELS
const navigation = [{ key: 'dashboard' as Tab, label: 'Ringkasan', icon: 'grid' as const }, { key: 'products' as Tab, label: 'Produk saya', icon: 'box' as const }, { key: 'orders' as Tab, label: 'Pesanan', icon: 'orders' as const }, { key: 'customers' as Tab, label: 'Pelanggan', icon: 'users' as const }]
const labels = { dashboard: 'Ringkasan toko', products: 'Produk saya', orders: 'Kelola pesanan', customers: 'Pelanggan toko' }
const NEXT_ORDER_ACTION: Partial<Record<Order['status'], { status: Order['status']; label: string; description: string }>> = {
  Accepted: { status: 'Processing', label: 'Mulai diproses', description: 'Pastikan ongkir, jadwal, dan pembayaran sudah disepakati dengan pelanggan.' },
  Processing: { status: 'On the Way', label: 'Tandai dikirim', description: 'Gunakan setelah barang diserahkan ke kurir atau mulai diantar.' },
  'On the Way': { status: 'Delivered', label: 'Selesaikan pesanan', description: 'Gunakan setelah pelanggan menerima pesanan.' },
}
function Status({ status }: { status: string }) { return <span className={`status-pill ${status.replaceAll(' ', '-')}`}>{ORDER_LABELS[status] || status}</span> }
async function mutate(path: string, method: string, body?: unknown) {
  const res = await fetch(`/api${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('lumiere_token') || ''}` }, ...(body ? { body: JSON.stringify(body) } : {}) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Perubahan belum tersimpan. Coba lagi.')
  return data
}

function OrderDetails({ order, onClose, onUpdate, onOffer }: { order: Order; onClose: () => void; onUpdate: (status: Order['status']) => Promise<void>; onOffer: (data: { shipping: number; delivery: string; note: string }) => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [offer, setOffer] = useState({ shipping: String(order.offerShipping || 0), delivery: order.offerDelivery || '', note: order.offerNote || '' })
  const nextAction = NEXT_ORDER_ACTION[order.status]
  const update = async (nextStatus: Order['status']) => {
    setBusy(true); setError('')
    try { await onUpdate(nextStatus); onClose() }
    catch (e) { setError(e instanceof Error ? e.message : 'Gagal memperbarui status.') }
    finally { setBusy(false) }
  }
  return <Dialog title="Detail pesanan" onClose={onClose} busy={busy}>
    <div className="dialog-body space-y-5"><div className="flex items-center justify-between gap-4"><span className="text-sm font-mono">{order.id}</span><Status status={order.status} /></div><div className="grid gap-5 sm:grid-cols-2"><div><p className="eyebrow mb-2">Pelanggan</p><p className="font-semibold">{order.customer}</p><p className="break-all text-sm text-[#7d7168]">{order.email}</p>{order.phone && <a className="text-link text-xs" href={`tel:${order.phone.replace(/[^+\d]/g, '')}`}>{order.phone}</a>}</div><div><p className="eyebrow mb-2">Alamat pengiriman</p><p className="text-sm leading-6 text-[#7d7168]">{order.address}</p></div></div>
      <div className="space-y-3 border-y border-[#e8e3dc] py-4">{order.itemDetails?.map((item, i) => <div key={i} className="flex items-center gap-3"><img src={item.img || '/images/products/product-1.jpg'} alt="" className="h-12 w-12 rounded-lg object-cover" /><div><p className="text-sm font-medium">{item.productName}</p><p className="text-xs text-[#7d7168]">{item.qty} unit · {formatColor(item.color)}</p></div></div>)}</div><div className="flex justify-between text-sm"><span>Nilai barang</span><strong>{formatMoney(order.total)}</strong></div><p className="notice">{SHIPPING_NOTE} Status pesanan tidak membuktikan pembayaran telah diterima.</p>
      {order.status === 'Accepted' && <div className="rounded-xl border border-[#ded3c5] bg-[#f0eae3] p-4"><p className="font-semibold text-sm">{order.offerSentAt ? 'Perbarui penawaran pemilik' : 'Buat penawaran untuk pelanggan'}</p><p className="mt-1 text-xs leading-5 text-[#7d7168]">Pelanggan akan melihat ongkir, estimasi, dan catatan ini di akun mereka sebelum menyetujui pesanan.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><div><label className="field-label">Ongkir (Rp)</label><input className="field" type="number" min="0" value={offer.shipping} onChange={e => setOffer(p => ({ ...p, shipping: e.target.value }))} /></div><div><label className="field-label">Estimasi pengiriman</label><input className="field" placeholder="Contoh: 3-5 hari kerja" value={offer.delivery} onChange={e => setOffer(p => ({ ...p, delivery: e.target.value }))} /></div></div><div className="mt-3"><label className="field-label">Catatan untuk pelanggan</label><textarea className="field min-h-20" maxLength={1000} value={offer.note} onChange={e => setOffer(p => ({ ...p, note: e.target.value }))} placeholder="Contoh: Pengiriman dilakukan setelah pembayaran dikonfirmasi." /></div><p className="mt-3 text-sm">Total yang akan dilihat pelanggan: <strong>{formatMoney(order.total + (Number(offer.shipping) || 0))}</strong></p><div className="mt-4 flex flex-wrap gap-2"><button className="store-button min-h-10 px-4 text-xs" disabled={busy || !offer.delivery.trim()} onClick={async () => { setBusy(true); setError(''); try { await onOffer({ shipping: Number(offer.shipping) || 0, delivery: offer.delivery.trim(), note: offer.note.trim() }); onClose() } catch (e) { setError(e instanceof Error ? e.message : 'Penawaran belum tersimpan.') } finally { setBusy(false) } }}>{busy ? 'Menyimpan…' : 'Simpan penawaran'}</button>{order.phone && order.offerSentAt && <a className="store-button secondary min-h-10 px-4 text-xs" target="_blank" rel="noreferrer" href={`https://wa.me/${order.phone.replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(`Halo ${order.customer}, penawaran untuk pesanan ${order.id} sudah siap. Total penawaran ${formatMoney(order.total + (order.offerShipping || 0))}. Silakan lihat dan setujui di akun Lumiere: ${typeof window !== 'undefined' ? `${window.location.origin}/account` : ''}`)}`}>Kirim notifikasi WhatsApp</a>}</div></div>}{nextAction && order.status !== 'Accepted' && <div className="rounded-xl border border-[#ded3c5] bg-[#f0eae3] p-4"><p className="font-semibold text-sm">Langkah berikutnya: {nextAction.label}</p><p className="mt-1 text-xs leading-5 text-[#7d7168]">{nextAction.description}</p></div>}{error && <p className="notice error" role="alert">{error}</p>}
    </div><div className="dialog-actions"><button className="store-button secondary" onClick={onClose} disabled={busy}>Tutup</button>{order.status === 'Accepted' || order.status === 'Processing' ? <button className="store-button secondary" disabled={busy} onClick={() => update('Cancelled')}>Batalkan pesanan</button> : null}{nextAction && <button className="store-button" disabled={busy} onClick={() => update(nextAction.status)}>{busy ? 'Menyimpan…' : nextAction.label}</button>}</div>
  </Dialog>
}

export default function AdminPage({ navigate, onLogout }: { navigate: (page: Page) => void; onLogout: () => void }) {
  const products = useContext(ProductsContext)
  const productsState = useContext(ProductsStatusContext)
  const refreshProducts = useRefreshProducts()
  const { currentUser } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [menu, setMenu] = useState(false)
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)')
    const sync = () => setMobile(media.matches)
    sync(); media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])
  useEffect(() => {
    if (!menu || !mobile) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false) }
    document.addEventListener('keydown', escape)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', escape) }
  }, [menu, mobile])
  const [logout, setLogout] = useState(false)
  const [editor, setEditor] = useState<Product | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [availability, setAvailability] = useState('All')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)
  const load = async () => {
    setLoading(true); setError('')
    try {
      const [orderData, customerData] = await Promise.all([apiClient.orders.getAdminOrders(), apiClient.customers.getAll()])
      if (!Array.isArray(orderData) || !Array.isArray(customerData)) throw new Error('Data toko tidak dapat dimuat.')
      setOrders(orderData); setCustomers(customerData as Customer[])
    } catch (e) { setError(e instanceof Error ? e.message : 'Tidak dapat terhubung. Coba muat ulang.') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const switchTab = (next: Tab) => { setTab(next); setMenu(false); setQuery(''); setPage(1) }
  const q = query.trim().toLowerCase()
  const filteredProducts = products.filter(p => (!q || `${p.name} ${p.subcategory}`.toLowerCase().includes(q)) && (category === 'All' || p.category === category) && (availability === 'All' || p.inStock === (availability === 'available'))).slice().sort((a, b) => b.id - a.id)
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / 10))
  const currentPage = Math.min(page, totalPages)
  const filteredOrders = orders.filter(o => (!q || `${o.id} ${o.customer} ${o.email}`.toLowerCase().includes(q)) && (status === 'All' || o.status === status))
  const pending = orders.filter(o => o.status === 'Accepted')
  const available = products.filter(p => p.inStock).length
  const monthly = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - 5 + i)
    const matching = orders.filter(o => { const d = new Date(o.createdAt || o.date); return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && o.status !== 'Cancelled' })
    return { label: date.toLocaleDateString('id-ID', { month: 'short' }), value: matching.length }
  }), [orders])
  const saveProduct = async (data: CreateProductDTO) => {
    await mutate(editor && editor !== 'new' ? `/products/${editor.id}` : '/products', editor && editor !== 'new' ? 'PUT' : 'POST', data)
    await refreshProducts(); toast.success('Produk berhasil disimpan.'); setPage(1)
  }
  const orderList = (items: Order[]) => <div className="divide-y divide-[#e8e3dc]">{items.length ? items.map(o => <button key={o.id} onClick={() => setSelectedOrder(o)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#faf9f7]"><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold">{o.customer}</p>{o.status === 'Accepted' && <span className="rounded-full bg-[#f0eae3] px-2 py-0.5 text-[10px] font-semibold text-[#765037]">Perlu tindakan</span>}</div><p className="mt-1 text-[11px] text-[#7d7168]">{o.id} · {o.items} barang · {o.date}</p></div><div className="shrink-0 text-right"><p className="mb-1 text-sm font-semibold">{formatMoney(o.total)}</p><Status status={o.status} /></div></button>) : <div className="empty-state">Belum ada pesanan di sini.</div>}</div>

  return <div className="min-h-screen bg-[#faf9f7] text-[#2c2824] lg:flex">
    {menu && <button className="fixed inset-0 z-40 bg-[#2c2824]/60 lg:hidden" aria-label="Tutup navigasi" onClick={() => setMenu(false)} />}
    <aside inert={mobile && !menu} className={`fixed inset-y-0 left-0 z-40 flex w-[240px] shrink-0 flex-col bg-[#2c2824] text-white transition-transform lg:sticky lg:top-0 lg:h-screen ${menu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="flex items-center justify-between px-7 pb-7 pt-8"><div><p className="display text-3xl">Lumière<span className="text-[#c2b09f]">.</span></p><p className="mt-2 text-[9px] uppercase tracking-[.22em] text-[#ded3c5]">Ruang kerja pemilik</p></div><button className="icon-button text-white lg:hidden" onClick={() => setMenu(false)} aria-label="Tutup navigasi"><Icon name="close" /></button></div>
      <div className="mb-5 mx-4 rounded-lg border border-[#615850] px-4 py-3"><p className="text-xs font-medium">Toko Lumière</p><p className="mt-1 text-[10px] text-[#ded3c5]">Satu toko · Dikelola pemilik</p></div>
      <nav className="space-y-1 px-3" aria-label="Navigasi pemilik">{navigation.map(n => <button key={n.key} onClick={() => switchTab(n.key)} aria-current={tab === n.key ? 'page' : undefined} className={`flex min-h-12 w-full items-center gap-3 rounded-lg px-4 text-left text-sm ${tab === n.key ? 'bg-[#f0eae3] text-[#2c2824] font-semibold' : 'text-[#ded3c5] hover:bg-[#46403a]'}`}><Icon name={n.icon} width="18" /><span className="flex-1">{n.label}</span>{n.key === 'orders' && pending.length > 0 && <span className="rounded bg-[#c2b09f] px-2 py-0.5 text-[10px] text-[#2c2824]">{pending.length}</span>}</button>)}</nav>
      <div className="mt-auto space-y-1 p-4"><button className="flex min-h-12 w-full items-center gap-3 px-4 text-xs text-[#ded3c5]" onClick={() => navigate('home')}><Icon name="external" width="17" /> Lihat website toko</button><button className="flex min-h-12 w-full items-center gap-3 px-4 text-xs text-[#ded3c5]" onClick={() => setLogout(true)}><Icon name="logout" width="17" /> Keluar dari akun</button><div className="mt-4 flex items-center gap-3 border-t border-[#615850] pt-5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0eae3] text-sm font-semibold text-[#2c2824]">{currentUser?.name?.[0] || 'P'}</span><div className="min-w-0"><p className="truncate text-xs">{currentUser?.name || 'Pemilik toko'}</p><p className="mt-1 text-[10px] text-[#ded3c5]">Pemilik</p></div></div></div>
    </aside>
    <div className="min-w-0 flex-1"><header className="flex items-center justify-between gap-3 border-b border-[#e8e3dc] bg-white px-5 py-4 sm:px-8"><div className="flex items-center gap-2"><button className="icon-button lg:hidden" aria-label="Buka navigasi" onClick={() => setMenu(true)}><Icon name="menu" /></button><p className="text-xs text-[#7d7168]">Dashboard <span className="mx-2 text-[#c2b09f]">/</span> <span className="font-medium text-[#2c2824]">{labels[tab]}</span></p></div><div className="flex items-center gap-2"><span className="hidden text-xs text-[#7d7168] sm:block">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}</span><button className="icon-button" disabled={loading} aria-label="Muat ulang data toko" onClick={() => { load(); refreshProducts().catch(() => {}) }}><Icon name="refresh" width="17" /></button></div></header>
      <main className="mx-auto max-w-[1500px] p-5 sm:p-8 lg:p-9"><div className="mb-7 flex flex-wrap items-center justify-between gap-5"><div><p className="eyebrow mb-3">{tab === 'dashboard' ? 'Prioritas toko hari ini' : 'Kelola toko dengan mudah'}</p><h1 className="display text-3xl sm:text-4xl">{labels[tab]}<span className="text-[#765037]">.</span></h1><p className="mt-3 text-sm text-[#7d7168]">{tab === 'dashboard' ? 'Mulai dari pesanan yang menunggu konfirmasi, lalu lanjutkan proses pengiriman.' : tab === 'products' ? 'Tambahkan barang milikmu, ubah detail, dan atur ketersediaannya.' : tab === 'orders' ? 'Buka pesanan untuk melihat langkah berikutnya yang perlu dilakukan.' : 'Informasi pelanggan dari akun dan pesanan toko.'}</p></div>{['dashboard', 'products'].includes(tab) && <button className="store-button" onClick={() => setEditor('new')}><Icon name="plus" width="17" /> Tambah produk</button>}</div>
        {(error || productsState.error) && <div className="notice error mb-6" role="alert">{error || productsState.error} <button className="underline font-semibold ml-2" onClick={() => { load(); refreshProducts().catch(() => {}) }}>Coba lagi</button></div>}
        {(loading || productsState.loading) && <p role="status" className="notice mb-6">Memuat data toko…</p>}
        {tab === 'dashboard' && <div className="space-y-6">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{[{ label: 'Produk tersedia', value: available, sub: `${products.length} produk dalam katalog`, icon: 'box' as const }, { label: 'Menunggu konfirmasi', value: pending.length, sub: 'Perlu ditindaklanjuti pemilik', icon: 'clock' as const }, { label: 'Pesanan diproses', value: orders.filter(o => ['Processing', 'On the Way'].includes(o.status)).length, sub: 'Sedang disiapkan atau dikirim', icon: 'orders' as const }, { label: 'Pelanggan', value: customers.length, sub: 'Terdaftar di toko ini', icon: 'users' as const }].map(s => <div key={s.label} className="owner-card p-5"><div className="flex items-center justify-between text-xs text-[#69765f]"><span>{s.label}</span><Icon name={s.icon} width="18" /></div><p className="text-[32px] font-semibold tracking-tight mt-4">{loading || productsState.loading || error || productsState.error ? '—' : s.value}</p><p className="text-[11px] text-[#69765f] mt-1">{s.sub}</p></div>)}</div>
          <div className="grid xl:grid-cols-[1.4fr_1fr] gap-6"><section className="owner-card"><div className="px-5 py-5 border-b border-[#e3e5dc] flex justify-between items-center gap-3"><div><h2 className="text-sm font-semibold">Aktivitas pesanan</h2><p className="text-xs text-[#69765f] mt-1">Jumlah pesanan aktif · 6 bulan terakhir</p></div><span className="status-pill">Data toko</span></div><div className="px-6 pt-7 pb-5"><div className="flex items-end justify-between gap-3 h-40" aria-label="Jumlah pesanan per bulan">{monthly.map((m, i) => <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-2"><span className="text-[10px] text-[#69765f]">{m.value}</span><div className={`w-full max-w-12 rounded-t-md ${i === 5 ? 'bg-[#9d5635]' : 'bg-[#b9c6a5]'}`} style={{ height: `${Math.max(2, (m.value / Math.max(...monthly.map(d => d.value), 1)) * 100)}px` }} /><span className="text-[10px] text-[#69765f]">{m.label}</span></div>)}</div><p className="text-xs text-[#69765f] border-t border-[#eef0e9] pt-4 mt-5">Nilai pesanan bukan pendapatan terbayar. Pembayaran dikonfirmasi di luar website.</p></div></section>
          <section className="owner-card bg-[#e9ede1] p-6"><p className="eyebrow mb-4">Langkah berikutnya</p><h2 className="display text-3xl">Tokomu, pilihanmu.</h2><p className="text-sm text-[#65705f] leading-6 mt-4">Mulai dengan foto yang jelas, ukuran produk, dan harga. Katalog akan tampil di website setelah produk disimpan.</p><button className="text-link mt-3" onClick={() => setEditor('new')}>Tambahkan barang milikmu <Icon name="arrow" width="16" /></button><div className="border-t border-[#cad3bf] pt-4 mt-4 text-xs text-[#65705f] flex justify-between"><span>Produk belum tersedia</span><button className="font-semibold underline" onClick={() => { switchTab('products'); setAvailability('unavailable') }}>{products.length - available} produk</button></div></section></div>
          <section className="owner-card"><div className="flex justify-between items-center gap-3 p-5 border-b border-[#e3e5dc]"><h2 className="text-sm font-semibold">Pesanan yang menunggu konfirmasi</h2><button className="text-link text-xs" onClick={() => { switchTab('orders'); setStatus('Accepted') }}>Lihat semua <Icon name="arrow" width="15" /></button></div>{orderList(pending.slice(0, 5))}</section>
        </div>}
        {tab === 'products' && <div className="space-y-5"><div className="flex flex-wrap gap-3"><label className="relative flex-1 min-w-[200px]"><span className="sr-only">Cari produk</span><input className="field" placeholder="Cari nama atau jenis produk…" value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} /></label><select aria-label="Filter kategori" className="field sm:w-40" value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}><option value="All">Semua kategori</option>{['Chair', 'Sofa', 'Table', 'Bundle'].map(c => <option key={c} value={c}>{formatCategory(c)}</option>)}</select><select aria-label="Filter ketersediaan" className="field sm:w-44" value={availability} onChange={e => { setAvailability(e.target.value); setPage(1) }}><option value="All">Semua ketersediaan</option><option value="available">Tersedia</option><option value="unavailable">Belum tersedia</option></select></div>
          <div className="owner-card"><div className="overflow-x-auto"><table className="owner-table"><thead><tr>{['Produk', 'Kategori', 'Harga jual', 'Ketersediaan', 'Kelola'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{filteredProducts.slice((currentPage - 1) * 10, currentPage * 10).map(p => <tr key={p.id}><td><div className="flex gap-3 items-center"><img src={p.img || '/images/products/product-1.jpg'} alt="" className="w-12 h-12 object-cover rounded-lg border border-[#eef0e9]" /><div className="max-w-[220px]"><p className="font-medium truncate">{p.name}</p><p className="text-xs text-[#69765f] mt-1">{p.subcategory} · #{p.id}</p></div></div></td><td className="text-[#69765f]">{formatCategory(p.category)}</td><td><strong className="font-medium">{formatMoney(p.price)}</strong>{p.discount > 0 && <p className="text-xs text-[#69765f] mt-1">Diskon {p.discount}%</p>}</td><td><span className={`status-pill ${p.inStock ? 'Delivered' : 'Cancelled'}`}>{p.inStock ? 'Tersedia' : 'Belum tersedia'}</span></td><td><div className="flex gap-1"><button className="icon-button" aria-label={`Ubah ${p.name}`} onClick={() => setEditor(p)}><Icon name="edit" width="17" /></button><button className="icon-button text-[#9d5635]" aria-label={`Hapus ${p.name}`} onClick={() => { setDeleteTarget(p); setDeleteError('') }}><Icon name="trash" width="17" /></button></div></td></tr>)}</tbody></table></div>{!filteredProducts.length && <div className="empty-state">{products.length ? 'Tidak ada produk yang sesuai. Coba ubah pencarian atau filter.' : 'Belum ada produk. Tambahkan barang pertama milikmu.'}</div>}<div className="flex flex-wrap gap-3 items-center justify-between px-5 py-4 border-t border-[#e3e5dc] text-xs text-[#69765f]"><span>{filteredProducts.length} produk · Halaman {currentPage} dari {totalPages}</span><div className="flex gap-2"><button className="store-button secondary text-xs" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Sebelumnya</button><button className="store-button secondary text-xs" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Berikutnya</button></div></div></div>
        </div>}
        {tab === 'orders' && <div className="space-y-5"><div className="flex flex-wrap gap-3"><input aria-label="Cari pesanan" className="field flex-1 min-w-[200px]" placeholder="Cari ID, nama, atau email pelanggan…" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Filter status pesanan" className="field sm:w-56" value={status} onChange={e => setStatus(e.target.value)}><option value="All">Semua status</option>{Object.entries(ORDER_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><div className="notice">Pesanan baru menunggu konfirmasi. Hubungi pelanggan untuk menyepakati ongkir, jadwal, dan pembayaran sebelum memilih “Diproses”.</div><section className="owner-card">{orderList(filteredOrders)}</section></div>}
        {tab === 'customers' && <div className="space-y-5"><input aria-label="Cari pelanggan" className="field max-w-md" placeholder="Cari nama, email, atau nomor telepon…" value={query} onChange={e => setQuery(e.target.value)} /><div className="owner-card overflow-x-auto"><table className="owner-table"><thead><tr>{['Pelanggan', 'Kontak', 'Pesanan', 'Nilai barang', 'Bergabung'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{customers.filter(c => !q || `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q)).map(c => <tr key={c.email}><td className="font-medium">{c.name}</td><td><p>{c.email}</p><p className="text-xs text-[#69765f] mt-1">{c.phone || 'Nomor belum diisi'}</p></td><td>{c.orders}</td><td>{formatMoney(c.spent)}</td><td className="text-[#69765f]">{c.joined}</td></tr>)}</tbody></table>{!customers.length && <div className="empty-state">Pelanggan akan muncul setelah membuat akun atau pesanan.</div>}</div></div>}
      </main>
    </div>
    {editor && <ProductEditor product={editor === 'new' ? undefined : editor} onSave={saveProduct} onClose={() => setEditor(null)} />}
    {deleteTarget && <Dialog title="Hapus produk?" onClose={() => setDeleteTarget(null)} busy={deleting}><div className="dialog-body"><p className="text-sm leading-6">Produk “{deleteTarget.name}” akan dihapus dari katalog. Jika produk pernah dipesan, ubah ketersediaannya agar riwayat pesanan tetap tersimpan.</p>{deleteError && <p className="notice error mt-4" role="alert">{deleteError}</p>}</div><div className="dialog-actions"><button className="store-button secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>Batal</button><button className="store-button bg-[#9d5635]" disabled={deleting} onClick={async () => { setDeleting(true); setDeleteError(''); try { await mutate(`/products/${deleteTarget.id}`, 'DELETE'); await refreshProducts(); setDeleteTarget(null); toast.success('Produk dihapus.'); } catch (e) { setDeleteError(e instanceof Error ? e.message : 'Gagal menghapus produk.') } finally { setDeleting(false) } }}>{deleting ? 'Menghapus…' : 'Hapus produk'}</button></div></Dialog>}
    {selectedOrder && <OrderDetails order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdate={async next => { await apiClient.adminOrders.updateStatus(selectedOrder.id, next); setOrders(p => p.map(o => o.id === selectedOrder.id ? { ...o, status: next as Order['status'] } : o)); toast.success('Status pesanan diperbarui.') }} onOffer={async offer => { const updated = await apiClient.adminOrders.createOffer(selectedOrder.id, offer); setOrders(p => p.map(o => o.id === selectedOrder.id ? { ...o, ...updated, offerShipping: offer.shipping, offerDelivery: offer.delivery, offerNote: offer.note, offerSentAt: new Date().toISOString() } : o)); toast.success('Penawaran sudah tersedia untuk pelanggan.') }} />}
    <LogoutConfirmModal open={logout} onClose={() => setLogout(false)} onConfirm={onLogout} />
  </div>
}
