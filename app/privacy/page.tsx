import Link from "next/link";

export const metadata = {
  title: "Privacy | Lakefront Serenity",
  description: "Privacy information for the Lakefront Serenity cottage website.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <header className="legal-header">
        <Link className="brand" href="/" aria-label="Lakefront Serenity home"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span className="brand-copy"><strong>Lakefront Serenity</strong><small>Waterfront · Kawartha Lakes</small></span></Link>
        <Link className="legal-back" href="/">Back to the cottage</Link>
      </header>
      <article className="legal-content">
        <p className="eyebrow">Site information</p>
        <h1>Privacy.</h1>
        <p className="legal-lede">This plain-language notice explains what the Lakefront Serenity website does and does not collect. Last updated July 23, 2026.</p>

        <h2>What we collect</h2>
        <p>The site does not currently run an account system, contact form, advertising tracker or analytics profile. If you email the host, your email provider handles that message and the host team receives the information you choose to include.</p>

        <h2>Availability and booking</h2>
        <p>The availability display reads blocked nights from a private calendar feed. It is kept server-side and is not intentionally shown in the page. This website does not currently process reservations or payments. The exact arrival address is intentionally not published; it should be shared only in a private confirmation message after the host accepts a reservation.</p>

        <h2>Images and nearby links</h2>
        <p>Property photos are supplied for this cottage website. Nearby destination photos are credited with their reuse licences in the gallery. Links to parks and other destinations take you to third-party websites with their own policies.</p>

        <h2>Security and hosting</h2>
        <p>The public site and the NAS mirror may generate ordinary technical logs such as request time, browser type and error information. We do not use those logs to build a marketing profile. Private calendar credentials are stored outside the public source files.</p>

        <h2>Questions</h2>
        <p>For privacy questions, email <a href="mailto:lakefrontserenitysupport@gmail.com?subject=Lakefront%20Serenity%20privacy%20question">lakefrontserenitysupport@gmail.com</a>.</p>
        <p className="legal-note">This is a basic website notice, not legal advice. Update it with the owner&apos;s legal name, business address and any analytics, email-service or booking tools added later.</p>
      </article>
    </main>
  );
}
