import { parseIcalBookedDates } from "./booking-utils";

export type AirbnbAvailability = {
  status: "connected" | "not-configured" | "unavailable";
  blockedDates: string[];
};

export async function getAirbnbAvailability(): Promise<AirbnbAvailability> {
  const feedUrl = process.env.AIRBNB_ICAL_URL?.trim();
  if (!feedUrl) return { status: "not-configured", blockedDates: [] };

  try {
    const response = await fetch(feedUrl, {
      cache: "no-store",
      headers: { Accept: "text/calendar,text/plain;q=0.9,*/*;q=0.8" },
    });
    if (!response.ok) return { status: "unavailable", blockedDates: [] };
    const body = await response.text();
    return { status: "connected", blockedDates: parseIcalBookedDates(body) };
  } catch {
    return { status: "unavailable", blockedDates: [] };
  }
}
