import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: "http://localhost:5173",
        specPattern: "cypress/e2e/**/*.cy.ts",
        viewportWidth: 1280,
        viewportHeight: 800,
        env: {
            APP_PATH: "/map",     // change to "/" if your SPA route is root
            API_PATH: "/api/map", // must match your Vite proxy path
        },
    },
});
