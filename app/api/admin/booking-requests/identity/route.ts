import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { bookingRequests } from "@/db/schema";

function authorized(request: Request) {
  const expected = process.env.BOOKING_ADMIN_TOKEN;
  return Boolean(expected && request.headers.get("authorization") === `Bearer ${expected}`);
}

export async function POST(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Admin authorization required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { requestId?: unknown } | null;
  const id = typeof body?.requestId === "string" ? body.requestId.trim() : "";
  if (!id) return Response.json({ error: "requestId is required." }, { status: 400 });
  if (!process.env.PERSONA_API_KEY || !process.env.PERSONA_TEMPLATE_ID) {
    return Response.json({ error: "Persona is not configured yet. Set PERSONA_API_KEY and PERSONA_TEMPLATE_ID." }, { status: 503 });
  }

  try {
    const db = await getDb();
    const [booking] = await db.select().from(bookingRequests).where(eq(bookingRequests.id, id)).limit(1);
    if (!booking) return Response.json({ error: "Booking request not found." }, { status: 404 });
    if (booking.status !== "approved_for_identity") return Response.json({ error: "Approve the request for identity verification first." }, { status: 409 });

    const base = (process.env.PERSONA_API_BASE ?? "https://withpersona.com/api/v1").replace(/\/$/, "");
    const response = await fetch(`${base}/inquiries`, {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.PERSONA_API_KEY}`, "content-type": "application/vnd.api+json", accept: "application/vnd.api+json" },
      body: JSON.stringify({ data: { type: "inquiry", attributes: { "inquiry-template-id": process.env.PERSONA_TEMPLATE_ID, "reference-id": booking.id, fields: { name: { value: booking.legalName }, email: { value: booking.email } } } } }),
    });
    const result = await response.json().catch(() => ({})) as { data?: { id?: string }; errors?: Array<{ detail?: string }> };
    const inquiryId = result.data?.id;
    if (!response.ok || !inquiryId) return Response.json({ error: result.errors?.[0]?.detail || "Persona could not create an inquiry." }, { status: 502 });
    await db.update(bookingRequests).set({ identityStatus: "pending", identityProvider: "persona", identitySessionId: inquiryId, updatedAt: new Date().toISOString() }).where(eq(bookingRequests.id, id));
    return Response.json({ id, inquiryId, status: "pending" });
  } catch (error) {
    console.error("Persona inquiry creation failed", error);
    return Response.json({ error: "Identity verification is unavailable." }, { status: 503 });
  }
}
