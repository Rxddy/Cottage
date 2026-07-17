import { BookingPanel } from "./BookingPanel";

const amenities = [
  ["Waterfront", "Direct Canal Lake access by path and dock"],
  ["Outdoor living", "Backyard, fire pit, dining area and gas BBQ"],
  ["On the water", "A kayak is listed with the property"],
  ["Room to gather", "Open living spaces, pool table and sound system"],
  ["Comfort", "Wi-Fi, central heating and air conditioning"],
  ["Easy arrival", "Free on-site parking and keypad self check-in"],
];

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
      <header className="site-header">
        <a className="brand" href="#top" aria-label="LakeFront House home">
          <span>Canal Lake</span>
          <strong>LakeFront House</strong>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#house">The house</a>
          <a href="#amenities">Amenities</a>
          <a href="#gallery">Gallery</a>
          <a href="#explore">Explore</a>
          <a className="nav-book" href="#book">Book direct</a>
        </nav>
        <details className="mobile-nav">
          <summary>Menu</summary>
          <nav aria-label="Mobile navigation">
            <a href="#house">The house</a>
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

      <section className="intro section" id="house">
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

      <section className="proof-band" aria-label="Guest review highlights">
        <p className="eyebrow light">What guests remember</p>
        <blockquote>
          Spacious gathering areas, a calm waterfront setting and a responsive
          host are the themes guests return to again and again.
        </blockquote>
        <div className="proof-meta">
          <span>4.96 average rating</span>
          <span>5.0 location</span>
          <span>5.0 communication</span>
        </div>
      </section>

      <section className="amenities section" id="amenities">
        <div className="section-label"><span>02</span> Included here</div>
        <div className="amenities-heading">
          <p className="eyebrow">Stay in, step outside</p>
          <h2>The cottage essentials, with the lake at the centre.</h2>
          <p>
            Every feature below is listed with the property. Seasonal lake
            conditions can vary; guests should review current Parks Canada
            information before their stay.
          </p>
        </div>
        <div className="amenity-grid">
          {amenities.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery-section" id="gallery">
        <div className="gallery-heading">
          <div className="section-label"><span>03</span> Gallery</div>
          <div>
            <p className="eyebrow light">Inside and out</p>
            <h2>See yourself at Canal Lake.</h2>
          </div>
        </div>
        <div className="gallery-grid">
          <figure className="gallery-lake"><img src="/cottage/lake-chairs.jpg" alt="Canal Lake beyond the lawn and red chairs" /></figure>
          <figure className="gallery-exterior"><img src="/cottage/exterior.webp" alt="Brick lakefront house and green backyard" /></figure>
          <figure className="gallery-living"><img src="/cottage/living-room-2.jpg" alt="Main living room" /></figure>
          <figure className="gallery-kitchen"><img src="/cottage/kitchen.jpg" alt="Full kitchen" /></figure>
          <figure className="gallery-games"><img src="/cottage/games-room.jpg" alt="Pool table and darts room" /></figure>
          <figure className="gallery-patio"><img src="/cottage/patio.jpg" alt="Outdoor patio" /></figure>
        </div>
      </section>

      <section className="explore section" id="explore">
        <div className="section-label"><span>04</span> Explore nearby</div>
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

      <section className="know section" id="details">
        <div className="section-label"><span>05</span> Good to know</div>
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

      <section className="booking-section" id="book">
        <div className="booking-copy">
          <p className="eyebrow light">Book direct</p>
          <h2>Keep more of your getaway for the getaway.</h2>
          <p>
            Direct reservations avoid Airbnb platform fees. Applicable taxes
            and required charges remain and will be shown clearly before payment.
          </p>
        </div>
        <BookingPanel variant="footer" />
        <p className="booking-disclosure">
          Live availability, final pricing and payment will activate after the
          channel manager is connected. Prefer Airbnb? <a href="https://www.airbnb.ca/rooms/940636318506657847" target="_blank" rel="noreferrer">View the listing</a>.
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
