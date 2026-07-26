# Booking Request and Identity Verification Implementation

## Purpose

This document describes how to expand the current Lakefront Serenity request-to-book flow so the host can screen guests before confirming a reservation.

The implementation must collect enough information to evaluate a request while avoiding unsafe storage of government ID images or payment-card information.

> **Required guest-facing notice**
>
> This is a booking request only. Your reservation is not confirmed until identity verification, the rental agreement, payment and the security deposit authorization are completed.

The owner has confirmed that the property already has a short-term-rental licence and insurance. Before launch, confirm that the policy explicitly covers direct website bookings, guest-caused damage, liability, and the planned security-deposit process.

---

## Current repository behaviour

The current application:

- Uses `app/BookingPanel.tsx` for date selection and the booking request dialog.
- Collects selected dates, total guest count, email, and an optional message.
- Sends the request to `app/api/booking-request/route.ts`.
- Re-checks Airbnb availability before accepting the request.
- Sends the request to the support Gmail account and copies the guest.
- Does not currently create an authoritative reservation record.
- Does not collect or store identity documents.
- Does not confirm a reservation or take payment.

Keep this request-to-book model. Do not expose instant booking until reservation persistence, agreement signing, payment webhooks, cancellation handling, and security-deposit authorization are complete.

---

# 1. Recommended guest flow

```text
Guest selects dates
        ↓
Guest opens booking request form
        ↓
Guest provides renter and stay information
        ↓
Guest accepts pre-booking acknowledgements
        ↓
Server validates and stores booking request
        ↓
Host reviews request
        ↓
Host approves request for identity verification
        ↓
Server creates Stripe Identity verification session
        ↓
Guest completes hosted ID + selfie verification
        ↓
Stripe webhook updates verification status
        ↓
Host performs final review
        ↓
Rental agreement is generated and signed
        ↓
Rental payment is completed
        ↓
Security-deposit authorization succeeds near check-in
        ↓
Reservation becomes confirmed and access details are released
```

## Non-negotiable access rule

```text
No approved request
+ no passed identity verification
+ no signed rental agreement
+ no successful payment
+ no security authorization
= no exact address, arrival instructions, or door code
```

---

# 2. Fields to collect in the booking request

Expand the current request form to collect the following.

## Primary renter

- Full legal name
- Email address
- Mobile number
- Home address:
  - Address line 1
  - Address line 2, optional
  - City
  - Province/state
  - Postal/ZIP code
  - Country
- Confirmation that the renter meets the minimum booking age
- Confirmation that the person making the booking will personally stay at the property

## Occupancy

- Number of adults
- Number of children
- Names of all adult guests
- Total guests derived from adults plus children

Do not rely on a separate manually entered total if it can be calculated from the adult and child counts.

## Stay details

- Reason for the stay
- Number of vehicles
- Whether pets will attend
- Pet count and description when applicable
- Optional accessibility needs or additional notes

## Required acknowledgements

Require unchecked-by-default checkboxes confirming that:

1. The information provided is complete and accurate.
2. The primary renter will personally stay at the property.
3. Only registered guests may attend unless the host gives written approval.
4. Government-issued ID and selfie verification may be required through a secure third-party provider.
5. A signed rental agreement will be required.
6. Rental payment will be required before confirmation.
7. A security-deposit authorization will be required before check-in.
8. Submitting the form creates a request only and does not confirm a reservation.
9. The guest has read the Booking Conditions and Privacy Notice.

Store the accepted policy versions and the server-generated acceptance timestamp.

---

# 3. Date-of-birth recommendation

Prefer collecting an age confirmation at the initial request stage:

```text
I confirm that I am at least [MINIMUM_BOOKING_AGE] years old.
```

Do not collect the full date of birth in the public booking request unless it is necessary for a clearly documented business or legal purpose.

The professional identity-verification provider can verify identity and age later. This reduces the amount of sensitive information stored by the cottage application.

Suggested environment variable:

```bash
MINIMUM_BOOKING_AGE=25
```

The actual minimum age must be approved by the owner and reviewed for compliance with applicable human-rights and consumer-protection requirements. Avoid arbitrary or discriminatory screening.

