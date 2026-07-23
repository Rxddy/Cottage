# Lakefront Serenity booking sync

The public calendar in this project is currently a user-interface preview. It validates a date range and guest count, but it does not claim that a stay is available and it does not accept payment.

## Recommended production setup

Use an Airbnb-supported property-management system or channel manager as the source of truth for availability, rates and reservations. Connect the existing Airbnb listing to that provider, then connect the direct website checkout to the same property. This is the reliable route for near-real-time inventory and avoids two guests completing checkout for the same dates.

Airbnb's current channel-manager overview: <https://www.airbnb.com/help/article/3304>

## Lower-cost iCal option

Airbnb also supports two-way `.ics` calendar feeds:

1. In Airbnb, open **Calendar → Availability → Connect calendars → Connect to another website**.
2. Export the Airbnb calendar URL and subscribe to it from the website's booking system.
3. Export the website booking calendar as a public-secret `.ics` URL and import that URL into Airbnb.
4. When a direct reservation is confirmed, create the event in the website calendar so Airbnb can import and block those dates.

Airbnb says imported calendars automatically refresh every three hours, with a manual refresh option. Because that is not instant, iCal alone still has a double-booking window; use a temporary checkout hold and re-check availability immediately before capturing payment.

Airbnb's calendar-sync instructions: <https://www.airbnb.ca/help/article/99>

## Still required before direct checkout

- A chosen PMS/channel manager or booking engine
- The Airbnb calendar export URL and the website calendar import URL
- Nightly rates, fees, minimum/maximum stays and blocked dates
- A payment processor account and webhook credentials
- Cancellation, damage-deposit and rental-agreement rules
- Correct taxes, registration/licensing details and privacy/terms pages

Direct bookings may avoid marketplace service fees, but they do not remove applicable taxes or legal obligations.

## Stripe checkout wiring in this site

The website now creates a Stripe Checkout session from the booking form. To make it live, set these environment variables in the Sites runtime:

- `STRIPE_SECRET_KEY`
- `STRIPE_CURRENCY` for example `cad`
- `STRIPE_NIGHTLY_RATE_CENTS`
- `STRIPE_CLEANING_FEE_CENTS`
- `STRIPE_ENABLE_AUTOMATIC_TAX` set to `true` only if Stripe Tax is configured

The checkout session is created server-side so card details stay inside Stripe. The site still needs a webhook or booking engine to mark dates as confirmed after payment and to block the calendar everywhere that matters.
