"use client";

import { FormEvent, useState } from "react";

export function BookingPanel({ variant }: { variant: "hero" | "footer" }) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const arrival = String(data.get("arrival") || "");
    const departure = String(data.get("departure") || "");

    if (!arrival || !departure) {
      setMessage("Choose both arrival and departure dates.");
      return;
    }
    if (departure <= arrival) {
      setMessage("Departure must be after arrival.");
      return;
    }
    setMessage("Dates captured. Live price and availability will appear here once the booking calendar is connected.");
  }

  return (
    <form className={`booking-panel ${variant}`} onSubmit={handleSubmit}>
      <label>
        <span>Arrival</span>
        <input name="arrival" type="date" aria-label="Arrival date" />
      </label>
      <label>
        <span>Departure</span>
        <input name="departure" type="date" aria-label="Departure date" />
      </label>
      <label>
        <span>Guests</span>
        <select name="guests" defaultValue="2" aria-label="Number of guests">
          {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>
          ))}
        </select>
      </label>
      <button type="submit">Check availability <span aria-hidden="true">→</span></button>
      <p className="booking-message" aria-live="polite">{message}</p>
    </form>
  );
}
