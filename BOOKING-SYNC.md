# Lakefront Serenity booking sync

The public calendar is intentionally read-only. It reads blocked nights from the Airbnb iCalendar export, shades and disables those nights, and sends guests to Airbnb to complete the reservation. Airbnb remains the booking source of truth while the owner updates and books the listing manually.

## Recommended production setup

Use an Airbnb-supported property-management system or channel manager as the source of truth for availability, rates and reservations if direct bookings are added later. Connect the existing Airbnb listing to that provider, then connect the direct website checkout to the same property. This is the reliable route for near-real-time inventory and avoids two guests completing checkout for the same dates.

Airbnb's current channel-manager overview: <https://www.airbnb.com/help/article/3304>

## Lower-cost iCal option

Airbnb also supports `.ics` calendar feeds. For this project, only the Airbnb-to-website direction is enabled:

1. In Airbnb, open **Calendar → Availability → Connect calendars → Connect to another website**.
2. Copy the Airbnb calendar URL ending in `.ics`.
3. Set it as the private `AIRBNB_ICAL_URL` runtime variable for the public Sites deployment. Never commit the URL or expose it in client-side code.
4. For the NAS static site, the `airbnb-calendar-sync` Compose service runs `scripts/sync-airbnb-calendar.mjs` every five minutes and keeps the generated `static-site/airbnb-availability.json` mounted by nginx. The private `nas/airbnb-calendar.env` file contains the feed URL and is never committed.

Airbnb says imported calendars automatically refresh every three hours, with a manual refresh option. The public Sites page fetches the feed when rendered; the NAS page reads the last scheduled sync. Because iCal is not instant, it should remain a display aid only unless a channel manager is introduced.

Airbnb's calendar-sync instructions: <https://www.airbnb.ca/help/article/99>

## Still required before direct checkout

- A chosen PMS/channel manager or booking engine
- The Airbnb calendar export URL and the website calendar import URL
- Nightly rates, fees, minimum/maximum stays and blocked dates
- A payment processor account and webhook credentials
- Cancellation, damage-deposit and rental-agreement rules
- Correct taxes, registration/licensing details and privacy/terms pages

Direct bookings may avoid marketplace service fees, but they do not remove applicable taxes or legal obligations.

## Stripe checkout wiring retained for a future direct-booking phase

The server route remains available for a future direct-booking phase, but the current public and NAS UI does not submit Stripe payments. Guests are sent to Airbnb instead. If direct checkout is re-enabled later, set these environment variables in the Sites runtime:

- `STRIPE_SECRET_KEY`
- `STRIPE_CURRENCY` for example `cad`
- `STRIPE_NIGHTLY_RATE_CENTS`
- `STRIPE_CLEANING_FEE_CENTS`
- `STRIPE_ENABLE_AUTOMATIC_TAX` set to `true` only if Stripe Tax is configured

The checkout session is created server-side so card details stay inside Stripe. The site still needs a webhook or booking engine to mark dates as confirmed after payment and to block the calendar everywhere that matters.
