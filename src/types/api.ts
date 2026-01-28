export type LinkObject = {
  display: string;
  url: string;
};

export type LinkValue = string | LinkObject;

export type ConvertSuccess = {
  lat: number;
  lng: number;
  codes: Record<string, string>; // MGRS, Maidenhead, UTM
  links: Record<string, LinkValue>; // "Google Maps", "Mapy.cz", ...
};

export type ConvertFailure = {
  ok?: false; // optional (backend may or may not send it)
  error?: { message: string; code?: string };
  message?: string;
};

export type ConvertResponse = ConvertSuccess | ConvertFailure;

export function isConvertSuccess(x: any): x is ConvertSuccess {
  return (
    x &&
    typeof x === "object" &&
    typeof x.lat === "number" &&
    typeof x.lng === "number" &&
    x.codes &&
    typeof x.codes === "object" &&
    x.links &&
    typeof x.links === "object"
  );
}
