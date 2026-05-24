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

  const stringifiedData = JSON.stringify(data);
  const res = await http.post<shortenUrlResponse>(SHORTEN_PATH, stringifiedData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log("Shorten response:", res);
  if (res.data.ok) {
    return res.data;
  }
  throw new Error(
    `Error shortening URL: ${res.data.error ?? "Unknown error"}`,
  );
}
