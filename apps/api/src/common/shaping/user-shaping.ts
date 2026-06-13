import { Role, User, UserStatus } from '@prisma/client'

const PALETTE = [
  '#6366f1',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#8b5cf6',
  '#ef4444',
  '#22c55e',
  '#06b6d4',
  '#a855f7',
  '#eab308',
]

export function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  const single = words[0] ?? ''
  // Email-like single token → just the first character.
  if (single.includes('@')) return single[0].toUpperCase()
  return single.slice(0, 2).toUpperCase()
}

export function colorFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]
}

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
