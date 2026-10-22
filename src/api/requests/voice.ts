import { api } from '../instance'

interface VoiceLinkResponse {
  linked: boolean
  expiresInSeconds: number
}

// `api`, не `instance`: 401 тут не має запускати refresh/редирект на логін посеред дзвінка
export const voiceApi = {
  link: (identity: string, token: string) =>
    api
      .post<VoiceLinkResponse>(
        '/voice/link',
        { identity },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then((r) => r.data),
}
