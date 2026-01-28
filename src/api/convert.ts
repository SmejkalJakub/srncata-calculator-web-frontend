import { http } from "./http";
import type { ConvertResponse } from "../types/api";

/**
 * In prod: default is "/map"
 * In dev: we’ll set VITE_CONVERT_PATH="/api/map" so it goes through Vite proxy
 */
const CONVERT_PATH = (import.meta.env.VITE_CONVERT_PATH as string | undefined) ?? "/api/map";

export async function convertLocation(
  location: string,
  signal?: AbortSignal
): Promise<ConvertResponse> {
  const res = await http.get<ConvertResponse>(CONVERT_PATH, {
    params: { location },
    signal,
  });
  return res.data;
}
