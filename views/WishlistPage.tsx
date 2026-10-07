'use client'

import type { Product, Page } from '@/types'
import { ProductsContext } from '@/context'
import { useContext } from 'react'
import { formatSubcategory } from '@/constants'
interface WishlistPageProps {
  wishlist: Set<number>
  toggleWishlist: (id: number) => void
  addToCart: (product: Product) => void
  openProduct: (product: Product) => void
  navigate: (page: Page) => void
}

export default function WishlistPage({ wishlist, toggleWishlist, addToCart, openProduct, navigate }: WishlistPageProps) {
  const products = useContext(ProductsContext)
  const wishlisted = products.filter(p => wishlist.has(p.id))

  return (
    <div className="bg-stone-50 min-h-screen">

      {/* Header */}
      <div className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-7 sm:py-10 flex items-end justify-between">
          <div>
            <p className="text-warm-600 text-xs tracking-[0.25em] uppercase mb-1.5 font-medium">Item Tersimpan</p>
            <h1 className="text-stone-900 text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>Wishlist Saya</h1>
          </div>
          {wishlisted.length > 0 && (
            <p className="text-stone-400 text-sm">{wishlisted.length} item{wishlisted.length !== 1 ? '' : ''}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-7 sm:py-10">
        {wishlisted.length === 0 ? (
          /* Empty state */
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" className="text-stone-300">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h2 className="text-stone-900 text-2xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>Wishlist Anda kosong</h2>
            <p className="text-stone-400 text-sm mb-6">Simpan item favorit dengan klik ikon hati di produk mana pun.</p>
            <button
              onClick={() => navigate('shop')}
              className="bg-stone-900 text-white px-8 py-3 text-sm tracking-wide rounded-sm hover:bg-stone-800 transition-colors font-medium"
            >
              Jelajahi Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlisted.map(product => (
              <div key={product.id} className="group bg-white rounded-sm border border-stone-100 hover:border-stone-300 hover:shadow-md transition-all duration-300 overflow-hidden">
                {/* Image */}
                <div
                  onClick={() => openProduct(product)}
                  className="relative overflow-hidden bg-stone-100 cursor-pointer"
                  style={{ aspectRatio: '1' }}
                >
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-stone-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {product.discount}% diskon
                  </span>
                  {/* Remove from wishlist */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleWishlist(product.id) }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                    title="Remove from wishlist"
                  >
                    <svg width="14" height="14" fill="currentColor" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>

                {/* Info */}
                <div className="px-4 py-3">
                  <p className="text-stone-400 text-[10px] tracking-widest uppercase mb-1">{formatSubcategory(product.subcategory)}</p>
                  <h3
                    onClick={() => openProduct(product)}
                    className="text-stone-900 text-base mb-2 leading-snug cursor-pointer hover:text-warm-700 transition-colors"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-stone-900 text-base font-semibold">Rp {product.price.toLocaleString('id-ID')}</span>
                    <span className="text-stone-400 text-sm line-through">Rp {product.originalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="product-card-cart-button"
                  >
                    Tambah ke keranjang
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

