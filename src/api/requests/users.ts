import { instance } from '../instance'
import type { User } from '@/types/api'

export const usersApi = {
  me: () =>
    instance.get<User>('/users/@me').then((r) => r.data),

  updateName: (name: string) =>
    instance.patch<User>('/users/@me', { name }).then((r) => r.data),

  updateAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return instance.patch<User>('/users/@me/avatar', form).then((r) => r.data)
  },

  emailInit: (email: string) =>
    instance.post('/account/email/init', { email }).then((r) => r.data),

  emailConfirm: (email: string, code: string) =>
    instance.post('/account/email/confirm', { email, code }).then((r) => r.data),

  phoneInit: (phone: string) =>
    instance.post('/account/phone/init', { phone }).then((r) => r.data),

  phoneConfirm: (phone: string, code: string) =>
    instance.post('/account/phone/confirm', { phone, code }).then((r) => r.data),
}
