import { defineConfig, devices } from "@playwright/test";
import { env } from "node:process";

export default defineConfig({
    testDir: "./tests",
    fullyParallel: true,
    forbidOnly: Boolean(env.CI),
    retries: env.CI ? 1 : 0,
    workers: 2,
    reporter: "list",
    use: {
        baseURL: "http://127.0.0.1:4178",
        trace: "retain-on-failure",
    },
    projects: [{
        name: "chromium",
        use: {
            ...devices["Desktop Chrome"],
            ...(env.PLAYWRIGHT_CHANNEL ? { channel: env.PLAYWRIGHT_CHANNEL } : {}),
        },
    }],
    webServer: {
        command: "npm run preview -- --host 127.0.0.1 --port 4178 --strictPort",
        url: "http://127.0.0.1:4178",
        reuseExistingServer: false,
    },
});
