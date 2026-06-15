import { detectPlatform } from './platform'

describe('detectPlatform', () => {
  it('detects zoom', () => {
    expect(detectPlatform('https://zoom.us/j/123')).toBe('zoom')
  })
  it('detects teams', () => {
    expect(detectPlatform('https://teams.microsoft.com/l/meetup-join/x')).toBe('teams')
  })
  it('defaults to meet', () => {
    expect(detectPlatform('https://meet.google.com/abc-defg-hij')).toBe('meet')
    expect(detectPlatform('https://example.com/whatever')).toBe('meet')
  })
})
