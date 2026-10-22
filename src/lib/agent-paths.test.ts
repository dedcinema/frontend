import { normalizeAgentPath, parsePathContext } from './agent-paths'

describe('normalizeAgentPath', () => {
  it.each([
    ['/', '/'],
    ['/movies', '/movies'],
    ['/movies/dune', '/movies/dune'],
    ['/movies/the-dark-knight', '/movies/the-dark-knight'],
    ['/screenings/abc_123-X', '/screenings/abc_123-X'],
    ['/pay/abc_123', '/pay/abc_123'],
    ['/pay/abc?x=1#t', '/pay/abc'],
  ])('дозволяє %s', (input, expected) => {
    expect(normalizeAgentPath(input)).toBe(expected)
  })

  it('відрізає query і fragment', () => {
    expect(normalizeAgentPath('/movies?page=2')).toBe('/movies')
    expect(normalizeAgentPath('/movies/dune?x=1#top')).toBe('/movies/dune')
    expect(normalizeAgentPath('/#hero')).toBe('/')
  })

  it.each(['/pay', '/pay/', '/pay/a/b', '/pay/%2e', '/pay/..', '/pay/a.b', '//pay/abc'])(
    'відхиляє %s',
    (input) => {
      expect(normalizeAgentPath(input)).toBeNull()
    },
  )

  describe('category у /movies', () => {
    it.each([
      ['/movies?category=comedy', '/movies?category=comedy'],
      ['/movies?category=sci-fi', '/movies?category=sci-fi'],
      ['/movies?category=action', '/movies?category=action'],
      ['/movies?category=drama', '/movies?category=drama'],
      ['/movies?category=crime', '/movies?category=crime'],
      ['/movies?category=comedy#top', '/movies?category=comedy'],
      ['/movies?x=1&category=drama', '/movies?category=drama'],
      ['/movies?category=comedy&x=1', '/movies?category=comedy'],
      ['/movies?category=horror', '/movies'],
      ['/movies?category=Comedy', '/movies'],
      ['/movies?category=', '/movies'],
      ['/movies?x=1', '/movies'],
      ['/movies?page=2', '/movies'],
      ['/movies?category=comedy&category=drama', '/movies'],
      ['/movies?category=comedy&category=comedy', '/movies'],
      ['/movies?category=comedy,drama', '/movies'],
    ])('%s → %s', (input, expected) => {
      expect(normalizeAgentPath(input)).toBe(expected)
    })

    it('інші шляхи і далі відкидають query', () => {
      expect(normalizeAgentPath('/screenings/abc?category=comedy')).toBe('/screenings/abc')
      expect(normalizeAgentPath('/movies/dune?category=comedy')).toBe('/movies/dune')
      expect(normalizeAgentPath('/?category=comedy')).toBe('/')
    })

    it('відхиляє небезпечні шляхи навіть з валідною category', () => {
      expect(normalizeAgentPath('//evil.com?category=comedy')).toBeNull()
      expect(normalizeAgentPath('/account?category=comedy')).toBeNull()
      expect(normalizeAgentPath('https://x/movies?category=comedy')).toBeNull()
    })
  })

  it.each([
    '//evil.com',
    '//evil.com?x=1',
    'https://x',
    'http://localhost/movies',
    '/movies/../x',
    '/movies/%2e%2e',
    '/movies/a%2fb',
    '/account',
    '/account/bookings',
    '/auth/login',
    '/movies/Dune',
    '/movies/',
    '/movies//dune',
    '/x\\y',
    '/movies/dune\n',
    'movies',
    '',
  ])('відхиляє %j', (input) => {
    expect(normalizeAgentPath(input)).toBeNull()
  })

  it('відхиляє не-рядки', () => {
    expect(normalizeAgentPath(undefined)).toBeNull()
    expect(normalizeAgentPath(null)).toBeNull()
    expect(normalizeAgentPath(42)).toBeNull()
    expect(normalizeAgentPath({ path: '/movies' })).toBeNull()
  })

  it('відхиляє занадто довгий шлях', () => {
    expect(normalizeAgentPath(`/movies/${'a'.repeat(300)}`)).toBeNull()
  })
})

describe('parsePathContext', () => {
  it('витягує slug і id', () => {
    expect(parsePathContext('/movies/dune')).toEqual({ movieSlug: 'dune' })
    expect(parsePathContext('/screenings/abc-1')).toEqual({ screeningId: 'abc-1' })
    expect(parsePathContext('/movies')).toEqual({})
    expect(parsePathContext('/')).toEqual({})
  })
})
