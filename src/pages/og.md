---
title: "/og"
layout: null
---

```js
// --- LOCALE SETUP ---
// Import translations
import { T as enStrings } from "../locales/en.js";
import { T as ptStrings } from "../locales/pt.js";

// Language detection logic (adapted for OG page context)
const preferredLang = (() => {
  // Check for URL parameter first (assuming it might be passed to the OG rendering endpoint)
  if (typeof URLSearchParams !== "undefined" && typeof window !== "undefined" && window.location && window.location.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      const langParam = params.get('lang');
      if (langParam === 'pt' || langParam === 'en') {
        return langParam;
      }
    } catch (e) {
      console.error("Error parsing URL params for lang in og.md:", e);
    }
  }
  // Fallback to a global variable if set by a parent context (less likely for direct /og call)
  if (typeof globalThis !== 'undefined' && globalThis.currentLang && (globalThis.currentLang === 'pt' || globalThis.currentLang === 'en')) {
      return globalThis.currentLang;
  }
  // Default to Portuguese if no other clues
  return 'pt'; 
})();

const currentLang = preferredLang;
const strings = currentLang === 'pt' ? ptStrings : enStrings;
// --- END LOCALE SETUP ---
```

<style>
  /* Import Inter font */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap'); /* Added 500 weight */

  /* 1. Page Setup & Background */
  html, body { height: 100%; margin: 0; padding: 0; }
  body {
    background: #f5f5f5; /* Light grey background */
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Inter, sans-serif;
  }
  main#observablehq-main.observablehq {
    width: 1200px !important;
    height: 630px !important;
    min-height: 630px !important;
    max-width: 1200px !important;
    padding: 0 !important; /* Remove padding */
    margin: 0 !important;
    position: relative !important;
    box-sizing: border-box !important;
    background: linear-gradient(
      to bottom,
      rgba(244,128,36,0.05) 0%,
      rgba(244,128,36,0.05) 50%, 
      transparent 50%
    ), #ffffff; /* Layer gradient over white */
    overflow: hidden !important;
    font-family: Inter, sans-serif;
    display: flex !important; /* Use flex for main layout */
    flex-direction: column !important;
    /* align-items: center; /* Center children horizontally by default */
    /* justify-content: flex-start; /* Align children to top */
  }

  /* Inner content container - Manages padding and alignment */
  #og-content {
    width: 100%;
    height: calc(100% - 60px); 
    /* Reduce bottom padding further */
    padding: 40px 40px 10px 40px; 
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    position: relative; 
  }

  /* 2. Hero Headline */
  #hero-stat {
    font-size: 72px;
    font-weight: 400; /* Inter 400 */
    color: #222;
    letter-spacing: 0.5px;
    line-height: 1.1; /* Adjust for two lines */
    margin: 0; /* Remove default margins */
    /* Y position handled by #og-content padding */
    /* X margin handled by #og-content padding */
    /* align-self: flex-start; /* Ensure left alignment (default now) */
    max-width: 80%; /* Prevent overly long single line */
  }

  /* 3. Full-width Median-Seat Bar - Outer Container for centering/spacing */
  #bar-chart-outer-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 60px; 
    margin-bottom: 16px; 
    /* Add baseline and padding below it */
    border-bottom: 1px solid rgba(0,0,0,0.1);
    padding-bottom: 24px; /* Adjust space between baseline and subtitle */
  }
  
  /* 3. Full-width Median-Seat Bar - Inner Container for shadow/radius/overlay parent */
  #bar-chart-inner-container {
    width: 1080px; /* 90% of 1200px */
    height: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    overflow: hidden; /* Clip plot corners */
    position: relative; /* For positioning the overlay */
  }
  
  /* Ensure plot SVG itself has no background and fits container */
  #bar-chart-inner-container .plot {
      background: none !important;
      border-radius: inherit; /* Inherit radius if needed, though overflow should handle it */
  }

  /* 5. Subtitle */
  #subtitle {
    font-family: Inter, sans-serif;
    font-weight: 500; /* Inter 500 */
    font-size: 24px;
    color: #333;
    text-align: center;
    width: 100%; /* Ensure centering */
    margin: 0; /* Remove default margins */
    /* margin-top: 24px; /* Added via bar container margin-bottom */
    align-self: center; /* Center horizontally */
  }

  /* ADD New Footer Style */
  #og-footer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    /* Changed background color to charcoal */
    background-color: #333333; 
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 -4px 8px rgba(0,0,0,0.2);
  }

  #og-footer span {
    font-family: Inter, sans-serif;
    font-weight: 600;
    font-size: 28px;                   /* large, legible text */
    color: #ffffff;                    /* white text on orange bar */
    letter-spacing: 1px;
  }

</style>