---

# 4. Guest-facing language

Place the following notice prominently at the beginning of the request dialog and immediately above the submit button:

> **This is a booking request only.** Your reservation is not confirmed until identity verification, the rental agreement, payment and the security deposit authorization are completed. No payment is taken when this request is submitted.

Add this privacy notice near the identity-verification acknowledgement:

> Do not email identification documents to us. If your request is approved, you will receive a secure identity-verification link from our verification provider. Identification images must be submitted only through that secure process.

Change the submit button label from:

```text
Send stay request
```

to:

```text
Submit booking request
```

After a successful submission, show:

> Your booking request has been received. This is not yet a confirmed reservation. We will review the request and contact you about identity verification and the next steps.

---

# 5. Front-end implementation

## File

```text
app/BookingPanel.tsx
```

The request form is currently inside `BookingPanel.tsx`. For maintainability, extract it into a dedicated component.

Recommended structure:

```text
app/
  BookingPanel.tsx
  booking/
    BookingRequestDialog.tsx
    BookingRequestFields.tsx
    booking-request-schema.ts
    booking-request-types.ts
```

## Suggested client type

```ts
export type BookingRequestFormValues = {
  legalName: string;
  email: string;
  mobilePhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  adults: number;
  children: number;
  adultGuestNames: string[];
  stayReason: string;
  vehicleCount: number;
  petsAttending: boolean;
  petDetails: string;
  additionalNotes: string;
  minimumAgeConfirmed: boolean;
  primaryRenterStaying: boolean;
  idRequirementAccepted: boolean;
  agreementRequirementAccepted: boolean;
  paymentRequirementAccepted: boolean;
  securityDepositRequirementAccepted: boolean;
  registeredGuestsOnlyAccepted: boolean;
  requestOnlyAccepted: boolean;
  bookingConditionsAccepted: boolean;
  privacyNoticeAccepted: boolean;
  bookingConditionsVersion: string;
  privacyNoticeVersion: string;
};
```

## Form design

Use a multi-section form rather than one very long undifferentiated column:

1. **Your details**
2. **Home address**
3. **Who is staying**
4. **About the stay**
5. **Requirements and acknowledgement**

A single dialog with collapsible sections is acceptable, but do not hide required legal acknowledgements behind preselected controls.

## Adult guest names

Render one required name input for each adult after the primary renter.

Example:

```ts
const additionalAdultCount = Math.max(0, adults - 1);
```

If the primary renter is included in `adults`, label the generated fields:

```text
Additional adult guest 1
Additional adult guest 2
...
```

Normalize names on the server. Client validation is only for usability.

## Accessibility

- Give every input a visible label.
- Associate validation errors with fields using `aria-describedby`.
- Move focus to the first invalid field after submission.
- Do not use colour alone to indicate errors.
- Keep the Escape-to-close behaviour, except while submission is in progress.
- Ensure the dialog remains usable at 200% zoom and on small screens.

---

# 6. API payload

## File

```text
app/api/booking-request/route.ts
```

Replace the current minimal payload type with a structured payload.

```ts
type BookingRequestPayload = {
  arrival?: unknown;
  departure?: unknown;

  legalName?: unknown;
  email?: unknown;
  mobilePhone?: unknown;

  address?: {
    line1?: unknown;
    line2?: unknown;
    city?: unknown;
    province?: unknown;
    postalCode?: unknown;
    country?: unknown;
  };

  adults?: unknown;
  children?: unknown;
  adultGuestNames?: unknown;

  stayReason?: unknown;
  vehicleCount?: unknown;
  petsAttending?: unknown;
  petDetails?: unknown;
  additionalNotes?: unknown;

  minimumAgeConfirmed?: unknown;
  primaryRenterStaying?: unknown;
  idRequirementAccepted?: unknown;
  agreementRequirementAccepted?: unknown;
  paymentRequirementAccepted?: unknown;
  securityDepositRequirementAccepted?: unknown;
  registeredGuestsOnlyAccepted?: unknown;
  requestOnlyAccepted?: unknown;
  bookingConditionsAccepted?: unknown;
  privacyNoticeAccepted?: unknown;
  bookingConditionsVersion?: unknown;
  privacyNoticeVersion?: unknown;

  website?: unknown;
};
```

