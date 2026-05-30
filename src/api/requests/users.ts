import { instance } from '../instance'
import type { User } from '@/types/api'

export const usersApi = {
  me: () =>
    instance.get<User>('/users/@me').then((r) => r.data),

  updateName: (name: string) =>
    instance.patch<User>('/users/@me', { name }).then((r) => r.data),

  updateAvatar: (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return instance.patch<User>('/users/@me/avatar', form).then((r) => r.data)
  },
}
