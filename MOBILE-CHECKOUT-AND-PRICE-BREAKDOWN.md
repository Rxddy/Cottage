# Mobile Checkout and Receipt-Style Price Breakdown

## Purpose

This document defines a mobile-first checkout and booking-request experience for Lakefront Serenity, with special attention to iPhone usability and transparent receipt-style pricing.

The current project already calculates ordinary stays by applying:

- Monday–Thursday nightly rate
- Friday–Sunday nightly rate
- Cleaning fee
- Long-weekend pricing confirmed separately by the host

The updated interface must show exactly how the estimate was calculated instead of displaying only one final number.

> **Important:** The browser may display an estimate, but the server must independently calculate and store the authoritative price breakdown before the agreement is generated.

---

# 1. Mobile-first booking experience

## Target devices

Design and test for at least:

- iPhone SE width: 320–375 CSS px
- Standard iPhone width: 390–393 CSS px
- iPhone Pro Max width: 428–430 CSS px
- Safari with browser bars visible
- Safari with text zoom and 200% page zoom
- Portrait orientation as the primary layout

The booking experience must not require horizontal scrolling.

---

# 2. Recommended mobile flow

Do not place the entire booking request inside one oversized desktop-style modal on iPhone.

Use a step-by-step mobile sheet or full-screen route:

```text
Step 1 — Dates
Step 2 — Guests
Step 3 — Price details
Step 4 — Primary renter
Step 5 — Guest information
Step 6 — Stay details
Step 7 — Requirements
Step 8 — Review and submit
```

Recommended route:

```text
/book/request
```

The existing calendar can still open from `BookingPanel.tsx`, but after dates are selected, mobile users should be taken into the dedicated request flow.

Desktop can continue using a dialog if desired, but both interfaces must submit the same validated payload.

---

# 3. iPhone layout requirements

## Page shell

Use:

```css
.mobile-booking-page {
  width: 100%;
  min-width: 0;
  padding: 16px;
  padding-bottom: calc(112px + env(safe-area-inset-bottom));
}
```

Use iOS safe-area variables for top and bottom spacing:

```css
padding-top: max(16px, env(safe-area-inset-top));
padding-bottom: calc(112px + env(safe-area-inset-bottom));
```

Avoid fixed viewport heights such as `height: 100vh`. Mobile Safari changes its visible viewport as the browser controls appear and disappear.

Prefer:

```css
min-height: 100dvh;
```

with a normal document flow.

## Sticky mobile action bar

Use a bottom action bar that remains visible while completing a step:

```text
Estimated total                         $1,557.00 CAD
[Back]                          [Continue]
```

Requirements:

- Respect `env(safe-area-inset-bottom)`.
- Keep the total visible.
- Do not cover inputs or validation errors.
- Disable Continue until the current step is valid.
- On the final step, change Continue to `Submit booking request`.
- Do not place the full agreement inside this sticky bar.

Example CSS:

```css
.mobile-checkout-actions {
  position: sticky;
  bottom: 0;
  z-index: 20;
  display: grid;
  gap: 10px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid var(--border);
  background: color-mix(in srgb, var(--background) 94%, transparent);
  backdrop-filter: blur(14px);
}
```

If `backdrop-filter` is unsupported, the solid background must remain readable.

## Input sizing

Use at least:

```css
font-size: 16px;
min-height: 48px;
```

A font size below 16px can cause Safari to zoom into text inputs automatically.

Buttons and selectable controls should have a minimum touch target of approximately 44×44 CSS px.

## Form layout

On iPhone:

- Stack all text inputs vertically.
- Put first and last name in one legal-name input unless the agreement system specifically requires separate values.
- Put city and province in separate rows if two columns become cramped.
- Use native `select` elements for province, country, adult count, child count, vehicle count, and pet count.
- Use `inputMode="tel"` for telephone number.
- Use `autoComplete` attributes.
- Use `enterKeyHint="next"` where appropriate.
- Keep checkboxes as full-width rows with the box aligned to the top of multi-line text.

Suggested autocomplete values:

```tsx
<input autoComplete="name" />
<input autoComplete="email" inputMode="email" />
<input autoComplete="tel" inputMode="tel" />
<input autoComplete="street-address" />
<input autoComplete="address-line2" />
<input autoComplete="address-level2" />
<input autoComplete="address-level1" />
<input autoComplete="postal-code" />
<input autoComplete="country-name" />
```

## Keyboard behaviour

When the iPhone keyboard opens:

- The active input must remain visible.
- The sticky action bar must not trap or cover the active field.
- Avoid nested scroll containers inside the form.
- Scroll the first invalid field into view after validation.
- Do not automatically close the form when Safari resizes the viewport.

