import {defineConfig} from '@playwright/test';
import os from 'os';

const {CI: ci} = process.env;
const baseURL = 'http://127.0.0.1:3000';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!ci,
  retries: ci ? 2 : 0,
  workers: ci ? 1 : 4,
  reporter: 'dot',

  use: {
    baseURL,
    actionTimeout: 1000,
  },

  outputDir: os.tmpdir() + '/test-results',

  webServer: {
    command: 'webpack serve',
    url: baseURL,
    timeout: 5000,
    reuseExistingServer: !ci,
  },
});
