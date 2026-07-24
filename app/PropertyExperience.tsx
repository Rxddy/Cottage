"use client";

import { useEffect, useState } from "react";

type AnimeApi = {
  animate: (targets: string | Element | NodeListOf<Element>, options: Record<string, unknown>) => unknown;
  stagger: (value: number) => unknown;
};

declare global {
  interface Window { anime?: AnimeApi }
}

const amenityGroups = [
  { title: "Scenic view", items: ["Lake view"] },
  { title: "Bathroom", items: ["Bathtub", "Hair dryer", "Cleaning products", "Shampoo", "Conditioner", "Body soap", "Hot water"] },
  { title: "Bedroom & laundry", items: ["Washing machine", "Drying machine — free, in unit", "Essentials — towels, bed sheets, soap and toilet paper", "Hangers", "Bed linens", "Extra pillows and blankets", "Clothing storage"] },
  { title: "Entertainment", items: ["TV", "Sound system", "Pool table", "Darts", "Badminton"] },
  { title: "Heating & cooling", items: ["Air conditioning", "Central heating"] },
  { title: "Home safety", items: ["Exterior security cameras — cameras cover the entrances, back deck, both sides of the house, lake area and driveway. All cameras are on and record 24/7.", "Smoke alarm", "Carbon monoxide alarm", "First-aid kit"] },
  { title: "Internet & office", items: ["Wi-Fi"] },
  { title: "Kitchen & dining", items: ["Kitchen — space where guests can cook their own meals", "Refrigerator", "Microwave", "Cooking basics — pots and pans, oil, salt and pepper", "Dishes and silverware — bowls, chopsticks, plates, cups and more", "Freezer", "Dishwasher", "Stove", "Oven", "Hot-water kettle", "Coffee maker", "Dining table"] },
  { title: "Location features", items: ["Waterfront — right next to a body of water", "Lake access — guests can reach the lake using a path or dock"] },
  { title: "Outdoor", items: ["Patio or balcony", "Backyard — an open grassy space on the property", "Fire pit", "Outdoor furniture", "Outdoor dining area", "Gas BBQ grill", "Kayak"] },
  { title: "Parking & facilities", items: ["Free parking on the premises"] },
  { title: "Services", items: ["Self check-in", "Keypad — check yourself into the home with a door code"] },
];

const keyAmenities = [
  { number: "01", icon: "/icons/flaticon/waterfront.png", title: "At the water", text: "Waterfront setting, lake view, access by path or dock and a kayak listed for guest use." },
  { number: "02", icon: "/icons/flaticon/living-room.png", title: "Room to gather", text: "A full kitchen, dining table, outdoor dining area, backyard, patio and gas BBQ." },
  { number: "03", icon: "/icons/flaticon/pool-table.png", title: "Time to play", text: "Pool table, darts, badminton, TV and a sound system for easygoing time together." },
  { number: "04", icon: "/icons/flaticon/wifi.png", title: "Everyday comfort", text: "Wi-Fi, air conditioning, central heating, laundry and free on-site parking." },
];

const activityHighlights = [
  { icons: ["/icons/flaticon/waterfront.png"], label: "Waterfront" },
  { icons: ["/icons/flaticon/kayak.png"], label: "Kayak" },
  { icons: ["/icons/flaticon/fire.png"], label: "Fire pit" },
  { icons: ["/icons/flaticon/pool-table.png"], label: "Pool table" },
  { icons: ["/icons/flaticon/darts.png"], label: "Darts" },
  { icons: ["/icons/flaticon/badminton.png"], label: "Badminton" },
  { icons: ["/icons/flaticon/barbecue.png"], label: "Gas BBQ" },
  { icons: ["/icons/flaticon/outdoor-dining.png"], label: "Outdoor dining" },
  { icons: ["/icons/flaticon/kitchen.png"], label: "Full kitchen" },
  { icons: ["/icons/flaticon/wifi.png"], label: "Wi-Fi" },
  { icons: ["/icons/flaticon/washer.png", "/icons/flaticon/dryer.png"], label: "Washer & dryer" },
  { icons: ["/icons/flaticon/backyard.png"], label: "Backyard" },
];

