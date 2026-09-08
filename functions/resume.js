// GET /resume — the shareable URL. Runs the gate, then hands off to the file,
// which runs the gate again for anyone who skips this hop.
import { PDF, gateResume } from './_resume.js';

export async function onRequestGet(ctx) {
  const blocked = await gateResume(ctx);
  if (blocked) return blocked;

  const target = new URL(PDF, new URL(ctx.request.url).origin);
  return Response.redirect(target.toString(), 302);
}

// Some download managers probe with HEAD first; answer without alerting.
export async function onRequestHead({ request }) {
  const target = new URL(PDF, new URL(request.url).origin);
  return Response.redirect(target.toString(), 302);
}
