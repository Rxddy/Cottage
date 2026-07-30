/**
 * Kept as a compatibility response for old clients. Stripe payments are not
 * enabled for Lakefront Serenity; approved guests pay by Interac e-Transfer.
 */
export async function POST() {
  return Response.json(
    { error: "Stripe checkout is disabled. Use the booking request flow and Interac e-Transfer." },
    { status: 410 },
  );
}
