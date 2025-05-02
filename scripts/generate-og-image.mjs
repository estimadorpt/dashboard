import { ImageResponse } from '@vercel/og';
import fs from 'fs/promises';
import path from 'path';
import React from 'react';

// --- Font Loading ---
// Fetch the Inter font files from Google Fonts API
// We need regular and bold weights to match the likely usage
const interRegular = await fetch(
  'https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap'
).then(res => res.text()); // Need to parse the CSS to find the font URL, or use a direct link if known

const interBold = await fetch(
  'https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap'
).then(res => res.text());

// Helper to extract font URL from Google Fonts CSS response
// NOTE: This is a simplified parser and might break if Google changes format.
// Consider using a more robust method or finding direct .ttf/.woff2 links if possible.
function findFontUrl(css) {
    const urlMatch = css.match(/url\((https:\/\/[^)]+)\)/);
    return urlMatch ? urlMatch[1] : null;
}

const interRegularUrl = findFontUrl(interRegular);
const interBoldUrl = findFontUrl(interBold);

// Fetch the actual font data
const interRegularData = interRegularUrl ? await fetch(interRegularUrl).then(res => res.arrayBuffer()) : null;
const interBoldData = interBoldUrl ? await fetch(interBoldUrl).then(res => res.arrayBuffer()) : null;

if (!interRegularData || !interBoldData) {
    console.error("Failed to fetch font data. Check Google Fonts links or parsing.");
    process.exit(1);
}

// --- OG Image Component ---
// Rewritten using React.createElement instead of JSX
const OgImage = () => (
  React.createElement('div',
    { // Props for the main container div
      style: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        padding: '50px',
        fontFamily: '"Inter"',
        border: '1px solid #dee2e6'
      }
    },
    // Children of the main container div
    React.createElement('div', { // Title div
      style: { fontSize: 70, fontWeight: 700, color: '#212529', marginBottom: '30px', textAlign: 'center', lineHeight: '1.2' }
    }, 'Portuguese Election Forecast'),

    React.createElement('div', { // Description div
      style: { fontSize: 40, fontWeight: 400, color: '#495057', textAlign: 'center', lineHeight: '1.5' }
    }, 'Live model tracking seat projections, national trends, and district details for Portugal\'s elections.'),

    React.createElement('div', { // Footer div
      style: { position: 'absolute', bottom: '30px', right: '40px', fontSize: 24, color: '#adb5bd' }
    }, 'Estimador')
  )
);

// --- Generation Logic ---
console.log('Generating OG image with Inter font...');

const outputPath = path.resolve(process.cwd(), 'dist', 'og-image.png');
await fs.mkdir(path.dirname(outputPath), { recursive: true });

try {
  const image = new ImageResponse(React.createElement(OgImage), {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: interRegularData,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: interBoldData,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const buffer = await image.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(buffer));

  console.log(`OG image generated successfully at: ${outputPath}`);

} catch (error) {
  console.error('Error generating OG image:', error);
  process.exit(1); // Exit with error code
} 