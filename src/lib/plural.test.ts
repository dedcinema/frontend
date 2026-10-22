import { pluralizeUk } from './plural'

const FILMS = ['фільм', 'фільми', 'фільмів'] as const

describe('pluralizeUk', () => {
  it.each([
    [1, 'фільм'],
    [2, 'фільми'],
    [4, 'фільми'],
    [5, 'фільмів'],
    [11, 'фільмів'],
    [12, 'фільмів'],
    [14, 'фільмів'],
    [21, 'фільм'],
    [22, 'фільми'],
    [23, 'фільми'],
    [25, 'фільмів'],
  ])('%i → %s', (n, expected) => {
    expect(pluralizeUk(n, FILMS)).toBe(expected)
  })
})
