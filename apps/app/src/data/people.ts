import type { Person } from '@/lib/types'

export const PEOPLE: Record<string, Person> = {
  me: {
    id: 'me',
    name: 'Alex Rivera',
    email: 'alex@acme.com',
    initials: 'AR',
    color: '#6366f1',
    title: 'Head of Product',
  },
  priya: {
    id: 'priya',
    name: 'Priya Nair',
    email: 'priya@acme.com',
    initials: 'PN',
    color: '#ec4899',
    title: 'Design Lead',
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus Lee',
    email: 'marcus@acme.com',
    initials: 'ML',
    color: '#14b8a6',
    title: 'Eng Manager',
  },
  sofia: {
    id: 'sofia',
    name: 'Sofia Garcia',
    email: 'sofia@acme.com',
    initials: 'SG',
    color: '#f97316',
    title: 'PMM',
  },
  daniel: {
    id: 'daniel',
    name: 'Daniel Kim',
    email: 'daniel@acme.com',
    initials: 'DK',
    color: '#8b5cf6',
    title: 'Staff Engineer',
  },
  emma: {
    id: 'emma',
    name: 'Emma Wilson',
    email: 'emma@acme.com',
    initials: 'EW',
    color: '#ef4444',
    title: 'Account Exec',
  },
  tom: {
    id: 'tom',
    name: 'Tom Becker',
    email: 'tom@acme.com',
    initials: 'TB',
    color: '#22c55e',
    title: 'Customer Success',
  },
  nina: {
    id: 'nina',
    name: 'Nina Patel',
    email: 'nina@acme.com',
    initials: 'NP',
    color: '#06b6d4',
    title: 'Data Analyst',
  },
  // external (customer)
  raj: {
    id: 'raj',
    name: 'Raj Mehta',
    email: 'raj@northwind.io',
    initials: 'RM',
    color: '#a855f7',
    title: 'VP Engineering, Northwind',
  },
  helen: {
    id: 'helen',
    name: 'Helen Ortiz',
    email: 'helen@northwind.io',
    initials: 'HO',
    color: '#eab308',
    title: 'CTO, Northwind',
  },
}

export const ME = PEOPLE.me

export function ppl(...ids: string[]): Person[] {
  return ids.map((i) => PEOPLE[i])
}
