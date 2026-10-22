import { isStripeCheckoutUrl } from './payment-url'

describe('isStripeCheckoutUrl', () => {
  it('приймає https://checkout.stripe.com', () => {
    expect(isStripeCheckoutUrl('https://checkout.stripe.com/c/pay/cs_test_1#frag')).toBe(true)
  })

  it.each([
    'http://checkout.stripe.com/x',
    'https://evil.com/x',
    'https://checkout.stripe.com.evil.com/x',
    'https://checkout.stripe.com:8443/x',
    'https://user@checkout.stripe.com@evil.com/',
    'https://evil.com/?https://checkout.stripe.com',
    'javascript:alert(1)',
    '//checkout.stripe.com/x',
    '',
    'not a url',
    undefined,
    null,
    42,
  ])('відхиляє %s', (value) => {
    expect(isStripeCheckoutUrl(value)).toBe(false)
  })
})
