import nodemailer from 'nodemailer'

interface SendResetEmailOptions {
  to: string
  name: string
  resetUrl: string
}

import fs from 'fs'
import path from 'path'
import { ownerEmail } from '@/lib/owner'

export async function sendContactEmail(data: { name: string; email: string; subject: string; message: string }): Promise<void> {
  const config = getSmtpConfig()
  if (!config.smtpUser || !config.smtpPass || !ownerEmail()) throw new Error('Contact email is not configured')
  const transporter = nodemailer.createTransport({ host: config.smtpHost, port: config.smtpPort, secure: config.smtpPort === 465, auth: { user: config.smtpUser, pass: config.smtpPass } })
  await transporter.sendMail({ from: config.fromEmail, to: ownerEmail(), replyTo: data.email, subject: `[Lumière] ${data.subject}`, text: `Nama: ${data.name}\nEmail: ${data.email}\n\n${data.message}` })
}

function getSmtpConfig() {
  let user = process.env.SMTP_USER
  let pass = process.env.SMTP_PASS
  let host = process.env.SMTP_HOST || 'smtp.gmail.com'
  let port = parseInt(process.env.SMTP_PORT || '587')
  let from = process.env.SMTP_FROM

  // Direct read fallback if dev server hasn't restarted
  if (!user || !pass) {
    try {
      const envPath = path.join(process.cwd(), '.env.local')
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8')
        for (const line of content.split('\n')) {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) continue
          const [k, ...vParts] = trimmed.split('=')
          const key = k?.trim()
          const val = vParts.join('=').trim().replace(/^["']|["']$/g, '')
          if (key === 'SMTP_USER' && !user) user = val
          if (key === 'SMTP_PASS' && !pass) pass = val
          if (key === 'SMTP_HOST') host = val
          if (key === 'SMTP_PORT') port = parseInt(val)
          if (key === 'SMTP_FROM') from = val
        }
      }
    } catch {}
  }

  return {
    smtpUser: user || '',
    smtpPass: pass || '',
    smtpHost: host,
    smtpPort: port,
    fromEmail: from || `"Lumière Support" <${user || 'noreply@lumiere.com'}>`,
  }
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: SendResetEmailOptions): Promise<{ success: boolean; preview?: boolean }> {
  const { smtpUser, smtpPass, smtpHost, smtpPort, fromEmail } = getSmtpConfig()

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Kata Sandi Lumière</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1c1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f4; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e7e5e4;">
          <tr>
            <td style="background-color: #1c1917; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                Lumière<span style="color: #e29b47;">.</span>
              </h1>
              <p style="margin: 6px 0 0; color: #a8a29e; font-size: 13px; letter-spacing: 0.5px; text-transform: uppercase;">
                Permintaan Reset Kata Sandi
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #292524;">
                Halo <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #57534e;">
                Kami menerima permintaan untuk mengatur ulang kata sandi akun Lumière Anda.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 32px 0;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: #1c1917;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 12px;">
                      Atur Ulang Kata Sandi
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 32px; word-break: break-all; font-size: 13px; line-height: 20px; color: #d97706; background-color: #fef3c7; padding: 12px; border-radius: 8px;">
                <a href="${resetUrl}" style="color: #b45309;">${resetUrl}</a>
              </p>
              <div style="border-top: 1px solid #e7e5e4; padding-top: 24px;">
                <p style="margin: 0; font-size: 12px; color: #a8a29e;">
                  Tautan berlaku <strong>15 menit</strong>. Abaikan jika bukan Anda yang meminta.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fafaf9; padding: 20px 40px; text-align: center; border-top: 1px solid #e7e5e4;">
              <p style="margin: 0; font-size: 12px; color: #78716c;">
                &copy; ${new Date().getFullYear()} Lumière Furniture. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  if (!smtpUser || !smtpPass) {
    console.log('\n────────────────────────────────────────────────────────────')
    console.log('[DEV EMAIL SIMULATOR] Password Reset Email')
    console.log(`To: ${to} (${name})`)
    console.log(`Reset Link: ${resetUrl}`)
    console.log('────────────────────────────────────────────────────────────\n')
    return { success: true, preview: true }
  }

  const cleanPass = smtpPass.trim().replace(/\s+/g, '')
  const isGmail = smtpHost.includes('gmail')
  const transporter = nodemailer.createTransport(
    isGmail
      ? {
          service: 'gmail',
          auth: { user: smtpUser.trim(), pass: cleanPass },
        }
      : {
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser.trim(), pass: cleanPass },
        }
  )

  const info = await transporter.sendMail({
    from: fromEmail,
    to,
    subject: 'Atur Ulang Kata Sandi Akun Lumière',
    html: htmlContent,
    text: `Halo ${name},\n\nKlik tautan berikut untuk reset kata sandi (berlaku 15 menit):\n${resetUrl}`,
  })

  console.log(`[Mailer] Password reset email sent to ${to}. MessageId: ${info.messageId}`)
  return { success: true, preview: false }
}
