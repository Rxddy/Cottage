#!/usr/bin/env node

import { createServer } from "node:http";

const port = Number(process.env.BOOKING_REQUEST_PORT ?? 8788);
const supportEmail = process.env.BOOKING_SUPPORT_EMAIL?.trim() || "lakefrontserenitysupport@gmail.com";
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const requestAttempts = new Map();
const rateLimitWindowMs = 15 * 60 * 1000;
const rateLimitMaxRequests = 4;

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    ...(status === 429 ? { "Retry-After": "900" } : {}),
  });
  response.end(JSON.stringify(payload));
}

function isRateLimited(request) {
  const client = String(request.headers["x-forwarded-for"] || request.socket.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
  const now = Date.now();
  const recent = (requestAttempts.get(client) || []).filter((timestamp) => now - timestamp < rateLimitWindowMs);
  if (recent.length >= rateLimitMaxRequests) {
    requestAttempts.set(client, recent);
    return true;
  }
  recent.push(now);
  requestAttempts.set(client, recent);
  return false;
}

function fromKey(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function friendlyDate(value) {
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric" }).format(fromKey(value));
}

function nightsBetween(arrival, departure) {
  return Math.round((fromKey(departure).getTime() - fromKey(arrival).getTime()) / 86_400_000);
}

function standardStayEstimate(arrival, departure) {
  let totalCents = 20_000;
  for (let night = fromKey(arrival), checkout = fromKey(departure); night < checkout; night = new Date(night.getFullYear(), night.getMonth(), night.getDate() + 1)) {
    const day = night.getDay();
    totalCents += day >= 1 && day <= 4 ? 55_000 : 60_000;
  }
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(totalCents / 100);
}

function parseIcalBookedDates(icalText) {
  const unfolded = icalText.replace(/\r?\n[ \t]/g, "");
  const booked = new Set();
  for (const event of unfolded.split("BEGIN:VEVENT").slice(1)) {
    if (/^STATUS:CANCELLED$/m.test(event)) continue;
    const startMatch = event.match(/^DTSTART[^:]*:(\d{8}(?:T\d{6}Z?)?)/m);
    const endMatch = event.match(/^DTEND[^:]*:(\d{8}(?:T\d{6}Z?)?)/m);
    if (!startMatch || !endMatch) continue;
    const toKey = (value) => {
      const digits = value.replace(/[^0-9]/g, "");
      return digits.length >= 8 ? `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}` : "";
    };
    const startKey = toKey(startMatch[1]);
    const endKey = toKey(endMatch[1]);
    if (!startKey || !endKey || endKey <= startKey) continue;
    for (let cursor = fromKey(startKey), end = fromKey(endKey); cursor < end; cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)) {
      booked.add(localDateKey(cursor));
    }
  }
  return [...booked].sort();
}

async function getLiveAvailability() {
  const feedUrl = process.env.AIRBNB_ICAL_URL?.trim();
  if (!feedUrl) return { status: "not-configured", blockedDates: [], availabilityThrough: null };
  try {
    const response = await fetch(feedUrl, {
      cache: "no-store",
      headers: { Accept: "text/calendar,text/plain;q=0.9,*/*;q=0.8" },
    });
    if (!response.ok) return { status: "unavailable", blockedDates: [], availabilityThrough: null };
    const blockedDates = parseIcalBookedDates(await response.text());
    const now = new Date();
    const availabilityThrough = localDateKey(new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()));
    return { status: "connected", blockedDates, availabilityThrough };
  } catch {
    return { status: "unavailable", blockedDates: [], availabilityThrough: null };
  }
}

function base64UrlEncode(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

async function gmailAccessToken() {
  const clientId = process.env.GMAIL_CLIENT_ID?.trim();
  const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) throw new Error("Email service is not configured.");
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
  const payload = await response.json();
  if (!payload.access_token) throw new Error("Email service authorization failed.");
  return payload.access_token;
}

async function sendEmail({ guestEmail, subject, body }) {
  if (!emailPattern.test(supportEmail) || /[\r\n]/.test(supportEmail)) throw new Error("Email service is not configured.");
  const accessToken = await gmailAccessToken();
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
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw: base64UrlEncode(mimeMessage) }),
  });
  if (!response.ok) throw new Error("Email service could not send the request.");
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 16_384) throw new Error("Request is too large.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function handleBookingRequest(request, response) {
  let payload;
  try {
    payload = await readBody(request);
  } catch {
    sendJson(response, 400, { error: "Enter your booking details and try again." });
    return;
  }
  if (typeof payload.website === "string" && payload.website.trim()) {
    sendJson(response, 200, { ok: true });
    return;
  }
  if (isRateLimited(request)) {
    sendJson(response, 429, { error: "Too many requests were sent. Please wait 15 minutes and try again." });
    return;
  }

  const arrival = typeof payload.arrival === "string" ? payload.arrival : "";
  const departure = typeof payload.departure === "string" ? payload.departure : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const guests = Number(payload.guests);

  if (
    !datePattern.test(arrival)
    || !datePattern.test(departure)
    || localDateKey(fromKey(arrival)) !== arrival
    || localDateKey(fromKey(departure)) !== departure
    || departure <= arrival
  ) {
    sendJson(response, 400, { error: "Choose a valid check-in and check-out date." });
    return;
  }
  if (!emailPattern.test(email) || email.length > 254 || /[\r\n]/.test(email)) {
    sendJson(response, 400, { error: "Enter a valid email address." });
    return;
  }
  if (!Number.isInteger(guests) || guests < 1 || guests > 10) {
    sendJson(response, 400, { error: "Choose between 1 and 10 guests." });
    return;
  }
  if (message.length > 1200) {
    sendJson(response, 400, { error: "Keep the additional note under 1,200 characters." });
    return;
  }
  const todayValue = new Date();
  const today = new Date(todayValue.getFullYear(), todayValue.getMonth(), todayValue.getDate());
  if (fromKey(arrival) < today || nightsBetween(arrival, departure) < 1) {
    sendJson(response, 400, { error: "Choose future stay dates." });
    return;
  }

  const availability = await getLiveAvailability();
  if (availability.status === "connected") {
    const blocked = new Set(availability.blockedDates);
    for (let cursor = fromKey(arrival), end = fromKey(departure); cursor < end; cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)) {
      if (blocked.has(localDateKey(cursor))) {
        sendJson(response, 409, { error: "Those dates now include an unavailable night. Please choose another stay." });
        return;
      }
    }
    if (availability.availabilityThrough && departure > availability.availabilityThrough) {
      sendJson(response, 409, { error: "Those dates extend beyond Airbnb’s current calendar range. Please choose earlier dates." });
      return;
    }
  }

  const nights = nightsBetween(arrival, departure);
  const standardEstimate = standardStayEstimate(arrival, departure);
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
    await sendEmail({ guestEmail: email, subject, body });
    sendJson(response, 200, { ok: true });
  } catch (error) {
    console.error("Booking request email failed", error instanceof Error ? error.message : error);
    sendJson(response, 503, { error: "Direct email is temporarily unavailable. Please try again shortly." });
  }
}

createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, { ok: true });
    return;
  }
  if (request.method === "POST" && request.url === "/api/booking-request") {
    await handleBookingRequest(request, response);
    return;
  }
  sendJson(response, 404, { error: "Not found." });
}).listen(port, "0.0.0.0", () => {
  console.log(`Booking request API listening on ${port}`);
});
