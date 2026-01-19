"use client";
import { useEffect, useMemo, useState } from "react";
import formatCountdownPL from "@/utils/formatCountdownPL";

export function useCountdown(iso: string) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => formatCountdownPL(iso), [iso, tick]);
}
