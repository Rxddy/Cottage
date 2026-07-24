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
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/i);
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
    assert.match(homepage, /email the host to request your stay/i);
    assert.match(homepage, /exact arrival address and access instructions/i);
  }

  assert.match(staticPage, /airbnb-availability\.json/);
  assert.match(staticPage, /href="\/privacy\.html"/);
  assert.match(staticPage, /href="\/terms\.html"/);
  assert.match(staticPrivacy, /does not currently run an account system/i);
  assert.match(staticTerms, /does not currently accept a reservation or payment/i);
  assert.match(readme, /## AI handoff/);
  assert.match(readme, /Airbnb is the current availability source of truth/i);
});
