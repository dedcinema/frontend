import Cookies from 'js-cookie'

const defaultAttributes: Cookies.CookieAttributes = {
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
}

export const cookies = {
  get: (key: string) => Cookies.get(key),
  set: (key: string, value: string, options?: Cookies.CookieAttributes) =>
    Cookies.set(key, value, { ...defaultAttributes, ...options }),
  remove: (key: string) => Cookies.remove(key),
}
