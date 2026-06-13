import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common'
import { UsersService } from './users.service'

function makeDeps() {
  const prisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }
  const mail = { sendInvite: jest.fn(async () => undefined) }
  return { prisma, mail }
}

const invited = {
  id: 'u2',
  email: 'new@b.com',
  name: 'new@b.com',
  title: null,
  timezone: null,
  role: 'member',
  status: 'invited',
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('UsersService', () => {
  describe('list', () => {
    it('builds an invited filter', async () => {
      const { prisma, mail } = makeDeps()
      prisma.user.findMany.mockResolvedValue([invited])
      const service = new UsersService(prisma as any, mail as any)

      const result = await service.list({ filter: 'invited' })

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'invited' }),
        }),
      )
      expect(result[0]).toMatchObject({ id: 'u2', meetings: 0 })
    })

    it('builds a members filter (active members only)', async () => {
      const { prisma, mail } = makeDeps()
      prisma.user.findMany.mockResolvedValue([])
      const service = new UsersService(prisma as any, mail as any)
      await service.list({ filter: 'members' })
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: 'member', status: 'active' }),
        }),
      )
    })

    it('applies a search query across name and email', async () => {
      const { prisma, mail } = makeDeps()
      prisma.user.findMany.mockResolvedValue([])
      const service = new UsersService(prisma as any, mail as any)
      await service.list({ q: 'ann' })
      const arg = prisma.user.findMany.mock.calls[0][0]
      expect(arg.where.OR).toEqual([
        { name: { contains: 'ann', mode: 'insensitive' } },
        { email: { contains: 'ann', mode: 'insensitive' } },
      ])
    })
  })

  describe('invite', () => {
    it('creates an invited user and sends the invite email', async () => {
      const { prisma, mail } = makeDeps()
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue(invited)
      const service = new UsersService(prisma as any, mail as any)

      const result = await service.invite({
        email: 'new@b.com',
        role: 'member',
      })

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@b.com',
          name: 'new@b.com',
          role: 'member',
          status: 'invited',
        },
      })
      expect(mail.sendInvite).toHaveBeenCalledWith('new@b.com')
      expect(result.status).toBe('invited')
    })

    it('rejects an existing email', async () => {
      const { prisma, mail } = makeDeps()
      prisma.user.findUnique.mockResolvedValue(invited)
      const service = new UsersService(prisma as any, mail as any)
      await expect(
        service.invite({ email: 'new@b.com', role: 'member' }),
      ).rejects.toBeInstanceOf(ConflictException)
    })
  })

  describe('setRole', () => {
    it('blocks acting on yourself', async () => {
      const { prisma, mail } = makeDeps()
      const service = new UsersService(prisma as any, mail as any)
      await expect(
        service.setRole('u1', { role: 'member' }, 'u1'),
      ).rejects.toBeInstanceOf(ForbiddenException)
    })

    it('updates another user role', async () => {
      const { prisma, mail } = makeDeps()
      prisma.user.update.mockResolvedValue({ ...invited, role: 'admin' })
      const service = new UsersService(prisma as any, mail as any)
      const result = await service.setRole('u2', { role: 'admin' }, 'u1')
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u2' },
        data: { role: 'admin' },
      })
      expect(result.role).toBe('admin')
    })
  })

  describe('remove', () => {
    it('blocks removing yourself', async () => {
      const { prisma, mail } = makeDeps()
      const service = new UsersService(prisma as any, mail as any)
      await expect(service.remove('u1', 'u1')).rejects.toBeInstanceOf(
        ForbiddenException,
      )
    })

    it('deletes another user', async () => {
      const { prisma, mail } = makeDeps()
      prisma.user.delete.mockResolvedValue(invited)
      const service = new UsersService(prisma as any, mail as any)
      await service.remove('u2', 'u1')
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u2' } })
    })
  })

  describe('resend', () => {
    it('resends to an invited user', async () => {
      const { prisma, mail } = makeDeps()
      prisma.user.findUnique.mockResolvedValue(invited)
      const service = new UsersService(prisma as any, mail as any)
      await service.resend('u2')
      expect(mail.sendInvite).toHaveBeenCalledWith('new@b.com')
    })

    it('rejects resending to an active user', async () => {
      const { prisma, mail } = makeDeps()
      prisma.user.findUnique.mockResolvedValue({ ...invited, status: 'active' })
      const service = new UsersService(prisma as any, mail as any)
      await expect(service.resend('u2')).rejects.toBeInstanceOf(
        BadRequestException,
      )
    })
  })
})
