"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import GlobalLoader from "./GlobalLoader";

const LoaderContext = createContext({
  isLoading: false,
  showLoader: () => {},
  hideLoader: () => {},
});

export function useLoader() {
  return useContext(LoaderContext);
}

export default function LoaderProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const hideTimerRef = useRef(null);

  const showLoader = useCallback(() => {
    try {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setIsLoading(true);
    } catch {}
  }, []);

  const hideLoader = useCallback((delayMs = 0) => {
    try {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (delayMs > 0) {
        hideTimerRef.current = setTimeout(() => {
          setIsLoading(false);
          hideTimerRef.current = null;
        }, delayMs);
      } else {
        setIsLoading(false);
      }
    } catch {}
  }, []);

  const value = useMemo(() => ({ isLoading, showLoader, hideLoader }), [isLoading, showLoader, hideLoader]);

  return (
    <LoaderContext.Provider value={value}>
      <GlobalLoader isVisible={isLoading} />
      {children}
    </LoaderContext.Provider>
  );
}
