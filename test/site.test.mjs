import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createApp } from '../src/server.mjs';
import { parseCommands, extractTable } from '../scripts/sync-commands.mjs';

const COMMANDS = JSON.parse(readFileSync(new URL('../data/commands.json', import.meta.url), 'utf8'));

/** Boots the app on an ephemeral port for one request. */
async function get(path, { redirect = 'manual' } = {}) {
  const server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  const { port } = server.address();
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, { redirect });
    return { status: res.status, headers: res.headers, body: await res.text() };
  } finally {
    server.close();
  }
}

test('healthz reports ok and the command count', async () => {
  const res = await get('/healthz');
  assert.equal(res.status, 200);
  const body = JSON.parse(res.body);
  assert.equal(body.status, 'ok');
  assert.equal(body.commands, COMMANDS.commands.length);
});

test('home page renders the install line and every engine', async () => {
  const res = await get('/');
  assert.equal(res.status, 200);
  assert.match(res.body, /curl -fsSL https:\/\/moshcode\.sh\/install\.sh \| sh/);
  assert.match(res.body, /<link rel="canonical" href="https:\/\/moshcode\.sh\/">/);
  for (const engine of ['opencode', 'claude', 'codex', 'kimi', 'openagents'])
    assert.match(res.body, new RegExp(`<code>${engine}</code>`));
});

test('home page states the real command count', async () => {
  const res = await get('/');
  assert.match(res.body, new RegExp(`All ${COMMANDS.commands.length} commands`));
});

test('commands page lists every command exactly once', async () => {
  const res = await get('/commands');
  assert.equal(res.status, 200);
  for (const command of COMMANDS.commands) {
    const hits = res.body.split(`moshcode ${command.name}</code>`).length - 1;
    assert.equal(hits, 1, `${command.name} appeared ${hits} times`);
  }
});

test('install.sh redirects to the canonical installer, never serves a copy', async () => {
  const res = await get('/install.sh');
  assert.equal(res.status, 302);
  assert.equal(res.headers.get('location'), 'https://moshcoding.com/install.sh');
});

test('llms.txt is plain text and carries the commands', async () => {
  const res = await get('/llms.txt');
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/plain/);
  assert.match(res.body, /moshcode swarm/);
});

test('robots and sitemap point at the canonical host', async () => {
  const robots = await get('/robots.txt');
  assert.match(robots.body, /Sitemap: https:\/\/moshcode\.sh\/sitemap\.xml/);
  const sitemap = await get('/sitemap.xml');
  assert.match(sitemap.body, /<loc>https:\/\/moshcode\.sh\/commands<\/loc>/);
});

test('unknown paths 404 with the styled page', async () => {
  const res = await get('/nope');
  assert.equal(res.status, 404);
  assert.match(res.body, /Nothing at that name/);
});

test('security headers are set on every response', async () => {
  const res = await get('/');
  assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('terminal content is escaped, not injected', async () => {
  const res = await get('/');
  assert.match(res.body, /show &lt;n&gt;/);
  assert.doesNotMatch(res.body, /<n>/);
});

test('the command parser reads the README block the CLI generates', () => {
  const table = extractTable(`x
<!-- COMMANDS:START -->
| command | group | what it does |
|---|---|---|
| \`moshcode ps\` <br>\`where\` | system | show things |
<!-- COMMANDS:END -->
y`);
  const parsed = parseCommands(table);
  assert.deepEqual(parsed, [
    { name: 'ps', aliases: ['where'], group: 'system', summary: 'show things' },
  ]);
});
