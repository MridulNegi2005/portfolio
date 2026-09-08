// Shared helpers for the visitor-signal endpoints.
// Runs on Cloudflare Pages Functions. No dependencies.

// Crawlers that identify themselves. Most AI crawlers do, and almost none run
// JavaScript, so this list is a second line of defence behind the client beacon.
const BOT_UA = [
  'gptbot', 'chatgpt-user', 'oai-searchbot', 'claudebot', 'claude-web', 'anthropic-ai',
  'perplexitybot', 'perplexity-user', 'ccbot', 'google-extended', 'googlebot', 'bingbot',
  'bytespider', 'amazonbot', 'applebot', 'meta-externalagent', 'facebookbot', 'facebookexternalhit',
  'cohere-ai', 'diffbot', 'imagesiftbot', 'omgilibot', 'youbot', 'timpibot', 'ahrefsbot',
  'semrushbot', 'mj12bot', 'dotbot', 'petalbot', 'yandexbot', 'baiduspider', 'duckduckbot',
  'slurp', 'linkedinbot', 'twitterbot', 'telegrambot', 'discordbot', 'whatsapp', 'slackbot',
  'bot', 'crawler', 'spider', 'scrapy', 'python-requests', 'go-http-client', 'okhttp',
  'curl/', 'wget/', 'headlesschrome', 'phantomjs', 'puppeteer', 'playwright', 'lighthouse'
];

export function classifyUA(ua) {
  const s = (ua || '').toLowerCase();
  if (!s) return { bot: true, why: 'empty-ua' };
  for (const sig of BOT_UA) {
    if (s.includes(sig)) return { bot: true, why: sig };
  }
  return { bot: false, why: null };
}

// Cloudflare derives these at the edge, so we never have to store an IP to know
// roughly where someone is.
// Network operators that only run crawlers, even when the visit otherwise
// looks human (JS ran, some scroll happened via a headless browser, etc).
const BOT_ISP = ['internet archive', 'wayback machine'];

// Hosting, VPS and proxy networks. A person reading a portfolio comes from a
// residential or corporate ISP, not from a rented server. Deliberately omits
// Cloudflare, Akamai, Fastly and Apple: those carry iCloud Private Relay
// traffic, which is real people on iPhones.
const DC_ISP = [
  'ovh', 'digitalocean', 'linode', 'hetzner', 'vultr', 'contabo', 'choopa',
  'leaseweb', 'm247', 'datacamp', 'colocrossing', 'code200', 'oxylabs',
  'brightdata', 'bright data', 'packethub', 'scaleway', 'upcloud', 'kamatera',
  'quadranet', 'psychz', 'zenlayer', 'servers.com', 'serverius', 'hostwinds',
  'ionos', 'aruba s.p.a.', 'hostinger', 'namecheap', 'godaddy',
  'amazon', 'aws', 'google cloud', 'azure', 'alibaba', 'tencent', 'oracle cloud',
  'digital ocean', 'hosting', 'datacenter', 'data center', 'colo', 'vps'
];

function matches(isp, list) {
  if (!isp) return false;
  const s = isp.toLowerCase();
  return list.some(x => s.includes(x));
}

export function geoFrom(request) {
  const cf = request.cf || {};
  const isp = cf.asOrganization || null;
  return {
    city: cf.city || null,
    region: cf.region || null,
    country: cf.country || null,
    timezone: cf.timezone || null,
    isp,
    colo: cf.colo || null,
    botScore: cf.botManagement ? cf.botManagement.score : null,
    verifiedBot: cf.verifiedBotCategory || null,
    knownBotIsp: matches(isp, BOT_ISP),
    datacenter: matches(isp, DC_ISP)
  };
}

export function placeString(g) {
  const parts = [g.city, g.region, g.country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Unknown location';
}

// Identify a visitor for de-duplication without storing their IP.
export async function visitorHash(request, salt) {
  // Without a secret salt a truncated hash of an IPv4 address is brute-forceable,
  // so the privacy claim must not depend on remembering the variable.
  if (!salt) console.warn('IP_SALT is not set: visitor hashes are weak until it is configured.');
  const ip = request.headers.get('cf-connecting-ip') || '';
  const ua = request.headers.get('user-agent') || '';
  const day = new Date().toISOString().slice(0, 10);
  const data = new TextEncoder().encode(`${salt || 'no-salt'}|${ip}|${ua}|${day}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].slice(0, 8)
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

export function flag(cc) {
  if (!cc || cc.length !== 2) return '🌍';
  return String.fromCodePoint(...[...cc.toUpperCase()].map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function fmtDuration(sec) {
  if (!sec || sec < 0) return '0s';
  if (sec < 60) return `${Math.round(sec)}s`;
  const m = Math.floor(sec / 60);
  return `${m}m ${Math.round(sec % 60)}s`;
}

// Post an embed to Discord. Never throws: a notification failure must not break
// the response the visitor is waiting on.
export async function notifyDiscord(env, { title, color, geo, fields, url, mention }) {
  const hook = env.DISCORD_WEBHOOK_URL;
  if (!hook) return { ok: false, skipped: 'no-webhook' };

  const embed = {
    title,
    color,
    url: url || undefined,
    fields: fields.filter(f => f && f.value),
    footer: { text: `${geo.colo ? 'via ' + geo.colo + ' · ' : ''}mridulnegi.dev` },
    timestamp: new Date().toISOString()
  };

  // Ping only the owner, and only via allowed_mentions — never let a
  // client-influenced field turn into an @everyone.
  const content = mention && env.DISCORD_USER_ID ? `<@${env.DISCORD_USER_ID}>` : undefined;

  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        username: 'mridulnegi.dev',
        content,
        allowed_mentions: content ? { users: [env.DISCORD_USER_ID] } : { parse: [] },
        embeds: [embed]
      })
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export { fmtDuration };

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });
}

// Only accept beacons that came from the site itself.
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return true; // sendBeacon may omit it on same-origin requests
  try {
    const o = new URL(origin).hostname;
    const h = new URL(request.url).hostname;
    return o === h || o.endsWith('.pages.dev') || h === 'localhost';
  } catch {
    return false;
  }
}

// Constant-time string comparison, so the stats token cannot be guessed by timing.
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Strip control characters and Discord markdown from anything a client sent.
export function clean(v, max = 120) {
  return String(v == null ? '' : v)
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[`*_~|@]/g, '')
    .slice(0, max);
}

// Short-lived log of rejected hits, so a "why didn't I get pinged" question
// can be answered from /api/stats instead of a visitor's dev tools.
export async function logReject(env, { kind, reasons, geo, ua, extra }) {
  if (!env.VISITS) return;
  const rec = {
    t: new Date().toISOString(),
    kind: kind || 'visit',
    reasons,
    place: placeString(geo),
    isp: geo.isp,
    ua: clean(ua, 160),
    ...(extra || {})
  };
  await env.VISITS.put(`rj:${rec.t}`, JSON.stringify(rec), {
    expirationTtl: 60 * 60 * 24 * 3 // 3 days is plenty for debugging
  });
}

// Cap how many alerts can fire in one hour, so the open beacon endpoint cannot
// be used to flood the Discord channel.
export async function underAlertCap(env, max = 60) {
  if (!env.VISITS) return true;
  const key = `n:${new Date().toISOString().slice(0, 13)}`;
  const n = Number(await env.VISITS.get(key)) || 0;
  if (n >= max) return false;
  await env.VISITS.put(key, String(n + 1), { expirationTtl: 7200 });
  return true;
}
