"use client";

import { FormEvent, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  dateKey,
  friendlyDate,
  formatMoney,
  fromKey,
  nightsBetween,
  standardStayEstimate,
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
  availabilityThrough,
  availabilitySyncedAt,
}: {
  variant: "hero" | "footer";
  pricing: BookingPricing;
  blockedDates: string[];
  availabilityStatus: "connected" | "not-configured" | "unavailable";
  availabilityThrough?: string | null;
  availabilitySyncedAt?: string | null;
}) {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const panelRef = useRef<HTMLDivElement>(null);
  const requestEmailRef = useRef<HTMLInputElement>(null);
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
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [requestState, setRequestState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [requestError, setRequestError] = useState("");
  const blockedDateSet = useMemo(() => new Set(blockedDates), [blockedDates]);
  const calendarHorizon = useMemo(() => {
    const fallback = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    if (availabilityStatus !== "connected" || !availabilityThrough) return fallback;
    const feedHorizon = fromKey(availabilityThrough);
    return Number.isNaN(feedHorizon.getTime()) || feedHorizon < today ? fallback : feedHorizon;
  }, [availabilityStatus, availabilityThrough, today]);
  const months = useMemo(() => {
    const firstMonth = startOfMonth(today);
    const lastMonth = startOfMonth(calendarHorizon);
    const monthCount = Math.max(
      1,
      (lastMonth.getFullYear() - firstMonth.getFullYear()) * 12
        + lastMonth.getMonth()
        - firstMonth.getMonth()
        + 1,
    );
    return Array.from({ length: monthCount }, (_, index) => addMonths(firstMonth, index));
  }, [calendarHorizon, today]);
  const calendarHorizonLabel = calendarHorizon.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const availabilityCheckedLabel = useMemo(() => {
    if (!availabilitySyncedAt) return "";
    const checkedAt = new Date(availabilitySyncedAt);
    if (Number.isNaN(checkedAt.getTime())) return "";
    return checkedAt.toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }, [availabilitySyncedAt]);

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

  useEffect(() => {
    if (!isRequestOpen) return;
    requestEmailRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && requestState !== "sending") setIsRequestOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isRequestOpen, requestState]);

  const nights = nightsBetween(arrival, departure);
  const hasPricing = pricing.mondayThursdayRateCents > 0 || pricing.cleaningFeeCents > 0;
  const nightlyRateLabel = pricing.mondayThursdayRateCents > 0
    ? `From ${formatMoney(pricing.mondayThursdayRateCents, pricing.currency)} / night`
    : "Rate to be confirmed";
  const estimatedTotal = standardStayEstimate(arrival, departure, pricing);
  const estimatedTotalLabel = hasPricing ? formatMoney(estimatedTotal, pricing.currency) : "Rate to be confirmed";
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
    setMessage(`${count} ${count === 1 ? "night" : "nights"} selected. Send the host a request without leaving the website.`);
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

  function openRequestForm() {
    if (!arrival || !departure) {
      setIsExpanded(true);
      setMessage("Choose both check-in and check-out dates before sending a request.");
      return;
    }
    setRequestState("idle");
    setRequestError("");
    setIsRequestOpen(true);
  }

  async function sendBookingRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!arrival || !departure) {
      setRequestState("error");
      setRequestError("Choose both check-in and check-out dates first.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    setRequestState("sending");
    setRequestError("");

    try {
      const response = await fetch("/api/booking-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arrival,
          departure,
          guests,
          email: guestEmail.trim(),
          message: guestMessage.trim(),
          website: String(formData.get("website") ?? ""),
        }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Your request could not be sent.");
      setRequestState("sent");
      setMessage("Request sent. Check your email for a copy.");
    } catch (error) {
      setRequestState("error");
      setRequestError(error instanceof Error ? error.message : "Your request could not be sent.");
    }
  }

  function dayClass(date: Date) {
    const key = dateKey(date);
    const previewEnd = arrival && !departure && hovered > arrival ? hovered : "";
    const rangeEnd = departure || previewEnd;
    return [
      "calendar-day",
      blockedDateSet.has(key) ? "booked" : "",
      date > calendarHorizon ? "outside-horizon" : "",
      key === arrival ? "range-start" : "",
      key === departure ? "range-end" : "",
      rangeEnd && key > arrival && key < rangeEnd ? "in-range" : "",
      previewEnd && key === previewEnd ? "range-preview-end" : "",
    ].filter(Boolean).join(" ");
  }

  const showExpandedCalendar = variant === "hero" || isExpanded;

  return (
    <>
    <div ref={panelRef} className={`booking-panel ${variant} ${showExpandedCalendar ? "calendar-open" : ""}`}>
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
              <div className="calendar-toolbar full-calendar-toolbar">
                <p><strong>{arrival && departure ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Choose your stay"}</strong><span>{arrival ? `${friendlyDate(arrival)}${departure ? ` — ${friendlyDate(departure)}` : " — select check-out"}` : "Select check-in, then check-out"}</span></p>
                <span className="calendar-horizon">Planning calendar shown through {calendarHorizonLabel}</span>
              </div>
              <p className={`calendar-availability-note ${availabilityStatus}`}>
                {availabilityStatus === "connected"
                  ? `Booked nights are shaded. Airbnb blocked dates were refreshed${availabilityCheckedLabel ? ` ${availabilityCheckedLabel}` : ""}. The planning calendar currently shows through ${calendarHorizonLabel}.`
                  : availabilityStatus === "unavailable"
                    ? `Availability could not be refreshed. The next 12 months are shown for planning; confirm dates with the host.`
                    : `Availability data is not connected yet. The next 12 months are shown for planning.`}
              </p>
              <div className="calendar-months" aria-label={`Calendar through ${calendarHorizonLabel}`}>
                {months.map((month) => (
                  <section className="calendar-month" key={dateKey(month)} aria-label={month.toLocaleDateString("en-CA", { month: "long", year: "numeric" })}>
                    <h3>{month.toLocaleDateString("en-CA", { month: "long", year: "numeric" })}</h3>
                    <div className="calendar-weekdays" aria-hidden="true">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
                    <div className="calendar-grid">
                      {monthCells(month).map((date, index) => date ? (
                        <button
                          key={dateKey(date)}
                          className={dayClass(date)}
                          type="button"
                          disabled={date < today || date > calendarHorizon || blockedDateSet.has(dateKey(date))}
                          onMouseEnter={() => { if (arrival && !departure && date <= calendarHorizon) setHovered(dateKey(date)); }}
                          onMouseLeave={() => setHovered("")}
                          onClick={() => chooseDate(date)}
                          aria-label={`${date.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}${date > calendarHorizon ? " — outside the current Airbnb calendar range" : blockedDateSet.has(dateKey(date)) ? " — unavailable" : ""}`}
                          aria-pressed={dateKey(date) === arrival || dateKey(date) === departure}
                        >
                          {date.getDate()}
                        </button>
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
                <span>Standard-rate estimate</span>
                <strong>{hasPricing && nights ? estimatedTotalLabel : nightlyRateLabel}</strong>
                <small>Includes the $200 cleaning fee. Long-weekend nights are confirmed at $650.</small>
              </div>
            </div>

            <button className="booking-submit" type="button" onClick={openRequestForm} disabled={!arrival || !departure}>
              Request these dates
              <span aria-hidden="true">→</span>
            </button>
            <p className="booking-message" aria-live="polite">{message}</p>
          </div>
        ) : null}
      </div>

    </div>

    {isRequestOpen ? (
      <div className="booking-request-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && requestState !== "sending") setIsRequestOpen(false); }}>
        <div className="booking-request-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-request-title" aria-describedby="booking-request-description">
          <button className="booking-request-close" type="button" onClick={() => setIsRequestOpen(false)} disabled={requestState === "sending"} aria-label="Close booking request">×</button>
          {requestState === "sent" ? (
            <div className="booking-request-success">
              <span aria-hidden="true">✓</span>
              <p className="eyebrow">Request sent</p>
              <h3 id="booking-request-title">Your dates are with the host.</h3>
              <p id="booking-request-description">A copy was sent to <strong>{guestEmail}</strong>. The host will confirm availability, the final rate and next steps.</p>
              <button type="button" onClick={() => setIsRequestOpen(false)}>Done</button>
            </div>
          ) : (
            <form onSubmit={sendBookingRequest}>
              <p className="eyebrow">Request to book</p>
              <h3 id="booking-request-title">Send your stay request.</h3>
              <p id="booking-request-description">This is not an instant booking. The host will review the dates and reply with availability, pricing and next steps.</p>
              <div className="booking-request-stay" aria-label="Requested stay">
                <div><span>Dates</span><strong>{friendlyDate(arrival)} → {friendlyDate(departure)}</strong></div>
                <div><span>Guests</span><strong>{guests} {guests === 1 ? "guest" : "guests"}</strong></div>
                <div><span>Standard estimate</span><strong>{estimatedTotalLabel}</strong><small>Long-weekend adjustment, if applicable, is confirmed by the host.</small></div>
              </div>
              <label className="booking-request-field">
                <span>Your email</span>
                <input ref={requestEmailRef} type="email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" required maxLength={254} />
                <small>We’ll send a copy of the request to this address.</small>
              </label>
              <label className="booking-request-field">
                <span>Anything else the host should know? <em>Optional</em></span>
                <textarea value={guestMessage} onChange={(event) => setGuestMessage(event.target.value)} placeholder="Questions, accessibility needs, occasion, or other helpful details" maxLength={1200} rows={5} />
              </label>
              <label className="booking-request-honeypot" aria-hidden="true">
                Website
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
              {requestState === "error" ? (
                <div className="booking-request-error" role="alert">
                  <strong>We couldn’t send the request.</strong>
                  <span>{requestError}</span>
                </div>
              ) : null}
              <div className="booking-request-actions">
                <button type="button" onClick={() => setIsRequestOpen(false)} disabled={requestState === "sending"}>Cancel</button>
                <button className="send" type="submit" disabled={requestState === "sending"}>
                  {requestState === "sending" ? "Sending…" : "Send request"}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    ) : null}
    </>
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

  const fromLabel = pricing.mondayThursdayRateCents > 0
    ? `From ${formatMoney(pricing.mondayThursdayRateCents, pricing.currency)} / night`
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
