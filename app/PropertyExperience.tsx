"use client";

import { useEffect, useRef, useState } from "react";

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

type GalleryPhoto = { src: string; alt: string; label: string };
type GalleryGroup = { id: string; label: string; description: string; photos: GalleryPhoto[] };

const galleryGroups: GalleryGroup[] = [
  {
    id: "outside",
    label: "Outside",
    description: "The waterfront lawn, dock, patios and both sides of the house.",
    photos: [
      { src: "/cottage/lake-chairs.jpg", alt: "The lake beyond the lawn and red chairs", label: "Waterfront" },
      { src: "/cottage/front-of-house.jpg", alt: "Front exterior of Lakefront Serenity", label: "Front of the house" },
      { src: "/cottage/exterior.webp", alt: "Back exterior and lawn at Lakefront Serenity", label: "Back of the house" },
      { src: "/cottage/backyard-cedars.webp", alt: "Backyard deck and waterfront lawn", label: "Backyard deck" },
      { src: "/cottage/waterfront-kayaks.webp", alt: "Three kayaks ready beside the dock", label: "Kayaks" },
    ],
  },
  {
    id: "living",
    label: "Living room",
    description: "The main gathering room, pool table and television area.",
    photos: [
      { src: "/cottage/living-room-2.jpg", alt: "Main living room and pool table inside Lakefront Serenity", label: "Living room" },
      { src: "/cottage/living-room-tv.webp", alt: "Living room seating area with the television", label: "TV area" },
    ],
  },
  {
    id: "kitchen",
    label: "Kitchen & dining",
    description: "The full kitchen, dining table and everyday cooking setup.",
    photos: [
      { src: "/cottage/kitchen.jpg", alt: "Full kitchen inside Lakefront Serenity", label: "Kitchen" },
      { src: "/cottage/dining.jpg", alt: "Dining area inside Lakefront Serenity", label: "Dining room" },
      { src: "/cottage/kitchen-wide.webp", alt: "Wide view of the fully equipped wood kitchen", label: "Kitchen storage" },
      { src: "/cottage/kitchen-coffee-station.webp", alt: "Coffee maker, kettle and toaster in the kitchen", label: "Coffee station" },
    ],
  },
  {
    id: "bathrooms",
    label: "Bathrooms",
    description: "The attached and shared bathrooms shown with their current fixtures.",
    photos: [
      { src: "/cottage/bedroom-1-bathroom.jpg", alt: "Bathroom attached to Bedroom 1", label: "Bedroom 1 bathroom" },
      { src: "/cottage/bedroom-2-3-bathroom.jpg", alt: "Hallway bathroom shared by Bedrooms 2 and 3", label: "Hallway bathroom" },
      { src: "/cottage/bedroom-4-bathroom.jpg", alt: "Bathroom attached to Bedroom 4", label: "Bedroom 4 bathroom" },
      { src: "/cottage/bedroom-5-bathroom.jpg", alt: "Bathroom attached to Bedroom 5", label: "Bedroom 5 bathroom" },
    ],
  },
  {
    id: "bedrooms",
    label: "Bedrooms",
    description: "Five private bedrooms, each furnished with a queen bed.",
    photos: [
      { src: "/cottage/bedroom-1.jpg", alt: "Bedroom 1 with a queen bed", label: "Bedroom 1" },
      { src: "/cottage/bedroom-2.jpg", alt: "Bedroom 2 with a queen bed", label: "Bedroom 2" },
      { src: "/cottage/bedroom-3.jpg", alt: "Bedroom 3 with a queen bed", label: "Bedroom 3" },
      { src: "/cottage/bedroom-4.jpg", alt: "Bedroom 4 with a queen bed", label: "Bedroom 4" },
      { src: "/cottage/bedroom-5.jpg", alt: "Bedroom 5 with a queen bed", label: "Bedroom 5" },
    ],
  },
];

const photos = galleryGroups.flatMap((group) => group.photos);

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

const cottageViews = [
  { src: "/cottage/front-of-house.jpg", alt: "Front exterior of Lakefront Serenity", label: "Front of the house" },
  { src: "/cottage/exterior.webp", alt: "Back exterior and waterfront lawn at Lakefront Serenity", label: "Back of the house" },
];

