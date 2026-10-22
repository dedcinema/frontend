export const ROUTES = {
  HOME: '/',

  AUTH: {
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify',
  },

  MOVIES: {
    LIST: '/movies',
    DETAILS: (slug: string) => `/movies/${slug}`,
  },

  SCREENINGS: {
    DETAILS: (id: string) => `/screenings/${id}`,
  },

  PAY: {
    DETAILS: (id: string) => `/pay/${id}`,
  },

  ACCOUNT: {
    ROOT: '/account',
    BOOKINGS: '/account/bookings',
  },
} as const
