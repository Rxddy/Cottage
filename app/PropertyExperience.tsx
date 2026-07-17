"use client";

import { useEffect, useState } from "react";

const amenityGroups = [
  { title: "Scenic view", items: ["Lake view"] },
  { title: "Bathroom", items: ["Bathtub", "Hair dryer", "Cleaning products", "Shampoo", "Conditioner", "Body soap", "Hot water"] },
  { title: "Bedroom & laundry", items: ["Washer", "Free in-unit dryer", "Towels, sheets, soap and toilet paper", "Hangers", "Bed linens", "Extra pillows and blankets", "Clothing storage"] },
  { title: "Entertainment", items: ["TV", "Sound system", "Pool table"] },
  { title: "Comfort", items: ["Air conditioning", "Indoor fireplace", "Central heating"] },
  { title: "Safety", items: ["Exterior security cameras", "Smoke alarm", "Carbon monoxide alarm", "First-aid kit"] },
  { title: "Internet", items: ["Wi-Fi"] },
  { title: "Kitchen & dining", items: ["Full kitchen", "Refrigerator", "Microwave", "Cooking basics", "Dishes and silverware", "Freezer", "Dishwasher", "Stove", "Oven", "Hot-water kettle", "Coffee maker", "Dining table"] },
  { title: "Waterfront", items: ["Waterfront location", "Lake access by path or dock"] },
  { title: "Outdoor", items: ["Patio or balcony", "Backyard", "Fire pit", "Outdoor furniture", "Outdoor dining area", "Gas BBQ grill", "Kayak"] },
  { title: "Parking & access", items: ["Free parking on the premises", "Self check-in", "Keypad entry"] },
];

const reviewThemes = [
  { title: "The lake setting", text: "Guests repeatedly highlight the lake view, dock, sunrise, backyard and evenings by the fire pit." },
  { title: "Space to reconnect", text: "Families and groups value the generous indoor and outdoor gathering areas and room to spend time together." },
  { title: "Easy, comfortable stays", text: "Visible feedback notes a well-equipped kitchen, on-site laundry, games area and straightforward arrival." },
  { title: "Responsive hosting", text: "The host’s quick communication and hospitality are consistent themes across the listing’s feedback." },
];

const photos = [
  ["/cottage/lake-chairs.jpg", "Canal Lake beyond the lawn and red chairs"],
  ["/cottage/exterior.webp", "Brick lakefront house and green backyard"],
  ["/cottage/living-room-2.jpg", "Main living room"],
  ["/cottage/kitchen.jpg", "Full kitchen"],
  ["/cottage/games-room.jpg", "Pool table and darts room"],
  ["/cottage/patio.jpg", "Outdoor patio"],
];

export function ScrollAnimations() {
  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
    const nodes = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.12 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);
  return null;
}

export function Reviews() {
  const [active, setActive] = useState(0);
  const next = () => setActive((value) => (value + 1) % reviewThemes.length);
  const previous = () => setActive((value) => (value - 1 + reviewThemes.length) % reviewThemes.length);

  return (
    <section className="reviews-section reveal" id="reviews" aria-labelledby="reviews-title">
      <div className="review-score">
        <p className="eyebrow light">Guest favourite</p>
        <strong>4.96</strong>
        <div aria-label="5 out of 5 stars">★★★★★</div>
        <p>28 reviews on Airbnb</p>
        <a href="https://www.airbnb.ca/rooms/940636318506657847" target="_blank" rel="noreferrer">Read every review on Airbnb ↗</a>
      </div>
      <div className="review-carousel">
        <div className="review-heading">
          <div>
            <p className="eyebrow light">What guests remember</p>
            <h2 id="reviews-title">Loved for the setting. Remembered for the time together.</h2>
          </div>
          <div className="carousel-buttons">
            <button type="button" onClick={previous} aria-label="Previous review theme">←</button>
            <button type="button" onClick={next} aria-label="Next review theme">→</button>
          </div>
        </div>
        <article key={active} className="review-card" aria-live="polite">
          <span>{String(active + 1).padStart(2, "0")} / 04</span>
          <h3>{reviewThemes[active].title}</h3>
          <p>{reviewThemes[active].text}</p>
        </article>
        <div className="review-categories" aria-label="Airbnb category ratings">
          {[['Cleanliness', '4.7'], ['Accuracy', '4.9'], ['Check-in', '5.0'], ['Communication', '5.0'], ['Location', '5.0'], ['Value', '4.9']].map(([label, value]) => (
            <div key={label}><span>{label}</span><strong>{value}</strong></div>
          ))}
        </div>
        <p className="review-note">Themes are paraphrased from visible Airbnb guest feedback; rating totals may change.</p>
      </div>
    </section>
  );
}

export function Amenities() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? amenityGroups : amenityGroups.slice(0, 6);
  return (
    <section className="amenities section reveal" id="amenities">
      <div className="section-label"><span>03</span> Included here</div>
      <div className="amenities-heading">
        <p className="eyebrow">All the essentials</p>
        <h2>50 amenities, with the lake at the centre.</h2>
        <p>Every feature below is listed on the Airbnb property page. Seasonal lake conditions and availability can vary.</p>
      </div>
      <div className="amenity-list-wrap">
        <div className="amenity-groups">
          {visible.map((group) => (
            <details key={group.title} open={group.title === "Scenic view" || group.title === "Waterfront"}>
              <summary><span>{group.title}</span><b>{group.items.length}</b></summary>
              <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </details>
          ))}
        </div>
        <button className="outline-button" type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
          {expanded ? "Show fewer categories" : "Show all 50 amenities"}
        </button>
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
      <div className="gallery-heading">
        <div className="section-label"><span>04</span> Gallery</div>
        <div><p className="eyebrow light">Inside and out</p><h2>See yourself at Canal Lake.</h2><p>Choose any photograph for a closer look.</p></div>
      </div>
      <div className="gallery-grid">
        {photos.map(([src, alt], index) => (
          <button className={`gallery-photo photo-${index + 1}`} type="button" key={src} onClick={() => setSelected(index)} aria-label={`Open photo: ${alt}`}>
            <img src={src} alt={alt} />
            <span>View</span>
          </button>
        ))}
      </div>
      {selected !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Property photo viewer" onClick={() => setSelected(null)}>
          <button className="lightbox-close" type="button" onClick={() => setSelected(null)} aria-label="Close photo viewer">×</button>
          <button className="lightbox-prev" type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected - 1 + photos.length) % photos.length); }} aria-label="Previous photo">←</button>
          <img src={photos[selected][0]} alt={photos[selected][1]} onClick={(event) => event.stopPropagation()} />
          <button className="lightbox-next" type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected + 1) % photos.length); }} aria-label="Next photo">→</button>
          <p>{selected + 1} / {photos.length}</p>
        </div>
      )}
    </section>
  );
}
