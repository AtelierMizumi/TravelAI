/** Pure helpers behind the admin bookings screen: Vietnam-time dates, filters and grouping per service. */
export interface BookingRow {
  key: string;
  group: string;
  name: string;
  kind: "TOUR" | "HOTEL";
  province: string;
  date: string;
  time: string;
  customer: string;
  status: string;
}
export interface BookingFilters {
  query?: string;
  province?: string;
  status?: string;
  from?: string;
  to?: string;
  timeFrom?: string;
  timeTo?: string;
}
export interface BookingGroup {
  group: string;
  name: string;
  kind: "TOUR" | "HOTEL";
  rows: BookingRow[];
}

const format = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Local date (YYYY-MM-DD) and time (HH:mm) in Asia/Ho_Chi_Minh; empty strings when unknown, never guessed. */
export function dateParts(value?: string | null): { date: string; time: string } {
  if (!value) return { date: "", time: "" };
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return { date: value, time: "" };
  const moment = new Date(value);
  if (Number.isNaN(moment.getTime())) return { date: "", time: "" };
  const parts = Object.fromEntries(format.formatToParts(moment).map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

const lower = (value: string) => value.toLocaleLowerCase("vi");

/** A filter that is set excludes rows lacking that field; unset filters never hide incomplete rows. */
export function filterRows(rows: BookingRow[], filters: BookingFilters): BookingRow[] {
  const needle = lower((filters.query || "").trim());
  return rows.filter((row) => {
    if (needle && !lower(`${row.name} ${row.customer} ${row.key}`).includes(needle)) return false;
    if (filters.province && row.province !== filters.province) return false;
    if (filters.status && row.status !== filters.status) return false;
    if ((filters.from || filters.to) && !row.date) return false;
    if (filters.from && row.date < filters.from) return false;
    if (filters.to && row.date > filters.to) return false;
    if ((filters.timeFrom || filters.timeTo) && !row.time) return false;
    if (filters.timeFrom && row.time < filters.timeFrom) return false;
    if (filters.timeTo && row.time > filters.timeTo) return false;
    return true;
  });
}

export function groupRows(rows: BookingRow[]): BookingGroup[] {
  const groups = new Map<string, BookingGroup>();
  for (const row of rows) {
    const group = groups.get(row.group) ?? { group: row.group, name: row.name, kind: row.kind, rows: [] };
    group.rows.push(row);
    groups.set(row.group, group);
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, "vi"));
}
