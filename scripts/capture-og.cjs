const { chromium } = require('@playwright/test');
const fs = require('fs/promises');
const path = require('path');

// --- Configuration ---
// Use the static server port for testing the build
const LOCAL_URL = 'http://127.0.0.1:4173'; 
// Correct path for pages built from src/pages/
const OG_PAGE_PATH = '/pages/og'; 
const OUTPUT_DIR = path.resolve(process.cwd(), 'public');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'og.png');
const VIEWPORT_WIDTH = 1200;
const VIEWPORT_HEIGHT = 630;

(async () => {
  console.log('Launching browser to capture OG page...');
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    deviceScaleFactor: 2 // For higher resolution
  });

  const targetUrl = `${LOCAL_URL}${OG_PAGE_PATH}`;

  try {
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    console.log('OG page loaded.');

    // ADD Log page title for verification
    const title = await page.title();
    console.log(`Page title after navigation: "${title}"`);

    // Wait for the plot SVG to render
    console.log('Waiting for plot SVG to render...');
    await page.waitForSelector('#bar-chart-inner-container svg'); 
    console.log('Plot SVG found.');

    console.log(`Taking screenshot (${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT})...`);
    const buffer = await page.screenshot({ type: 'png' });

    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.writeFile(OUTPUT_PATH, buffer);
    console.log(`OG screenshot saved to ${OUTPUT_PATH}`);

  } catch (error) {
    console.error('Error capturing OG page:', error);
    process.exit(1);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
})(); 