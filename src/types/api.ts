export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  poster: string;
  description?: string;
  category?: Category;
  banner?: string;
  duration?: number;
  ratingAge?: number;
  country?: string;
  releaseDate?: string;
}

export interface Theater {
  id: string;
  name: string;
  address: string;
}

export interface Hall {
  id: string;
  name: string;
  theaterId?: string;
}

export interface Screening {
  id: string;
  startAt: string;
  endAt: string;
  hall: { id: string; name: string }
  theater: { id: string; name: string; address: string }
  movie?: { id: string; title: string; slug: string }
  seatTypes?: { type: string; price: number }[]
}

export interface Seat {
  id: string;
  row: number;
  number: number;
  price: number;
  status: 'available' | 'reserved';
  type: string;
  hallId: string;
}

export interface Booking {
  id: string;
  screeningId: string;
  seats: Seat[];
  totalPrice: number;
  status: string;
}

export interface BookingDetails {
  id: string;
  qrCode: string;
  screeningTime: string;
  movie: {
    id: string;
    title: string;
    poster: string;
    slug: string;
  };
  hall: {
    id: string;
    name: string;
  };
  theater: {
    id: string;
    name: string;
  };
  seats: Array<{
    id: string;
    row: number;
    number: number;
  }>;
}
