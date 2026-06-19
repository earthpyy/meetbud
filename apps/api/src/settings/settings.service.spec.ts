import { SettingsService } from './settings.service'

const baseRow = {
  id: 'default',
  aiApiKey: null as string | null,
  aiBaseUrl: 'https://api.anthropic.com',
  aiModel: 'claude-opus-4-8',
  aiTemperature: 0.3,
  aiSystemPrompt: 'prompt',
  recallApiKey: null as string | null,
  recallBotName: 'meetbud Notetaker',
  recallRegion: 'us-east-1',
  recordingRetentionDays: 90,
  recallAutoLeave: true,
  updatedAt: new Date(),
}

function makeDeps() {
  const prisma = {
    workspaceSettings: {
      upsert: jest.fn().mockResolvedValue(baseRow),
      update: jest.fn().mockResolvedValue(baseRow),
    },
  }
  const crypto = {
    encrypt: jest.fn((v: string) => `enc(${v})`),
    decrypt: jest.fn(),
  }
  return { prisma, crypto }
}

describe('SettingsService', () => {
  it('get() masks secrets and reports set flags', async () => {
    const { prisma, crypto } = makeDeps()
    const svc = new SettingsService(prisma as any, crypto as any)
    const res = await svc.get()
    expect(res).not.toHaveProperty('aiApiKey')
    expect(res).not.toHaveProperty('recallApiKey')
    expect(res.aiApiKeySet).toBe(false)
    expect(res.aiModel).toBe('claude-opus-4-8')
  })

  it('get() reports aiApiKeySet true when a key is stored', async () => {
    const { prisma, crypto } = makeDeps()
    prisma.workspaceSettings.upsert.mockResolvedValue({
      ...baseRow,
      aiApiKey: 'enc(x)',
    })
    const svc = new SettingsService(prisma as any, crypto as any)
    expect((await svc.get()).aiApiKeySet).toBe(true)
  })

  it('update() encrypts a provided secret', async () => {
    const { prisma, crypto } = makeDeps()
    const svc = new SettingsService(prisma as any, crypto as any)
    await svc.update({ aiApiKey: 'sk-real' })
    expect(crypto.encrypt).toHaveBeenCalledWith('sk-real')
    expect(prisma.workspaceSettings.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ aiApiKey: 'enc(sk-real)' }),
      }),
    )
  })

  it('update() leaves the stored secret untouched when no key is sent', async () => {
    const { prisma, crypto } = makeDeps()
    const svc = new SettingsService(prisma as any, crypto as any)
    await svc.update({ aiModel: 'claude-sonnet-4-6' })
    expect(crypto.encrypt).not.toHaveBeenCalled()
    const arg = prisma.workspaceSettings.update.mock.calls[0][0]
    expect(arg.data.aiApiKey).toBeUndefined()
    expect(arg.data.aiModel).toBe('claude-sonnet-4-6')
  })

  it('update() ignores an empty-string secret', async () => {
    const { prisma, crypto } = makeDeps()
    const svc = new SettingsService(prisma as any, crypto as any)
    await svc.update({ aiApiKey: '' })
    expect(crypto.encrypt).not.toHaveBeenCalled()
  })
})
