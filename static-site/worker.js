const securityHeaders = {
  "content-security-policy": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
};

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(securityHeaders)) headers.set(key, value);
    if (new URL(request.url).pathname === "/") headers.set("cache-control", "public, max-age=300");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
