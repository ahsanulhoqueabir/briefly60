"use client";

import { useRef, useCallback, useState } from "react";

export const useTurnstile = () => {
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const turnstileRef = useRef<any>(null);

  const resetTurnstile = useCallback(() => {
    if (turnstileRef.current) {
      turnstileRef.current.reset();
      setTurnstileToken(null);
    }
  }, []);

  const getTurnstileToken = useCallback(() => {
    return turnstileToken;
  }, [turnstileToken]);

  return {
    turnstileRef,
    turnstileToken,
    setTurnstileToken,
    resetTurnstile,
    getTurnstileToken,
  };
};
