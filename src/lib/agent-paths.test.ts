import { normalizeAgentPath, parsePathContext } from './agent-paths'

describe('normalizeAgentPath', () => {
  it.each([
    ['/', '/'],
    ['/movies', '/movies'],
    ['/movies/dune', '/movies/dune'],
    ['/movies/the-dark-knight', '/movies/the-dark-knight'],
    ['/screenings/abc_123-X', '/screenings/abc_123-X'],
  ])('дозволяє %s', (input, expected) => {
    expect(normalizeAgentPath(input)).toBe(expected)
  })

  it('відрізає query і fragment', () => {
    expect(normalizeAgentPath('/movies?page=2')).toBe('/movies')
    expect(normalizeAgentPath('/movies/dune?x=1#top')).toBe('/movies/dune')
    expect(normalizeAgentPath('/#hero')).toBe('/')
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
