import { IsEmail, Matches } from 'class-validator'

export class VerifyDto {
  @IsEmail()
  email!: string

  @Matches(/^\d{6}$/, { message: 'code must be 6 digits' })
  code!: string
}
