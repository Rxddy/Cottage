"use client";

import { formatMoney, type BookingPriceBreakdown } from "../booking-utils";

export function BookingPriceReceipt({ breakdown, compact = false }: { breakdown: BookingPriceBreakdown; compact?: boolean }) {
  const taxPercent = breakdown.taxRateBasisPoints / 100;

  if (compact && !breakdown.nights.length) {
    return (
      <section className="price-receipt price-receipt-compact price-receipt-empty-state" aria-labelledby="price-details-title">
        <div>
          <h3 id="price-details-title">Estimate</h3>
          <p>Pick a check-in and check-out date to see the rental total.</p>
        </div>
        <strong>Rate to be confirmed</strong>
      </section>
    );
  }

  return (
    <section className={`price-receipt${compact ? " price-receipt-compact" : ""}`} aria-labelledby="price-details-title">
      <div className="price-receipt-heading"><h3 id="price-details-title">Price details</h3><span>{breakdown.nights.length} {breakdown.nights.length === 1 ? "night" : "nights"}</span></div>
      {breakdown.nights.length ? <div className="price-receipt-lines">
        {breakdown.nights.map((line) => <div className="price-receipt-line" key={line.id}><div><strong>{line.label}</strong><small>{line.description}</small></div><span>{formatMoney(line.amountCents, breakdown.currency)}</span></div>)}
        {breakdown.fees.map((line) => <div className="price-receipt-line" key={line.id}><span>{line.label}</span><span>{formatMoney(line.amountCents, breakdown.currency)}</span></div>)}
      </div> : <p className="price-receipt-empty">Choose check-in and check-out dates to see the itemized estimate.</p>}
      <div className="price-receipt-subtotal"><span>Accommodation subtotal</span><strong>{formatMoney(breakdown.accommodationSubtotalCents, breakdown.currency)}</strong></div>
      {taxPercent > 0 ? <div className="price-receipt-line"><span>HST ({taxPercent.toFixed(2).replace(/\.00$/, "")}%)</span><span>{formatMoney(breakdown.taxCents, breakdown.currency)}</span></div> : null}
      <div className="price-receipt-total"><span>Estimated rental total</span><strong>{breakdown.totalCents ? formatMoney(breakdown.totalCents, breakdown.currency) : "Rate to be confirmed"}</strong></div>
      {breakdown.refundableSecurityDepositCents > 0 ? <div className="security-deposit-notice"><strong>Refundable security deposit</strong><span>{formatMoney(breakdown.refundableSecurityDepositCents, breakdown.currency)}</span><p>Collected separately by Interac e-Transfer and not included in the rental total.</p></div> : null}
    </section>
  );
}
