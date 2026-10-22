const ALLOWED_HOST = 'checkout.stripe.com'

export function isStripeCheckoutUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.host === ALLOWED_HOST
  } catch {
    return false
  }
}
