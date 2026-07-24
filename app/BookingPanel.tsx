"use client";

import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  dateKey,
  friendlyDate,
  formatMoney,
  nightsBetween,
  startOfMonth,
  type BookingPricing,
} from "./booking-utils";

type AnimeApi = {
  animate: (targets: string | Element | NodeListOf<Element>, options: Record<string, unknown>) => unknown;
  stagger: (value: number) => unknown;
};

declare global {
  interface Window { anime?: AnimeApi }
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthCells(month: Date) {
  const first = startOfMonth(month);
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: days }, (_, index) => new Date(first.getFullYear(), first.getMonth(), index + 1)),
  ];
}

export function BookingPanel({
  variant,
  pricing,
  blockedDates,
  availabilityStatus,
}: {
  variant: "hero" | "footer";
  pricing: BookingPricing;
  blockedDates: string[];
  availabilityStatus: "connected" | "not-configured" | "unavailable";
}) {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const panelRef = useRef<HTMLFormElement>(null);
  const [viewMonth, setViewMonth] = useState(startOfMonth(today));
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [hovered, setHovered] = useState("");
  const [guests, setGuests] = useState(2);
  const [message, setMessage] = useState(
    availabilityStatus === "connected"
      ? "Booked nights are shaded. Select an available check-in date."
      : "Select a check-in date, then choose your check-out date.",
  );
  const [isExpanded, setIsExpanded] = useState(variant === "hero");
  const blockedDateSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  useEffect(() => {
    if (variant !== "footer" || !panelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsExpanded(true);
        }
      },
      { threshold: 0.32, rootMargin: "0px 0px -14% 0px" },
    );

    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [variant]);

  useEffect(() => {
    if (variant !== "footer") return;

    const openCalendar = () => {
      setIsExpanded(true);
      window.requestAnimationFrame(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };

    window.addEventListener("open-booking-calendar", openCalendar);
    return () => window.removeEventListener("open-booking-calendar", openCalendar);
  }, [variant]);

  const nights = nightsBetween(arrival, departure);
  const hasPricing = pricing.nightlyRateCents > 0 || pricing.cleaningFeeCents > 0;
  const nightlyRateLabel = pricing.nightlyRateCents > 0
    ? `From ${formatMoney(pricing.nightlyRateCents, pricing.currency)} / night`
    : "Rate to be confirmed";
  const estimatedTotal = nights * pricing.nightlyRateCents + pricing.cleaningFeeCents;
  const estimatedTotalLabel = hasPricing ? formatMoney(estimatedTotal, pricing.currency) : "Rate to be confirmed";
  const bookingRequestHref = useMemo(() => {
    const dateLine = arrival && departure
      ? `${friendlyDate(arrival)} to ${friendlyDate(departure)} (${nights} ${nights === 1 ? "night" : "nights"})`
      : "the dates I selected on the availability calendar";
    const body = `Hello Lakefront Serenity Team,\n\nI would like to request availability for the following stay:\n\nDates: ${dateLine}\nGuests: ${guests}\n\nPlease confirm availability, the final rate, payment instructions and the next steps required to reserve the cottage.\n\nThank you.`;
    return `mailto:lakefrontserenitysupport@gmail.com?subject=Lakefront%20Serenity%20booking%20request&body=${encodeURIComponent(body)}`;
  }, [arrival, departure, guests, nights]);

  function chooseDate(date: Date) {
    const chosen = dateKey(date);
    if (blockedDateSet.has(chosen)) {
      setMessage("That night is already unavailable. Choose another date.");
      return;
    }
    if (chosen === arrival) {
      if (departure) {
        setDeparture("");
        setHovered("");
        setMessage("Check-in kept. Choose a new check-out date.");
      } else {
        setArrival("");
        setHovered("");
        setMessage("Check-in cleared. Choose a new check-in date.");
      }
      return;
    }
    if (chosen === departure) {
      setDeparture("");
      setHovered("");
      setMessage("Check-out cleared. Choose a new check-out date.");
      return;
    }
    if (!arrival || departure || chosen <= arrival) {
      setArrival(chosen);
      setDeparture("");
      setHovered("");
      if (variant === "footer") setIsExpanded(true);
      setMessage("Now choose your check-out date.");
      return;
    }
    const cursor = new Date(date);
    const arrivalDate = new Date(Number(arrival.slice(0, 4)), Number(arrival.slice(5, 7)) - 1, Number(arrival.slice(8, 10)));
    for (let day = new Date(arrivalDate); day < cursor; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
      if (blockedDateSet.has(dateKey(day))) {
        setMessage("That range includes an unavailable night. Choose different dates.");
        return;
      }
    }
    setDeparture(chosen);
    setHovered("");
    if (variant === "footer") setIsExpanded(true);
    const count = nightsBetween(arrival, chosen);
    setMessage(`${count} ${count === 1 ? "night" : "nights"} selected. Email the host to request these dates.`);
  }

  function repickArrival() {
    if (variant === "footer") setIsExpanded(true);
    setArrival("");
    setDeparture("");
    setHovered("");
    setMessage("Choose a new check-in date, then select check-out.");
  }

  function repickDeparture() {
    if (variant === "footer") setIsExpanded(true);
    if (!arrival) {
      setMessage("Choose a check-in date first.");
      return;
    }
    setDeparture("");
    setHovered("");
    setMessage("Choose a new check-out date.");
  }

  function dayClass(date: Date) {
    const key = dateKey(date);
    const previewEnd = arrival && !departure && hovered > arrival ? hovered : "";
    const rangeEnd = departure || previewEnd;
    return [
      "calendar-day",
      blockedDateSet.has(key) ? "booked" : "",
      key === arrival ? "range-start" : "",
      key === departure ? "range-end" : "",
      rangeEnd && key > arrival && key < rangeEnd ? "in-range" : "",
      previewEnd && key === previewEnd ? "range-preview-end" : "",
    ].filter(Boolean).join(" ");
  }

  const months = [viewMonth, addMonths(viewMonth, 1)];
  const canGoBack = viewMonth > startOfMonth(today);
  const showExpandedCalendar = variant === "hero" || isExpanded;

  return (
    <form ref={panelRef} className={`booking-panel ${variant} ${showExpandedCalendar ? "calendar-open" : ""}`} onSubmit={(event) => event.preventDefault()}>
      <div className="booking-selection" aria-label="Selected stay details">
        <button className={arrival ? "date-choice has-value" : "date-choice"} type="button" onClick={repickArrival} aria-label={arrival ? `Change check-in date, currently ${friendlyDate(arrival)}` : "Choose check-in date"}><span>Check in</span><strong>{friendlyDate(arrival)}</strong></button>
        <button className={departure ? "date-choice has-value" : "date-choice"} type="button" onClick={repickDeparture} aria-label={departure ? `Change check-out date, currently ${friendlyDate(departure)}` : "Choose check-out date"}><span>Check out</span><strong>{friendlyDate(departure)}</strong></button>
        <label className="guest-choice">
          <span>Guests</span>
          <strong>{guests} {guests === 1 ? "guest" : "guests"}</strong>
          <select name="guests" value={guests} onChange={(event) => setGuests(Number(event.target.value))} aria-label="Number of guests">
            {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}
          </select>
        </label>
      </div>

      {variant === "footer" && !showExpandedCalendar ? (
        <div className="booking-compact-card">
          <div>
            <p className="eyebrow">Booking details</p>
            <h3>Open the full calendar.</h3>
            <p>Skip the photo sections and jump straight to availability.</p>
          </div>
          <div className="booking-compact-meta">
            <span>{availabilityStatus === "connected" ? "Availability synced" : "Availability pending"}</span>
            <strong>{hasPricing && nights ? estimatedTotalLabel : nightlyRateLabel}</strong>
          </div>
          <button className="booking-expand" type="button" onClick={() => setIsExpanded(true)}>
            <span className="calendar-button-icon" aria-hidden="true" />
            <span>Open calendar &amp; see price</span>
          </button>
        </div>
      ) : null}

      <div className={`booking-calendar-shell ${showExpandedCalendar ? "is-expanded" : ""}`}>
        {showExpandedCalendar ? (
          <div className="booking-calendar-inner">
            <div className="range-calendar" aria-label="Choose check-in and check-out dates">
              <div className="calendar-toolbar">
                <button type="button" className="calendar-nav" onClick={() => setViewMonth(addMonths(viewMonth, -1))} disabled={!canGoBack} aria-label="Previous month">←</button>
                <p><strong>{arrival && departure ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Choose your stay"}</strong><span>{arrival ? `${friendlyDate(arrival)}${departure ? ` — ${friendlyDate(departure)}` : " — select check-out"}` : "Select check-in, then check-out"}</span></p>
                <button type="button" className="calendar-nav" onClick={() => setViewMonth(addMonths(viewMonth, 1))} aria-label="Next month">→</button>
              </div>
              <p className={`calendar-availability-note ${availabilityStatus}`}>
                {availabilityStatus === "connected"
                  ? "Booked nights are shaded. This calendar is read-only."
                  : availabilityStatus === "unavailable"
                    ? "Availability could not be refreshed. Try again shortly."
                    : "Availability data is not connected yet."}
              </p>
              <div className="calendar-months">
                {months.map((month) => (
                  <section className="calendar-month" key={dateKey(month)} aria-label={month.toLocaleDateString("en-CA", { month: "long", year: "numeric" })}>
                    <h3>{month.toLocaleDateString("en-CA", { month: "long", year: "numeric" })}</h3>
                    <div className="calendar-weekdays" aria-hidden="true">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
                    <div className="calendar-grid">
                      {monthCells(month).map((date, index) => date ? (
                        <button key={dateKey(date)} className={dayClass(date)} type="button" disabled={date < today || blockedDateSet.has(dateKey(date))} onMouseEnter={() => setHovered(dateKey(date))} onMouseLeave={() => setHovered("")} onClick={() => chooseDate(date)} aria-label={`${date.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}${blockedDateSet.has(dateKey(date)) ? " — unavailable" : ""}`} aria-pressed={dateKey(date) === arrival || dateKey(date) === departure}>{date.getDate()}</button>
                      ) : <span className="calendar-empty" key={`empty-${index}`} />)}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <div className="booking-summary-row" aria-label="Booking summary">
              <div>
                <span>Dates selected</span>
                <strong>{arrival && departure ? `${friendlyDate(arrival)} → ${friendlyDate(departure)}` : "Pick a range"}</strong>
              </div>
              <div>
                <span>Estimated total</span>
                <strong>{hasPricing && nights ? estimatedTotalLabel : nightlyRateLabel}</strong>
              </div>
            </div>

            <a className="booking-submit" href={bookingRequestHref}>
              Request these dates
              <span aria-hidden="true">→</span>
            </a>
            <p className="booking-message" aria-live="polite">{message}</p>
          </div>
        ) : null}
      </div>

      <input name="arrival" type="hidden" value={arrival} />
      <input name="departure" type="hidden" value={departure} />
    </form>
  );
}

export function BookingDock({ pricing }: { pricing: BookingPricing }) {
  const [isBookSectionVisible, setIsBookSectionVisible] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    const target = document.getElementById("book");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsBookSectionVisible(entry.isIntersecting),
      { threshold: 0.24, rootMargin: "0px 0px -18% 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const fromLabel = pricing.nightlyRateCents > 0
    ? `From ${formatMoney(pricing.nightlyRateCents, pricing.currency)} / night`
    : "See dates and pricing";

  function openBooking(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setIsOpening(true);
    window.dispatchEvent(new Event("open-booking-calendar"));
    window.setTimeout(() => setIsOpening(false), 760);
  }

  return (
    <a
      className={`booking-dock${isOpening ? " is-opening" : ""}${isBookSectionVisible ? " is-booking-visible" : ""}`}
      href="#book"
      onClick={openBooking}
      aria-label="Skip to check availability and pricing"
      tabIndex={isBookSectionVisible ? -1 : 0}
    >
      <span className="booking-dock-icon" aria-hidden="true"><span /></span>
      <span className="booking-dock-copy">
        <span className="booking-dock-label">Skip ahead</span>
        <strong>Check availability &amp; pricing</strong>
        <small>Choose dates · {fromLabel}</small>
      </span>
      <span className="booking-dock-arrow" aria-hidden="true">↘</span>
    </a>
  );
}
