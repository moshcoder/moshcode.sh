// Server-side rendering for moshcode.sh. Every page is a string — no client
// framework, no hydration, one stylesheet and ~1KB of JS for the copy buttons.

import { SITE, NAV, ENGINES, STATS, SECTIONS, FOOTER_LINKS } from './content.mjs';

// head/foot/terminal/installBox/esc are exported for src/blog.mjs, which builds
// the blog pages out of the same chrome rather than a second set of markup.
export const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

/** A terminal pane. `raw` is verbatim output; `lines` is a prompt-aware script. */
export function terminal(t) {
  const body = t.raw
    ? esc(t.raw)
    : t.lines
        .map((l) => {
          if (l.p) return `<span class="tl-p">$</span> <span class="tl-cmd">${esc(l.text)}</span>`;
          const cls = l.dim ? ' class="tl-dim"' : l.warn ? ' class="tl-warn"' : '';
          return l.text ? `<span${cls}>${esc(l.text)}</span>` : '';
        })
        .join('\n');
  return `<div class="term${t.wide ? ' term-wide' : ''}">
  <div class="term-bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="term-title">${esc(t.title)}</span></div>
  <pre class="term-body${t.lang ? ` lang-${esc(t.lang)}` : ''}"><code>${body}</code></pre>
</div>`;
}

function section(s, i) {
  return `<section class="band${i % 2 ? ' band-alt' : ''}" id="${esc(s.id)}">
  <div class="wrap band-grid${s.terminal?.wide ? ' band-stack' : ''}">
    <div class="band-copy">
      <div class="band-head">
        <p class="kicker">${esc(s.kicker)}</p>
        <h2>${esc(s.title)}</h2>
      </div>
      <div class="band-body">
        ${s.body.map((p) => `<p>${p}</p>`).join('\n        ')}
      </div>
    </div>
    <div class="band-term">${terminal(s.terminal)}</div>
  </div>
</section>`;
}

export function head({ title, description, path, extraHead = '' }) {
  const canonical = `https://${SITE.domain}${path}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="theme-color" content="#0a0a0a">
<meta property="og:type" content="website">
<meta property="og:site_name" content="moshcode">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="https://${SITE.domain}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="https://${SITE.domain}/og.png">
<link rel="icon" href="/mark.svg" type="image/svg+xml">
<link rel="stylesheet" href="/tokens.css">
<link rel="stylesheet" href="/style.css">
${extraHead}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="nav">
  <div class="wrap nav-grid">
    <a class="brand" href="/"><span class="brand-mark" aria-hidden="true">▚</span> moshcode</a>
    <nav aria-label="Primary">${NAV.map(
      (n) =>
        `<a href="${esc(n.href)}"${n.external ? ' rel="noopener"' : ''}>${esc(n.label)}${n.external ? '&nbsp;↗' : ''}</a>`,
    ).join('')}</nav>
    <a class="nav-cta" href="${esc(SITE.repo)}">GitHub&nbsp;↗</a>
  </div>
</header>
<main id="main">`;
}

export function foot() {
  return `</main>
<footer class="foot">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <p class="brand"><span class="brand-mark" aria-hidden="true">▚</span> moshcode</p>
      <p class="creed">${esc(SITE.creed)}</p>
      <p class="muted">MIT licensed. Built by <a href="https://github.com/moshcoder">moshcoder</a>.</p>
    </div>
    ${FOOTER_LINKS.map(
      (col) => `<div class="foot-col">
      <p class="foot-head">${esc(col.heading)}</p>
      ${col.links.map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join('\n      ')}
    </div>`,
    ).join('\n    ')}
  </div>
</footer>
<script src="/app.js" defer></script>
</body>
</html>`;
}

export function installBox(extraClass = '') {
  return `<div class="install ${extraClass}">
  <code id="install-cmd">${esc(SITE.install)}</code>
  <button class="copy" data-copy="#install-cmd" type="button">copy</button>
</div>`;
}

