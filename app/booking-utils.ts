export type BookingPricing = {
  currency: string;
  nightlyRateCents: number;
  cleaningFeeCents: number;
};

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function friendlyDate(value: string) {
  if (!value) return "Add date";
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(fromKey(value));
}

export function nightsBetween(arrival: string, departure: string) {
  if (!arrival || !departure) return 0;
  return Math.round((fromKey(departure).getTime() - fromKey(arrival).getTime()) / 86_400_000);
}

export function formatMoney(cents: number, currency: string) {
  const resolvedCurrency = currency.trim().toUpperCase() || "CAD";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: resolvedCurrency,
  }).format(cents / 100);
}

function icalDateKey(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  if (digits.length < 8) return "";
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

/** Convert Airbnb's exported iCalendar reservations into booked nights. */
export function parseIcalBookedDates(icalText: string) {
  const unfolded = icalText.replace(/\r?\n[ \t]/g, "");
  const booked = new Set<string>();

  for (const event of unfolded.split("BEGIN:VEVENT").slice(1)) {
    if (/^STATUS:CANCELLED$/m.test(event)) continue;
    const startMatch = event.match(/^DTSTART[^:]*:(\d{8}(?:T\d{6}Z?)?)/m);
    const endMatch = event.match(/^DTEND[^:]*:(\d{8}(?:T\d{6}Z?)?)/m);
    if (!startMatch || !endMatch) continue;

    const startKey = icalDateKey(startMatch[1]);
    const endKey = icalDateKey(endMatch[1]);
    if (!startKey || !endKey || endKey <= startKey) continue;

    let cursor = fromKey(startKey);
    const end = fromKey(endKey);
    while (cursor < end) {
      booked.add(dateKey(cursor));
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    }
  }

  return Array.from(booked).sort();
}
