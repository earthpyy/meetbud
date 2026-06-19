import { randomBytes } from 'crypto'
import { CryptoService } from './crypto.service'

function makeService(): CryptoService {
  const key = randomBytes(32).toString('base64')
  const config = { get: () => key } as any
  return new CryptoService(config)
}

describe('CryptoService', () => {
  it('round-trips a value without exposing plaintext', () => {
    const svc = makeService()
    const enc = svc.encrypt('sk-ant-secret')
    expect(enc).not.toContain('sk-ant-secret')
    expect(svc.decrypt(enc)).toBe('sk-ant-secret')
  })

  it('produces distinct ciphertext per call (random IV)', () => {
    const svc = makeService()
    expect(svc.encrypt('x')).not.toBe(svc.encrypt('x'))
  })

  it('throws when the key does not decode to 32 bytes', () => {
    const config = { get: () => Buffer.from('short').toString('base64') } as any
    expect(() => new CryptoService(config)).toThrow()
  })

  it('rejects tampered ciphertext', () => {
    const svc = makeService()
    const enc = svc.encrypt('hello')
    const [iv, tag] = enc.split(':')
    const tampered = [iv, tag, Buffer.from('garbage').toString('base64')].join(':')
    expect(() => svc.decrypt(tampered)).toThrow()
  })
})
