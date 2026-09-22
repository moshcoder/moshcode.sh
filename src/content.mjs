// Every claim and every terminal pane on the site. Kept as data so src/site.mjs
// is layout only, and so a copy change never means touching markup.

export const SITE = {
  name: 'moshcode',
  domain: 'moshcode.sh',
  tagline: 'A metal wrapper CLI for agentic coding.',
  description:
    'moshcode installs and drives the coding agents you already use — opencode, Claude Code, codex and seven more — then keeps their sessions alive, counts what they cost, and bills for the work.',
  install: 'curl -fsSL https://moshcode.sh/install.sh | sh',
  repo: 'https://github.com/moshcoder/moshcode',
  pit: 'https://pit.moshcode.sh',
  app: 'https://app.moshcode.sh',
  creed: 'we code in /tmp as root · we use cli only · everything we build has a tui',
};

export const NAV = [
  { href: '#engines', label: 'engines' },
  { href: '#herd', label: 'herd' },
  { href: '#swarm', label: 'swarm' },
  { href: '#cost', label: 'cost' },
  { href: '/commands', label: 'commands' },
];

export const ENGINES = [
  { name: 'opencode', how: 'moshcode install opencode' },
  { name: 'claude', how: 'moshcode install claude' },
  { name: 'codex', how: 'moshcode install codex' },
  { name: 'gemini', how: 'moshcode install gemini' },
  { name: 'kimi', how: 'moshcode install kimi' },
  { name: 'qwen', how: 'moshcode install qwen' },
  { name: 'deepseek', how: 'moshcode install deepseek' },
  { name: 'aider', how: 'moshcode install aider' },
  { name: 'privacycode', how: 'moshcode install privacycode' },
  { name: 'openagents', how: 'moshcode install openagents' },
];

/** Numbers that are true of the CLI itself, not marketing rounding. */
export const STATS = [
  { value: '10', label: 'engines it installs and drives' },
  { value: '51', label: 'commands, generated from the dispatch table' },
  { value: '22', label: 'games in the arcade' },
  { value: '0', label: 'dependencies — Node 18+ and nothing else' },
];

