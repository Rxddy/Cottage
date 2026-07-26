#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const feedUrl = process.env.AIRBNB_ICAL_URL?.trim();
const outputPath = resolve(process.env.AIRBNB_AVAILABILITY_FILE ?? "static-site/airbnb-availability.json");

if (!feedUrl) {
  console.error("AIRBNB_ICAL_URL is not set. Export the calendar URL from Airbnb before running this sync.");
  process.exit(1);
}

function dateKey(value) {
  const digits = value.replace(/[^0-9]/g, "");
  return digits.length >= 8 ? `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}` : "";
}

function fromKey(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseIcalBookedDates(icalText) {
  const unfolded = icalText.replace(/\r?\n[ \t]/g, "");
  const booked = new Set();
  for (const event of unfolded.split("BEGIN:VEVENT").slice(1)) {
    if (/^STATUS:CANCELLED$/m.test(event)) continue;
    const startMatch = event.match(/^DTSTART[^:]*:(\d{8}(?:T\d{6}Z?)?)/m);
    const endMatch = event.match(/^DTEND[^:]*:(\d{8}(?:T\d{6}Z?)?)/m);
    if (!startMatch || !endMatch) continue;
    const startKey = dateKey(startMatch[1]);
    const endKey = dateKey(endMatch[1]);
    if (!startKey || !endKey || endKey <= startKey) continue;
    for (let cursor = fromKey(startKey), end = fromKey(endKey); cursor < end; cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1)) {
      booked.add(localDateKey(cursor));
    }
  }
  return [...booked].sort();
}

const response = await fetch(feedUrl, { headers: { Accept: "text/calendar,text/plain;q=0.9,*/*;q=0.8" } });
if (!response.ok) throw new Error(`Airbnb calendar request failed with ${response.status}`);
const blockedDates = parseIcalBookedDates(await response.text());
const now = new Date();
const availabilityThrough = localDateKey(new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()));
const payload = {
  blockedDates,
  availabilityThrough,
  syncedAt: new Date().toISOString(),
  source: "Airbnb iCalendar export",
};
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${blockedDates.length} booked nights to ${outputPath}`);
