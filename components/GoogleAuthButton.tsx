'use client'
import Script from 'next/script'
import { useRef, useState, useEffect } from 'react'
import type { AuthUser } from '@/types'
import { LOCAL_STORAGE_KEYS } from '@/constants'
import { apiClient } from '@/services/apiClient'
declare global { interface Window { google?: any } }
interface GoogleAuthButtonProps { text?: 'signin_with' | 'signup_with' | 'continue_with'; onSuccess: (user: AuthUser) => void; onError: (message: string) => void }
export default function GoogleAuthButton({ text = 'signin_with', onSuccess, onError }: GoogleAuthButtonProps) {
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const finish = () => { if (timer.current) clearTimeout(timer.current); setLoading(false) }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  const start = () => {
    if (!window.google?.accounts?.oauth2 || !clientId) { onError('Login Google belum siap. Muat ulang halaman dan coba lagi.'); return }
    setLoading(true)
    timer.current = setTimeout(() => { finish(); onError('Login Google belum selesai. Coba kembali dan pastikan popup diizinkan.') }, 120000)
    try {
      const client = window.google.accounts.oauth2.initTokenClient({ client_id: clientId, scope: 'email profile openid',
        error_callback: (error: { type: string }) => { finish(); onError(error.type === 'popup_closed' ? 'Login Google dibatalkan.' : 'Popup Google tidak dapat dibuka. Izinkan popup lalu coba lagi.') },
        callback: async (response: { access_token?: string; error?: string }) => {
          if (timer.current) clearTimeout(timer.current)
          if (response.error || !response.access_token) { finish(); onError('Google belum memberikan izin login. Silakan coba lagi.'); return }
          try {
            const data = await apiClient.auth.loginWithGoogle(undefined, response.access_token)
            localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, data.token)
            localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(data.user))
            onSuccess(data.user)
          } catch (e) { onError(e instanceof Error ? e.message : 'Login Google gagal.') }
          finally { finish() }
        },
      })
      client.requestAccessToken({ prompt: 'select_account' })
    } catch { finish(); onError('Tidak dapat membuka login Google. Coba lagi.') }
  }
  return <><Script id="google-gsi-script" src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => onError('Layanan Google tidak dapat dimuat. Periksa koneksi atau ekstensi pemblokir.')} /><button type="button" onClick={start} disabled={loading || !ready || !clientId} className="w-full min-h-12 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 py-3.5 rounded-xl font-medium flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" /></svg><span>{loading ? 'Menghubungkan ke Google…' : text === 'signup_with' ? 'Daftar dengan Google' : 'Masuk dengan Google'}</span></button>{!clientId && <p className="field-hint">Login Google belum tersedia. Hubungi pemilik toko.</p>}</>
}
