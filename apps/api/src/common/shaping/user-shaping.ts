import { Role, User, UserStatus } from '@prisma/client'
import { initialsFrom, colorFor } from './person-shaping'

export { initialsFrom, colorFor }

export interface ShapedUser {
  id: string
  name: string
  email: string
  title: string | null
  timezone: string | null
  role: Role
  status: UserStatus
  initials: string
  color: string
  lastActiveAt: Date | null
  meetings: number
  createdAt: Date
}

export function shapeUser(user: User): ShapedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    title: user.title,
    timezone: user.timezone,
    role: user.role,
    status: user.status,
    initials: initialsFrom(user.name),
    color: colorFor(user.id),
    lastActiveAt: user.lastLoginAt,
    meetings: 0, // placeholder until the meetings domain exists
    createdAt: user.createdAt,
  }
}
