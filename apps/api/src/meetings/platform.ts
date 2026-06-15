import { MeetingPlatform } from '@prisma/client'

export function detectPlatform(url: string): MeetingPlatform {
  if (/zoom\.us/i.test(url)) return 'zoom'
  if (/teams\.microsoft|teams\./i.test(url)) return 'teams'
  return 'meet'
}
