'use client'
import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import Icon from '@/components/Icon'
export default function ContactPage() {
  const { currentUser } = useAuth()
  const [form, setForm] = useState({ name: '', subject: '', message: '' })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('lumiere_token') || ''}` }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Pesan belum terkirim.')
      setSent(true)
    } catch (e) { setError(e instanceof Error ? e.message : 'Pesan belum terkirim.') }
    finally { setBusy(false) }
  }
  return <div className="store-container py-12 sm:py-20"><div className="grid lg:grid-cols-[.7fr_1fr] gap-10 lg:gap-20"><div><p className="eyebrow mb-5">Hubungi pemilik</p><h1 className="display text-5xl text-[#283d33]">Mari bicarakan<br /><em className="text-[#9d5635]">ruangmu.</em></h1><p className="text-sm text-stone-700 leading-7 mt-6 max-w-sm">Tanyakan ukuran, bahan, ketersediaan, atau kebutuhan pengiriman. Pesan dari formulir ini dikirim langsung ke email pemilik toko.</p><div className="notice mt-7"><p className="font-semibold">Sudah membuat pesanan?</p><p className="mt-2">Cantumkan ID pesanan agar pemilik bisa membantu lebih mudah. Status pesanan tersedia di halaman akun.</p><Link href="/account" className="text-link text-xs mt-2">Buka pesanan saya <Icon name="arrow" width="16" /></Link></div></div><div className="owner-card p-6 sm:p-8">{sent ? <div className="py-10 text-center"><Icon name="check" className="mx-auto mb-4" width="32" /><h2 className="display text-3xl">Pesan sudah terkirim.</h2><p className="text-sm text-stone-700 mt-4 leading-7">Balasan pemilik akan dikirim ke email akunmu. Kamu dapat memeriksa kotak masuk secara berkala.</p><button className="store-button secondary mt-6" onClick={() => { setSent(false); setForm({ name: '', subject: '', message: '' }) }}>Tulis pesan lain</button></div> : <form onSubmit={submit} className="space-y-5"><h2 className="display text-3xl text-[#283d33]">Kirim pesan</h2>{!currentUser && <p className="notice">Silakan <Link href="/login" className="underline font-semibold">masuk ke akun</Link> sebelum mengirim pesan agar pemilik dapat membalas ke emailmu.</p>}<fieldset disabled={busy || !currentUser} className="space-y-5"><div><label htmlFor="contact-name" className="field-label">Nama *</label><input id="contact-name" className="field" required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div><div><label className="field-label">Email balasan</label><p className="text-sm text-stone-700">{currentUser?.email || 'Email akun setelah masuk'}</p></div><div><label htmlFor="contact-subject" className="field-label">Topik *</label><input id="contact-subject" className="field" required minLength={2} maxLength={120} value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Contoh: Ukuran kursi atau pesanan #LM…" /></div><div><label htmlFor="contact-message" className="field-label">Pesan *</label><textarea id="contact-message" className="field min-h-40" required minLength={10} maxLength={3000} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} /></div>{error && <p className="notice error" role="alert">{error}</p>}<button className="store-button" disabled={busy || !currentUser}>{busy ? 'Mengirim…' : 'Kirim ke pemilik'}<Icon name="arrow" width="16" /></button></fieldset></form>}</div></div></div>
}
