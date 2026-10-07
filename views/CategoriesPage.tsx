'use client'

import { useState } from 'react'
import type { Page, ShopPreFilter, Product } from '@/types'
import { ProductsContext } from '@/context'
import { useContext } from 'react'
import { bundles } from '@/data/bundles'
import BundleModal from '@/components/BundleModal'

interface CategoriesPageProps {
  navigate: (page: Page, preFilter?: ShopPreFilter) => void
  addToCart: (product: Product, qty: number) => void
}

// mapping from category display name → ShopPreFilter
const CATEGORY_FILTERS: Record<string, ShopPreFilter> = {
  'Kursi':       { categories: ['Chair'],   label: 'Kursi' },
  'Sofa':        { categories: ['Sofa'],    label: 'Sofa' },
  'Meja':        { categories: ['Table'],   label: 'Meja' },
  'Ruang Tamu':  { rooms: ['Living Room'],  label: 'Ruang Tamu' },
  'Kamar Tidur': { rooms: ['Bedroom'],      label: 'Kamar Tidur' },
  'Ruang Makan': { rooms: ['Dining Room'],  label: 'Ruang Makan' },
}

const highlights = [
  { label: '500+', desc: 'Produk Unik' },
  { label: '12', desc: 'Koleksi per Tahun' },
  { label: '40+', desc: 'Pengrajin Ahli' },
  { label: '18', desc: 'Pilihan Kayu Alami' },
]

