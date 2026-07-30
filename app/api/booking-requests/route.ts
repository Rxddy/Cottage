import {
  calculateBookingPriceBreakdown,
  dateKey,
  fromKey,
  parseIcalBookedDates,
  type BookingPricing,
} from "@/app/booking-utils";
import { getDb } from "@/db";
import { bookingRequests } from "@/db/schema";

const MAX_OCCUPANCY = 10;
const MAX_VEHICLES = 5;
const DEFAULT_BOOKING_CONDITIONS_VERSION = "2026-07-30";
const DEFAULT_PRIVACY_NOTICE_VERSION = "2026-07-30";
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

type BookingRequestPayload = Record<string, unknown> & {
  address?: Record<string, unknown>;
  adultGuestNames?: unknown;
};

function text(value: unknown, max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function integer(value: unknown, fallback = 0) {
  const number = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  return Number.isInteger(number) ? number : fallback;
}

function boolean(value: unknown) {
  return value === true;
}

function pricingFromEnv(): BookingPricing {
  const nightly = Number(process.env.BOOKING_NIGHTLY_RATE_CENTS ?? 0);
  return {
    currency: process.env.BOOKING_CURRENCY ?? "cad",
    nightlyRateCents: nightly,
    weekdayRateCents: Number(process.env.BOOKING_WEEKDAY_RATE_CENTS ?? nightly),
    weekendRateCents: Number(process.env.BOOKING_WEEKEND_RATE_CENTS ?? nightly),
    longWeekendRateCents: Number(process.env.BOOKING_LONG_WEEKEND_RATE_CENTS ?? process.env.BOOKING_WEEKEND_RATE_CENTS ?? nightly),
    cleaningFeeCents: Number(process.env.BOOKING_CLEANING_FEE_CENTS ?? 0),
    taxRateBasisPoints: Number(process.env.BOOKING_TAX_RATE_BASIS_POINTS ?? 0),
    refundableSecurityDepositCents: Number(process.env.BOOKING_SECURITY_DEPOSIT_CENTS ?? 100000),
  };
}

function requestId() {
  return `LS-${new Date().getFullYear()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function rangeIncludesBookedNight(arrival: string, departure: string, booked: ReadonlySet<string>) {
  for (let day = fromKey(arrival), end = fromKey(departure); day < end; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
    if (booked.has(dateKey(day))) return true;
  }
  return false;
}

async function configuredBookedDates() {
  const icalUrl = process.env.AIRBNB_ICAL_URL;
  if (!icalUrl) return new Set<string>();
  try {
    const response = await fetch(icalUrl, { headers: { accept: "text/calendar" } });
    if (!response.ok) return new Set<string>();
    return new Set(parseIcalBookedDates(await response.text()));
  } catch (error) {
    console.error("Airbnb availability recheck failed", error);
    return new Set<string>();
  }
}

export async function POST(request: Request) {
  let payload: BookingRequestPayload;
  try {
    payload = (await request.json()) as BookingRequestPayload;
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (text(payload.website)) return Response.json({ error: "Unable to submit this request." }, { status: 400 });

  const arrival = text(payload.arrival, 10);
  const departure = text(payload.departure, 10);
  const legalName = text(payload.legalName, 120);
  const email = text(payload.email, 254).toLowerCase();
  const mobilePhone = text(payload.mobilePhone, 40);
  const address = payload.address && typeof payload.address === "object" ? payload.address : {};
  const addressLine1 = text(address.line1, 160);
  const addressLine2 = text(address.line2, 160);
  const city = text(address.city, 80);
  const province = text(address.province, 80);
  const postalCode = text(address.postalCode, 24);
  const country = text(address.country, 80);
  const adults = integer(payload.adults);
  const children = integer(payload.children);
  const adultGuestNames = Array.isArray(payload.adultGuestNames)
    ? payload.adultGuestNames.map((name) => text(name, 120)).filter(Boolean)
    : [];
  const stayReason = text(payload.stayReason, 500);
  const vehicleCount = integer(payload.vehicleCount);
  const petsAttending = boolean(payload.petsAttending);
  const petDetails = text(payload.petDetails, 500);
  const additionalNotes = text(payload.additionalNotes, 1200);

  if (!isoDate.test(arrival) || !isoDate.test(departure) || departure <= arrival) return Response.json({ error: "Choose a valid check-in and check-out range." }, { status: 400 });
  if (legalName.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || mobilePhone.length < 7) return Response.json({ error: "Enter the primary renter's legal name, email and mobile phone." }, { status: 400 });
  if (!addressLine1 || !city || !province || !postalCode || !country) return Response.json({ error: "Complete the renter's home address." }, { status: 400 });
  if (adults < 1 || children < 0 || adults + children > MAX_OCCUPANCY) return Response.json({ error: `Guests must total between 1 and ${MAX_OCCUPANCY}.` }, { status: 400 });
  if (adultGuestNames.length !== adults) return Response.json({ error: "Enter the name of every adult guest, including the primary renter." }, { status: 400 });
  if (stayReason.length < 10) return Response.json({ error: "Tell us a little more about the reason for your stay." }, { status: 400 });
  if (vehicleCount < 0 || vehicleCount > MAX_VEHICLES) return Response.json({ error: `Vehicles must be between 0 and ${MAX_VEHICLES}.` }, { status: 400 });
  if (petsAttending && petDetails.length < 3) return Response.json({ error: "Add a short description of the pets who will attend." }, { status: 400 });

  const acknowledgements = [
    "minimumAgeConfirmed", "primaryRenterStaying", "registeredGuestsOnlyAccepted", "idRequirementAccepted",
    "agreementRequirementAccepted", "paymentRequirementAccepted", "securityDepositRequirementAccepted",
    "requestOnlyAccepted", "bookingConditionsAccepted", "privacyNoticeAccepted",
  ];
  if (acknowledgements.some((key) => !boolean(payload[key]))) return Response.json({ error: "Confirm each booking requirement before submitting." }, { status: 400 });

  const bookingConditionsVersion = text(payload.bookingConditionsVersion, 40);
  const privacyNoticeVersion = text(payload.privacyNoticeVersion, 40);
  if (bookingConditionsVersion !== (process.env.BOOKING_CONDITIONS_VERSION ?? DEFAULT_BOOKING_CONDITIONS_VERSION) || privacyNoticeVersion !== (process.env.PRIVACY_NOTICE_VERSION ?? DEFAULT_PRIVACY_NOTICE_VERSION)) {
    return Response.json({ error: "Refresh the page to accept the current booking and privacy notices." }, { status: 409 });
  }

  const booked = await configuredBookedDates();
  if (rangeIncludesBookedNight(arrival, departure, booked)) return Response.json({ error: "Those dates are no longer available. Please choose another range." }, { status: 409 });

  const quotedAt = new Date().toISOString();
  const breakdown = calculateBookingPriceBreakdown(arrival, departure, pricingFromEnv());
  const id = requestId();
  const pricingVersion = process.env.BOOKING_PRICING_VERSION ?? DEFAULT_BOOKING_CONDITIONS_VERSION;
  const values = {
    id, status: "submitted", createdAt: quotedAt, updatedAt: quotedAt, arrival, departure,
    legalName, email, mobilePhone, addressLine1, addressLine2: addressLine2 || null, city, province, postalCode, country,
    adults, children, adultGuestNamesJson: JSON.stringify(adultGuestNames), stayReason, vehicleCount,
    petsAttending, petDetails: petDetails || null, additionalNotes: additionalNotes || null,
    minimumAgeConfirmed: boolean(payload.minimumAgeConfirmed), primaryRenterStaying: boolean(payload.primaryRenterStaying),
    registeredGuestsOnlyAccepted: boolean(payload.registeredGuestsOnlyAccepted), idRequirementAccepted: boolean(payload.idRequirementAccepted),
    agreementRequirementAccepted: boolean(payload.agreementRequirementAccepted), paymentRequirementAccepted: boolean(payload.paymentRequirementAccepted),
    securityDepositRequirementAccepted: boolean(payload.securityDepositRequirementAccepted), requestOnlyAccepted: boolean(payload.requestOnlyAccepted),
    bookingConditionsAccepted: boolean(payload.bookingConditionsAccepted), privacyNoticeAccepted: boolean(payload.privacyNoticeAccepted),
    bookingConditionsVersion, privacyNoticeVersion, acknowledgementsAcceptedAt: quotedAt,
    quoteCurrency: breakdown.currency, quoteNightsSubtotalCents: breakdown.nights.reduce((sum, line) => sum + line.amountCents, 0),
    quoteCleaningFeeCents: breakdown.fees.reduce((sum, line) => sum + line.amountCents, 0), quoteTaxRateBasisPoints: breakdown.taxRateBasisPoints,
    quoteTaxCents: breakdown.taxCents, pricingVersion, priceBreakdownJson: JSON.stringify(breakdown), quotedAt,
    rentalTotalCents: breakdown.totalCents, securityDepositCents: breakdown.refundableSecurityDepositCents,
    agreementStatus: "not_started", identityStatus: "not_started", rentalPaymentStatus: "not_requested", securityDepositStatus: "not_requested",
  } as const;

  try {
    await getDb().insert(bookingRequests).values(values);
  } catch (error) {
    console.error("Booking request persistence is unavailable", error);
    return Response.json({ id, status: "email_fallback", error: "The request could not be saved yet. Use the prepared email draft to contact the host." }, { status: 503 });
  }

  return Response.json({
    id, status: "submitted", message: "Your booking request has been received. It is not yet a confirmed reservation.",
    agreementStatus: "not_started", identityStatus: "not_started", identityProvider: process.env.IDENTITY_PROVIDER ?? "persona",
    paymentMethod: "interac", paymentEmailConfigured: Boolean(process.env.INTERAC_PAYMENT_EMAIL),
    rentalTotalCents: breakdown.totalCents, securityDepositCents: breakdown.refundableSecurityDepositCents,
  });
}
