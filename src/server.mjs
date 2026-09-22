import express from 'express';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderHome, renderCommands, renderNotFound, renderLlmsTxt } from './site.mjs';
import { SITE } from './content.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const COMMANDS = JSON.parse(readFileSync(resolve(ROOT, 'data/commands.json'), 'utf8'));
const VERSION = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')).version;

// The canonical installer lives with moshcoding and is the only one a human
// should ever pipe to a shell — the repo's raw install.sh is a *different*
// script that replaces ~/.moshcode wholesale. So this is a redirect, not a
// third copy: `curl -fsSL` follows it, and there is nothing here to drift.
const INSTALLER = 'https://moshcoding.com/install.sh';

const PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/commands', changefreq: 'weekly', priority: '0.8' },
];

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('etag', 'strong');

  app.use((_req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    });
    next();
  });

  app.get('/healthz', (_req, res) =>
    res.json({ status: 'ok', version: VERSION, commands: COMMANDS.commands.length }),
  );

  const html = (res, body) =>
    res.type('html').set('Cache-Control', 'public, max-age=300, must-revalidate').send(body);

  app.get('/', (_req, res) => html(res, renderHome()));
  app.get('/commands', (_req, res) => html(res, renderCommands(COMMANDS)));

  // The command table as data, for anything that would rather not parse HTML.
  app.get('/commands.json', (_req, res) =>
    res.set('Cache-Control', 'public, max-age=300').json(COMMANDS),
  );

  app.get(['/install.sh', '/install'], (_req, res) => res.redirect(302, INSTALLER));

  app.get('/llms.txt', (_req, res) =>
    res
      .type('text/plain; charset=utf-8')
      .set('Cache-Control', 'public, max-age=300')
      .send(renderLlmsTxt(COMMANDS)),
  );

  app.get('/robots.txt', (_req, res) =>
    res
      .type('text/plain; charset=utf-8')
      .send(`User-agent: *\nAllow: /\n\nSitemap: https://${SITE.domain}/sitemap.xml\n`),
  );

  app.get('/sitemap.xml', (_req, res) => {
    const urls = PAGES.map(
      (p) =>
        `  <url><loc>https://${SITE.domain}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
    ).join('\n');
    res
      .type('application/xml')
      .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  });

  app.use(
    express.static(resolve(ROOT, 'public'), {
      maxAge: '1h',
      setHeaders: (res) => res.set('Cache-Control', 'public, max-age=3600'),
    }),
  );

  app.use((_req, res) => res.status(404).type('html').send(renderNotFound()));
  return app;
}

const isMain = process.argv[1] && import.meta.url === `file://${resolve(process.argv[1])}`;
if (isMain) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '0.0.0.0';
  createApp().listen(port, host, () => console.log(`moshcode.sh listening on ${host}:${port}`));
}