---

# 4. Progress indicator

Show a compact mobile progress indicator:

```text
Step 3 of 8
Price details
━━━━━━━━━━━━━━ 38%
```

Do not display eight large tabs across the iPhone screen.

Recommended accessible markup:

```tsx
<div aria-label={`Step ${step} of ${totalSteps}`}>
  <span>Step {step} of {totalSteps}</span>
  <strong>{stepTitle}</strong>
  <progress value={step} max={totalSteps} />
</div>
```

Preserve entered data when the guest goes backward.

Optionally save non-sensitive draft data in session state, but do not store ID documents, payment details, or sensitive personal information in browser local storage.

---

# 5. Mobile date selection

The existing two-month desktop calendar should become one month at a time on narrow screens.

Recommended behaviour:

```css
@media (max-width: 640px) {
  .calendar-months {
    grid-template-columns: 1fr;
  }

  .calendar-month:nth-child(n + 2) {
    display: none;
  }
}
```

A better React implementation is to render one month on mobile rather than hide a rendered second month.

The selected dates should remain visible above the calendar:

```text
Check-in                       Check-out
Fri, Aug 14                    Sun, Aug 16
```

After both dates are selected, show:

```text
2 nights selected
[Continue to guests]
```

---

# 6. Receipt-style price breakdown

## Goal

Where the project currently shows only a standard estimate, show a complete itemized breakdown.

Example for two ordinary weekend nights at $600 per night:

```text
Price details

Fri, Aug 14 — Weekend rate             $600.00
Sat, Aug 15 — Weekend rate             $600.00
Cleaning fee                           $200.00
                                      --------
Accommodation subtotal               $1,400.00
HST (13%)                               $182.00
                                      --------
Total                                $1,582.00 CAD

Refundable security deposit            $1,000.00
Collected separately and not included in the rental total.
```

Only show HST when the owner has confirmed that HST must be charged and configured the rate. Do not hardcode tax treatment without accounting confirmation.

The refundable damage deposit must be visually separated from the rental total because it is not rental revenue and is returned after inspection, subject to documented deductions.

---

# 7. Pricing data structure

The current `BookingPricing` type should be expanded.

```ts
export type BookingPricing = {
  currency: string;
  mondayThursdayRateCents: number;
  fridaySundayRateCents: number;
  longWeekendRateCents: number;
  cleaningFeeCents: number;
  taxRateBasisPoints: number;
  refundableSecurityDepositCents: number;
};
```

Examples:

```ts
const pricing: BookingPricing = {
  currency: "cad",
  mondayThursdayRateCents: 55_000,
  fridaySundayRateCents: 60_000,
  longWeekendRateCents: 65_000,
  cleaningFeeCents: 20_000,
  taxRateBasisPoints: 1_300, // 13.00%; set to 0 if tax is not charged.
  refundableSecurityDepositCents: 100_000,
};
```

Use basis points rather than floating-point decimal tax rates.

```text
1 basis point = 0.01%
1,300 basis points = 13.00%
```

---

# 8. Authoritative breakdown function

Add a function that returns receipt lines instead of only one total.

Recommended file:

```text
app/booking-pricing.ts
```

Suggested types:

```ts
export type StayRateKind =
  | "weekday"
  | "weekend"
  | "long_weekend";

export type PriceLine = {
  id: string;
  label: string;
  description?: string;
  amountCents: number;
};

export type StayNightLine = PriceLine & {
  date: string;
  rateKind: StayRateKind;
};

export type BookingPriceBreakdown = {
  currency: string;
  nights: StayNightLine[];
  fees: PriceLine[];
  accommodationSubtotalCents: number;
  taxableSubtotalCents: number;
  taxRateBasisPoints: number;
  taxCents: number;
  totalCents: number;
  refundableSecurityDepositCents: number;
};
```

Suggested implementation:

