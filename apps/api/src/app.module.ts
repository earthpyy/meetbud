import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { validateEnv } from './config/env.validation'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './common/redis/redis.module'
import { MailModule } from './common/mail/mail.module'
import { AuthModule } from './auth/auth.module'
import { ProfileModule } from './profile/profile.module'
import { UsersModule } from './users/users.module'
import { MeetingsModule } from './meetings/meetings.module'
import { CryptoModule } from './common/crypto/crypto.module'
import { SettingsModule } from './settings/settings.module'
import { AnalyticsModule } from './analytics/analytics.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    PrismaModule,
    RedisModule,
    MailModule,
    AuthModule,
    ProfileModule,
    UsersModule,
    MeetingsModule,
    CryptoModule,
    SettingsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
