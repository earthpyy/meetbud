import { Role } from '@prisma/client'
import { ShapedUser } from '../common/shaping/user-shaping'

export interface AuthUser {
  userId: string
  role: Role
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthResult extends TokenPair {
  user: ShapedUser
}

export interface AccessTokenPayload {
  sub: string
  role: Role
}

export interface RefreshTokenPayload {
  sub: string
  jti: string
}