```js
import * as d3 from "npm:d3";
import { html } from "npm:htl";
import * as Plot from "npm:@observablehq/plot";
import { FileAttachment } from "npm:@observablehq/stdlib";
import { partyColors, partyOrder as configPartyOrder } from "../config/colors.js"; // Get configured order
import { calculatePartyMostSeatsProbability } from "../components/probability-calculator.js";

// --- DATA LOADING & PREP ---
const allSeatSimulations = await FileAttachment("../data/seat_forecast_simulations.json").json();

// --- Calculate Required Values ---
const totalSeats = 230;
// const majorityThreshold = 116; // No longer needed for plot

// A. Headline Data
const adMostSeatsProb = calculatePartyMostSeatsProbability(allSeatSimulations, 'AD', ['PS', 'CH']);

// Helper function to format OG hero probability
function formatOgHeroProb(prob) {
  const percent = prob * 100;
  if (percent < 1) return "<1";
  if (percent > 99) return ">99";
  return percent.toFixed(0);
}

// D. Calculate Party Median Seats
const partyMedians = {};
const plotPartyOrder = ["AD","PS","CH","IL","BE","CDU","OTH"]; // Specific order for the plot/bar
plotPartyOrder.forEach(party => {
  const partySeatDraws = allSeatSimulations.map(draw => draw[party] || 0);
  partyMedians[party] = d3.median(partySeatDraws) || 0;
});

// Prepare data structure for the stacked bar chart in the specific plot order
const stackedBarData = plotPartyOrder.map(party => ({
  party: party,
  seats: Math.round(partyMedians[party]), // Use rounded median seats
  color: partyColors[party] || "#AAAAAA"
}));

// --- Create Plot Stacked Horizontal Bar Chart ---
const stackedBarPlot = Plot.plot({
  width: 1080,
  height: 24,
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  padding: 0,
  inset: 0,
  x: {
    domain: [0, totalSeats],
    axis: null
  },
  color: { // Define color scale with desaturation for small parties
    domain: plotPartyOrder,
    range: plotPartyOrder.map(p => {
      const col = partyColors[p] || "#AAAAAA";
      // Desaturate if median seats < 12 (~5%)
      return (partyMedians[p] || 0) < 12
        ? `${col}4D` // Append #4D hex for ~30% alpha
        : col; // Use full color otherwise
    })
  },
  marks: [
    Plot.barX(stackedBarData, Plot.stackX({
      x: "seats",
      fill: "party", // Use color scale
      stroke: "white",
      strokeWidth: 1,
      // REMOVED fillOpacity channel option
      title: d => `${d.party}: ${d.seats} seats`
    })),
    // Add Plot.text mark for AD and PS labels
    Plot.text(stackedBarData.filter(d => d.party === "AD" || d.party === "PS"), Plot.stackX({
        x: "seats", // Stack text horizontally based on seats
        text: d => `${d.party} ${d.seats}`, // Text content
        fill: "white", // White text
        fontWeight: "bold", // Make it bolder to stand out
        fontSize: 12, // Adjust font size if needed
    }))
    // REMOVED other marks
  ]
});

// 5. Prepare Subtitle Text
const medianCH = Math.round(partyMedians['CH']);
const medianAD = Math.round(partyMedians['AD']);
const medianPS = Math.round(partyMedians['PS']);

// Construct subtitle using locale strings
const subtitleText = `${strings.ogSubtitlePrefix} ${strings.ogSubtitlePartySeat.replace("{party}", "AD").replace("{seats}", medianAD)} \u2022 ${strings.ogSubtitlePartySeat.replace("{party}", "PS").replace("{seats}", medianPS)} \u2022 ${strings.ogSubtitlePartySeat.replace("{party}", "CH").replace("{seats}", medianCH)}`;

```

<!-- Layout Content -->
<div id="og-content">

  <!-- 2. Hero Headline -->
  <div id="hero-stat">
    ${html`${formatOgHeroProb(adMostSeatsProb)}${strings.ogHeroStatChance}<br>${strings.ogHeroStatCondition}`}
  </div>

  <!-- 3. Bar Chart Outer Container (for centering/spacing) -->
  <div id="bar-chart-outer-container">
    <!-- 3. Bar Chart Inner Container (for shadow/radius/overlay) -->
    <div id="bar-chart-inner-container">
      ${ stackedBarPlot }
    </div>
  </div>

  <!-- 5. Subtitle -->
  <p id="subtitle">
    ${subtitleText}
  </p>

  <!-- REMOVED Old Footer Div -->
  <!-- <div class="brand">estimador.pt</div> -->

</div>

<!-- ADD New Footer Element (Outside #og-content, inside main) -->
<footer id="og-footer">
  <span>${strings.ogFooter}</span>
</footer> 