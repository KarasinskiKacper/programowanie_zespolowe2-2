import type { RootState } from "../store";

export const selectAuth = (state: RootState) => state.auth;

/**
 * Format an ISO date string to dd.mm.yyyy
 * @param {string | null} iso - ISO date string
 * @returns {string | null} - Formatted date string or null if iso is invalid
 */
export const formatAuthDate = (iso: string | null) => {
  if (!iso) return null;

  const [datePart] = iso.split("T"); 
  const [yyyy, mm, dd] = datePart.split("-");

  if (!yyyy || !mm || !dd) return null;
  return `${dd}.${mm}.${yyyy}`;
};
