// Indonesian Province & City / Regency dataset for e-commerce address selection (Shopee style)

export interface SavedAddress {
  id: number
  name: string
  phone: string
  street: string
  city: string
  zip: string
  country: string
  isDefault?: boolean
}

export const PROVINCE_CITY_MAP: Record<string, string[]> = {
  'DKI Jakarta': [
    'Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Jakarta Timur', 'Jakarta Utara', 'Kepulauan Seribu'
  ],
  'Jawa Barat': [
    'Kota Bandung', 'Kota Bekasi', 'Kota Bogor', 'Kota Depok', 'Kota Cimahi', 'Kota Cirebon', 'Kota Tasikmalaya', 'Kota Sukabumi', 'Kota Banjar',
    'Kab. Bandung', 'Kab. Bandung Barat', 'Kab. Bogor', 'Kab. Bekasi', 'Kab. Karawang', 'Kab. Cirebon', 'Kab. Garut', 'Kab. Purwakarta', 'Kab. Subang', 'Kab. Sumedang', 'Kab. Indramayu', 'Kab. Cianjur', 'Kab. Sukabumi', 'Kab. Kuningan', 'Kab. Majalengka', 'Kab. Ciamis', 'Kab. Pangandaran'
  ],
  'Banten': [
    'Kota Tangerang', 'Kota Tangerang Selatan', 'Kota Serang', 'Kota Cilegon', 'Kab. Tangerang', 'Kab. Serang', 'Kab. Lebak', 'Kab. Pandeglang'
  ],
  'Jawa Tengah': [
    'Kota Semarang', 'Kota Surakarta (Solo)', 'Kota Magelang', 'Kota Salatiga', 'Kota Pekalongan', 'Kota Tegal',
    'Kab. Banyumas (Purwokerto)', 'Kab. Cilacap', 'Kab. Kudus', 'Kab. Jepara', 'Kab. Klaten', 'Kab. Sukoharjo', 'Kab. Karanganyar', 'Kab. Boyolali', 'Kab. Kendal', 'Kab. Brebes', 'Kab. Batang', 'Kab. Demak', 'Kab. Grobogan', 'Kab. Kebumen', 'Kab. Magelang', 'Kab. Pati', 'Kab. Pemalang', 'Kab. Purbalingga', 'Kab. Purworejo', 'Kab. Rembang', 'Kab. Sragen', 'Kab. Temanggung', 'Kab. Wonogiri', 'Kab. Wonosobo'
  ],
  'DI Yogyakarta': [
    'Kota Yogyakarta', 'Kab. Sleman', 'Kab. Bantul', 'Kab. Kulon Progo', 'Kab. Gunungkidul'
  ],
  'Jawa Timur': [
    'Kota Surabaya', 'Kota Malang', 'Kota Sidoarjo', 'Kota Gresik', 'Kota Kediri', 'Kota Blitar', 'Kota Madiun', 'Kota Pasuruan', 'Kota Probolinggo', 'Kota Batu', 'Kota Mojokerto',
    'Kab. Malang', 'Kab. Sidoarjo', 'Kab. Gresik', 'Kab. Jember', 'Kab. Banyuwangi', 'Kab. Mojokerto', 'Kab. Jombang', 'Kab. Lamongan', 'Kab. Bojonegoro', 'Kab. Blitar', 'Kab. Kediri', 'Kab. Lumajang', 'Kab. Madiun', 'Kab. Magetan', 'Kab. Nganjuk', 'Kab. Ngawi', 'Kab. Pacitan', 'Kab. Pamekasan', 'Kab. Pasuruan', 'Kab. Ponorogo', 'Kab. Probolinggo', 'Kab. Sampang', 'Kab. Situbondo', 'Kab. Sumenep', 'Kab. Trenggalek', 'Kab. Tuban', 'Kab. Tulungagung', 'Kab. Bangkalan'
  ],
  'Bali': [
    'Kota Denpasar', 'Kab. Badung (Kuta/Canggu/Seminyak)', 'Kab. Gianyar (Ubud)', 'Kab. Tabanan', 'Kab. Buleleng', 'Kab. Karangasem', 'Kab. Klungkung', 'Kab. Bangli', 'Kab. Jembrana'
  ],
  'Sumatera Utara': [
    'Kota Medan', 'Kota Binjai', 'Kota Pematangsiantar', 'Kota Tebing Tinggi', 'Kota Tanjungbalai', 'Kab. Deli Serdang', 'Kab. Karo', 'Kab. Langkat', 'Kab. Simalungun', 'Kab. Asahan'
  ],
  'Sumatera Barat': [
    'Kota Padang', 'Kota Bukittinggi', 'Kota Payakumbuh', 'Kota Pariaman', 'Kota Solok', 'Kab. Agam', 'Kab. Padang Pariaman', 'Kab. Tanah Datar'
  ],
  'Riau': [
    'Kota Pekanbaru', 'Kota Dumai', 'Kab. Kampar', 'Kab. Siak', 'Kab. Bengkalis', 'Kab. Pelalawan'
  ],
  'Kepulauan Riau': [
    'Kota Batam', 'Kota Tanjungpinang', 'Kab. Bintan', 'Kab. Karimun'
  ],
  'Sumatera Selatan': [
    'Kota Palembang', 'Kota Prabumulih', 'Kota Lubuklinggau', 'Kab. Banyuasin', 'Kab. Ogan Ilir', 'Kab. Muara Enim'
  ],
  'Lampung': [
    'Kota Bandar Lampung', 'Kota Metro', 'Kab. Lampung Selatan', 'Kab. Lampung Tengah', 'Kab. Pringsewu'
  ],
  'Aceh': [
    'Kota Banda Aceh', 'Kota Sabang', 'Kota Lhokseumawe', 'Kota Langsa', 'Kab. Aceh Besar'
  ],
  'Jambi': [
    'Kota Jambi', 'Kab. Muaro Jambi', 'Kab. Batanghari', 'Kota Sungai Penuh'
  ],
  'Bengkulu': [
    'Kota Bengkulu', 'Kab. Rejang Lebong', 'Kab. Bengkulu Selatan'
  ],
  'Bangka Belitung': [
    'Kota Pangkalpinang', 'Kab. Bangka', 'Kab. Belitung'
  ],
  'Kalimantan Barat': [
    'Kota Pontianak', 'Kota Singkawang', 'Kab. Kubu Raya', 'Kab. Sambas', 'Kab. Ketapang'
  ],
  'Kalimantan Selatan': [
    'Kota Banjarmasin', 'Kota Banjarbaru', 'Kab. Banjar', 'Kab. Tanah Bumbu'
  ],
  'Kalimantan Tengah': [
    'Kota Palangka Raya', 'Kab. Kotawaringin Timur (Sampit)', 'Kab. Kotawaringin Barat (Pangkalan Bun)'
  ],
  'Kalimantan Timur': [
    'Kota Balikpapan', 'Kota Samarinda', 'Kota Bontang', 'Kab. Kutai Kartanegara', 'IKN Nusantara'
  ],
  'Kalimantan Utara': [
    'Kota Tarakan', 'Kab. Bulungan'
  ],
  'Sulawesi Selatan': [
    'Kota Makassar', 'Kota Parepare', 'Kota Palopo', 'Kab. Gowa', 'Kab. Maros', 'Kab. Bone'
  ],
  'Sulawesi Utara': [
    'Kota Manado', 'Kota Tomohon', 'Kota Bitung', 'Kota Kotamobagu', 'Kab. Minahasa', 'Kab. Minahasa Utara'
  ],
  'Sulawesi Tengah': [
    'Kota Palu', 'Kab. Banggai', 'Kab. Donggala'
  ],
  'Sulawesi Tenggara': [
    'Kota Kendari', 'Kota Baubau', 'Kab. Konawe'
  ],
  'Nusa Tenggara Barat': [
    'Kota Mataram', 'Kota Bima', 'Kab. Lombok Barat', 'Kab. Lombok Tengah', 'Kab. Lombok Timur'
  ],
  'Nusa Tenggara Timur': [
    'Kota Kupang', 'Kab. Manggarai Barat (Labuan Bajo)', 'Kab. Sikka'
  ],
  'Lainnya': [
    'Lainnya / Luar Wilayah di Atas'
  ]
}

