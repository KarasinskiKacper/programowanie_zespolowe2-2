"use client";
import { useEffect, useMemo, useState } from "react";
import formatCountdownPL from "@/utils/formatCountdownPL";

/**
 * Returns a string representing the countdown from the given ISO string in Polish language.
 * The countdown is updated every second.
 * @param {string} iso - ISO string of target date.
 * @returns {string} Formatted countdown string.
 */
export function useCountdown(iso: string) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => formatCountdownPL(iso), [iso, tick]);
}
