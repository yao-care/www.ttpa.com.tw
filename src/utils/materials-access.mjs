// Convenience gate only; browser time and public links are not secure authorization.
// 民國 115/11/07 全天有效，臺灣時間 2026/11/08 00:00 起失效。
export const temporaryMaterialsExpiry = Date.parse('2026-11-08T00:00:00+08:00');

export function validateMaterialsCode(value, now = Date.now()) {
  const code = value.trim();
  if (code === 'ttpa2014') return { status: 'valid', expiresAt: null };
  if (code === 'TTPA1105') {
    if (Number.isFinite(now) && now < temporaryMaterialsExpiry) {
      return { status: 'valid', expiresAt: temporaryMaterialsExpiry };
    }
    return { status: 'expired', expiresAt: temporaryMaterialsExpiry };
  }
  return { status: 'invalid', expiresAt: null };
}
