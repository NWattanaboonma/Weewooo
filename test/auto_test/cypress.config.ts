import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // Point to the new spec file location
    specPattern: "test/auto_test/**/*.cy.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:8082",
    // Disable the support file since we are not using it yet
    supportFile: false,
  },
  screenshotsFolder: "test/auto_test/screenshots",
  videosFolder: "test/auto_test/videos",
});
