'use client'
import { useContext, useState } from 'react'
import type { Page, Product, ShopPreFilter } from '@/types'
import { ProductsContext, ProductsStatusContext, useRefreshProducts } from '@/context'
import { HOME_FAQS } from '@/constants/faq'
import { formatMoney } from '@/lib/store'
import Icon from '@/components/Icon'
interface HomePageProps {
  navigate: (page: Page, filter?: ShopPreFilter) => void
  addToCart: (product: Product) => void
  openProduct: (product: Product) => void
  wishlist: Set<number>
  toggleWishlist: (id: number) => void
}
const categories = [
  { key: 'Chair', label: 'Kursi', description: 'Sudut kecil, kenyamanan besar.', image: '/chair_1.png' },
  { key: 'Sofa', label: 'Sofa', description: 'Tempat untuk pulang dan bersantai.', image: '/sofa_1.png' },
  { key: 'Table', label: 'Meja', description: 'Ruang untuk cerita sehari-hari.', image: '/tables_1.png' },
]
export default function HomePage({ navigate, addToCart, openProduct, wishlist, toggleWishlist }: HomePageProps) {
  const products = useContext(ProductsContext)
  const state = useContext(ProductsStatusContext)
  const refresh = useRefreshProducts()
  const [category, setCategory] = useState('Semua')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const available = products.filter(p => p.inStock && (category === 'Semua' || p.category === category)).slice().sort((a, b) => b.id - a.id)
  return <div className="bg-[#faf9f7] text-[#2c2824]">
    <section className="relative isolate min-h-[620px] overflow-hidden bg-[#2c2824] text-white">
      <img src="/images/about/about-1.jpg" alt="Inspirasi ruang dengan furnitur dan material alami" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#2c2824]/95 via-[#2c2824]/70 to-[#2c2824]/20" />
      <div className="store-container flex min-h-[620px] items-center py-16 lg:py-20">
        <div className="max-w-[600px] py-4 lg:py-10">
          <p className="eyebrow mb-7 flex items-center gap-3 text-[#f2e5d1]"><span className="h-px w-6 bg-[#d8906a]" /> Furnitur untuk keseharian</p>
          <h1 className="display text-[46px] sm:text-[64px] lg:text-[76px]">Ruang yang nyaman.<br /><em className="text-[#f0b08b]">Cerita yang baru.</em></h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-white/80">Temukan kursi, sofa, dan meja yang membuat rumah terasa lebih seperti dirimu. Dipilih dan dikelola langsung oleh pemilik toko.</p>
          <div className="mt-8 flex flex-wrap items-center gap-5"><button className="store-button bg-[#2c2824] text-white hover:bg-[#46403a]" onClick={() => navigate('shop')}>Jelajahi koleksi <Icon name="arrow" width="17" /></button><a href="#cara-pesan" className="text-link text-white hover:text-[#f0b08b]">Cara memesan <span aria-hidden="true">↘</span></a></div>
          <div className="mt-10 flex flex-wrap gap-6 border-t border-white/25 pt-6 text-xs text-white/75"><span className="flex items-center gap-2"><Icon name="box" width="17" /> Pilihan dari satu toko</span><span className="flex items-center gap-2"><Icon name="check" width="17" /> Konfirmasi langsung pemilik</span></div>
        </div>
      </div>
      <span className="absolute right-5 top-5 rounded-full border border-white/60 bg-white/90 px-4 py-2 text-[11px] font-medium text-[#2c2824] sm:right-8 sm:top-8">The everyday collection</span>
    </section>
    <section className="store-container border-t border-[#e8e3dc] py-10 lg:py-14">
      <div className="flex flex-wrap gap-4 items-end justify-between mb-7"><div><p className="eyebrow mb-3">Temukan yang kamu butuhkan</p><h2 className="display text-3xl sm:text-4xl">Satu ruang, banyak kemungkinan.</h2></div><button className="text-link" onClick={() => navigate('categories')}>Semua kategori <Icon name="arrow" width="16" /></button></div>
      <div className="grid sm:grid-cols-3 gap-4">{categories.map(c => <button key={c.key} onClick={() => navigate('shop', { categories: [c.key], label: c.label })} className="group relative h-80 overflow-hidden rounded-sm bg-stone-200 text-left lg:h-96">
        <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6"><div className="flex items-end justify-between gap-3"><h3 className="display text-3xl text-white">{c.label}</h3><span className="rounded-sm bg-white/10 px-2.5 py-1 text-xs tracking-widest text-stone-200">{products.filter(p => p.category === c.key && p.inStock).length} Produk</span></div><p className="mt-2 hidden max-w-[220px] text-sm leading-relaxed text-stone-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block">{c.description}</p></div>
        <span className="absolute right-5 top-5 flex translate-y-1 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-stone-900 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">Lihat {c.label} <Icon name="arrow" width="12" /></span>
      </button>)}</div>
    </section>
    <section className="bg-white py-12 lg:py-20 border-y border-[#e5e5dc]" id="koleksi">
      <div className="store-container"><div className="flex flex-wrap justify-between items-end gap-4 mb-8"><div><p className="eyebrow mb-3">Pilihan untuk rumahmu</p><h2 className="display text-4xl sm:text-5xl">Kenalan dengan koleksi kami.</h2></div><button className="text-link" onClick={() => navigate('shop')}>Lihat seluruh koleksi <Icon name="arrow" width="16" /></button></div>
        <div className="flex gap-2 overflow-x-auto pb-5 mb-3" role="group" aria-label="Filter kategori produk">{[{ key: 'Semua', label: 'Semua' }, ...categories].map(c => <button key={c.key} onClick={() => setCategory(c.key)} aria-pressed={category === c.key} className={`min-h-11 px-5 rounded-full text-xs font-medium border whitespace-nowrap ${category === c.key ? 'bg-[#2c2824] border-[#2c2824] text-white' : 'border-[#e8e3dc] text-[#7d7168] hover:bg-[#f3f0ec]'}`}>{c.label}</button>)}</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-9">{available.slice(0, 8).map(p => <article key={p.id} className="group min-w-0">
          <div className="relative bg-[#f1f0e9] rounded-xl overflow-hidden aspect-[1/1.08]"><button className="w-full h-full" onClick={() => openProduct(p)} aria-label={`Lihat ${p.name}`}><img src={p.img || '/images/products/product-1.jpg'} alt={p.name} loading="lazy" className="w-full h-full object-cover" /></button><button className={`absolute right-2 top-2 sm:right-3 sm:top-3 icon-button bg-white/95 shadow-sm ${wishlist.has(p.id) ? 'text-[#9d5635]' : ''}`} onClick={() => toggleWishlist(p.id)} aria-pressed={wishlist.has(p.id)} aria-label={`Simpan ${p.name} ke favorit`}><Icon name="heart" width="18" fill={wishlist.has(p.id) ? 'currentColor' : 'none'} /></button>{p.discount > 0 && <span className="absolute top-3 left-3 bg-[#fffdf6] text-[#9d5635] text-[10px] px-2 py-1 rounded-md font-semibold">−{p.discount}%</span>}</div>
          <p className="eyebrow text-[9px] mt-4 mb-2">{categories.find(c => c.key === p.category)?.label || 'Furnitur'} · {p.material}</p><h3><button onClick={() => openProduct(p)} className="text-left text-[14px] sm:text-[16px] font-medium text-[#2c2824] leading-6">{p.name}</button></h3><div className="flex flex-wrap gap-x-2 gap-y-1 mt-2 text-sm"><span className="font-semibold">{formatMoney(p.price)}</span>{p.discount > 0 && <span className="line-through text-[#9a8e80] text-xs self-center">{formatMoney(p.originalPrice)}</span>}</div><button className="product-card-cart-button mt-4" onClick={() => addToCart(p)}><Icon name="plus" width="15" /> Tambah ke keranjang</button>
        </article>)}</div>
        {state.loading && <p className="notice mt-6" role="status">Memuat koleksi…</p>}
        {state.error && <div className="notice error mt-6" role="alert">{state.error} <button className="underline" onClick={() => refresh().catch(() => {})}>Muat ulang</button></div>}
        {!state.loading && !state.error && available.length === 0 && <div className="empty-state">Belum ada produk tersedia di kategori ini. Coba kategori lainnya.</div>}
      </div>
    </section>
    <section className="store-container py-14 lg:py-20 grid md:grid-cols-2 gap-10 lg:gap-20 items-center">
      <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-[#f0eae3]"><img src="/images/about/about-2.jpg" alt="Detail material dan furnitur sebagai inspirasi interior" loading="lazy" className="w-full h-full object-cover" /></div><div><p className="eyebrow mb-5">Pilihan yang lebih personal</p><h2 className="display text-4xl sm:text-5xl">Rumah bukan sekadar tempat.</h2><p className="mt-5 leading-7 text-[#7d7168]">Ada kursi untuk membaca, sofa untuk berbagi cerita, dan meja tempat ide bermula. Pilih furnitur sesuai ruang dan kebutuhanmu, lalu diskusikan detail pesanan dengan pemilik.</p><button className="text-link mt-5" onClick={() => navigate('about')}>Mengenal Lumière <Icon name="arrow" width="16" /></button></div>
    </section>
    <section id="cara-pesan" className="scroll-mt-24 bg-[#f0eae3] py-14 lg:py-16"><div className="store-container"><div className="mb-10 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow mb-3">Dari pilihan, menjadi pesanan</p><h2 className="display text-4xl">Tiga langkah menuju rumahmu.</h2></div><p className="max-w-xs text-sm leading-6 text-[#7d7168]">Tanpa pembayaran otomatis. Semua detail disepakati langsung dengan pemilik.</p></div><div className="grid gap-8 md:grid-cols-3">{[{ title: 'Pilih furniturmu', text: 'Jelajahi koleksi, lihat bahan dan pilihan warna, lalu masukkan ke keranjang.' }, { title: 'Kirim permintaan pesanan', text: 'Masuk ke akun, isi alamat dan nomor yang bisa dihubungi. Pesanan masuk ke dashboard pemilik.' }, { title: 'Konfirmasi bersama pemilik', text: 'Pemilik memastikan ketersediaan, ongkir, jadwal, dan cara pembayaran sebelum pesanan diproses.' }].map((s, i) => <div key={s.title} className="border-t border-[#c2b09f] pt-5"><p className="mb-5 text-xs font-semibold text-[#765037]">0{i + 1}</p><h3 className="display mb-3 text-2xl">{s.title}</h3><p className="max-w-xs text-sm leading-6 text-[#7d7168]">{s.text}</p></div>)}</div></div></section>
    <section className="store-container grid gap-10 py-14 md:grid-cols-[.7fr_1fr] lg:gap-20 lg:py-20"><div><p className="eyebrow mb-4">Sebelum memesan</p><h2 className="display text-4xl">Ada yang ingin<br />kamu tanyakan?</h2><button className="text-link mt-5" onClick={() => navigate('contact')}>Hubungi pemilik <Icon name="arrow" width="16" /></button></div><div className="border-t border-[#e8e3dc]">{HOME_FAQS.map((faq, i) => <div key={faq.q} className="border-b border-[#e8e3dc]"><h3><button className="flex w-full items-center justify-between gap-6 py-5 text-left text-sm font-medium" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} aria-controls={`faq-${i}`}>{faq.q}<Icon name={openFaq === i ? 'close' : 'plus'} width="17" className="shrink-0" /></button></h3><p id={`faq-${i}`} hidden={openFaq !== i} className="max-w-xl pb-5 text-sm leading-7 text-[#7d7168]">{faq.a}</p></div>)}</div></section>
  </div>
}
