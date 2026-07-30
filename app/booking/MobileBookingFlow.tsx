"use client";

import { useMemo, useState } from "react";
import { calculateBookingPriceBreakdown, dateKey, formatMoney, fromKey, type BookingPricing } from "../booking-utils";
import { BookingPriceReceipt } from "./BookingPriceReceipt";

type MobileBookingFlowProps = { pricing: BookingPricing; blockedDates: string[] };
const steps = ["Dates", "Guests", "Price", "Renter", "Guests", "Stay details", "Requirements", "Review"];
const BOOKING_CONDITIONS_VERSION = "2026-07-30";
const PRIVACY_NOTICE_VERSION = "2026-07-30";

function includesBlockedNight(arrival: string, departure: string, blocked: ReadonlySet<string>) {
  if (!arrival || !departure || departure <= arrival) return false;
  for (let day = fromKey(arrival), end = fromKey(departure); day < end; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
    if (blocked.has(dateKey(day))) return true;
  }
  return false;
}

export function MobileBookingFlow({ pricing, blockedDates }: MobileBookingFlowProps) {
  const [step, setStep] = useState(0);
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [adultGuestNames, setAdultGuestNames] = useState<string[]>(["", ""]);
  const [legalName, setLegalName] = useState("");
  const [email, setEmail] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", province: "", postalCode: "", country: "Canada" });
  const [stayReason, setStayReason] = useState("");
  const [vehicleCount, setVehicleCount] = useState(0);
  const [petsAttending, setPetsAttending] = useState(false);
  const [petDetails, setPetDetails] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [acknowledgements, setAcknowledgements] = useState({ minimumAgeConfirmed: false, primaryRenterStaying: false, registeredGuestsOnlyAccepted: false, idRequirementAccepted: false, agreementRequirementAccepted: false, paymentRequirementAccepted: false, securityDepositRequirementAccepted: false, requestOnlyAccepted: false, bookingConditionsAccepted: false, privacyNoticeAccepted: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestSaved, setRequestSaved] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy email draft");
  const blocked = useMemo(() => new Set(blockedDates), [blockedDates]);
  const guests = adults + children;
  const addressComplete = [address.line1, address.city, address.province, address.postalCode, address.country].every((value) => value.trim());
  const breakdown = useMemo(() => calculateBookingPriceBreakdown(arrival, departure, pricing), [arrival, departure, pricing]);
  const dateError = arrival && departure && departure <= arrival
    ? "Check-out must be after check-in."
    : includesBlockedNight(arrival, departure, blocked)
      ? "That range includes an unavailable night. Choose different dates."
      : arrival && blocked.has(arrival)
        ? "That check-in night is unavailable."
        : "";
  const validDates = Boolean(arrival && departure && !dateError);
  const requiredAcknowledgementsAccepted = Object.values(acknowledgements).every(Boolean);
  const emailBody = useMemo(() => `Hello Lakefront Serenity Team,\n\nI would like to submit a booking request.\n\nRequest details\nPrimary renter: ${legalName}\nEmail: ${email}\nMobile: ${mobilePhone}\nHome address: ${address.line1}, ${address.city}, ${address.province}, ${address.postalCode}, ${address.country}\nDates: ${arrival} to ${departure}\nAdults: ${adults}\nChildren: ${children}\nAdult guest names: ${adultGuestNames.filter(Boolean).join(", ") || "To be confirmed"}\nVehicles: ${vehicleCount}\nPets: ${petsAttending ? petDetails : "None"}\nReason for stay: ${stayReason}\nAdditional notes: ${additionalNotes || "None"}\n\nEstimated rental total: ${breakdown.totalCents ? formatMoney(breakdown.totalCents, breakdown.currency) : "Rate to be confirmed"}\nRefundable security deposit: ${breakdown.refundableSecurityDepositCents ? formatMoney(breakdown.refundableSecurityDepositCents, breakdown.currency) : "To be confirmed"}\n\nThis is a booking request only. No payment is taken with this request. I understand that identity verification, a signed rental agreement, Interac e-Transfer rental payment and a separate refundable deposit are required before confirmation.\n\nThank you.`, [legalName, email, mobilePhone, address, arrival, departure, adults, children, adultGuestNames, vehicleCount, petsAttending, petDetails, stayReason, additionalNotes, breakdown]);
  const mailto = `mailto:lakefrontserenitysupport@gmail.com?subject=Lakefront%20Serenity%20booking%20request&body=${encodeURIComponent(emailBody)}`;

  function updateAdults(value: number) {
    setAdults(value);
    setAdultGuestNames((current) => Array.from({ length: value }, (_, index) => current[index] ?? ""));
  }

  function next() {
    if (step === 0 && !validDates) return;
    if (step === 1 && guests > 10) return;
    if (step === 3 && (!legalName.trim() || !/^\S+@\S+\.\S+$/.test(email) || mobilePhone.trim().length < 7 || !addressComplete)) return;
    if (step === 4 && adultGuestNames.some((name) => !name.trim())) return;
    if (step === 5 && (stayReason.trim().length < 10 || (petsAttending && petDetails.trim().length < 3))) return;
    if (step === 6 && !requiredAcknowledgementsAccepted) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function submitRequest() {
    if (submitting || submitted) return;
    setSubmitting(true); setSubmitError("");
    try {
      const response = await fetch("/api/booking-requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ arrival, departure, legalName, email, mobilePhone, address, adults, children, adultGuestNames, stayReason, vehicleCount, petsAttending, petDetails, additionalNotes, ...acknowledgements, bookingConditionsVersion: BOOKING_CONDITIONS_VERSION, privacyNoticeVersion: PRIVACY_NOTICE_VERSION }) });
      const body = await response.json().catch(() => ({})) as { id?: string; error?: string };
      if (!response.ok && response.status !== 503) throw new Error(body.error || "The request could not be submitted.");
      setRequestId(body.id || ""); setRequestSaved(response.ok); setSubmitted(true);
      if (response.status === 503) setSubmitError(body.error || "The request was not saved; use the email draft below.");
    } catch (error) {
      setRequestSaved(false); setSubmitError(error instanceof Error ? error.message : "The request could not be submitted. Use the prepared email draft below.");
      setSubmitted(true);
    } finally { setSubmitting(false); }
  }

  async function copyDraft() {
    try { await navigator.clipboard.writeText(emailBody); setCopyLabel("Copied"); window.setTimeout(() => setCopyLabel("Copy email draft"), 1800); } catch { setCopyLabel("Select the draft and copy"); }
  }

  const addressField = (key: keyof typeof address, label: string, required = true) => <label className="mobile-field">{label}{!required ? <small>Optional</small> : null}<input value={address[key]} required={required} autoComplete={key === "line1" ? "street-address" : key === "postalCode" ? "postal-code" : key === "country" ? "country-name" : undefined} onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))} /></label>;
  const actionRow = (back: number, label: string, disabled = false) => <div className="mobile-flow-actions"><button type="button" onClick={() => setStep(back)}>Back</button><button className="mobile-flow-primary" type="button" disabled={disabled} onClick={next}>{label}</button></div>;

  return <section className="mobile-booking-flow" aria-label="Mobile booking request">
    <div className="mobile-booking-progress" aria-label={`Step ${step + 1} of ${steps.length}`}><span>Step {step + 1} of {steps.length}</span><strong>{steps[step]}</strong><progress value={step + 1} max={steps.length} /></div>
    {step === 0 ? <div className="mobile-booking-step"><h3>Choose your dates</h3><p>Booked nights are shaded in the full calendar. Choose a check-in and check-out date.</p><div className="mobile-date-fields"><label>Check-in<input type="date" value={arrival} onChange={(event) => setArrival(event.target.value)} /></label><label>Check-out<input type="date" value={departure} onChange={(event) => setDeparture(event.target.value)} /></label></div>{dateError ? <p className="mobile-form-error">{dateError}</p> : null}<button className="mobile-flow-primary" type="button" disabled={!validDates} onClick={next}>Continue to guests</button></div> : null}
    {step === 1 ? <div className="mobile-booking-step"><h3>Who is staying?</h3><p>Maximum occupancy is 10 guests.</p><label className="mobile-field">Adults<select value={adults} onChange={(event) => updateAdults(Number(event.target.value))}>{Array.from({ length: 10 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}</option>)}</select></label><label className="mobile-field">Children<select value={children} onChange={(event) => setChildren(Number(event.target.value))}>{Array.from({ length: 11 - adults }, (_, index) => index).map((count) => <option key={count} value={count}>{count}</option>)}</select></label><p className="mobile-inline-total">Total guests: <strong>{guests}</strong></p>{actionRow(0, "Continue to price", guests > 10)}</div> : null}
    {step === 2 ? <div className="mobile-booking-step"><BookingPriceReceipt breakdown={breakdown} /><p className="mobile-notice">The refundable security deposit is separate from the rental total and is collected only after approval.</p>{actionRow(1, "Continue to renter")}</div> : null}
    {step === 3 ? <div className="mobile-booking-step"><h3>Your details</h3><p>The primary renter must personally stay at the cottage and sign the agreement.</p><label className="mobile-field">Full legal name<input autoComplete="name" value={legalName} onChange={(event) => setLegalName(event.target.value)} /></label><label className="mobile-field">Email<input type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label className="mobile-field">Mobile phone<input type="tel" autoComplete="tel" inputMode="tel" value={mobilePhone} onChange={(event) => setMobilePhone(event.target.value)} /></label><h4>Home address</h4>{addressField("line1", "Address line 1")}{addressField("line2", "Address line 2", false)}{addressField("city", "City")}{addressField("province", "Province / state")}{addressField("postalCode", "Postal / ZIP code")}{addressField("country", "Country")}{actionRow(2, "Continue to guest names", !legalName.trim() || !/^\S+@\S+\.\S+$/.test(email) || mobilePhone.trim().length < 7 || !addressComplete)}</div> : null}
    {step === 4 ? <div className="mobile-booking-step"><h3>Adult guest names</h3><p>Include the primary renter and every adult who will stay.</p>{adultGuestNames.map((name, index) => <label className="mobile-field" key={index}>{index === 0 ? "Primary renter" : `Adult guest ${index + 1}`}<input value={name} onChange={(event) => setAdultGuestNames((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /></label>)}{actionRow(3, "Continue to stay details", adultGuestNames.some((name) => !name.trim()))}</div> : null}
    {step === 5 ? <div className="mobile-booking-step"><h3>Stay details</h3><label className="mobile-field">Reason for stay<textarea value={stayReason} onChange={(event) => setStayReason(event.target.value)} placeholder="At least a sentence helps us review your request." /></label><label className="mobile-field">Vehicles<select value={vehicleCount} onChange={(event) => setVehicleCount(Number(event.target.value))}>{Array.from({ length: 6 }, (_, count) => <option key={count} value={count}>{count}</option>)}</select></label><label className="mobile-check"><input type="checkbox" checked={petsAttending} onChange={(event) => setPetsAttending(event.target.checked)} /> Pets will attend</label>{petsAttending ? <label className="mobile-field">Pet details<textarea value={petDetails} onChange={(event) => setPetDetails(event.target.value)} placeholder="Count, type and approximate size" /></label> : null}<label className="mobile-field">Accessibility needs or additional notes<textarea value={additionalNotes} onChange={(event) => setAdditionalNotes(event.target.value)} maxLength={1200} /></label>{actionRow(4, "Continue to requirements", stayReason.trim().length < 10 || (petsAttending && petDetails.trim().length < 3))}</div> : null}
    {step === 6 ? <div className="mobile-booking-step"><h3>Requirements</h3><p className="mobile-notice"><strong>This is a booking request only.</strong> No payment is taken here. The reservation is not confirmed until approval, Persona identity verification, Adobe Acrobat Sign agreement, Interac rental payment and the separate refundable deposit are complete. Never email ID documents.</p>{([['minimumAgeConfirmed', 'I confirm I meet the minimum booking age of 25.'], ['primaryRenterStaying', 'I will personally stay at the property.'], ['registeredGuestsOnlyAccepted', 'Only registered guests may attend unless the host approves in writing.'], ['idRequirementAccepted', 'I agree to secure identity verification through Persona if approved.'], ['agreementRequirementAccepted', 'I agree to sign the rental agreement through Adobe Acrobat Sign.'], ['paymentRequirementAccepted', 'I understand rental payment is required by Interac e-Transfer before confirmation.'], ['securityDepositRequirementAccepted', 'I understand the refundable security deposit is paid separately before check-in.'], ['requestOnlyAccepted', 'I understand submitting this form does not confirm a reservation.'], ['bookingConditionsAccepted', 'I have read and accept the Booking Conditions.'], ['privacyNoticeAccepted', 'I have read and accept the Privacy Notice.']] as const).map(([key, label]) => <label className="mobile-check" key={key}><input type="checkbox" checked={acknowledgements[key]} onChange={(event) => setAcknowledgements((current) => ({ ...current, [key]: event.target.checked }))} /> <span>{label}</span></label>)}{actionRow(5, "Review request", !requiredAcknowledgementsAccepted)}</div> : null}
    {step === 7 ? <div className="mobile-booking-step"><h3>Review and submit</h3><div className="mobile-review"><p><strong>{legalName}</strong><br />{email} · {mobilePhone}<br />{guests} guests · {arrival} to {departure}</p><p>{address.line1}, {address.city}, {address.province}</p><BookingPriceReceipt breakdown compact /></div><p className="mobile-notice">What happens next: we review your request, send the agreement for signature, send a secure Persona verification link if approved, then provide Interac payment and deposit instructions. The exact address and keypad code are released only after all requirements are complete.</p><button className="mobile-flow-primary mobile-submit" type="button" disabled={submitting || submitted} onClick={submitRequest}>{submitting ? "Submitting request…" : submitted ? (requestSaved ? "Request submitted" : "Email draft ready") : "Submit booking request"} <span aria-hidden="true">→</span></button>{submitted ? <div className="booking-success" role="status"><strong>{requestSaved ? "Request received" : "Email draft ready"}{requestId ? ` · ${requestId}` : ""}</strong><p>{submitError || "We saved your request for host review."}</p><a className="mobile-flow-primary" href={mailto}>Open email app</a><details open className="booking-email-fallback"><summary>Email draft fallback</summary><textarea readOnly value={emailBody} aria-label="Prepared booking email" /><button type="button" onClick={copyDraft}>{copyLabel}</button></details></div> : null}<button className="mobile-flow-back" type="button" onClick={() => setStep(6)} disabled={submitting}>Back to requirements</button></div> : null}
  </section>;
}