export function CottagePeek() {
  const [active, setActive] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % cottageViews.length), 5200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!imageRef.current || !window.anime || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.anime.animate(imageRef.current, {
      opacity: { from: 0.12 },
      scale: { from: 1.035 },
      duration: 900,
      ease: "out(4)",
    });
  }, [active]);

  const view = cottageViews[active];
  return (
    <figure className="property-peek">
      <img ref={imageRef} key={view.src} className="property-peek-image" src={view.src} alt={view.alt} />
      <div className="property-peek-controls" aria-label="Choose an exterior view">
        {cottageViews.map((item, index) => (
          <button key={item.src} type="button" className={index === active ? "active" : ""} onClick={() => setActive(index)} aria-label={`Show ${item.label}`} aria-pressed={index === active} />
        ))}
      </div>
      <figcaption>
        <span>Lakefront Serenity</span>
        <strong>{view.label}</strong>
      </figcaption>
    </figure>
  );
}

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
          if (!prefersReducedMotion && window.anime) {
            const motionItems = entry.target.querySelectorAll(
              ".section-heading > *, .activity-highlights > *, .key-amenities > *, .amenity-groups > *, .gallery-tabs > *, .gallery-grid > *, .bedroom-grid > *, .nearby-card, .reviews-grid > *, .booking-benefits > *",
            );
            if (motionItems.length) {
              window.anime.animate(motionItems, {
                opacity: { from: 0 },
                y: { from: 16 },
                delay: window.anime.stagger(45),
                duration: 620,
                ease: "out(3)",
              });
            }
          }
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
        <div><p className="eyebrow">What is included</p><h2>What is here when you arrive.</h2></div>
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
          <p className="eyebrow">Full amenity list</p>
          <h3>Check what is here before you pack.</h3>
          <p>Open any category for the complete list. Safety details and the exterior-camera disclosure also appear in the guest guide below.</p>
        </div>
        <div className="amenity-groups">
          {amenityGroups.map((group) => (
            <details key={group.title} open={group.title === "Scenic view" || group.title === "Outdoor"}>
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
  const [activeGroup, setActiveGroup] = useState(galleryGroups[0].id);
  const [selected, setSelected] = useState<number | null>(null);
  const currentGroup = galleryGroups.find((group) => group.id === activeGroup) ?? galleryGroups[0];

  useEffect(() => {
    if (!window.anime || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.anime.animate(".gallery-grid .gallery-photo", {
      opacity: { from: 0 },
      y: { from: 18 },
      delay: window.anime.stagger(55),
      duration: 640,
      ease: "out(3)",
    });
  }, [activeGroup]);

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
        <div><p className="eyebrow light">Room by room</p><h2>Walk through the cottage.</h2></div>
        <p>Choose an area to keep the tour short, then open any photograph for a closer look.</p>
      </div>
      <div className="gallery-tabs" role="tablist" aria-label="Cottage photo categories">
        {galleryGroups.map((group) => (
          <button
            key={group.id}
            type="button"
            role="tab"
            aria-selected={group.id === activeGroup}
            className={group.id === activeGroup ? "active" : ""}
            onClick={() => setActiveGroup(group.id)}
          >
            <span>{group.label}</span>
            <small>{group.photos.length}</small>
          </button>
        ))}
      </div>
      <div className="gallery-group-heading">
        <h3>{currentGroup.label}</h3>
        <p>{currentGroup.description}</p>
      </div>
      <div className="gallery-grid" data-count={currentGroup.photos.length}>
        {currentGroup.photos.map((photo, index) => (
          <button className={`gallery-photo photo-${index + 1}`} type="button" key={photo.src} onClick={() => setSelected(photos.indexOf(photo))} aria-label={`Open photo: ${photo.alt}`}>
            <img src={photo.src} alt={photo.alt} />
            <span>{photo.label}</span>
          </button>
        ))}
      </div>
      <div className="home-layout">
        <div className="home-layout-copy">
          <p className="eyebrow light">House layout preview</p>
          <h3>A room-by-room guide.</h3>
          <p>This shows the spaces included in the cottage, not exact dimensions. A measured floor plan can replace it after the house is surveyed.</p>
        </div>
        <div className="home-layout-plan" aria-label="Illustrative room guide, not to scale">
          <span className="layout-entry">Entrance</span>
          <span className="layout-living">Living room<br /><small>Pool table</small></span>
          <span className="layout-kitchen">Kitchen &amp; dining</span>
          <span className="layout-bed1">Bedroom 1</span>
          <span className="layout-bed2">Bedroom 2</span>
          <span className="layout-bed3">Bedroom 3</span>
          <span className="layout-bath">Bathrooms</span>
          <span className="layout-bed4">Bedroom 4</span>
          <span className="layout-bed5">Bedroom 5</span>
          <span className="layout-water">Waterfront lawn &amp; dock</span>
        </div>
      </div>
      {selected !== null && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Property photo viewer" onClick={() => setSelected(null)}>
          <button className="lightbox-close" type="button" onClick={() => setSelected(null)} aria-label="Close photo viewer">×</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected - 1 + photos.length) % photos.length); }} aria-label="Previous photo">←</button>
          <img src={photos[selected].src} alt={photos[selected].alt} onClick={(event) => event.stopPropagation()} />
          <button type="button" onClick={(event) => { event.stopPropagation(); setSelected((selected + 1) % photos.length); }} aria-label="Next photo">→</button>
          <p>{photos[selected].label} · {selected + 1} / {photos.length}</p>
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
        <div><p className="eyebrow">Five bedrooms</p><h2 id="bedrooms-title">Where everyone sleeps.</h2></div>
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
        <div><p className="eyebrow">Guest feedback</p><h2 id="reviews-title">What Airbnb guests mention.</h2></div>
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
