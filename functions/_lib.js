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
export function geoFrom(request) {
  const cf = request.cf || {};
  return {
    city: cf.city || null,
    region: cf.region || null,
    country: cf.country || null,
    timezone: cf.timezone || null,
    isp: cf.asOrganization || null,
    colo: cf.colo || null,
    botScore: cf.botManagement ? cf.botManagement.score : null,
    verifiedBot: cf.verifiedBotCategory || null
  };
}

export function placeString(g) {
  const parts = [g.city, g.region, g.country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Unknown location';
}

// Identify a visitor for de-duplication without storing their IP.
export async function visitorHash(request, salt) {
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
export async function notifyDiscord(env, { title, color, geo, fields, url }) {
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

  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'mridulnegi.dev', embeds: [embed] })
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
