import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('./Code.gs', import.meta.url), 'utf8');
function service() {
  const values = {};
  let available = true;
  let time = 1_000_000;
  const context = vm.createContext({
    Date: { now: () => time },
    PropertiesService: { getScriptProperties: () => ({
      getProperty: key => values[key] ?? null,
      getProperties: () => ({ ...values }),
      setProperty: (key, value) => { values[key] = value; },
    }) },
    LockService: { getScriptLock: () => ({ tryLock: () => available, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: text => ({ setMimeType: () => JSON.parse(text) }) },
  });
  vm.runInContext(source, context);
  return {
    get: () => context.doGet(),
    post: (visitId, origin = 'https://www.ttpa.com.tw') => context.doPost({ postData: { contents: JSON.stringify({ visitId, origin }) } }),
    values,
    setAvailable: v => { available = v; },
    advance: ms => { time += ms; },
  };
}
const id = 'a0000000-0000-4000-8000-000000000000';
test('GET is read-only; first visit increments; repeat is deduplicated', () => {
  const s = service();
  assert.equal(s.get().score, 2014);
  assert.equal(s.get().score, 2014);
  assert.equal(s.post(id).score, 2015);
  assert.equal(s.post(id).counted, false);
  assert.equal(s.get().score, 2015);
  s.advance(30 * 60 * 1000);
  assert.equal(s.post(id).score, 2016);
});
test('invalid IDs, preview origins and lock failures never increment', () => {
  const s = service();
  assert.equal(s.post('invalid').ok, false);
  assert.equal(s.post(id, 'http://localhost:4321').ok, false);
  s.setAvailable(false);
  assert.equal(s.post(id).error, 'busy');
  assert.equal(s.get().score, 2014);
});
test('bounded shards reject overload without losing historical total', () => {
  const s = service();
  for (let n = 0; n < 80; n++) s.post(`a${n.toString(16).padStart(7,'0')}-0000-4000-8000-000000000000`);
  assert.equal(s.get().score, 2094);
  assert.equal(s.post('afffffff-0000-4000-8000-000000000000').error, 'busy');
  assert.ok(s.values.popularity_v1_a.length < 9000);
  s.advance(30 * 60 * 1000);
  assert.equal(s.post('afffffff-0000-4000-8000-000000000000').score, 2095);
});
test('corrupt persisted data fails safely instead of resetting count', () => {
  const s = service();
  s.values.popularity_v1_a = 'invalid';
  assert.equal(s.get().ok, false);
  assert.equal(s.post(id).ok, false);
  assert.equal(s.values.popularity_v1_a, 'invalid');
});
