const ALLOWED_PATHS = [
  /^\/$/,
  /^\/movies$/,
  /^\/movies\/[a-z0-9-]+$/,
  /^\/screenings\/[A-Za-z0-9_-]+$/,
  /^\/pay\/[A-Za-z0-9_-]+$/,
]

const CATEGORY_SLUGS = ['action', 'drama', 'crime', 'sci-fi', 'comedy'] as const
const MAX_PATH_LENGTH = 200
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/

export function normalizeAgentPath(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length > MAX_PATH_LENGTH) return null
  if (!raw.startsWith('/') || raw.includes('\\') || CONTROL_CHARS.test(raw)) return null

  const beforeHash = raw.split('#', 1)[0]
  const queryStart = beforeHash.indexOf('?')
  const path = queryStart === -1 ? beforeHash : beforeHash.slice(0, queryStart)
  const query = queryStart === -1 ? '' : beforeHash.slice(queryStart + 1)

  if (path.includes('//')) return null
  if (!ALLOWED_PATHS.some((re) => re.test(path))) return null

  return path === '/movies' ? `${path}${categoryQuery(query)}` : path
}

// Єдиний дозволений параметр: category рівно один раз і зі значенням зі списку; решта відкидається
function categoryQuery(query: string): string {
  const values = new URLSearchParams(query).getAll('category')
  const slug = CATEGORY_SLUGS.find((s) => s === values[0])
  return values.length === 1 && slug ? `?category=${slug}` : ''
}

export function parsePathContext(path: string): { movieSlug?: string; screeningId?: string } {
  const movie = /^\/movies\/([a-z0-9-]+)$/.exec(path)
  if (movie) return { movieSlug: movie[1] }
  const screening = /^\/screenings\/([A-Za-z0-9_-]+)$/.exec(path)
  if (screening) return { screeningId: screening[1] }
  return {}
}