export default function CategoriesPage({ navigate, addToCart }: CategoriesPageProps) {
  const products = useContext(ProductsContext)
  const [selectedBundle, setSelectedBundle] = useState<Product | null>(null)

  const inStockProducts = products.filter(p => p.inStock)

  const categories = [
    {
      name: 'Kursi',
      count: inStockProducts.filter(p => p.category === 'Chair').length,
      description: 'Kursi santai, kursi makan, kursi bar, dan kursi kerja — dirancang untuk kenyamanan duduk dan keindahan interior.',
      img: '/chair_1.png',
      featured: inStockProducts.filter(p => p.category === 'Chair').slice(0, 3).map(p => p.name),
      span: 'lg:col-span-1',
      height: 'h-80 lg:h-96',
    },
    {
      name: 'Sofa',
      count: inStockProducts.filter(p => p.category === 'Sofa').length,
      description: 'Sofa 2 dudukan, 3 dudukan, sofa sudut, dan sofa bed — kemewahan dan kenyamanan untuk waktu berkumpul.',
      img: '/sofa_1.png',
      featured: inStockProducts.filter(p => p.category === 'Sofa').slice(0, 3).map(p => p.name),
      span: 'lg:col-span-1',
      height: 'h-80 lg:h-96',
    },
    {
      name: 'Meja',
      count: inStockProducts.filter(p => p.category === 'Table').length,
      description: 'Meja makan, meja kopi, meja kerja, dan meja samping — material alami kokoh dengan desain kontemporer.',
      img: '/tables_1.png',
      featured: inStockProducts.filter(p => p.category === 'Table').slice(0, 3).map(p => p.name),
      span: 'lg:col-span-1',
      height: 'h-80 lg:h-96',
    },
    {
      name: 'Ruang Tamu',
      count: inStockProducts.filter(p => p.room === 'Living Room').length,
      description: 'Sofa, meja kopi, rak, dan dekorasi aksen yang menegaskan ruang kumpul utama Anda.',
      img: '/images/categories/category-1.jpg',
      featured: inStockProducts.filter(p => p.room === 'Living Room').slice(0, 3).map(p => p.name),
      span: 'lg:col-span-2 lg:row-span-1',
      height: 'h-80 lg:h-96',
    },
    {
      name: 'Kamar Tidur',
      count: inStockProducts.filter(p => p.room === 'Bedroom').length,
      description: 'Tempat tidur, nakas, dan furnitur kamar tidur untuk relaksasi dan istirahat optimal.',
      img: '/images/categories/category-2.jpg',
      featured: inStockProducts.filter(p => p.room === 'Bedroom').slice(0, 3).map(p => p.name),
      span: 'lg:col-span-1',
      height: 'h-80 lg:h-96',
    },
    {
      name: 'Ruang Makan',
      count: inStockProducts.filter(p => p.room === 'Dining Room').length,
      description: 'Meja makan, kursi makan, dan perabot penyimpanan untuk momen makan bersama yang berkesan.',
      img: '/images/categories/category-3.jpg',
      featured: inStockProducts.filter(p => p.room === 'Dining Room').slice(0, 3).map(p => p.name),
      span: 'lg:col-span-1',
      height: 'h-72',
    },
  ]

  const goToCategory = (name: string) => {
    navigate('shop', CATEGORY_FILTERS[name])
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Header */}
      <div className="border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
          <p className="text-warm-600 text-xs tracking-[0.25em] uppercase mb-2 font-medium">Jelajahi</p>
          <h1 className="text-stone-900 text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Kategori Produk
          </h1>
          <p className="text-stone-500 text-sm sm:text-base max-w-lg">
            Setiap ruangan pantas mendapatkan furnitur yang selaras — temukan perabot terbaik yang dirancang untuk kenyamanan hidup Anda.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-stone-200 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-5 grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-200">
          {highlights.map(({ label, desc }) => (
            <div key={desc} className="px-3 sm:px-6 first:pl-0 text-center py-2 sm:py-0">
              <p className="text-stone-900 text-lg sm:text-2xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{label}</p>
              <p className="text-stone-500 text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => goToCategory(cat.name)}
              className={`relative group overflow-hidden rounded-sm text-left ${cat.span} ${cat.height} bg-stone-200`}
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between mb-2">
                  <h2 className="text-white text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
                    {cat.name}
                  </h2>
                  <span className="text-stone-300 text-xs tracking-widest bg-white/10 px-2.5 py-1 rounded-sm">
                    {cat.count} Produk
                  </span>
                </div>
                <p className="text-stone-300 text-sm leading-relaxed mb-3 max-w-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:block">
                  {cat.description}
                </p>
                <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:flex">
                  {cat.featured.map(item => (
                    <span key={item} className="text-[10px] tracking-wide bg-white/15 text-stone-200 px-2.5 py-1 rounded-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA pill - appears on hover */}
              <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                <span className="flex items-center gap-1.5 bg-white text-stone-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                  Lihat {cat.name}
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Curated section */}
      <section className="bg-warm-50 border-t border-stone-200 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-warm-600 text-xs tracking-[0.25em] uppercase mb-3 font-medium">Koleksi Pilihan</p>
              <h2 className="text-stone-900 text-4xl mb-5" style={{ fontFamily: 'var(--font-display)' }}>
                Paket Ruangan<br />
                <em>Lengkap</em>
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 max-w-sm">
                Hemat hingga 20% saat melengkapi seluruh ruangan. Setiap paket dirancang serasi, elegan, dan siap mempercantik hunian Anda.
              </p>
              <button
                onClick={() => navigate('shop')}
                className="bg-stone-900 text-white px-8 py-3 text-sm tracking-wide hover:bg-stone-800 transition-colors rounded-sm"
              >
                Jelajahi Semua Produk
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {bundles.map(bundle => (
                <button
                  key={bundle.id}
                  onClick={() => setSelectedBundle(bundle)}
                  className="bg-white border border-stone-200 rounded-sm p-5 text-left hover:border-stone-400 hover:shadow-sm transition-all group"
                >
                  <p className="text-stone-400 text-[10px] tracking-widest uppercase mb-1">{bundle.bundleItems?.length} item</p>
                  <h4 className="text-stone-900 text-sm font-semibold mb-1 group-hover:text-warm-700 transition-colors">{bundle.name}</h4>
                  <p className="text-warm-600 text-sm font-medium">Rp {bundle.price.toLocaleString('id-ID')}</p>
                  <p className="text-stone-400 text-[10px] mt-2 flex items-center gap-1 group-hover:text-stone-600 transition-colors">
                    Lihat Detail Paket →
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BundleModal
        open={!!selectedBundle}
        onClose={() => setSelectedBundle(null)}
        bundle={selectedBundle}
        addToCart={addToCart}
      />

      {/* Instagram strip */}
      <section className="py-16 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="text-stone-900 text-2xl mb-8" style={{ fontFamily: 'var(--font-display)' }}>
            Inspirasi dari Pelanggan Kami
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              '/images/categories/category-6.jpg',
              '/images/categories/category-7.jpg',
              '/images/categories/category-8.jpg',
              '/images/categories/category-9.jpg',
            ].map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-sm bg-stone-100">
                <img src={src} alt="Customer interior" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
          <p className="text-stone-400 text-xs mt-3 text-center tracking-wide">
            Bagikan inspirasi hunian Anda — tandai kami di <span className="text-stone-700">@lumierefurniture</span>
          </p>
        </div>
      </section>
    </div>
  )
}

