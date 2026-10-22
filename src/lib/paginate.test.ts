import { getPageItems, paginate } from './paginate'

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

describe('paginate', () => {
  it('23 елементи, сторінка 1 → 12 елементів, 2 сторінки', () => {
    const r = paginate(range(23), '1', 12)
    expect(r.items).toEqual(range(12))
    expect(r.page).toBe(1)
    expect(r.totalPages).toBe(2)
  })
  it('23 елементи, сторінка 2 → 11 елементів', () => {
    const r = paginate(range(23), '2', 12)
    expect(r.items).toEqual([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23])
    expect(r.page).toBe(2)
  })
  it('12 елементів → одна сторінка', () => {
    const r = paginate(range(12), undefined, 12)
    expect(r.items).toHaveLength(12)
    expect(r.totalPages).toBe(1)
  })
  it('0 елементів → порожній список, 1 сторінка', () => {
    const r = paginate([], undefined, 12)
    expect(r).toEqual({ items: [], page: 1, totalPages: 1 })
  })
  it('сторінка 0 → сторінка 1', () => {
    expect(paginate(range(23), '0', 12).page).toBe(1)
  })
  it('сторінка 99 → остання сторінка', () => {
    const r = paginate(range(23), '99', 12)
    expect(r.page).toBe(2)
    expect(r.items).toHaveLength(11)
  })
  it('сторінка "abc" → сторінка 1', () => {
    expect(paginate(range(23), 'abc', 12).page).toBe(1)
  })
})

describe('getPageItems', () => {
  it('до 5 сторінок — усі номери', () => {
    expect(getPageItems(1, 2)).toEqual([1, 2])
    expect(getPageItems(1, 1)).toEqual([1])
  })
  it('багато сторінок — не більше 5 номерів з ellipsis', () => {
    expect(getPageItems(1, 10)).toEqual([1, 2, 3, 4, 'ellipsis', 10])
    expect(getPageItems(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10])
    expect(getPageItems(10, 10)).toEqual([1, 'ellipsis', 7, 8, 9, 10])
  })
})
