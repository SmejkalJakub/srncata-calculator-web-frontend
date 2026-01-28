import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";
import { convertLocation } from "../api/convert";
import type { ConvertResponse } from "../types/api";
import { isConvertSuccess } from "../types/api";

export function useConversion(input: string, debounceMs = 350) {
  const debounced = useDebouncedValue(input, debounceMs);

  const [data, setData] = useState<ConvertResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = debounced.trim();

    if (!trimmed) {
      abortRef.current?.abort();
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const ac = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ac;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await convertLocation(trimmed, ac.signal);
        setData(res);

        if (isConvertSuccess(res)) {
          setError(null);
          return;
        }

        // Failure formats: {error:{message}}, {message}, or {ok:false,...}
        const msg =
          (res as any)?.error?.message ??
          (res as any)?.message ??
          "Conversion failed";
        setError(msg);
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        setData(null);
        setError(e?.message ?? "Request failed");
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [debounced]);

  return { data, loading, error };
}
