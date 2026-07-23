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
        <p>This website does not accept a reservation or payment. The availability calendar is read-only and is intended as a convenience. Guests must confirm dates, price, taxes, cancellation terms and final booking details on the Airbnb listing before travelling.</p>

        <h2>House rules and safety</h2>
        <ul>
          <li>No pets, parties, events or smoking.</li>
          <li>Quiet hours are 11:00 p.m.–7:00 a.m.</li>
          <li>Exterior security cameras are disclosed on the listing and record continuously around the entrances, back deck, sides, lake area and driveway.</li>
          <li>A Renter&apos;s Code of Conduct form is required where applicable.</li>
          <li>Guests should follow the current Airbnb listing, host instructions and local laws.</li>
        </ul>

        <h2>Nearby activities</h2>
        <p>Nearby parks, trails, waterways and businesses are independent third parties. Check current hours, fees, closures, weather and safety conditions directly with each operator. Lakefront Serenity does not promise availability or provide those outside services.</p>

        <h2>Questions</h2>
        <p>Contact the host at <a href="mailto:karansuba6@gmail.com?cc=ruddyrusanth@gmail.com%2Ctharan.pir@gmail.com&amp;subject=Lakefront%20Serenity%20question">karansuba6@gmail.com</a>. The Airbnb listing controls the final accommodation agreement and reservation terms.</p>
        <p className="legal-note">This is a basic website summary, not a substitute for the final Airbnb agreement, rental agreement, municipal requirements or professional legal advice.</p>
      </article>
    </main>
  );
}
