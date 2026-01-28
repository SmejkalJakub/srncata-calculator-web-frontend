import type { ConvertSuccess, LinkValue } from "../types/api";
import { Row } from "./Row";
import MapyComIcon from "../assets/icons/MapyComIcon.tsx";
import GoogleMapsIcon from "../assets/icons/GoogleMapsIcon.tsx";
import AppleMapsIcon from "../assets/icons/AppleMapsIcon.tsx";
import WazeIcon from "../assets/icons/WazeIcon.tsx";
import HereWeGoIcon from "../assets/icons/HereWeGoIcon.tsx";
import OpenStreetMapIcon from "../assets/icons/OpenStreetMapIcon.tsx";
import { Card, CardContent } from "./ui/card.tsx";
import { Navigation } from "lucide-react";
import { slug } from "@/lib/utils.ts";

function toRow(link: LinkValue): { value: string; href?: string } {
    if (typeof link === "string") {
        const href = /^https?:\/\//i.test(link) ? link : undefined;
        return { value: link, href };
    }
    const href = /^https?:\/\//i.test(link.url) ? link.url : undefined;
    return { value: link.display ?? link.url, href };
}

export function Results({ data }: { data: ConvertSuccess }) {
    const mapLinkOrder = [
        "Mapy.cz",
        "Google Maps",
        "Apple Maps",
        "Waze",
        "HERE WeGo",
        "OpenStreetMap",
    ];

    const mapIconOrder = [
        <MapyComIcon width={64} height={64} />,
        <GoogleMapsIcon width={64} height={64} />,
        <AppleMapsIcon width={64} height={64} />,
        <WazeIcon width={64} height={64} />,
        <HereWeGoIcon width={64} height={64} />,
        <OpenStreetMapIcon width={64} height={64} />,
    ];

    const codeOrder = ["MGRS", "Maidenhead", "UTM"] as const;

    return (
        <>
            {data && (
                <Card className="mb-6">
                    <CardContent>
                        <p className="text-foreground">
                            <span className="text-muted-foreground">LAT/LNG:</span>{" "}
                            <span className="text-primary font-mono" data-testid="latlng">{data.lat.toFixed(14)}, {data.lng.toFixed(14)}</span>
                        </p>
                    </CardContent>
                </Card>
            )}

            <h3 className="text-2xl font-bold text-primary border-b-2 border-primary pb-2 mb-4 flex items-center gap-2">
                <Navigation className="w-6 h-6" />
                Navigace
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" data-testid="map-links-grid">
                {mapLinkOrder.map((name) => {
                    const v = data.links?.[name];
                    if (!v) return null;
                    const row = toRow(v);
                    return <Row key={name} label={name} value={row.value} href={row.href} icon={mapIconOrder[mapLinkOrder.indexOf(name)]} testId={`map-link-${slug(name)}`} />;
                })}
            </div>

            <h3 className="text-2xl font-bold text-primary border-b-2 border-primary pb-2 my-4">
                Rychlé odkazy
            </h3>
            <details className="mb-4">
                <summary data-testid="toggle-quick-links" className="cursor-pointer text-white">Zobrazit / skrýt rychlé odkazy</summary>
                <div className="my-4 text-white">
                    <p>
                        Tyto odkazy stačí zkopírovat a odeslat komukoli kdo by potřeboval pomoc s navigací na dané místo.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mapLinkOrder.map((name) => {
                        const v = data.links?.[name];
                        if (!v) return null;
                        const row = toRow(v);
                        return <Row key={name} label={name} value={row.value} href={row.href} testId={`row-${slug(name)}`} />;
                    })}
                </div>
            </details>

            <h3 className="text-2xl font-bold text-primary border-b-2 border-primary pb-2 my-4">
                Kódy
            </h3>
            <details className="mb-4">
                <summary data-testid="toggle-codes" className="cursor-pointer text-white">Zobrazit / skrýt kódy</summary>
                <div className="my-4 text-white">
                    <p>
                        Toto jsou další formáty souřadnic, které mohou být užitečné pro různé navigační systémy nebo aplikace.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {codeOrder.map((k) => {
                        const linkVal = data.links?.[k];
                        if (linkVal) {
                            const row = toRow(linkVal);
                            return <Row key={k} label={k} value={row.value} href={row.href} testId={`row-${slug(k)}`} />;
                        }
                        return <Row key={k} label={k} value={data.codes?.[k]} testId={`row-${slug(k)}`} />;
                    })}
                </div>
            </details>

            {/* Optional: show any extra links/codes the backend adds later */}
            {Object.keys(data.links ?? {}).some(
                (k) => !mapLinkOrder.includes(k) && !codeOrder.includes(k as any)
            ) ? (
                <>
                    <h2 className="my-4 text-2xl">Další</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(data.links ?? {})
                            .filter((k) => !mapLinkOrder.includes(k) && !codeOrder.includes(k as any))
                            .map((k) => {
                                const row = toRow(data.links[k]);
                                return <Row key={k} label={k} value={row.value} href={row.href} testId={`row-${slug(k)}`} />;
                            })}
                    </div>
                </>
            ) : null}
        </>
    );
}
