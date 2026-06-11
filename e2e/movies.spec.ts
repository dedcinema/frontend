import { test, expect } from '@playwright/test'

// Сторінки / і /movies використовують Next.js Server Components з server-side fetch.
// page.route() перехоплює лише браузерні запити — server-side fetch не мокається.
// Ці тести потребують запущеного бекенду на http://localhost:4000.
// Запустіть: cd backend && bun run dev

let backendAvailable = false

test.beforeAll(async ({ request }) => {
  backendAvailable = await request
    .get('http://localhost:4000/health')
    .then((r) => r.ok())
    .catch(() => false)
})

test.describe('Головна сторінка', () => {
  test('відкрити / → бачити heading', async ({ page }) => {
    test.skip(!backendAvailable, 'Потрібен бекенд на localhost:4000')

    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Кіно в твоєму місті')
  })

  test('відкрити / → бачити карусель з фільмами', async ({ page }) => {
    test.skip(!backendAvailable, 'Потрібен бекенд на localhost:4000')

    await page.goto('/')
    // HomeCarousel повертає null якщо фільмів немає — тест підтверджує що є хоча б один
    const firstMovieLink = page.locator('a[href^="/movies/"]').first()
    await expect(firstMovieLink).toBeVisible()
  })
})

test.describe('Сторінка фільмів', () => {
  test('перейти на /movies → бачити сітку фільмів', async ({ page }) => {
    test.skip(!backendAvailable, 'Потрібен бекенд на localhost:4000')

    await page.goto('/movies')
    // Сітка: grid з MovieCard — кожен є посиланням /movies/{slug}
    await expect(page.locator('a[href^="/movies/"]').first()).toBeVisible()
  })

  test('клік на категорію → URL міняється на ?category=', async ({ page }) => {
    test.skip(!backendAvailable, 'Потрібен бекенд на localhost:4000')

    await page.goto('/movies')

    const categoryLink = page.locator('a[href*="?category="]').first()
    await expect(categoryLink).toBeVisible()

    const href = await categoryLink.getAttribute('href')
    const slug = href?.match(/category=([^&]+)/)?.[1]

    await categoryLink.click()
    await expect(page).toHaveURL(`/movies?category=${slug}`)
  })

  test('клік на фільм → перехід на /movies/{slug}', async ({ page }) => {
    test.skip(!backendAvailable, 'Потрібен бекенд на localhost:4000')

    await page.goto('/movies')

    const movieCard = page.locator('a[href^="/movies/"]').first()
    await expect(movieCard).toBeVisible()

    const href = await movieCard.getAttribute('href')
    await movieCard.click()
    await expect(page).toHaveURL(href!)
  })
})
