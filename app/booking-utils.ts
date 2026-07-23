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
