import { defineConfig } from 'cypress'

export default defineConfig({
  env: {
    API_URL: 'https://cuni-api.ddns.net',
    E2E_RUN_WRITES: false,
  },
  e2e: {
    baseUrl: 'http://127.0.0.1:5173',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 900,
    video: false,
  },
})
