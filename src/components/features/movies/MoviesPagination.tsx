import Link from 'next/link'
import { ROUTES } from '@/constants/routes'
import { getPageItems } from '@/lib/paginate'
import { cn } from '@/lib/utils'

interface MoviesPaginationProps {
  page: number
  totalPages: number
  category?: string
  anchorId: string
}

const itemBase =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-all'

export function MoviesPagination({ page, totalPages, category, anchorId }: MoviesPaginationProps) {
  if (totalPages <= 1) return null

  const hrefFor = (n: number) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (n > 1) params.set('page', String(n))
    const query = params.toString()
    return `${ROUTES.MOVIES.LIST}${query ? `?${query}` : ''}#${anchorId}`
  }

  const navItem = (label: string, target: number, disabled: boolean) =>
    disabled ? (
      <span aria-disabled="true" className={cn(itemBase, 'cursor-not-allowed text-muted-foreground/40')}>
        {label}
      </span>
    ) : (
      <Link
        href={hrefFor(target)}
        className={cn(itemBase, 'text-muted-foreground hover:bg-muted hover:text-foreground')}
      >
        {label}
      </Link>
    )

  return (
    <nav aria-label="Пагінація каталогу" className="flex flex-wrap items-center justify-center gap-1 pt-2">
      {navItem('Назад', page - 1, page <= 1)}
      {getPageItems(page, totalPages).map((item, i) =>
        item === 'ellipsis' ? (
          <span key={`e${i}`} aria-hidden className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-label={`Сторінка ${item}`}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              itemBase,
              item === page
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {item}
          </Link>
        ),
      )}
      {navItem('Далі', page + 1, page >= totalPages)}
    </nav>
  )
}
