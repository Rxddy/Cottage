import { oneYearAvailabilityHorizon, parseIcalBookedDates } from "./booking-utils";

export type AirbnbAvailability = {
  status: "connected" | "not-configured" | "unavailable";
  blockedDates: string[];
  availabilityThrough: string | null;
  syncedAt: string | null;
};

export async function getAirbnbAvailability(): Promise<AirbnbAvailability> {
  const feedUrl = process.env.AIRBNB_ICAL_URL?.trim();
  if (!feedUrl) return { status: "not-configured", blockedDates: [], availabilityThrough: null, syncedAt: null };

  try {
    const response = await fetch(feedUrl, {
      cache: "no-store",
      headers: { Accept: "text/calendar,text/plain;q=0.9,*/*;q=0.8" },
    });
    if (!response.ok) return { status: "unavailable", blockedDates: [], availabilityThrough: null, syncedAt: null };
    const body = await response.text();
    const blockedDates = parseIcalBookedDates(body);
    return {
      status: "connected",
      blockedDates,
      availabilityThrough: oneYearAvailabilityHorizon(),
      syncedAt: new Date().toISOString(),
    };
  } catch {
    return { status: "unavailable", blockedDates: [], availabilityThrough: null, syncedAt: null };
  }
}
