#!/usr/bin/env node
// Regenerates data/commands.json from the moshcode README's generated command
// table. That block is itself emitted by `moshcode help --markdown` and guarded
// by a test in the CLI repo, so the site inherits a table that cannot describe a
// verb the CLI does not dispatch.
//
//   node scripts/sync-commands.mjs            # rewrite data/commands.json
//   node scripts/sync-commands.mjs --check    # exit 1 if it would change
//   MOSHCODE_README=../moshcode/README.md …   # read a local checkout instead

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'data/commands.json');
const REMOTE = 'https://raw.githubusercontent.com/moshcoder/moshcode/master/README.md';

const START = '<!-- COMMANDS:START -->';
const END = '<!-- COMMANDS:END -->';

/** Pulls the fenced command table out of the README. */
export function extractTable(readme) {
  const from = readme.indexOf(START);
  const to = readme.indexOf(END);
  if (from === -1 || to === -1) throw new Error('README has no COMMANDS block');
  return readme.slice(from + START.length, to).trim();
}

/** `\`moshcode ps\` <br>\`where\`` → { name: 'ps', aliases: ['where'] } */
function parseVerbs(cell) {
  const ticks = [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
  if (!ticks.length) return null;
  const name = ticks[0].replace(/^moshcode\s+/, '');
  return { name, aliases: ticks.slice(1) };
}

export function parseCommands(table) {
  const rows = table
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|') && !/^\|[\s:|-]+\|$/.test(line))
    .slice(1); // drop the header row
  const out = [];
  for (const row of rows) {
    const cells = row.slice(1, -1).split('|');
    if (cells.length < 3) continue;
    const verbs = parseVerbs(cells[0]);
    if (!verbs) continue;
    out.push({
      ...verbs,
      group: cells[1].trim(),
      summary: cells.slice(2).join('|').trim(),
    });
  }
  if (!out.length) throw new Error('parsed zero commands');
  return out;
}

async function readReadme() {
  const local = process.env.MOSHCODE_README;
  if (local) return readFile(resolve(local), 'utf8');
  const res = await fetch(REMOTE);
  if (!res.ok) throw new Error(`GET ${REMOTE} → ${res.status}`);
  return res.text();
}

async function main() {
  const commands = parseCommands(extractTable(await readReadme()));
  const groups = [...new Set(commands.map((c) => c.group))];
  const next = `${JSON.stringify({ source: REMOTE, groups, commands }, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    const current = await readFile(OUT, 'utf8').catch(() => '');
    if (current !== next) {
      console.error('data/commands.json is stale — run `npm run sync:commands`');
      process.exit(1);
    }
    console.log(`commands.json is current (${commands.length} commands)`);
    return;
  }
  await writeFile(OUT, next);
  console.log(`wrote ${commands.length} commands across ${groups.length} groups`);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
