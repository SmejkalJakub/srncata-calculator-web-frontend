function slug(s: string) {
    return s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

const sel = {
    input: '[data-testid="location-input"]',
    loading: '[data-testid="loading"]',
    error: '[data-testid="error"]',
    latlng: '[data-testid="latlng"]',
    toggleQuickLinks: '[data-testid="toggle-quick-links"]',
    toggleCodes: '[data-testid="toggle-codes"]',
    row: (name: string, value?: boolean) => `[data-testid="row-${slug(name)}${value ? "-value" : ""}"]`,
    link: (label: string) => `[data-testid="map-link-${slug(label)}"]`,
    grid: '[data-testid="map-links-grid"]',
};

function parseLatLngFromUi(text: string): { lat: number; lng: number } {
    const m = text.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    if (!m) throw new Error(`Could not parse lat/lng from UI: ${text}`);
    return { lat: Number(m[1]), lng: Number(m[2]) };
}

function dmsToDd(deg: number, min: number, sec: number, hemi: "N" | "S" | "E" | "W") {
    const dd = deg + min / 60 + sec / 3600;
    if (hemi === "S" || hemi === "W") return -dd;
    return dd;
}

function dmToDd(deg: number, minDec: number, hemi: "N" | "S" | "E" | "W") {
    const dd = deg + minDec / 60;
    if (hemi === "S" || hemi === "W") return -dd;
    return dd;
}

function assertMapCardsHrefs(lat: number, lng: number, tolerance: number) {
    // Mapy.cz (center=lng,lat)
    cy.get(sel.link("Mapy.cz"))
        .should("have.attr", "href")
        .then((href) => {
            const u = new URL(String(href));
            expect(u.hostname).to.include("mapy.");
            const center = u.searchParams.get("center");
            expect(center).to.be.a("string");
            const [lngS, latS] = String(center).split(",");
            expectClose(Number(latS), lat, tolerance);
            expectClose(Number(lngS), lng, tolerance);
        });

    // Google Maps (?query=lat,lng)
    cy.get(sel.link("Google Maps"))
        .should("have.attr", "href")
        .then((href) => {
            const u = new URL(String(href));
            expect(u.hostname).to.include("google.");
            const q = u.searchParams.get("query") ?? u.searchParams.get("q");
            expect(q).to.be.a("string");
            const [latS, lngS] = String(q).split(",");
            expectClose(Number(latS), lat, tolerance);
            expectClose(Number(lngS), lng, tolerance);
        });

    // Apple Maps (?ll=lat,lng)
    cy.get(sel.link("Apple Maps"))
        .should("have.attr", "href")
        .then((href) => {
            const u = new URL(String(href));
            expect(u.hostname).to.include("maps.apple.com");
            const ll = u.searchParams.get("ll");
            expect(ll).to.be.a("string");
            const [latS, lngS] = String(ll).split(",");
            expectClose(Number(latS), lat, tolerance);
            expectClose(Number(lngS), lng, tolerance);
        });

    // Waze (?ll=lat,lng)
    cy.get(sel.link("Waze"))
        .should("have.attr", "href")
        .then((href) => {
            const u = new URL(String(href));
            expect(u.hostname).to.include("waze.com");
            const ll = u.searchParams.get("ll");
            expect(ll).to.be.a("string");
            const [latS, lngS] = String(ll).split(",");
            expectClose(Number(latS), lat, tolerance);
            expectClose(Number(lngS), lng, tolerance);
            expect(u.searchParams.get("navigate")).to.equal("yes");
        });

    // HERE WeGo (/l/lat,lng and/or ?map=lat,lng,...)
    cy.get(sel.link("HERE WeGo"))
        .should("have.attr", "href")
        .then((href) => {
            const u = new URL(String(href));
            expect(u.hostname).to.include("wego.here.com");

            const parts = u.pathname.split("/").filter(Boolean);
            const li = parts.indexOf("l");
            if (li >= 0 && parts[li + 1]) {
                const [latS, lngS] = parts[li + 1].split(",");
                expectClose(Number(latS), lat, tolerance);
                expectClose(Number(lngS), lng, tolerance);
            }

            const map = u.searchParams.get("map");
            if (map) {
                const [latS, lngS] = map.split(",");
                expectClose(Number(latS), lat, tolerance);
                expectClose(Number(lngS), lng, tolerance);
            }
        });

    // OpenStreetMap (?mlat=lat&mlon=lng)
    cy.get(sel.link("OpenStreetMap"))
        .should("have.attr", "href")
        .then((href) => {
            const u = new URL(String(href));
            expect(u.hostname).to.include("openstreetmap.org");
            const mlat = u.searchParams.get("mlat");
            const mlon = u.searchParams.get("mlon");
            expect(mlat).to.exist;
            expect(mlon).to.exist;
            expectClose(Number(mlat), lat, tolerance);
            expectClose(Number(mlon), lng, tolerance);
        });
}

function parseLatLng(text: string): { lat: number; lng: number } {
    // expects something like: "lat/lng: 49.222181, 16.633866"
    const m = text.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
    if (!m) throw new Error(`Could not parse lat/lng from: ${text}`);
    return { lat: Number(m[1]), lng: Number(m[2]) };
}

function expectClose(actual: number, expected: number, tolerance: number) {
    expect(Math.abs(actual - expected)).to.be.lte(tolerance);
}

describe("Converter (real backend)", () => {
    const appPath = (Cypress.env("APP_PATH") as string) || "/map";
    const apiPath = (Cypress.env("API_PATH") as string) || "/api/map";

    beforeEach(() => {
        // Intercept ONLY to wait/inspect; no stubbing
        cy.intercept("GET", `${apiPath}*`).as("convert");
    });

    it("Prefill from query param -> triggers backend -> renders core links + codes", () => {
        cy.visit(`${appPath}?location=33UXQ1897053439`);

        cy.wait("@convert", { timeout: 20000 })
            .its("response.statusCode")
            .should("eq", 200);

        cy.get(sel.input).should("have.value", "33UXQ1897053439");

        cy.get(sel.latlng)
            .invoke("text")
            .then((t) => {
                const { lat, lng } = parseLatLng(t);
                // from your sample response
                expectClose(lat, 49.222181, 1e-4);
                expectClose(lng, 16.633866, 1e-4);
            });

        cy.get(sel.toggleQuickLinks).should("exist").click();
        cy.get(sel.toggleCodes).should("exist").click();

        // Quick links (exist + href looks right)
        cy.get(sel.row("Mapy.cz")).within(() => {
            cy.contains("Otevřít")
                .should("have.attr", "href")
                .and("include", "mapy.com/fnc/v1/showmap");
        });

        cy.get(sel.row("Google Maps")).within(() => {
            cy.contains("Otevřít")
                .should("have.attr", "href")
                .and("include", "google.com/maps");
        });

        cy.get(sel.row("Apple Maps")).within(() => {
            cy.contains("Otevřít")
                .should("have.attr", "href")
                .and("include", "maps.apple.com");
        });

        cy.get(sel.row("Waze")).within(() => {
            cy.contains("Otevřít")
                .should("have.attr", "href")
                .and("include", "waze.com/ul");
        });

        cy.get(sel.row("HERE WeGo")).within(() => {
            cy.contains("Otevřít")
                .should("have.attr", "href")
                .and("include", "wego.here.com");
        });

        cy.get(sel.row("OpenStreetMap")).within(() => {
            cy.contains("Otevřít")
                .should("have.attr", "href")
                .and("include", "openstreetmap.org");
        });

        // Codes exist (text must not be empty)
        cy.get(sel.row("MGRS", true)).should("exist").and("contain.text", "33UXQ1897053439");
        cy.get(sel.row("UTM", true)).should("exist").and("contain.text", "33U 618970 5453439");
        cy.get(sel.row("Maidenhead", true)).should("exist").and("contain.text", "JN89hf");
    });

    it("Typing decimal lat,lng -> renders matching coordinates", () => {
        cy.visit(appPath);

        cy.get(sel.input).clear().type("40.689249, -74.044500");
        cy.wait("@convert", { timeout: 20000 }).its("response.statusCode").should("eq", 200);

        cy.get(sel.latlng)
            .invoke("text")
            .then((t) => {
                const { lat, lng } = parseLatLng(t);
                expectClose(lat, 40.689249, 1e-6);
                expectClose(lng, -74.0445, 1e-6);
            });

        cy.get(sel.row("Google Maps"))
            .find('a[target="_blank"]')
            .should("have.attr", "href")
            .and("include", "40.689249")
            .and("include", "-74.0445");
    });

    it("Typing a Google Maps URL -> extracts coords and returns same lat/lng", () => {
        cy.visit(appPath);

        const url =
            "https://www.google.com/maps/search/?api=1&query=49.222181,16.633866";

        cy.get(sel.input).clear().type(url);
        cy.wait("@convert", { timeout: 20000 }).its("response.statusCode").should("eq", 200);

        cy.get(sel.latlng)
            .invoke("text")
            .then((t) => {
                const { lat, lng } = parseLatLng(t);
                expectClose(lat, 49.222181, 1e-6);
                expectClose(lng, 16.633866, 1e-6);
            });
    });

    it("Typing Maidenhead (JN89hf) -> returns same sample coords (your backend example)", () => {
        cy.visit(appPath);

        cy.get(sel.input).clear().type("JN89hf");
        cy.wait("@convert", { timeout: 20000 }).its("response.statusCode").should("eq", 200);

        cy.get(sel.latlng)
            .invoke("text")
            .then((t) => {
                const { lat, lng } = parseLatLng(t);
                // based on your example, codes all map to same coord
                // (if your backend returns a different center for Maidenhead, relax this assertion)
                expectClose(lat, 49.222181, 1e-2);
                expectClose(lng, 16.633866, 1e-2);
            });

        cy.get(sel.row("Maidenhead", true)).should("contain.text", "JN89hf");
    });

    it("Invalid input -> shows error", () => {
        cy.visit(appPath);

        cy.get(sel.input).clear().type("random text blah blah");
        cy.wait("@convert", { timeout: 20000 }); // backend may return 200 with error JSON or 4xx

        cy.get(sel.error).should("exist");
        cy.get(sel.latlng).should("not.exist");
    });

    it("Empty input -> should not call API", () => {
        let calls = 0;
        cy.intercept("GET", `${apiPath}*`, (req) => {
            if (req.resourceType === "xhr" || req.resourceType === "fetch") calls += 1;
            req.continue();
        });

        cy.visit(appPath);

        cy.get(sel.input).clear();
        cy.wait(800).then(() => {
            expect(calls).to.eq(0);
        });
    });

    it.only("runs through all smoke inputs and validates response + UI", () => {
        cy.intercept("GET", `${apiPath}*`).as("convert"); // pass-through
        cy.visit(appPath);

        // One list, one test — each item has its own expected output rules
        const cases: Array<{
            name: string;
            input: string;
            expectError?: boolean;
            expected?: { lat: number; lng: number; tol: number };
            expectedCodes?: { mgrsPrefix?: string; maidenPrefix?: string; utmPrefix?: string };
        }> = [
                {
                    name: "DD",
                    input: "49.222181, 16.633866",
                    expected: { lat: 49.222181, lng: 16.633866, tol: 1e-6 },
                    expectedCodes: { mgrsPrefix: "33U", maidenPrefix: "JN", utmPrefix: "33U" },
                },
                {
                    name: "Google URL",
                    input: "https://www.google.com/maps/search/?api=1&query=49.222181,16.633866",
                    expected: { lat: 49.222181, lng: 16.633866, tol: 1e-6 },
                },
                {
                    name: "Apple URL",
                    input: "https://maps.apple.com/?ll=49.222181,16.633866&q=49.222181,16.633866",
                    expected: { lat: 49.222181, lng: 16.633866, tol: 1e-6 },
                },
                {
                    name: "Waze URL",
                    input: "https://waze.com/ul?ll=49.222181,16.633866&navigate=yes&zoom=17",
                    expected: { lat: 49.222181, lng: 16.633866, tol: 1e-6 },
                },
                {
                    name: "HERE URL",
                    input: "https://wego.here.com/l/49.222181,16.633866?map=49.222181,16.633866,17",
                    expected: { lat: 49.222181, lng: 16.633866, tol: 1e-6 },
                },
                {
                    name: "OSM URL",
                    input: "https://www.openstreetmap.org/?mlat=49.222181&mlon=16.633866#map=17/49.222181/16.633866",
                    expected: { lat: 49.222181, lng: 16.633866, tol: 1e-6 },
                },
                /*{
                    name: "Mapy URL (center=lng,lat)",
                    input: "https://mapy.com/fnc/v1/showmap?center=16.633866,49.222181&zoom=17&marker=true",
                    expected: { lat: 49.222181, lng: 16.633866, tol: 1e-6 },
                },*/

                // These 3 depend on how your backend resolves grids.
                // If your backend returns different coords, just update expected/tol here.
                {
                    name: "MGRS",
                    input: "33UXQ1897053439",
                    expected: { lat: 49.222181, lng: 16.633866, tol: 1e-3 },
                    expectedCodes: { mgrsPrefix: "33UXQ" },
                },
                {
                    name: "Maidenhead 6",
                    input: "JN89hf",
                    expected: { lat: 49.222181, lng: 16.633866, tol: 1e-2 },
                    expectedCodes: { maidenPrefix: "JN89" },
                },
                {
                    name: "UTM",
                    input: "33U 618970 5453439",
                    expected: { lat: 49.222181, lng: 16.633866, tol: 1e-2 },
                    expectedCodes: { utmPrefix: "33U" },
                },

                {
                    name: "Invalid",
                    input: "random text blah blah",
                    expectError: true,
                },
            ];

        // IMPORTANT: keep this as one test; Cypress queues commands sequentially
        cases.forEach((tc) => {
            cy.log(`Case: ${tc.name}`);

            cy.get(sel.input).clear();
            cy.wait(300); // debounce
            cy.get(sel.input).clear().type(tc.input, { delay: 0 });

            cy.wait("@convert", { timeout: 20000 }).then((interception) => {
                const status = interception.response?.statusCode;

                // Some APIs return 4xx for invalid, some return 200 with ok:false — allow both
                expect(status, "HTTP status").to.be.oneOf([200, 400, 422]);

                const body: any = interception.response?.body;
                const tolerance = tc.expected?.tol || 1e-6;

                if (tc.expectError) {
                    // UI should show error and no grid/latlng
                    cy.get(sel.error).should("exist");
                    cy.get(sel.latlng).should("not.exist");
                    cy.get(sel.grid).should("not.exist");
                    return;
                }

                // Response body expectations
                expect(body).to.have.property("lat");
                expect(body).to.have.property("lng");
                expect(body).to.have.property("links");

                // Core link keys must exist
                expect(body.links).to.have.property("Mapy.cz");
                expect(body.links).to.have.property("Google Maps");
                expect(body.links).to.have.property("Apple Maps");
                expect(body.links).to.have.property("Waze");
                expect(body.links).to.have.property("HERE WeGo");
                expect(body.links).to.have.property("OpenStreetMap");

                // Lat/lng expected
                if (tc.expected) {
                    expectClose(body.lat, tc.expected.lat, tolerance);
                    expectClose(body.lng, tc.expected.lng, tolerance);
                }

                // Optional code expectations (only if backend returns codes consistently)
                if (tc.expectedCodes) {
                    if (tc.expectedCodes.mgrsPrefix) {
                        expect(body.codes?.MGRS || body.links?.MGRS?.display).to.match(
                            new RegExp(`^${tc.expectedCodes.mgrsPrefix}`)
                        );
                    }
                    if (tc.expectedCodes.maidenPrefix) {
                        expect(body.codes?.Maidenhead || body.links?.Maidenhead?.display).to.match(
                            new RegExp(`^${tc.expectedCodes.maidenPrefix}`)
                        );
                    }
                    if (tc.expectedCodes.utmPrefix) {
                        expect(body.codes?.UTM || body.links?.UTM?.display).to.match(
                            new RegExp(`^${tc.expectedCodes.utmPrefix}`)
                        );
                    }
                }

                // UI expectations: lat/lng label matches response
                cy.get(sel.error).should("not.exist");
                cy.get(sel.loading).should("not.exist");
                cy.get(sel.latlng)
                    .should("exist")
                    .invoke("text")
                    .then((txt) => {
                        const ui = parseLatLngFromUi(txt);
                        expectClose(ui.lat, body.lat, tolerance);
                        expectClose(ui.lng, body.lng, tolerance);
                    });

                // UI expectations: map cards exist + href coords match response
                cy.get(sel.grid).should("be.visible");
                assertMapCardsHrefs(body.lat, body.lng, tolerance);
            });
        });
    });
});
