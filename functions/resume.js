// GET /resume — logs the download, alerts, then serves the PDF.
// Routing downloads through here catches direct links and shared URLs too,
// not just clicks that happen on the page.
import {
  classifyUA, geoFrom, placeString, visitorHash, flag, notifyDiscord, logReject
} from './_lib.js';

const PDF = '/Mridul_Negi_Software_Developer_Resume.pdf';

export async function onRequestGet(ctx) {
  const { request, env, next } = ctx;
  const url = new URL(request.url);
  const target = new URL(PDF, url.origin);

  const ua = request.headers.get('user-agent') || '';
  const uaCheck = classifyUA(ua);
  const geo = geoFrom(request);
  const reasons = [];
  if (uaCheck.bot) reasons.push(`ua:${uaCheck.why}`);
  if (geo.verifiedBot) reasons.push(`verified-bot:${geo.verifiedBot}`);
  if (geo.knownBotIsp) reasons.push(`isp:${geo.isp}`);
  if (geo.datacenter) reasons.push(`datacenter:${geo.isp}`);

  if (reasons.length) {
    ctx.waitUntil(logReject(env, { kind: 'resume', reasons, geo, ua }));
  } else {
    const id = await visitorHash(request, env.IP_SALT);
    let notify = true;

    // Collapse double-clicks / range requests into one alert.
    if (env.VISITS) {
      const key = `rd:${id}`;
      if (await env.VISITS.get(key)) notify = false;
      else await env.VISITS.put(key, '1', { expirationTtl: 600 });

      await env.VISITS.put(`v:${new Date().toISOString()}:${id}:resume`, JSON.stringify({
        t: new Date().toISOString(), id, kind: 'resume',
        place: placeString(geo), country: geo.country, isp: geo.isp,
        ref: request.headers.get('referer') || null
      }), { expirationTtl: 60 * 60 * 24 * 90 });

      const ck = `c:${new Date().toISOString().slice(0, 10)}:resume`;
      const cur = Number(await env.VISITS.get(ck)) || 0;
      await env.VISITS.put(ck, String(cur + 1), { expirationTtl: 60 * 60 * 24 * 120 });
    }

    if (notify) {
      // Do not make the visitor wait on Discord before their file starts.
      ctx.waitUntil(notifyDiscord(env, {
        title: `${flag(geo.country)} Résumé downloaded — ${placeString(geo)}`,
        color: 0x8fb48a,
        geo,
        mention: true,
        fields: [
          { name: 'Network', value: geo.isp || 'Unknown', inline: true },
          { name: 'Country', value: geo.country || '—', inline: true },
          { name: 'Came from', value: refOf(request), inline: true }
        ]
      }));
    }
  }

  // 302 keeps the canonical PDF URL working and lets the browser download it.
  return Response.redirect(target.toString(), 302);
}

// Some download managers probe with HEAD first; answer without alerting.
export async function onRequestHead({ request }) {
  const url = new URL(request.url);
  return Response.redirect(new URL(PDF, url.origin).toString(), 302);
}

function refOf(request) {
  const r = request.headers.get('referer');
  if (!r) return 'Direct link';
  try {
    const h = new URL(r).hostname.replace(/^www\./, '');
    return h.includes('mridulnegi') ? 'From the site' : h;
  } catch { return 'Direct link'; }
}
