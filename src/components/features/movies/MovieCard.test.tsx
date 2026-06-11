import { render, screen } from '@testing-library/react'
import { MovieCard } from './MovieCard'
import type { Movie } from '@/types/api'

vi.mock('next/image', () => ({
  default: ({ src, alt, fill: _fill, ...props }: {
    src: string
    alt: string
    fill?: boolean
    [key: string]: unknown
  }) => <img src={src} alt={alt} {...(props as object)} />,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: {
    href: string
    children: React.ReactNode
    className?: string
  }) => <a href={href} className={className}>{children}</a>,
}))

process.env.NEXT_PUBLIC_S3_URL = 'https://s3.example.com'

const movieWithCategory: Movie = {
  id: '1',
  title: 'Дюна: Частина друга',
  slug: 'duna-chastyna-druha',
  poster: '/posters/duna.jpg',
  category: { id: 'cat-1', title: 'Фантастика', slug: 'fantastyka' },
}

const movieWithoutCategory: Movie = {
  id: '2',
  title: 'Оппенгеймер',
  slug: 'oppenheimer',
  poster: '/posters/oppenheimer.jpg',
}

describe('MovieCard', () => {
  it('рендерить назву фільму', () => {
    render(<MovieCard movie={movieWithCategory} />)
    expect(screen.getByText('Дюна: Частина друга')).toBeInTheDocument()
  })

  it('рендерить категорію якщо є', () => {
    render(<MovieCard movie={movieWithCategory} />)
    expect(screen.getByText('Фантастика')).toBeInTheDocument()
  })

  it('не рендерить категорію якщо немає', () => {
    render(<MovieCard movie={movieWithoutCategory} />)
    expect(screen.queryByText('Фантастика')).not.toBeInTheDocument()
  })

  it('має посилання на /movies/{slug}', () => {
    render(<MovieCard movie={movieWithCategory} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/movies/duna-chastyna-druha')
  })

  it('постер має правильний src з S3 URL', () => {
    render(<MovieCard movie={movieWithCategory} />)
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://s3.example.com/posters/duna.jpg',
    )
  })
})