const reviewThemes = [
  { title: "The lake setting", text: "Visible guest feedback repeatedly highlights the lake view, dock, sunrise, backyard and evenings around the fire pit." },
  { title: "Space for groups", text: "Families and groups consistently value the generous indoor and outdoor gathering areas and room to spend time together." },
  { title: "A well-equipped stay", text: "Guests mention the kitchen, laundry, games area and straightforward self check-in as practical parts of a comfortable visit." },
  { title: "Responsive hosting", text: "Quick communication and attentive hospitality are recurring themes in the listing’s public feedback." },
];

const photos = [
  ["/cottage/lake-chairs.jpg", "The lake beyond the lawn and red chairs", "Waterfront"],
  ["/cottage/waterfront-kayaks.webp", "Three kayaks ready beside the dock", "Kayaks"],
  ["/cottage/backyard-cedars.webp", "Backyard deck and waterfront lawn", "Backyard deck"],
  ["/cottage/front-of-house.jpg", "Front exterior of Lakefront Serenity", "Front of the house"],
  ["/cottage/living-room-2.jpg", "Main living room inside Lakefront Serenity", "Living room"],
  ["/cottage/living-room-tv.webp", "Living room seating area with the television", "Living room"],
  ["/cottage/kitchen.jpg", "Full kitchen inside Lakefront Serenity", "Kitchen"],
  ["/cottage/kitchen-wide.webp", "Wide view of the fully equipped wood kitchen", "Kitchen"],
  ["/cottage/kitchen-dishware.webp", "Plates, bowls and glassware stored in the kitchen", "Dishware"],
  ["/cottage/kitchen-coffee-station.webp", "Coffee maker, kettle and toaster in the kitchen", "Coffee station"],
  ["/cottage/living-room-2.jpg", "Bright living room for relaxing together", "Play"],
  ["/cottage/patio.jpg", "Outdoor dining patio", "Patio"],
  ["/cottage/dining.jpg", "Dining area inside Lakefront Serenity", "Dining"],
  ["/cottage/bedroom-1-bathroom.jpg", "Bathroom attached to Bedroom 1", "Bedroom 1 bathroom"],
  ["/cottage/bedroom-2-3-bathroom.jpg", "Hallway bathroom shared by Bedrooms 2 and 3", "Hallway bathroom"],
  ["/cottage/bedroom-5-bathroom.jpg", "Bathroom attached to Bedroom 5", "Bedroom 5 bathroom"],
  ["/cottage/additional-washroom.jpg", "Additional washroom", "Additional bathroom"],
];

type Bedroom = {
  src: string;
  alt: string;
  label: string;
  detail: string;
  bathroomSrc?: string;
  bathroomAlt?: string;
  bathroomPending?: boolean;
};

const bedrooms: Bedroom[] = [
  { src: "/cottage/bedroom-1.jpg", alt: "Bedroom 1 with a queen bed", label: "Bedroom 1", detail: "Queen bed · attached bathroom", bathroomSrc: "/cottage/bedroom-1-bathroom.jpg", bathroomAlt: "Bathroom attached to Bedroom 1" },
  { src: "/cottage/bedroom-2.jpg", alt: "Bedroom 2 with a queen bed", label: "Bedroom 2", detail: "Queen bed · hallway bathroom", bathroomSrc: "/cottage/bedroom-2-3-bathroom.jpg", bathroomAlt: "Hallway bathroom shared by Bedrooms 2 and 3" },
  { src: "/cottage/bedroom-3.jpg", alt: "Bedroom 3 with a queen bed", label: "Bedroom 3", detail: "Queen bed · hallway bathroom", bathroomSrc: "/cottage/bedroom-2-3-bathroom.jpg", bathroomAlt: "Hallway bathroom shared by Bedrooms 2 and 3" },
  { src: "/cottage/bedroom-4.jpg", alt: "Bedroom 4 with a queen bed", label: "Bedroom 4", detail: "Queen bed · attached bathroom", bathroomSrc: "/cottage/bedroom-4-bathroom.jpg", bathroomAlt: "Updated bathroom attached to Bedroom 4" },
  { src: "/cottage/bedroom-5.jpg", alt: "Bedroom 5 with a queen bed", label: "Bedroom 5", detail: "Queen bed · attached bathroom", bathroomSrc: "/cottage/bedroom-5-bathroom.jpg", bathroomAlt: "Updated bathroom attached to Bedroom 5" },
];

