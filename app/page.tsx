import { BookingDock, BookingPanel } from "./BookingPanel";
import { Amenities, Bedrooms, ExperienceCards, Gallery, NearbyCards, Reviews, ScrollAnimations } from "./PropertyExperience";
import { getAirbnbAvailability } from "./airbnb-calendar";

const bookingPricing = {
  currency: process.env.STRIPE_CURRENCY ?? "cad",
  nightlyRateCents: Number(process.env.STRIPE_NIGHTLY_RATE_CENTS ?? 0),
  cleaningFeeCents: Number(process.env.STRIPE_CLEANING_FEE_CENTS ?? 0),
};

const experiences = [
  {
    image: "/cottage/unwind-kayaks.jpg",
    icon: "/icons/flaticon/waterfront.png",
    label: "Unwind",
    text: "Fire-pit seating and kayaks at the water's edge",
  },
  {
    image: "/cottage/gather-patio.jpg",
    icon: "/icons/flaticon/outdoor-dining.png",
    label: "Gather",
    text: "Outdoor dining and the gas BBQ",
  },
  {
    image: "/cottage/games-room.jpg",
    icon: "/icons/flaticon/pool-table.png",
    label: "Play",
    text: "Pool table and darts indoors",
  },
  {
    image: "/cottage/share-dining.jpg",
    icon: "/icons/flaticon/kitchen.png",
    label: "Share",
    text: "A welcoming dining table for shared meals",
  },
];