export function parseShopeeAddress(rawStreet: string, rawCity: string) {
  const isOffice = rawStreet.includes('(Kantor)')
  const label: 'Rumah' | 'Kantor' = isOffice ? 'Kantor' : 'Rumah'

  let cleanStreet = rawStreet.replace(/\s*\((Rumah|Kantor)\)/g, '').trim()
  let notes = ''
  const patokanMatch = cleanStreet.match(/\(Patokan:\s*([^)]+)\)/i)
  if (patokanMatch) {
    notes = patokanMatch[1].trim()
    cleanStreet = cleanStreet.replace(/\s*\(Patokan:\s*[^)]+\)/i, '').trim()
  }

  let district = ''
  let city = 'Kota Bandung'
  let province = 'Jawa Barat'

  const parts = rawCity.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length >= 3) {
    district = parts[0]
    city = parts[1]
    province = parts[2]
  } else if (parts.length === 2) {
    district = parts[0]
    city = parts[1]
  } else if (parts.length === 1) {
    city = parts[0]
  }

  if (!PROVINCE_CITY_MAP[province]) {
    province = 'Lainnya'
  }

  return { label, cleanStreet, notes, district, city, province }
}

export function formatShopeeStreet(street: string, notes?: string, label?: 'Rumah' | 'Kantor') {
  let s = street.trim()
  if (notes && notes.trim()) {
    s += ` (Patokan: ${notes.trim()})`
  }
  if (label) {
    s += ` (${label})`
  }
  return s
}

export function formatShopeeCity(district: string, city: string, province: string) {
  const prov = province !== 'Lainnya' ? `, ${province}` : ''
  return `${district.trim()}, ${city.trim()}${prov}`
}
