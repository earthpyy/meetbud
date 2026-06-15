import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Role } from '@prisma/client'
import { AppModule } from '../src/app.module'
import { MailService } from '../src/common/mail/mail.service'
import { PrismaService } from '../src/prisma/prisma.service'
import { TokenService } from '../src/auth/token.service'

export class FakeMail {
  loginCodes = new Map<string, string>()
  invites: string[] = []
  async send() {}
  async sendLoginCode(to: string, code: string) {
    this.loginCodes.set(to, code)
  }
  async sendInvite(to: string) {
    this.invites.push(to)
  }
}

export interface TestContext {
  app: INestApplication
  prisma: PrismaService
  tokens: TokenService
  mail: FakeMail
}

export async function bootstrapTestApp(): Promise<TestContext> {
  const mail = new FakeMail()
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MailService)
    .useValue(mail)
    .compile()

  const app = moduleRef.createNestApplication()
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  await app.init()

  return {
    app,
    prisma: app.get(PrismaService),
    tokens: app.get(TokenService),
    mail,
  }
}

let counter = 0
export function uniqueEmail(prefix = 'e2e'): string {
  counter += 1
  return `${prefix}-${process.pid}-${counter}@test.local`
}

export async function createUser(
  ctx: TestContext,
  overrides: Partial<{
    email: string
    name: string
    role: Role
    status: 'active' | 'invited'
  }> = {},
) {
  return ctx.prisma.user.create({
    data: {
      email: overrides.email ?? uniqueEmail(),
      name: overrides.name ?? 'Test User',
      role: overrides.role ?? 'member',
      status: overrides.status ?? 'active',
    },
  })
}

export async function accessTokenFor(
  ctx: TestContext,
  user: { id: string; role: Role },
): Promise<string> {
  const { accessToken } = await ctx.tokens.issueTokens(user)
  return accessToken
}

export async function createMeeting(
  ctx: TestContext,
  organizer: { id: string; name: string; email: string },
  overrides: Partial<{
    title: string
    status: 'upcoming' | 'ongoing' | 'transcribing' | 'summarizing' | 'done'
    attendeeUserIds: string[]
  }> = {},
) {
  const now = new Date()
  return ctx.prisma.meeting.create({
    data: {
      title: overrides.title ?? 'E2E Meeting',
      platform: 'meet',
      status: overrides.status ?? 'done',
      startAt: now,
      endAt: new Date(now.getTime() + 30 * 60000),
      organizerId: organizer.id,
      participants: {
        create: [
          {
            userId: organizer.id,
            name: organizer.name,
            email: organizer.email,
            isOrganizer: true,
          },
          ...(overrides.attendeeUserIds ?? []).map((uid) => ({
            userId: uid,
            name: 'Attendee',
          })),
        ],
      },
    },
    include: { participants: true },
  })
}
