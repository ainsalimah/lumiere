'use client'

import { useState } from 'react'
import type { CartItem, Page, ShopPreFilter } from '@/types'
import { formatSubcategory, formatColor } from '@/constants'

interface CartPageProps {
  items: CartItem[]
  onUpdateQty: (id: number, color: string, qty: number) => void
  onRemove: (id: number, color: string) => void
  onClear: () => void
  onCheckout: () => void
  navigate: (page: Page, preFilter?: ShopPreFilter) => void
}

export default function CartPage({ items, onUpdateQty, onRemove, onClear, onCheckout, navigate }: CartPageProps) {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const total = subtotal

  return (
    <div className="bg-stone-50 min-h-screen">

      {/* Header */}
      <div className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-7 sm:py-10">
          <p className="text-warm-600 text-xs tracking-[0.25em] uppercase mb-1.5 font-medium">Pilihan Anda</p>
          <h1 className="text-stone-900 text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>Keranjang Belanja</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-7 sm:py-10">
        {items.length === 0 ? (
          /* ── Empty state ── */
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" className="text-stone-400">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h2 className="text-stone-900 text-2xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>Keranjang Anda masih kosong</h2>
            <p className="text-stone-500 text-sm mb-6">Sepertinya Anda belum menambahkan produk pilihan ke dalam keranjang.</p>
            <button
              onClick={() => navigate('shop')}
              className="bg-stone-900 text-white px-8 py-3 text-sm tracking-wide rounded-sm hover:bg-stone-800 transition-colors font-medium cursor-pointer"
            >
              Mulai Berbelanja
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── LEFT: cart table ── */}
            <div className="lg:col-span-2">

              {/* Table header (Desktop only) */}
              <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center bg-stone-900 text-white text-sm font-medium px-5 py-3.5 rounded-xl mb-2 shadow-xs">
                <span>Produk</span>
                <span className="w-24 text-center">Harga</span>
                <span className="w-28 text-center">Jumlah</span>
                <span className="w-28 text-right">Subtotal</span>
              </div>

              {/* Rows */}
              <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-xs">
                {items.map(item => (
                  <div
                    key={`${item.product.id}-${item.selectedColor}`}
                    className="p-4 sm:p-5 md:grid md:grid-cols-[1fr_auto_auto_auto] md:gap-4 md:items-center hover:bg-stone-50/50 transition-colors"
                  >
                    {/* Top part on mobile / Left column on desktop */}
                    <div className="flex items-start md:items-center gap-3.5 sm:gap-4 min-w-0">
                      {/* Remove button desktop */}
                      <button
                        onClick={() => onRemove(item.product.id, item.selectedColor)}
                        className="hidden md:block text-stone-300 hover:text-red-500 transition-colors flex-shrink-0 p-1 cursor-pointer"
                        aria-label="Hapus produk"
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                      </button>

                      {/* Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0 border border-stone-100">
                        <img src={item.product.img} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Name + color + mobile price */}
                      <div className="min-w-0 flex-1 pr-2">
                        <p
                          className="text-stone-900 text-sm sm:text-base font-semibold truncate leading-snug cursor-pointer hover:text-warm-700 transition-colors"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {item.product.name}
                        </p>
                        <p className="text-stone-500 text-xs mt-0.5 font-normal">Warna: {formatColor(item.selectedColor)}</p>
                        <p className="text-stone-400 text-xs">{formatSubcategory(item.product.subcategory)}</p>
                        {/* Mobile unit price */}
                        <p className="md:hidden text-stone-700 text-xs font-medium mt-1">
                          Rp {item.product.price.toLocaleString('id-ID')} / item
                        </p>
                      </div>

                      {/* Mobile Remove button */}
                      <button
                        onClick={() => onRemove(item.product.id, item.selectedColor)}
                        className="md:hidden text-stone-300 hover:text-red-500 transition-colors p-1.5 -mr-1 -mt-1 cursor-pointer"
                        aria-label="Hapus produk"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>

                    {/* Unit price (Desktop) */}
                    <div className="hidden md:block w-24 text-center">
                      <span className="text-stone-700 text-sm font-medium">Rp {item.product.price.toLocaleString('id-ID')}</span>
                    </div>

                    {/* Mobile bottom row (Qty stepper & subtotal) / Desktop stepper & subtotal */}
                    <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-stone-100 md:border-none md:mt-0 md:pt-0 md:contents">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-1 md:w-28 md:justify-center">
                        <button
                          onClick={() => onUpdateQty(item.product.id, item.selectedColor, item.qty - 1)}
                          className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-colors text-base cursor-pointer"
                          aria-label="Kurangi"
                        >−</button>
                        <span className="w-8 text-center text-stone-900 text-sm font-semibold">{item.qty}</span>
                        <button
                          onClick={() => onUpdateQty(item.product.id, item.selectedColor, item.qty + 1)}
                          className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-colors text-base cursor-pointer"
                          aria-label="Tambah"
                        >+</button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right md:w-28">
                        <span className="md:hidden text-[11px] text-stone-400 block">Subtotal:</span>
                        <span className="text-stone-900 text-sm sm:text-base font-bold">Rp {(item.product.price * item.qty).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom row: continue shopping */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-100">
                <button
                  onClick={() => navigate('shop')}
                  className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 text-sm font-medium transition-colors cursor-pointer"
                >
                  <span>←</span> Lanjutkan Belanja
                </button>
              </div>
            </div>

            {/* ── RIGHT: order summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-stone-200 p-6 sticky top-24 shadow-xs">
                <h3 className="text-stone-900 text-lg font-semibold mb-5" style={{ fontFamily: 'var(--font-display)' }}>
                  Ringkasan Pesanan
                </h3>

                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between text-stone-500">
                    <span>Jumlah Produk</span>
                    <span className="text-stone-900 font-medium">{items.reduce((s, i) => s + i.qty, 0)} item</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal</span>
                    <span className="text-stone-900 font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Ongkos Kirim</span>
                    <span className="text-stone-700 font-medium">Dikonfirmasi pemilik</span>
                  </div>
                </div>

                <p className="notice mb-4">Ongkir, jadwal pengiriman, dan pembayaran disepakati bersama pemilik setelah permintaan pesanan dikirim.</p>

                <div className="flex justify-between text-stone-900 font-bold text-base border-t border-stone-200 pt-4 mb-5">
                  <span>Nilai barang</span>
                  <span className="text-warm-700 text-lg">Rp {total.toLocaleString('id-ID')}</span>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full bg-stone-900 text-white py-3.5 rounded-xl text-sm font-semibold tracking-wide hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
                >
                  Lanjut ke Pemesanan
                </button>

                <button
                  onClick={() => navigate('shop')}
                  className="w-full mt-3 text-stone-500 text-xs py-2 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  ← Lanjut Berbelanja
                </button>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

