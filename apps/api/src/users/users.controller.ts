import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { AuthUser } from '../auth/types'
import { UsersService } from './users.service'
import { InviteUserDto } from './dto/invite-user.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { ListUsersQueryDto } from './dto/list-users-query.dto'

@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(@Query() query: ListUsersQueryDto) {
    return this.users.list(query)
  }

  @Post()
  invite(@Body() dto: InviteUserDto) {
    return this.users.invite(dto)
  }

  @Patch(':id/role')
  setRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.users.setRole(id, dto, user.userId)
  }

  @Delete(':id')
  @HttpCode(200)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    await this.users.remove(id, user.userId)
    return { ok: true }
  }

  @Post(':id/resend')
  @HttpCode(200)
  async resend(@Param('id') id: string) {
    await this.users.resend(id)
    return { ok: true }
  }
}
