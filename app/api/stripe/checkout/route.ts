import { nightsBetween } from "@/app/booking-utils";

type CheckoutRequest = {
  arrival?: string;
  departure?: string;
  guests?: number;
};

type CheckoutPricing = {
  currency: string;
  nightlyRateCents: number;
  cleaningFeeCents: number;
};

function getRequestOrigin(request: Request) {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const host = forwardedHost ?? url.host;
  const protocol = forwardedProto ?? url.protocol.replace(":", "");
  return `${protocol}://${host}`;
}

function getPricingFromEnv(): CheckoutPricing {
  return {
    currency: process.env.STRIPE_CURRENCY ?? "cad",
    nightlyRateCents: Number(process.env.STRIPE_NIGHTLY_RATE_CENTS ?? 0),
    cleaningFeeCents: Number(process.env.STRIPE_CLEANING_FEE_CENTS ?? 0),
  };
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return Response.json(
      {
        error:
          "Stripe is not configured yet. Set STRIPE_SECRET_KEY and the booking price environment variables.",
      },
      { status: 503 },
    );
  }

  const pricing = getPricingFromEnv();
  if (pricing.nightlyRateCents <= 0 && pricing.cleaningFeeCents <= 0) {
    return Response.json(
      {
        error:
          "Stripe booking rates are not configured yet. Set STRIPE_NIGHTLY_RATE_CENTS or STRIPE_CLEANING_FEE_CENTS.",
      },
      { status: 503 },
    );
  }

  let payload: CheckoutRequest;
  try {
    payload = (await request.json()) as CheckoutRequest;
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const arrival = payload.arrival?.trim() ?? "";
  const departure = payload.departure?.trim() ?? "";
  const guests = Number(payload.guests ?? 2);

  if (!arrival || !departure) {
    return Response.json(
      { error: "Select both a check-in and check-out date before continuing." },
      { status: 400 },
    );
  }

  const nights = nightsBetween(arrival, departure);
  if (nights <= 0) {
    return Response.json(
      { error: "Check-out must be after check-in." },
      { status: 400 },
    );
  }

  const lineItems: Record<string, string>[] = [];

  if (pricing.nightlyRateCents > 0) {
    lineItems.push({
      "price_data[currency]": pricing.currency,
      "price_data[product_data][name]": "Lakefront Serenity stay",
      "price_data[product_data][description]": `${nights} ${nights === 1 ? "night" : "nights"} · ${arrival} to ${departure}`,
      "price_data[unit_amount]": String(pricing.nightlyRateCents),
      quantity: String(nights),
    });
  }

  if (pricing.cleaningFeeCents > 0) {
    lineItems.push({
      "price_data[currency]": pricing.currency,
      "price_data[product_data][name]": "Cleaning fee",
      "price_data[unit_amount]": String(pricing.cleaningFeeCents),
      quantity: "1",
    });
  }

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("billing_address_collection", "required");
  form.set("success_url", `${getRequestOrigin(request)}/?booking=success&session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${getRequestOrigin(request)}/?booking=cancelled#book`);
  if (process.env.STRIPE_ENABLE_AUTOMATIC_TAX === "true") {
    form.set("automatic_tax[enabled]", "true");
  }
  form.set("metadata[arrival]", arrival);
  form.set("metadata[departure]", departure);
  form.set("metadata[nights]", String(nights));
  form.set("metadata[guests]", String(guests));
  form.set("metadata[property]", "Lakefront Serenity");

  lineItems.forEach((item, index) => {
    for (const [key, value] of Object.entries(item)) {
      form.set(`line_items[${index}][${key}]`, value);
    }
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${secretKey}:`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: form.toString(),
  });

  const responseBody = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | { url?: string; id?: string }
    | null;

  if (!response.ok || !responseBody || !("url" in responseBody)) {
    return Response.json(
      {
        error:
          responseBody && "error" in responseBody && responseBody.error?.message
            ? responseBody.error.message
            : "Stripe could not create a checkout session.",
      },
      { status: 502 },
    );
  }

  return Response.json({
    url: responseBody.url,
    id: responseBody.id,
  });
}
