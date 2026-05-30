import Cookies from 'js-cookie'

export const cookies = {
  get: (key: string) => Cookies.get(key),
  set: (key: string, value: string, options?: Cookies.CookieAttributes) =>
    Cookies.set(key, value, options),
  remove: (key: string) => Cookies.remove(key),
}
