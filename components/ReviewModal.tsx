'use client'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Product } from '@/types'
import { apiClient } from '@/services/apiClient'
import { useRefreshProducts } from '@/context'
import Dialog from './Dialog'
interface Props { open: boolean; onClose: () => void; orderId: string; items: { product: Product; qty: number; color: string }[]; authorName: string }
export default function ReviewModal({ open, onClose, orderId, items, authorName }: Props) {
  const refresh = useRefreshProducts()
  const products = useMemo(() => Array.from(new Map(items.filter(i => i.product).map(i => [i.product.id, i.product])).values()), [items])
  const [step, setStep] = useState(0)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { if (open) { setStep(0); setRating(0); setTitle(''); setBody(''); setDone(false); setError('') } }, [open, orderId])
  if (!open || !products.length) return null
  const product = products[step]
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      await apiClient.reviews.create({ productId: product.id, orderId, authorName, rating, title, body })
      refresh().catch(() => {})
      if (step + 1 < products.length) { setStep(s => s + 1); setRating(0); setTitle(''); setBody('') } else setDone(true)
    } catch (e) { setError(e instanceof Error ? e.message : 'Ulasan belum tersimpan.') }
    finally { setBusy(false) }
  }
  return <Dialog title={done ? 'Terima kasih atas ulasanmu' : 'Tulis ulasan produk'} onClose={onClose} busy={busy}>{done ? <><div className="dialog-body"><p className="notice">Ulasan berhasil disimpan dan akan muncul di halaman produk.</p></div><div className="dialog-actions"><button className="store-button" onClick={onClose}>Selesai</button></div></> : <form onSubmit={submit}><fieldset disabled={busy} className="dialog-body space-y-5"><div className="flex gap-3 items-center"><img src={product.img} alt="" className="w-16 h-16 object-cover rounded-lg" /><div><p className="field-hint">Produk {step + 1} dari {products.length}</p><h3 className="font-semibold text-sm">{product.name}</h3></div></div><div><p className="field-label">Penilaian *</p><div className="flex gap-2" role="group" aria-label="Penilaian produk">{[1, 2, 3, 4, 5].map(r => <button key={r} type="button" aria-label={`${r} bintang`} aria-pressed={rating === r} className={`icon-button text-3xl ${r <= rating ? 'text-[#9d5635]' : 'text-stone-400'}`} onClick={() => setRating(r)}>★</button>)}</div></div><div><label htmlFor="review-title" className="field-label">Judul ulasan</label><input id="review-title" className="field" value={title} maxLength={150} onChange={e => setTitle(e.target.value)} /></div><div><label htmlFor="review-body" className="field-label">Ceritakan pengalamanmu</label><textarea id="review-body" className="field min-h-28" value={body} maxLength={1000} onChange={e => setBody(e.target.value)} /></div>{error && <p className="notice error" role="alert">{error}</p>}</fieldset><div className="dialog-actions"><button type="button" className="store-button secondary" disabled={busy} onClick={onClose}>Batal</button><button className="store-button" disabled={busy || !rating}>{busy ? 'Menyimpan…' : 'Simpan ulasan'}</button></div></form>}</Dialog>
}
