export interface FaqItem { q: string; a: string }
export const HOME_FAQS: FaqItem[] = [
  { q: 'Bagaimana cara memesan furnitur?', a: 'Pilih produk dan masukkan ke keranjang. Setelah masuk ke akun, kirim permintaan pesanan dengan alamat dan nomor telepon. Pemilik akan mengonfirmasi detail sebelum pesanan diproses.' },
  { q: 'Apakah harus langsung membayar?', a: 'Tidak. Website tidak memproses pembayaran. Tunggu konfirmasi pemilik mengenai ketersediaan barang, biaya pengiriman, dan metode pembayaran yang disepakati.' },
  { q: 'Bagaimana biaya dan jadwal pengiriman?', a: 'Biaya dan jadwal mengikuti ukuran barang, lokasi tujuan, serta ketersediaan produk. Pemilik akan menjelaskannya sebelum kamu melakukan pembayaran.' },
  { q: 'Di mana saya bisa melihat status pesanan?', a: 'Buka menu Akun, lalu Pesanan. Status diperbarui oleh pemilik, mulai dari menunggu konfirmasi, diproses, dikirim, hingga selesai.' },
  { q: 'Bagaimana ukuran, bahan, dan garansi produk?', a: 'Cek deskripsi dan bahan di halaman produk. Jika ukuran atau ketentuan garansi belum tercantum, tanyakan kepada pemilik sebelum memastikan pesanan.' },
]
export const CONTACT_FAQS = HOME_FAQS.slice(1)
