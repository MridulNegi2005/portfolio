// POST /api/visit — called by the page only after a visitor shows human behaviour.
import {
  classifyUA, geoFrom, placeString, visitorHash, flag,
  notifyDiscord, fmtDuration, json, sameOrigin, clean, underAlertCap
} from '../_lib.js';

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) return json({ ok: false, reason: 'bad-origin' }, 403);

  let body = {};
  try { body = await request.json(); } catch { /* empty body is fine */ }

  const ua = request.headers.get('user-agent') || '';
  const uaCheck = classifyUA(ua);
  const geo = geoFrom(request);

  // ---- filter: anything that is not plausibly a person -------------------
  const engaged = Number(body.dwellMs || 0) >= 6000
    && (Number(body.maxScroll || 0) >= 10 || Number(body.moves || 0) >= 4);

  const reasons = [];
  if (uaCheck.bot) reasons.push(`ua:${uaCheck.why}`);
  if (body.webdriver) reasons.push('webdriver');
  if (!engaged) reasons.push('low-engagement');
  if (geo.verifiedBot) reasons.push(`verified-bot:${geo.verifiedBot}`);
  if (typeof geo.botScore === 'number' && geo.botScore <= 29) reasons.push(`cf-score:${geo.botScore}`);

  if (reasons.length) {
    // Counted, never notified. Lets /api/stats show the human-vs-bot split.
    await bump(env, 'bot');
    return json({ ok: true, counted: 'bot', reasons });
  }

  // ---- de-duplicate: one alert per visitor per day ------------------------
  const id = await visitorHash(request, env.IP_SALT);
  let firstToday = true;
  if (env.VISITS) {
    const seen = await env.VISITS.get(`d:${id}`);
    if (seen) firstToday = false;
    else await env.VISITS.put(`d:${id}`, '1', { expirationTtl: 86400 });
  }

  const record = {
    t: new Date().toISOString(),
    id,
    place: placeString(geo),
    country: geo.country,
    isp: geo.isp,
    tz: geo.timezone,
    path: clean(body.path || '/', 120),
    ref: clean(body.ref, 200) || null,
    dwellSec: Math.round(Number(body.dwellMs || 0) / 1000),
    scroll: Math.round(Number(body.maxScroll || 0)),
    sections: Array.isArray(body.sections) ? body.sections.slice(0, 12).map(x => clean(x, 24)) : [],
    device: clean(body.device, 40),
    repeat: !firstToday
  };

  await bump(env, 'human');
  if (env.VISITS) {
    await env.VISITS.put(`v:${record.t}:${id}`, JSON.stringify(record), {
      expirationTtl: 60 * 60 * 24 * 90 // keep 90 days
    });
  }

  // Only alert on the first hit of the day from a given visitor.
  if (firstToday && await underAlertCap(env)) {
    await notifyDiscord(env, {
      title: `${flag(geo.country)} Real visitor — ${record.place}`,
      color: 0xc99a52,
      geo,
      fields: [
        { name: 'Network', value: geo.isp || 'Unknown', inline: true },
        { name: 'Local time', value: localTime(geo.timezone), inline: true },
        { name: 'On page', value: fmtDuration(record.dwellSec), inline: true },
        { name: 'Scrolled', value: `${record.scroll}%`, inline: true },
        { name: 'Device', value: record.device || 'Unknown', inline: true },
        { name: 'Came from', value: prettyRef(record.ref), inline: true },
        { name: 'Sections read', value: record.sections.length ? record.sections.join(' → ') : '—' }
      ]
    });
  }

  return json({ ok: true, counted: 'human', notified: firstToday });
}

function localTime(tz) {
  try {
    return new Date().toLocaleTimeString('en-GB', {
      timeZone: tz || 'UTC', hour: '2-digit', minute: '2-digit'
    }) + (tz ? '' : ' UTC');
  } catch { return '—'; }
}

function prettyRef(ref) {
  if (!ref) return 'Direct / unknown';
  try {
    const h = new URL(ref).hostname.replace(/^www\./, '');
    if (h.includes('linkedin')) return '💼 LinkedIn';
    if (h.includes('github')) return '🐙 GitHub';
    if (h.includes('google')) return '🔍 Google';
    return h;
  } catch { return ref.slice(0, 60); }
}

async function bump(env, kind) {
  if (!env.VISITS) return;
  const key = `c:${new Date().toISOString().slice(0, 10)}:${kind}`;
  const cur = Number(await env.VISITS.get(key)) || 0;
  await env.VISITS.put(key, String(cur + 1), { expirationTtl: 60 * 60 * 24 * 120 });
}
