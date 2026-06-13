import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { MailService } from '../common/mail/mail.service'
import { shapeUser, ShapedUser } from '../common/shaping/user-shaping'
import { InviteUserDto } from './dto/invite-user.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { ListUsersQueryDto } from './dto/list-users-query.dto'

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async list(query: ListUsersQueryDto): Promise<ShapedUser[]> {
    const where: Prisma.UserWhereInput = {}
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { email: { contains: query.q, mode: 'insensitive' } },
      ]
    }
    if (query.filter === 'admins') where.role = 'admin'
    else if (query.filter === 'members') {
      where.role = 'member'
      where.status = 'active'
    } else if (query.filter === 'invited') where.status = 'invited'

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return users.map(shapeUser)
  }

  async invite(dto: InviteUserDto): Promise<ShapedUser> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (existing)
      throw new ConflictException('A user with that email already exists')

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.email, // invited users have no name yet; the UI shows their email
        role: dto.role,
        status: 'invited',
      },
    })
    await this.mail.sendInvite(user.email)
    return shapeUser(user)
  }

  async setRole(
    id: string,
    dto: UpdateRoleDto,
    currentUserId: string,
  ): Promise<ShapedUser> {
    if (id === currentUserId) {
      throw new ForbiddenException('You cannot change your own role')
    }
    const user = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
    })
    return shapeUser(user)
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    if (id === currentUserId) {
      throw new ForbiddenException('You cannot remove your own account')
    }
    await this.prisma.user.delete({ where: { id } })
  }

  async resend(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new BadRequestException('User not found')
    if (user.status !== 'invited') {
      throw new BadRequestException('User is not pending an invite')
    }
    await this.mail.sendInvite(user.email)
  }
}
