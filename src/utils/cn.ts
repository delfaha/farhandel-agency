/** Concatène des classes CSS conditionnelles. */
export function cn(...classes: Array<string | false | null | undefined | 0>): string {
  return classes.filter(Boolean).join(' ')
}
