import { Results } from "./components/Results";
import { useConversion } from "./hooks/useConversion";
import { useQueryParamState } from "./hooks/useQueryParamState";
import { isConvertSuccess } from "./types/api";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from "./components/ui/collapsible";
import { Button } from "./components/ui/button";
import { ChevronDown, MapPin } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { useState } from "react";
import { Input } from "./components/ui/input";

const supportedFormats = [
  { name: "Desetinné stupně", example: "49.2141, 16.8189" },
  { name: "DMS", example: "49°12'50.76\"N 16°49'8.04\"E" },
  { name: "DDM", example: "49°12.846'N 16°49.134'E" },
  { name: "MGRS", example: "33UXQ3247052860" },
  { name: "Google Maps URL", example: "https://maps.google.com/..." },
  { name: "Mapy.cz URL", example: "https://mapy.cz/..." },
  { name: "Apple Maps URL", example: "https://maps.apple.com/..." },
  { name: "OpenStreetMap URL", example: "https://openstreetmap.org/..." },
]

export default function App() {
  const [input, setInput] = useQueryParamState("location", 300);
  const { data, loading, error } = useConversion(input, 350);
  const [showFormats, setShowFormats] = useState(false)


  const ok = data && isConvertSuccess(data);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary py-4">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-primary-foreground text-lg md:text-xl font-bold text-center text-balance">
            S.O.S.-Srnčata ohrožená sekačkami Brněnsko, z.s.
          </h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-primary border-b-2 border-primary pb-2 mb-4">
            Konvertor souřadnic
          </h2>
          <p className="text-muted-foreground">
            Vlož souřadnice nebo odkaz na mapy (Google Maps, Apple Maps, Mapy.cz apod.) a já ti je přepočítám
            do různých formátů a připravím odkazy na oblíbené mapové služby.
          </p>
        </div>

        <Collapsible open={showFormats} onOpenChange={setShowFormats} className="mb-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto text-muted-foreground hover:text-foreground">
              <ChevronDown className={`w-4 h-4 transition-transform ${showFormats ? "" : "-rotate-90"}`} />
              Přečíst si více o podporovaných formátech
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-3">
              <CardHeader>
                <CardTitle>Podporované formáty</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {supportedFormats.map((f) => (
                    <li key={f.name} className="text-sm flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{f.name}</Badge>
                      <code className="text-muted-foreground bg-muted px-2 py-0.5 rounded text-xs">{f.example}</code>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <div className="mb-6">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              data-testid="location-input"
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Vložte souřadnice nebo odkaz na mapu..."
              className="pl-10 py-6 text-lg"
            />
          </div>
        </div>

        <div className="my-3">
          {loading ? (
            <Card>
              <CardContent className="text-center">
                <p className="text-muted-foreground" data-testid="loading">
                  Načítání...
                </p>
              </CardContent>
            </Card>
          ) : null}

          {error ? (
            <Card className="mb-4 bg-red-950 border border-red-800">
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Došlo k chybě při zpracování souřadnic. Zkontrolujte prosím vstupní data a zkuste to znovu.
                </p>
                <p data-testid="error">
                  Chybová zpráva: {error}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {ok && !loading && !error ? (
            <Results data={data} />
          ) : null}
        </div>
      </main>
      <footer className="border-t border-border py-6 mt-8">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} S.O.S.-Srnčata Brněnsko - Všechna práva vyhrazena.
        </p>
      </footer>
    </div >
  );
}
