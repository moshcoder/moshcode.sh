# moshcode.sh

The home page for [moshcode](https://github.com/moshcoder/moshcode) — a metal
wrapper CLI for agentic coding.

Before this repo, `moshcode.sh` was a parked domain: it rendered as a tenant
config inside the `moshcoding` Next.js app (`configs/moshcode.sh.json`), the same
way `moshscript.com` and the rest of the parked names do. This is the real site,
on its own Railway service, so the product domain stops sharing a codebase with
the parking lot.

## Run it

```sh
npm install
npm start           # http://localhost:3000
npm run dev         # same, with --watch
npm test            # node --test
```

## What it serves

| route | |
|---|---|
| `/` | the landing page |
| `/commands` | all 51 commands, grouped |
| `/commands.json` | the same table as data |
| `/llms.txt` | a plain-text brief for agents |
| `/install.sh` | **302** to `https://moshcoding.com/install.sh` |
| `/healthz` | Railway's health check |
| `/robots.txt`, `/sitemap.xml` | the usual |

### `/install.sh` is a redirect, on purpose

There are two installers in this world and they are not the same script:
`moshcoding.com/install.sh` installs into `$MOSHCODE_HOME/pkg`, while the raw
`install.sh` in the CLI repo replaces `~/.moshcode` wholesale. Serving a copy
here would make a third one to keep in sync, and the first time it drifted
someone would lose a config directory. So the route redirects and `curl -fsSL`
follows it.

## The command table is generated

`data/commands.json` is built from the `<!-- COMMANDS -->` block in the moshcode
README, which the CLI itself emits with `moshcode help --markdown` and guards
with a test. So the site cannot advertise a verb that does not exist, or miss one
that does.

```sh
npm run sync:commands                               # pull from GitHub
MOSHCODE_README=../moshcode/README.md npm run sync:commands   # or a local checkout
npm run check                                       # exit 1 if it is stale
```

Re-run it after a moshcode release that adds or renames a command.

## Content

All copy lives in `src/content.mjs` — hero, sections, terminal panes and footer
links, as data. `src/site.mjs` is layout only, so a wording change never means
touching markup. Every terminal pane on the page is real output from the
moshcode README rather than an invented screenshot.

## Deploy

Railway, from `Dockerfile`, with `railway.json` setting the health check.
Pushing to `main` is the whole deploy.

MIT.
