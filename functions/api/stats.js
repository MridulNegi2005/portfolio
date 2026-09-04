// GET /api/stats?token=... — private summary of stored visits.
// Protected by STATS_TOKEN so the log is not public.
import { json, safeEqual } from '../_lib.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!env.STATS_TOKEN) return json({ ok: false, error: 'STATS_TOKEN not configured' }, 500);
  if (!safeEqual(token, env.STATS_TOKEN)) return json({ ok: false, error: 'unauthorized' }, 401);
  if (!env.VISITS) return json({ ok: false, error: 'VISITS KV namespace not bound' }, 500);

  const days = Math.min(Number(url.searchParams.get('days') || 14), 90);

  // Daily human / bot / resume counters
  const counts = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const [human, bot, resume] = await Promise.all([
      env.VISITS.get(`c:${d}:human`),
      env.VISITS.get(`c:${d}:bot`),
      env.VISITS.get(`c:${d}:resume`)
    ]);
    if (human || bot || resume) {
      counts[d] = { human: +human || 0, bot: +bot || 0, resume: +resume || 0 };
    }
  }

  // Recent individual visits
  const list = await env.VISITS.list({ prefix: 'v:', limit: 200 });
  const keys = list.keys.map(k => k.name).sort().reverse().slice(0, 60);
  const recent = [];
  for (const k of keys) {
    const raw = await env.VISITS.get(k);
    if (raw) { try { recent.push(JSON.parse(raw)); } catch { /* skip */ } }
  }

  const totals = Object.values(counts).reduce(
    (a, c) => ({ human: a.human + c.human, bot: a.bot + c.bot, resume: a.resume + c.resume }),
    { human: 0, bot: 0, resume: 0 }
  );
  const seen = totals.human + totals.bot;

  return json({
    ok: true,
    windowDays: days,
    totals,
    humanShare: seen ? `${Math.round(totals.human / seen * 100)}%` : 'n/a',
    byDay: counts,
    recent
  });
}
