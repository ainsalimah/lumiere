'use client'
import { useEffect, useState, type FormEvent } from 'react'
import type { CartItem, AuthUser } from '@/types'
import { apiClient } from '@/services/apiClient'
import { formatMoney, PAYMENT_METHOD, SHIPPING_NOTE } from '@/lib/store'
import Dialog from './Dialog'
import Icon from './Icon'

interface CheckoutModalProps { open: boolean; onClose: () => void; items: CartItem[]; onOrderComplete: () => void; user: AuthUser | null; setCurrentUser: (user: AuthUser | null) => void }
export default function CheckoutModal({ open, onClose, items, onOrderComplete, user, setCurrentUser }: CheckoutModalProps) {
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', zip: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ id: string; total: number } | null>(null)
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0)
  useEffect(() => {
    if (!open) return
    let cancelled = false
    setResult(null); setError(''); setForm({ name: user?.name || '', phone: user?.phone || '', address: '', city: '', zip: '' })
    if (user) apiClient.users.getAddresses(user.id).then(addresses => {
      if (cancelled) return
      const a = addresses.find(a => a.isDefault) || addresses[0]
      if (a) setForm({ name: a.name, phone: a.phone, address: a.street, city: a.city, zip: a.zip })
    }).catch(() => {})
    return () => { cancelled = true }
  }, [open, user?.id])
  if (!open) return null
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    if (!user) { setError('Masuk ke akun terlebih dahulu untuk mengirim pesanan.'); return }
    if (!items.length) { setError('Keranjang masih kosong.'); return }
    setLoading(true)
    try {
      const data = await apiClient.orders.create({ customerName: form.name.trim(), email: user.email, phone: form.phone.trim(), address: `${form.address.trim()}, ${form.city.trim()}, ${form.zip.trim()}`, total: subtotal, paymentMethod: PAYMENT_METHOD, items: items.map(item => ({ productId: item.product.id, qty: item.qty, color: item.selectedColor })) })
      setResult({ id: data.id, total: data.total }); setCurrentUser({ ...user, phone: form.phone.trim() })
    } catch (e) { setError(e instanceof Error ? e.message : 'Pesanan belum terkirim. Coba lagi.') }
    finally { setLoading(false) }
  }
  return <Dialog title={result ? 'Permintaan pesanan terkirim' : 'Kirim permintaan pesanan'} onClose={result ? onOrderComplete : onClose} busy={loading}>
    {result ? <><div className="dialog-body text-center"><span className="w-16 h-16 rounded-full bg-[#e9ede3] inline-flex items-center justify-center mb-5"><Icon name="check" width="28" /></span><h3 className="display text-3xl">Tinggal konfirmasi bersama pemilik.</h3><p className="text-sm text-[#69765f] leading-7 mt-4">Pesanan {result.id} sudah tersimpan. Pemilik dapat menghubungimu melalui nomor telepon yang kamu isi.</p><div className="notice mt-5 text-left"><p className="font-semibold">Nilai barang: {formatMoney(result.total)}</p><p className="mt-2">{SHIPPING_NOTE} Belum ada pembayaran yang dilakukan melalui website.</p></div><p className="field-hint mt-4">Pantau statusnya melalui Akun → Pesanan.</p></div><div className="dialog-actions"><button className="store-button" onClick={onOrderComplete}>Selesai <Icon name="check" width="16" /></button></div></> : <form onSubmit={submit}>
      <fieldset disabled={loading} className="dialog-body space-y-5"><p className="notice">Pesanan akan menunggu konfirmasi pemilik. Jangan melakukan pembayaran sebelum ketersediaan barang, ongkir, dan jadwal disepakati.</p>
        <div className="space-y-3 border-b border-[#e3e5dc] pb-5">{items.map((item, i) => <div key={i} className="flex gap-3 items-center"><img src={item.product.img} alt="" className="w-12 h-12 rounded-lg object-cover" /><div className="flex-1 min-w-0"><p className="text-sm truncate">{item.product.name}</p><p className="field-hint">{item.qty} unit · {item.selectedColor}</p></div><strong className="text-xs shrink-0">{formatMoney(item.product.price * item.qty)}</strong></div>)}<div className="flex justify-between pt-3 text-sm"><span>Nilai barang</span><strong>{formatMoney(subtotal)}</strong></div><p className="field-hint">Belum termasuk biaya pengiriman dan perakitan.</p></div>
        <div className="grid sm:grid-cols-2 gap-4"><div><label htmlFor="checkout-name" className="field-label">Nama penerima *</label><input id="checkout-name" className="field" required minLength={2} maxLength={100} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} autoComplete="name" /></div><div><label htmlFor="checkout-phone" className="field-label">Nomor telepon / WhatsApp *</label><input id="checkout-phone" className="field" type="tel" required minLength={8} maxLength={20} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} autoComplete="tel" placeholder="08…" /></div></div>
        <div><label htmlFor="checkout-address" className="field-label">Alamat lengkap *</label><textarea id="checkout-address" className="field min-h-24" required minLength={5} maxLength={700} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} autoComplete="street-address" placeholder="Jalan, nomor rumah, kelurahan, dan kecamatan" /></div>
        <div className="grid sm:grid-cols-2 gap-4"><div><label htmlFor="checkout-city" className="field-label">Kota dan provinsi *</label><input id="checkout-city" className="field" required minLength={2} maxLength={100} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} autoComplete="address-level2" /></div><div><label htmlFor="checkout-zip" className="field-label">Kode pos *</label><input id="checkout-zip" className="field" required inputMode="numeric" pattern="[0-9]{5}" value={form.zip} onChange={e => setForm(p => ({ ...p, zip: e.target.value }))} autoComplete="postal-code" /></div></div><p className="field-hint">Data penerima hanya digunakan untuk menangani pesanan dan pengiriman.</p>
        {error && <p className="notice error" role="alert">{error}</p>}
      </fieldset><div className="dialog-actions"><button type="button" className="store-button secondary" onClick={onClose} disabled={loading}>Kembali</button><button className="store-button" disabled={loading || !items.length}>{loading ? 'Mengirim…' : 'Kirim pesanan ke pemilik'}<Icon name="arrow" width="16" /></button></div>
    </form>}
  </Dialog>
}
