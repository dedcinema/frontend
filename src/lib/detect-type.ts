export function detectType(value: string): 'email' | 'phone' {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'email' : 'phone'
}
