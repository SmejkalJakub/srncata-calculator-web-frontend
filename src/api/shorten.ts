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
  const res = await http.post<{ short_link: string }>(SHORTEN_PATH, data);
  if (res.data.short_link) {
    return { ok: true, shortUrl: res.data.short_link };
  }
  throw new Error("Error shortening URL");
}
