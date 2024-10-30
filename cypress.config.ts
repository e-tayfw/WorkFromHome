// cypress.config.ts
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: "tests/cypress/integration/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "tests/cypress/support/e2e.ts",
  },
  component: {
    // If you're using component testing
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
    specPattern: "tests/cypress/component/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "tests/cypress/support/component.ts",
  },
});
