import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const component = readFileSync(new URL('../../src/components/SitePopularity.astro', import.meta.url), 'utf8');
const source = stripTypeScriptTypes(component.match(/<script>([\s\S]*?)<\/script>/)[1]);
const id = 'a0000000-0000-4000-8000-000000000000';
async function render({ origin = 'https://www.ttpa.com.tw', saved = null, blocked = false, result = { ok: true, score: 2015 }, failure = false } = {}) {
  const output = { textContent: '讀取中' };
  const requests = [];
  let stored = saved;
  const context = vm.createContext({
    document: { querySelector: () => ({ dataset: { endpoint: 'https://counter.example/exec' }, querySelector: () => output }) },
    location: { origin },
    navigator: {},
    crypto: { randomUUID: () => id },
    Intl,
    AbortSignal,
    localStorage: {
      getItem() { if (blocked) throw new Error('blocked'); return stored; },
      setItem(key, value) { if (blocked) throw new Error('blocked'); stored = value; },
    },
    async fetch(url, options) {
      requests.push(options);
      if (failure) throw new Error('offline');
      return { ok: true, json: async () => result };
    },
  });
  vm.runInContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return { output: output.textContent, requests, stored };
}
test('local preview only reads, and does not create browser visit IDs', async () => {
  const r = await render({ origin: 'http://127.0.0.1:4321', result: { ok: true, score: 2014 } });
  assert.equal(r.output, '2,014');
  assert.equal(r.requests[0].method, 'GET');
  assert.equal(r.stored, null);
});
test('official first visit posts once; subsequent page reads within 30 minutes', async () => {
  const first = await render();
  assert.equal(first.requests[0].method, 'POST');
  assert.equal(JSON.parse(first.requests[0].body).visitId, id);
  assert.equal(JSON.parse(first.stored).counted, true);
  const second = await render({ saved: first.stored });
  assert.equal(second.requests[0].method, 'GET');
});
test('expired visits receive a new session; unacknowledged requests reuse the same ID', async () => {
  const expired = JSON.stringify({ id, expires: Date.now() - 1, counted: true });
  const r = await render({ saved: expired });
  assert.equal(r.requests[0].method, 'POST');
  const retry = await render({ saved: JSON.stringify({ id, expires: Date.now() + 10000 }), failure: true });
  assert.equal(retry.output, '暫時無法讀取');
  assert.equal(JSON.parse(retry.stored).id, id);
  assert.equal(JSON.parse(retry.stored).counted, undefined);
});
test('blocked storage only reads; bad responses do not fabricate a number', async () => {
  const r = await render({ blocked: true });
  assert.equal(r.requests[0].method, 'GET');
  for (const result of [{ ok: false }, { ok: true, score: '9999' }, { ok: true, score: -1 }]) {
    const bad = await render({ result });
    assert.equal(bad.output, '暫時無法讀取');
    assert.notEqual(JSON.parse(bad.stored).counted, true);
  }
});
