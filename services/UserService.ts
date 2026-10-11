import type { Prisma } from '@prisma/client'
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
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
  }

  private async withAddresses<T>(userId: number, action: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(async tx => {
      // Serialize default-address changes for this customer only.
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`
      return action(tx)
    })
  }

  async createAddress(userId: number, data: AddressDTO) {
    return this.withAddresses(userId, async tx => {
      const count = await tx.address.count({ where: { userId } })
      const isDefault = !!data.isDefault || count === 0
      if (isDefault) await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } })
      return tx.address.create({ data: { ...data, userId, name: data.name.trim(), phone: data.phone.trim(), street: data.street.trim(), city: data.city.trim(), zip: data.zip.trim(), country: data.country ?? 'Indonesia', isDefault } })
    })
  }

  async updateAddress(userId: number, addressId: number, data: Partial<AddressDTO>) {
    return this.withAddresses(userId, async tx => {
      const address = await tx.address.findFirst({ where: { id: addressId, userId } })
      if (!address) throw Object.assign(new Error('Alamat tidak ditemukan.'), { status: 404 })
      if (data.isDefault) await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } })
      // A default remains selected until another address replaces it.
      const patch = { ...data, isDefault: data.isDefault || address.isDefault }
      return tx.address.update({ where: { id: addressId, userId }, data: patch })
    })
  }

  async deleteAddress(userId: number, addressId: number): Promise<void> {
    await this.withAddresses(userId, async tx => {
      const address = await tx.address.findFirst({ where: { id: addressId, userId } })
      if (!address) throw Object.assign(new Error('Alamat tidak ditemukan.'), { status: 404 })
      await tx.address.delete({ where: { id: addressId, userId } })
      if (address.isDefault) {
        const next = await tx.address.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })
        if (next) await tx.address.update({ where: { id: next.id, userId }, data: { isDefault: true } })
      }
    })
  }
}

export const userService = new UserService()
