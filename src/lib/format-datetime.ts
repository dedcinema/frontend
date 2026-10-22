const LOCALE = 'uk-UA'
const TIME_ZONE = 'Europe/Kyiv'

const longDateFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const weekdayShortFmt = new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, weekday: 'short' })
const dayMonthFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'long',
})
const timeFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
})
const dateTimeFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

type DateInput = Date | string

const toDate = (d: DateInput) => (typeof d === 'string' ? new Date(d) : d)

export const formatLongDate = (d: DateInput) => longDateFmt.format(toDate(d))

export function formatShortDate(d: DateInput): string {
  const date = toDate(d)
  return `${weekdayShortFmt.format(date).replace(/\.$/, '')}, ${dayMonthFmt.format(date)}`
}

export const formatTime = (d: DateInput) => timeFmt.format(toDate(d))

export const formatDateTime = (d: DateInput) => dateTimeFmt.format(toDate(d))

const ISO_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T[\d:.]+(Z|[+-]\d{2}:?\d{2})$/

// Невідомий формат (напр. вже відформатований рядок з бекенду) показуємо як є
export function formatDateTimeOrRaw(value: string): string {
  return ISO_WITH_ZONE.test(value) && !Number.isNaN(Date.parse(value))
    ? formatDateTime(value)
    : value
}
