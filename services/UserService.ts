import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { SALT_ROUNDS } from '@/lib/auth'
import { isOwner } from '@/lib/owner'

export interface UpdateProfileDTO {
  name: string
  phone?: string | null
}

export interface AddressDTO {
  name: string
  phone: string
  street: string
  city: string
  zip: string
  country?: string
  isDefault?: boolean
}

export class UserService {
  async updateProfile(userId: number, data: UpdateProfileDTO) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name: data.name.trim(), phone: data.phone || null },
    })
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone || '',
      isAdmin: isOwner(updated.email),
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw Object.assign(new Error('User not found'), { status: 404 })
    }
    if (!user.password) {
      throw Object.assign(
        new Error('Akun ini terdaftar lewat Google Sign In dan tidak memiliki kata sandi lama.'),
        { status: 400 }
      )
    }

    const match = user.password.startsWith('$2')
      ? await bcrypt.compare(currentPassword, user.password)
      : user.password === currentPassword

    if (!match) {
      throw Object.assign(new Error('Current password is incorrect.'), { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS)
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } })
  }

  async getAddresses(userId: number) {
    return (prisma as any).address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
  }

  async createAddress(userId: number, data: AddressDTO) {
    if (data.isDefault) {
      await (prisma as any).address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const count = await (prisma as any).address.count({ where: { userId } })
    const isDefault = data.isDefault || count === 0

    return (prisma as any).address.create({
      data: {
        userId,
        name: data.name.trim(),
        phone: data.phone.trim(),
        street: data.street.trim(),
        city: data.city.trim(),
        zip: data.zip.trim(),
        country: data.country ?? 'Indonesia',
        isDefault,
      },
    })
  }

  async updateAddress(userId: number, addressId: number, data: Partial<AddressDTO>) {
    if (data.isDefault) {
      await (prisma as any).address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const patch: Record<string, unknown> = {}
    if (data.name !== undefined) patch.name = data.name.trim()
    if (data.phone !== undefined) patch.phone = data.phone.trim()
    if (data.street !== undefined) patch.street = data.street.trim()
    if (data.city !== undefined) patch.city = data.city.trim()
    if (data.zip !== undefined) patch.zip = data.zip.trim()
    if (data.country !== undefined) patch.country = data.country
    if (data.isDefault !== undefined) patch.isDefault = data.isDefault

    return (prisma as any).address.update({ where: { id: addressId }, data: patch })
  }

  async deleteAddress(addressId: number): Promise<void> {
    await (prisma as any).address.delete({ where: { id: addressId } })
  }
}

export const userService = new UserService()
