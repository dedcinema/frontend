# DedCinema Frontend

Фронтенд для сервісу кінотеатрів. REST API через axios + React Query.

---

## Стек

- **Next.js 15** — App Router
- **TypeScript** — strict mode, ніяких `any`
- **Tailwind CSS v4** — утиліти
- **shadcn/ui** — базові компоненти (`components/ui/`)
- **axios** — HTTP клієнт з interceptors для refresh токена
- **@tanstack/react-query** — серверний стан, кешування, retry
- **zustand** — клієнтський стан (auth, UI), persist в localStorage
- **react-hook-form + zod** — форми і валідація
- **next-themes** — темна тема
- **sonner** — toast нотифікації
- **js-cookie** — робота з cookie на клієнті
- **Bun** — пакетний менеджер

---

## Структура проекту

```
src/
  api/                          # шар REST API
    requests/                   # чисті axios функції
      auth.ts
      movies.ts
      screenings.ts
      booking.ts
      users.ts
      index.ts                  # barrel export
    hooks/                      # React Query обгортки
      useMovies.ts
      useMovie.ts
      useScreenings.ts
      useSeats.ts
      useBookings.ts
      useProfile.ts
      useAuth.ts
      index.ts                  # barrel export
    instance.ts                 # axios + refresh interceptor
    types.ts                    # API типи

  app/                          # Next.js App Router
    (auth)/                     # group без впливу на URL
      login/page.tsx
      verify/page.tsx
    (site)/                     # group для публічних сторінок
      layout.tsx                # header + footer
      page.tsx                  # головна
      movies/[slug]/page.tsx
    account/
      page.tsx                  # профіль
      bookings/page.tsx
    layout.tsx                  # root з провайдерами
    not-found.tsx

  components/
    ui/                         # shadcn (НЕ ЧІПАТИ)
    features/                   # бізнес компоненти
      movies/                   # MovieCard, MovieList, MovieFilter
      screening/                # ScreeningList, SeatMap
      booking/                  # BookingCard
      auth/                     # OtpForm, TelegramButton
    layout/                     # Header, Footer, Nav

  providers/                    # окрема папка для провайдерів
    ReactQueryProvider.tsx
    ThemeProvider.tsx
    ToastProvider.tsx
    HealthCheckProvider.tsx     # перевіряє чи API живий

  store/                        # Zustand по доменах
    auth/
      auth.store.ts
      auth.types.ts
    ui/
      ui.store.ts
      ui.types.ts

  schemas/                      # Zod схеми по доменах
    auth/
      otp.schema.ts
    user/
      profile.schema.ts

  hooks/                        # клієнтські хуки (не API)
    useMediaQuery.ts
    useDebounce.ts

  lib/
    cookies.ts                  # обгортка над js-cookie
    utils.ts                    # cn() для tailwind

  constants/
    routes.ts                   # всі шляхи в одному місці

  config/
    react-query.ts              # налаштування QueryClient

  types/
    api.ts                      # TypeScript типи з API

  utils/                        # дрібні чисті функції
    format-date.ts
    convert-price.ts
    tw-merge.ts

  styles/
    globals.css

  middleware.ts                 # auth redirect
```

---

## API шар

### `src/api/instance.ts` — axios з refresh

```ts
// два інстанси:
// api      — без токена (auth/otp, refresh)
// instance — з Bearer токеном і refresh-interceptor

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

const instance = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

instance.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// refresh з чергою — щоб не робити N refresh при N паралельних 401
let isRefreshing = false
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = []

instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status !== 401) return Promise.reject(error)

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        error.config.headers.Authorization = `Bearer ${token}`
        return instance(error.config)
      })
    }

    isRefreshing = true
    try {
      const { data } = await api.post('/auth/refresh')
      Cookies.set('accessToken', data.accessToken)
      failedQueue.forEach((p) => p.resolve(data.accessToken))
      failedQueue = []
      return instance(error.config)
    } catch (err) {
      failedQueue.forEach((p) => p.reject(err))
      failedQueue = []
      Cookies.remove('accessToken')
      window.location.href = '/auth/login'  // ← редирект, не закоментований!
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)
```

### `src/api/requests/movies.ts` — чисті функції

```ts
import { instance, api } from '../instance'
import type { Movie } from '@/types/api'

export const moviesApi = {
  list: (params?: { category?: string; limit?: number }) =>
    api.get<Movie[]>('/movies', { params }).then((r) => r.data),

  bySlug: (slug: string) =>
    api.get<Movie>(`/movies/${slug}`).then((r) => r.data),
}
```

### `src/api/hooks/useMovies.ts` — React Query

```ts
import { useQuery } from '@tanstack/react-query'
import { moviesApi } from '../requests/movies'

export function useMovies(category?: string) {
  return useQuery({
    queryKey: ['movies', category],
    queryFn: () => moviesApi.list({ category }),
  })
}

export function useMovie(slug: string) {
  return useQuery({
    queryKey: ['movie', slug],
    queryFn: () => moviesApi.bySlug(slug),
    enabled: !!slug,
  })
}
```

---

## Auth

- **Токен:** `accessToken` в cookie (через `js-cookie`, не через `document.cookie`)
- **Refresh:** автоматичний через axios interceptor (черга паралельних запитів)
- **Middleware:** `src/middleware.ts` захищає `/account/*`, редиректить з `/auth/*` якщо вже залогінений
- **Zustand auth.store:** тримає `isAuthenticated` + `user` для умовного рендерингу
- **useAuth хук:** обгортка над store з методами `auth()`, `exit()`

### `src/store/auth/auth.store.ts`

