/**
 * shared/utils/formatNumber.js
 * Shared display formatters used across article counts, author stats, and trending metric cards.
 */

/**
 * Formats a large number with K/M suffix for compact display in stat cards and tables.
 * Trailing ".0" is stripped (e.g. 2000 -> "2K" not "2.0K").
 * @param {number} n
 * @returns {string}  e.g. 1200 -> "1.2K", 1500000 -> "1.5M", null/NaN -> "—"
 */
export function formatCount(n) {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

/**
 * Formats a growth delta with an explicit +/- sign for display in trending stat cards.
 * Zero returns '—' (intentional: no delta is treated as no meaningful change, not "+0").
 * @param {number} delta
 * @returns {string}  e.g. 5 -> "+5", -3 -> "-3", 0 -> "—"
 */
export function formatGrowth(delta) {
  if (delta == null || isNaN(delta)) return '—';
  if (delta > 0) return `+${formatCount(delta)}`;
  if (delta < 0) return `${formatCount(delta)}`;
  return '—';
}

/**
 * Truncates a string to at most `max` characters, appending an ellipsis if cut.
 * Default max of 40 matches the character cap used in article title table cells.
 */
export function truncate(str, max = 40) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}