```ts
import {
  dateKey,
  friendlyDate,
  fromKey,
  type BookingPricing,
} from "./booking-utils";

export function calculateBookingPriceBreakdown(
  arrival: string,
  departure: string,
  pricing: BookingPricing,
  longWeekendDates: ReadonlySet<string> = new Set(),
): BookingPriceBreakdown {
  if (!arrival || !departure || departure <= arrival) {
    return {
      currency: pricing.currency,
      nights: [],
      fees: [],
      accommodationSubtotalCents: 0,
      taxableSubtotalCents: 0,
      taxRateBasisPoints: pricing.taxRateBasisPoints,
      taxCents: 0,
      totalCents: 0,
      refundableSecurityDepositCents:
        pricing.refundableSecurityDepositCents,
    };
  }

  const nights: StayNightLine[] = [];

  for (
    let night = fromKey(arrival), checkout = fromKey(departure);
    night < checkout;
    night = new Date(
      night.getFullYear(),
      night.getMonth(),
      night.getDate() + 1,
    )
  ) {
    const key = dateKey(night);
    const day = night.getDay();

    const rateKind: StayRateKind = longWeekendDates.has(key)
      ? "long_weekend"
      : day >= 1 && day <= 4
        ? "weekday"
        : "weekend";

    const amountCents = rateKind === "long_weekend"
      ? pricing.longWeekendRateCents
      : rateKind === "weekday"
        ? pricing.mondayThursdayRateCents
        : pricing.fridaySundayRateCents;

    const rateLabel = rateKind === "long_weekend"
      ? "Long-weekend rate"
      : rateKind === "weekday"
        ? "Monday–Thursday rate"
        : "Friday–Sunday rate";

    nights.push({
      id: `night-${key}`,
      date: key,
      rateKind,
      label: friendlyDate(key),
      description: rateLabel,
      amountCents,
    });
  }

  const fees: PriceLine[] = pricing.cleaningFeeCents > 0
    ? [{
        id: "cleaning-fee",
        label: "Cleaning fee",
        amountCents: pricing.cleaningFeeCents,
      }]
    : [];

  const nightsSubtotalCents = nights.reduce(
    (sum, line) => sum + line.amountCents,
    0,
  );

  const feesSubtotalCents = fees.reduce(
    (sum, line) => sum + line.amountCents,
    0,
  );

  const accommodationSubtotalCents =
    nightsSubtotalCents + feesSubtotalCents;

  const taxableSubtotalCents = accommodationSubtotalCents;

  const taxCents = Math.round(
    taxableSubtotalCents * pricing.taxRateBasisPoints / 10_000,
  );

  return {
    currency: pricing.currency,
    nights,
    fees,
    accommodationSubtotalCents,
    taxableSubtotalCents,
    taxRateBasisPoints: pricing.taxRateBasisPoints,
    taxCents,
    totalCents: accommodationSubtotalCents + taxCents,
    refundableSecurityDepositCents:
      pricing.refundableSecurityDepositCents,
  };
}
```

Have the owner/accountant confirm whether every fee is taxable before treating the full subtotal as taxable.

---

# 9. Receipt component

Recommended file:

```text
app/booking/BookingPriceReceipt.tsx
```

Example component:

```tsx
import { formatMoney } from "../booking-utils";
import type { BookingPriceBreakdown } from "../booking-pricing";

export function BookingPriceReceipt({
  breakdown,
  compact = false,
}: {
  breakdown: BookingPriceBreakdown;
  compact?: boolean;
}) {
  const taxPercent = breakdown.taxRateBasisPoints / 100;

  return (
    <section
      className={compact ? "price-receipt compact" : "price-receipt"}
      aria-labelledby="price-details-title"
    >
      <div className="price-receipt-heading">
        <h3 id="price-details-title">Price details</h3>
        <span>{breakdown.nights.length} nights</span>
      </div>

      <div className="price-receipt-lines">
        {breakdown.nights.map((line) => (
          <div className="price-receipt-line" key={line.id}>
            <div>
              <strong>{line.label}</strong>
              <small>{line.description}</small>
            </div>
            <span>{formatMoney(line.amountCents, breakdown.currency)}</span>
          </div>
        ))}

        {breakdown.fees.map((line) => (
          <div className="price-receipt-line" key={line.id}>
            <span>{line.label}</span>
            <span>{formatMoney(line.amountCents, breakdown.currency)}</span>
          </div>
        ))}
      </div>

      <div className="price-receipt-subtotal">
        <span>Accommodation subtotal</span>
        <strong>
          {formatMoney(
            breakdown.accommodationSubtotalCents,
            breakdown.currency,
          )}
        </strong>
      </div>

      {breakdown.taxRateBasisPoints > 0 ? (
        <div className="price-receipt-line">
          <span>HST ({taxPercent.toFixed(2).replace(/\.00$/, "")}%)</span>
          <span>{formatMoney(breakdown.taxCents, breakdown.currency)}</span>
        </div>
      ) : null}

      <div className="price-receipt-total">
        <span>Total</span>
        <strong>{formatMoney(breakdown.totalCents, breakdown.currency)}</strong>
      </div>

      {breakdown.refundableSecurityDepositCents > 0 ? (
        <div className="security-deposit-notice">
          <div>
            <strong>Refundable security deposit</strong>
            <span>
              {formatMoney(
                breakdown.refundableSecurityDepositCents,
                breakdown.currency,
              )}
            </span>
          </div>
          <p>
            Collected separately before check-in and not included in the
            rental total. Returned after inspection, subject to documented
            deductions permitted by the rental agreement.
          </p>
        </div>
      ) : null}
    </section>
  );
}
```

