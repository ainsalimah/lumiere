import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/prisma'
import { signToken, SALT_ROUNDS, TokenPayload } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/mailer'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export interface AuthUserDTO {
  id: number
  name: string
  email: string
  phone: string
  isAdmin: boolean
}

export interface AuthResult {
  token: string
  user: AuthUserDTO
}

function toAuthUserDTO(user: {
  id: number
  name: string
  email: string
  phone: string | null
  isAdmin: boolean
}): AuthUserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    isAdmin: user.isAdmin,
  }
}

async function verifyAndMigratePassword(
  userId: number,
  storedPassword: string,
  plainText: string
): Promise<boolean> {
  if (storedPassword.startsWith('$2')) {
    return bcrypt.compare(plainText, storedPassword)
  }
  if (storedPassword !== plainText) return false
  const hashed = await bcrypt.hash(plainText, SALT_ROUNDS)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
  return true
}

export class AuthService {
  async register(data: {
    name: string
    email: string
    password: string
    phone?: string | null
  }): Promise<AuthResult> {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      throw Object.assign(new Error('An account with this email already exists.'), { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS)
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        phone: data.phone,
      },
    })

    const tokenPayload: TokenPayload = { id: user.id, email: user.email, isAdmin: user.isAdmin }
    return { token: signToken(tokenPayload), user: toAuthUserDTO(user) }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!user) {
      throw Object.assign(new Error('Invalid email or password.'), { status: 401 })
    }
    if (!user.password) {
      throw Object.assign(
        new Error('Akun ini terdaftar lewat Google Sign In. Silakan masuk menggunakan Google.'),
        { status: 400 }
      )
    }

    const match = await verifyAndMigratePassword(user.id, user.password, password)
    if (!match) {
      throw Object.assign(new Error('Invalid email or password.'), { status: 401 })
    }

    const tokenPayload: TokenPayload = { id: user.id, email: user.email, isAdmin: user.isAdmin }
    return { token: signToken(tokenPayload), user: toAuthUserDTO(user) }
  }

  async loginWithGoogle(credential?: string, accessToken?: string): Promise<AuthResult> {
    let email = ''
    let name = ''
    let googleId = ''

    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID || undefined,
      })
      const payload = ticket.getPayload()
      if (!payload?.email) {
        throw Object.assign(new Error('Invalid Google token payload.'), { status: 400 })
      }
      email = payload.email.toLowerCase().trim()
      name = payload.name || payload.given_name || email.split('@')[0]
      googleId = payload.sub
    } else if (accessToken) {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!userRes.ok) {
        throw Object.assign(new Error('Failed to verify Google access token.'), { status: 401 })
      }
      const profile: any = await userRes.json()
      if (!profile.email) {
        throw Object.assign(new Error('Invalid Google user profile.'), { status: 400 })
      }
      email = profile.email.toLowerCase().trim()
      name = profile.name || profile.given_name || email.split('@')[0]
      googleId = profile.sub
    } else {
      throw Object.assign(new Error('Google credential or access token is required.'), { status: 400 })
    }

    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({ data: { name, email, googleId } })
    } else if (!user.googleId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId } })
    }

    const tokenPayload: TokenPayload = { id: user.id, email: user.email, isAdmin: user.isAdmin }
    return { token: signToken(tokenPayload), user: toAuthUserDTO(user) }
  }

  async forgotPassword(email: string, clientUrl: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return // Prevent user enumeration

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: resetToken, resetPasswordExpires: resetExpires },
    })

    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`
    await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl })
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token, resetPasswordExpires: { gt: new Date() } },
    })

    if (!user) {
      throw Object.assign(
        new Error('Tautan reset kata sandi tidak valid atau telah kadaluarsa. Silakan minta tautan baru.'),
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null },
    })
  }
}

export const authService = new AuthService()
