"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { applySiteAppearance } from "@/lib/theme/apply-theme";
import { DEFAULT_APPEARANCE } from "@/lib/theme/constants";
import {
  loadAppearanceFromStorage,
  saveAppearanceToStorage,
} from "@/lib/theme/storage";
import type { SiteAppearance } from "@/lib/theme/types";

type SiteAppearanceContextValue = {
  appearance: SiteAppearance;
  setAppearance: (next: SiteAppearance) => void;
  patchAppearance: (partial: Partial<SiteAppearance>) => void;
  resetAppearance: () => void;
};

const SiteAppearanceContext = createContext<SiteAppearanceContextValue | null>(
  null,
);

export function SiteAppearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appearance, setAppearanceState] = useState<SiteAppearance>(
    DEFAULT_APPEARANCE,
  );
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    const stored = loadAppearanceFromStorage();
    setAppearanceState(stored);
    applySiteAppearance(document.documentElement, stored);
    // Mirror localStorage to cookie for a future SSR hook (middleware / layout).
    saveAppearanceToStorage(stored);
    setHydrated(true);
  }, []);

  const setAppearance = useCallback((next: SiteAppearance) => {
    setAppearanceState(next);
    saveAppearanceToStorage(next);
    applySiteAppearance(document.documentElement, next);
  }, []);

  const patchAppearance = useCallback(
    (partial: Partial<SiteAppearance>) => {
      setAppearance({ ...appearance, ...partial });
    },
    [appearance, setAppearance],
  );

  const resetAppearance = useCallback(() => {
    setAppearance(DEFAULT_APPEARANCE);
  }, [setAppearance]);

  const value = useMemo(
    () => ({
      appearance,
      setAppearance,
      patchAppearance,
      resetAppearance,
    }),
    [appearance, setAppearance, patchAppearance, resetAppearance],
  );

  return (
    <SiteAppearanceContext.Provider value={value}>
      <ThemeHydrationIndicator hydrated={hydrated} />
      {children}
    </SiteAppearanceContext.Provider>
  );
}

function ThemeHydrationIndicator({ hydrated }: { hydrated: boolean }) {
  return (
    <span
      className="sr-only"
      aria-live="polite"
      aria-hidden={!hydrated}
    >
      {hydrated ? "Theme loaded" : "Loading theme"}
    </span>
  );
}

export function useSiteAppearance() {
  const ctx = useContext(SiteAppearanceContext);
  if (!ctx) {
    throw new Error("useSiteAppearance must be used within SiteAppearanceProvider");
  }
  return ctx;
}
