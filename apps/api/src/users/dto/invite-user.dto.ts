import { Role } from '@prisma/client'
import { IsEmail, IsEnum } from 'class-validator'

export class InviteUserDto {
  @IsEmail()
  email!: string

  @IsEnum(Role)
  role!: Role
}
