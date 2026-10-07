'use client'

import { useEffect } from 'react'

interface LogoutConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function LogoutConfirmModal({ open, onClose, onConfirm }: LogoutConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 sm:p-7 text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors"
          aria-label="Tutup"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Icon */}
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </div>

        {/* Text */}
        <h3 className="text-stone-900 font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Yakin Ingin Keluar?
        </h3>
        <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-6">
          Anda akan keluar dari sesi akun Anda. Anda perlu masuk kembali untuk mengakses riwayat pesanan dan alamat tersimpan.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-stone-200 hover:border-stone-400 text-stone-700 font-medium text-sm rounded-xl transition-all hover:bg-stone-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onClose()
              onConfirm()
            }}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-medium text-sm rounded-xl transition-all shadow-sm"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  )
}
