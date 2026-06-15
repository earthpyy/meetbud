import { initialsFrom, colorFor, shapePerson } from './person-shaping'

describe('person-shaping', () => {
  it('derives two-letter initials from a full name', () => {
    expect(initialsFrom('Alex Rivera')).toBe('AR')
  })

  it('uses the first character for an email-like single token', () => {
    expect(initialsFrom('raj@northwind.io')).toBe('R')
  })

  it('is deterministic in color for a given id', () => {
    expect(colorFor('abc')).toBe(colorFor('abc'))
  })

  it('shapes a person record', () => {
    const shaped = shapePerson({
      id: 'p1',
      name: 'Raj Mehta',
      email: 'raj@northwind.io',
      title: 'VP Engineering',
    })
    expect(shaped).toMatchObject({
      id: 'p1',
      name: 'Raj Mehta',
      email: 'raj@northwind.io',
      title: 'VP Engineering',
      initials: 'RM',
    })
    expect(typeof shaped.color).toBe('string')
  })
})
