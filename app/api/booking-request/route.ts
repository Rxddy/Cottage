import { getAirbnbAvailability } from "@/app/airbnb-calendar";
import {
  dateKey,
  formatMoney,
  friendlyDate,
  fromKey,
  nightsBetween,
  standardStayEstimate,
  type BookingPricing,
} from "@/app/booking-utils";

type BookingRequestPayload = {
  arrival?: unknown;
  departure?: unknown;
  guests?: unknown;
  email?: unknown;
  message?: unknown;
  website?: unknown;
};

const DEFAULT_SUPPORT_EMAIL = "lakefrontserenitysupport@gmail.com";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRICING: BookingPricing = {
  currency: "cad",
  mondayThursdayRateCents: 55_000,
  fridaySundayRateCents: 60_000,
  longWeekendRateCents: 65_000,
  cleaningFeeCents: 20_000,
};
const requestAttempts = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 4;

function json(error: string, status: number) {
  return Response.json(
    { error },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(status === 429 ? { "Retry-After": "900" } : {}),
      },
    },
  );
}

function isRateLimited(request: Request) {
  const forwarded = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
  const now = Date.now();
  const recent = (requestAttempts.get(forwarded) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestAttempts.set(forwarded, recent);
    return true;
  }
  recent.push(now);
  requestAttempts.set(forwarded, recent);
  return false;
}

function base64UrlEncode(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function getGmailAccessToken() {
  const clientId = process.env.GMAIL_CLIENT_ID?.trim();
  const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Email service is not configured.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error("Email service authorization failed.");
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("Email service authorization failed.");
  return payload.access_token;
}

async function sendWithGmail({
  guestEmail,
  subject,
  body,
}: {
  guestEmail: string;
  subject: string;
  body: string;
}) {
  const supportEmail = process.env.BOOKING_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
  if (!EMAIL_PATTERN.test(supportEmail) || /[\r\n]/.test(supportEmail)) {
    throw new Error("Email service is not configured.");
  }

  const accessToken = await getGmailAccessToken();
  const mimeMessage = [
    `From: Lakefront Serenity <${supportEmail}>`,
    `To: ${supportEmail}`,
    `Cc: ${guestEmail}`,
    `Reply-To: ${guestEmail}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
  ].join("\r\n");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: base64UrlEncode(mimeMessage) }),
  });
  if (!response.ok) throw new Error("Email service could not send the request.");
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_384) return json("The request is too large.", 413);

  let payload: BookingRequestPayload;
  try {
    payload = await request.json() as BookingRequestPayload;
  } catch {
    return json("Enter your booking details and try again.", 400);
  }

  if (typeof payload.website === "string" && payload.website.trim()) {
    return Response.json({ ok: true });
  }
  if (isRateLimited(request)) {
    return json("Too many requests were sent. Please wait 15 minutes and try again.", 429);
  }

  const arrival = typeof payload.arrival === "string" ? payload.arrival : "";
  const departure = typeof payload.departure === "string" ? payload.departure : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const guests = Number(payload.guests);

  if (
    !DATE_PATTERN.test(arrival)
    || !DATE_PATTERN.test(departure)
    || dateKey(fromKey(arrival)) !== arrival
    || dateKey(fromKey(departure)) !== departure
    || departure <= arrival
  ) {
    return json("Choose a valid check-in and check-out date.", 400);
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254 || /[\r\n]/.test(email)) {
    return json("Enter a valid email address.", 400);
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > 10) {
    return json("Choose between 1 and 10 guests.", 400);
  }
  if (message.length > 1200) {
    return json("Keep the additional note under 1,200 characters.", 400);
  }

  const todayValue = new Date();
  const today = new Date(todayValue.getFullYear(), todayValue.getMonth(), todayValue.getDate());
  if (fromKey(arrival) < today || nightsBetween(arrival, departure) < 1) {
    return json("Choose future stay dates.", 400);
  }

  const availability = await getAirbnbAvailability();
  if (availability.status === "connected") {
    const blocked = new Set(availability.blockedDates);
    for (
      let cursor = fromKey(arrival), end = fromKey(departure);
      cursor < end;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)
    ) {
      if (blocked.has(dateKey(cursor))) {
        return json("Those dates now include an unavailable night. Please choose another stay.", 409);
      }
    }
    if (availability.availabilityThrough && departure > availability.availabilityThrough) {
      return json("Those dates extend beyond Airbnb’s current calendar range. Please choose earlier dates.", 409);
    }
  }

  const nights = nightsBetween(arrival, departure);
  const standardEstimate = formatMoney(
    standardStayEstimate(arrival, departure, PRICING),
    PRICING.currency,
  );
  const availabilityLine = availability.status === "connected"
    ? "Airbnb calendar re-checked when this request was sent."
    : "Airbnb calendar could not be re-checked; host confirmation is required.";
  const subject = `Booking request: ${friendlyDate(arrival)} to ${friendlyDate(departure)}`;
  const body = [
    "New Lakefront Serenity booking request",
    "",
    `Dates: ${friendlyDate(arrival)} to ${friendlyDate(departure)}`,
    `Nights: ${nights}`,
    `Guests: ${guests}`,
    `Guest email: ${email}`,
    `Standard-rate estimate: ${standardEstimate} (includes the $200 cleaning fee)`,
    "Rates: Monday–Thursday $550/night; Friday–Sunday $600/night; long weekends $650/night.",
    "The host will confirm whether the long-weekend rate applies.",
    "",
    availabilityLine,
    "",
    "Additional note:",
    message || "None provided.",
    "",
    "This is a request only. Reply to the guest to confirm availability, final pricing, payment instructions and next steps.",
  ].join("\n");

  try {
    await sendWithGmail({ guestEmail: email, subject, body });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Booking request email failed", error instanceof Error ? error.message : error);
    return json("Direct email is temporarily unavailable. Please try again shortly.", 503);
  }
}
