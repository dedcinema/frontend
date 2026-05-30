export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  poster: string;
  description?: string;
  category?: Category;
}

export interface Theater {
  id: string;
  name: string;
  address: string;
}

export interface RowConfig {
  row: number;
  columns: number;
  type: string;
  price: number;
}

export interface Hall {
  id: string;
  name: string;
  theaterId: string;
  layout: RowConfig[];
}

export interface Screening {
  id: string;
  movieId: string;
  hallId: string;
  startAt: string;
  endAt: string;
}

export interface Seat {
  row: number;
  column: number;
  type: string;
  price: number;
  isBooked: boolean;
}

export interface Booking {
  id: string;
  screeningId: string;
  seats: Seat[];
  totalPrice: number;
  status: string;
}
