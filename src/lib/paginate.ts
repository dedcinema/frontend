export type PageItem = number | 'ellipsis'

export interface Paginated<T> {
  items: T[]
  page: number
  totalPages: number
}

export function paginate<T>(
  all: readonly T[],
  rawPage: string | undefined,
  pageSize: number,
): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize))
  const parsed = Number.parseInt(rawPage ?? '', 10)
  const page = Number.isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, totalPages)
  const start = (page - 1) * pageSize

  return { items: all.slice(start, start + pageSize), page, totalPages }
}

// Не більше 5 номерів: перша, остання і вікно навколо поточної, прогалини — "ellipsis"
export function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (page <= 3) return [1, 2, 3, 4, 'ellipsis', totalPages]
  if (page >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages]
}
