import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';
import { temporaryMaterialsExpiry, validateMaterialsCode } from '../src/utils/materials-access.mjs';

test('temporary code works through November 7 in Taiwan, not November 8', () => {
  for (const date of ['2026-11-02T12:00:00+08:00', '2026-11-07T00:00:00+08:00', '2026-11-07T23:59:59.999+08:00']) {
    assert.equal(validateMaterialsCode('TTPA1105', Date.parse(date)).status, 'valid');
  }
  for (const now of [temporaryMaterialsExpiry, temporaryMaterialsExpiry + 1, Date.parse('2027-01-01T00:00:00Z'), NaN]) {
    assert.equal(validateMaterialsCode('TTPA1105', now).status, 'expired');
  }
  assert.equal(temporaryMaterialsExpiry, Date.parse('2026-11-07T16:00:00Z'));
});

test('existing access remains valid after temporary code expires', () => {
  assert.deepEqual(validateMaterialsCode('ttpa2014', temporaryMaterialsExpiry + 1), { status: 'valid', expiresAt: null });
});

test('codes are case-sensitive, with surrounding whitespace tolerated', () => {
  for (const code of ['ttpa1105', 'Ttpa1105', 'TTPA2014', '', 'incorrect']) {
    assert.equal(validateMaterialsCode(code, temporaryMaterialsExpiry - 1).status, 'invalid');
  }
  assert.equal(validateMaterialsCode(' TTPA1105 ', temporaryMaterialsExpiry - 1).status, 'valid');
});

function gate(now) {
  const callbacks = {};
  const elements = {};
  for (const name of ['form', 'passcode', 'error', 'locked', 'unlocked']) {
    elements[name] = { hidden: name === 'error' || name === 'unlocked', value: '', textContent: '',
      focus() {}, addEventListener(event, callback) { callbacks[name + ':' + event] = callback; } };
  }
  const page = readFileSync(new URL('../src/pages/courses/index.astro', import.meta.url), 'utf8');
  const script = page.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/import .*?;\n/, '');
  const context = vm.createContext({
    validateMaterialsCode: value => validateMaterialsCode(value, now), Date: { now: () => now },
    document: { querySelector: selector => elements[selector.match(/data-materials-(\w+)/)[1]],
      addEventListener: (event, callback) => { callbacks[event] = callback; } },
    window: { addEventListener: (event, callback) => { callbacks[event] = callback; } },
    setInterval: callback => { callbacks.tick = callback; return 1; },
    clearInterval() { delete callbacks.tick; },
  });
  vm.runInContext(stripTypeScriptTypes(script), context);
  return { elements, callbacks, advance: time => { now = time; },
    submit(code) { elements.passcode.value = code; callbacks['form:submit']({ preventDefault() {} }); } };
}

test('temporary sessions relock at expiry, including resume and resource clicks', () => {
  for (const trigger of ['tick', 'focus', 'pageshow', 'visibilitychange', 'unlocked:click']) {
    const g = gate(temporaryMaterialsExpiry - 1);
    g.submit('TTPA1105');
    assert.equal(g.elements.unlocked.hidden, false);
    g.advance(temporaryMaterialsExpiry);
    let prevented = false;
    g.callbacks[trigger]({ preventDefault() { prevented = true; } });
    assert.equal(g.elements.unlocked.hidden, true);
    assert.equal(g.elements.locked.hidden, false);
    assert.equal(g.elements.error.hidden, false);
    assert.match(g.elements.error.textContent, /失效/);
    if (trigger === 'unlocked:click') assert.equal(prevented, true);
    g.submit('ttpa2014');
    assert.equal(g.elements.unlocked.hidden, false);
    assert.equal(g.callbacks.tick, undefined);
  }
});

test('expired submissions stay locked; visible input remains case-sensitive', () => {
  const g = gate(temporaryMaterialsExpiry);
  g.submit('TTPA1105');
  assert.equal(g.elements.unlocked.hidden, true);
  assert.match(g.elements.error.textContent, /失效/);
  g.submit('ttpa1105');
  assert.match(g.elements.error.textContent, /大小寫/);
  const page = readFileSync(new URL('../src/pages/courses/index.astro', import.meta.url), 'utf8');
  const input = page.match(/<input[\s\S]*?data-materials-passcode[\s\S]*?\/>/)[0];
  assert.match(input, /type="text"/);
  assert.match(input, /autocapitalize="off"/);
});
