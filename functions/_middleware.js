// Guards the resume PDF itself. Without this, reading the Location header from
// /resume once is enough to fetch the file directly and skip every check.
import { PDF, gateResume } from './_resume.js';

export async function onRequest(ctx) {
  const { request, next } = ctx;
  if (new URL(request.url).pathname !== PDF) return next();

  const blocked = await gateResume(ctx);
  if (blocked) return blocked;
  return next();
}
