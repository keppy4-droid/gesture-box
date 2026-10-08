"use client";
import { useEffect, useState } from "react";
import { remainingSeconds } from "@/lib/game";
export function useRoundTimer() {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (deadline === null) return;
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      const seconds = remainingSeconds(deadline);
      setRemaining(seconds);
      if (seconds === 0) {
        setDeadline(null);
        return;
      }
      // Update when the displayed second changes. The absolute deadline also
      // catches up correctly after an inactive browser tab resumes.
      const delay = Math.max(1, deadline - Date.now() - (seconds - 1) * 1000);
      timeout = setTimeout(tick, delay);
    };
    tick();
    return () => clearTimeout(timeout);
  }, [deadline]);
  return { remaining, setRemaining, setDeadline };
}