---

# 10. Receipt styling

```css
.price-receipt {
  display: grid;
  gap: 16px;
  width: 100%;
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--surface);
}

.price-receipt-heading,
.price-receipt-line,
.price-receipt-subtotal,
.price-receipt-total,
.security-deposit-notice > div {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.price-receipt-lines {
  display: grid;
  gap: 14px;
}

.price-receipt-line > div {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.price-receipt-line small {
  color: var(--muted-text);
}

.price-receipt-line > span:last-child,
.price-receipt-subtotal > strong,
.price-receipt-total > strong {
  flex: 0 0 auto;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.price-receipt-subtotal {
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.price-receipt-total {
  padding-top: 16px;
  border-top: 2px solid var(--text);
  font-size: 1.125rem;
}

.security-deposit-notice {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 14px;
  background: var(--subtle-surface);
}

.security-deposit-notice p {
  margin: 0;
  color: var(--muted-text);
  font-size: 0.875rem;
}

@media (max-width: 420px) {
  .price-receipt {
    padding: 16px;
    border-radius: 16px;
  }

  .price-receipt-line,
  .price-receipt-subtotal,
  .price-receipt-total {
    gap: 10px;
  }
}
```

Do not reduce receipt text below a readable size just to fit long labels. Allow the left label to wrap while keeping the amount aligned to the right.

---

# 11. Collapsed and expanded price details

On the calendar and early checkout steps, show a compact summary:

```text
Estimated total
$1,582.00 CAD
View price details
```

Tapping `View price details` should expand the receipt inline or open a bottom sheet.

On the final Review step, the full breakdown must always be expanded.

Do not make the guest submit a request without seeing:

- Each night and its rate category
- Cleaning fee
- Tax, when applicable
- Rental total
- Separate refundable security-deposit amount
- Explanation that the request is not yet confirmed

---

# 12. Server-generated quote snapshot

When the booking request is submitted, the server must recalculate the receipt and store a quote snapshot.

Suggested database fields:

```text
currency
nights_subtotal_cents
cleaning_fee_cents
taxable_subtotal_cents
tax_rate_basis_points
tax_cents
rental_total_cents
refundable_security_deposit_cents
pricing_version
price_breakdown_json
quoted_at
```

Example JSON:

```json
{
  "currency": "cad",
  "pricingVersion": "2026-07-26",
  "nights": [
    {
      "date": "2026-08-14",
      "rateKind": "weekend",
      "label": "Aug 14, 2026",
      "amountCents": 60000
    },
    {
      "date": "2026-08-15",
      "rateKind": "weekend",
      "label": "Aug 15, 2026",
      "amountCents": 60000
    }
  ],
  "cleaningFeeCents": 20000,
  "taxRateBasisPoints": 1300,
  "taxCents": 18200,
  "totalCents": 158200,
  "refundableSecurityDepositCents": 100000
}
```

Use the same snapshot when generating the Adobe Acrobat Sign agreement. This prevents the agreement from displaying a different amount from the website request.

If the host changes the price after review, create a new quote version and require the guest to see and accept the revised amount before signing.

---

# 13. Email receipt

The guest confirmation email should repeat the breakdown.

Example:

```text
Booking request received
Reservation request: LS-2026-A7K92

Dates: Aug 14–16, 2026
Guests: 6

Price estimate
Aug 14 — Friday–Sunday rate             $600.00
Aug 15 — Friday–Sunday rate             $600.00
Cleaning fee                             $200.00
Accommodation subtotal                 $1,400.00
HST (13%)                                $182.00
Rental total                           $1,582.00 CAD

Refundable security deposit            $1,000.00 CAD
Collected separately before check-in.

This is a booking request only. The reservation is not confirmed until identity verification, the rental agreement, payment and the refundable security deposit are completed.
```

The host notification email should use the exact same server-generated numbers.

---

# 14. Review screen

The final mobile Review step should contain these sections in this order:

```text
Your stay
Price details
Primary renter
Guests
Vehicles and pets
Requirements acknowledged
What happens next
Submit booking request
```

Show an Edit link beside each section. Editing should return to the correct step without clearing later values.

## What happens next

Use plain language:

```text
1. We review your request.
2. Adobe Acrobat Sign emails the rental agreement.
3. If approved, Persona emails a secure identity-verification link.
4. Rental payment is completed by Interac e-Transfer.
5. The refundable security deposit is paid separately.
6. Check-in details and the unique door code are emailed after all requirements are completed.
```

