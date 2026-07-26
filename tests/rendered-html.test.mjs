import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Lakefront Serenity guest experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Lakefront Serenity \| Kawartha Lakes<\/title>/i);
  assert.match(html, /Your escape<br\/>starts here\./i);
  assert.match(html, /aria-label="Skip to check availability and pricing"/i);
  assert.match(html, /Plan your waterfront stay\./i);
  assert.match(html, /href="\/privacy"/i);
  assert.match(html, /href="\/terms"/i);
  assert.doesNotMatch(html, /AIRBNB_ICAL_URL|STRIPE_SECRET_KEY/i);
  assert.doesNotMatch(html, /Your site is taking shape/i);
});

test("renders the legal pages", async () => {
  const [privacyResponse, termsResponse] = await Promise.all([
    render("/privacy"),
    render("/terms"),
  ]);

  assert.equal(privacyResponse.status, 200);
  assert.equal(termsResponse.status, 200);
  assert.match(await privacyResponse.text(), /<h1>Privacy\.<\/h1>/i);
  assert.match(await termsResponse.text(), /<h1>Terms\.<\/h1>/i);
});

test("keeps the full app and NAS mirror aligned on core booking policy", async () => {
  const [appPage, staticPage, staticPrivacy, staticTerms, readme] =
    await Promise.all([
      readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../static-site/index.html", import.meta.url), "utf8"),
      readFile(new URL("../static-site/privacy.html", import.meta.url), "utf8"),
      readFile(new URL("../static-site/terms.html", import.meta.url), "utf8"),
      readFile(new URL("../README.md", import.meta.url), "utf8"),
    ]);

  for (const homepage of [appPage, staticPage]) {
    assert.match(homepage, /Lakefront Serenity/);
    assert.match(homepage, /five bedrooms, six beds and three bathrooms/i);
    assert.match(homepage, /send the host a request without leaving the website/i);
    assert.match(homepage, /exact arrival address and access instructions/i);
  }

  assert.match(staticPage, /airbnb-availability\.json/);
  assert.match(staticPage, /href="\/privacy\.html"/);
  assert.match(staticPage, /href="\/terms\.html"/);
  assert.match(staticPrivacy, /does not run an account system/i);
  assert.match(staticPrivacy, /stay request is emailed through Gmail/i);
  assert.match(staticTerms, /accepts stay requests but does not create a confirmed reservation/i);
  assert.match(readme, /## Maintenance handoff/);
  assert.match(readme, /Airbnb is the current availability source of truth/i);
});

test("keeps the responsive contact, full calendar horizon and amenity grid on both site targets", async () => {
  const [bookingPanel, amenities, styles, staticPage, syncScript] = await Promise.all([
    readFile(new URL("../app/BookingPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PropertyExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../static-site/index.html", import.meta.url), "utf8"),
    readFile(new URL("../scripts/sync-airbnb-calendar.mjs", import.meta.url), "utf8"),
  ]);

  assert.match(bookingPanel, /availabilityThrough/);
  assert.match(bookingPanel, /Planning calendar shown through/);
  assert.match(bookingPanel, /aria-label="Previous month"/);
  assert.match(bookingPanel, /aria-label="Next month"/);
  assert.match(staticPage, /availabilityThrough/);
  assert.match(staticPage, /Planning calendar shown through/);
  assert.match(staticPage, /id="calendar-previous"/);
  assert.match(staticPage, /id="calendar-next"/);
  assert.match(syncScript, /availabilityThrough/);
  assert.match(styles, /\.amenity-groups\s*\{[^}]*grid-template-columns:\s*repeat\(4/);
  assert.match(styles, /\.contact-card a\s*\{[^}]*white-space:\s*nowrap/);
  assert.match(styles, /html\s*\{[^}]*overflow-x:\s*clip/);
  assert.match(styles, /body\s*\{[^}]*min-height:\s*100dvh/);
  assert.match(styles, /\.booking-request-dialog\s*\{[^}]*max-height:\s*calc\(100dvh - 56px\)/);
  assert.doesNotMatch(amenities, /<details[^>]*\sopen=/);
});

test("keeps pricing, nearby travel times and the in-site email request aligned", async () => {
  const [page, bookingPanel, requestRoute, staticPage, nasRequestServer] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/BookingPanel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/booking-request/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../static-site/index.html", import.meta.url), "utf8"),
    readFile(new URL("../scripts/booking-request-server.mjs", import.meta.url), "utf8"),
  ]);

  for (const homepage of [page, staticPage]) {
    assert.match(homepage, /Monday–Thursday/);
    assert.match(homepage, /\$550/);
    assert.match(homepage, /Friday–Sunday/);
    assert.match(homepage, /\$600/);
    assert.match(homepage, /Long weekends/);
    assert.match(homepage, /\$650/);
    assert.match(homepage, /Cleaning fee/);
    assert.match(homepage, /\$200/);
    assert.match(homepage, /About 4 minutes by car/);
    assert.match(homepage, /About 5 minutes by car/);
    assert.match(homepage, /About 25 minutes by car/);
    assert.match(homepage, /About 45 minutes by car/);
    assert.match(homepage, /About 50 minutes by car/);
    assert.match(homepage, /About 60 minutes by car/);
  }

  assert.match(bookingPanel, /fetch\("\/api\/booking-request"/);
  assert.match(staticPage, /fetch\('\/api\/booking-request'/);
  assert.match(requestRoute, /gmail\.googleapis\.com\/gmail\/v1\/users\/me\/messages\/send/);
  assert.match(nasRequestServer, /gmail\.googleapis\.com\/gmail\/v1\/users\/me\/messages\/send/);
});