const bedroomPhotos = bedrooms.flatMap((room) => [
  { src: room.src, alt: room.alt, title: room.label },
  ...(room.bathroomSrc && room.bathroomAlt ? [{ src: room.bathroomSrc, alt: room.bathroomAlt, title: `${room.label} bathroom` }] : []),
]);

function firstBedroomPhoto(roomIndex: number) {
  return bedrooms.slice(0, roomIndex).reduce((total, room) => total + (room.bathroomSrc ? 2 : 1), 0);
}

type Experience = {
  image: string;
  icon: string;
  label: string;
  text: string;
};

export function ExperienceCards({ items }: { items: Experience[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") setSelected((selected + 1) % items.length);
      if (event.key === "ArrowLeft") setSelected((selected - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length, selected]);

  return (
    <>
      <div className="experience-cards" aria-label="Cottage experiences">
        {items.map((item, index) => (
          <button className="experience-card" type="button" key={item.label} onClick={() => setSelected(index)} aria-label={`Enlarge ${item.label} photo`}>
            <img src={item.image} alt={item.text} />
            <span className="experience-card-copy"><span className="activity-icon" aria-hidden="true"><img src={item.icon} alt="" /></span><strong>{item.label}</strong><span>{item.text}</span></span>
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Cottage experience photo viewer" onClick={() => setSelected(null)}>
          <button className="lightbox-close" type="button" onClick={() => setSelected(null)} aria-label="Close photo viewer">×</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected - 1 + items.length) % items.length); }} aria-label="Previous photo">←</button>
          <img src={items[selected].image} alt={items[selected].text} onClick={(event) => event.stopPropagation()} />
          <button type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected + 1) % items.length); }} aria-label="Next photo">→</button>
          <p>{items[selected].label} · {selected + 1} / {items.length}</p>
        </div>
      )}
    </>
  );
}

export function ScrollAnimations() {
  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startAnime = () => {
      if (prefersReducedMotion || !window.anime) return;
      const { animate, stagger } = window.anime;
      animate(".hero-content > *", {
        opacity: { from: 0 },
        y: { from: 24 },
        delay: stagger(85),
        duration: 950,
        ease: "out(3)",
      });
      animate(".property-peek", {
        opacity: { from: 0 },
        x: { from: 28 },
        duration: 1100,
        delay: 260,
        ease: "out(4)",
      });
      animate(".brand-mark i", {
        scaleX: { from: 0.55 },
        opacity: { from: 0.28 },
        delay: stagger(140),
        duration: 1500,
        alternate: true,
        loop: true,
        ease: "inOutSine",
      });
    };
    const animeScript = document.querySelector<HTMLScriptElement>('script[src="/vendor/anime.umd.min.js"]');
    if (window.anime) startAnime();
    else animeScript?.addEventListener("load", startAnime, { once: true });

    const nodes = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.08 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => {
      animeScript?.removeEventListener("load", startAnime);
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);
  return null;
}

