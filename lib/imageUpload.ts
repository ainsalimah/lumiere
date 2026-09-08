/**
 * Image upload utility for Next.js.
 * On Vercel (production), filesystem is read-only — base64 images are stored as-is in the DB.
 * In local development, they can optionally be saved to public/uploads.
 */
export function saveBase64Image(dataString: string, prefix = 'img'): string | null {
  if (!dataString || typeof dataString !== 'string') return null
  if (!dataString.startsWith('data:image/')) return dataString

  // On Vercel or production: keep base64 directly in DB
  // This is acceptable for this project's scale
  return dataString
}

export function deleteUploadedImage(_imageUrl?: string | null): void {
  // No-op on serverless — files are stored as base64 in DB
}
