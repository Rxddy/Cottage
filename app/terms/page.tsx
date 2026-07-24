import Link from "next/link";

export const metadata = {
  title: "Terms and house rules | Lakefront Serenity",
  description: "Website terms and booking guidance for Lakefront Serenity.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <header className="legal-header">
        <Link className="brand" href="/" aria-label="Lakefront Serenity home"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span className="brand-copy"><strong>Lakefront Serenity</strong><small>Waterfront · Kawartha Lakes</small></span></Link>
        <Link className="legal-back" href="/">Back to the cottage</Link>
      </header>
      <article className="legal-content">
        <p className="eyebrow">Site information</p>
        <h1>Terms.</h1>
        <p className="legal-lede">These basic terms explain how to use this informational website. Last updated July 23, 2026.</p>

        <h2>Website purpose</h2>
        <p>Lakefront Serenity presents a waterfront vacation home, its listed features and nearby destinations. Website content is provided for general planning and may change with seasons, maintenance, weather or listing updates.</p>

        <h2>Bookings</h2>
        <p>This website does not currently accept a reservation or payment. The availability calendar is read-only and is intended as a convenience. Guests should confirm dates, price, taxes, cancellation terms and final booking details with the host before travelling.</p>

        <h2>Address and arrival details</h2>
        <p>The exact street address and access instructions are intentionally withheld from this public website. The host should provide them only in a private confirmation message after accepting the reservation and completing any required payment, agreement and guest-information steps.</p>

        <h2>Owner launch checklist</h2>
        <p>Before accepting a direct reservation, the host should confirm the applicable municipal short-term-rental licence, insurance, tax registration and collection obligations, a written rental agreement, cancellation terms, any deposit or damage authorization, and the final arrival instructions. None of those details are implied by this informational website.</p>

        <h2>House rules and safety</h2>
        <ul>
          <li>Check-in is available at any time. Checkout is before 10:00 a.m.</li>
          <li>Entry is by self check-in with a keypad. The private code is provided after payment is received.</li>
          <li>A maximum of 10 guests is permitted.</li>
          <li>No pets, parties, events or smoking.</li>
          <li>Quiet hours are 11:00 p.m.–5:00 a.m.</li>
          <li>Commercial photography is allowed.</li>
          <li>Do not move indoor furniture outside. Please bring your own firewood if needed.</li>
          <li>Before leaving, throw trash away, turn things off and lock up.</li>
          <li>Exterior security cameras are disclosed on the listing and record continuously around the entrances, back deck, sides, lake area and driveway.</li>
          <li>A Renter&apos;s Code of Conduct form is required where applicable.</li>
          <li>Guests should follow the host&apos;s current instructions and local laws.</li>
        </ul>

        <h2>Nearby activities</h2>
        <p>Nearby parks, trails, waterways and businesses are independent third parties. Check current hours, fees, closures, weather and safety conditions directly with each operator. Lakefront Serenity does not promise availability or provide those outside services.</p>

        <h2>Questions</h2>
        <p>Contact the host at <a href="mailto:lakefrontserenitysupport@gmail.com?subject=Lakefront%20Serenity%20booking%20question">lakefrontserenitysupport@gmail.com</a>. The final accommodation agreement and reservation terms must be confirmed with the host.</p>
        <p className="legal-note">This is a basic website summary, not a substitute for a signed rental agreement, municipal requirements or professional legal advice.</p>
      </article>
    </main>
  );
}
