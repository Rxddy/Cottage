# Lakefront Serenity

A production-oriented marketing and availability website for a five-bedroom
waterfront cottage on Canal Lake in Kawartha Lakes, Ontario.

![Lakefront Serenity on Canal Lake](public/og-lakefront-serenity.png)

The project has two delivery targets:

1. A full React/Next.js application built with
   [vinext](https://github.com/cloudflare/vinext) for an edge runtime.
2. A self-contained static mirror served by nginx on a TrueNAS server.

The current release is **request-to-book**, not instant checkout. Guests browse
the property, inspect a read-only calendar populated from Airbnb, select dates,
and email the host team. The host confirms availability, price, and the private
arrival details after accepting a reservation.

## Status at handoff

- The responsive public experience is implemented with real property imagery,
  five bedrooms, the full amenity inventory, nearby destinations, review
  themes, house rules, contact details, privacy terms, and social metadata.
- The booking calendar supports date selection, unavailable-night blocking,
  keyboard-friendly interactions, a sticky shortcut, and an optional price
  preview.
- Airbnb remains the current availability source of truth. Its private iCalendar
  feed is read at runtime by the full application and synchronized every five
  hours for the NAS mirror.
- The NAS mirror includes nginx security headers, cache rules, privacy and terms
  pages, an availability sync container, and a host-side health-check script.
- A server-side Stripe Checkout route is retained for a possible later
  direct-booking phase, but no current customer-facing flow submits payment.
- Exact property address, access instructions, and private calendar credentials
  are intentionally excluded from source and public copy.

## What has been built

### Guest experience

- Full-bleed lakefront hero and responsive navigation
- Property facts for ten guests, five bedrooms, six beds, and three bathrooms
- Experience, amenity, activity, gallery, bedroom, and review sections
- Six researched nearby destinations with source and Creative Commons credits
- Arrival guidance, quiet hours, rules, safety disclosures, and host contact
- Privacy and terms pages on both delivery targets
- Open Graph/Twitter preview artwork, favicon, and request-aware canonical host
- Scroll reveals and calendar transitions with reduced-motion support
- Responsive layouts for desktop, tablet, and mobile

### Availability and booking

- Two-month date picker with arrival/departure selection
- Airbnb iCalendar parsing that treats checkout as the first available date
- Disabled past and blocked nights
- Clear connected, not-configured, and unavailable feed states
- Optional nightly-rate and cleaning-fee estimate
- Pre-filled email inquiry containing selected dates and estimated total
- Sticky availability control that expands into the calendar
- Airbnb feed URL kept server-side and ignored by Git

### Operations

- Edge application build through vinext/Vite
- Static nginx mirror for TrueNAS/Docker Compose
- Three-hour NAS Airbnb availability synchronization
- Fifteen-minute host-side monitor with alert and recovery email support
- Tailscale Funnel deployment notes and safer public-domain guidance
- Privacy/terms routing in nginx
- Future Stripe session creation isolated to a server route

## Architecture

| Area | Implementation | Notes |
| --- | --- | --- |
| UI | React 19, Next.js 16 App Router, TypeScript | Main experience lives in `app/`. |
| Edge build | vinext, Vite, Cloudflare Worker entry | `worker/index.ts` handles app requests and image optimization. |
| Styling and motion | Global CSS and vendored Anime.js | No third-party runtime CDN is required. |
| Availability | Private Airbnb `.ics` feed | Server-side fetch for the full app; JSON snapshot for the static mirror. |
| Static hosting | nginx in Docker Compose | Uses `static-site/` plus shared public assets and CSS. |
| Optional data layer | Drizzle ORM and Cloudflare D1 scaffolding | No production booking records are stored yet. |
| Future payments | Server-side Stripe Checkout route | Dormant until business, inventory, tax, and webhook requirements are complete. |

### Request and sync flow

```text
Private Airbnb iCalendar URL
            |
            +--> Full app: server fetch --> parsed blocked nights --> booking calendar
            |
            +--> NAS sync container (every 3h)
                    --> static-site/airbnb-availability.json
                    --> nginx static calendar

Guest chooses dates --> pre-filled email --> host accepts or declines
```

The React app and `static-site/index.html` are separate renderings of the same
product. When customer-facing copy, booking behavior, legal links, or styling
changes, review both surfaces so the NAS mirror does not drift.

## Repository map

```text
app/
  BookingPanel.tsx             booking calendar, estimate, and sticky control
  PropertyExperience.tsx       amenities, bedrooms, gallery, reviews, motion
  airbnb-calendar.ts           server-side availability fetch
  booking-utils.ts             date, money, and iCalendar helpers
  api/stripe/checkout/route.ts future direct-checkout session endpoint
  privacy/ and terms/          legal pages
assets/listing/                preserved listing-source image derivatives
public/cottage/                production property photography
public/nearby/                 credited nearby-destination photography
public/icons/flaticon/         amenity icons and attribution
scripts/
  sync-airbnb-calendar.mjs     private feed to NAS JSON snapshot
  check-airbnb-calendar.sh     NAS sync health monitor
static-site/                   standalone NAS experience and legal pages
nas/nginx.conf                 static hosting and security configuration
docker-compose.nas.yml         cottage and calendar-sync services
worker/index.ts                edge runtime entry point
BOOKING-SYNC.md                availability and future booking architecture
NAS-HOSTING.md                 TrueNAS deployment and operations runbook
SCRAPED_LISTING.md             verified listing facts and content provenance
```

## Local development

### Prerequisites

- Node.js `>=22.13.0`
- npm

### Start the full application

```bash
npm install
npm run dev
```

Then open the URL printed by the development server.

### Useful commands

```bash
npm run dev
npm run lint
npm run build
npm test
npm run db:generate
```

## Runtime configuration

Create local environment values outside version control or configure them in the
hosting platform. `.env*`, `nas/airbnb-calendar.env`, monitor state, and monitor
logs are ignored.

| Variable | Current use | Required |
| --- | --- | --- |
| `AIRBNB_ICAL_URL` | Private Airbnb export used to block unavailable nights | Yes for live availability |
| `STRIPE_CURRENCY` | Display/checkout currency, defaults to `cad` | Only for future direct checkout |
| `STRIPE_NIGHTLY_RATE_CENTS` | Optional price estimate and checkout line item | Only for future direct checkout |
| `STRIPE_CLEANING_FEE_CENTS` | Optional price estimate and checkout line item | Only for future direct checkout |
| `STRIPE_SECRET_KEY` | Creates a server-side Stripe Checkout session | Only for future direct checkout |
| `STRIPE_ENABLE_AUTOMATIC_TAX` | Enables Stripe automatic tax when configured | Only for future direct checkout |

Never commit the Airbnb feed URL, Stripe keys, access codes, or the exact arrival
address. The `.ics` URL functions like a private credential because anyone with
it can read booking timing.

## Deployment

### Edge application

The edge target uses the existing vinext/Vite build and
`.openai/hosting.json` project binding:

```bash
npm run build
```

Configure `AIRBNB_ICAL_URL` as a server-side runtime variable in the hosting
platform. Do not expose it through a public/client-prefixed environment value.

### TrueNAS static mirror

The operational steps, NAS path, containers, public-access options, and rollback
notes live in [NAS-HOSTING.md](NAS-HOSTING.md). At a high level:

```bash
docker compose -f docker-compose.nas.yml config
docker compose -f docker-compose.nas.yml up -d
curl -fsSI http://127.0.0.1:8097/
```

The NAS requires an uncommitted `nas/airbnb-calendar.env`:

```text
AIRBNB_ICAL_URL=https://www.airbnb.com/calendar/ical/...
```

The sync service updates `static-site/airbnb-availability.json` every five
minutes. Run `scripts/check-airbnb-calendar.sh` every fifteen minutes from the host
to detect a stopped container or a feed older than six hours. Outbound mail must
be configured in TrueNAS for alerts to be delivered.

## AI handoff

This section is the operating brief for the next developer or AI agent.

### Product decisions that should remain true

1. **Do not expose the exact address before acceptance.** Public copy should
   identify Kawartha Lakes/Canal Lake only. Arrival address and access
   instructions are sent privately after the host accepts a reservation.
2. **Airbnb is the current availability source of truth.** The website calendar
   is read-only and advisory because iCalendar refresh is not instantaneous.
3. **Do not imply instant booking or payment.** The live CTA creates an email
   request. The host confirms availability and pricing manually.
4. **Do not advertise a tax-free or fee-free stay.** Applicable licensing,
   taxes, insurance, cancellation terms, deposits, and the Renter's Code of
   Conduct still apply.
5. **Keep secrets server-side.** Never place `AIRBNB_ICAL_URL`, Stripe secrets,
   door codes, or private guest information in source, generated JSON, or
   client-side bundles.
6. **Maintain both delivery targets.** Important UI, copy, calendar, CSS, and
   legal changes must be checked in the React app and the NAS static mirror.
7. **Preserve content attribution.** Nearby-destination images are independent
   of the cottage and carry Creative Commons credits. Flaticon attribution is
   retained in the footer and `public/icons/flaticon/ATTRIBUTION.md`.

### Recommended next work

1. Confirm the owner-approved public domain and deploy the same release to it.
2. Confirm the property licence, HST/tax handling, insurance, cancellation
   policy, damage-deposit rules, and final Renter's Code of Conduct wording.
3. Validate all listing facts, amenities, sleeping arrangements, contact
   recipients, and photographs with the owner before each major launch.
4. Replace iCalendar with an Airbnb-supported PMS/channel manager before
   enabling direct payment or automatic acceptance.
5. If direct checkout returns, add authoritative inventory holds, Stripe
   webhooks, idempotency, reservation persistence, tax calculation, rental
   agreement acceptance, confirmation email, refunds/cancellation handling, and
   an operations dashboard before exposing the existing endpoint.
6. Add focused automated tests for iCalendar edge cases, booking date ranges,
   blocked-night boundaries, and both rendered deployment surfaces.
7. Review accessibility with keyboard navigation, screen readers, zoom, colour
   contrast, and reduced motion on representative devices.
8. Add privacy-safe analytics and error monitoring only after consent and data
   retention decisions are documented.

### Completed-work timeline

- **July 17, 2026:** Built the first direct-booking concept, verified the Airbnb
  listing inventory, rebuilt the full cottage experience, deployed the NAS
  mirror, added nearby attractions, real photography, icons, and activity
  content.
- **July 22, 2026:** Added a server-side Stripe Checkout foundation and sticky
  calendar CTA for a possible direct-booking phase.
- **July 23, 2026:** Refined calendar interactions, added read-only Airbnb
  blocked nights, automated and monitored NAS synchronization, removed the feed
  secret from source, shifted the public launch to request-to-book, synchronized
  legal pages, clarified owner obligations, and made private-address handling
  explicit.

### Source documents

- [BOOKING-SYNC.md](BOOKING-SYNC.md) explains the current iCalendar approach,
  its limitations, and the requirements for future direct booking.
- [NAS-HOSTING.md](NAS-HOSTING.md) is the deployment and monitoring runbook.
- [SCRAPED_LISTING.md](SCRAPED_LISTING.md) records the listing facts, rules,
  amenities, reviews, photo inventory, and nearby-content research captured on
  July 17, 2026.

Treat the Airbnb listing and owner confirmation as authoritative whenever a
fact has changed since that research date.
