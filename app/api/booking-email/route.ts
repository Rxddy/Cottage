type EmailBinding = {
  send: (message: {
    to: string | string[];
    from: { email: string; name?: string };
    replyTo?: string;
    subject: string;
    text: string;
    html?: string;
  }) => Promise<unknown>;
};

type RuntimeEnv = {
  EMAIL?: EmailBinding;
};

const SUPPORT_EMAIL = "lakefrontserenitysupport@gmail.com";
const emailPattern = /^\S+@\S+\.\S+$/;

function cleanText(value: unknown, max = 4000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function htmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": process.env.BOOKING_EMAIL_ALLOWED_ORIGIN ?? "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
    },
  });
}

async function getEmailBinding() {
  try {
    const { env } = await import("cloudflare:workers") as { env: RuntimeEnv };
    return env.EMAIL;
  } catch {
    return undefined;
  }
}

export function OPTIONS() {
  return jsonResponse({ ok: true });
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }

  const subject = cleanText(payload.subject, 180) || "Lakefront Serenity booking request";
  const body = cleanText(payload.body, 4000);
  const replyTo = cleanText(payload.replyTo, 254).toLowerCase();
  const website = cleanText(payload.website, 120);
  if (website) return jsonResponse({ error: "Unable to send this request." }, 400);
  if (body.length < 20) return jsonResponse({ error: "Add a message before sending." }, 400);
  if (replyTo && !emailPattern.test(replyTo)) return jsonResponse({ error: "Enter a valid reply-to email address." }, 400);

  const fromEmail = process.env.BOOKING_EMAIL_FROM?.trim();
  if (!fromEmail) {
    return jsonResponse({ error: "Email sending is not configured yet. Set BOOKING_EMAIL_FROM and the Cloudflare EMAIL binding." }, 503);
  }

  const email = await getEmailBinding();
  if (!email) {
    return jsonResponse({ error: "Email sending is not available in this environment yet." }, 503);
  }

  try {
    await email.send({
      to: SUPPORT_EMAIL,
      from: { email: fromEmail, name: process.env.BOOKING_EMAIL_FROM_NAME ?? "Lakefront Serenity" },
      replyTo: replyTo || undefined,
      subject,
      text: body,
      html: `<pre style="font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;white-space:pre-wrap">${htmlEscape(body)}</pre>`,
    });
  } catch (error) {
    console.error("Booking email send failed", error);
    return jsonResponse({ error: "The email could not be sent. Copy the draft and email the host directly." }, 502);
  }

  return jsonResponse({ status: "sent", message: "Email sent to Lakefront Serenity support." });
}
