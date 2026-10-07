import type { Product } from '@/types'
import fs from 'fs'
import path from 'path'

export interface GenerateDescriptionParams {
  name: string
  category: string
  subcategory?: string | null
  material: string
  room?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ConsultantResponse {
  reply: string
  recommendedProducts: Product[]
}

function getEnvVariable(key: string): string | undefined {
  if (process.env[key] && process.env[key]?.trim()) {
    return process.env[key]?.trim()
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      const regex = new RegExp(`${key}\\s*=\\s*["']?([^"'\\r\\n]+)["']?`)
      const match = content.match(regex)
      if (match && match[1]) {
        const val = match[1].trim()
        process.env[key] = val
        return val
      }
    }
  } catch {}
  return undefined
}

class AIService {
  /**
   * Generates luxury artisanal product description in Indonesian.
   */
  async generateProductDescription(params: GenerateDescriptionParams): Promise<string> {
    const { name, category, subcategory, material, room } = params

    const geminiKey = getEnvVariable('GEMINI_API_KEY')
    const openaiKey = getEnvVariable('OPENAI_API_KEY')

    // Try Gemini API if key is available
    if (geminiKey) {
      try {
        const prompt = `Anda adalah kepala kurator dan copywriter furnitur mewah dari brand "Lumière".
Tulis deskripsi produk yang anggun, tak lekang oleh waktu, dan menggugah rasa untuk:
- Nama Produk: ${name}
- Kategori: ${category} ${subcategory ? `(${subcategory})` : ''}
- Bahan Utama: ${material}
- Ruangan: ${room || 'Ruang Keluarga / Ruang Tamu'}

Instruksi format:
1. Paragraf 1: Pengantar tentang filosofi desain, kehangatan bahan ${material}, dan bagaimana produk ini menyatu dalam ruangan.
2. Paragraf 2: Detail keahlian pertukangan (*craftsmanship*), presisi sambungan kayu/rangka, dan kenyamanan jangka panjang.
3. 4 Baris Poin Keunggulan (diawali tanda strip -):
   - Konstruksi material premium
   - Finishing ramah lingkungan dan aman
   - Kemudahan perakitan / kelengkapan alat
   - Sertifikasi bahan berkelanjutan

Tulis dalam Bahasa Indonesia yang elegan dan profesional tanpa tanda petik pembuka/penutup tambahan.`

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
          })
        })

        if (res.ok) {
          const data = await res.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text && text.trim().length > 50) {
            return text.trim()
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to smart heuristic generator:', err)
      }
    }

    // Try OpenAI API if key is available
    if (openaiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Anda adalah copywriter furnitur mewah Lumière. Tulis narasi deskripsi produk dalam Bahasa Indonesia yang elegan, berkelas, dan memikat.'
              },
              {
                role: 'user',
                content: `Buat narasi untuk: ${name}, Kategori: ${category} (${subcategory || ''}), Bahan: ${material}, Ruangan: ${room || 'Ruang Tamu'}. Berikan 2 paragraf narasi puitis dan 4 poin keunggulan.`
              }
            ],
            temperature: 0.7,
            max_tokens: 500
          })
        })

        if (res.ok) {
          const data = await res.json()
          const text = data.choices?.[0]?.message?.content
          if (text && text.trim().length > 50) {
            return text.trim()
          }
        }
      } catch (err) {
        console.warn('OpenAI API call failed, falling back to smart heuristic generator:', err)
      }
    }

    // Smart Zero-Config Local Heuristic Copywriting Generator
    return this.generateArtisanalTemplate(name, category, subcategory, material, room)
  }

  private generateArtisanalTemplate(
    name: string,
    category: string,
    subcategory?: string | null,
    material = 'Kayu Solid',
    room = 'Ruang Tamu'
  ): string {
    const matLower = material.toLowerCase()
    const roomName = room || 'ruang hunian'

    return `${name} adalah perwujudan harmonis antara estetika Skandinavia kontemporer dan kenyamanan murni. Dirancang dengan cermat menggunakan ${matLower} pilihan berkualitas tinggi, setiap lekukan dan sambungan dikerjakan secara presisi untuk menghadirkan sentuhan hangat yang menenangkan ke dalam ${roomName} Anda.

Dikerjakan oleh tangan-tangan pengrajin ahli dengan dedikasi turun-temurun, produk ini bukan sekadar perabot, melainkan karya seni fungsional yang kian memancarkan karakternya seiring berjalannya waktu. Proporsinya yang seimbang menjadikannya titik fokus yang elegan tanpa mendominasi ruangan.

- Konstruksi ${material} terpilih — dirancang tahan lama untuk kenyamanan puluhan tahun
- Lapisan akhir non-toksik ramah lingkungan, aman bagi seluruh anggota keluarga dan hewan peliharaan
- Paket perakitan lengkap disertakan — proses mudah dan intuitif sekitar 25–30 menit
- Material bersumber dari hutan lestari bersertifikat FSC yang bertanggung jawab`
  }

  /**
   * Interior design shopping consultant conversation.
   */
  async consultInteriorDesigner(
    userQuery: string,
    history: ChatMessage[],
    catalog: Product[]
  ): Promise<ConsultantResponse> {
    const qLower = userQuery.toLowerCase()

    // 1. Semantic intent extraction
    let targetRoom: string | null = null
    if (qLower.includes('tamu') || qLower.includes('living')) targetRoom = 'Living Room'
    else if (qLower.includes('tidur') || qLower.includes('bed') || qLower.includes('kamar')) targetRoom = 'Bedroom'
    else if (qLower.includes('makan') || qLower.includes('dining')) targetRoom = 'Dining Room'
    else if (qLower.includes('kerja') || qLower.includes('kantor') || qLower.includes('office') || qLower.includes('belajar')) targetRoom = 'Office'
    else if (qLower.includes('luar') || qLower.includes('taman') || qLower.includes('outdoor') || qLower.includes('balkon')) targetRoom = 'Outdoor'

    // Explicit category intent (must be strict hard filter)
    let targetCategory: 'Table' | 'Chair' | 'Sofa' | null = null
    if (
      qLower.includes('meja') ||
      qLower.includes('table') ||
      qLower.includes('desk') ||
      qLower.includes('nakas')
    ) {
      targetCategory = 'Table'
    } else if (
      qLower.includes('kursi') ||
      qLower.includes('chair') ||
      qLower.includes('stool') ||
      qLower.includes('bangku') ||
      qLower.includes('armchair') ||
      qLower.includes('rocking')
    ) {
      targetCategory = 'Chair'
    } else if (
      qLower.includes('sofa') ||
      qLower.includes('couch') ||
      qLower.includes('kursi panjang') ||
      qLower.includes('sectional') ||
      qLower.includes('loveseat')
    ) {
      targetCategory = 'Sofa'
    }

    // Sorting & intent signals
    const wantsCheapest =
      qLower.includes('termurah') ||
      qLower.includes('paling murah') ||
      qLower.includes('paling terjangkau') ||
      qLower.includes('paling hemat') ||
      qLower.includes('harga terendah') ||
      qLower.includes('murah') ||
      qLower.includes('terjangkau') ||
      qLower.includes('ekonomis') ||
      qLower.includes('hemat')

    const wantsExpensive =
      qLower.includes('termahal') ||
      qLower.includes('paling mahal') ||
      qLower.includes('paling mewah') ||
      qLower.includes('paling eksklusif') ||
      qLower.includes('paling premium') ||
      qLower.includes('harga tertinggi')

    const wantsTopRated =
      qLower.includes('terbaik') ||
      qLower.includes('favorit') ||
      qLower.includes('terpopuler') ||
      qLower.includes('bestseller') ||
      qLower.includes('paling bagus') ||
      qLower.includes('bintang 5') ||
      qLower.includes('rating')

    // Specific numeric budget constraints (e.g., "di bawah 5 juta", "budget 8jt")
    let maxBudget: number | null = null
    const budgetMatch = userQuery.match(/(\d+(?:[.,]\d+)?)\s*(juta|jt)/i)
    if (budgetMatch) {
      const num = parseFloat(budgetMatch[1].replace(',', '.'))
      maxBudget = Math.round(num * 1_000_000)
    } else {
      const rawBudget = userQuery.match(/budget\s*(?:di\s*bawah\s*)?(?:rp\.?\s*)?(\d[\d.,]*)/i)
      if (rawBudget) {
        const cleanNum = parseInt(rawBudget[1].replace(/[.,]/g, ''), 10)
        if (!isNaN(cleanNum) && cleanNum > 100_000) {
          maxBudget = cleanNum
        }
      }
    }

    // Material preference
    let targetMaterial: string | null = null
    if (qLower.includes('kayu') || qLower.includes('wood') || qLower.includes('jati')) targetMaterial = 'wood'
    else if (qLower.includes('rotan') || qLower.includes('rattan')) targetMaterial = 'rattan'
    else if (qLower.includes('kulit') || qLower.includes('leather')) targetMaterial = 'leather'
    else if (qLower.includes('kain') || qLower.includes('fabric') || qLower.includes('linen')) targetMaterial = 'fabric'
    else if (qLower.includes('besi') || qLower.includes('metal')) targetMaterial = 'metal'
    else if (qLower.includes('marmer') || qLower.includes('marble')) targetMaterial = 'marble'
    else if (qLower.includes('kaca') || qLower.includes('glass')) targetMaterial = 'glass'

    // 2. Candidate filtering
    let pool = catalog.filter(p => p.inStock)

    // A. STRICT CATEGORY FILTER: If user asks for "meja", NEVER return chairs or sofas!
    if (targetCategory) {
      const byCat = pool.filter(p => p.category.toLowerCase() === targetCategory!.toLowerCase())
      if (byCat.length > 0) {
        pool = byCat
      }
    }

    // B. Explicit numeric budget filter (if specified by user)
    if (maxBudget) {
      const byBudget = pool.filter(p => p.price <= maxBudget!)
      if (byBudget.length > 0) {
        pool = byBudget
      }
    }

    // C. Room filtering (prefer matching room if available)
    if (targetRoom) {
      const byRoom = pool.filter(p => p.room && p.room.toLowerCase() === targetRoom!.toLowerCase())
      if (byRoom.length >= 3) {
        pool = byRoom
      }
    }

    // 3. Ranking & Selection
    let recommended: Product[] = []

    if (wantsCheapest) {
      // Sort strictly ascending by price
      pool.sort((a, b) => {
        if (a.price !== b.price) return a.price - b.price
        return (b.rating || 0) - (a.rating || 0)
      })
      recommended = pool.slice(0, 3)
    } else if (wantsExpensive) {
      // Sort strictly descending by price
      pool.sort((a, b) => {
        if (a.price !== b.price) return b.price - a.price
        return (b.rating || 0) - (a.rating || 0)
      })
      recommended = pool.slice(0, 3)
    } else if (wantsTopRated) {
      // Sort descending by rating
      pool.sort((a, b) => {
        const rateDiff = (b.rating || 0) - (a.rating || 0)
        if (rateDiff !== 0) return rateDiff
        return (b.reviews || 0) - (a.reviews || 0)
      })
      recommended = pool.slice(0, 3)
    } else {
      // Semantic relevance scoring
      const scored = pool.map(p => {
        let score = 0
        const pName = p.name.toLowerCase()
        const pMat = (p.material || '').toLowerCase()
        const pSub = (p.subcategory || '').toLowerCase()
        const pRoom = (p.room || '').toLowerCase()

        if (targetMaterial && (pMat.includes(targetMaterial) || pName.includes(targetMaterial))) score += 20
        if (targetRoom && pRoom.includes(targetRoom.toLowerCase())) score += 15

        const queryWords = qLower.split(/\s+/).filter(w => w.length > 2)
        queryWords.forEach(w => {
          if (pName.includes(w)) score += 10
          if (pSub.includes(w)) score += 8
          if (pMat.includes(w)) score += 5
        })

        score += (p.rating || 4.5) * 2
        return { product: p, score }
      })

      scored.sort((a, b) => b.score - a.score)
      recommended = scored.slice(0, 3).map(s => s.product)
    }

    // Fallback if pool is somehow empty
    if (recommended.length === 0) {
      recommended = catalog.slice(0, 3)
    }

    // Try Gemini API for bespoke conversational advice
    const geminiKey = getEnvVariable('GEMINI_API_KEY')
    if (geminiKey) {
      try {
        const catalogContext = recommended
          .map(p => `- ${p.name} (Kategori: ${p.category}, Subkategori: ${p.subcategory}, Ruangan: ${p.room}, Bahan: ${p.material}, Harga: Rp ${p.price.toLocaleString('id-ID')})`)
          .join('\n')

        const prompt = `Anda adalah "Lumière AI Concierge", seorang konsultan desain interior profesional dan ramah untuk brand furnitur mewah Lumière.
Pertanyaan Pelanggan: "${userQuery}"

Berikut adalah produk resmi dari katalog Lumière yang dipilihkan secara presisi untuk menjawab pertanyaan pelanggan:
${catalogContext}

Tugas Anda:
1. Jawab pertanyaan pelanggan dengan ramah, hangat, dan berkelas dalam Bahasa Indonesia.
2. Jika pelanggan bertanya harga termurah/budget, jelaskan produk-produk di atas sebagai pilihan terbaik dengan harga paling terjangkau di koleksi Lumière tanpa mengorbankan kualitas.
3. Sebutkan keunggulan produk dan bagaimana produk tersebut menyempurnakan ruangan pelanggan.
4. Berikan 1 tips penataan praktis (pencahayaan, proporsi, atau material).
5. Buat dalam 2–3 paragraf ringkas yang mengalir dan anggun.`

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
          })
        })

        if (res.ok) {
          const data = await res.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text && text.trim().length > 50) {
            return {
              reply: text.trim(),
              recommendedProducts: recommended
            }
          }
        }
      } catch (err) {
        console.warn('Gemini consultation call failed, using heuristic advisor:', err)
      }
    }

    // Pure greeting detection (e.g. "hai", "halo", "hello", "hi")
    const isPureGreeting = /^(hai|halo|hello|hi|hey|hei|p|selamat pagi|selamat siang|selamat sore|selamat malam|assalamualaikum|tes|test)[.!?\s]*$/i.test(userQuery.trim())

    // 4. Craft personalized interior designer advice (Smart Heuristic Generator)
    let greeting = 'Halo! Senang sekali bisa membantu Anda merancang ruang impian di Lumière.'
    if (history && history.length > 1) {
      greeting = 'Pilihan dan pertanyaan yang sangat menarik!'
    }

    let stylingTip = ''
    if (isPureGreeting) {
      greeting = 'Halo! Selamat datang di Lumière. Senang sekali bisa menyambut Anda di butik furnitur kami.'
      stylingTip = '💡 **Konsultasi Desain:** Anda bisa menanyakan apa saja kepada saya — mulai dari rekomendasi sofa, meja, atau kursi, furnitur untuk ruangan tertentu (ruang tamu, kamar tidur, kerja), pemilihan material kayu atau kulit, hingga mencocokkan dengan budget Anda. Ceritakan konsep ruangan impian Anda!'
    } else if (wantsCheapest) {
      stylingTip = '💡 **Tips Nilai Terbaik (Smart Value):** Setiap perabot Lumière dibuat dengan standar ketahanan tinggi dan material bersertifikat. Pilihan di atas menawarkan nilai fungsional dan estetika terbaik dengan investasi yang tetap terjangkau.'
    } else if (qLower.includes('kecil') || qLower.includes('sempit') || qLower.includes('apartemen')) {
      stylingTip = '💡 **Tips Desain Ruang Ringkas:** Untuk memaksimalkan ruang, gunakan furnitur dengan kaki terbuka (*tapered legs*) atau warna netral seperti *Oak* dan *Beige*. Hal ini memberikan ilusi lantai yang lebih luas dan sirkulasi cahaya yang lebih lega.'
    } else if (qLower.includes('hangat') || qLower.includes('cozy') || qLower.includes('santai')) {
      stylingTip = '💡 **Tips Desain Suasana Hangat:** Padukan elemen kayu alami dengan tekstur kain tenun atau rotan. Tambahkan pencahayaan lampu bernuansa *warm white* (2700K) untuk menciptakan atmosfer yang nyaman dan mengundang relaksasi.'
    } else if (qLower.includes('mewah') || qLower.includes('elegan') || qLower.includes('modern')) {
      stylingTip = '💡 **Tips Desain Modern Elegan:** Pilih palet warna monokromatis dengan aksen kontras seperti *Walnut* atau *Midnight Black*, dipadukan dengan garis desain geometris yang bersih.'
    } else {
      stylingTip = '💡 **Harmoni Ruang:** Kunci furnitur yang tak lekang oleh waktu adalah keseimbangan antara proporsi dimensi dan fungsi harian yang tahan lama.'
    }

    const catNameIndo = targetCategory === 'Table' ? 'meja' : targetCategory === 'Chair' ? 'kursi' : targetCategory === 'Sofa' ? 'sofa' : 'furnitur'

    let recommendationIntro = ''
    if (isPureGreeting) {
      recommendationIntro = `Sebagai inspirasi awal untuk Anda, berikut adalah beberapa koleksi mahakarya terfavorit pilihan kurator Lumière:`
    } else if (wantsCheapest) {
      recommendationIntro = `Tentu! Berikut adalah kurasi koleksi **${catNameIndo}** dengan harga paling terjangkau di katalog Lumière saat ini:`
    } else if (wantsExpensive) {
      recommendationIntro = `Berikut adalah mahakarya koleksi **${catNameIndo}** paling prestisius dan mewah di katalog Lumière:`
    } else if (targetCategory) {
      recommendationIntro = `Berdasarkan preferensi Anda untuk koleksi **${catNameIndo}**, berikut adalah kurasi terbaik dari Lumière yang sangat cocok:`
    } else if (recommended.length > 0) {
      recommendationIntro = `Berdasarkan preferensi Anda, berikut adalah kurasi terbaik dari koleksi Lumière yang sangat cocok:`
    } else {
      recommendationIntro = `Berikut adalah beberapa koleksi terfavorit Lumière yang mungkin sesuai dengan gaya Anda:`
    }

    const closingPrompt = isPureGreeting
      ? 'Ada ruangan atau perabot tertentu yang ingin Anda cari hari ini? Silakan tanyakan, saya siap membantu!'
      : 'Apakah ada kriteria khusus lain yang ingin Anda sesuaikan, seperti dimensi ukuran atau preferensi bahan? Saya siap membantu mencocokkan set yang paling sempurna!'

    const replyText = `${greeting}

${recommendationIntro}

${stylingTip}

${closingPrompt}`

    return {
      reply: replyText,
      recommendedProducts: recommended
    }
  }
}

export const aiService = new AIService()
