import { IsIn, IsOptional, IsString } from 'class-validator'

export type UserFilter = 'all' | 'admins' | 'members' | 'invited'

export class ListUsersQueryDto {
  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @IsIn(['all', 'admins', 'members', 'invited'])
  filter?: UserFilter
}