const nearby = [
  {
    number: "01",
    category: "Public golf course",
    title: "Western Trent Golf Club",
    text: "Play a scenic nine-hole course beside the Trent–Severn Waterway, with a driving range, club rentals and an on-site patio.",
    href: "https://www.westerntrentgolfclub.com/golf",
    icon: "/icons/flaticon/backyard.png",
    visual: "golf",
    image: "/nearby/western-trent-golf.png",
    imageAlt: "Aerial view of Western Trent Golf Club beside the waterway",
    photoTitle: "Western Trent Golf Club course",
    photographer: "Western Trent Golf Club",
    photoSource: "https://www.westerntrentgolfclub.com/golf",
    licenseName: "Official website",
    licenseUrl: "https://www.westerntrentgolfclub.com/golf",
  },
  {
    number: "02",
    category: "Provincial park",
    title: "Balsam Lake Provincial Park",
    text: "Plan a seasonal day of swimming, hiking, birding, boating or paddling at this Ontario park.",
    href: "https://www.ontarioparks.ca/park/balsamlake/activities",
    icon: "/icons/flaticon/backyard.png",
    visual: "park",
    image: "/nearby/balsam-lake-sunrise.jpg",
    imageAlt: "Quiet sunrise over the beach at Balsam Lake Provincial Park",
    photoTitle: "Balsam Lake Provincial Park at sunrise",
    photographer: "RichardBH",
    photoSource: "https://commons.wikimedia.org/wiki/File:Balsam_Lake_Provincial_Park_at_sunrise.jpg",
    licenseName: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
  {
    number: "03",
    category: "Boating country",
    title: "Trent–Severn Waterway",
    text: "Explore a 386-kilometre historic waterway known for boating, paddling and its lockstations.",
    href: "https://parks.canada.ca/lhn-nhs/on/trentsevern",
    icon: "/icons/flaticon/waterfront.png",
    visual: "waterway",
    image: "/nearby/trent-autumn.jpg",
    imageAlt: "Autumn colour reflected along the Trent–Severn Waterway",
    photoTitle: "Trent Autumn",
    photographer: "Robert Taylor",
    photoSource: "https://commons.wikimedia.org/wiki/File:Trent_Autumn_(1464739559).jpg",
    licenseName: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
  },
  {
    number: "04",
    category: "Conservation area",
    title: "Pigeon River Headwaters",
    text: "Walk nearly five kilometres of connected loops through forest, wetlands and meadows at the Pigeon River headwaters.",
    href: "https://ontarioconservationareas.ca/conservation-areas/pigeon-river-headwaters/",
    icon: "/icons/flaticon/backyard.png",
    visual: "headwaters",
    image: "/nearby/pigeon-headwaters-boardwalk.jpg",
    imageAlt: "Pigeon River flowing through the wooded headwaters conservation area",
    photoTitle: "River on the Boardwalk",
    photographer: "Tscatter",
    photoSource: "https://commons.wikimedia.org/wiki/File:River_on_the_Boardwalk.jpg",
    licenseName: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  {
    number: "05",
    category: "Provincial park",
    title: "Emily Provincial Park",
    text: "Enjoy seasonal swimming, boating, beginner-friendly canoeing and fishing along the Pigeon River.",
    href: "https://www.ontarioparks.ca/park/emily/activities",
    icon: "/icons/flaticon/waterfront.png",
    visual: "emily",
    image: "/nearby/pigeon-river-emily.jpg",
    imageAlt: "Pigeon River at Omemee in the Kawartha Lakes region near Emily Provincial Park",
    photoTitle: "Pigeon River, Omemee, Ontario",
    photographer: "Plismo",
    photoSource: "https://commons.wikimedia.org/wiki/File:Pigeon-River-Omemee-Ontario.jpg",
    licenseName: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  },
  {
    number: "06",
    category: "Multi-use forest",
    title: "Ganaraska Forest",
    text: "Explore hiking, mountain biking, horseback riding, cross-country skiing and snowshoeing trails. A day pass or membership is required.",
    href: "https://grca.on.ca/forest-recreation/ganaraska-forest-trails-map/",
    icon: "/icons/flaticon/backyard.png",
    visual: "forest",
    image: "/nearby/ganaraska-forest.jpg",
    imageAlt: "A wooded trail through Ganaraska Forest in autumn",
    photoTitle: "Ganaraska Forest, Ontario",
    photographer: "Magnolia677",
    photoSource: "https://commons.wikimedia.org/wiki/File:Ganaraska_Forest,_Ontario.jpg",
    licenseName: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  },
];

export default async function Home() {
  const airbnbAvailability = await getAirbnbAvailability();

  return (
    <main>
      <ScrollAnimations />
      <BookingDock pricing={bookingPricing} />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Lakefront Serenity home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="brand-copy"><strong>Lakefront Serenity</strong><small>Waterfront · Kawartha Lakes</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a className="active" href="#top">Home</a>
          <a href="#house">Cottage</a>
          <a href="#bedrooms">Bedrooms</a>
          <a href="#explore">Things to do</a>
          <a href="#gallery">Gallery</a>
          <a href="#reviews">Reviews</a>
          <a href="#book">Availability</a>
          <a href="#details">Guide</a>
        </nav>
        <details className="mobile-nav">
          <summary aria-label="Open navigation"><span /><span /></summary>
          <nav aria-label="Mobile navigation">
            <a href="#house">Cottage</a>
            <a href="#bedrooms">Bedrooms</a>
            <a href="#explore">Things to do</a>
            <a href="#gallery">Gallery</a>
            <a href="#reviews">Reviews</a>
            <a href="#book">Check availability</a>
          </nav>
        </details>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow light">A waterfront stay in Kawartha Lakes</p>
          <h1 id="hero-title">Your escape<br />starts here.</h1>
          <p className="hero-copy">A spacious Kawartha Lakes retreat where groups can slow down, reconnect and keep the water in view.</p>
          <div className="hero-rating" aria-label="Rated 4.96 out of 5 from 28 Airbnb reviews">
            <span aria-hidden="true">★★★★★</span>
            <strong>4.96</strong>
            <small>28 reviews · Guest Favourite</small>
          </div>
          <div className="hero-actions">
            <a className="button primary" href="#book">Check availability <span aria-hidden="true">↗</span></a>
            <a className="button glass" href="#gallery">See the photos <span aria-hidden="true">↓</span></a>
          </div>
        </div>

        <figure className="property-peek">
          <img src="/cottage/exterior.webp" alt="The actual exterior of Lakefront Serenity" />
          <figcaption>
            <span>Lakefront Serenity</span>
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
          <p className="eyebrow">Welcome to Lakefront Serenity</p>
          <h2>Relax. Recharge.<br />Reconnect.</h2>
          <p>Set directly on the waterfront, this entire home gives up to ten guests five bedrooms, six beds and three bathrooms, plus generous spaces for cooking, playing and gathering.</p>
          <p className="handwritten">Make it memorable.</p>
          <a className="button dark" href="#amenities">Discover the cottage</a>
        </div>
        <ExperienceCards items={experiences} />
      </section>

      <Amenities />
      <Gallery />

      <Bedrooms />

      <section className="explore section reveal" id="explore">
        <div className="section-heading">
          <div><p className="eyebrow">Things to do nearby</p><h2>Adventure awaits.</h2></div>
          <p>Independent destinations to consider while staying in Kawartha Lakes. Destination imagery is credited below; these places are not services or amenities provided by Lakefront Serenity.</p>
        </div>
        <NearbyCards places={nearby} />
        <div className="area-map">
          <div className="area-map-heading">
            <div><p className="eyebrow">Where you&apos;ll be</p><h3>Kawartha Lakes, Ontario</h3></div>
            <p>Explore the surrounding area interactively. The cottage&apos;s exact location is provided only after a reservation is confirmed.</p>
          </div>
          <iframe
            title="Interactive map of the Western Trent Golf Club area in Kawartha Lakes"
            src="https://www.google.com/maps?q=Western+Trent+Golf+Club,+Kawartha+Lakes,+Ontario&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <details className="photo-credits">
          <summary>Photo credits and source links</summary>
          <ul>
            {nearby.map((place) => (
              <li key={place.photoTitle}>
                <a href={place.photoSource} target="_blank" rel="noreferrer">{place.photoTitle}</a> by {place.photographer} — <a href={place.licenseUrl} target="_blank" rel="noreferrer">{place.licenseName}</a>. Resized for web display.
              </li>
            ))}
          </ul>
        </details>
        <p className="distance-note">Exact travel times are intentionally omitted until the property address is confirmed. Check official hours, fees, operating dates and conditions before visiting.</p>
      </section>

      <Reviews />

      <section className="know section reveal" id="details">
        <div className="know-image"><img src="/cottage/exterior.webp" alt="Front exterior and lawn at Lakefront Serenity" /></div>
        <div className="know-copy">
          <p className="eyebrow">Good to know</p>
          <h2>A simple arrival, with the important details upfront.</h2>
          <dl>
            <div><dt>Check-in</dt><dd>Any time</dd></div>
            <div><dt>Checkout</dt><dd>Before 10:00 a.m.</dd></div>
            <div><dt>Entry</dt><dd>Self check-in with keypad<small>The private keypad code is provided after payment is received.</small></dd></div>
            <div><dt>Quiet hours</dt><dd>11:00 p.m.–5:00 a.m.</dd></div>
          </dl>
          <div className="house-rules-detail">
            <h3>House rules</h3>
            <p>You&apos;ll be staying in someone&apos;s home, so please treat it with care and respect.</p>
            <div className="rule-groups">
              <section>
                <h4>During your stay</h4>
                <ul>
                  <li>Maximum 10 guests</li>
                  <li>No pets</li>
                  <li>No parties or events</li>
                  <li>Commercial photography is allowed</li>
                  <li>No smoking</li>
                </ul>
              </section>
              <section>
                <h4>Additional rules</h4>
                <ul>
                  <li>Do not move indoor furniture outside. This helps prevent damage and keeps bugs from travelling indoors.</li>
                  <li>Please bring your own firewood if needed.</li>
                </ul>
              </section>
              <section>
                <h4>Before you leave</h4>
                <ul>
                  <li>Throw trash away</li>
                  <li>Turn things off</li>
                  <li>Lock up</li>
                </ul>
              </section>
            </div>
          </div>
          <div className="safety-detail">
            <h3>Safety &amp; property</h3>
            <p>Avoid surprises by reviewing these important details about the property.</p>
            <section>
              <h4>Safety considerations</h4>
              <strong>Nearby lake and other bodies of water</strong>
            </section>
            <section>
              <h4>Safety devices</h4>
              <ul>
                <li><strong>Exterior security cameras:</strong> Cameras monitor the home&apos;s entrances, back deck, both sides of the house, lake area and driveway. All exterior cameras are active and record 24/7.</li>
                <li>Carbon monoxide alarm installed</li>
                <li>Smoke alarm installed</li>
              </ul>
            </section>
          </div>
          <p className="fine-print">A Renter&apos;s Code of Conduct form is required. Indoor taps use city water; the outdoor hose uses lake water.</p>
        </div>
      </section>

      <section className="contact-section section reveal" id="contact">
        <div className="contact-copy">
          <p className="eyebrow">Questions before you book?</p>
          <h2>Talk with the host.</h2>
          <p>Email the host for stay questions, accessibility details or help planning your lake days. The host will confirm availability, pricing and next steps. The exact arrival address and access instructions are shared privately after a reservation is accepted.</p>
        </div>
        <div className="contact-card">
          <span className="contact-card-label">Booking &amp; guest support</span>
          <a href="mailto:lakefrontserenitysupport@gmail.com?subject=Lakefront%20Serenity%20inquiry">lakefrontserenitysupport@gmail.com</a>
          <small>We usually respond within one business day.</small>
        </div>
      </section>

      <section className="booking-section reveal" id="book">
        <div className="booking-benefits" aria-label="Included cottage features">
          <div><span aria-hidden="true"><img src="/icons/flaticon/wifi.png" alt="" /></span><strong>Wi-Fi</strong><small>Included</small></div>
          <div><span aria-hidden="true"><img src="/icons/flaticon/waterfront.png" alt="" /></span><strong>Waterfront</strong><small>Lake access</small></div>
          <div><span aria-hidden="true"><img src="/icons/flaticon/fire.png" alt="" /></span><strong>Fire pit</strong><small>Bring firewood</small></div>
          <div><span aria-hidden="true"><img src="/icons/flaticon/kitchen.png" alt="" /></span><strong>Self check-in</strong><small>Keypad entry</small></div>
        </div>
        <div className="booking-copy">
          <p className="eyebrow light">Ready to make memories?</p>
          <h2>Plan your waterfront stay.</h2>
          <p>This read-only calendar shades nights that are already unavailable so you can check dates at a glance.</p>
          <div className="booking-shortcuts">
            <a className="photo-stack-button" href="#gallery" aria-label="Jump to the cottage photo gallery">
              <span className="photo-stack" aria-hidden="true">
                <img src="/cottage/lake-chairs.jpg" alt="" />
                <img src="/cottage/kitchen-wide.webp" alt="" />
                <img src="/cottage/living-room-2.jpg" alt="" />
              </span>
              <span><small>Explore the cottage</small><strong>View all photos</strong></span>
              <b aria-hidden="true">↗</b>
            </a>
            <a className="photo-stack-button" href="#bedrooms" aria-label="Jump to the cottage bedrooms">
              <span className="photo-stack" aria-hidden="true">
                <img src="/cottage/bedroom-1.jpg" alt="" />
                <img src="/cottage/bedroom-3.jpg" alt="" />
                <img src="/cottage/bedroom-5.jpg" alt="" />
              </span>
              <span><small>See where you&apos;ll sleep</small><strong>View bedrooms</strong></span>
              <b aria-hidden="true">↗</b>
            </a>
          </div>
        </div>
        <BookingPanel variant="footer" pricing={bookingPricing} blockedDates={airbnbAvailability.blockedDates} availabilityStatus={airbnbAvailability.status} />
        <p className="booking-disclosure">Availability is refreshed automatically. Select your dates, then email the host to request your stay. The exact arrival address and access instructions are sent privately in the confirmation email after the host accepts the reservation.</p>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span><span className="brand-copy"><strong>Lakefront Serenity</strong><small>Waterfront · Kawartha Lakes</small></span></a>
        <p>Entire waterfront home for up to ten guests.</p>
        <div><a href="#details">House rules</a><a href="#contact">Contact</a><a href="#book">Booking information</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="https://www.flaticon.com/" target="_blank" rel="noreferrer">Icons by Freepik and HAJICON from Flaticon</a><a href="#top">Back to top ↑</a></div>
      </footer>
    </main>
  );
}
