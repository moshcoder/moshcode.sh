// The blog pages: index, one post, and the feed. Built from the same chrome as
// the rest of the site (src/site.mjs) so there is one nav and one footer, and
// from the post data in src/posts.mjs so a wording change never touches markup.

import { SITE } from './content.mjs';
import { esc, head, foot, terminal, installBox } from './site.mjs';
import { POSTS_NEWEST_FIRST, formatDate } from './posts.mjs';

// A post body is authored markup, so paragraph and list text is passed through
// rather than escaped: that is what lets a sentence carry a link. Terminal panes
// go through terminal(), which escapes, so pasted output stays verbatim and inert.
function postBlock(block) {
  if (block.h2) return `<h2>${esc(block.h2)}</h2>`;
  if (block.p) return `<p>${block.p}</p>`;
  if (block.list)
    return `<ul class="prose-list">${block.list.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  if (block.terminal) return terminal(block.terminal);
  return '';
}

/** JSON-LD, so the post is a BlogPosting to anything reading structured data. */
function postSchema(post) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: `https://${SITE.domain}/blog/${post.slug}`,
    mainEntityOfPage: `https://${SITE.domain}/blog/${post.slug}`,
    author: { '@type': 'Organization', name: 'moshcoder', url: 'https://github.com/moshcoder' },
    publisher: { '@type': 'Organization', name: 'moshcode' },
  };
  // `</script>` inside JSON would close the tag early; escaping `<` is the fix.
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

const FEED_LINK = `<link rel="alternate" type="application/rss+xml" title="moshcode" href="https://${SITE.domain}/blog/rss.xml">`;

export function renderBlogIndex(posts = POSTS_NEWEST_FIRST) {
  return `${head({
    title: 'Blog — moshcode',
    description: 'Notes on agentic coding, the herd and the Moshpit, from the people running it.',
    path: '/blog',
    extraHead: FEED_LINK,
  })}
<section class="page-head">
  <div class="wrap">
    <p class="kicker">blog</p>
    <h1>Notes from the pit.</h1>
    <p class="lede">What we hit building moshcode, the herd and the Moshpit. <a href="/blog/rss.xml">RSS</a>.</p>
  </div>
</section>
<section class="band">
  <div class="wrap post-list">
    ${posts
      .map(
        (p) => `<article class="post-card">
      <p class="post-meta"><time datetime="${esc(p.date)}">${esc(formatDate(p.date))}</time></p>
      <h2><a href="/blog/${esc(p.slug)}">${esc(p.title)}</a></h2>
      <p class="post-dek">${esc(p.description)}</p>
      <p class="post-more"><a href="/blog/${esc(p.slug)}">read it →</a></p>
    </article>`,
      )
      .join('\n    ')}
  </div>
</section>
${foot()}`;
}

export function renderPost(post) {
  return `${head({
    title: `${post.title} — moshcode`,
    description: post.description,
    path: `/blog/${post.slug}`,
    extraHead: `${FEED_LINK}\n${postSchema(post)}`,
  })}
<section class="page-head">
  <div class="wrap">
    <p class="kicker"><a href="/blog">blog</a> · <time datetime="${esc(post.date)}">${esc(formatDate(post.date))}</time></p>
    <h1 class="post-title">${esc(post.title)}</h1>
    <p class="lede">${esc(post.description)}</p>
  </div>
</section>
<section class="band">
  <div class="wrap prose">
    ${post.body.map(postBlock).join('\n    ')}
  </div>
</section>
<section class="cta">
  <div class="wrap">
    <h2>Push code. Start pits.</h2>
    <p class="lede">One line, and every agent on this machine answers to the same verbs.</p>
    ${installBox()}
    <p class="muted small"><a href="${esc(SITE.manager)}">Claim a Moshpit name</a> · <a href="/commands">All commands</a> · <a href="/blog">More posts</a></p>
  </div>
</section>
${foot()}`;
}

/** RSS 2.0. Descriptions are prose, and CDATA keeps punctuation out of the parser. */
export function renderFeed(posts = POSTS_NEWEST_FIRST) {
  const items = posts
    .map(
      (p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>https://${SITE.domain}/blog/${p.slug}</link>
    <guid isPermaLink="true">https://${SITE.domain}/blog/${p.slug}</guid>
    <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
    <description><![CDATA[${p.description}]]></description>
  </item>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>moshcode</title>
  <link>https://${SITE.domain}/blog</link>
  <atom:link href="https://${SITE.domain}/blog/rss.xml" rel="self" type="application/rss+xml"/>
  <description>Notes on agentic coding, the herd and the Moshpit.</description>
  <language>en</language>
${items}
</channel>
</rss>
`;
}
