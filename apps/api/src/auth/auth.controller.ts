import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { TokenService } from './token.service'
import { Public } from './decorators/public.decorator'
import { CurrentUser } from './decorators/current-user.decorator'
import { AuthUser } from './types'
import { RequestCodeDto } from './dto/request-code.dto'
import { VerifyDto } from './dto/verify.dto'
import { RefreshDto } from './dto/refresh.dto'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: TokenService,
  ) {}

  @Public()
  @Post('request-code')
  @HttpCode(200)
  async requestCode(@Body() dto: RequestCodeDto) {
    await this.auth.requestCode(dto.email)
    return { ok: true }
  }

  @Public()
  @Post('verify')
  @HttpCode(200)
  verify(@Body() dto: VerifyDto) {
    return this.auth.verify(dto.email, dto.code)
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.tokens.rotate(dto.refreshToken)
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@CurrentUser() user: AuthUser) {
    await this.tokens.revokeAll(user.userId)
    return { ok: true }
  }
}
