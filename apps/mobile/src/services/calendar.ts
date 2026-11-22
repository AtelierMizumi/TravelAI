export function isoDay(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
export function monthDays(year: number, month: number): (number | null)[] {
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return [...Array<null>(offset).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
}
function realDay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validStay(checkIn: string, checkOut: string) {
  return realDay(checkIn) && realDay(checkOut) && checkOut > checkIn;
}
