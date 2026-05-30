export const ROUTES = {
  HOME: '/',

  AUTH: {
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify',
  },

  MOVIES: {
    DETAILS: (slug: string) => `/movies/${slug}`,
  },

  ACCOUNT: {
    ROOT: '/account',
    BOOKINGS: '/account/bookings',
  },
} as const