export function Amenities() {
  return (
    <section className="amenities-section section reveal" id="amenities">
      <div className="section-heading amenities-heading">
        <div><p className="eyebrow">What is included</p><h2>Made for lake days and easy nights.</h2></div>
        <p>These features are provided at the cottage. Seasonal lake conditions and amenity availability can vary.</p>
      </div>
      <div className="activity-highlights" aria-label="Activities and features at the house">
        {activityHighlights.map(({ icons, label }) => (
          <div key={label}><span className={icons.length > 1 ? "paired-icons" : undefined} aria-hidden="true">{icons.map((icon) => <img src={icon} alt="" key={icon} />)}</span><strong>{label}</strong></div>
        ))}
      </div>
      <div className="key-amenities">
        {keyAmenities.map((item) => (
          <article key={item.title}><div className="amenity-card-top"><span>{item.number}</span><b aria-hidden="true"><img src={item.icon} alt="" /></b></div><h3>{item.title}</h3><p>{item.text}</p></article>
        ))}
      </div>
      <div className="amenity-drawer">
        <div>
          <p className="eyebrow">What this place offers</p>
          <h3>Browse the complete amenity inventory.</h3>
          <p>All current listed features and activities are organized here, including the complete exterior-camera disclosure.</p>
        </div>
        <div className="amenity-groups">
          {amenityGroups.map((group) => (
            <details key={group.title} open={group.title === "Scenic view" || group.title === "Waterfront"}>
              <summary><span>{group.title}</span><b>{group.items.length}</b></summary>
              <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Gallery() {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") setSelected((selected + 1) % photos.length);
      if (event.key === "ArrowLeft") setSelected((selected - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <section className="gallery-section reveal" id="gallery">
      <div className="section-heading gallery-heading">
        <div><p className="eyebrow light">Gallery</p><h2>See the real Lakefront Serenity.</h2></div>
        <p>Every photograph shown here comes from the property listing. Choose a photo for a closer look.</p>
      </div>
      <div className="gallery-grid">
        {photos.map(([src, alt, label], index) => (
          <button className={`gallery-photo photo-${index + 1}`} type="button" key={src} onClick={() => setSelected(index)} aria-label={`Open photo: ${alt}`}>
            <img src={src} alt={alt} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Property photo viewer" onClick={() => setSelected(null)}>
          <button className="lightbox-close" type="button" onClick={() => setSelected(null)} aria-label="Close photo viewer">×</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected - 1 + photos.length) % photos.length); }} aria-label="Previous photo">←</button>
          <img src={photos[selected][0]} alt={photos[selected][1]} onClick={(event) => event.stopPropagation()} />
          <button type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected + 1) % photos.length); }} aria-label="Next photo">→</button>
          <p>{selected + 1} / {photos.length}</p>
        </div>
      )}
    </section>
  );
}

export function Bedrooms() {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") setSelected((selected + 1) % bedroomPhotos.length);
      if (event.key === "ArrowLeft") setSelected((selected - 1 + bedroomPhotos.length) % bedroomPhotos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <section className="bedrooms-section section reveal" id="bedrooms" aria-labelledby="bedrooms-title">
      <div className="section-heading bedrooms-heading">
        <div><p className="eyebrow">Five bedrooms</p><h2 id="bedrooms-title">Space to settle in.</h2></div>
        <p>View every bedroom in the cottage, including the attached bathroom for Bedroom 1, the shared hallway bathroom for Bedrooms 2 and 3, and attached bathrooms for Bedrooms 4 and 5.</p>
      </div>
      <div className="bedroom-grid">
        {bedrooms.map((room, index) => (
          <button className={`bedroom-card${room.bathroomSrc ? " has-bathroom" : ""}${room.bathroomPending ? " has-bathroom-placeholder" : ""}`} type="button" key={room.src} onClick={() => setSelected(firstBedroomPhoto(index))} aria-label={`Enlarge ${room.label}${room.bathroomSrc ? " and view its attached bathroom" : ""}`}>
            <img src={room.src} alt={room.alt} loading="lazy" decoding="async" />
            {room.bathroomSrc && <img className="bedroom-bath-thumb" src={room.bathroomSrc} alt={room.bathroomAlt} loading="lazy" decoding="async" />}
            {room.bathroomPending && <span className="bedroom-bath-placeholder" aria-label="Bathroom photo coming soon"><b aria-hidden="true">+</b><small>Bathroom photo<br />coming soon</small></span>}
            <span><strong>{room.label}</strong><small>{room.detail}</small>{room.bathroomSrc && <em>2 photos</em>}</span>
          </button>
        ))}
      </div>
      <p className="bedroom-note">Select a bedroom to view its bathroom photo at full size. Bedrooms 2 and 3 share the hallway bathroom.</p>
      {selected !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Bedroom photo viewer" onClick={() => setSelected(null)}>
          <button className="lightbox-close" type="button" onClick={() => setSelected(null)} aria-label="Close photo viewer">×</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected - 1 + bedroomPhotos.length) % bedroomPhotos.length); }} aria-label="Previous bedroom photo">←</button>
          <img src={bedroomPhotos[selected].src} alt={bedroomPhotos[selected].alt} onClick={(event) => event.stopPropagation()} />
          <button type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected + 1) % bedroomPhotos.length); }} aria-label="Next bedroom photo">→</button>
          <p>{bedroomPhotos[selected].title} · {selected + 1} / {bedroomPhotos.length}</p>
        </div>
      )}
    </section>
  );
}