## Server-side validation rules

At minimum:

- `legalName`: required, 2–120 characters
- `email`: valid email, maximum 254 characters
- `mobilePhone`: required, normalize to E.164 where possible
- Address fields: required except line 2
- `adults`: integer, at least 1
- `children`: integer, at least 0
- `adults + children`: must not exceed licensed occupancy
- `adultGuestNames`: array with the expected number of additional adult names
- `stayReason`: required, 10–500 characters
- `vehicleCount`: integer within the licensed/property limit
- `petsAttending`: boolean
- `petDetails`: required when pets are attending
- `additionalNotes`: optional, maximum 1,200 characters
- Every required acknowledgement: exactly `true`
- Policy versions: must match the server's active versions
- Arrival and departure: keep the current date and availability validation

Suggested constants:

```ts
const MAX_OCCUPANCY = 10;
const MAX_VEHICLES = 5; // Replace with the licensed/approved limit.
const BOOKING_CONDITIONS_VERSION = "2026-07-01";
const PRIVACY_NOTICE_VERSION = "2026-07-01";
```

Do not trust occupancy, policy versions, totals, timestamps, or pricing calculated by the browser.

## Request size

The current API rejects requests larger than 16 KB. The expanded JSON payload should normally fit, but consider increasing the limit modestly to 32 KB after testing.

Do not allow file uploads on this endpoint.

---

# 7. Persist booking requests

Email should be a notification, not the authoritative booking record.

The repository already contains optional Drizzle/D1 scaffolding. Use it or another transactional database before adding identity verification.

## Suggested table

```ts
export const bookingRequests = sqliteTable("booking_requests", {
  id: text("id").primaryKey(),
  status: text("status").notNull(),

  arrival: text("arrival").notNull(),
  departure: text("departure").notNull(),

  legalName: text("legal_name").notNull(),
  email: text("email").notNull(),
  mobilePhone: text("mobile_phone").notNull(),

  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),

  adults: integer("adults").notNull(),
  children: integer("children").notNull(),
  adultGuestNamesJson: text("adult_guest_names_json").notNull(),

  stayReason: text("stay_reason").notNull(),
  vehicleCount: integer("vehicle_count").notNull(),
  petsAttending: integer("pets_attending", { mode: "boolean" }).notNull(),
  petDetails: text("pet_details"),
  additionalNotes: text("additional_notes"),

  minimumAgeConfirmed: integer("minimum_age_confirmed", { mode: "boolean" }).notNull(),
  primaryRenterStaying: integer("primary_renter_staying", { mode: "boolean" }).notNull(),
  bookingConditionsVersion: text("booking_conditions_version").notNull(),
  privacyNoticeVersion: text("privacy_notice_version").notNull(),
  acknowledgementsAcceptedAt: text("acknowledgements_accepted_at").notNull(),

  identityStatus: text("identity_status").notNull().default("not_started"),
  identityProvider: text("identity_provider"),
  identitySessionId: text("identity_session_id"),
  identityVerifiedAt: text("identity_verified_at"),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
```

## Status values

```text
submitted
under_review
more_information_required
approved_for_identity
identity_pending
identity_verified
identity_failed
approved
rejected
expired
converted_to_reservation
```

Use opaque UUIDs for internal records. Do not expose sequential database IDs.

## Retention

Define and publish a retention schedule. For example:

- Rejected or abandoned requests: delete or anonymize after a defined short period.
- Completed reservations: retain only what is needed for accounting, insurance, disputes, and legal obligations.
- Identity document images: do not store in this application.
- Provider verification session reference: retain only for the approved period.

Obtain legal/privacy advice before finalizing retention periods.

---

# 8. Notification email changes

Continue sending the support email, but include a booking request ID and enough information for review.

Do not include unnecessary sensitive details in email. In particular, do not include a full date of birth, identification number, ID image, or payment information.

Suggested email body:

