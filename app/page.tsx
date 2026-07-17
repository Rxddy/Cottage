import { BookingPanel } from "./BookingPanel";
import { Amenities, Gallery, Reviews, ScrollAnimations } from "./PropertyExperience";

const nearby = [
  {
    number: "01",
    title: "Kirkfield Lift Lock",
    text: "See one of the Trent-Severn Waterway's remarkable hydraulic lift locks and explore the surrounding heritage landscape.",
    href: "https://parks.canada.ca/lhn-nhs/on/trentsevern/visit/posteeclusage-lockstation/ecluse-lock-36-kirkfield",
  },
  {
    number: "02",
    title: "Balsam Lake Provincial Park",
    text: "A seasonal destination for day use, sandy beach time, hiking, paddling, boating, birding and fishing.",
    href: "https://www.ontarioparks.ca/park/balsamlake/activities",
  },
  {
    number: "03",
    title: "Trent-Severn Waterway",
    text: "Discover interconnected lakes, lock stations and classic Ontario boating country throughout the region.",
    href: "https://parks.canada.ca/lhn-nhs/on/trentsevern",
  },
];

export default function Home() {
  return (
    <main>
      <ScrollAnimations />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="LakeFront House home">
          <span>Canal Lake</span>
          <strong>LakeFront House</strong>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#house">The house</a>
          <a href="#reviews">Reviews</a>
          <a href="#amenities">Amenities</a>
          <a href="#gallery">Gallery</a>
          <a href="#explore">Explore</a>
          <a className="nav-book" href="#book">Book direct</a>
        </nav>
        <details className="mobile-nav">
          <summary>Menu</summary>
          <nav aria-label="Mobile navigation">
            <a href="#house">The house</a>
            <a href="#reviews">Reviews</a>
            <a href="#amenities">Amenities</a>
            <a href="#gallery">Gallery</a>
            <a href="#explore">Explore</a>
            <a href="#book">Book direct</a>
          </nav>
        </details>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow light">Kawartha Lakes, Ontario</p>
          <h1 id="hero-title">
            Make the lake
            <em>your backyard.</em>
          </h1>
          <p className="hero-copy">
            A generous waterfront house on Canal Lake, created for slow
            mornings, shared dinners and evenings gathered around the fire.
          </p>
          <div className="hero-facts" aria-label="Property overview">
            <div><strong>10</strong><span>guests</span></div>
            <div><strong>5</strong><span>bedrooms</span></div>
            <div><strong>6</strong><span>beds</span></div>
            <div><strong>3</strong><span>baths</span></div>
          </div>
        </div>
        <div className="rating-card" aria-label="Rated 4.96 out of 5 from 28 Airbnb reviews">
          <span>Guest favourite</span>
          <strong>4.96</strong>
          <small>28 Airbnb reviews</small>
        </div>
        <BookingPanel variant="hero" />
      </section>

      <section className="intro section reveal" id="house">
        <div className="section-label"><span>01</span> The house</div>
        <div className="intro-copy">
          <p className="eyebrow">Come together by the water</p>
          <h2>Space for the whole group. A view you will remember.</h2>
          <p>
            Set directly on Canal Lake, the home pairs five bedrooms and three
            bathrooms with open spaces made for cooking, talking and playing.
            Outside, the lawn runs toward the dock, fire pit and water.
          </p>
          <a className="text-link" href="#gallery">See the property <span>→</span></a>
        </div>
        <figure className="intro-image tall">
          <img src="/cottage/backyard.webp" alt="Canal Lake, dock, fire pit and red chairs from the backyard" />
        </figure>
        <figure className="intro-image inset">
          <img src="/cottage/dining.jpg" alt="Dining area inside the lakefront house" />
        </figure>
      </section>

      <Reviews />
      <Amenities />
      <Gallery />

      <section className="explore section reveal" id="explore">
        <div className="section-label"><span>05</span> Explore nearby</div>
        <div className="explore-heading">
          <p className="eyebrow">Beyond the property</p>
          <h2>A quiet base for discovering Kawartha Lakes.</h2>
          <p>
            These independently operated attractions are suggestions for your
            itinerary. They are not amenities or services provided by the house.
          </p>
        </div>
        <div className="nearby-list">
          {nearby.map((place) => (
            <a key={place.title} href={place.href} target="_blank" rel="noreferrer">
              <span>{place.number}</span>
              <div><h3>{place.title}</h3><p>{place.text}</p></div>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </div>
        <p className="distance-note">
          Exact travel times will be added after the property address is confirmed.
          Check attraction hours, admission and seasonal availability directly.
        </p>
      </section>

      <section className="know section reveal" id="details">
        <div className="section-label"><span>06</span> Good to know</div>
        <div className="know-image"><img src="/cottage/entrance.jpg" alt="Front entrance with keypad self check-in" /></div>
        <div className="know-copy">
          <p className="eyebrow">A smooth arrival</p>
          <h2>Clear details before you travel.</h2>
          <dl>
            <div><dt>Check-in</dt><dd>3:00 p.m.–12:00 a.m.</dd></div>
            <div><dt>Checkout</dt><dd>Before 10:00 a.m.</dd></div>
            <div><dt>Entry</dt><dd>Self check-in with keypad</dd></div>
            <div><dt>Quiet hours</dt><dd>11:00 p.m.–7:00 a.m.</dd></div>
            <div><dt>House rules</dt><dd>No pets, parties, smoking or events</dd></div>
          </dl>
          <p className="fine-print">
            A Renter&apos;s Code of Conduct form is required. Exterior security
            cameras are disclosed on the property. Indoor taps use city water;
            the outdoor hose uses lake water.
          </p>
        </div>
      </section>

      <section className="booking-section reveal" id="book">
        <div className="booking-copy">
          <p className="eyebrow light">Book direct</p>
          <h2>Keep more of your getaway for the getaway.</h2>
          <p>
            Direct reservations avoid Airbnb platform fees. Applicable taxes
            and required charges remain and will be shown clearly before payment.
          </p>
        </div>
        <BookingPanel variant="footer" />
        <div className="payment-methods" aria-label="Secure payment options">
          <span>Secure checkout</span><b>Visa</b><b>Mastercard</b><b>Apple Pay</b><b>Google Pay</b>
        </div>
        <p className="booking-disclosure">
          Live Airbnb availability, final pricing and card checkout will activate after the
          channel manager and secure payment account are connected. Until then, <a href="https://www.airbnb.ca/rooms/940636318506657847" target="_blank" rel="noreferrer">book and pay securely on Airbnb</a>.
        </p>
      </section>

      <footer>
        <div className="brand footer-brand"><span>Canal Lake</span><strong>LakeFront House</strong></div>
        <p>Waterfront accommodation in Kawartha Lakes, Ontario.</p>
        <div><a href="#details">House rules</a><a href="#book">Booking information</a><a href="#top">Back to top ↑</a></div>
      </footer>
    </main>
  );
}
