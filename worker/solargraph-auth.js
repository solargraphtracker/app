// Solargraph Tracker: Google sign-in helper (Cloudflare Worker)
// Swaps Google sign-in codes for long-lasting keys. It never sees cameras or photos.
// Needs one secret in Cloudflare: GOOGLE_CLIENT_SECRET

const CLIENT_ID = "393643903194-6io671jsa5061jpc4iq6mqq44ru1plf6.apps.googleusercontent.com";
const ALLOWED = ["https://solargraphtracker.github.io"];

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const ok = ALLOWED.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": ok ? origin : ALLOWED[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST" || !ok) return new Response("Forbidden", { status: 403, headers: cors });

    let body = {};
    try { body = await req.json(); } catch (e) { return new Response("Bad request", { status: 400, headers: cors }); }
    const path = new URL(req.url).pathname;
    const p = new URLSearchParams({ client_id: CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET || "" });

    if (path === "/exchange" && body.code) {
      p.set("grant_type", "authorization_code"); p.set("code", body.code); p.set("redirect_uri", "postmessage");
    } else if (path === "/refresh" && body.refresh_token) {
      p.set("grant_type", "refresh_token"); p.set("refresh_token", body.refresh_token);
    } else if (path === "/revoke" && body.token) {
      const r = await fetch("https://oauth2.googleapis.com/revoke?token=" + encodeURIComponent(body.token), { method: "POST" });
      return new Response("{}", { status: r.ok ? 200 : 400, headers: { ...cors, "Content-Type": "application/json" } });
    } else {
      return new Response("Not found", { status: 404, headers: cors });
    }
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: p
    });
    return new Response(await r.text(), { status: r.status, headers: { ...cors, "Content-Type": "application/json" } });
  }
};
