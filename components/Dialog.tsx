'use client'
import { useEffect, useRef, type ReactNode } from 'react'
import Icon from './Icon'
export default function Dialog({ title, onClose, children, wide = false, busy = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    ref.current?.showModal()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow; previous?.focus() }
  }, [])
  return <dialog ref={ref} className={`store-dialog ${wide ? 'store-dialog-wide' : ''}`} aria-labelledby="store-dialog-title" onCancel={e => { e.preventDefault(); if (!busy) onClose() }} onClick={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
    <div className="dialog-header"><div><p className="eyebrow">Lumière · Studio</p><h2 id="store-dialog-title">{title}</h2></div><button className="icon-button" aria-label="Tutup dialog" onClick={onClose} disabled={busy}><Icon name="close" /></button></div>{children}
  </dialog>
}