```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthStore {
  isAuthenticated: boolean
  user: User | null
  setUser: (user: User | null) => void
  setIsAuthenticated: (v: boolean) => void
  logout: () => void
}

export const authStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      setUser: (user) => set({ user }),
      setIsAuthenticated: (v) => set({ isAuthenticated: v }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    { name: 'auth', storage: createJSONStorage(() => localStorage) }
  )
)
```

### `src/middleware.ts`

```ts
const PROTECTED_ROUTES = ['/account']
const AUTH_ROUTES = ['/auth/login', '/auth/verify']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r))

  if (!token && isProtected) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (token && isAuth) {
    return NextResponse.redirect(new URL('/account', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/auth/:path*'],
}
```

---

## Провайдери

Окрема папка `src/providers/`, всі підключаються в `src/app/layout.tsx`:

```tsx
<ReactQueryProvider>
  <ThemeProvider attribute="class" defaultTheme="dark">
    <HealthCheckProvider>
      <ToastProvider />
      {children}
    </ThemeProvider>
  </HealthCheckProvider>
</ReactQueryProvider>
```

### `src/config/react-query.ts`

```ts
import { QueryClient } from '@tanstack/react-query'

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 3 * 60 * 1000,      // 3 хв
        gcTime: 10 * 60 * 1000,        // 10 хв
        retry: 2,
        retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 1 },
    },
  })
}
```

### `HealthCheckProvider` — application fallback

Робить запит на `GET /health` при старті. Якщо API недоступний — рендерить заглушку замість дітей. Це краще ніж білий екран помилок у користувача.

---

## Іменування

```
файли:        kebab-case        movie-card.tsx, auth.store.ts
компоненти:   PascalCase        <MovieCard />, <ReactQueryProvider />
хуки:         camelCase         useMovies, useAuth
сторінки:     page.tsx          (Next.js конвенція)
store:        <domain>.store.ts + <domain>.types.ts в парах
schema:       <thing>.schema.ts у src/schemas/<domain>/
constants:    SCREAMING_SNAKE   ROUTES.LOGIN
```

---

## Error handling

- **Axios:** refresh при 401, на провал — `window.location.href = '/auth/login'`
- **React Query:** глобальний retry 2 для queries, 1 для mutations
- **Mutations:** показуй `toast.error(err.message)` через sonner
- **HealthCheckProvider:** application-level fallback якщо API мертвий
- **not-found.tsx:** кастомна 404 сторінка
- **Forms:** Zod схеми в `src/schemas/<domain>/`, інтеграція через `@hookform/resolvers/zod`

---

## Правила

- **Ніяких `any`** — `unknown` + звуження якщо тип невідомий
- **HTTP тільки через `src/api/`** — ніяких прямих axios/fetch в компонентах
- **Серверний стан = React Query** — ніякого useState для даних з API
- **Клієнтський стан = Zustand** — тільки те що дійсно глобальне (auth, theme)
- **Один файл = один компонент**
- **Не чіпай `src/components/ui/`** — це shadcn
- **Не додавай бібліотеки без питання**
- **Cookie тільки через `src/lib/cookies.ts`** (обгортка над js-cookie)
- **Маршрути тільки через `src/constants/routes.ts`** — ніяких хардкод-стрінгів
- **Барел експорти** в `api/requests/index.ts` і `api/hooks/index.ts`
- **Коментарі** тільки для складної логіки

---

## Git workflow

- Гілка на фічу: `feature/auth`, `feature/movies-list`, `feature/booking`
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`
- Перед мержем: `bun run build && bun run lint` має проходити

---

## API ендпоінти

```
# Auth
POST /auth/otp/send             { identifier, type }
POST /auth/otp/verify           { identifier, code, type }
POST /auth/refresh
POST /auth/logout
GET  /auth/telegram
POST /auth/telegram/verify      { tgAuthResult }
POST /auth/telegram/finalize    { sessionId }

# Account
POST /account/email/init        { email }
POST /account/email/confirm     { email, code }
POST /account/phone/init        { phone }
POST /account/phone/confirm     { phone, code }

# User
GET   /users/@me
PATCH /users/@me                { name }
PATCH /users/@me/avatar         (multipart/form-data)

# Content
GET /movies                     ?category, ?random, ?limit
GET /movies/{slug}
GET /categories
GET /theaters
GET /halls/{id}
GET /screenings                 ?movieId
GET /screenings/{id}
GET /screenings/movie/{id}
GET /seats/{hall_id}/{screening_id}

# Booking & Payment
GET  /booking
POST /payment/init
GET  /health
```

---

## Типи (src/types/api.ts)

```ts
export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
}

export interface Movie {
  id: string
  title: string
  slug: string
  poster: string
  description?: string
  category?: Category
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Theater {
  id: string
  name: string
  address: string
}

export interface Hall {
  id: string
  name: string
  theaterId: string
  layout: RowConfig[]
}

export interface RowConfig {
  row: number
  columns: number
  type: string
  price: number
}

export interface Screening {
  id: string
  movieId: string
  hallId: string
  startAt: string
  endAt: string
}

export interface Seat {
  row: number
  column: number
  type: string
  price: number
  isBooked: boolean
}

export interface Booking {
  id: string
  screeningId: string
  seats: Seat[]
  totalPrice: number
  status: string
}
```

---

## Змінні середовища

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Порядок розробки

1. `types/api.ts` + `constants/routes.ts`
2. `lib/cookies.ts` + `api/instance.ts`
3. `store/auth/`
4. `middleware.ts`
5. `providers/` + `config/react-query.ts`
6. `api/requests/` + `api/hooks/` (по одному домену за раз)
7. `schemas/` + `components/features/` + `app/` (по фічах)