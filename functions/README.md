# Visitor signal — setup

Three Cloudflare Pages Functions separate real people from AI crawlers, alert Discord
instantly, and keep a 90-day log.

| Route | Method | Purpose |
|---|---|---|
| `/api/visit` | POST | Beacon from the page. Filters bots, alerts, stores the visit. |
| `/resume` | GET | Logs the download, alerts, then redirects to the PDF. |
| `/api/stats` | GET | Private summary. Requires `?token=`. |

## How a real person is identified

A visit must pass every layer before it alerts:

1. **JavaScript must run.** The beacon is client-side. Almost no AI crawler executes JS,
   so this alone removes most of the traffic inflating the Cloudflare graph.
2. **The session must look human.** At least 6 seconds on the page, plus either 10%
   scroll depth or 4 pointer/touch events.
3. **The user agent must not be a known crawler.** 50+ signatures, including GPTBot,
   ClaudeBot, PerplexityBot, CCBot, Bytespider, Amazonbot and meta-externalagent.
4. **`navigator.webdriver` must be false.** Removes Selenium and Playwright.
5. **Cloudflare's own verdict.** Rejects a verified bot category, a known crawler
   network operator (for example Internet Archive), or a bot score of 29 or lower
   when Cloudflare provides one.

Anything rejected is still counted, so `/api/stats` shows the human-to-bot ratio.
Only the rejects are silent.

## Location without storing an IP

Cloudflare resolves the location at the edge, so the raw IP is never written anywhere.
The functions read `request.cf` for city, region, country, timezone and network operator.

For de-duplication the IP is combined with the user agent, the date and `IP_SALT`, then
hashed with SHA-256 and truncated. The result cannot be reversed to an IP, and it changes
every day.

## Setup

### 1. Discord webhook
In Discord: **Server Settings → Integrations → Webhooks → New Webhook**. Choose the
channel, then **Copy Webhook URL**. A private server with one channel works well.

### 2. KV namespace
Cloudflare dashboard → **Workers & Pages → KV → Create namespace**, named `portfolio-visits`.

Then open the Pages project → **Settings → Functions → KV namespace bindings → Add**:

| Variable name | Value |
|---|---|
| `VISITS` | `portfolio-visits` |

The variable name must be exactly `VISITS`.

### 3. Environment variables
Pages project → **Settings → Environment variables → Production**. Add all three as
**Secret** (encrypted), not plaintext:

| Name | Value |
|---|---|
| `DISCORD_WEBHOOK_URL` | the webhook URL from step 1 |
| `STATS_TOKEN` | any long random string you invent |
| `IP_SALT` | any long random string you invent |
| `DISCORD_USER_ID` | your Discord user ID, to get pinged (optional) |

`DISCORD_USER_ID` is not a secret, but treat it the same way for consistency.
Turn on Developer Mode in Discord (**Settings → Advanced**), then right-click
your name and **Copy User ID**. Without this variable, alerts still post, just
without the ping.

Generate the two random strings with:

```bash
openssl rand -hex 32
```

### 4. Deploy and verify
Push to `main`. Cloudflare builds Functions automatically; no build command is needed.

After the deploy finishes, confirm in this order:

```bash
curl -sSI https://mridulnegi.dev/resume | head -3
```

Expect `302` pointing at the PDF. **Check this first** — the site's résumé buttons now
point at `/resume`. If Functions failed to deploy, `_redirects` still serves the PDF, so
the button keeps working either way.

Then load the site on your phone, scroll, and wait about ten seconds. A Discord message
should arrive. Finally:

```bash
curl -sS "https://mridulnegi.dev/api/stats?token=YOUR_STATS_TOKEN"
```

## Reading the numbers

`/api/stats` returns daily counters and the last 60 visits:

```json
{
  "totals": { "human": 12, "bot": 431, "resume": 3 },
  "humanShare": "3%",
  "byDay": { "2026-08-18": { "human": 4, "bot": 96, "resume": 1 } }
}
```

`humanShare` is the number you wanted: the share of Cloudflare's traffic graph that is
actually a person.

## Alert behaviour

- One alert per visitor per day. A refresh does not alert twice.
- Résumé downloads alert separately, collapsed over 10 minutes to absorb double-clicks.
- A Discord outage never blocks the visitor: the résumé redirect is sent first and the
  notification is delivered with `waitUntil`.
- If `DISCORD_WEBHOOK_URL` is missing the functions still log; they simply do not alert.
- If the `VISITS` binding is missing the functions still alert; they simply do not store.

## Privacy

The site records approximate location, network operator and on-page behaviour, and keeps
it for 90 days. No raw IP address is stored, and there are no third-party trackers or
cookies for analytics. If you want to be explicit about this, add a line to the footer
linking to a short privacy note. Several jurisdictions expect it, and it costs nothing.

## Rollback

Delete the `functions/` directory. `_redirects` keeps `/resume` working, and the beacon
in `index.html` fails silently when the endpoint is absent.
