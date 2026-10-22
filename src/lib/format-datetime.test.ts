import { formatDateTime, formatDateTimeOrRaw, formatLongDate, formatShortDate, formatTime } from './format-datetime'

describe('formatTime (Europe/Kyiv)', () => {
  it('літо (UTC+3): 08:00Z → 11:00', () => {
    expect(formatTime('2026-10-22T08:00:00Z')).toBe('11:00')
  })
  it('зима (UTC+2): 08:00Z → 10:00', () => {
    expect(formatTime('2026-12-01T08:00:00Z')).toBe('10:00')
  })
  it('перехід на зимовий час 2026-10-25: 00:59Z → 03:59, 01:00Z → 03:00', () => {
    expect(formatTime('2026-10-25T00:59:00Z')).toBe('03:59')
    expect(formatTime('2026-10-25T01:00:00Z')).toBe('03:00')
  })
  it('до і після зміни часу того ж дня: 24.10 08:00Z → 11:00, 26.10 08:00Z → 10:00', () => {
    expect(formatTime('2026-10-24T08:00:00Z')).toBe('11:00')
    expect(formatTime('2026-10-26T08:00:00Z')).toBe('10:00')
  })
  it('перехід на літній час 2026-03-29: 00:59Z → 02:59, 01:00Z → 04:00', () => {
    expect(formatTime('2026-03-29T00:59:00Z')).toBe('02:59')
    expect(formatTime('2026-03-29T01:00:00Z')).toBe('04:00')
  })
  it('приймає Date', () => {
    expect(formatTime(new Date('2026-10-22T08:00:00Z'))).toBe('11:00')
  })
})

describe('дата береться за Києвом, а не за UTC', () => {
  it('22:30Z 21.10 вже 22 жовтня в Києві', () => {
    expect(formatLongDate('2026-10-21T22:30:00Z')).toContain('22')
    expect(formatShortDate('2026-10-21T22:30:00Z')).toContain('22 жовтня')
  })
  it('formatDateTime містить київський час і рік', () => {
    const s = formatDateTime('2026-10-22T08:00:00Z')
    expect(s).toContain('2026')
    expect(s).toContain('11:00')
  })
})

describe('formatDateTimeOrRaw', () => {
  it('ISO із зоною форматує за Києвом', () => {
    expect(formatDateTimeOrRaw('2026-10-22T08:00:00.000Z')).toContain('11:00')
    expect(formatDateTimeOrRaw('2026-10-22T11:00:00+03:00')).toContain('11:00')
  })
  it('інші рядки лишає без змін', () => {
    expect(formatDateTimeOrRaw('22 жовтня, 11:00')).toBe('22 жовтня, 11:00')
    expect(formatDateTimeOrRaw('2026-10-22T08:00:00')).toBe('2026-10-22T08:00:00')
    expect(formatDateTimeOrRaw('')).toBe('')
  })
})
