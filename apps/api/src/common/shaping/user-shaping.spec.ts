import { initialsFrom, colorFor, shapeUser } from './user-shaping'

describe('user-shaping', () => {
  describe('initialsFrom', () => {
    it('uses first letters of the first two words', () => {
      expect(initialsFrom('Alex Rivera')).toBe('AR')
    })
    it('handles a single word', () => {
      expect(initialsFrom('Madonna')).toBe('MA')
    })
    it('handles an email-like name', () => {
      expect(initialsFrom('grace@acme.com')).toBe('G')
    })
  })

  describe('colorFor', () => {
    it('is deterministic for the same id', () => {
      expect(colorFor('abc')).toBe(colorFor('abc'))
    })
    it('returns a hex colour from the palette', () => {
      expect(colorFor('xyz')).toMatch(/^#[0-9a-f]{6}$/)
    })
  })

  describe('shapeUser', () => {
    it('exposes initials, color and the public fields', () => {
      const shaped = shapeUser({
        id: 'u1',
        email: 'a@b.com',
        name: 'Alex Rivera',
        title: 'PM',
        timezone: null,
        role: 'admin',
        status: 'active',
        lastLoginAt: null,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      })
      expect(shaped).toMatchObject({
        id: 'u1',
        name: 'Alex Rivera',
        email: 'a@b.com',
        role: 'admin',
        status: 'active',
        initials: 'AR',
        meetings: 0,
      })
      expect(shaped.color).toMatch(/^#[0-9a-f]{6}$/)
    })
  })
})
