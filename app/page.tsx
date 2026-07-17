import { BookingPanel } from "./BookingPanel";
import { Amenities, Gallery, Reviews, ScrollAnimations } from "./PropertyExperience";

const experiences = [
  {
    image: "/cottage/unwind-kayaks.jpg",
    icon: "≈",
    label: "Unwind",
    text: "Fire-pit seating and kayaks at the edge of Canal Lake",
  },
  {
    image: "/cottage/gather-patio.jpg",
    icon: "⌂",
    label: "Gather",
    text: "Outdoor dining and the gas BBQ",
  },
  {
    image: "/cottage/games-room.jpg",
    icon: "●",
    label: "Play",
    text: "Pool table and darts indoors",
  },
  {
    image: "/cottage/kitchen.jpg",
    icon: "⌑",
    label: "Share",
    text: "A full kitchen for group meals",
  },
];

const nearby = [
  {
    number: "01",
    category: "Historic waterway",
    title: "Kirkfield Lift Lock",
    text: "See Lock 36, the world’s second-highest hydraulic lift lock, with a lift of about 15 metres.",
    href: "https://parks.canada.ca/lhn-nhs/on/trentsevern/visit/posteeclusage-lockstation/ecluse-lock-36-kirkfield",
    icon: "↕",
    visual: "lock",
  },
  {
    number: "02",
    category: "Provincial park",
    title: "Balsam Lake Provincial Park",
    text: "Plan a seasonal day of swimming, hiking, birding, boating or paddling at this Ontario park.",
    href: "https://www.ontarioparks.ca/park/balsamlake/activities",
    icon: "△",
    visual: "park",
  },
  {
    number: "03",
    category: "Boating country",
    title: "Trent–Severn Waterway",
    text: "Explore a 386-kilometre historic waterway known for boating, paddling and its lockstations.",
    href: "https://parks.canada.ca/lhn-nhs/on/trentsevern",
    icon: "≈",
    visual: "waterway",
  },
  {
    number: "04",
    category: "Conservation area",
    title: "Pigeon River Headwaters",
    text: "Walk nearly five kilometres of connected loops through forest, wetlands and meadows at the Pigeon River headwaters.",
    href: "https://ontarioconservationareas.ca/conservation-areas/pigeon-river-headwaters/",
    icon: "⌁",
    visual: "headwaters",
  },
  {
    number: "05",
    category: "Provincial park",
    title: "Emily Provincial Park",
    text: "Enjoy seasonal swimming, boating, beginner-friendly canoeing and fishing along the Pigeon River.",
    href: "https://www.ontarioparks.ca/park/emily/activities",
    icon: "⌣",
    visual: "emily",
  },
  {
    number: "06",
    category: "Multi-use forest",
    title: "Ganaraska Forest",
    text: "Explore hiking, mountain biking, horseback riding, cross-country skiing and snowshoeing trails. A day pass or membership is required.",
    href: "https://grca.on.ca/forest-recreation/ganaraska-forest-trails-map/",
    icon: "♧",
    visual: "forest",
  },
];

