export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  bio: string;
  avatar: string;
}
export interface Place {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
}
export interface CatalogItem {
  id: number;
  name: string;
  location: string;
  province?: string | null;
  description?: string;
  image?: string;
  price: number;
  rating: number;
  durationDays?: number;
  maxGuests?: number;
  rooms?: number;
  status?: string;
}
export interface Policy {
  cancellationHours: number;
  reschedulingHours: number;
  graceMinutes: number;
  holdMinutes: number;
  holidayReschedulingHours: number | null;
}
export interface Departure {
  start: string;
  end?: string | null;
  capacity: number;
  seats: string[];
  price: number;
}
export interface Room {
  id: string;
  number: string;
  maxGuests: number;
  price: number;
  nightlyPrices?: Record<string, number>;
}
export interface Offer {
  id: string;
  kind: "TOUR" | "HOTEL";
  legacyId: number | null;
  name: string;
  active: boolean;
  policy: Policy;
  checkInTime: string;
  checkOutTime: string;
  departures: Departure[];
  rooms: Room[];
  promotion?: { from: string; through: string; percent: number } | null;
  version: string;
}
export interface Selection {
  offeringId: string;
  bookingId?: string;
  bookingRevision?: number;
  departure?: string;
  checkIn?: string;
  checkOut?: string;
  guests: number;
  seats: string[];
  roomGuests: Record<string, number>;
  replacementRooms: Record<string, string>;
}
export interface Itinerary {
  resources: {
    key: string;
    quantity: number;
    capacity: number;
    start: string;
  }[];
  selection: Selection;
  offeringVersion: string;
  name: string;
  kind: "TOUR" | "HOTEL";
  start: string;
  end: string;
  timezone: string;
  policy: Policy;
  roomPrices: Record<string, number[]>;
  itineraryPrice: number;
  changeHours: number;
}
export interface Booking {
  id: string;
  ownerId: number;
  status: string;
  revision: number;
  originalAmount: number;
  totalPaid: number;
  itinerary: Itinerary;
  sourceAccountId: string;
}
export interface NightCharge {
  room: string;
  date: string;
  baseline: number | null;
  price: number;
  holiday: boolean;
  additional: number;
  added: boolean;
}
export interface Review {
  booking?: Booking;
  id: string;
  digest: string;
  status: string;
  expiresAt: string;
  originalItinerary?: Itinerary;
  sourceAccountId?: string;
  quote: {
    itinerary: Itinerary;
    originalAmount: number;
    fee: number;
    holidayDifference: number;
    total: number;
    nights: NightCharge[];
    holiday: boolean;
    calendarVersions: Record<string, string>;
  };
}
export interface Bank {
  balance: number;
  accountId?: string;
  cards: {
    cardId: string;
    bankName: string;
    status: string;
    expiryMonth: number;
    expiryYear: number;
  }[];
  transactions: {
    reference: string;
    bookingId: string;
    kind: string;
    amount: number;
    createdAt: string;
  }[];
  paymentAttempts: {
    id: string;
    reviewId: string;
    bookingId?: string | null;
    status: "FAILED" | "SUCCEEDED";
    reason: string;
    amount: number;
    createdAt: string;
  }[];
}
export interface Post {
  id: number;
  authorId: number;
  authorName: string;
  authorAvatar?: string;
  content: string;
  image?: string;
  status?: string;
  liked?: boolean;
  likesCount?: number;
  shareCount?: number;
  comments?: { id: number; userName: string; text: string }[];
}
export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  targetId: number;
  targetReference?: string;
  isRead: boolean;
  createdAt: string;
}
export interface Settings {
  siteName: string;
  adminEmail: string;
  maintenanceMode: boolean;
  emailNotify: boolean;
  systemNotify: boolean;
}
