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
  if (!process.env.ADOBE_SIGN_ACCESS_TOKEN || !process.env.ADOBE_SIGN_LIBRARY_DOCUMENT_ID) {
    return Response.json({ error: "Adobe Acrobat Sign is not configured yet. Set ADOBE_SIGN_ACCESS_TOKEN and ADOBE_SIGN_LIBRARY_DOCUMENT_ID." }, { status: 503 });
  }

  try {
    const db = await getDb();
    const [booking] = await db.select().from(bookingRequests).where(eq(bookingRequests.id, id)).limit(1);
    if (!booking) return Response.json({ error: "Booking request not found." }, { status: 404 });
    if (booking.status !== "approved") return Response.json({ error: "Approve the booking request before sending the agreement." }, { status: 409 });

    const base = (process.env.ADOBE_SIGN_API_BASE ?? "https://api.adobesign.com/api/rest/v6").replace(/\/$/, "");
    const response = await fetch(`${base}/agreements`, {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.ADOBE_SIGN_ACCESS_TOKEN}`, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        name: `Lakefront Serenity rental agreement ${booking.id}`,
        message: "Please review and sign the Lakefront Serenity rental agreement. The quote is a snapshot and the reservation is not confirmed until all required steps are complete.",
        fileInfos: [{ libraryDocumentId: process.env.ADOBE_SIGN_LIBRARY_DOCUMENT_ID }],
        signatureType: "ESIGN",
        state: "IN_PROCESS",
        participantSetsInfo: [{ memberInfos: [{ email: booking.email }], order: 1, role: "SIGNER" }],
      }),
    });
    const result = await response.json().catch(() => ({})) as { id?: string; message?: string };
    if (!response.ok || !result.id) return Response.json({ error: result.message || "Adobe Acrobat Sign could not create the agreement." }, { status: 502 });
    await db.update(bookingRequests).set({ agreementStatus: "sent", agreementProvider: "adobe_acrobat_sign", agreementProviderId: result.id, updatedAt: new Date().toISOString() }).where(eq(bookingRequests.id, id));
    return Response.json({ id, agreementId: result.id, status: "sent" });
  } catch (error) {
    console.error("Adobe Acrobat Sign agreement creation failed", error);
    return Response.json({ error: "Agreement creation is unavailable." }, { status: 503 });
  }
}
