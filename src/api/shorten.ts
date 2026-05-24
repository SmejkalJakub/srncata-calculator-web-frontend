import type { ConvertResponse } from "@/types/api";
import { http } from "./http";

/**
 * In prod: default is "/shorten"
 * In dev: we’ll set VITE_SHORTEN_PATH="/api/shorten" so it goes through Vite proxy
 */
const SHORTEN_PATH = (import.meta.env.VITE_SHORTEN_PATH as string | undefined) ?? "/api/shorten";

type shortenUrlResponse = {
  ok: boolean;
  shortUrl?: string;
  error?: string;
};

export async function shortenUrl(
  data: ConvertResponse | string,
): Promise<shortenUrlResponse> {
  const res = await http.post<{ short_code: string }>(SHORTEN_PATH, data);
  if (res.data.short_code) {
    const shortUrl = `${window.location.origin}/?s=${res.data.short_code}`;
    return { ok: true, shortUrl };
  }
  throw new Error("Error shortening URL");
}
