// Presentation helpers used by every view to turn raw response fields into display text.

const HTML_ENTITIES = {
  '&': '&#38;',
  '<': '&#60;',
  '>': '&#62;',
  '"': '&#34;',
  "'": '&#39;',
};

const LOCALE = 'en-US';
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Escape markup-significant characters; empty and missing values become ''. */
export function esc(value) {
  const text = value == null ? '' : String(value);
  return text.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
}

/** Show a USD figure, using cents only when the amount is not a whole number. */
export function money(value) {
  const amount = Number(value);
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;

  return amount.toLocaleString(LOCALE, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
  });
}

/**
 * Present a timestamp using UTC wall-clock time.
 * Returns null when the input is missing or cannot be parsed as a date.
 */
export function date(iso) {
  const parsed = toDate(iso);
  if (!parsed) return null;

  const stamp = parsed.toLocaleString(LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  });
  return `${stamp} UTC`;
}

/** Describe the gap until a timestamp, or mark it as finished. */
export function timeLeft(iso) {
  const remaining = new Date(iso).getTime() - Date.now();
  if (remaining <= 0) return 'ended';

  const days = Math.floor(remaining / DAY_MS);
  const hours = Math.floor((remaining % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((remaining % HOUR_MS) / MINUTE_MS);

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function toDate(iso) {
  if (!iso) return null;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
