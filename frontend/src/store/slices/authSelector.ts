import type { RootState } from "../store";

// wyciąga cały slice auth
export const selectAuth = (state: RootState) => state.auth;

// "2026-01-01T10:00:00" -> "01.01.2026"
export const formatAuthDate = (iso: string | null) => {
  if (!iso) return null;

  // bierzemy tylko część przed "T"
  const [datePart] = iso.split("T"); // "2026-01-01"
  const [yyyy, mm, dd] = datePart.split("-");

  if (!yyyy || !mm || !dd) return null;
  return `${dd}.${mm}.${yyyy}`;
};
