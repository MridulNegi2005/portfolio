// Shared gate for the resume file. Underscore prefix keeps this out of routing.
// Both /resume and the PDF path itself run it, so the redirect target cannot be
// used to skip the check.
import {
  classifyUA, geoFrom, placeString, visitorHash, flag, notifyDiscord, logReject
} from './_lib.js';

export const PDF = '/Mridul_Negi_Software_Developer_Resume.pdf';

// Returns a Response to send instead of the file, or null when the caller
// should serve it.
export async function gateResume(ctx) {
  const { request, env } = ctx;

  const ua = request.headers.get('user-agent') || '';
  const uaCheck = classifyUA(ua);
  const geo = geoFrom(request);

  const reasons = [];
  if (uaCheck.bot) reasons.push(`ua:${uaCheck.why}`);
  if (geo.verifiedBot) reasons.push(`verified-bot:${geo.verifiedBot}`);
  if (geo.knownBotIsp) reasons.push(`isp:${geo.isp}`);
  if (geo.datacenter) reasons.push(`datacenter:${geo.isp}`);

  const id = await visitorHash(request, env.IP_SALT);

  // A hosting network is only disqualifying on its own. If the same fingerprint
  // just read the site in a real browser, it is a person on a VPN, not a scraper.
  const networkOnly = reasons.length > 0
    && !uaCheck.bot && !geo.verifiedBot && !geo.knownBotIsp;
  const vouched = networkOnly && env.VISITS && await env.VISITS.get(`h:${id}`);

  if (reasons.length && !vouched) {
    ctx.waitUntil(logReject(env, {
      kind: 'resume', reasons, geo, ua, extra: { blocked: true }
    }));
    return new Response(
      'This file is not available to automated clients.\n' +
      'Open https://mridulnegi.dev and use the resume button.\n',
      { status: 403, headers: { 'content-type': 'text/plain; charset=utf-8' } }
    );
  }

  let notify = true;
  if (env.VISITS) {
    // Collapse double-clicks, range requests and the /resume redirect hop.
    const key = `rd:${id}`;
    if (await env.VISITS.get(key)) notify = false;
    else await env.VISITS.put(key, '1', { expirationTtl: 600 });

    await env.VISITS.put(`v:${new Date().toISOString()}:${id}:resume`, JSON.stringify({
      t: new Date().toISOString(), id, kind: 'resume',
      place: placeString(geo), country: geo.country, isp: geo.isp,
      vpn: !!vouched,
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
        { name: 'Came from', value: refOf(request), inline: true },
        vouched ? { name: 'Note', value: 'Hosting network, vouched by a real session' } : null
      ].filter(Boolean)
    }));
  }

  return null;
}

function refOf(request) {
  const r = request.headers.get('referer');
  if (!r) return 'Direct link';
  try {
    const h = new URL(r).hostname.replace(/^www\./, '');
    return h.includes('mridulnegi') ? 'From the site' : h;
  } catch { return 'Direct link'; }
}