export function renderHome() {
  return `${head({
    title: 'moshcode — a metal wrapper CLI for agentic coding',
    description: SITE.description,
    path: '/',
  })}
<section class="hero">
  <div class="wrap">
    <p class="kicker">${esc(SITE.creed)}</p>
    <h1>Drive every coding agent<br><span class="lime">from one CLI.</span></h1>
    <p class="lede">${esc(SITE.description)}</p>
    ${installBox('install-hero')}
    <p class="muted small">Zero-dependency ESM — all it needs is Node.js 18+. Later: <code>… | sh -s -- update</code> to upgrade, <code>… | sh -s -- remove</code> to uninstall.</p>
    <ul class="stats">
      ${STATS.map((s) => `<li><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></li>`).join('\n      ')}
    </ul>
  </div>
</section>

<section class="strip">
  <div class="wrap">
    <p class="strip-label">installs and drives</p>
    <ul class="engines">
      ${ENGINES.map((e) => `<li><code>${esc(e.name)}</code></li>`).join('\n      ')}
    </ul>
  </div>
</section>

${SECTIONS.map(section).join('\n')}

<section class="cta">
  <div class="wrap">
    <h2>Push code. Start pits.</h2>
    <p class="lede">One line, and every agent on this machine answers to the same verbs.</p>
    ${installBox()}
    <p class="muted small"><a href="/commands">All 51 commands</a> · <a href="${esc(SITE.repo)}">Read the source</a> · <a href="${esc(SITE.pit)}">Claim a Moshpit name</a></p>
  </div>
</section>
${foot()}`;
}

export function renderCommands(data) {
  const { groups, commands } = data;
  const rows = (group) =>
    commands
      .filter((c) => c.group === group)
      .map(
        (c) => `<tr>
        <td><code class="verb">moshcode ${esc(c.name)}</code>${
          c.aliases.length
            ? `<span class="aliases">${c.aliases.map((a) => `<code>${esc(a)}</code>`).join(' ')}</span>`
            : ''
        }</td>
        <td>${esc(c.summary)}</td>
      </tr>`,
      )
      .join('\n');
  return `${head({
    title: 'Commands — moshcode',
    description: `All ${commands.length} moshcode commands, generated from the table the CLI itself dispatches from.`,
    path: '/commands',
  })}
<section class="page-head">
  <div class="wrap">
    <p class="kicker">reference</p>
    <h1>${commands.length} commands.</h1>
    <p class="lede">This table is generated from the command table the CLI dispatches from, so it cannot describe a verb that does not exist or miss one that does. <code>moshcode help &lt;command&gt;</code> drills into any of them — flags, examples and all. <code>moshcode help --json</code> is the same thing for a machine.</p>
    ${installBox()}
  </div>
</section>
<section class="band">
  <div class="wrap cmd-groups">
    ${groups
      .map(
        (g) => `<div class="cmd-group" id="group-${esc(g)}">
      <h2 class="cmd-head">${esc(g)}</h2>
      <table class="cmds"><tbody>
${rows(g)}
      </tbody></table>
    </div>`,
      )
      .join('\n    ')}
  </div>
</section>
${foot()}`;
}

export function renderNotFound() {
  return `${head({
    title: 'Not found — moshcode',
    description: 'No such page.',
    path: '/404',
  })}
<section class="page-head">
  <div class="wrap">
    <p class="kicker">404</p>
    <h1>Nothing at that name.</h1>
    <p class="lede">The page you asked for is not here. Try the <a href="/">home page</a> or the <a href="/commands">command reference</a>.</p>
  </div>
</section>
${foot()}`;
}

/** A plain-text brief for agents — same facts, no markup to strip. */
export function renderLlmsTxt(data) {
  return `# moshcode

> ${SITE.tagline} ${SITE.description}

Install: ${SITE.install}
Source: ${SITE.repo}
Registry (Moshpit names): ${SITE.pit}
Moshpit Manager (claim a name): ${SITE.manager}
Account: ${SITE.app}
Blog: https://${SITE.domain}/blog (RSS: https://${SITE.domain}/blog/rss.xml)

## What it is

moshcode does not implement a coding agent. It installs and drives the ones that
already exist, and adds a runtime around them:

- the herd — agent sessions that outlive the terminal, with a state per session
  (working, blocked, done, idle, unknown). "blocked" means a human decision is
  the only thing missing.
- swarm — one task split into pieces that do not touch the same files, each run
  in its own herd session, then folded into one answer.
- fleet — every swarm recorded as OpenFleet: who started what, under whose
  approval, and what was refused.
- cost — read from the engines' own session logs; "burn" is the same figure per
  time window, so it says whether the next hour will cost what the last one did.
- billing — timer, client, rate, billing, payments.
- moshscript — .mosh files are real JavaScript with the command vocabulary
  injected as globals.

## Engines it installs

${ENGINES.map((e) => `- ${e.name}`).join('\n')}

## Commands

${data.commands.map((c) => `- moshcode ${c.name}${c.aliases.length ? ` (${c.aliases.join(', ')})` : ''} [${c.group}] — ${c.summary}`).join('\n')}

Every command has help: moshcode help <command>, or moshcode help --json.
`;
}
