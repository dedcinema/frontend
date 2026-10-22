const ALLOWED_PATHS = [
  /^\/$/,
  /^\/movies$/,
  /^\/movies\/[a-z0-9-]+$/,
  /^\/screenings\/[A-Za-z0-9_-]+$/,
]

const MAX_PATH_LENGTH = 200
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/

export function normalizeAgentPath(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length > MAX_PATH_LENGTH) return null
  if (!raw.startsWith('/') || raw.includes('\\') || CONTROL_CHARS.test(raw)) return null

  const cut = raw.search(/[?#]/)
  const path = cut === -1 ? raw : raw.slice(0, cut)

  if (path.includes('//')) return null
  return ALLOWED_PATHS.some((re) => re.test(path)) ? path : null
}

export function parsePathContext(path: string): { movieSlug?: string; screeningId?: string } {
  const movie = /^\/movies\/([a-z0-9-]+)$/.exec(path)
  if (movie) return { movieSlug: movie[1] }
  const screening = /^\/screenings\/([A-Za-z0-9_-]+)$/.exec(path)
  if (screening) return { screeningId: screening[1] }
  return {}
}
