// classnames helper — flattens, drops falsy, joins (ported from core.jsx).
type ClassArg = string | false | null | undefined | ClassArg[]

export function cn(...args: ClassArg[]): string {
  return args
    .flat(Infinity as 1)
    .filter(Boolean)
    .join(' ')
}
