import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // Point to the new spec file location
    specPattern: "test/automated test cases/**/*.cy.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:8082",
    // Disable the support file since we are not using it yet
    supportFile: false,
  },
  screenshotsFolder: "test/automated test cases/screenshots",
  videosFolder: "test/automated test cases/videos",
});
