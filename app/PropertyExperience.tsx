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

const keyAmenities = [
  { number: "01", title: "At the water", text: "Waterfront setting, lake view, access by path or dock and a kayak listed for guest use." },
  { number: "02", title: "Room to gather", text: "A full kitchen, dining table, outdoor dining area, backyard, patio and gas BBQ." },
  { number: "03", title: "Time to play", text: "Pool table, TV and sound system for relaxed time indoors between lake days." },
  { number: "04", title: "Everyday comfort", text: "Wi-Fi, air conditioning, central heating, laundry and free on-site parking." },
];

const reviewThemes = [
  { title: "The lake setting", text: "Visible guest feedback repeatedly highlights the lake view, dock, sunrise, backyard and evenings around the fire pit." },
  { title: "Space for groups", text: "Families and groups consistently value the generous indoor and outdoor gathering areas and room to spend time together." },
  { title: "A well-equipped stay", text: "Guests mention the kitchen, laundry, games area and straightforward self check-in as practical parts of a comfortable visit." },
  { title: "Responsive hosting", text: "Quick communication and attentive hospitality are recurring themes in the listing’s public feedback." },
];

const photos = [
  ["/cottage/lake-chairs.jpg", "Canal Lake beyond the lawn and red chairs", "Waterfront"],
  ["/cottage/living-room-2.jpg", "Main living room inside LakeFront House", "Living room"],
  ["/cottage/kitchen.jpg", "Full kitchen inside LakeFront House", "Kitchen"],
  ["/cottage/games-room.jpg", "Pool table and darts room", "Games room"],
  ["/cottage/patio.jpg", "Outdoor dining patio", "Patio"],
  ["/cottage/dining.jpg", "Dining area inside LakeFront House", "Dining"],
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
      { threshold: 0.08 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);
  return null;
}

export function Amenities() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? amenityGroups : amenityGroups.slice(0, 5);

  return (
    <section className="amenities-section section reveal" id="amenities">
      <div className="section-heading amenities-heading">
        <div><p className="eyebrow">What is included</p><h2>Made for lake days and easy nights.</h2></div>
        <p>These features come directly from the public Airbnb listing. Seasonal lake conditions and amenity availability can vary.</p>
      </div>
      <div className="key-amenities">
        {keyAmenities.map((item) => (
          <article key={item.title}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>
        ))}
      </div>
      <div className="amenity-drawer">
        <div>
          <p className="eyebrow">Listing inventory</p>
          <h3>Browse every verified amenity category.</h3>
          <p>The Airbnb page currently lists 50 amenities across the home, waterfront and outdoor spaces.</p>
        </div>
        <div className="amenity-groups">
          {visible.map((group) => (
            <details key={group.title} open={group.title === "Scenic view" || group.title === "Waterfront"}>
              <summary><span>{group.title}</span><b>{group.items.length}</b></summary>
              <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </details>
          ))}
          <button className="outline-button" type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
            {expanded ? "Show fewer categories" : "Show all 50 amenities"}
          </button>
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
        <div><p className="eyebrow light">Gallery</p><h2>See the real LakeFront House.</h2></div>
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