type NearbyPlace = {
  number: string;
  category: string;
  title: string;
  text: string;
  href: string;
  icon: string;
  visual: string;
  image: string;
  imageAlt: string;
  photographer: string;
  licenseName: string;
};

export function NearbyCards({ places }: { places: NearbyPlace[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") setSelected((selected + 1) % places.length);
      if (event.key === "ArrowLeft") setSelected((selected - 1 + places.length) % places.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [places.length, selected]);

  return (
    <>
      <div className="nearby-cards">
        {places.map((place, index) => (
          <article className="nearby-card" key={place.title}>
            <button className={`nearby-image-button nearby-visual ${place.visual}`} type="button" onClick={() => setSelected(index)} aria-label={`Enlarge photo: ${place.imageAlt}`}>
              <img src={place.image} alt={place.imageAlt} loading="lazy" decoding="async" />
              <span>{place.number}</span>
              <b className="place-icon" aria-hidden="true"><img src={place.icon} alt="" /></b>
              <small>{place.category}</small>
              <em>{place.photographer} · {place.licenseName}</em>
            </button>
            <div className="nearby-copy"><h3>{place.title}</h3><p>{place.text}</p><a href={place.href} target="_blank" rel="noreferrer">Official visitor information →</a></div>
          </article>
        ))}
      </div>
      {selected !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Nearby destination photo viewer" onClick={() => setSelected(null)}>
          <button className="lightbox-close" type="button" onClick={() => setSelected(null)} aria-label="Close photo viewer">×</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected - 1 + places.length) % places.length); }} aria-label="Previous photo">←</button>
          <img src={places[selected].image} alt={places[selected].imageAlt} onClick={(event) => event.stopPropagation()} />
          <button type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected + 1) % places.length); }} aria-label="Next photo">→</button>
          <p>{places[selected].title} · {selected + 1} / {places.length}</p>
        </div>
      )}
    </>
  );
}

export function Reviews() {
  return (
    <section className="reviews-section section reveal" id="reviews" aria-labelledby="reviews-title">
      <div className="section-heading reviews-heading">
        <div><p className="eyebrow">Guest feedback</p><h2 id="reviews-title">What guests remember.</h2></div>
        <a href="https://www.airbnb.ca/rooms/940636318506657847" target="_blank" rel="noreferrer">Read all reviews on Airbnb ↗</a>
      </div>
      <div className="reviews-grid">
        <article className="score-card"><strong>4.96</strong><span aria-label="5 out of 5 stars">★★★★★</span><p>28 Airbnb reviews</p><small>Guest Favourite</small></article>
        {reviewThemes.map((review, index) => (
          <article className="review-card" key={review.title}><span>{String(index + 1).padStart(2, "0")}</span><div aria-hidden="true">★★★★★</div><h3>{review.title}</h3><p>{review.text}</p></article>
        ))}
      </div>
      <div className="review-categories" aria-label="Airbnb category ratings">
        {[["Cleanliness", "4.7"], ["Accuracy", "4.9"], ["Check-in", "5.0"], ["Communication", "5.0"], ["Location", "5.0"], ["Value", "4.9"]].map(([label, value]) => (
          <div key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </div>
      <p className="review-note">Review themes are paraphrased from visible public Airbnb feedback. No guest identities or quotations have been invented. Rating totals may change.</p>
    </section>
  );
}
