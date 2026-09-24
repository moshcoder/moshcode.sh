// Blog posts as data, the same way src/content.mjs holds the landing copy, so
// src/site.mjs stays layout only. A body is an ordered list of blocks:
//
//   { h2: 'Heading' }          a section heading
//   { p: 'HTML allowed' }      a paragraph (inline markup is passed through)
//   { list: ['a', 'b'] }       a bulleted list (inline markup is passed through)
//   { terminal: { … } }        the same pane shape the landing page uses
//
// Paragraph and list text is trusted authored markup and is NOT escaped, which
// is what lets a sentence carry a link. Terminal panes go through the escaping
// renderer in site.mjs, so pasted output stays verbatim and inert.

export const POSTS = [
  {
    slug: 'the-agentic-internet-they-dont-want-you-to-see',
    title: "The agentic internet they don't want you to see",
    date: '2026-09-24',
    description:
      'The open web closed itself to agents one 403 at a time. Moshpit names, a DoH resolver and a registry CA are the other network, and you can be on it in two commands.',
    body: [
      {
        p: 'The open web spent this year closing. There was no announcement. There was a 403.',
      },
      {
        p: 'Our tools read pages for a living, so we check this often. A plain fetch, no browser profile, no cookie jar, gets this today:',
      },
      {
        terminal: {
          title: 'what a fetch gets in 2026',
          wide: true,
          raw: `$ curl -sI https://www.reddit.com/r/programming.json
HTTP/2 403

$ curl -sI https://www.axios.com/
HTTP/2 403

$ curl -s https://news.google.com/rss/articles/CBMi... -o /dev/null -w '%{redirect_url}\\n'
                                  (no Location, the link resolves to nothing)

$ curl -s https://www.threads.net/@someone | grep -c 'login'
                                  (a login wall, same as x, instagram, facebook)`,
        },
      },
      {
        p: 'Every one of those was a URL you could read a few years ago. The writing is still there. The door now checks whether you are a person.',
      },
      {
        p: 'That is the part everyone notices. Here is the part that matters more: the same door is what stops an agent from doing anything useful for you. An agent has no account, no cookie, no residential address. It is precisely the traffic those walls went up to stop. So the honest summary of the agentic web right now is that it works beautifully on the handful of sites that still let anything in.',
      },
      { h2: 'So build the other one' },
      {
        p: 'A Moshpit name is a name with no registrar behind it. You claim <code>chovy.hacker</code> or <code>seo.rank</code> in the <a href="https://app.moshcode.sh/pit">Moshpit Manager</a>, and the registry signs a 30 day leaf certificate for it. <code>sudo moshcode dns enable</code> installs the root and points this machine at the resolver, so the name loads in a browser with a real lock rather than a warning page.',
      },
      {
        p: 'The fact that catches everyone: <strong>the machine serving a name never resolves it, and every machine visiting it has to.</strong> Serving is a Host header match, which is why hosting works before DNS does. Visitors run <code>dns enable</code> or the name goes nowhere for them.',
      },
      {
        terminal: {
          title: 'on the other network in two commands',
          lines: [
            { p: true, text: 'sudo moshcode dns enable' },
            { text: '✓ resolver installed · chovy.hacker resolves on this machine' },
            { text: '' },
            { p: true, text: 'moshcode template install caddy-static --into /srv/site' },
            { p: true, text: 'moshcode site chovy.hacker --root /srv/site' },
            { dim: true, text: '  serving on a Host match · pit-signed cert, 30 day leaf' },
          ],
        },
      },
      { h2: 'A name is only the first third' },
      {
        p: 'An agent that can reach a thing still cannot transact with it or be held to account for it. Three pieces, and none of them is a metaphor:',
      },
      {
        list: [
          '<strong>An address.</strong> The Moshpit registry, plus a public DNS-over-HTTPS endpoint at <code>dns.moshcode.sh/dns-query</code>, so a resolver is a URL and not a sysadmin ticket.',
          '<strong>A way to pay per call.</strong> HTTP 402 was reserved for this in 1997 and left empty. <a href="https://x402.org">x402</a> fills it, so a request can carry its own payment instead of a signup form.',
          '<strong>A record.</strong> Every swarm moshcode runs is written as <a href="https://logicsrc.com/docs/openfleet">OpenFleet</a>: who started what, under whose approval, what the synthesis said, and what got refused before it ran.',
        ],
      },
      {
        p: 'Identity comes off the same name. <code>moshcode name</code> proves you hold one, so an app can treat it as who you are without asking an identity provider.',
      },
      { h2: 'Nobody is hiding it' },
      {
        p: 'The title is a joke about how it feels, not a conspiracy. There is no cabal. There is an incentive: a network that indexes a <code>.hacker</code> name earns nothing from it, and a platform that carries a link to one is sending a reader somewhere it cannot monetise. So it does not get surfaced, and the networks that would have distributed it five years ago are the same ones returning 403 to the fetch above.',
      },
      {
        p: 'Which leaves the way these things have always spread, which is somebody telling you the two commands.',
      },
      {
        terminal: {
          title: 'the two commands',
          lines: [
            { p: true, text: 'curl -fsSL https://moshcode.sh/install.sh | sh' },
            { p: true, text: 'sudo moshcode dns enable' },
          ],
        },
      },
      {
        p: 'Then claim something in the <a href="https://app.moshcode.sh/pit">Moshpit Manager</a> and put a directory of files behind it. The rest of the web does not have to agree for it to work.',
      },
    ],
  },
];

export const POSTS_BY_SLUG = new Map(POSTS.map((p) => [p.slug, p]));

/** Newest first, which is the order both the index and the feed want. */
export const POSTS_NEWEST_FIRST = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));

export function formatDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