```text
New Lakefront Serenity booking request

Request ID: [REQUEST ID]
Status: Submitted — host review required

Dates: [ARRIVAL] to [DEPARTURE]
Adults: [COUNT]
Children: [COUNT]
Primary renter: [LEGAL NAME]
Email: [EMAIL]
Mobile: [PHONE]
City/province/country: [LOCATION]
Additional adult guests: [NAMES]
Vehicles: [COUNT]
Pets: [NO / DETAILS]
Reason for stay: [REASON]
Additional notes: [NOTES]

Required acknowledgements accepted: Yes
Booking Conditions version: [VERSION]
Privacy Notice version: [VERSION]
Accepted at: [SERVER TIMESTAMP]

This is a request only. No reservation has been confirmed and no payment has been taken.
```

Consider omitting the street address from email and linking the host to a secured admin page instead.

---

# 9. Professional identity-verification provider

## Recommended provider: Stripe Identity

Stripe Identity is the best first option for this project because:

- The repository already contains a future Stripe payment integration.
- It provides a Stripe-hosted verification flow.
- It supports government ID document and selfie verification.
- The ID is submitted directly to Stripe instead of through Gmail or the cottage NAS.
- It provides webhook events and verification-session statuses.
- It supports data minimization and provider-side deletion/redaction controls.
- Canadian Stripe pricing currently lists ID document and selfie verification at approximately **CA$2.00 per completed verification**; confirm the live price in the Stripe Dashboard before launch.

Official starting points:

- Stripe Dashboard → **More → Identity**
- Stripe Identity documentation → Verification Sessions
- Stripe Identity documentation → Webhooks
- Stripe Identity documentation → Accessing verification results
- Stripe Identity documentation → Data privacy and deletion

## Alternatives

### Persona

Consider Persona when you need more configurable workflows, phone verification, proof-of-address documents, or database checks. Persona supports government ID, selfie, phone, document, and database verification types. Its Canadian database-verification product may require name, birthdate, address, and SIN depending on configuration and plan; do not request a SIN for ordinary cottage screening without specific legal advice and a documented necessity.

### Veriff

Consider Veriff when you prefer a dedicated identity platform with document and selfie verification and are comfortable with a separate vendor relationship and pricing review.

## Provider selection rule

For this project, begin with:

```text
Stripe Identity: government ID + selfie
```

Do not begin with a Canadian database lookup requiring SIN. Government ID and selfie verification is more appropriate for confirming that the renter is the person named in the booking request without unnecessarily collecting a social-insurance number.

---

# 10. Stripe Identity integration

