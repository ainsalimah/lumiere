'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import Icon from '@/components/Icon'

export default function ProductError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter()

  useEffect(() => {
    // Preserve the technical details in the browser console without showing them to customers.
    console.error('Product detail could not be loaded.')
  }, [])

  return <AppShell currentPage="shop"><div className="store-container flex min-h-[55vh] items-center justify-center py-12"><section className="max-w-lg text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0eae3] text-[#765037]"><Icon name="box" width="25" /></span><p className="eyebrow mt-6">Detail produk belum tersedia</p><h1 className="display mt-3 text-4xl text-[#2c2824]">Katalog sedang tidak dapat dihubungi.</h1><p className="mt-4 text-sm leading-7 text-[#7d7168]">Coba muat ulang beberapa saat lagi. Jika masalah berlanjut, kembali ke koleksi untuk memilih produk lain.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button className="store-button" onClick={reset}><Icon name="refresh" width="16" /> Coba lagi</button><button className="store-button secondary" onClick={() => router.push('/shop')}>Kembali ke koleksi</button></div></section></div></AppShell>
}
