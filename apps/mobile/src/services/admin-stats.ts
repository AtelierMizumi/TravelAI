export type BookingSplit = {
  total: number;
  tourPercent: number;
  hotelPercent: number;
  tourBar: number;
  hotelBar: number;
};

const count = (value: unknown) => (typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null);

/** Chart numbers for tour vs hotel bookings; null when the API gave no usable counts or nothing is booked yet. */
export function bookingSplit(stats: Record<string, unknown> | null | undefined): BookingSplit | null {
  const tour = count(stats?.tourBookings);
  const hotel = count(stats?.hotelBookings);
  if (tour === null || hotel === null || tour + hotel === 0) return null;
  const total = tour + hotel;
  const largest = Math.max(tour, hotel);
  return {
    total,
    tourPercent: Math.round((tour * 100) / total),
    hotelPercent: Math.round((hotel * 100) / total),
    tourBar: Math.round((tour * 100) / largest),
    hotelBar: Math.round((hotel * 100) / largest),
  };
}