export default function Home() {
  return (
    <main>
      <ScrollAnimations />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="LakeFront House home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="brand-copy"><strong>LakeFront House</strong><small>Canal Lake · Kawartha Lakes</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a className="active" href="#top">Home</a>
          <a href="#house">Cottage</a>
          <a href="#explore">Things to do</a>
          <a href="#gallery">Gallery</a>
          <a href="#reviews">Reviews</a>
          <a href="#book">Availability</a>
          <a href="#details">Guide</a>
        </nav>
        <a className="nav-book" href="#book">Book direct <span aria-hidden="true">↗</span></a>
        <details className="mobile-nav">
          <summary aria-label="Open navigation"><span /><span /></summary>
          <nav aria-label="Mobile navigation">
            <a href="#house">Cottage</a>
            <a href="#explore">Things to do</a>
            <a href="#gallery">Gallery</a>
            <a href="#reviews">Reviews</a>
            <a href="#book">Book direct</a>
          </nav>
        </details>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow light">A waterfront stay on Canal Lake</p>
          <h1 id="hero-title">Your escape<br />starts here.</h1>
          <p className="hero-copy">A spacious Kawartha Lakes retreat where groups can slow down, reconnect and keep the water in view.</p>
          <div className="hero-rating" aria-label="Rated 4.96 out of 5 from 28 Airbnb reviews">
            <span aria-hidden="true">★★★★★</span>
            <strong>4.96</strong>
            <small>28 reviews · Guest Favourite</small>
          </div>
          <div className="hero-actions">
            <a className="button primary" href="#book">Book direct <span aria-hidden="true">↗</span></a>
            <a className="button glass" href="#house">Explore the cottage <span aria-hidden="true">↓</span></a>
          </div>
        </div>

        <figure className="property-peek">
          <img src="/cottage/exterior.webp" alt="The actual exterior of LakeFront House" />
          <figcaption>
            <span>LakeFront House</span>
            <strong>The actual cottage</strong>
          </figcaption>
        </figure>

        <div className="hero-facts" aria-label="Property overview">
          <div><span className="fact-icon" aria-hidden="true">10</span><p><strong>Guests</strong><small>Maximum</small></p></div>
          <div><span className="fact-icon" aria-hidden="true">5</span><p><strong>Bedrooms</strong><small>6 beds</small></p></div>
          <div><span className="fact-icon" aria-hidden="true">3</span><p><strong>Bathrooms</strong><small>Full baths</small></p></div>
          <div><span className="fact-icon" aria-hidden="true">≈</span><p><strong>Waterfront</strong><small>Lake access</small></p></div>
          <div><span className="fact-icon" aria-hidden="true">◇</span><p><strong>Kayak</strong><small>Listed amenity</small></p></div>
          <div><span className="fact-icon" aria-hidden="true">⌁</span><p><strong>Wi-Fi</strong><small>Included</small></p></div>
        </div>
      </section>

      <section className="welcome section reveal" id="house">
        <div className="welcome-copy">
          <p className="eyebrow">Welcome to LakeFront House</p>
          <h2>Relax. Recharge.<br />Reconnect.</h2>
          <p>Set directly on Canal Lake, this entire home gives up to ten guests five bedrooms, six beds and three bathrooms, plus generous spaces for cooking, playing and gathering.</p>
          <p className="handwritten">Make it memorable.</p>
          <a className="button dark" href="#amenities">Discover the cottage</a>
        </div>
        <div className="experience-cards" aria-label="Cottage experiences">
          {experiences.map((item) => (
            <article className="experience-card" key={item.label}>
              <img src={item.image} alt={item.text} />
              <div><span className="activity-icon" aria-hidden="true">{item.icon}</span><h3>{item.label}</h3><p>{item.text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <Amenities />
      <Gallery />

      <section className="explore section reveal" id="explore">
        <div className="section-heading">
          <div><p className="eyebrow">Things to do nearby</p><h2>Adventure awaits.</h2></div>
          <p>Independent destinations to consider while staying in Kawartha Lakes. They are not services or amenities provided by LakeFront House.</p>
        </div>
        <div className="nearby-cards">
          {nearby.map((place) => (
            <a className="nearby-card" key={place.title} href={place.href} target="_blank" rel="noreferrer">
              <div className={`nearby-visual ${place.visual}`}><span>{place.number}</span><b className="place-icon" aria-hidden="true">{place.icon}</b><small>{place.category}</small></div>
              <div className="nearby-copy"><h3>{place.title}</h3><p>{place.text}</p><span>Official visitor information →</span></div>
            </a>
          ))}
        </div>
        <p className="distance-note">Exact travel times are intentionally omitted until the property address is confirmed. Check official hours, fees, operating dates and conditions before visiting.</p>
      </section>

      <Reviews />

      <section className="know section reveal" id="details">
        <div className="know-image"><img src="/cottage/entrance.jpg" alt="Front entrance with keypad self check-in" /></div>
        <div className="know-copy">
          <p className="eyebrow">Good to know</p>
          <h2>A simple arrival, with the important details upfront.</h2>
          <dl>
            <div><dt>Check-in</dt><dd>3:00 p.m.–12:00 a.m.</dd></div>
            <div><dt>Checkout</dt><dd>Before 10:00 a.m.</dd></div>
            <div><dt>Entry</dt><dd>Self check-in with keypad</dd></div>
            <div><dt>Quiet hours</dt><dd>11:00 p.m.–7:00 a.m.</dd></div>
            <div><dt>House rules</dt><dd>No pets, parties, events or smoking</dd></div>
          </dl>
          <p className="fine-print">A Renter&apos;s Code of Conduct form is required. Exterior security cameras are disclosed on the listing. Indoor taps use city water; the outdoor hose uses lake water.</p>
        </div>
      </section>

      <section className="booking-section reveal" id="book">
        <div className="booking-benefits" aria-label="Included cottage features">
          <div><span aria-hidden="true">⌁</span><strong>Wi-Fi</strong><small>Included</small></div>
          <div><span aria-hidden="true">◇</span><strong>Waterfront</strong><small>Lake access</small></div>
          <div><span aria-hidden="true">♨</span><strong>Fire pit</strong><small>Bring firewood</small></div>
          <div><span aria-hidden="true">◎</span><strong>Self check-in</strong><small>Keypad entry</small></div>
        </div>
        <div className="booking-copy">
          <p className="eyebrow light">Ready to make memories?</p>
          <h2>Plan your Canal Lake stay.</h2>
          <p>Direct reservations can save platform fees. Applicable taxes and required charges still apply and must be shown before payment.</p>
        </div>
        <BookingPanel variant="footer" />
        <p className="booking-disclosure">Live direct availability and payment will activate once a channel manager, rates and secure checkout are connected. Until then, <a href="https://www.airbnb.ca/rooms/940636318506657847" target="_blank" rel="noreferrer">view and book the verified listing on Airbnb ↗</a></p>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span className="brand-copy"><strong>LakeFront House</strong><small>Canal Lake · Kawartha Lakes</small></span></a>
        <p>Entire waterfront home for up to ten guests.</p>
        <div><a href="#details">House rules</a><a href="#book">Booking information</a><a href="#top">Back to top ↑</a></div>
      </footer>
    </main>
  );
}
