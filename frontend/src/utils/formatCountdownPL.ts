/**
 * Return appropriate plural form of given word based on given number.
 * @param {number} n - number to determine plural form.
 * @param {string[]} forms - array containing singular, few, many forms of the word.
 * @returns {string} appropriate plural form of the word.
 */
function pluralPL(n: number, forms: [string, string, string]) {
  // forms: [one, few, many] -> np. ["dzień","dni","dni"]
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (n === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return forms[1];
  return forms[2];
}

/**
 * Format countdown in Polish language.
 * @param {string} iso - ISO string of target date.
 * @returns {string} Formatted countdown string.
 */
export default function formatCountdownPL(iso: string) {
  const target = new Date(iso);
  const now = new Date();

  let diffMs = target.getTime() - now.getTime();
  if (diffMs < 0) return "Aukcja zakonczona";

  diffMs = Math.abs(diffMs);

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} ${pluralPL(days, ["dzień", "dni", "dni"])}`);
    parts.push(`${hours} ${pluralPL(hours, ["godzina", "godziny", "godzin"])}`);
  } else if (hours > 0) {
    parts.push(`${hours} ${pluralPL(hours, ["godzina", "godziny", "godzin"])}`);
    parts.push(`${minutes} ${pluralPL(minutes, ["minuta", "minuty", "minut"])}`);
  } else if (minutes > 0) {
    parts.push(`${minutes} ${pluralPL(minutes, ["minuta", "minuty", "minut"])}`);
    parts.push(`${seconds} ${pluralPL(seconds, ["sekunda", "sekundy", "sekund"])}`);
  } else {
    parts.push(`${seconds} ${pluralPL(seconds, ["sekunda", "sekundy", "sekund"])}`);
  }

  const text = parts.join(" ");

  return text;
}
