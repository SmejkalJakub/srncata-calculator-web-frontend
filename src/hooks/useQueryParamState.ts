import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

function stripWrappingQuotes(s: string) {
  return s.replace(/^"(.*)"$/, "$1");
}

function readParam(name: string) {
  const params = new URLSearchParams(window.location.search);
  const v = params.get(name);
  return v === null ? "" : stripWrappingQuotes(v);
}

function writeParam(name: string, value: string) {
  const url = new URL(window.location.href);
  if (!value.trim()) url.searchParams.delete(name);
  else url.searchParams.set(name, value);
  window.history.replaceState({}, "", url.toString());
}

export function useQueryParamState(paramName: string, debounceMs = 300) {
  const [value, setValue] = useState(() => readParam(paramName));
  const debounced = useDebouncedValue(value, debounceMs);

  const didInit = useRef(false);

  // Write debounced state -> URL (skip first render to avoid rewriting URL immediately)
  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      return;
    }
    writeParam(paramName, debounced);
  }, [debounced, paramName]);

  // Handle back/forward navigation (popstate)
  useEffect(() => {
    const onPop = () => setValue(readParam(paramName));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [paramName]);

  return [value, setValue] as const;
}