## Environment variables

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_IDENTITY_ENABLED=true
APP_BASE_URL=https://your-domain.example
```

Never expose the secret key in a client-prefixed environment variable.

## Install Stripe

```bash
npm install stripe
```

## Create verification session endpoint

Recommended route:

```text
app/api/identity/create-session/route.ts
```

Only the host/admin approval flow should be allowed to create a verification session. Do not let an anonymous browser create unlimited paid sessions.

Illustrative server code:

```ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  // 1. Authenticate the host/admin action or validate a one-time guest token.
  // 2. Load the booking request from the database.
  // 3. Require status === "approved_for_identity".
  // 4. Reuse an existing active session when appropriate.

  const bookingRequest = await loadApprovedBookingRequest(request);

  const session = await stripe.identity.verificationSessions.create({
    type: "document",
    metadata: {
      bookingRequestId: bookingRequest.id,
    },
    options: {
      document: {
        require_matching_selfie: true,
      },
    },
    return_url: `${process.env.APP_BASE_URL}/booking/identity/return?request=${encodeURIComponent(bookingRequest.publicToken)}`,
  });

  await saveIdentitySession({
    bookingRequestId: bookingRequest.id,
    provider: "stripe_identity",
    sessionId: session.id,
    status: session.status,
  });

  return Response.json({ url: session.url });
}
```

Confirm current Stripe API fields against the installed Stripe SDK before implementation.

## Guest verification page

Recommended route:

```text
app/booking/verify/[token]/page.tsx
```

The page should:

- Use a cryptographically random, expiring, single-purpose token.
- Display the renter name, requested dates, and verification explanation.
- Link to the Stripe-hosted verification session.
- Tell the guest not to email ID documents.
- Explain how identity information is handled and link to the Privacy Notice.
- Avoid displaying the exact cottage address.

## Webhook endpoint

Recommended route:

```text
app/api/stripe/webhook/route.ts
```

Handle relevant Identity events, including the current Stripe equivalents of:

```text
identity.verification_session.verified
identity.verification_session.requires_input
identity.verification_session.canceled
```

Webhook requirements:

- Read the raw request body.
- Verify the Stripe signature using `STRIPE_WEBHOOK_SECRET`.
- Make processing idempotent by storing processed event IDs.
- Match the session to the booking request using trusted server-side records.
- Update only the verification status needed by the application.
- Do not download or copy ID images into the cottage database or NAS.

Illustrative handler logic:

```ts
switch (event.type) {
  case "identity.verification_session.verified":
    await markIdentityVerified({
      sessionId: event.data.object.id,
      verifiedAt: new Date().toISOString(),
    });
    break;

  case "identity.verification_session.requires_input":
    await markIdentityRequiresInput(event.data.object.id);
    break;
}
```

## Verification result review

A passed automated verification should not automatically confirm the reservation.

After verification:

1. Confirm that the verified legal name reasonably matches the booking request.
2. Review any provider warnings in the Stripe Dashboard.
3. Confirm that the primary renter will be staying.
4. Approve or reject the request manually.
5. Record the decision and reason in the audit log.

Do not expose sensitive provider result fields to the public client.

---

# 11. Security and privacy requirements

## Never collect through the booking form

- Government ID image
- Passport image
- Driver’s licence image
- Health card image
- Social Insurance Number
- Full payment-card number
- CVV
- Door code

## Never send by ordinary booking email

- ID image or ID number
- Full date of birth unless strictly required
- Payment credentials
- Stripe secret or client secret
- Exact property access details

## Application controls

- Encrypt data in transit using HTTPS.
- Restrict database access to server-side code.
- Use separate production and test Stripe keys.
- Add CSRF protections where relevant.
- Keep the honeypot and improve rate limiting using durable storage; the existing in-memory map will reset when an edge instance restarts and is not shared across instances.
- Add bot protection such as Cloudflare Turnstile before enabling public identity-session creation.
- Log administrative decisions without logging sensitive field values unnecessarily.
- Redact phone, address, and email values from application-error logs.
- Add an admin-only view instead of managing sensitive requests entirely through Gmail.
- Use one-time, expiring tokens for guest status and verification links.
- Do not put personal data in URL query strings.

---

# 12. Host review dashboard

Before identity verification is enabled, add an authenticated admin page.

Recommended route:

```text
app/admin/booking-requests/page.tsx
```

Minimum actions:

- View request summary
- View full request details
- Approve for identity verification
- Request clarification
- Reject request
- Resend verification link
- View verification status
- Record internal notes
- Convert verified request into a reservation

Do not place approval controls in links that perform a state-changing GET request. Use authenticated POST actions with CSRF protection.

Suggested audit events:

```text
booking_request.submitted
booking_request.review_started
booking_request.more_information_requested
booking_request.approved_for_identity
identity.session_created
identity.verified
identity.requires_input
booking_request.approved
booking_request.rejected
booking_request.converted_to_reservation
```

---

# 13. Static TrueNAS mirror

The repository maintains both the React application and a static nginx mirror.

The static mirror must not implement a weaker duplicate booking form.

Choose one of these approaches:

## Preferred

Have the static site's booking button open the canonical React application booking route on the public domain.

## Acceptable

Update the static form to submit the same payload to the same secured booking API and display the same disclosures.

Do not store request data in static JSON files on the NAS.

Identity verification must always redirect to the professional provider's hosted flow or an approved provider SDK. It must not upload ID documents to nginx, Gmail, local storage, or a NAS folder.

---

# 14. Testing checklist

## Front end

- Required fields block submission when empty.
- Adult guest-name fields match the adult count.
- Guest total cannot exceed licensed occupancy.
- Pet details become required when pets are selected.
- Every acknowledgement starts unchecked.
- Submit button remains disabled or validation fails until acknowledgements are accepted.
- Mobile layout is usable without horizontal scrolling.
- Keyboard and screen-reader navigation works.

## API

- Reject missing legal name.
- Reject invalid email and phone values.
- Reject incomplete address.
- Reject negative children count.
- Reject zero adults.
- Reject occupancy above the licensed maximum.
- Reject mismatched adult guest names.
- Reject absent acknowledgements.
- Reject stale or modified policy versions.
- Reject oversized payloads.
- Reject unavailable dates after the live Airbnb re-check.
- Rate-limit abusive submissions.
- Persist the request before reporting success.
- Send email only after successful persistence.

## Identity

- Anonymous users cannot create paid verification sessions repeatedly.
- An unapproved request cannot start verification.
- Session IDs are stored server-side.
- Webhook signatures are verified.
- Duplicate webhook delivery does not duplicate state changes.
- A successful return-page redirect alone does not mark verification as passed.
- Only the verified webhook/provider result updates status.
- No government ID image is stored in the application or NAS.
- Failed and retry-required states give the guest a safe next step.

## Privacy

- Personal information does not appear in analytics URLs.
- Sensitive values are absent from server logs.
- Rejected requests follow the retention/deletion policy.
- Privacy Notice identifies the identity provider and purpose.
- Guests can contact the host about access/correction requests where applicable.

---

# 15. Implementation phases

## Phase 1 — Expanded request form

- Add the renter, address, occupancy, vehicle, pet, and stay-purpose fields.
- Add all required acknowledgements.
- Add the request-only notice.
- Add server validation.
- Update support and guest confirmation emails.
- Add tests.

## Phase 2 — Persistent booking requests

- Add the database table and migrations.
- Save requests before sending email.
- Add secure request IDs.
- Add an authenticated host review page.
- Add audit events.

## Phase 3 — Identity verification

- Activate Stripe Identity.
- Add server-side session creation.
- Add expiring guest verification links.
- Add and verify Stripe webhooks.
- Store only session references and application-level statuses.
- Update the Privacy Notice.

## Phase 4 — Agreement and payment

- Generate a reservation-specific rental agreement.
- Add professional electronic signing or a legally reviewed click-sign flow.
- Enable Stripe payment only after signing.
- Confirm payment through webhooks.

## Phase 5 — Security-deposit authorization

- Save the approved payment method with proper consent.
- Place a separate manual-capture authorization near check-in.
- Do not release access instructions unless the authorization succeeds.
- Add post-checkout inspection and documented claim handling.

---

# 16. Definition of done for this request-stage change

The first implementation is complete only when:

- The booking form collects every required field listed in this document.
- The guest sees the request-only notice before submitting.
- All acknowledgements are explicit and unchecked by default.
- The server independently validates every field and acknowledgement.
- The request is stored in a database with a server timestamp and policy versions.
- The host receives a notification containing the request ID.
- The guest receives a confirmation that no reservation has been confirmed.
- No ID image, payment-card data, or door code is collected or stored.
- The host can approve a request for a later identity-verification step.
- The React application and static TrueNAS experience do not contradict each other.

---

# 17. Decisions to finalize before coding

Record these values in configuration or owner-approved documentation:

```text
Minimum renter age: [TO CONFIRM]
Licensed maximum occupancy: [TO CONFIRM AGAINST LICENCE]
Maximum vehicles: [TO CONFIRM AGAINST PROPERTY/LICENCE]
Pet policy: [TO CONFIRM]
Identity provider: Stripe Identity recommended
Identity method: Government ID + matching selfie
Booking Conditions version: [SET BEFORE LAUNCH]
Privacy Notice version: [SET BEFORE LAUNCH]
Rejected-request retention period: [LEGAL/PRIVACY REVIEW]
Abandoned-verification retention period: [LEGAL/PRIVACY REVIEW]
```

The property licence and insurance are already in place, but copies and renewal dates should be tracked operationally outside the public repository. Do not commit policy documents containing private account numbers or sensitive property information.
