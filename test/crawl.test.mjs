import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/server.mjs';
import { createCrawlGate } from '../src/crawl.mjs';

const GPT = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)';
const CHROME = {
  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  accept: 'text/html',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-dest': 'document',
};
const ENV = { COINPAY_X402_KEY: 'cp_live_test', CRAWL_PAY_TO: '0xCC3b072391AE7A8d10cF00DdC5F61DB2cA5541E5' };

async function get(path, headers) {
  const server = createApp({ crawlGate: createCrawlGate(ENV) }).listen(0);
  await new Promise((r) => server.once('listening', r));
  try {
    const res = await fetch(`http://127.0.0.1:${server.address().port}${path}`, { headers, redirect: 'manual' });
    return { status: res.status, headers: res.headers, body: await res.text() };
  } finally {
    server.close();
  }
}

test('the crawl gate is off without a key', () => {
  assert.equal(createCrawlGate({}), null);
});

test('GPTBot gets a 402 with PAYMENT-REQUIRED', async () => {
  const res = await get('/', { 'user-agent': GPT });
  assert.equal(res.status, 402);
  assert.ok(res.headers.get('payment-required'));
});

test('/crawl sells a $1 day pass', async () => {
  const res = await get('/crawl', { accept: 'application/json' });
  assert.equal(res.status, 402);
  assert.equal(String(JSON.parse(res.body).accepts[0].amount), '1000000');
});

test('a browser and the health check are not charged', async () => {
  assert.equal((await get('/', CHROME)).status, 200);
  assert.equal((await get('/healthz', { 'user-agent': GPT })).status, 200);
});
