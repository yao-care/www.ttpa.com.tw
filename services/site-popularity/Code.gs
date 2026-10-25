// Independent, public popularity counter. No Gmail/Drive/Sheets permissions.
// 2014 is an editorial starting score, NOT historical measured traffic.
const INITIAL_SCORE = 2014;
const WINDOW_MS = 30 * 60 * 1000;
const PREFIX = 'popularity_v1_';
const SITE_ORIGIN = 'https://www.ttpa.com.tw';

function doGet() {
  try {
    return json_({ ok: true, score: score_() });
  } catch (error) {
    return json_({ ok: false, error: 'temporarily_unavailable' });
  }
}

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents;
    if (!body || body.length > 512) return json_({ ok: false, error: 'invalid_request' });
    const input = JSON.parse(body);
    // Origin is an abuse guard, not authentication: this endpoint contains no secrets.
    if (input.origin !== SITE_ORIGIN || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(input.visitId)) {
      return json_({ ok: false, error: 'invalid_request' });
    }
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) return json_({ ok: false, error: 'busy' });
    try {
      const properties = PropertiesService.getScriptProperties();
      const key = PREFIX + input.visitId.charAt(0);
      const shard = readShard_(properties.getProperty(key));
      const now = Date.now();
      const recent = Object.fromEntries(Object.entries(shard.recent).filter(function (entry) {
        return now - entry[1] < WINDOW_MS;
      }));
      let counted = false;
      if (!Object.prototype.hasOwnProperty.call(recent, input.visitId)) {
        // Bounded storage: remain below Apps Script's per-property size limit.
        if (Object.keys(recent).length >= 80) return json_({ ok: false, error: 'busy' });
        recent[input.visitId] = now;
        shard.total += 1;
        counted = true;
      }
      // Count and dedup token are saved together; retrying cannot double-count.
      properties.setProperty(key, JSON.stringify({ total: shard.total, recent: recent }));
      return json_({ ok: true, score: score_(), counted: counted });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    return json_({ ok: false, error: 'temporarily_unavailable' });
  }
}

function readShard_(raw) {
  if (!raw) return { total: 0, recent: {} };
  const value = JSON.parse(raw);
  if (!Number.isSafeInteger(value.total) || value.total < 0 || !value.recent || typeof value.recent !== 'object') {
    throw new Error('Invalid persisted counter; do not silently reset.');
  }
  return value;
}

function score_() {
  const properties = PropertiesService.getScriptProperties().getProperties();
  return '0123456789abcdef'.split('').reduce(function (score, bucket) {
    return score + readShard_(properties[PREFIX + bucket]).total;
  }, INITIAL_SCORE);
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
