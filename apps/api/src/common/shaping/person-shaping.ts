const PALETTE = [
  '#6366f1',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#8b5cf6',
  '#ef4444',
  '#22c55e',
  '#06b6d4',
  '#a855f7',
  '#eab308',
]

export function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  const single = words[0] ?? ''
  if (single.includes('@')) return single[0].toUpperCase()
  return single.slice(0, 2).toUpperCase()
}

export function colorFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]
}

export interface ShapedPerson {
  id: string
  name: string
  email: string | null
  title: string | null
  initials: string
  color: string
}

export function shapePerson(person: {
  id: string
  name: string
  email?: string | null
  title?: string | null
}): ShapedPerson {
  return {
    id: person.id,
    name: person.name,
    email: person.email ?? null,
    title: person.title ?? null,
    initials: initialsFrom(person.name),
    color: colorFor(person.id),
  }
}
