import { detectType } from './detect-type'

describe('detectType', () => {
  describe('email', () => {
    it('повертає email для стандартного формату', () => {
      expect(detectType('user@example.com')).toBe('email')
    })
    it('повертає email для субдомену', () => {
      expect(detectType('user@mail.example.com')).toBe('email')
    })
  })

  describe('phone', () => {
    it('повертає phone для номера з +', () => {
      expect(detectType('+380671234567')).toBe('phone')
    })
    it('повертає phone для номера без +', () => {
      expect(detectType('0671234567')).toBe('phone')
    })
  })

  describe('граничні випадки', () => {
    it('порожній рядок не email', () => {
      expect(detectType('')).toBe('phone')
    })
    it('тільки @ не email', () => {
      expect(detectType('@')).toBe('phone')
    })
    it('email без крапки в домені не email', () => {
      expect(detectType('user@domain')).toBe('phone')
    })
    it('email з пробілом не email', () => {
      expect(detectType('user @example.com')).toBe('phone')
    })
  })
})
