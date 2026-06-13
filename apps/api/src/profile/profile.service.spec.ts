import { ProfileService } from './profile.service'

function makePrisma() {
  return {
    user: { findUniqueOrThrow: jest.fn(), update: jest.fn() },
    userPreference: { upsert: jest.fn() },
  }
}

const baseUser = {
  id: 'u1',
  email: 'a@b.com',
  name: 'Alex Rivera',
  title: 'PM',
  timezone: 'UTC',
  role: 'admin',
  status: 'active',
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}
const basePrefs = {
  id: 'p1',
  userId: 'u1',
  autoRecord: 'organized',
  joinEarly: true,
  notifyOnSummary: true,
  customPromptEnabled: false,
  customPrompt: null,
  weeklyDigest: true,
  slackSummaries: false,
  updatedAt: new Date(),
}

describe('ProfileService', () => {
  it('getProfile returns shaped user + preferences, creating prefs if missing', async () => {
    const prisma = makePrisma()
    prisma.user.findUniqueOrThrow.mockResolvedValue(baseUser)
    prisma.userPreference.upsert.mockResolvedValue(basePrefs)
    const service = new ProfileService(prisma as any)

    const result = await service.getProfile('u1')

    expect(prisma.userPreference.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' } }),
    )
    expect(result.id).toBe('u1')
    expect(result.preferences.autoRecord).toBe('organized')
  })

  it('updateProfile updates only provided account fields', async () => {
    const prisma = makePrisma()
    prisma.user.update.mockResolvedValue({ ...baseUser, name: 'New Name' })
    prisma.userPreference.upsert.mockResolvedValue(basePrefs)
    const service = new ProfileService(prisma as any)

    const result = await service.updateProfile('u1', { name: 'New Name' })

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { name: 'New Name' },
    })
    expect(result.name).toBe('New Name')
  })

  it('updatePreferences upserts the provided preference fields', async () => {
    const prisma = makePrisma()
    prisma.user.findUniqueOrThrow.mockResolvedValue(baseUser)
    prisma.userPreference.upsert.mockResolvedValue({
      ...basePrefs,
      slackSummaries: true,
    })
    const service = new ProfileService(prisma as any)

    const result = await service.updatePreferences('u1', {
      slackSummaries: true,
    })

    expect(prisma.userPreference.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1' },
        update: { slackSummaries: true },
      }),
    )
    expect(result.preferences.slackSummaries).toBe(true)
  })
})