---

# 15. Avoid duplicate calculation logic

Do not calculate the total separately in:

- `BookingPanel.tsx`
- The mobile request page
- The booking request API
- The email generator
- The Adobe agreement generator

Create one shared server-safe pricing module and reuse it everywhere.

The browser can call the same pure function for immediate display, but the API must recalculate the price from trusted configuration.

Suggested structure:

```text
app/
  booking-utils.ts
  booking-pricing.ts
  booking/
    BookingPriceReceipt.tsx
    MobileBookingFlow.tsx
    MobileBookingActions.tsx
    steps/
      DatesStep.tsx
      GuestsStep.tsx
      PriceStep.tsx
      RenterStep.tsx
      OccupantsStep.tsx
      StayDetailsStep.tsx
      RequirementsStep.tsx
      ReviewStep.tsx
```

---

# 16. Price versioning

Add a pricing version whenever rates or tax treatment change.

```ts
const PRICING_VERSION = "2026-07-26";
```

Store the version with:

- Booking request
- Quote
- Adobe agreement
- Confirmation email
- Host dashboard

Do not silently recalculate an old request using newly changed rates.

---

# 17. Long-weekend handling

The current code says long-weekend pricing is confirmed manually. The receipt must not imply that the ordinary estimate is final when selected dates may receive long-weekend rates.

Before long-weekend dates are configured, show:

```text
Estimated total
Long-weekend pricing may apply and will be confirmed by the host before the agreement is sent.
```

Preferred improvement:

- Maintain a server-side set of long-weekend priced nights.
- Apply the rate automatically in the receipt.
- Store the applicable rate category per night.
- Allow the host to override a quote before sending the agreement.

Do not trust a client-provided `longWeekend` flag.

---

# 18. Mobile validation and error summary

When the guest tries to continue with invalid data:

- Show an error summary at the top of the step.
- Move focus to the summary.
- List each problem as a link to its field.
- Also show an inline message under each invalid field.

Example:

```text
Please fix 2 items:
• Enter your mobile number.
• Confirm that the primary renter will stay at the property.
```

Do not clear valid fields after an API error.

---

# 19. Loading and submission states

On final submission:

- Disable the submit button.
- Show `Submitting request…`.
- Prevent duplicate submissions.
- Generate an idempotency key.
- Save the database record before sending email.
- If email delivery fails after persistence, keep the request and alert the host for retry.
- Do not tell the guest that the request failed if it was already stored successfully.

Success screen:

```text
Request received

Your request number is LS-2026-A7K92.
A copy of your request and price estimate was sent to you@example.com.

This is not yet a confirmed reservation. Watch for a separate Adobe Acrobat Sign email containing the rental agreement.
```

---

# 20. iPhone testing checklist

Test on a real iPhone where possible, not only Chrome device emulation.

## Layout

- No horizontal scrolling at 320 px.
- The price amounts never overflow.
- Long receipt labels wrap cleanly.
- The keyboard does not cover the active input.
- The sticky action bar respects the home indicator.
- Calendar dates remain at least 44 px touch targets.
- The close/back control remains reachable.
- Safari text-size changes do not break layout.

## Flow

- Back and Continue preserve entered data.
- Reload behaviour is deliberate and explained.
- Validation moves to the first invalid field.
- Guest can expand and collapse price details.
- Full receipt is shown on Review.
- Security deposit is clearly excluded from rental total.
- The user cannot mistake request submission for confirmation.

## Pricing

- Weekday-only stay.
- Weekend-only stay.
- Mixed weekday/weekend stay.
- Long-weekend stay.
- Cleaning fee disabled.
- Tax disabled.
- Tax enabled.
- Zero-night invalid range.
- Rate changes after a request do not change the stored quote.
- Email and Adobe agreement match the stored quote exactly.

---

# 21. Definition of done

The mobile checkout and pricing work is complete when:

- The full flow is usable on an iPhone at 320 px without horizontal scrolling.
- The booking form is divided into manageable steps.
- A persistent bottom action area shows progress and total without covering content.
- Each night is itemized with the correct rate category.
- Cleaning fee, tax, subtotal, final rental total, and refundable deposit are clearly separated.
- The server—not the browser—produces the authoritative price.
- The stored quote is versioned.
- The confirmation email and Adobe agreement use the same quote snapshot.
- The security deposit is not included in the rental total.
- The final review screen shows the entire receipt before submission.
- Automated tests cover mixed-rate stays and rounding.
- Real-device Safari testing is completed.
