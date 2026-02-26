/**
 * Convert ISO 3166-1 alpha-2 country code to flag emoji (e.g. "US" -> "🇺🇸").
 */
export function getCountryFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return "🌐";
  const u = code.toUpperCase();
  const a = u.charCodeAt(0) - 0x41 + 0x1f1e6;
  const b = u.charCodeAt(1) - 0x41 + 0x1f1e6;
  if (a < 0x1f1e6 || a > 0x1f1ff || b < 0x1f1e6 || b > 0x1f1ff) return "🌐";
  return String.fromCodePoint(a, b);
}
