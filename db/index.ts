import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type RuntimeEnv = { DB?: unknown };

export async function getDb() {
  // Keep the Cloudflare-only module out of Node's test/import path. Vinext
  // supplies this module in the worker runtime, while local tests can still
  // render the public pages without a D1 binding.
  const { env } = await import("cloudflare:workers") as { env: RuntimeEnv };
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB as never, { schema });
}
