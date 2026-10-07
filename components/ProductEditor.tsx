'use client'
import { useRef, useState, type FormEvent } from 'react'
import type { Product } from '@/types'
import type { CreateProductDTO } from '@/services/ProductService'
import { formatMoney, productPrice } from '@/lib/store'
import Dialog from './Dialog'
import Icon from './Icon'

async function compressImage(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Gunakan foto JPG, PNG, atau WebP.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Setiap foto maksimal 8 MB.')
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Foto tidak dapat diproses. Coba browser lain.')
    context.fillStyle = '#f8f6f1'; context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const result = canvas.toDataURL('image/jpeg', .78)
    if (result.length > 650000) throw new Error('Foto terlalu besar setelah diproses. Gunakan foto yang lebih kecil.')
    return result
  } finally { bitmap.close() }
}

export default function ProductEditor({ product, onSave, onClose }: { product?: Product; onSave: (data: CreateProductDTO) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState({ name: product?.name || '', category: product?.category || 'Chair', subcategory: product?.subcategory || '', description: product?.description || '', price: String(product?.originalPrice || ''), discount: String(product?.discount || 0), material: product?.material || 'Wood', room: product?.room || 'Living Room', colors: product?.colors.join(', ') || 'Oak', inStock: product?.inStock ?? true })
  const [images, setImages] = useState<string[]>(product ? [product.img, ...(product.gallery || [])].filter(Boolean) : [])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const update = (key: keyof typeof form, value: string | boolean) => setForm(p => ({ ...p, [key]: value }))
  const upload = async (files: FileList | null) => {
    if (!files) return
    setUploading(true); setError('')
    try {
      if (files.length + images.length > 5) throw new Error('Maksimal 5 foto. Hapus foto yang tidak diperlukan terlebih dahulu.')
      const photos = await Promise.all(Array.from(files).map(compressImage))
      setImages(p => [...p, ...photos])
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal memproses foto.') }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = '' }
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    if (!images.length) { setError('Tambahkan minimal satu foto produk.'); return }
    const price = Number(form.price), discount = Number(form.discount)
    if (!Number.isInteger(price) || price <= 0 || !Number.isInteger(discount) || discount < 0 || discount >= 100) { setError('Periksa harga dan diskon. Diskon maksimal 99%.'); return }
    setSaving(true)
    try {
      await onSave({ name: form.name.trim(), category: form.category, subcategory: form.subcategory.trim() || null, description: form.description.trim() || null, originalPrice: price, discount, material: form.material, room: form.room, colors: form.colors.split(',').map(c => c.trim()).filter(Boolean), img: images[0], gallery: images.slice(1), inStock: form.inStock })
      onClose()
    } catch (e) { setError(e instanceof Error ? e.message : 'Produk belum tersimpan. Coba lagi.') }
    finally { setSaving(false) }
  }
  return <Dialog title={product ? 'Ubah produk' : 'Tambah produk baru'} onClose={onClose} wide busy={saving || uploading}>
    <form onSubmit={submit}>
      <fieldset disabled={saving || uploading} className="dialog-body grid md:grid-cols-[1fr_.7fr] gap-7">
        <div className="space-y-5">
          <div><p className="text-sm font-semibold mb-1">01 · Informasi produk</p><p className="field-hint">Tampilkan detail yang membantu pelanggan memilih.</p></div>
          <div><label htmlFor="product-name" className="field-label">Nama produk *</label><input id="product-name" className="field" required minLength={2} maxLength={100} value={form.name} onChange={e => update('name', e.target.value)} placeholder="Contoh: Kursi Rotan Senja" autoFocus /></div>
          <div className="grid grid-cols-2 gap-4"><div><label htmlFor="product-category" className="field-label">Kategori *</label><select id="product-category" className="field" value={form.category} onChange={e => update('category', e.target.value)}><option value="Chair">Kursi</option><option value="Sofa">Sofa</option><option value="Table">Meja</option><option value="Bundle">Paket furnitur</option></select></div><div><label htmlFor="product-subcategory" className="field-label">Jenis produk</label><input id="product-subcategory" className="field" value={form.subcategory} onChange={e => update('subcategory', e.target.value)} placeholder="Contoh: Kursi makan" maxLength={80} /></div></div>
          <div><label htmlFor="product-description" className="field-label">Deskripsi dan ukuran</label><textarea id="product-description" className="field resize-y min-h-28" value={form.description} onChange={e => update('description', e.target.value)} maxLength={4000} placeholder="Jelaskan bahan, ukuran (P × L × T), perawatan, dan detail lainnya." /><p className="field-hint">Tuliskan ukuran dengan satuan cm agar pelanggan tidak perlu menebak.</p></div>
          <div className="grid grid-cols-2 gap-4"><div><label htmlFor="product-material" className="field-label">Bahan *</label><input id="product-material" required className="field" value={form.material} onChange={e => update('material', e.target.value)} maxLength={80} /></div><div><label htmlFor="product-room" className="field-label">Ruangan</label><select id="product-room" className="field" value={form.room} onChange={e => update('room', e.target.value)}><option value="Living Room">Ruang tamu</option><option value="Dining Room">Ruang makan</option><option value="Bedroom">Kamar tidur</option><option value="Office">Ruang kerja</option><option value="Outdoor">Luar ruangan</option></select></div></div>
          <div><label htmlFor="product-colors" className="field-label">Pilihan warna *</label><input id="product-colors" required className="field" value={form.colors} onChange={e => update('colors', e.target.value)} maxLength={200} /><p className="field-hint">Pisahkan dengan koma. Contoh: Oak, Walnut, Natural.</p></div>
        </div>
        <div className="space-y-5">
          <div><p className="text-sm font-semibold mb-1">02 · Foto produk</p><p className="field-hint">Foto pertama menjadi foto utama. JPG, PNG, atau WebP; maksimal 5 foto.</p></div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple id="product-images" className="sr-only" onChange={e => upload(e.target.files)} />
          <button type="button" onClick={() => fileRef.current?.click()} className="w-full min-h-28 border border-dashed border-[#aab79f] rounded-xl bg-[#f7f9f3] flex flex-col items-center justify-center gap-2 text-sm"><Icon name="image" /><span>{uploading ? 'Memproses foto…' : 'Pilih foto produk'}</span><span className="text-xs text-[#69765f]">Foto dikompres otomatis · maks. 8 MB/foto</span></button>
          <div className="grid grid-cols-3 gap-2">{images.map((img, i) => <div key={`${i}-${img.slice(-20)}`} className="relative rounded-lg border border-[#e3e5dc] overflow-hidden aspect-square"><img src={img} alt={`Foto produk ${i + 1}`} className="w-full h-full object-cover" /><button type="button" className="absolute top-0 right-0 icon-button bg-white/95" onClick={() => setImages(p => p.filter((_, n) => n !== i))} aria-label={`Hapus foto ${i + 1}`}><Icon name="close" width="15" /></button>{i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-[#2c2824] text-white text-[9px] text-center py-1">Foto utama</span>}</div>)}</div>
          <div className="pt-3 border-t border-[#e3e5dc]"><p className="text-sm font-semibold mb-4">03 · Harga dan ketersediaan</p><div className="grid grid-cols-[1fr_90px] gap-3"><div><label htmlFor="product-price" className="field-label">Harga (Rp) *</label><input id="product-price" type="number" min="1" max="2147483647" step="1" className="field" required value={form.price} onChange={e => update('price', e.target.value)} placeholder="1500000" /></div><div><label htmlFor="product-discount" className="field-label">Diskon (%)</label><input id="product-discount" type="number" min="0" max="99" step="1" className="field" required value={form.discount} onChange={e => update('discount', e.target.value)} /></div></div><div className="notice mt-4"><p className="text-xs">Harga yang dilihat pelanggan</p><p className="text-xl font-semibold mt-1">{formatMoney(productPrice(Number(form.price) || 0, Number(form.discount) || 0))}</p></div><label className="flex gap-3 items-start mt-5 text-sm"><input type="checkbox" className="mt-1 w-4 h-4 accent-[#2c2824]" checked={form.inStock} onChange={e => update('inStock', e.target.checked)} /><span>Produk tersedia untuk dipesan<span className="field-hint block">Nonaktifkan jika barang belum tersedia. Produk tetap tersimpan.</span></span></label></div>
        </div>
      </fieldset>
      {error && <p className="notice error mx-7 mb-5" role="alert">{error}</p>}
      <div className="dialog-actions"><button type="button" className="store-button secondary" onClick={onClose} disabled={saving || uploading}>Batal</button><button className="store-button" disabled={saving || uploading}>{saving ? 'Menyimpan…' : product ? 'Simpan perubahan' : 'Tambahkan produk'}<Icon name="check" width="16" /></button></div>
    </form>
  </Dialog>
}