export const SECTIONS = [
  {
    id: 'engines',
    kicker: 'one CLI, every agent',
    title: 'It does not reinvent the agent.',
    body: [
      'moshcode installs the coding agents that already exist and gives them one set of verbs. <code>start</code> is the raw path — it injects nothing, so the engine keeps its own permission model. <code>agents</code> opens the engine\'s native agent view when it has one, and otherwise starts an autonomous session using that engine\'s own bypass flag.',
      'Learn the verb once and it works on all ten.',
    ],
    terminal: {
      title: 'engines',
      lines: [
        { p: true, text: 'moshcode install opencode' },
        { text: '✓ opencode 0.14.2 → ~/.local/bin/opencode' },
        { text: '' },
        { p: true, text: 'moshcode agents claude' },
        { dim: true, text: '→ claude agents --dangerously-skip-permissions   (agent view)' },
        { text: '' },
        { p: true, text: 'moshcode start codex --sandbox workspace-write' },
        { dim: true, text: '→ codex --sandbox workspace-write               (raw, nothing injected)' },
      ],
    },
  },
  {
    id: 'herd',
    kicker: 'the herd',
    title: 'Sessions that outlive your terminal.',
    body: [
      'A normal launch hands the engine your whole terminal and waits — which is why closing the lid kills the work. Add <code>-d</code> and the session runs in a runtime that outlives the shell, so you get your prompt back immediately.',
      'Every session carries a state. <strong>blocked</strong> means a human decision is the only thing missing, and it can come find you over email, SMS, Slack, Telegram or push.',
    ],
    terminal: {
      title: 'moshcode ps',
      lines: [
        { p: true, text: 'moshcode agents claude -d --name api' },
        { p: true, text: 'moshcode ps' },
        { text: '  api    claude  blocked   ~/src/coinpay   3m   screen' },
        { text: '  logs   shell   idle      ~/src/coinpay   3m   screen' },
        { text: '  work   shell   idle      ~/src/coinpay   3m   screen' },
        { text: '' },
        { warn: true, text: '⚠ 1 waiting on you — moshcode attach api' },
      ],
    },
  },
  {
    id: 'workspace',
    kicker: 'the workspace',
    title: 'Every agent on one screen.',
    body: [
      '<code>moshcode herd ui</code> puts the roster down the left and the selected session\'s <em>real terminal</em> on the right — not a picture of it, the actual pane, moved in, with its process and its scrollback intact.',
      'The row along the bottom is a mosh prompt that takes any herd verb. <strong>F12</strong> reaches it from anywhere, including from inside an agent that has taken the keyboard — which makes it the way out of a session you otherwise cannot leave.',
    ],
    terminal: {
      title: 'moshcode herd ui',
      wide: true,
      raw: `┌ herd ──────┬─ api ─────────────────────────────┐
│ herd       │                                   │
│            │  claude                           │
│ MAIN       │  Do you want to proceed?          │
│ ▸ ! api    │  ❯ 1. Yes                         │
│   · work   │    2. No                          │
│ SCRATCH    │                                   │
│   · logs   │                                   │
│            │                                   │
│ ACTIONS    │                                   │
│   + shell  │                                   │
│   + agent  │                                   │
│   ✕ stop   │                                   │
│   ⊞ tile   │                                   │
│   ← detach │                                   │
│            │                                   │
├────────────┴───────────────────────────────────┤
│ mosh ▸ ps · start claude · show <n> · detach   │
└────────────────────────────────────────────────┘`,
    },
  },
  {
    id: 'swarm',
    kicker: 'swarm + fleet',
    title: 'One task, a herd of agents, one answer.',
    body: [
      'One headless call splits a task into pieces that do not touch the same files. Each piece runs in its own herd session, four at a time by default, and one more call folds the outputs into the answer you read. <code>--verify</code> adds a skeptic per piece whose verdict the synthesis sees.',
      'Every swarm is recorded as <a href="https://logicsrc.com/docs/openfleet">OpenFleet</a>: who started what, under whose approval, what the synthesis said, and what was refused. A bypass flag the ceiling forbids is refused before anything starts, and the refusal is a ledger line a human reads.',
    ],
    terminal: {
      title: 'moshcode swarm',
      wide: true,
      raw: `$ moshcode swarm "port the auth routes and the dashboard to the new API"
· plan — claude is splitting the task into up to 4 pieces
   1 auth routes  owns src/auth/
   2 dashboard  owns src/dashboard/
   3 shared API client  owns src/api/client.js
· swarm port-the-auth-routes-an-1412: 3 sessions, 3 at a time
  ✓ port-the-auth-routes-an-1412-1 idle · t-01
  ✓ port-the-auth-routes-an-1412-2 idle · t-02
  ✓ port-the-auth-routes-an-1412-3 idle · t-03
· synthesis — claude is folding 3 pieces into one answer`,
    },
  },
  {
    id: 'cost',
    kicker: 'what it costs',
    title: 'Nothing to instrument. Nothing to proxy.',
    body: [
      'Every engine already writes down what it used, so <code>moshcode cost</code> reads the CLIs\' own session logs and lines them up against the herd. Estimated figures are marked <code>~</code>; unmarked ones are the engine\'s own.',
      'Under the table, <strong>burn is the slope</strong>. <code>cost</code> says what the day cost. <code>burn</code> says whether the next hour will cost the same — which is the number that decides whether to kill something.',
    ],
    terminal: {
      title: 'moshcode cost --all --since 8h',
      wide: true,
      raw: `  session  engine  model          in    out   cache  cost    age  pr
  api      claude  claude-opus-5  1.2k  27k   10.5M  $9.91~  42m  view #128
  audit    codex   gpt-5.6-sol    400   200   600    —       12m  —

  burn          cost       rate       runs
  last 1 min    $1.32~     $79.16/h   2
  last 15 min   $38.34~    $153.35/h  8
  last 1 hour   $222.03~   $222.03/h  11
  last 4 hours  $966.27~   $241.57/h  19
  last 8 hours  $1786.84~  $223.35/h  45
  $3.72 a minute over the window, on average`,
    },
  },
  {
    id: 'billing',
    kicker: 'getting paid',
    title: 'Every other agentic CLI helps you do the work.',
    body: [
      'This one also bills for it. Six words, each useful on its own — the timer needs no client, the rate needs no gateway.',
      'Tracking time and sending an invoice are not moshcode ideas, so they also ship standalone as <a href="https://github.com/profullstack/timer">@profullstack/timer</a> and <a href="https://github.com/profullstack/billing">@profullstack/billing</a>. Handing over is opt-in, because <code>billing import</code> is what keeps your records in one store instead of two.',
    ],
    terminal: {
      title: 'getting paid',
      lines: [
        { p: true, text: 'moshcode timer on --client acme' },
        { p: true, text: 'moshcode rate set \'$400/hour/agent/upto:4\'' },
        { p: true, text: 'moshcode timer off' },
        { dim: true, text: '  4h 12m tracked · acme' },
        { text: '' },
        { p: true, text: 'moshcode billing invoice acme --send' },
        { text: '✓ INV-0042  $1,680.00  → acme · payments: coinpay' },
      ],
    },
  },
  {
    id: 'moshscript',
    kicker: 'moshscript',
    title: 'Secretly, all JS is legal.',
    body: [
      'The simple surface stays dead-simple, but a <code>.mosh</code> file is real JavaScript with the whole moshcode command vocabulary injected as globals. No new syntax, no build step — it is plain ESM.',
      '<code>--dry-run</code> narrates a script without executing it, and a shebang line makes one self-running.',
    ],
    terminal: {
      title: 'deploy-agents.mosh',
      lang: 'js',
      raw: `const engines = ["claude", "codex"];
for (const e of engines) {
  install(e);                                  // → moshcode install <e>
}
mcp("install", "https://mcp.sentry.dev/mcp");  // fan out across engines
say(\`ready to mosh with \${engines.length} engines\`);
agents("claude");                              // autonomous session

while (alive) {
  code(); mosh(); notify(); repeat();
} // no bugs, only features`,
    },
  },
  {
    id: 'moshpit',
    kicker: 'the Moshpit',
    title: 'Claim a name. Put something behind it.',
    body: [
      'Claim <code>foo.whatever</code> in <a href="https://pit.moshcode.sh/pit">the Pit</a>, then scaffold a stack to serve it: a Bun service with Caddy and SQLite, or just Caddy and a directory of files. Nothing in a template is executed on install.',
      'The fact that catches everyone: <strong>the machine serving the name never resolves it, and every machine visiting it must.</strong> Serving is a Host header match. Visitors need <code>sudo moshcode dns enable</code>, or the name resolves to nothing.',
    ],
    terminal: {
      title: 'hosting at a Moshpit name',
      lines: [
        { p: true, text: 'moshcode template list' },
        { text: '  bun-caddy-sqlite   Bun + Caddy + SQLite — local file in dev, Turso in prod' },
        { text: '  caddy-static       Caddy and a directory of files. Nothing to keep alive.' },
        { text: '' },
        { p: true, text: 'moshcode template install caddy-static --into /srv/site' },
        { p: true, text: 'sudo moshcode dns enable' },
        { text: '✓ chovy.hacker resolves on this machine' },
      ],
    },
  },
  {
    id: 'arcade',
    kicker: 'the arcade',
    title: 'Twenty-two games. No menus.',
    body: [
      'There are no options screens and no difficulty prompts. <code>moshcode games tetris</code> is already playing.',
      'Because everything we build has a TUI.',
    ],
    terminal: {
      title: 'moshcode games tetris',
      raw: `  TETRIS       score 1200 · lines 12
  ┌────────────────────────────────┐
  │ · · · · ████· · · ·   NEXT     │
  │ · · · · ████· · · ·            │
  │ · · · · · · · · · ·   ████████ │
  │ · · · · · · · · · ·            │
  │ · · · ████· · · · ·   LVL 2    │
  │ ████████████· ██████           │
  └────────────────────────────────┘
  ← → move · ↑ rotate · ↓ drop · space slam · q quit`,
    },
  },
];

export const FOOTER_LINKS = [
  {
    heading: 'moshcode',
    links: [
      { label: 'GitHub', href: 'https://github.com/moshcoder/moshcode' },
      { label: 'Commands', href: '/commands' },
      { label: 'Install script', href: '/install.sh' },
      { label: 'For agents (llms.txt)', href: '/llms.txt' },
    ],
  },
  {
    heading: 'the Pit',
    links: [
      { label: 'pit.moshcode.sh', href: 'https://pit.moshcode.sh' },
      { label: 'app.moshcode.sh', href: 'https://app.moshcode.sh' },
      { label: 'Moshpit DNS', href: 'https://dns.moshcode.sh/dns-query' },
      { label: 'moshcoding.com', href: 'https://moshcoding.com' },
    ],
  },
  {
    heading: 'elsewhere',
    links: [
      { label: 'X / chovy', href: 'https://x.com/chovy' },
      { label: 'Bluesky', href: 'https://bsky.app/profile/moshcoding.bsky.social' },
      { label: 'YouTube', href: 'https://youtube.com/@moshcoding' },
      { label: 'Twitch', href: 'https://www.twitch.tv/chovyo' },
    ],
  },
];
